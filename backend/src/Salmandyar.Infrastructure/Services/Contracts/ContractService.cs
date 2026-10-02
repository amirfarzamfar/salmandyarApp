using System.Globalization;
using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Salmandyar.Application.DTOs.Common;
using Salmandyar.Application.DTOs.Contracts;
using Salmandyar.Application.Services.Contracts;
using Salmandyar.Domain.Entities;
using Salmandyar.Domain.Entities.Contracts;
using Salmandyar.Domain.Enums;
using Salmandyar.Infrastructure.Persistence;

namespace Salmandyar.Infrastructure.Services.Contracts;

public class ContractService : IContractService
{
    private readonly ApplicationDbContext _db;
    private readonly UserManager<User> _userManager;
    private readonly IContractPlaceholderRenderer _renderer;
    private readonly IContractContentHasher _hasher;

    public ContractService(
        ApplicationDbContext db,
        UserManager<User> userManager,
        IContractPlaceholderRenderer renderer,
        IContractContentHasher hasher)
    {
        _db = db;
        _userManager = userManager;
        _renderer = renderer;
        _hasher = hasher;
    }

    #region Helpers

    private static readonly Dictionary<ContractStatus, string> StatusLabels = new()
    {
        [ContractStatus.Draft] = "پیش‌نویس",
        [ContractStatus.PendingCompletion] = "در انتظار تکمیل",
        [ContractStatus.PendingReview] = "در انتظار تأیید",
        [ContractStatus.Signed] = "امضا شده",
        [ContractStatus.Expired] = "منقضی شده",
        [ContractStatus.Terminated] = "فسخ شده",
    };

    private static readonly Dictionary<ContractAuditActionType, string> AuditLabels = new()
    {
        [ContractAuditActionType.Signed] = "امضای قرارداد توسط پرستار",
        [ContractAuditActionType.AdminTerminated] = "فسخ قرارداد توسط ادمین",
        [ContractAuditActionType.AdminReopened] = "بازگشایی قرارداد توسط ادمین",
        [ContractAuditActionType.DraftUpdated] = "به‌روزرسانی پیش‌نویس توسط پرستار",
    };

    private static string GetStatusLabel(ContractStatus s) =>
        StatusLabels.TryGetValue(s, out var l) ? l : s.ToString();

    private static string GetAuditLabel(ContractAuditActionType t) =>
        AuditLabels.TryGetValue(t, out var l) ? l : t.ToString();

    private static List<ContractFieldDto> MapFields(IEnumerable<ContractField> fields) =>
        fields.OrderBy(f => f.Order).Select(f => new ContractFieldDto
        {
            Id = f.Id,
            ContractTemplateId = f.ContractTemplateId,
            FieldKey = f.FieldKey,
            Label = f.Label,
            FieldType = f.FieldType,
            IsRequired = f.IsRequired,
            Placeholder = f.Placeholder,
            DefaultValueFromProfile = f.DefaultValueFromProfile,
            Order = f.Order,
            Options = string.IsNullOrWhiteSpace(f.OptionsJson)
                ? null
                : JsonSerializer.Deserialize<List<string>>(f.OptionsJson)
        }).ToList();

    private static List<ContractFieldValueDto> MapFieldValues(IEnumerable<ContractFieldValue> values) =>
        values.Select(v => new ContractFieldValueDto
        {
            Id = v.Id,
            AssignmentId = v.AssignmentId,
            ContractFieldId = v.ContractFieldId,
            FieldKey = v.FieldKey,
            StringValue = v.StringValue,
            NumberValue = v.NumberValue,
            DateValue = v.DateValue
        }).ToList();

    private static ContractAssignmentDto MapAssignment(ContractAssignment a)
    {
        return new ContractAssignmentDto
        {
            Id = a.Id,
            ContractTemplateId = a.ContractTemplateId,
            UserId = a.UserId,
            ContractNumber = a.ContractNumber,
            Status = a.Status,
            StatusLabel = GetStatusLabel(a.Status),
            AssignedAt = a.AssignedAt,
            SubmittedAt = a.SubmittedAt,
            SignedAt = a.SignedAt,
            StartDate = a.StartDate,
            EndDate = a.EndDate,
            UserFullName = a.User != null ? $"{a.User.FirstName} {a.User.LastName}".Trim() : null,
            UserNationalCode = a.User != null ? (a.User.NationalCode
                                                   ?? (a.User.CaregiverProfile != null ? a.User.CaregiverProfile.NationalCode : null))
                                              : null,
            UserPhoneNumber = a.User?.PhoneNumber,
            Template = new ContractTemplateSummaryDto
            {
                Id = a.ContractTemplate?.Id ?? 0,
                Title = a.ContractTemplate?.Title ?? string.Empty,
                Code = a.ContractTemplate?.Code ?? string.Empty,
                Version = a.ContractTemplate?.Version ?? 0,
                CooperationType = a.ContractTemplate?.CooperationType ?? string.Empty,
            },
            FieldValues = MapFieldValues(a.FieldValues ?? new List<ContractFieldValue>())
        };
    }

