using System.Globalization;
using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Salmandyar.Application.Services.PatientSelfServiceAccess;
using Salmandyar.Application.Services.Users;
using Salmandyar.Domain.Constants;
using Salmandyar.Domain.Entities;
using Salmandyar.Infrastructure.Persistence;

namespace Salmandyar.Infrastructure.Services;

public class PatientSelfServiceAccessService : IPatientSelfServiceAccessService
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<User> _userManager;
    private readonly IAuditLogService _auditLogService;

    public PatientSelfServiceAccessService(
        ApplicationDbContext context,
        UserManager<User> userManager,
        IAuditLogService auditLogService)
    {
        _context = context;
        _userManager = userManager;
        _auditLogService = auditLogService;
    }

    public async Task<PatientSelfServiceAccessSummaryDto> GetPatientSummaryAsync(int careRecipientId, string currentUserId)
    {
        var careRecipient = await _context.CareRecipients
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == careRecipientId);

        if (careRecipient == null)
        {
            return CreateEmptySummary(careRecipientId, "دسترسی ثبت اطلاعات برای شما فعال نیست.");
        }

        var policy = await GetPolicyAsync(careRecipientId);
        var actorRoles = await GetRolesAsync(currentUserId);
        var actorCanUseSelfService = actorRoles.Contains(Roles.Patient) || actorRoles.Contains(Roles.Elderly);
        var actorIsFamily = actorRoles.Contains(Roles.PatientFamily);
        var actorMatchesPatient = string.Equals(careRecipient.UserId, currentUserId, StringComparison.Ordinal);

        return BuildSummary(
            careRecipientId,
            policy,
            canUseSelfService: actorCanUseSelfService,
            actorIsFamily: actorIsFamily,
            actorMatchesPatient: actorMatchesPatient);
    }

    public async Task<PatientSelfServiceAccessSummaryDto?> GetAdminSummaryByUserIdAsync(string userId)
    {
        var careRecipient = await _context.CareRecipients
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (careRecipient == null)
        {
            return null;
        }

        var policy = await GetPolicyAsync(careRecipient.Id);
        return BuildSummary(
            careRecipient.Id,
            policy,
            canUseSelfService: true,
            actorIsFamily: false,
            actorMatchesPatient: true);
    }

    public async Task<PatientSelfServiceAccessSummaryDto?> UpdateByUserIdAsync(string userId, UpdatePatientSelfServiceAccessDto dto, string adminUserId)
    {
        var careRecipient = await _context.CareRecipients
            .Include(x => x.SelfServiceAccessPolicy)
                .ThenInclude(x => x!.FeatureGrants)
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (careRecipient == null)
        {
            return null;
        }

        ValidateUpdateDto(dto);

        var policy = careRecipient.SelfServiceAccessPolicy;
        var previousState = policy == null ? null : SerializePolicy(policy);
        var nowUtc = DateTime.UtcNow;

        if (policy == null)
        {
            policy = new PatientSelfServiceAccessPolicy
            {
                CareRecipientId = careRecipient.Id,
                CreatedAtUtc = nowUtc,
                CreatedById = adminUserId
            };

            _context.Set<PatientSelfServiceAccessPolicy>().Add(policy);
        }

        policy.IsEnabled = dto.IsEnabled;
        policy.AccessStartAtUtc = ParseLocalDateToUtc(dto.AvailableFromDate, isEndOfDay: false);
        policy.AccessEndAtUtc = ParseLocalDateToUtc(dto.AvailableToDate, isEndOfDay: true);
        policy.DailyAccessStartMinutes = ParseTimeToMinutes(dto.DailyAccessStartTime);
        policy.DailyAccessEndMinutes = ParseTimeToMinutes(dto.DailyAccessEndTime);
        policy.UpdatedAtUtc = nowUtc;
        policy.UpdatedById = adminUserId;

        if (!dto.IsEnabled)
        {
            policy.RevokedAtUtc = nowUtc;
            policy.RevokedById = adminUserId;
        }
        else
        {
            policy.RevokedAtUtc = null;
            policy.RevokedById = null;
        }

        var requestedFeatures = dto.Features
            .ToDictionary(
                x => PatientSelfServiceFeatures.Normalize(x.FeatureKey),
                x => x.IsEnabled,
                StringComparer.OrdinalIgnoreCase);

        foreach (var featureKey in PatientSelfServiceFeatures.All)
        {
            var grant = policy.FeatureGrants.FirstOrDefault(x => x.FeatureKey == featureKey);
            if (grant == null)
            {
                grant = new PatientSelfServiceFeatureGrant
                {
                    FeatureKey = featureKey,
                    Policy = policy
                };

                policy.FeatureGrants.Add(grant);
            }

            grant.IsEnabled = requestedFeatures.TryGetValue(featureKey, out var isEnabled) && isEnabled;
            grant.UpdatedAtUtc = nowUtc;
            grant.UpdatedById = adminUserId;
        }

        await _context.SaveChangesAsync();

        var action = previousState == null
            ? "PatientSelfServiceConfigured"
            : dto.IsEnabled
                ? "PatientSelfServiceUpdated"
                : "PatientSelfServiceRevoked";

        var details = JsonSerializer.Serialize(new
        {
            careRecipientId = careRecipient.Id,
            patientName = $"{careRecipient.FirstName} {careRecipient.LastName}",
            previous = previousState,
            current = SerializePolicy(policy)
        });

        await _auditLogService.LogAsync(
            adminUserId,
            action,
            "PatientSelfServiceAccess",
            careRecipient.Id.ToString(CultureInfo.InvariantCulture),
            details,
            null);

        return BuildSummary(
            careRecipient.Id,
            policy,
            canUseSelfService: true,
            actorIsFamily: false,
            actorMatchesPatient: true);
    }

    public async Task<List<PatientSelfServiceAccessAuditDto>> GetAuditTrailByUserIdAsync(string userId)
    {
        var careRecipient = await _context.CareRecipients
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (careRecipient == null)
        {
            return new List<PatientSelfServiceAccessAuditDto>();
        }

        var entityId = careRecipient.Id.ToString(CultureInfo.InvariantCulture);

        return await (
                from log in _context.AuditLogs.AsNoTracking()
                where log.EntityName == "PatientSelfServiceAccess" && log.EntityId == entityId
                join user in _context.Users.AsNoTracking() on log.UserId equals user.Id into users
                from user in users.DefaultIfEmpty()
                orderby log.CreatedAt descending
                select new PatientSelfServiceAccessAuditDto
                {
                    Id = log.Id,
                    Action = log.Action,
                    Details = log.Details,
                    CreatedAt = log.CreatedAt,
                    PerformedBy = user == null
                        ? (log.UserId ?? "Unknown")
                        : ((user.FirstName ?? "") + " " + (user.LastName ?? ""))
                }
            )
            .ToListAsync();
    }

    public async Task EnsureFeatureSubmissionAllowedAsync(string actorUserId, int careRecipientId, string featureKey)
    {
        var normalizedFeature = PatientSelfServiceFeatures.Normalize(featureKey);
        var roles = await GetRolesAsync(actorUserId);

        if (roles.Contains(Roles.PatientFamily))
        {
            throw new PatientSelfServiceAccessDeniedException("ثبت اطلاعات برای همراه بیمار مجاز نیست.");
        }

        var isPatientSelfServiceUser = roles.Contains(Roles.Patient) || roles.Contains(Roles.Elderly);
        if (!isPatientSelfServiceUser)
        {
            return;
        }

        var careRecipient = await _context.CareRecipients
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == careRecipientId);

        if (careRecipient == null || !string.Equals(careRecipient.UserId, actorUserId, StringComparison.Ordinal))
        {
            throw new PatientSelfServiceAccessDeniedException("امکان ثبت فقط برای حساب خود بیمار یا سالمند مجاز است.");
        }

        var summary = await GetPatientSummaryAsync(careRecipientId, actorUserId);
        var feature = summary.Features.FirstOrDefault(x => x.FeatureKey == normalizedFeature);

        if (feature == null || !feature.CanSubmitNow)
        {
            throw new PatientSelfServiceAccessDeniedException(
                feature?.Message ?? "دسترسی ثبت اطلاعات برای شما فعال نیست.");
        }
    }

    private async Task<PatientSelfServiceAccessPolicy?> GetPolicyAsync(int careRecipientId)
    {
        return await _context.Set<PatientSelfServiceAccessPolicy>()
            .AsNoTracking()
            .Include(x => x.FeatureGrants)
            .FirstOrDefaultAsync(x => x.CareRecipientId == careRecipientId);
    }

    private static PatientSelfServiceAccessSummaryDto CreateEmptySummary(int careRecipientId, string message)
    {
        return new PatientSelfServiceAccessSummaryDto
        {
            CareRecipientId = careRecipientId,
            IsConfigured = false,
            IsEnabled = false,
            IsCurrentlyWithinWindow = false,
            IsExpired = false,
            StatusMessage = message,
            Features = PatientSelfServiceFeatures.All
                .Select(featureKey => new PatientSelfServiceFeatureStatusDto
                {
                    FeatureKey = featureKey,
                    FeatureTitle = PatientSelfServiceFeatures.GetDisplayName(featureKey),
                    IsEnabled = false,
                    CanSubmitNow = false,
                    Message = message
                })
                .ToList()
        };
    }

    private static PatientSelfServiceAccessSummaryDto BuildSummary(
        int careRecipientId,
        PatientSelfServiceAccessPolicy? policy,
        bool canUseSelfService,
        bool actorIsFamily,
        bool actorMatchesPatient)
    {
        if (policy == null)
        {
            return CreateEmptySummary(careRecipientId, "دسترسی ثبت اطلاعات برای شما فعال نیست.");
        }

        var windowEvaluation = EvaluateWindow(policy, DateTime.UtcNow);
        var summary = new PatientSelfServiceAccessSummaryDto
        {
            CareRecipientId = careRecipientId,
            IsConfigured = true,
            IsEnabled = policy.IsEnabled,
            IsCurrentlyWithinWindow = windowEvaluation.IsWithinWindow,
            IsExpired = windowEvaluation.IsExpired,
            StatusMessage = windowEvaluation.Message,
            AccessStartAtUtc = policy.AccessStartAtUtc,
            AccessEndAtUtc = policy.AccessEndAtUtc,
            DailyAccessStartTime = FormatMinutes(policy.DailyAccessStartMinutes),
            DailyAccessEndTime = FormatMinutes(policy.DailyAccessEndMinutes)
        };

        foreach (var featureKey in PatientSelfServiceFeatures.All)
        {
            var grant = policy.FeatureGrants.FirstOrDefault(x => x.FeatureKey == featureKey);
            var featureEnabled = grant?.IsEnabled ?? false;
            var featureMessage = ResolveFeatureMessage(
                featureKey,
                featureEnabled,
                windowEvaluation.Message,
                canUseSelfService,
                actorIsFamily,
                actorMatchesPatient);

            summary.Features.Add(new PatientSelfServiceFeatureStatusDto
            {
                FeatureKey = featureKey,
                FeatureTitle = PatientSelfServiceFeatures.GetDisplayName(featureKey),
                IsEnabled = featureEnabled,
                CanSubmitNow = featureEnabled
                    && windowEvaluation.IsWithinWindow
                    && canUseSelfService
                    && !actorIsFamily
                    && actorMatchesPatient,
                Message = featureMessage
            });
        }

        return summary;
    }

    private static string? ResolveFeatureMessage(
        string featureKey,
        bool featureEnabled,
        string? windowMessage,
        bool canUseSelfService,
        bool actorIsFamily,
        bool actorMatchesPatient)
    {
        if (actorIsFamily)
        {
            return "ثبت اطلاعات فقط برای حساب بیمار یا سالمند فعال می‌شود.";
        }

        if (!canUseSelfService)
        {
            return null;
        }

        if (!actorMatchesPatient)
        {
            return "امکان ثبت فقط برای حساب خود بیمار یا سالمند مجاز است.";
        }

        if (!featureEnabled)
        {
            return $"{PatientSelfServiceFeatures.GetDisplayName(featureKey)} برای شما فعال نیست.";
        }

        return windowMessage;
    }

    private static (bool IsWithinWindow, bool IsExpired, string? Message) EvaluateWindow(
        PatientSelfServiceAccessPolicy policy,
        DateTime utcNow)
    {
        if (!policy.IsEnabled)
        {
            return (false, false, "دسترسی ثبت اطلاعات برای شما فعال نیست.");
        }

        if (policy.AccessStartAtUtc.HasValue && utcNow < policy.AccessStartAtUtc.Value)
        {
            return (false, false, "امکان ثبت هنوز در بازه زمانی مجاز فعال نشده است.");
        }

        if (policy.AccessEndAtUtc.HasValue && utcNow > policy.AccessEndAtUtc.Value)
        {
            return (false, true, "مهلت ثبت اطلاعات به پایان رسیده است.");
        }

        if (policy.DailyAccessStartMinutes.HasValue && policy.DailyAccessEndMinutes.HasValue)
        {
            var iranTz = GetIranTimeZone();
            var nowIran = TimeZoneInfo.ConvertTimeFromUtc(utcNow, iranTz);
            var currentMinutes = nowIran.Hour * 60 + nowIran.Minute;
            var startMinutes = policy.DailyAccessStartMinutes.Value;
            var endMinutes = policy.DailyAccessEndMinutes.Value;

            var isWithinDailyWindow = startMinutes <= endMinutes
                ? currentMinutes >= startMinutes && currentMinutes <= endMinutes
                : currentMinutes >= startMinutes || currentMinutes <= endMinutes;

            if (!isWithinDailyWindow)
            {
                return (false, false, "ثبت اطلاعات فقط در ساعت‌های مجاز امکان‌پذیر است.");
            }
        }

        return (true, false, null);
    }

    private static string? FormatMinutes(int? totalMinutes)
    {
        if (!totalMinutes.HasValue)
        {
            return null;
        }

        return TimeSpan.FromMinutes(totalMinutes.Value).ToString(@"hh\:mm");
    }

    private static int? ParseTimeToMinutes(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        if (!TimeSpan.TryParseExact(value, @"hh\:mm", CultureInfo.InvariantCulture, out var time))
        {
            throw new ArgumentException("فرمت ساعت مجاز نیست.");
        }

        return (int)time.TotalMinutes;
    }

    private static DateTime? ParseLocalDateToUtc(string? value, bool isEndOfDay)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        if (!DateTime.TryParseExact(value, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var localDate))
        {
            throw new ArgumentException("فرمت تاریخ مجاز نیست.");
        }

        var localDateTime = isEndOfDay
            ? new DateTime(localDate.Year, localDate.Month, localDate.Day, 23, 59, 59, 999, DateTimeKind.Unspecified)
            : new DateTime(localDate.Year, localDate.Month, localDate.Day, 0, 0, 0, DateTimeKind.Unspecified);

        return TimeZoneInfo.ConvertTimeToUtc(localDateTime, GetIranTimeZone());
    }

    private static TimeZoneInfo GetIranTimeZone()
    {
        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById("Iran Standard Time");
        }
        catch
        {
            return TimeZoneInfo.FindSystemTimeZoneById("Asia/Tehran");
        }
    }

    private static object SerializePolicy(PatientSelfServiceAccessPolicy policy)
    {
        return new
        {
            policy.IsEnabled,
            policy.AccessStartAtUtc,
            policy.AccessEndAtUtc,
            policy.DailyAccessStartMinutes,
            policy.DailyAccessEndMinutes,
            Features = policy.FeatureGrants
                .OrderBy(x => x.FeatureKey)
                .Select(x => new { x.FeatureKey, x.IsEnabled })
                .ToList()
        };
    }

    private static void ValidateUpdateDto(UpdatePatientSelfServiceAccessDto dto)
    {
        if (dto.Features.Count == 0)
        {
            throw new ArgumentException("حداقل یک ویژگی باید ارسال شود.");
        }

        var duplicateKeys = dto.Features
            .GroupBy(x => x.FeatureKey, StringComparer.OrdinalIgnoreCase)
            .Where(x => x.Count() > 1)
            .Select(x => x.Key)
            .ToList();

        if (duplicateKeys.Count > 0)
        {
            throw new ArgumentException("ویژگی‌های تکراری در درخواست وجود دارد.");
        }

        foreach (var feature in dto.Features)
        {
            if (!PatientSelfServiceFeatures.IsValid(feature.FeatureKey))
            {
                throw new ArgumentException("یکی از ویژگی‌های ارسالی معتبر نیست.");
            }
        }

        if (!string.IsNullOrWhiteSpace(dto.DailyAccessStartTime) ^ !string.IsNullOrWhiteSpace(dto.DailyAccessEndTime))
        {
            throw new ArgumentException("برای بازه زمانی روزانه باید ساعت شروع و پایان باهم وارد شوند.");
        }

        var fromDate = ParseLocalDateToUtc(dto.AvailableFromDate, isEndOfDay: false);
        var toDate = ParseLocalDateToUtc(dto.AvailableToDate, isEndOfDay: true);

        if (fromDate.HasValue && toDate.HasValue && fromDate > toDate)
        {
            throw new ArgumentException("تاریخ پایان باید بعد از تاریخ شروع باشد.");
        }
    }

    private async Task<HashSet<string>> GetRolesAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        }

        var roles = await _userManager.GetRolesAsync(user);
        return roles.ToHashSet(StringComparer.OrdinalIgnoreCase);
    }
}
