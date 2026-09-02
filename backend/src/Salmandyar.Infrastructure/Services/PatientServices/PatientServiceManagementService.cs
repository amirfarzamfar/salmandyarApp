using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Salmandyar.Application.DTOs.Common;
using Salmandyar.Application.DTOs.PatientServices;
using Salmandyar.Application.Services.Notifications;
using Salmandyar.Application.Services.PatientServices;
using Salmandyar.Domain.Constants;
using Salmandyar.Domain.Entities;
using Salmandyar.Domain.Enums;
using Salmandyar.Infrastructure.Persistence;

namespace Salmandyar.Infrastructure.Services.PatientServices;

public class PatientServiceManagementService : IPatientServiceManagementService
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<User> _userManager;
    private readonly IUserNotificationService _notificationService;

    public PatientServiceManagementService(
        ApplicationDbContext context,
        UserManager<User> userManager,
        IUserNotificationService notificationService)
    {
        _context = context;
        _userManager = userManager;
        _notificationService = notificationService;
    }

    private static TimeZoneInfo IranTz()
    {
        try { return TimeZoneInfo.FindSystemTimeZoneById("Iran Standard Time"); }
        catch { return TimeZoneInfo.FindSystemTimeZoneById("Asia/Tehran"); }
    }

    private static DateTime ToIran(DateTime utc) =>
        TimeZoneInfo.ConvertTimeFromUtc(DateTime.SpecifyKind(utc, DateTimeKind.Utc), IranTz());

    private static int CalculateAge(DateTime dob)
    {
        var today = DateTime.Today;
        var age = today.Year - dob.Year;
        if (dob.Date > today.AddYears(-age)) age--;
        return age;
    }

    private static string GetStatusDisplayName(CareServiceStatus status) => status switch
    {
        CareServiceStatus.Draft => "پیش‌نویس",
        CareServiceStatus.Scheduled => "برنامه‌ریزی‌شده",
        CareServiceStatus.Pending => "در انتظار انجام",
        CareServiceStatus.Assigned => "تخصیص‌یافته",
        CareServiceStatus.Accepted => "پذیرفته‌شده",
        CareServiceStatus.InProgress => "در حال انجام",
        CareServiceStatus.Completed => "تکمیل‌شده",
        CareServiceStatus.Cancelled => "لغوشده",
        CareServiceStatus.NoShow => "عدم حضور",
        CareServiceStatus.Expired => "منقضی‌شده",
        _ => status.ToString()
    };

    private static bool IsValidStatusTransition(CareServiceStatus from, CareServiceStatus to)
    {
        var validTransitions = new Dictionary<CareServiceStatus, List<CareServiceStatus>>
        {
            [CareServiceStatus.Draft] = new() { CareServiceStatus.Scheduled, CareServiceStatus.Cancelled },
            [CareServiceStatus.Scheduled] = new() { CareServiceStatus.Pending, CareServiceStatus.Assigned, CareServiceStatus.Cancelled, CareServiceStatus.Draft },
            [CareServiceStatus.Pending] = new() { CareServiceStatus.Assigned, CareServiceStatus.Cancelled, CareServiceStatus.Scheduled, CareServiceStatus.NoShow },
            [CareServiceStatus.Assigned] = new() { CareServiceStatus.Accepted, CareServiceStatus.Pending, CareServiceStatus.InProgress, CareServiceStatus.Cancelled },
            [CareServiceStatus.Accepted] = new() { CareServiceStatus.InProgress, CareServiceStatus.Pending, CareServiceStatus.Cancelled },
            [CareServiceStatus.InProgress] = new() { CareServiceStatus.Completed, CareServiceStatus.Cancelled, CareServiceStatus.NoShow },
            [CareServiceStatus.Completed] = new() { },
            [CareServiceStatus.Cancelled] = new() { CareServiceStatus.Scheduled },
            [CareServiceStatus.NoShow] = new() { CareServiceStatus.Scheduled },
            [CareServiceStatus.Expired] = new() { CareServiceStatus.Scheduled }
        };

        if (from == to) return true;
        return validTransitions.TryGetValue(from, out var allowed) && allowed.Contains(to);
    }

    private IQueryable<CareService> ApplyFilters(IQueryable<CareService> query, PatientServiceQueryFilters filters)
    {
        if (filters.CareRecipientId.HasValue)
            query = query.Where(s => s.CareRecipientId == filters.CareRecipientId.Value);

        if (filters.ServiceDefinitionId.HasValue)
            query = query.Where(s => s.ServiceDefinitionId == filters.ServiceDefinitionId.Value);

        if (filters.Status.HasValue)
            query = query.Where(s => s.Status == filters.Status.Value);
        else if (filters.Statuses is { Count: > 0 })
            query = query.Where(s => filters.Statuses.Contains(s.Status));

        if (filters.Priority.HasValue)
            query = query.Where(s => s.Priority == filters.Priority.Value);

        if (!string.IsNullOrWhiteSpace(filters.PerformerId))
            query = query.Where(s => s.PerformerId == filters.PerformerId);

        if (filters.AssignmentStatus.HasValue)
            query = query.Where(s => s.AssignmentStatus == filters.AssignmentStatus.Value);

        if (filters.OnlyUnassigned == true)
            query = query.Where(s => s.PerformerId == null);

        if (filters.NotificationStatus.HasValue)
            query = query.Where(s => s.NotificationStatus == filters.NotificationStatus.Value);

        if (filters.OnlyWithNotification == true)
            query = query.Where(s => s.NotificationStatus != ServiceNotificationStatus.NotCreated);

        if (filters.FromDate.HasValue)
            query = query.Where(s => s.ScheduledDate >= filters.FromDate.Value);

        if (filters.ToDate.HasValue)
            query = query.Where(s => s.ScheduledDate <= filters.ToDate.Value);

        if (!string.IsNullOrWhiteSpace(filters.CreatedById))
            query = query.Where(s => s.CreatedById == filters.CreatedById);

        if (!string.IsNullOrWhiteSpace(filters.SearchQuery))
        {
            var search = filters.SearchQuery.Trim().ToLower();
            query = query.Where(s =>
                (s.CareRecipient.FirstName + " " + s.CareRecipient.LastName).ToLower().Contains(search) ||
                s.ServiceDefinition.Title.ToLower().Contains(search) ||
                (s.CustomServiceName != null && s.CustomServiceName.ToLower().Contains(search)) ||
                (s.Description != null && s.Description.ToLower().Contains(search)) ||
                (s.Notes != null && s.Notes.ToLower().Contains(search)) ||
                (s.Performer != null && (s.Performer.FirstName + " " + s.Performer.LastName).ToLower().Contains(search))
            );
        }

        return query;
    }

    public async Task<PagedResponse<PatientServiceListItemDto>> GetPagedServicesAsync(PatientServiceQueryFilters filters)
    {
        var baseQuery = _context.CareServices
            .Include(s => s.CareRecipient)
            .Include(s => s.ServiceDefinition)
            .Include(s => s.Performer)
            .Include(s => s.CreatedBy)
            .AsNoTracking();

        var filtered = ApplyFilters(baseQuery, filters);

        var totalCount = await filtered.CountAsync();

        var sorted = ApplySorting(filtered, filters.SortBy, filters.SortDescending);

        var skip = (filters.PageNumber - 1) * filters.PageSize;
        var items = await sorted
            .Skip(skip)
            .Take(filters.PageSize)
            .Select(s => new PatientServiceListItemDto
            {
                Id = s.Id,
                CareRecipientId = s.CareRecipientId,
                PatientFullName = s.CareRecipient.FirstName + " " + s.CareRecipient.LastName,
                ServiceDefinitionId = s.ServiceDefinitionId,
                ServiceDefinitionTitle = s.ServiceDefinition.Title,
                CustomServiceName = s.CustomServiceName,
                PerformerId = s.PerformerId,
                PerformerFullName = s.Performer != null ? s.Performer.FirstName + " " + s.Performer.LastName : null,
                ScheduledDate = s.ScheduledDate,
                ScheduledStartTime = s.ScheduledStartTime,
                Status = s.Status,
                Priority = s.Priority,
                AssignmentStatus = s.AssignmentStatus,
                NotificationStatus = s.NotificationStatus,
                CreatedByName = s.CreatedBy != null ? s.CreatedBy.FirstName + " " + s.CreatedBy.LastName : "سیستم",
                CreatedAt = s.CreatedAt,
                UpdatedAt = s.UpdatedAt
            })
            .ToListAsync();

        return new PagedResponse<PatientServiceListItemDto>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = filters.PageNumber,
            PageSize = filters.PageSize
        };
    }

    private static IQueryable<CareService> ApplySorting(IQueryable<CareService> query, string? sortBy, bool desc)
    {
        return (sortBy?.ToLower()) switch
        {
            "patient" => desc ? query.OrderByDescending(s => s.CareRecipient.LastName).ThenByDescending(s => s.CareRecipient.FirstName)
                             : query.OrderBy(s => s.CareRecipient.LastName).ThenBy(s => s.CareRecipient.FirstName),
            "servicetype" or "service" => desc ? query.OrderByDescending(s => s.ServiceDefinition.Title) : query.OrderBy(s => s.ServiceDefinition.Title),
            "date" => desc ? query.OrderByDescending(s => s.ScheduledDate).ThenByDescending(s => s.ScheduledStartTime)
                          : query.OrderBy(s => s.ScheduledDate).ThenBy(s => s.ScheduledStartTime),
            "status" => desc ? query.OrderByDescending(s => s.Status) : query.OrderBy(s => s.Status),
            "priority" => desc ? query.OrderByDescending(s => s.Priority) : query.OrderBy(s => s.Priority),
            "provider" => desc ? query.OrderByDescending(s => s.Performer!.LastName) : query.OrderBy(s => s.Performer!.LastName),
            "created" => desc ? query.OrderByDescending(s => s.CreatedAt) : query.OrderBy(s => s.CreatedAt),
            "updated" => desc ? query.OrderByDescending(s => s.UpdatedAt) : query.OrderBy(s => s.UpdatedAt),
            _ => desc ? query.OrderByDescending(s => s.ScheduledDate).ThenByDescending(s => s.ScheduledStartTime)
                     : query.OrderBy(s => s.ScheduledDate).ThenBy(s => s.ScheduledStartTime)
        };
    }

    public async Task<PatientServiceDetailDto?> GetServiceByIdAsync(int id)
    {
        var s = await _context.CareServices
            .Include(sv => sv.CareRecipient)
            .Include(sv => sv.ServiceDefinition)
            .Include(sv => sv.Performer)
            .Include(sv => sv.CreatedBy)
            .Include(sv => sv.UpdatedBy)
            .Include(sv => sv.AssignedBy)
            .Include(sv => sv.ParentSchedule)
            .Include(sv => sv.ActivityLogs).ThenInclude(a => a.ActorUser)
            .Include(sv => sv.AssignmentHistories).ThenInclude(h => h.PreviousProvider)
            .Include(sv => sv.AssignmentHistories).ThenInclude(h => h.NewProvider)
            .Include(sv => sv.AssignmentHistories).ThenInclude(h => h.ChangedBy)
            .Include(sv => sv.Notifications).ThenInclude(n => n.RecipientUser)
            .Include(sv => sv.Notifications).ThenInclude(n => n.CreatedBy)
            .AsNoTracking()
            .FirstOrDefaultAsync(sv => sv.Id == id);

        if (s == null) return null;

        var patientAge = CalculateAge(s.CareRecipient.DateOfBirth);

        return new PatientServiceDetailDto
        {
            Id = s.Id,
            CareRecipientId = s.CareRecipientId,
            PatientFullName = s.CareRecipient.FirstName + " " + s.CareRecipient.LastName,
            PatientAge = patientAge,
            PatientCode = $"P-{s.CareRecipientId:D6}",
            PatientPhone = s.CareRecipient.User != null ? s.CareRecipient.User.PhoneNumber : null,
            PatientStatus = s.CareRecipient.CurrentStatus,
            ServiceDefinitionId = s.ServiceDefinitionId,
            ServiceDefinitionTitle = s.ServiceDefinition.Title,
            ServiceDefinitionCode = s.ServiceDefinition.Code,
            CustomServiceName = s.CustomServiceName,
            PerformerId = s.PerformerId,
            PerformerFullName = s.Performer != null ? s.Performer.FirstName + " " + s.Performer.LastName : null,
            PerformerRole = s.Performer != null ? _userManager.GetRolesAsync(s.Performer).GetAwaiter().GetResult().FirstOrDefault() : null,
            PerformerPhone = s.Performer != null ? s.Performer.PhoneNumber : null,
            AssignedAt = s.AssignedAt,
            AssignedById = s.AssignedById,
            AssignedByName = s.AssignedBy != null ? s.AssignedBy.FirstName + " " + s.AssignedBy.LastName : null,
            ScheduledDate = s.ScheduledDate,
            ScheduledStartTime = s.ScheduledStartTime,
            ScheduledEndTime = s.ScheduledEndTime,
            DurationMinutes = s.DurationMinutes,
            ActualStartTime = s.ActualStartTime,
            ActualEndTime = s.ActualEndTime,
            Status = s.Status,
            Priority = s.Priority,
            LocationType = s.LocationType,
            AssignmentStatus = s.AssignmentStatus,
            Description = s.Description,
            Notes = s.Notes,
            LocationAddress = s.LocationAddress,
            ParentScheduleId = s.ParentScheduleId,
            NotificationStatus = s.NotificationStatus,
            NotificationSentAt = s.NotificationSentAt,
            CreatedById = s.CreatedById,
            CreatedByName = s.CreatedBy != null ? s.CreatedBy.FirstName + " " + s.CreatedBy.LastName : "سیستم",
            UpdatedById = s.UpdatedById,
            UpdatedByName = s.UpdatedBy != null ? s.UpdatedBy.FirstName + " " + s.UpdatedBy.LastName : null,
            CreatedAt = s.CreatedAt,
            UpdatedAt = s.UpdatedAt,
            ParentScheduleDetail = s.ParentSchedule != null ? new ServiceScheduleDto
            {
                Id = s.ParentSchedule.Id,
                CareRecipientId = s.ParentSchedule.CareRecipientId,
                PatientFullName = s.CareRecipient.FirstName + " " + s.CareRecipient.LastName,
                ServiceDefinitionId = s.ParentSchedule.ServiceDefinitionId,
                ServiceDefinitionTitle = s.ParentSchedule.ServiceDefinition?.Title ?? "",
                CustomServiceName = s.ParentSchedule.CustomServiceName,
                StartDate = s.ParentSchedule.StartDate,
                StartTime = s.ParentSchedule.StartTime,
                DurationMinutes = s.ParentSchedule.DurationMinutes,
                RecurrenceType = s.ParentSchedule.RecurrenceType,
                RecurrenceInterval = s.ParentSchedule.RecurrenceInterval,
                OccurrencesCount = s.ParentSchedule.OccurrencesCount,
                EndDate = s.ParentSchedule.EndDate,
                WeekDays = s.ParentSchedule.WeekDays,
                DayOfMonth = s.ParentSchedule.DayOfMonth,
                Priority = s.ParentSchedule.Priority,
                LocationType = s.ParentSchedule.LocationType,
                LocationAddress = s.ParentSchedule.LocationAddress,
                Description = s.ParentSchedule.Description,
                IsActive = s.ParentSchedule.IsActive,
                CreatedByName = s.ParentSchedule.CreatedBy != null ? s.ParentSchedule.CreatedBy.FirstName + " " + s.ParentSchedule.CreatedBy.LastName : "سیستم",
                CreatedAtUtc = s.ParentSchedule.CreatedAtUtc,
                UpdatedAtUtc = s.ParentSchedule.UpdatedAtUtc,
                GeneratedServicesCount = 0
            } : null,
            ActivityLogs = s.ActivityLogs.OrderByDescending(a => a.CreatedAtUtc).Select(a => new ServiceActivityLogDto
            {
                Id = a.Id,
                CareServiceId = a.CareServiceId,
                ActivityType = a.ActivityType,
                Title = a.Title,
                Description = a.Description,
                OldValue = a.OldValue,
                NewValue = a.NewValue,
                ActorUserId = a.ActorUserId,
                ActorName = a.ActorName,
                ActorRole = a.ActorRole,
                CreatedAtUtc = a.CreatedAtUtc
            }).ToList(),
            AssignmentHistories = s.AssignmentHistories.OrderByDescending(h => h.ChangedAtUtc).Select(h => new ServiceAssignmentHistoryDto
            {
                Id = h.Id,
                CareServiceId = h.CareServiceId,
                PreviousProviderId = h.PreviousProviderId,
                PreviousProviderName = h.PreviousProviderName,
                NewProviderId = h.NewProviderId,
                NewProviderName = h.NewProviderName,
                Reason = h.Reason,
                ChangedById = h.ChangedById,
                ChangedByName = h.ChangedByName,
                ChangedAtUtc = h.ChangedAtUtc
            }).ToList(),
            Notifications = s.Notifications.OrderByDescending(n => n.CreatedAtUtc).Select(n => new ServiceNotificationRecordDto
            {
                Id = n.Id,
                CareServiceId = n.CareServiceId,
                Title = n.Title,
                Message = n.Message,
                RecipientType = n.RecipientType,
                RecipientUserId = n.RecipientUserId,
                RecipientDisplayName = n.RecipientDisplayName,
                Channel = n.Channel,
                Status = n.Status,
                ScheduledSendAt = n.ScheduledSendAt,
                SentAt = n.SentAt,
                DeliveredAt = n.DeliveredAt,
                ReadAt = n.ReadAt,
                FailedAt = n.FailedAt,
                ErrorMessage = n.ErrorMessage,
                CreatedById = n.CreatedById,
                CreatedAtUtc = n.CreatedAtUtc
            }).ToList()
        };
    }

    private async Task AddActivityLog(int serviceId, ServiceActivityType type, string title, string description, string userId, string userName, string role, string? oldVal = null, string? newVal = null)
    {
        _context.ServiceActivityLogs.Add(new ServiceActivityLog
        {
            CareServiceId = serviceId,
            ActivityType = type,
            Title = title,
            Description = description,
            OldValue = oldVal,
            NewValue = newVal,
            ActorUserId = userId,
            ActorName = userName,
            ActorRole = role,
            CreatedAtUtc = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();
    }

    private async Task<(string name, string role)> GetUserInfoAsync(string userId)
    {
        var u = await _userManager.FindByIdAsync(userId);
        if (u == null) return ("سیستم", "");
        var name = $"{u.FirstName} {u.LastName}".Trim();
        var roles = await _userManager.GetRolesAsync(u);
        return (string.IsNullOrWhiteSpace(name) ? u.UserName ?? userId : name, roles.FirstOrDefault() ?? "");
    }

    private static TimeSpan? NormalizeTimeSpan(TimeSpan? ts, string? rawString = null)
    {
        if (ts.HasValue) return ts.Value;
        if (string.IsNullOrWhiteSpace(rawString)) return null;
        var clean = rawString.Trim();
        if (TimeSpan.TryParseExact(clean, @"h\:mm", null, out var hm)) return hm;
        if (TimeSpan.TryParseExact(clean, @"hh\:mm", null, out var hhm)) return hhm;
        if (TimeSpan.TryParseExact(clean, @"hh\:mm\:ss", null, out var hms)) return hms;
        if (TimeSpan.TryParse(clean, out var parsed)) return parsed;
        return null;
    }

    private static DateTime NormalizeScheduledDate(DateTime dtoDate, TimeSpan? startTimeUtcNormalized)
    {
        try
        {
            DateTime clean;
            if (dtoDate.Kind == DateTimeKind.Unspecified)
            {
                clean = DateTime.SpecifyKind(dtoDate.Date, DateTimeKind.Utc);
            }
            else
            {
                clean = dtoDate.ToUniversalTime().Date;
            }
            if (startTimeUtcNormalized.HasValue)
            {
                clean = clean.Date + startTimeUtcNormalized.Value;
                clean = DateTime.SpecifyKind(clean, DateTimeKind.Utc);
            }
            return clean;
        }
        catch
        {
            return DateTime.SpecifyKind(dtoDate.Kind == DateTimeKind.Unspecified ? dtoDate : dtoDate.ToUniversalTime(), DateTimeKind.Utc);
        }
    }

    private static (DateTime? start, DateTime? end) BuildLegacyStartEndUtc(DateTime scheduledDateUtc, TimeSpan? startTime, int? durationMinutes)
    {
        DateTime? s = null; DateTime? e = null;
        try
        {
            var baseDate = scheduledDateUtc.Kind == DateTimeKind.Utc ? scheduledDateUtc : scheduledDateUtc.ToUniversalTime();
            if (startTime.HasValue)
            {
                s = baseDate.Date + startTime.Value;
                s = DateTime.SpecifyKind(s.Value, DateTimeKind.Utc);
            }
            else
            {
                s = DateTime.SpecifyKind(baseDate.Date, DateTimeKind.Utc);
            }
            if (durationMinutes.HasValue)
            {
                e = s.Value.AddMinutes(durationMinutes.Value);
            }
        }
        catch { /* ignore */ }
        return (s, e);
    }

    public async Task<PatientServiceDto> CreateServiceAsync(CreatePatientServiceDto dto, string currentUserId)
    {
        var (userName, userRole) = await GetUserInfoAsync(currentUserId);

        var startTimeNorm = NormalizeTimeSpan(dto.ScheduledStartTime);
        var scheduledUtc = NormalizeScheduledDate(dto.ScheduledDate, startTimeNorm);
        var (legacyStart, legacyEnd) = BuildLegacyStartEndUtc(scheduledUtc, startTimeNorm, dto.DurationMinutes);
        var perfdAt = legacyStart ?? scheduledUtc;

        var entity = new CareService
        {
            CareRecipientId = dto.CareRecipientId,
            ServiceDefinitionId = dto.ServiceDefinitionId,
            CustomServiceName = dto.CustomServiceName,
            PerformerId = dto.PerformerId,
            ScheduledDate = scheduledUtc,
            ScheduledStartTime = startTimeNorm,
            ScheduledEndTime = dto.ScheduledEndTime ?? (dto.DurationMinutes.HasValue && startTimeNorm.HasValue ? startTimeNorm.Value.Add(TimeSpan.FromMinutes(dto.DurationMinutes.Value)) : dto.ScheduledEndTime),
            DurationMinutes = dto.DurationMinutes,
            Status = dto.Status,
            Priority = dto.Priority,
            LocationType = dto.LocationType,
            Description = dto.Description,
            Notes = dto.Notes,
            LocationAddress = dto.LocationAddress,
            StartTime = legacyStart,
            EndTime = legacyEnd,
            PerformedAt = perfdAt,
            CreatedById = currentUserId,
            CreatedAt = DateTime.UtcNow
        };

        if (!string.IsNullOrWhiteSpace(dto.PerformerId))
        {
            entity.AssignmentStatus = ServiceAssignmentStatus.Assigned;
            entity.AssignedAt = DateTime.UtcNow;
            entity.AssignedById = currentUserId;
            if (dto.Status == CareServiceStatus.Scheduled || dto.Status == CareServiceStatus.Draft)
                entity.Status = CareServiceStatus.Assigned;
        }
        else
        {
            entity.AssignmentStatus = ServiceAssignmentStatus.Unassigned;
        }

        if (dto.CreateNotification)
        {
            entity.NotificationStatus = ServiceNotificationStatus.Draft;
        }

        _context.CareServices.Add(entity);
        await _context.SaveChangesAsync();

        await AddActivityLog(entity.Id, ServiceActivityType.Created, "خدمت ثبت شد",
            $"خدمت «{(string.IsNullOrWhiteSpace(dto.CustomServiceName) ? "تعریف‌شده" : dto.CustomServiceName)}» برای بیمار ثبت شد.",
            currentUserId, userName, userRole);

        if (!string.IsNullOrWhiteSpace(dto.PerformerId))
        {
            var performer = await _userManager.FindByIdAsync(dto.PerformerId);
            var pName = performer != null ? $"{performer.FirstName} {performer.LastName}" : "نامشخص";
            await AddActivityLog(entity.Id, ServiceActivityType.Assigned, "تخصیص خدمت‌دهنده",
                $"خدمت به «{pName}» تخصیص داده شد.",
                currentUserId, userName, userRole, null, pName);

            _context.ServiceAssignmentHistories.Add(new ServiceAssignmentHistory
            {
                CareServiceId = entity.Id,
                NewProviderId = dto.PerformerId,
                NewProviderName = pName,
                Reason = "تخصیص اولیه در زمان ثبت خدمت",
                ChangedById = currentUserId,
                ChangedByName = userName,
                ChangedAtUtc = DateTime.UtcNow
            });
            await _context.SaveChangesAsync();

            if (dto.CreateNotification && performer != null)
            {
                try
                {
                    var title = string.IsNullOrWhiteSpace(dto.NotificationTitle) ? "خدمت جدید به شما تخصیص داده شد" : dto.NotificationTitle;
                    var msg = string.IsNullOrWhiteSpace(dto.NotificationMessage)
                        ? $"خدمت {entity.ServiceDefinitionId} در تاریخ {ToIran(entity.ScheduledDate):yyyy/MM/dd} به شما تخصیص یافت."
                        : dto.NotificationMessage;
                    await _notificationService.CreateNotificationAsync(performer.Id, title, msg, NotificationType.Reminder,
                        entity.Id.ToString(), $"/dashboard/admin/patient-services/{entity.Id}");
                    entity.NotificationStatus = ServiceNotificationStatus.Sent;
                    entity.NotificationSentAt = DateTime.UtcNow;
                }
                catch { /* ignore notification errors */ }
            }
        }

        if (dto.CreateNotification)
        {
            var recipientType = dto.NotificationRecipientType ?? ServiceNotificationRecipientType.Patient;
            try
            {
                var recipientUserIds = new List<string>();
                var careRecipient = await _context.CareRecipients
                    .AsNoTracking()
                    .Include(cr => cr.User)
                    .FirstOrDefaultAsync(cr => cr.Id == dto.CareRecipientId);

                string? patientUserId = careRecipient?.UserId;
                string? performerUserId = !string.IsNullOrWhiteSpace(dto.PerformerId) ? dto.PerformerId : null;

                switch (recipientType)
                {
                    case ServiceNotificationRecipientType.Patient:
                        if (patientUserId != null) recipientUserIds.Add(patientUserId);
                        break;
                    case ServiceNotificationRecipientType.PatientFamily:
                        if (patientUserId != null) recipientUserIds.Add(patientUserId);
                        break;
                    case ServiceNotificationRecipientType.Nurse:
                    case ServiceNotificationRecipientType.Caregiver:
                        if (performerUserId != null) recipientUserIds.Add(performerUserId);
                        break;
                    case ServiceNotificationRecipientType.Supervisor:
                        var supervisorIds = await _context.UserRoles
                            .Where(ur => ur.RoleId == Roles.Supervisor || ur.RoleId == Roles.Manager || ur.RoleId == Roles.Admin || ur.RoleId == Roles.SuperAdmin)
                            .Select(ur => ur.UserId)
                            .Distinct()
                            .ToListAsync();
                        recipientUserIds.AddRange(supervisorIds);
                        break;
                    case ServiceNotificationRecipientType.All:
                        if (patientUserId != null) recipientUserIds.Add(patientUserId);
                        if (performerUserId != null) recipientUserIds.Add(performerUserId);
                        var allSupervisorIds = await _context.UserRoles
                            .Where(ur => ur.RoleId == Roles.Supervisor || ur.RoleId == Roles.Manager || ur.RoleId == Roles.Admin || ur.RoleId == Roles.SuperAdmin)
                            .Select(ur => ur.UserId)
                            .Distinct()
                            .ToListAsync();
                        recipientUserIds.AddRange(allSupervisorIds);
                        break;
                }

                foreach (var uid in recipientUserIds.Distinct().Where(x => !string.IsNullOrWhiteSpace(x)))
                {
                    try
                    {
                        var title = string.IsNullOrWhiteSpace(dto.NotificationTitle) ? "خدمت جدید ثبت شد" : dto.NotificationTitle;
                        var msg = string.IsNullOrWhiteSpace(dto.NotificationMessage)
                            ? $"خدمت در تاریخ {ToIran(entity.ScheduledDate):yyyy/MM/dd} ساعت {(entity.ScheduledStartTime.HasValue ? entity.ScheduledStartTime.Value.ToString(@"hh\:mm") : "---")} برای شما برنامه‌ریزی شد."
                            : dto.NotificationMessage;
                        await _notificationService.CreateNotificationAsync(uid, title, msg, NotificationType.Reminder,
                            entity.Id.ToString(), $"/dashboard/admin/patient-services/{entity.Id}");
                        if (entity.NotificationStatus != ServiceNotificationStatus.Sent)
                        {
                            entity.NotificationStatus = ServiceNotificationStatus.Sent;
                            entity.NotificationSentAt = DateTime.UtcNow;
                        }
                    }
                    catch { /* ignore individual notification errors */ }
                }

                await _context.SaveChangesAsync();
            }
            catch { /* ignore notification errors */ }
        }

        var result = await GetServiceByIdAsync(entity.Id);
        return result!;
    }

    public async Task<PatientServiceDto?> UpdateServiceAsync(int id, UpdatePatientServiceDto dto, string currentUserId)
    {
        var entity = await _context.CareServices.FindAsync(id);
        if (entity == null) return null;

        var (userName, userRole) = await GetUserInfoAsync(currentUserId);

        var oldStatus = entity.Status;
        var oldDate = entity.ScheduledDate;

        var startTimeNorm = NormalizeTimeSpan(dto.ScheduledStartTime);
        var scheduledUtc = NormalizeScheduledDate(dto.ScheduledDate, startTimeNorm);
        var (legacyStart, legacyEnd) = BuildLegacyStartEndUtc(scheduledUtc, startTimeNorm, dto.DurationMinutes);

        entity.ServiceDefinitionId = dto.ServiceDefinitionId;
        entity.CustomServiceName = dto.CustomServiceName;
        entity.ScheduledDate = scheduledUtc;
        entity.ScheduledStartTime = startTimeNorm;
        entity.ScheduledEndTime = dto.ScheduledEndTime ?? (dto.DurationMinutes.HasValue && startTimeNorm.HasValue ? startTimeNorm.Value.Add(TimeSpan.FromMinutes(dto.DurationMinutes.Value)) : dto.ScheduledEndTime);
        entity.DurationMinutes = dto.DurationMinutes;
        entity.Priority = dto.Priority;
        entity.LocationType = dto.LocationType;
        entity.Description = dto.Description;
        entity.Notes = dto.Notes;
        entity.LocationAddress = dto.LocationAddress;
        entity.StartTime = legacyStart;
        entity.EndTime = legacyEnd;
        entity.PerformedAt = legacyStart ?? scheduledUtc;
        entity.UpdatedById = currentUserId;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var changes = new List<string>();
        if (oldDate.Date != scheduledUtc.Date) changes.Add($"تاریخ از {ToIran(oldDate):yyyy/MM/dd} به {ToIran(scheduledUtc):yyyy/MM/dd}");
        if (oldStatus != entity.Status) changes.Add($"وضعیت تغییر کرد");
        if (changes.Count > 0)
        {
            await AddActivityLog(id, ServiceActivityType.DetailsUpdated, "جزئیات خدمت ویرایش شد",
                string.Join("، ", changes), currentUserId, userName, userRole);
        }

        return await GetServiceByIdAsync(id);
    }

    public async Task<bool> CancelServiceAsync(int id, string reason, string currentUserId)
    {
        var entity = await _context.CareServices.FindAsync(id);
        if (entity == null) return false;

        var (userName, userRole) = await GetUserInfoAsync(currentUserId);
        var oldStatus = entity.Status;

        entity.Status = CareServiceStatus.Cancelled;
        entity.Notes = string.IsNullOrWhiteSpace(entity.Notes)
            ? $"[لغو شده توسط {userName}: {reason}]"
            : $"{entity.Notes}\n\n[لغو شده توسط {userName}: {reason}]";
        entity.UpdatedById = currentUserId;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await AddActivityLog(id, ServiceActivityType.Cancelled, "خدمت لغو شد",
            $"دلیل: {reason}", currentUserId, userName, userRole,
            GetStatusDisplayName(oldStatus), GetStatusDisplayName(CareServiceStatus.Cancelled));

        return true;
    }

    public async Task<bool> DeleteServiceAsync(int id, string currentUserId)
    {
        var entity = await _context.CareServices.FindAsync(id);
        if (entity == null) return false;

        var notifications = await _context.ServiceNotificationRecords
            .Where(n => n.CareServiceId == id).ToListAsync();
        var logs = await _context.ServiceActivityLogs.Where(a => a.CareServiceId == id).ToListAsync();
        var histories = await _context.ServiceAssignmentHistories.Where(h => h.CareServiceId == id).ToListAsync();

        _context.ServiceNotificationRecords.RemoveRange(notifications);
        _context.ServiceActivityLogs.RemoveRange(logs);
        _context.ServiceAssignmentHistories.RemoveRange(histories);
        _context.CareServices.Remove(entity);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<PatientServiceDto?> AssignProviderAsync(int serviceId, AssignServiceProviderDto dto, string currentUserId)
    {
        var entity = await _context.CareServices.FindAsync(serviceId);
        if (entity == null) return null;

        var (userName, userRole) = await GetUserInfoAsync(currentUserId);
        var newProvider = await _userManager.FindByIdAsync(dto.PerformerId);
        if (newProvider == null) return null;

        var newProviderName = $"{newProvider.FirstName} {newProvider.LastName}";

        if (!string.IsNullOrWhiteSpace(entity.PerformerId))
        {
            var prev = await _userManager.FindByIdAsync(entity.PerformerId);
            var prevName = prev != null ? $"{prev.FirstName} {prev.LastName}" : entity.PerformerId;
            _context.ServiceAssignmentHistories.Add(new ServiceAssignmentHistory
            {
                CareServiceId = entity.Id,
                PreviousProviderId = entity.PerformerId,
                PreviousProviderName = prevName,
                NewProviderId = dto.PerformerId,
                NewProviderName = newProviderName,
                Reason = string.IsNullOrWhiteSpace(dto.Reason) ? "تغییر توسط ادمین" : dto.Reason,
                ChangedById = currentUserId,
                ChangedByName = userName,
                ChangedAtUtc = DateTime.UtcNow
            });
            await AddActivityLog(serviceId, ServiceActivityType.ProviderChanged, "خدمت‌دهنده تغییر کرد",
                $"از «{prevName}» به «{newProviderName}»",
                currentUserId, userName, userRole, prevName, newProviderName);
        }
        else
        {
            _context.ServiceAssignmentHistories.Add(new ServiceAssignmentHistory
            {
                CareServiceId = entity.Id,
                NewProviderId = dto.PerformerId,
                NewProviderName = newProviderName,
                Reason = string.IsNullOrWhiteSpace(dto.Reason) ? "تخصیص توسط ادمین" : dto.Reason,
                ChangedById = currentUserId,
                ChangedByName = userName,
                ChangedAtUtc = DateTime.UtcNow
            });
            await AddActivityLog(serviceId, ServiceActivityType.Assigned, "خدمت‌دهنده تخصیص داده شد",
                $"به «{newProviderName}» تخصیص یافت.",
                currentUserId, userName, userRole, null, newProviderName);
        }

        entity.PerformerId = dto.PerformerId;
        entity.AssignedAt = DateTime.UtcNow;
        entity.AssignedById = currentUserId;
        entity.AssignmentStatus = ServiceAssignmentStatus.Assigned;
        if (entity.Status == CareServiceStatus.Draft || entity.Status == CareServiceStatus.Scheduled || entity.Status == CareServiceStatus.Pending)
        {
            entity.Status = CareServiceStatus.Assigned;
        }
        entity.UpdatedById = currentUserId;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        if (dto.SendNotification)
        {
            try
            {
                var title = "خدمت جدید به شما تخصیص داده شد";
                var msg = $"خدمت به شما تخصیص یافت. لطفاً جزئیات را بررسی کنید.";
                await _notificationService.CreateNotificationAsync(newProvider.Id, title, msg,
                    NotificationType.Reminder, entity.Id.ToString(), $"/dashboard/admin/patient-services/{entity.Id}");
                entity.NotificationStatus = ServiceNotificationStatus.Sent;
                entity.NotificationSentAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
            catch { /* ignore */ }
        }

        return await GetServiceByIdAsync(serviceId);
    }

    public async Task<PatientServiceDto?> ChangeProviderAsync(int serviceId, AssignServiceProviderDto dto, string currentUserId)
    {
        return await AssignProviderAsync(serviceId, dto, currentUserId);
    }

    public async Task<PatientServiceDto?> ChangeStatusAsync(int serviceId, ChangeServiceStatusDto dto, string currentUserId)
    {
        var entity = await _context.CareServices.FindAsync(serviceId);
        if (entity == null) return null;

        if (!IsValidStatusTransition(entity.Status, dto.NewStatus))
            throw new InvalidOperationException($"تغییر وضعیت از «{GetStatusDisplayName(entity.Status)}» به «{GetStatusDisplayName(dto.NewStatus)}» مجاز نیست.");

        var (userName, userRole) = await GetUserInfoAsync(currentUserId);
        var oldStatus = entity.Status;

        switch (dto.NewStatus)
        {
            case CareServiceStatus.InProgress:
                entity.ActualStartTime = DateTime.UtcNow;
                break;
            case CareServiceStatus.Completed:
                entity.ActualEndTime = DateTime.UtcNow;
                if (!entity.ActualStartTime.HasValue) entity.ActualStartTime = entity.ActualEndTime;
                break;
        }

        entity.Status = dto.NewStatus;
        if (!string.IsNullOrWhiteSpace(dto.Notes))
        {
            entity.Notes = string.IsNullOrWhiteSpace(entity.Notes)
                ? $"[{GetStatusDisplayName(dto.NewStatus)}: {dto.Notes}]"
                : $"{entity.Notes}\n\n[{GetStatusDisplayName(dto.NewStatus)}: {dto.Notes}]";
        }
        entity.UpdatedById = currentUserId;
        entity.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var actType = dto.NewStatus switch
        {
            CareServiceStatus.InProgress => ServiceActivityType.Started,
            CareServiceStatus.Completed => ServiceActivityType.Completed,
            CareServiceStatus.Cancelled => ServiceActivityType.Cancelled,
            CareServiceStatus.Accepted => ServiceActivityType.Accepted,
            CareServiceStatus.NoShow => ServiceActivityType.NoShow,
            _ => ServiceActivityType.StatusChanged
        };

        await AddActivityLog(serviceId, actType,
            $"وضعیت خدمت تغییر کرد به «{GetStatusDisplayName(dto.NewStatus)}»",
            string.IsNullOrWhiteSpace(dto.Reason) ? GetStatusDisplayName(dto.NewStatus) : dto.Reason,
            currentUserId, userName, userRole,
            GetStatusDisplayName(oldStatus), GetStatusDisplayName(dto.NewStatus));

        return await GetServiceByIdAsync(serviceId);
    }

    public async Task<PatientServiceDto?> StartServiceAsync(int serviceId, string currentUserId)
    {
        return await ChangeStatusAsync(serviceId, new ChangeServiceStatusDto
        {
            NewStatus = CareServiceStatus.InProgress,
            Reason = "شروع خدمت"
        }, currentUserId);
    }

    public async Task<PatientServiceDto?> CompleteServiceAsync(int serviceId, string notes, string currentUserId)
    {
        return await ChangeStatusAsync(serviceId, new ChangeServiceStatusDto
        {
            NewStatus = CareServiceStatus.Completed,
            Notes = notes,
            Reason = "تکمیل خدمت"
        }, currentUserId);
    }

    public async Task<PatientServiceStatisticsDto> GetStatisticsAsync(PatientServiceQueryFilters? filters = null)
    {
        var baseQuery = _context.CareServices.AsNoTracking();
        if (filters != null) baseQuery = ApplyFilters(baseQuery, filters);

        var list = await baseQuery.Select(s => new
        {
            s.Id, s.Status, s.ScheduledDate, s.PerformerId, s.NotificationStatus
        }).ToListAsync();

        var iranToday = ToIran(DateTime.UtcNow).Date;
        var todayUtcStart = iranToday;
        var todayUtcEnd = iranToday.AddDays(1);

        return new PatientServiceStatisticsDto
        {
            TotalServices = list.Count,
            TodayServices = list.Count(s => ToIran(s.ScheduledDate).Date == iranToday),
            PendingServices = list.Count(s => s.Status == CareServiceStatus.Pending || s.Status == CareServiceStatus.Scheduled),
            InProgressServices = list.Count(s => s.Status == CareServiceStatus.InProgress),
            CompletedServices = list.Count(s => s.Status == CareServiceStatus.Completed),
            CancelledServices = list.Count(s => s.Status == CareServiceStatus.Cancelled),
            NoShowServices = list.Count(s => s.Status == CareServiceStatus.NoShow),
            UnassignedServices = list.Count(s => s.PerformerId == null),
            ServicesWithNotification = list.Count(s => s.NotificationStatus != ServiceNotificationStatus.NotCreated),
            AssignedServices = list.Count(s => s.Status == CareServiceStatus.Assigned || s.Status == CareServiceStatus.Accepted),
            ScheduledServices = list.Count(s => s.Status == CareServiceStatus.Scheduled),
            DraftServices = list.Count(s => s.Status == CareServiceStatus.Draft),
            AcceptedServices = list.Count(s => s.Status == CareServiceStatus.Accepted),
            ExpiredServices = list.Count(s => s.Status == CareServiceStatus.Expired)
        };
    }

    public async Task<List<ServiceActivityLogDto>> GetServiceTimelineAsync(int serviceId)
    {
        return await _context.ServiceActivityLogs
            .Where(a => a.CareServiceId == serviceId)
            .OrderByDescending(a => a.CreatedAtUtc)
            .Select(a => new ServiceActivityLogDto
            {
                Id = a.Id,
                CareServiceId = a.CareServiceId,
                ActivityType = a.ActivityType,
                Title = a.Title,
                Description = a.Description,
                OldValue = a.OldValue,
                NewValue = a.NewValue,
                ActorUserId = a.ActorUserId,
                ActorName = a.ActorName,
                ActorRole = a.ActorRole,
                CreatedAtUtc = a.CreatedAtUtc
            })
            .ToListAsync();
    }

    public async Task<ServiceNotificationRecordDto> CreateNotificationAsync(CreateServiceNotificationDto dto, string currentUserId)
    {
        var service = await _context.CareServices.FindAsync(dto.CareServiceId);
        if (service == null) throw new InvalidOperationException("خدمت یافت نشد.");

        var (creatorName, _) = await GetUserInfoAsync(currentUserId);
        var recipientName = dto.RecipientType.ToString();

        string? recipientUserId = null;
        if (dto.RecipientType == ServiceNotificationRecipientType.Nurse || dto.RecipientType == ServiceNotificationRecipientType.Caregiver)
        {
            recipientUserId = service.PerformerId;
            if (service.Performer != null)
                recipientName = $"{service.Performer.FirstName} {service.Performer.LastName}";
        }
        else if (dto.RecipientType == ServiceNotificationRecipientType.Patient || dto.RecipientType == ServiceNotificationRecipientType.PatientFamily)
        {
            var patient = await _context.CareRecipients
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Id == service.CareRecipientId);
            if (patient?.UserId != null)
            {
                recipientUserId = patient.UserId;
                recipientName = $"{patient.FirstName} {patient.LastName}";
            }
            else
            {
                recipientName = $"{patient?.FirstName} {patient?.LastName}";
            }
        }

        var record = new ServiceNotificationRecord
        {
            CareServiceId = dto.CareServiceId,
            Title = dto.Title,
            Message = dto.Message,
            RecipientType = dto.RecipientType,
            RecipientUserId = recipientUserId,
            RecipientDisplayName = recipientName,
            Channel = dto.Channel,
            Status = dto.ScheduledSendAt.HasValue ? ServiceNotificationStatus.Scheduled : ServiceNotificationStatus.Draft,
            ScheduledSendAt = dto.ScheduledSendAt?.ToUniversalTime(),
            CreatedById = currentUserId,
            CreatedAtUtc = DateTime.UtcNow
        };

        if (dto.Channel == ServiceNotificationChannel.InApp && !string.IsNullOrWhiteSpace(recipientUserId))
        {
            try
            {
                await _notificationService.CreateNotificationAsync(recipientUserId, dto.Title, dto.Message,
                    NotificationType.Reminder, service.Id.ToString(), $"/dashboard/admin/patient-services/{service.Id}");
                record.Status = ServiceNotificationStatus.Sent;
                record.SentAt = DateTime.UtcNow;
                record.DeliveredAt = DateTime.UtcNow;
            }
            catch (Exception ex)
            {
                record.Status = ServiceNotificationStatus.Failed;
                record.FailedAt = DateTime.UtcNow;
                record.ErrorMessage = ex.Message;
            }
        }

        _context.ServiceNotificationRecords.Add(record);

        if (service.NotificationStatus == ServiceNotificationStatus.NotCreated)
        {
            service.NotificationStatus = record.Status;
            service.NotificationSentAt = record.SentAt;
        }
        else if (record.Status == ServiceNotificationStatus.Sent)
        {
            service.NotificationStatus = ServiceNotificationStatus.Sent;
            service.NotificationSentAt = record.SentAt;
        }

        await _context.SaveChangesAsync();

        var (userName, userRole) = await GetUserInfoAsync(currentUserId);
        await AddActivityLog(dto.CareServiceId, ServiceActivityType.NotificationSent, "اعلان ارسال شد",
            $"«{dto.Title}» به {recipientName} از طریق {dto.Channel}",
            currentUserId, userName, userRole);

        return new ServiceNotificationRecordDto
        {
            Id = record.Id,
            CareServiceId = record.CareServiceId,
            Title = record.Title,
            Message = record.Message,
            RecipientType = record.RecipientType,
            RecipientUserId = record.RecipientUserId,
            RecipientDisplayName = record.RecipientDisplayName,
            Channel = record.Channel,
            Status = record.Status,
            ScheduledSendAt = record.ScheduledSendAt,
            SentAt = record.SentAt,
            DeliveredAt = record.DeliveredAt,
            ReadAt = record.ReadAt,
            FailedAt = record.FailedAt,
            ErrorMessage = record.ErrorMessage,
            CreatedById = record.CreatedById,
            CreatedAtUtc = record.CreatedAtUtc
        };
    }

    public async Task<List<ServiceNotificationRecordDto>> GetServiceNotificationsAsync(int serviceId)
    {
        return await _context.ServiceNotificationRecords
            .Where(n => n.CareServiceId == serviceId)
            .OrderByDescending(n => n.CreatedAtUtc)
            .Select(n => new ServiceNotificationRecordDto
            {
                Id = n.Id,
                CareServiceId = n.CareServiceId,
                Title = n.Title,
                Message = n.Message,
                RecipientType = n.RecipientType,
                RecipientUserId = n.RecipientUserId,
                RecipientDisplayName = n.RecipientDisplayName,
                Channel = n.Channel,
                Status = n.Status,
                ScheduledSendAt = n.ScheduledSendAt,
                SentAt = n.SentAt,
                DeliveredAt = n.DeliveredAt,
                ReadAt = n.ReadAt,
                FailedAt = n.FailedAt,
                ErrorMessage = n.ErrorMessage,
                CreatedById = n.CreatedById,
                CreatedAtUtc = n.CreatedAtUtc
            })
            .ToListAsync();
    }

    public async Task<ServiceScheduleDto> CreateScheduleAsync(CreateServiceScheduleDto dto, string currentUserId)
    {
        var (userName, _) = await GetUserInfoAsync(currentUserId);

        var schedule = new ServiceSchedule
        {
            CareRecipientId = dto.CareRecipientId,
            ServiceDefinitionId = dto.ServiceDefinitionId,
            CustomServiceName = dto.CustomServiceName,
            StartDate = dto.StartDate.ToUniversalTime(),
            StartTime = dto.StartTime,
            DurationMinutes = dto.DurationMinutes,
            RecurrenceType = dto.RecurrenceType,
            RecurrenceInterval = dto.RecurrenceInterval,
            OccurrencesCount = dto.OccurrencesCount,
            EndDate = dto.EndDate?.ToUniversalTime(),
            WeekDays = dto.WeekDays,
            DayOfMonth = dto.DayOfMonth,
            Priority = dto.Priority,
            LocationType = dto.LocationType,
            LocationAddress = dto.LocationAddress,
            Description = dto.Description,
            IsActive = true,
            CreatedById = currentUserId,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.ServiceSchedules.Add(schedule);
        await _context.SaveChangesAsync();

        var generated = new List<CareService>();
        if (dto.RecurrenceType != ServiceRecurrenceType.None)
        {
            var generatedServices = GenerateScheduleOccurrences(schedule, dto.OccurrencesCount ?? 30);
            foreach (var s in generatedServices)
            {
                s.ParentScheduleId = schedule.Id;
                s.CreatedById = currentUserId;
                _context.CareServices.Add(s);
                generated.Add(s);
            }
            await _context.SaveChangesAsync();
        }

        var patient = await _context.CareRecipients.FindAsync(dto.CareRecipientId);
        var svcDef = await _context.ServiceDefinitions.FindAsync(dto.ServiceDefinitionId);

        return new ServiceScheduleDto
        {
            Id = schedule.Id,
            CareRecipientId = schedule.CareRecipientId,
            PatientFullName = patient != null ? $"{patient.FirstName} {patient.LastName}" : "",
            ServiceDefinitionId = schedule.ServiceDefinitionId,
            ServiceDefinitionTitle = svcDef?.Title ?? "",
            CustomServiceName = schedule.CustomServiceName,
            StartDate = schedule.StartDate,
            StartTime = schedule.StartTime,
            DurationMinutes = schedule.DurationMinutes,
            RecurrenceType = schedule.RecurrenceType,
            RecurrenceInterval = schedule.RecurrenceInterval,
            OccurrencesCount = schedule.OccurrencesCount,
            EndDate = schedule.EndDate,
            WeekDays = schedule.WeekDays,
            DayOfMonth = schedule.DayOfMonth,
            Priority = schedule.Priority,
            LocationType = schedule.LocationType,
            LocationAddress = schedule.LocationAddress,
            Description = schedule.Description,
            IsActive = schedule.IsActive,
            CreatedByName = userName,
            CreatedAtUtc = schedule.CreatedAtUtc,
            UpdatedAtUtc = schedule.UpdatedAtUtc,
            GeneratedServicesCount = generated.Count
        };
    }

    private List<CareService> GenerateScheduleOccurrences(ServiceSchedule schedule, int maxOccurrences)
    {
        var results = new List<CareService>();
        var startDate = ToIran(schedule.StartDate).Date;
        var current = startDate;
        var occurrences = 0;

        var endDateLimit = schedule.EndDate.HasValue
            ? ToIran(schedule.EndDate.Value).Date
            : startDate.AddMonths(6);

        while (occurrences < maxOccurrences && current <= endDateLimit)
        {
            var isMatch = schedule.RecurrenceType switch
            {
                ServiceRecurrenceType.Daily => true,
                ServiceRecurrenceType.Weekly => IsWeeklyMatch(current, schedule),
                ServiceRecurrenceType.Monthly => schedule.DayOfMonth.HasValue && current.Day == schedule.DayOfMonth.Value,
                _ => occurrences == 0
            };

            if (isMatch)
            {
                var interval = schedule.RecurrenceInterval ?? 1;
                if (occurrences == 0 || interval == 1 || occurrences % interval == 0)
                {
                    results.Add(new CareService
                    {
                        CareRecipientId = schedule.CareRecipientId,
                        ServiceDefinitionId = schedule.ServiceDefinitionId,
                        CustomServiceName = schedule.CustomServiceName,
                        ScheduledDate = current.ToUniversalTime(),
                        ScheduledStartTime = schedule.StartTime,
                        DurationMinutes = schedule.DurationMinutes,
                        Status = CareServiceStatus.Scheduled,
                        Priority = schedule.Priority,
                        LocationType = schedule.LocationType,
                        AssignmentStatus = ServiceAssignmentStatus.Unassigned,
                        Description = schedule.Description,
                        LocationAddress = schedule.LocationAddress,
                        CreatedAt = DateTime.UtcNow
                    });
                    occurrences++;
                }
            }

            if (schedule.RecurrenceType == ServiceRecurrenceType.None) break;
            current = current.AddDays(1);
        }

        return results;
    }

    private static bool IsWeeklyMatch(DateTime date, ServiceSchedule schedule)
    {
        if (schedule.WeekDays == null || schedule.WeekDays.Count == 0) return true;
        var dayOfWeek = ((int)date.DayOfWeek + 6) % 7; // Convert to persian: Saturday=0
        return schedule.WeekDays.Contains(dayOfWeek.ToString());
    }

    public async Task<List<ServiceScheduleDto>> GetActiveSchedulesAsync(int? careRecipientId = null)
    {
        var query = _context.ServiceSchedules
            .Include(s => s.CareRecipient)
            .Include(s => s.ServiceDefinition)
            .Include(s => s.CreatedBy)
            .AsNoTracking();

        if (careRecipientId.HasValue)
            query = query.Where(s => s.CareRecipientId == careRecipientId.Value);

        return await query
            .OrderByDescending(s => s.CreatedAtUtc)
            .Select(s => new ServiceScheduleDto
            {
                Id = s.Id,
                CareRecipientId = s.CareRecipientId,
                PatientFullName = s.CareRecipient.FirstName + " " + s.CareRecipient.LastName,
                ServiceDefinitionId = s.ServiceDefinitionId,
                ServiceDefinitionTitle = s.ServiceDefinition.Title,
                CustomServiceName = s.CustomServiceName,
                StartDate = s.StartDate,
                StartTime = s.StartTime,
                DurationMinutes = s.DurationMinutes,
                RecurrenceType = s.RecurrenceType,
                RecurrenceInterval = s.RecurrenceInterval,
                OccurrencesCount = s.OccurrencesCount,
                EndDate = s.EndDate,
                WeekDays = s.WeekDays,
                DayOfMonth = s.DayOfMonth,
                Priority = s.Priority,
                LocationType = s.LocationType,
                LocationAddress = s.LocationAddress,
                Description = s.Description,
                IsActive = s.IsActive,
                CreatedByName = s.CreatedBy != null ? s.CreatedBy.FirstName + " " + s.CreatedBy.LastName : "سیستم",
                CreatedAtUtc = s.CreatedAtUtc,
                UpdatedAtUtc = s.UpdatedAtUtc,
                GeneratedServicesCount = s.GeneratedServices.Count
            })
            .ToListAsync();
    }

    public async Task<bool> ToggleScheduleActiveAsync(int scheduleId, bool isActive, string currentUserId)
    {
        var schedule = await _context.ServiceSchedules.FindAsync(scheduleId);
        if (schedule == null) return false;
        schedule.IsActive = isActive;
        schedule.UpdatedById = currentUserId;
        schedule.UpdatedAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<PatientServiceDto>> GenerateServicesFromScheduleAsync(int scheduleId, string currentUserId)
    {
        var schedule = await _context.ServiceSchedules.FindAsync(scheduleId);
        if (schedule == null) return new List<PatientServiceDto>();

        var generated = GenerateScheduleOccurrences(schedule, schedule.OccurrencesCount ?? 30);
        var result = new List<PatientServiceDto>();

        foreach (var s in generated)
        {
            var duplicate = await _context.CareServices.AnyAsync(c =>
                c.ParentScheduleId == scheduleId &&
                c.CareRecipientId == s.CareRecipientId &&
                c.ScheduledDate == s.ScheduledDate &&
                c.ScheduledStartTime == s.ScheduledStartTime);
            if (duplicate) continue;

            s.ParentScheduleId = scheduleId;
            s.CreatedById = currentUserId;
            _context.CareServices.Add(s);
            await _context.SaveChangesAsync();

            var dto = await GetServiceByIdAsync(s.Id);
            if (dto != null) result.Add(dto);
        }

        return result;
    }

    public async Task<List<ProviderAvailabilityDto>> GetAvailableProvidersAsync(int serviceDefinitionId, DateTime scheduledDate, TimeSpan? startTime, int? durationMinutes, int? currentServiceId = null)
    {
        var startOfDay = scheduledDate.Date.ToUniversalTime();
        var endOfDay = scheduledDate.Date.AddDays(1).ToUniversalTime();

        var careProviderRoleIds = new[]
        {
            Roles.Nurse, Roles.AssistantNurse, Roles.Physiotherapist, Roles.ElderlyCareAssistant
        };

        var careProviders = new List<(User User, string Role)>();

        foreach (var role in careProviderRoleIds)
        {
            var usersInRole = await _userManager.GetUsersInRoleAsync(role);
            careProviders.AddRange(usersInRole.Select(u => (u, role)));
        }

        var uniqueProviderIds = careProviders.Select(x => x.User.Id).Distinct().ToList();
        var userRoleMap = careProviders.GroupBy(x => x.User.Id).ToDictionary(g => g.Key, g => g.First().Role);

        var todayServicesByProvider = await _context.CareServices
            .Where(s =>
                s.PerformerId != null &&
                uniqueProviderIds.Contains(s.PerformerId) &&
                s.ScheduledDate >= startOfDay &&
                s.ScheduledDate < endOfDay &&
                s.Status != CareServiceStatus.Cancelled &&
                (!currentServiceId.HasValue || s.Id != currentServiceId.Value))
            .GroupBy(s => s.PerformerId)
            .Select(g => new
            {
                ProviderId = g.Key!,
                TodayCount = g.Count(),
                InProgressCount = g.Count(x => x.Status == CareServiceStatus.InProgress),
                Services = g.ToList()
            })
            .ToDictionaryAsync(g => g.ProviderId);

        var results = new List<ProviderAvailabilityDto>();
        foreach (var (userId, role) in careProviders.GroupBy(x => x.User.Id).Select(g => (g.Key, g.First().Role)))
        {
            var user = careProviders.First(x => x.User.Id == userId).User;

            var todayData = todayServicesByProvider.TryGetValue(userId, out var td) ? td : null;

            var hasConflict = false;
            var conflictDesc = "";
            if (startTime.HasValue && durationMinutes.HasValue && todayData != null)
            {
                var startDT = scheduledDate.Date.Add(startTime.Value);
                var endDT = startDT.AddMinutes(durationMinutes.Value);

                foreach (var s in todayData.Services)
                {
                    if (s.ScheduledStartTime == null) continue;
                    var sStart = ToIran(s.ScheduledDate).Date.Add(s.ScheduledStartTime.Value);
                    var sEnd = sStart.AddMinutes(s.DurationMinutes ?? 60);
                    if (startDT < sEnd && endDT > sStart)
                    {
                        hasConflict = true;
                        conflictDesc = $"تداخل زمانی با خدمت در ساعت {sStart:HH:mm} تا {sEnd:HH:mm}";
                        break;
                    }
                }
            }

            results.Add(new ProviderAvailabilityDto
            {
                UserId = userId,
                FullName = $"{user.FirstName} {user.LastName}",
                Role = role,
                PhoneNumber = user.PhoneNumber,
                IsOnline = true,
                TodayServicesCount = todayData?.TodayCount ?? 0,
                InProgressServicesCount = todayData?.InProgressCount ?? 0,
                CoverageArea = null,
                HasConflict = hasConflict,
                ConflictDescription = conflictDesc
            });
        }

        return results.OrderBy(r => r.HasConflict).ThenBy(r => r.TodayServicesCount).ThenBy(r => r.FullName).ToList();
    }

    public async Task<BulkServiceActionResult> BulkAssignAsync(BulkServiceActionDto dto, string currentUserId)
    {
        var result = new BulkServiceActionResult { TotalProcessed = dto.ServiceIds.Count };
        foreach (var sid in dto.ServiceIds)
        {
            try
            {
                await AssignProviderAsync(sid, new AssignServiceProviderDto
                {
                    PerformerId = dto.PerformerId!,
                    Reason = "عملیات گروهی",
                    SendNotification = true
                }, currentUserId);
                result.Succeeded++;
            }
            catch (Exception ex)
            {
                result.Failed++;
                result.ErrorMessages.Add($"خدمت {sid}: {ex.Message}");
            }
        }
        return result;
    }

    public async Task<BulkServiceActionResult> BulkChangeStatusAsync(BulkServiceActionDto dto, string currentUserId)
    {
        var result = new BulkServiceActionResult { TotalProcessed = dto.ServiceIds.Count };
        if (!dto.NewStatus.HasValue) return result;
        foreach (var sid in dto.ServiceIds)
        {
            try
            {
                await ChangeStatusAsync(sid, new ChangeServiceStatusDto
                {
                    NewStatus = dto.NewStatus.Value,
                    Reason = "عملیات گروهی"
                }, currentUserId);
                result.Succeeded++;
            }
            catch (Exception ex)
            {
                result.Failed++;
                result.ErrorMessages.Add($"خدمت {sid}: {ex.Message}");
            }
        }
        return result;
    }

    public async Task<BulkServiceActionResult> BulkCancelAsync(BulkServiceActionDto dto, string currentUserId)
    {
        var result = new BulkServiceActionResult { TotalProcessed = dto.ServiceIds.Count };
        foreach (var sid in dto.ServiceIds)
        {
            try
            {
                await CancelServiceAsync(sid, dto.CancelReason ?? "لغو گروهی توسط ادمین", currentUserId);
                result.Succeeded++;
            }
            catch (Exception ex)
            {
                result.Failed++;
                result.ErrorMessages.Add($"خدمت {sid}: {ex.Message}");
            }
        }
        return result;
    }

    public async Task<BulkServiceActionResult> BulkSendNotificationAsync(BulkServiceActionDto dto, string currentUserId)
    {
        var result = new BulkServiceActionResult { TotalProcessed = dto.ServiceIds.Count };
        if (string.IsNullOrWhiteSpace(dto.NotificationTitle) || string.IsNullOrWhiteSpace(dto.NotificationMessage))
        {
            result.ErrorMessages.Add("عنوان و پیام اعلان باید مشخص باشد.");
            return result;
        }
        foreach (var sid in dto.ServiceIds)
        {
            try
            {
                await CreateNotificationAsync(new CreateServiceNotificationDto
                {
                    CareServiceId = sid,
                    Title = dto.NotificationTitle,
                    Message = dto.NotificationMessage,
                    RecipientType = ServiceNotificationRecipientType.Nurse,
                    Channel = ServiceNotificationChannel.InApp
                }, currentUserId);
                result.Succeeded++;
            }
            catch (Exception ex)
            {
                result.Failed++;
                result.ErrorMessages.Add($"خدمت {sid}: {ex.Message}");
            }
        }
        return result;
    }

    public async Task<BulkServiceActionResult> BulkRescheduleAsync(BulkServiceActionDto dto, string currentUserId)
    {
        var result = new BulkServiceActionResult { TotalProcessed = dto.ServiceIds.Count };
        foreach (var sid in dto.ServiceIds)
        {
            try
            {
                var svc = await _context.CareServices.FindAsync(sid);
                if (svc == null) throw new InvalidOperationException("خدمت یافت نشد.");
                if (dto.NewScheduledDate.HasValue) svc.ScheduledDate = dto.NewScheduledDate.Value.ToUniversalTime();
                if (dto.NewScheduledTime.HasValue) svc.ScheduledStartTime = dto.NewScheduledTime.Value;
                svc.UpdatedById = currentUserId;
                svc.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                var (userName, userRole) = await GetUserInfoAsync(currentUserId);
                await AddActivityLog(sid, ServiceActivityType.ScheduleUpdated, "برنامه خدمت تغییر کرد",
                    "به دلیل عملیات گروهی", currentUserId, userName, userRole);

                result.Succeeded++;
            }
            catch (Exception ex)
            {
                result.Failed++;
                result.ErrorMessages.Add($"خدمت {sid}: {ex.Message}");
            }
        }
        return result;
    }

    public async Task<List<CalendarEventDto>> GetCalendarEventsAsync(DateTime fromDate, DateTime toDate, PatientServiceQueryFilters? filters = null)
    {
        var baseQuery = _context.CareServices
            .Include(s => s.CareRecipient)
            .Include(s => s.ServiceDefinition)
            .Include(s => s.Performer)
            .AsNoTracking()
            .Where(s => s.ScheduledDate >= fromDate && s.ScheduledDate <= toDate);

        if (filters != null) baseQuery = ApplyFilters(baseQuery, filters);

        return await baseQuery.Select(s => new
        {
            s.Id,
            ServiceTitle = s.CustomServiceName ?? s.ServiceDefinition.Title,
            PatientName = s.CareRecipient.FirstName + " " + s.CareRecipient.LastName,
            ProviderName = s.Performer != null ? s.Performer.FirstName + " " + s.Performer.LastName : null,
            s.ScheduledDate,
            s.ScheduledStartTime,
            s.DurationMinutes,
            s.Status,
            s.Priority
        }).ToListAsync().ContinueWith(t => t.Result.Select(s =>
        {
            var startDT = s.ScheduledStartTime.HasValue
                ? ToIran(s.ScheduledDate).Date.Add(s.ScheduledStartTime.Value)
                : ToIran(s.ScheduledDate).Date.AddHours(9);
            var duration = s.DurationMinutes ?? 60;
            var color = s.Status switch
            {
                CareServiceStatus.InProgress => "bg-blue-500",
                CareServiceStatus.Completed => "bg-green-500",
                CareServiceStatus.Cancelled => "bg-red-500",
                CareServiceStatus.NoShow => "bg-gray-500",
                CareServiceStatus.Assigned or CareServiceStatus.Accepted => "bg-indigo-500",
                CareServiceStatus.Expired => "bg-amber-700",
                _ => s.Priority == ServicePriority.Urgent ? "bg-red-400"
                     : s.Priority == ServicePriority.Important ? "bg-amber-500" : "bg-teal-500"
            };
            return new CalendarEventDto
            {
                Id = s.Id,
                Title = $"{s.ServiceTitle} - {s.PatientName}{(s.ProviderName != null ? $" ({s.ProviderName})" : "")}",
                Start = startDT,
                End = startDT.AddMinutes(duration),
                Status = s.Status,
                Priority = s.Priority,
                PatientName = s.PatientName,
                ProviderName = s.ProviderName,
                ColorClass = color
            };
        }).ToList());
    }
}