    private static string? GetDefaultValueFromPath(User? u, CaregiverProfile? cp, string? path)
    {
        if (string.IsNullOrWhiteSpace(path)) return null;
        return path switch
        {
            "User.FirstName+LastName" => $"{u?.FirstName} {u?.LastName}".Trim(),
            "User.PhoneNumber" => u?.PhoneNumber,
            "User.Email" => u?.Email,
            "CaregiverProfile.NationalCode" => cp?.NationalCode ?? u?.NationalCode,
            "CaregiverProfile.Address" => cp?.FullAddress,
            "CaregiverProfile.FullAddress" => cp?.FullAddress,
            "CaregiverProfile.Iban" => cp?.Iban,
            "CaregiverProfile.CooperationType" => cp?.CooperationType,
            "CaregiverProfile.EmploymentStartDate" => FormatDate(cp?.SubmittedAt ?? cp?.CreatedAt),
            "CaregiverProfile.EmergencyPhone" => cp?.EmergencyContactMobile ?? cp?.EmergencyContactPhone,
            "CaregiverProfile.EmergencyContactMobile" => cp?.EmergencyContactMobile,
            "CaregiverProfile.MobileNumber" => cp?.MobileNumber ?? u?.PhoneNumber,
            "CaregiverProfile.Province" => cp?.Province,
            "CaregiverProfile.City" => cp?.City,
            _ => null
        };
    }

    private static string? FormatDate(DateTime? dt)
    {
        if (!dt.HasValue) return null;
        return dt.Value.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
    }

    private static ContractFieldValue CreateFieldValue(int assignmentId, ContractField templateField, ContractFieldValueInputDto input)
    {
        return new ContractFieldValue
        {
            AssignmentId = assignmentId,
            ContractFieldId = templateField.Id,
            FieldKey = templateField.FieldKey,
            StringValue = input.StringValue,
            NumberValue = input.NumberValue,
            DateValue = input.DateValue.HasValue
                ? DateTime.SpecifyKind(input.DateValue.Value, DateTimeKind.Utc)
                : null
        };
    }

    private async Task<(User? User, CaregiverProfile? Caregiver)> LoadUserContextAsync(string userId, CancellationToken ct)
    {
        var u = await _db.Users
            .AsNoTracking()
            .Include(x => x.CaregiverProfile)
            .FirstOrDefaultAsync(x => x.Id == userId, ct);
        return (u, u?.CaregiverProfile);
    }

    private List<ContractFieldValue> PrefillFromProfile(
        IEnumerable<ContractField> templateFields,
        User? user,
        CaregiverProfile? caregiver)
    {
        var result = new List<ContractFieldValue>();
        foreach (var f in templateFields.OrderBy(x => x.Order))
        {
            var profileValue = GetDefaultValueFromPath(user, caregiver, f.DefaultValueFromProfile);
            if (string.IsNullOrWhiteSpace(profileValue)) continue;

            var fv = new ContractFieldValue
            {
                ContractFieldId = f.Id,
                FieldKey = f.FieldKey,
            };
            switch (f.FieldType)
            {
                case ContractFieldType.Text:
                case ContractFieldType.TextArea:
                case ContractFieldType.Select:
                    fv.StringValue = profileValue;
                    break;
                case ContractFieldType.Number when decimal.TryParse(profileValue, NumberStyles.Any, CultureInfo.InvariantCulture, out var num):
                    fv.NumberValue = num;
                    break;
                case ContractFieldType.Date when DateTime.TryParse(profileValue, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal, out var dt):
                    fv.DateValue = dt;
                    break;
                default:
                    fv.StringValue = profileValue;
                    break;
            }
            result.Add(fv);
        }
        return result;
    }

    private static bool ValidateRequired(IEnumerable<ContractField> templateFields,
        List<ContractFieldValue> existingValues,
        List<ContractFieldValueInputDto> inputValues)
    {
        var combined = new Dictionary<string, ContractFieldValueInputDto>(StringComparer.OrdinalIgnoreCase);
        foreach (var ev in existingValues)
        {
            combined[ev.FieldKey] = new ContractFieldValueInputDto
            {
                FieldKey = ev.FieldKey,
                StringValue = ev.StringValue,
                NumberValue = ev.NumberValue,
                DateValue = ev.DateValue,
            };
        }
        foreach (var iv in inputValues)
        {
            combined[iv.FieldKey] = iv;
        }

        foreach (var req in templateFields.Where(f => f.IsRequired))
        {
            if (!combined.TryGetValue(req.FieldKey, out var v)) return false;
            var hasValue =
                !string.IsNullOrWhiteSpace(v.StringValue) ||
                v.NumberValue.HasValue ||
                v.DateValue.HasValue;
            if (!hasValue) return false;
        }
        return true;
    }

    #endregion

    public async Task<PagedResponse<ContractTemplateDto>> GetTemplatesAsync(int page, int pageSize, string? search, CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _db.ContractTemplates
            .AsNoTracking()
            .Include(t => t.Fields)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(t =>
                t.Title.Contains(search) ||
                t.Code.Contains(search) ||
                t.CooperationType!.Contains(search));
        }

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var ids = items.Select(t => t.Id).ToList();
        var stats = await _db.ContractAssignments
            .AsNoTracking()
            .Where(a => ids.Contains(a.ContractTemplateId))
            .GroupBy(a => a.ContractTemplateId)
            .Select(g => new
            {
                TemplateId = g.Key,
                Total = g.Count(),
                Signed = g.Count(x => x.Status == ContractStatus.Signed)
            })
            .ToDictionaryAsync(x => x.TemplateId, ct);

        var dtos = items.Select(t =>
        {
            stats.TryGetValue(t.Id, out var s);
            return new ContractTemplateDto
            {
                Id = t.Id,
                Title = t.Title,
                Code = t.Code,
                CooperationType = t.CooperationType,
                ContractText = t.ContractText,
                Version = t.Version,
                IsActive = t.IsActive,
                EffectiveStartDate = t.EffectiveStartDate,
                EffectiveEndDate = t.EffectiveEndDate,
                PublishedAt = t.PublishedAt,
                Fields = MapFields(t.Fields),
                AssignmentCount = s?.Total ?? 0,
                SignedAssignmentCount = s?.Signed ?? 0
            };
        }).ToList();

        return new PagedResponse<ContractTemplateDto>
        {
            Items = dtos,
            TotalCount = total,
            PageNumber = page,
            PageSize = pageSize
        };
    }

    public async Task<ContractTemplateDto?> GetTemplateAsync(int id, bool includeFields = true, CancellationToken ct = default)
    {
        var q = _db.ContractTemplates.AsNoTracking();
        if (includeFields) q = q.Include(t => t.Fields);
        var tpl = await q.FirstOrDefaultAsync(t => t.Id == id, ct);
        if (tpl == null) return null;
        return new ContractTemplateDto
        {
            Id = tpl.Id,
            Title = tpl.Title,
            Code = tpl.Code,
            CooperationType = tpl.CooperationType,
            ContractText = tpl.ContractText,
            Version = tpl.Version,
            IsActive = tpl.IsActive,
            EffectiveStartDate = tpl.EffectiveStartDate,
            EffectiveEndDate = tpl.EffectiveEndDate,
            PublishedAt = tpl.PublishedAt,
            Fields = includeFields ? MapFields(tpl.Fields) : new(),
        };
    }

    public async Task<ContractTemplateDto> CreateTemplateAsync(CreateContractTemplateDto dto, string adminUserId, CancellationToken ct = default)
    {
        var existingCode = await _db.ContractTemplates
            .AsNoTracking()
            .AnyAsync(t => t.Code == dto.Code, ct);
        if (existingCode)
            throw new InvalidOperationException($"شابلونی با کد «{dto.Code}» از قبل وجود دارد.");

        var now = DateTime.UtcNow;
        var tpl = new ContractTemplate
        {
            Title = dto.Title,
            Code = dto.Code,
            CooperationType = dto.CooperationType ?? string.Empty,
            ContractText = dto.ContractText,
            Version = 1,
            IsActive = dto.IsActive,
            EffectiveStartDate = dto.EffectiveStartDate,
            EffectiveEndDate = dto.EffectiveEndDate,
            CreatedAt = now,
            CreatedByUserId = adminUserId,
            PublishedAt = dto.Publish ? now : null,
            Fields = dto.Fields?.Select((f, i) => new ContractField
            {
                FieldKey = f.FieldKey,
                Label = f.Label,
                FieldType = f.FieldType,
                IsRequired = f.IsRequired,
                Placeholder = f.Placeholder,
                DefaultValueFromProfile = f.DefaultValueFromProfile,
                OptionsJson = f.Options != null ? JsonSerializer.Serialize(f.Options) : null,
                Order = f.Order > 0 ? f.Order : i + 1
            }).ToList() ?? new()
        };

        _db.ContractTemplates.Add(tpl);
        await _db.SaveChangesAsync(ct);

        return (await GetTemplateAsync(tpl.Id, true, ct))!;
    }

    public async Task<ContractTemplateDto> UpdateTemplateAsync(int id, UpdateContractTemplateDto dto, string adminUserId, CancellationToken ct = default)
    {
        var tpl = await _db.ContractTemplates
            .Include(t => t.Fields)
            .FirstOrDefaultAsync(t => t.Id == id, ct);
        if (tpl == null)
            throw new KeyNotFoundException($"شابلون قرارداد با شناسه {id} یافت نشد.");

        var hasSignedAssignments = await _db.ContractAssignments
            .AsNoTracking()
            .AnyAsync(a => a.ContractTemplateId == id &&
                           (a.Status == ContractStatus.Signed ||
                            a.Status == ContractStatus.PendingReview), ct);

        var now = DateTime.UtcNow;

        if (hasSignedAssignments)
        {
            var oldVersion = tpl.Version;
            var newTpl = new ContractTemplate
            {
                Title = dto.Title,
                Code = tpl.Code,
                CooperationType = dto.CooperationType ?? string.Empty,
                ContractText = dto.ContractText,
                Version = oldVersion + 1,
                IsActive = dto.IsActive,
                EffectiveStartDate = dto.EffectiveStartDate,
                EffectiveEndDate = dto.EffectiveEndDate,
                CreatedAt = now,
                CreatedByUserId = adminUserId,
                UpdatedAt = now,
                UpdatedByUserId = adminUserId,
                PublishedAt = dto.IsActive ? now : null,
            };
            newTpl.Fields = dto.Fields?.Select((f, i) => new ContractField
            {
                FieldKey = f.FieldKey,
                Label = f.Label,
                FieldType = f.FieldType,
                IsRequired = f.IsRequired,
                Placeholder = f.Placeholder,
                DefaultValueFromProfile = f.DefaultValueFromProfile,
                OptionsJson = f.Options != null ? JsonSerializer.Serialize(f.Options) : null,
                Order = f.Order > 0 ? f.Order : i + 1
            }).ToList() ?? new();

            tpl.IsActive = false;
            tpl.UpdatedAt = now;
            tpl.UpdatedByUserId = adminUserId;

            _db.ContractTemplates.Add(newTpl);
            await _db.SaveChangesAsync(ct);
            return (await GetTemplateAsync(newTpl.Id, true, ct))!;
        }
        else
        {
            tpl.Title = dto.Title;
            tpl.CooperationType = dto.CooperationType ?? string.Empty;
            tpl.ContractText = dto.ContractText;
            tpl.IsActive = dto.IsActive;
            tpl.EffectiveStartDate = dto.EffectiveStartDate;
            tpl.EffectiveEndDate = dto.EffectiveEndDate;
            tpl.UpdatedAt = now;
            tpl.UpdatedByUserId = adminUserId;
            if (tpl.PublishedAt == null && dto.IsActive)
                tpl.PublishedAt = now;

            _db.ContractFields.RemoveRange(tpl.Fields);
            tpl.Fields = dto.Fields?.Select((f, i) => new ContractField
            {
                FieldKey = f.FieldKey,
                Label = f.Label,
                FieldType = f.FieldType,
                IsRequired = f.IsRequired,
                Placeholder = f.Placeholder,
                DefaultValueFromProfile = f.DefaultValueFromProfile,
                OptionsJson = f.Options != null ? JsonSerializer.Serialize(f.Options) : null,
                Order = f.Order > 0 ? f.Order : i + 1
            }).ToList() ?? new();

            await _db.SaveChangesAsync(ct);
            return (await GetTemplateAsync(tpl.Id, true, ct))!;
        }
    }

    public async Task ToggleTemplateActiveAsync(int id, bool isActive, string adminUserId, CancellationToken ct = default)
    {
        var tpl = await _db.ContractTemplates.FirstOrDefaultAsync(t => t.Id == id, ct);
        if (tpl == null) throw new KeyNotFoundException();
        tpl.IsActive = isActive;
        tpl.UpdatedAt = DateTime.UtcNow;
        tpl.UpdatedByUserId = adminUserId;
        if (isActive && tpl.PublishedAt == null)
            tpl.PublishedAt = tpl.UpdatedAt;
        await _db.SaveChangesAsync(ct);
    }

    public async Task<string> PreviewTemplateAsync(int templateId, int? assignmentId = null, string? userId = null, CancellationToken ct = default)
    {
        var tpl = await _db.ContractTemplates
            .AsNoTracking()
            .Include(t => t.Fields)
            .FirstOrDefaultAsync(t => t.Id == templateId, ct);
        if (tpl == null) throw new KeyNotFoundException();

        User? u = null;
        CaregiverProfile? cp = null;
        List<ContractFieldValue> fieldValues = new();
        ContractAssignment? assignment = null;

        if (assignmentId.HasValue)
        {
            assignment = await _db.ContractAssignments
                .AsNoTracking()
                .Include(a => a.FieldValues)
                .Include(a => a.User)
                .Include(a => a.ContractTemplate)
                .FirstOrDefaultAsync(a => a.Id == assignmentId.Value, ct);
            if (assignment != null)
            {
                fieldValues = assignment.FieldValues.ToList();
                u = assignment.User;
                if (u != null)
                    cp = await _db.CaregiverProfiles.AsNoTracking().FirstOrDefaultAsync(x => x.UserId == u.Id, ct);
            }
        }
        else if (!string.IsNullOrWhiteSpace(userId))
        {
            (u, cp) = await LoadUserContextAsync(userId, ct);
            fieldValues = PrefillFromProfile(tpl.Fields, u, cp);
        }

        return _renderer.Render(tpl.ContractText, fieldValues, assignment, tpl, u, cp);
    }

    public async Task<ContractAssignmentDto> AssignContractAsync(AssignContractDto dto, string adminUserId, CancellationToken ct = default)
    {
        var tpl = await _db.ContractTemplates
            .Include(t => t.Fields)
            .FirstOrDefaultAsync(t => t.Id == dto.ContractTemplateId, ct);
        if (tpl == null)
            throw new KeyNotFoundException("شابلون قرارداد یافت نشد.");

        var u = await _userManager.FindByIdAsync(dto.UserId);
        if (u == null)
            throw new KeyNotFoundException("کاربر یافت نشد.");

        var existing = await _db.ContractAssignments
            .AsNoTracking()
            .AnyAsync(a => a.ContractTemplateId == dto.ContractTemplateId &&
                           a.UserId == dto.UserId &&
                           (a.Status == ContractStatus.Draft ||
                            a.Status == ContractStatus.PendingCompletion ||
                            a.Status == ContractStatus.PendingReview ||
                            a.Status == ContractStatus.Signed), ct);
        if (existing)
            throw new InvalidOperationException("برای این کاربر و شابلون، تخصیص فعال دیگری وجود دارد.");

        var now = DateTime.UtcNow;
        var cp = await _db.CaregiverProfiles.AsNoTracking()
            .FirstOrDefaultAsync(x => x.UserId == dto.UserId, ct);
        var prefills = PrefillFromProfile(tpl.Fields, u, cp);

        var assignment = new ContractAssignment
        {
            ContractTemplateId = dto.ContractTemplateId,
            UserId = dto.UserId,
            Status = ContractStatus.PendingCompletion,
            AssignedAt = now,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            FieldValues = prefills
        };
        _db.ContractAssignments.Add(assignment);
        await _db.SaveChangesAsync(ct);

        var loaded = await _db.ContractAssignments
            .Include(a => a.FieldValues)
            .Include(a => a.User)
            .Include(a => a.ContractTemplate)
            .FirstAsync(a => a.Id == assignment.Id, ct);
        return MapAssignment(loaded);
    }

    public async Task<PagedResponse<ContractAssignmentDto>> GetAssignmentsAsync(
        int page, int pageSize, string? search, int? templateId = null, string? userId = null,
        ContractStatus? status = null, CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _db.ContractAssignments
            .AsNoTracking()
            .Include(a => a.User)
            .Include(a => a.ContractTemplate)
            .Include(a => a.FieldValues)
            .AsQueryable();

        if (templateId.HasValue)
            query = query.Where(a => a.ContractTemplateId == templateId.Value);
        if (!string.IsNullOrWhiteSpace(userId))
            query = query.Where(a => a.UserId == userId);
        if (status.HasValue)
            query = query.Where(a => a.Status == status.Value);
        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(a =>
                (a.User != null &&
                 ((a.User.FirstName + " " + a.User.LastName).Contains(search) ||
                  (a.User.PhoneNumber != null && a.User.PhoneNumber.Contains(search)) ||
                  (a.User.NationalCode != null && a.User.NationalCode.Contains(search)))) ||
                (a.ContractNumber != null && a.ContractNumber.Contains(search)));
        }

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(a => a.AssignedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new PagedResponse<ContractAssignmentDto>
        {
            Items = items.Select(MapAssignment).ToList(),
            TotalCount = total,
            PageNumber = page,
            PageSize = pageSize
        };
    }

    public async Task<ContractAssignmentDto?> GetAssignmentAsync(int id, CancellationToken ct = default)
    {
        var a = await _db.ContractAssignments
            .AsNoTracking()
            .Include(x => x.FieldValues)
            .Include(x => x.User)
            .Include(x => x.ContractTemplate)
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        return a == null ? null : MapAssignment(a);
    }

    public async Task<List<UserContractAssignmentSummaryDto>> GetUserAssignmentsAsync(string userId, CancellationToken ct = default)
    {
        var items = await _db.ContractAssignments
            .AsNoTracking()
            .Include(a => a.ContractTemplate)
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.AssignedAt)
            .ToListAsync(ct);
        return items.Select(a => new UserContractAssignmentSummaryDto
        {
            AssignmentId = a.Id,
            ContractTemplateId = a.ContractTemplateId,
            TemplateTitle = a.ContractTemplate?.Title ?? string.Empty,
            TemplateVersion = a.ContractTemplate?.Version ?? 0,
            ContractNumber = a.ContractNumber,
            Status = a.Status,
            StatusLabel = GetStatusLabel(a.Status),
            AssignedAt = a.AssignedAt,
            SignedAt = a.SignedAt,
            StartDate = a.StartDate,
            EndDate = a.EndDate
        }).ToList();
    }

    public async Task<MyContractStatusDto> GetMyActiveContractAsync(string userId, bool autoAssignDefault = true, CancellationToken ct = default)
    {
        var (u, cp) = await LoadUserContextAsync(userId, ct);
        // 1) Return ANY not-terminated/expired assignment for this user (priority: Signed first, then newest AssignedAt).
        //    This ensures Admin manual-assignments (even if the template is currently unpublished) are visible in nurse portal.
        var activeAssignment = await _db.ContractAssignments
            .AsNoTracking()
            .Include(a => a.FieldValues)
            .Include(a => a.User)
            .Include(a => a.ContractTemplate)
            .Where(a => a.UserId == userId &&
                        a.Status != ContractStatus.Terminated &&
                        a.Status != ContractStatus.Expired)
            .OrderByDescending(a => a.Status == ContractStatus.Signed ? 1 : 0)
            .ThenByDescending(a => a.AssignedAt)
            .FirstOrDefaultAsync(ct);

        // 2) Default candidate template for AUTO-ASSIGNMENT must be published + active.
        var autoAssignTpl = await _db.ContractTemplates
            .AsNoTracking()
            .OrderByDescending(t => t.Version)
            .FirstOrDefaultAsync(t => t.IsActive && t.PublishedAt != null, ct);

        if (activeAssignment == null && autoAssignDefault && autoAssignTpl != null)
        {
            var tplWithFields = await _db.ContractTemplates
                .Include(t => t.Fields)
                .FirstAsync(t => t.Id == autoAssignTpl.Id, ct);
            var prefills = PrefillFromProfile(tplWithFields.Fields, u, cp);
            var now = DateTime.UtcNow;
            var newAssignment = new ContractAssignment
            {
                ContractTemplateId = autoAssignTpl.Id,
                UserId = userId,
                Status = ContractStatus.PendingCompletion,
                AssignedAt = now,
                StartDate = cp?.SubmittedAt ?? cp?.CreatedAt,
                FieldValues = prefills,
            };
            _db.ContractAssignments.Add(newAssignment);
            await _db.SaveChangesAsync(ct);
            activeAssignment = await _db.ContractAssignments
                .AsNoTracking()
                .Include(a => a.FieldValues)
                .Include(a => a.User)
                .Include(a => a.ContractTemplate)
                .FirstAsync(a => a.Id == newAssignment.Id, ct);
        }

        var identityVerified = cp != null &&
                               !string.IsNullOrWhiteSpace(cp.NationalCode) &&
                               cp.EmploymentStatus == CaregiverEmploymentApprovalStatus.Approved;
        var profVerified = cp != null && cp.IsCompleted &&
                           cp.EmploymentStatus == CaregiverEmploymentApprovalStatus.Approved;

        List<ContractFieldDto> templateFields = new();
        if (activeAssignment?.ContractTemplateId != default)
        {
            var tplWithFields = await _db.ContractTemplates
                .AsNoTracking()
                .Include(t => t.Fields)
                .FirstOrDefaultAsync(t => t.Id == activeAssignment.ContractTemplateId, ct);
            templateFields = MapFields(tplWithFields?.Fields ?? Enumerable.Empty<ContractField>());
        }
        else if (autoAssignTpl != null)
        {
            var tplWithFields = await _db.ContractTemplates
                .AsNoTracking()
                .Include(t => t.Fields)
                .FirstOrDefaultAsync(t => t.Id == autoAssignTpl.Id, ct);
            templateFields = MapFields(tplWithFields?.Fields ?? Enumerable.Empty<ContractField>());
        }

        return new MyContractStatusDto
        {
            HasActiveAssignment = activeAssignment != null,
            Assignment = activeAssignment != null ? MapAssignment(activeAssignment) : null,
            TemplateFields = templateFields,
            ActiveTemplateVersion = autoAssignTpl?.Version ?? 0,
            ActiveTemplateTitle = autoAssignTpl?.Title,
            IdentityVerified = identityVerified,
            ProfessionalEligibilityVerified = profVerified,
            ContractSigned = activeAssignment?.Status == ContractStatus.Signed,
        };
    }

    public async Task<ContractAssignmentDto> SaveMyFieldValuesAsync(SaveContractFieldValuesDto dto, string caregiverUserId, CancellationToken ct = default)
    {
        var assignment = await _db.ContractAssignments
            .Include(a => a.FieldValues)
            .Include(a => a.ContractTemplate)
            .ThenInclude(t => t.Fields)
            .Include(a => a.User)
            .FirstOrDefaultAsync(a => a.Id == dto.AssignmentId, ct);
        if (assignment == null)
            throw new KeyNotFoundException("تخصیص قرارداد یافت نشد.");
        if (assignment.UserId != caregiverUserId)
            throw new UnauthorizedAccessException();
        if (assignment.Status == ContractStatus.Signed ||
            assignment.Status == ContractStatus.Terminated ||
            assignment.Status == ContractStatus.Expired)
            throw new InvalidOperationException("امکان ویرایش قرارداد قفل‌شده وجود ندارد.");

        var existingMap = assignment.FieldValues.ToDictionary(f => f.FieldKey, StringComparer.OrdinalIgnoreCase);

        var templateFields = assignment.ContractTemplate.Fields
            .ToDictionary(f => f.FieldKey, StringComparer.OrdinalIgnoreCase);

        foreach (var input in dto.FieldValues)
        {
            if (!templateFields.TryGetValue(input.FieldKey, out var tf)) continue;
            if (existingMap.TryGetValue(input.FieldKey, out var existing))
            {
                existing.StringValue = input.StringValue;
                existing.NumberValue = input.NumberValue;
                existing.DateValue = input.DateValue.HasValue
                    ? DateTime.SpecifyKind(input.DateValue.Value, DateTimeKind.Utc)
                    : null;
            }
            else
            {
                assignment.FieldValues.Add(CreateFieldValue(assignment.Id, tf, input));
            }
        }

        assignment.Status = ContractStatus.PendingReview;
        assignment.SubmittedAt ??= DateTime.UtcNow;
        assignment.UpdatedAtSafe();

        await _db.ContractSigningAuditLogs.AddAsync(new ContractSigningAuditLog
        {
            AssignmentId = assignment.Id,
            UserId = caregiverUserId,
            ActionType = ContractAuditActionType.DraftUpdated,
            PerformedAt = DateTime.UtcNow,
            TransactionId = Guid.NewGuid(),
            DetailsJson = JsonSerializer.Serialize(new
            {
                updatedKeys = dto.FieldValues.Select(x => x.FieldKey).ToList()
            })
        }, ct);

        await _db.SaveChangesAsync(ct);

        var reloaded = await _db.ContractAssignments
            .AsNoTracking()
            .Include(a => a.FieldValues)
            .Include(a => a.User)
            .Include(a => a.ContractTemplate)
            .FirstAsync(a => a.Id == assignment.Id, ct);
        return MapAssignment(reloaded);
    }

    public async Task<ContractAssignmentDto> SignMyContractAsync(SignContractDto dto,
        string caregiverUserId,
        string? clientIp = null,
        string? userAgent = null,
        string authMethod = "Jwt",
        CancellationToken ct = default)
    {
        var assignment = await _db.ContractAssignments
            .Include(a => a.FieldValues)
            .Include(a => a.ContractTemplate)
            .ThenInclude(t => t.Fields)
            .Include(a => a.User)
            .ThenInclude(u => u.CaregiverProfile)
            .Include(a => a.AuditLogs)
            .FirstOrDefaultAsync(a => a.Id == dto.AssignmentId, ct);
        if (assignment == null)
            throw new KeyNotFoundException("تخصیص قرارداد یافت نشد.");
        if (assignment.UserId != caregiverUserId)
            throw new UnauthorizedAccessException();
        if (assignment.Status == ContractStatus.Signed)
            throw new InvalidOperationException("قرارداد قبلاً امضا شده است.");
        if (assignment.Status == ContractStatus.Terminated || assignment.Status == ContractStatus.Expired)
            throw new InvalidOperationException("امکان امضای این قرارداد وجود ندارد.");
        if (!dto.AgreedToTerms)
            throw new InvalidOperationException("باید مفاد قرارداد را مطالعه و تأیید نمایید.");

        var requiredValid = ValidateRequired(
            assignment.ContractTemplate.Fields,
            assignment.FieldValues.ToList(),
            assignment.FieldValues.Select(fv => new ContractFieldValueInputDto
            {
                FieldKey = fv.FieldKey,
                StringValue = fv.StringValue,
                NumberValue = fv.NumberValue,
                DateValue = fv.DateValue
            }).ToList());
        if (!requiredValid)
            throw new InvalidOperationException("لطفاً کلیه فیلدهای الزامی را تکمیل نمایید.");

        var now = DateTime.UtcNow;
        var rendered = _renderer.Render(
            assignment.ContractTemplate.ContractText,
            assignment.FieldValues,
            assignment,
            assignment.ContractTemplate,
            assignment.User,
            assignment.User?.CaregiverProfile);

        var contentHash = _hasher.ComputeHash(rendered, assignment.Id.ToString());
        var transactionId = Guid.NewGuid();

        assignment.SignedSnapshotContractText = rendered;
        assignment.ContentHash = contentHash;
        assignment.Status = ContractStatus.Signed;
        assignment.SignedAt = now;
        assignment.ContractNumber ??= _hasher.GenerateContractNumber(assignment.Id);

        _db.ContractSigningAuditLogs.Add(new ContractSigningAuditLog
        {
            AssignmentId = assignment.Id,
            UserId = caregiverUserId,
            ActionType = ContractAuditActionType.Signed,
            PerformedAt = now,
            ClientIp = clientIp,
            UserAgent = userAgent,
            AuthMethod = authMethod,
            TransactionId = transactionId,
            ContentHash = contentHash,
            DetailsJson = JsonSerializer.Serialize(new
            {
                agreedToTerms = true,
                contractNumber = assignment.ContractNumber,
                renderedLength = rendered.Length
            })
        });

        await _db.SaveChangesAsync(ct);

        var reloaded = await _db.ContractAssignments
            .AsNoTracking()
            .Include(a => a.FieldValues)
            .Include(a => a.User)
            .Include(a => a.ContractTemplate)
            .FirstAsync(a => a.Id == assignment.Id, ct);
        return MapAssignment(reloaded);
    }

    public async Task<ContractDocumentDto> GetMyContractDocumentAsync(string userId, int? assignmentId = null, CancellationToken ct = default)
    {
        ContractAssignment? assignment;
        if (assignmentId.HasValue)
        {
            assignment = await _db.ContractAssignments
                .Include(a => a.FieldValues)
                .Include(a => a.ContractTemplate)
                .Include(a => a.User)
                .ThenInclude(u => u.CaregiverProfile)
                .Include(a => a.AuditLogs)
                .FirstOrDefaultAsync(a => a.Id == assignmentId.Value && a.UserId == userId, ct);
        }
        else
        {
            assignment = await _db.ContractAssignments
                .Include(a => a.FieldValues)
                .Include(a => a.ContractTemplate)
                .Include(a => a.User)
                .ThenInclude(u => u.CaregiverProfile)
                .Include(a => a.AuditLogs)
                .OrderByDescending(a => a.AssignedAt)
                .FirstOrDefaultAsync(a => a.UserId == userId, ct);
        }
        if (assignment == null)
            throw new KeyNotFoundException("قراردادی برای شما یافت نشد.");

        return await BuildDocumentDto(assignment, ct);
    }

    public async Task<ContractDocumentDto> GetAssignmentDocumentAsync(int assignmentId, CancellationToken ct = default)
    {
        var assignment = await _db.ContractAssignments
            .Include(a => a.FieldValues)
            .Include(a => a.ContractTemplate)
            .Include(a => a.User)
            .ThenInclude(u => u.CaregiverProfile)
            .Include(a => a.AuditLogs)
            .FirstOrDefaultAsync(a => a.Id == assignmentId, ct);
        if (assignment == null) throw new KeyNotFoundException();
        return await BuildDocumentDto(assignment, ct);
    }

    private async Task<ContractDocumentDto> BuildDocumentDto(ContractAssignment a, CancellationToken ct)
    {
        var signedLog = a.AuditLogs?.FirstOrDefault(l => l.ActionType == ContractAuditActionType.Signed);
        if (a.Status == ContractStatus.Signed &&
            !string.IsNullOrWhiteSpace(a.SignedSnapshotContractText))
        {
            return new ContractDocumentDto
            {
                AssignmentId = a.Id,
                ContractNumber = a.ContractNumber ?? $"ID-{a.Id}",
                RenderedHtml = a.SignedSnapshotContractText,
                Status = a.Status,
                SignedAt = a.SignedAt,
                ContentHash = a.ContentHash ?? signedLog?.ContentHash,
                TransactionId = signedLog?.TransactionId,
                IsSnapshot = true
            };
        }

        var template = a.ContractTemplate ??
                       await _db.ContractTemplates.FirstAsync(t => t.Id == a.ContractTemplateId, ct);
        var user = a.User ?? await _db.Users.FirstAsync(u => u.Id == a.UserId, ct);
        var cp = user.CaregiverProfile ??
                 await _db.CaregiverProfiles.FirstOrDefaultAsync(x => x.UserId == user.Id, ct);

        var html = _renderer.Render(template.ContractText, a.FieldValues, a, template, user, cp);
        return new ContractDocumentDto
        {
            AssignmentId = a.Id,
            ContractNumber = a.ContractNumber ?? $"ID-{a.Id}",
            RenderedHtml = html,
            Status = a.Status,
            SignedAt = a.SignedAt,
            ContentHash = signedLog?.ContentHash ?? a.ContentHash,
            TransactionId = signedLog?.TransactionId,
            IsSnapshot = false
        };
    }

    public async Task<List<ContractAuditLogDto>> GetAssignmentAuditLogAsync(int assignmentId, CancellationToken ct = default)
    {
        var logs = await _db.ContractSigningAuditLogs
            .AsNoTracking()
            .Include(l => l.User)
            .Where(l => l.AssignmentId == assignmentId)
            .OrderBy(l => l.PerformedAt)
            .ToListAsync(ct);

        return logs.Select(l => new ContractAuditLogDto
        {
            Id = l.Id,
            ActionType = l.ActionType,
            ActionTypeLabel = GetAuditLabel(l.ActionType),
            PerformedAt = l.PerformedAt,
            UserFullName = l.User != null ? $"{l.User.FirstName} {l.User.LastName}".Trim() : null,
            ClientIp = l.ClientIp,
            TransactionId = l.TransactionId,
            ContentHash = l.ContentHash,
            Details = l.DetailsJson
        }).ToList();
    }
}

file static class ContractAssignmentExtensions
{
    public static void UpdatedAtSafe(this ContractAssignment a)
    {
    }
}
