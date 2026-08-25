using Salmandyar.Domain.Entities;

namespace Salmandyar.Application.DTOs.PatientServices;

public class PatientServiceDto
{
    public int Id { get; set; }
    public int CareRecipientId { get; set; }
    public string PatientFullName { get; set; } = string.Empty;
    public string? PatientAvatar { get; set; }
    public string? PatientCode { get; set; }
    public string? PatientPhone { get; set; }
    public int PatientAge { get; set; }
    public string PatientStatus { get; set; } = "Stable";

    public int ServiceDefinitionId { get; set; }
    public string ServiceDefinitionTitle { get; set; } = string.Empty;
    public string ServiceDefinitionCode { get; set; } = string.Empty;
    public string? CustomServiceName { get; set; }

    public string? PerformerId { get; set; }
    public string? PerformerFullName { get; set; }
    public string? PerformerRole { get; set; }
    public string? PerformerPhone { get; set; }

    public DateTime? AssignedAt { get; set; }
    public string? AssignedById { get; set; }
    public string? AssignedByName { get; set; }

    public DateTime ScheduledDate { get; set; }
    public TimeSpan? ScheduledStartTime { get; set; }
    public TimeSpan? ScheduledEndTime { get; set; }
    public int? DurationMinutes { get; set; }

    public DateTime? ActualStartTime { get; set; }
    public DateTime? ActualEndTime { get; set; }

    public CareServiceStatus Status { get; set; }
    public ServicePriority Priority { get; set; }
    public ServiceLocationType LocationType { get; set; }
    public ServiceAssignmentStatus AssignmentStatus { get; set; }

    public string Description { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public string? LocationAddress { get; set; }

    public int? ParentScheduleId { get; set; }

    public ServiceNotificationStatus NotificationStatus { get; set; }
    public DateTime? NotificationSentAt { get; set; }

    public string CreatedById { get; set; } = string.Empty;
    public string CreatedByName { get; set; } = string.Empty;
    public string? UpdatedById { get; set; }
    public string? UpdatedByName { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public bool HasNotification => NotificationStatus != ServiceNotificationStatus.NotCreated;
    public bool IsUnassigned => string.IsNullOrWhiteSpace(PerformerId);
}

public class PatientServiceListItemDto
{
    public int Id { get; set; }
    public int CareRecipientId { get; set; }
    public string PatientFullName { get; set; } = string.Empty;
    public string? PatientAvatar { get; set; }

    public int ServiceDefinitionId { get; set; }
    public string ServiceDefinitionTitle { get; set; } = string.Empty;
    public string? CustomServiceName { get; set; }

    public string? PerformerId { get; set; }
    public string? PerformerFullName { get; set; }

    public DateTime ScheduledDate { get; set; }
    public TimeSpan? ScheduledStartTime { get; set; }

    public CareServiceStatus Status { get; set; }
    public ServicePriority Priority { get; set; }
    public ServiceAssignmentStatus AssignmentStatus { get; set; }
    public ServiceNotificationStatus NotificationStatus { get; set; }

    public string CreatedByName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public string ServiceTitle => !string.IsNullOrWhiteSpace(CustomServiceName) ? CustomServiceName : ServiceDefinitionTitle;
    public bool IsUnassigned => string.IsNullOrWhiteSpace(PerformerId);
    public bool HasNotification => NotificationStatus != ServiceNotificationStatus.NotCreated;
}

public class PatientServiceDetailDto : PatientServiceDto
{
    public List<ServiceActivityLogDto> ActivityLogs { get; set; } = new();
    public List<ServiceAssignmentHistoryDto> AssignmentHistories { get; set; } = new();
    public List<ServiceNotificationRecordDto> Notifications { get; set; } = new();
    public ServiceScheduleDto? ParentScheduleDetail { get; set; }
}

public class CreatePatientServiceDto
{
    public int CareRecipientId { get; set; }
    public int ServiceDefinitionId { get; set; }
    public string? CustomServiceName { get; set; }
    public string? PerformerId { get; set; }

    public DateTime ScheduledDate { get; set; }
    public TimeSpan? ScheduledStartTime { get; set; }
    public TimeSpan? ScheduledEndTime { get; set; }
    public int? DurationMinutes { get; set; }

    public CareServiceStatus Status { get; set; } = CareServiceStatus.Scheduled;
    public ServicePriority Priority { get; set; } = ServicePriority.Normal;
    public ServiceLocationType LocationType { get; set; } = ServiceLocationType.PatientHome;

    public string Description { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public string? LocationAddress { get; set; }

    public bool CreateNotification { get; set; } = false;
    public string? NotificationTitle { get; set; }
    public string? NotificationMessage { get; set; }
    public ServiceNotificationRecipientType? NotificationRecipientType { get; set; }
}

public class UpdatePatientServiceDto
{
    public int ServiceDefinitionId { get; set; }
    public string? CustomServiceName { get; set; }

    public DateTime ScheduledDate { get; set; }
    public TimeSpan? ScheduledStartTime { get; set; }
    public TimeSpan? ScheduledEndTime { get; set; }
    public int? DurationMinutes { get; set; }

    public ServicePriority Priority { get; set; }
    public ServiceLocationType LocationType { get; set; }

    public string Description { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public string? LocationAddress { get; set; }
}

public class AssignServiceProviderDto
{
    public string PerformerId { get; set; } = string.Empty;
    public string? Reason { get; set; }
    public bool SendNotification { get; set; } = true;
}

public class ChangeServiceStatusDto
{
    public CareServiceStatus NewStatus { get; set; }
    public string? Reason { get; set; }
    public string? Notes { get; set; }
}

public class CreateServiceScheduleDto
{
    public int CareRecipientId { get; set; }
    public int ServiceDefinitionId { get; set; }
    public string? CustomServiceName { get; set; }

    public DateTime StartDate { get; set; }
    public TimeSpan StartTime { get; set; }
    public int DurationMinutes { get; set; } = 60;

    public ServiceRecurrenceType RecurrenceType { get; set; } = ServiceRecurrenceType.None;
    public int? RecurrenceInterval { get; set; }
    public int? OccurrencesCount { get; set; }
    public DateTime? EndDate { get; set; }

    public List<string>? WeekDays { get; set; }
    public int? DayOfMonth { get; set; }

    public ServicePriority Priority { get; set; } = ServicePriority.Normal;
    public ServiceLocationType LocationType { get; set; } = ServiceLocationType.PatientHome;
    public string? LocationAddress { get; set; }
    public string Description { get; set; } = string.Empty;

    public bool AutoAssignAvailable { get; set; } = false;
    public bool CreateNotifications { get; set; } = false;
}

public class ServiceScheduleDto
{
    public int Id { get; set; }
    public int CareRecipientId { get; set; }
    public string PatientFullName { get; set; } = string.Empty;
    public int ServiceDefinitionId { get; set; }
    public string ServiceDefinitionTitle { get; set; } = string.Empty;
    public string? CustomServiceName { get; set; }

    public DateTime StartDate { get; set; }
    public TimeSpan StartTime { get; set; }
    public int DurationMinutes { get; set; }

    public ServiceRecurrenceType RecurrenceType { get; set; }
    public int? RecurrenceInterval { get; set; }
    public int? OccurrencesCount { get; set; }
    public DateTime? EndDate { get; set; }

    public List<string>? WeekDays { get; set; }
    public int? DayOfMonth { get; set; }

    public ServicePriority Priority { get; set; }
    public ServiceLocationType LocationType { get; set; }
    public string? LocationAddress { get; set; }
    public string Description { get; set; } = string.Empty;

    public bool IsActive { get; set; }
    public string CreatedByName { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? UpdatedAtUtc { get; set; }

    public int GeneratedServicesCount { get; set; }
}

public class ServiceActivityLogDto
{
    public int Id { get; set; }
    public int CareServiceId { get; set; }
    public ServiceActivityType ActivityType { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
    public string? ActorUserId { get; set; }
    public string ActorName { get; set; } = string.Empty;
    public string ActorRole { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
}

public class ServiceAssignmentHistoryDto
{
    public int Id { get; set; }
    public int CareServiceId { get; set; }
    public string? PreviousProviderId { get; set; }
    public string? PreviousProviderName { get; set; }
    public string? NewProviderId { get; set; }
    public string? NewProviderName { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? ChangedById { get; set; }
    public string ChangedByName { get; set; } = string.Empty;
    public DateTime ChangedAtUtc { get; set; }
}

public class ServiceNotificationRecordDto
{
    public int Id { get; set; }
    public int CareServiceId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public ServiceNotificationRecipientType RecipientType { get; set; }
    public string? RecipientUserId { get; set; }
    public string RecipientDisplayName { get; set; } = string.Empty;
    public ServiceNotificationChannel Channel { get; set; }
    public ServiceNotificationStatus Status { get; set; }
    public DateTime? ScheduledSendAt { get; set; }
    public DateTime? SentAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
    public DateTime? ReadAt { get; set; }
    public DateTime? FailedAt { get; set; }
    public string? ErrorMessage { get; set; }
    public string? CreatedById { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}

public class CreateServiceNotificationDto
{
    public int CareServiceId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public ServiceNotificationRecipientType RecipientType { get; set; }
    public ServiceNotificationChannel Channel { get; set; } = ServiceNotificationChannel.InApp;
    public DateTime? ScheduledSendAt { get; set; }
}

public class PatientServiceQueryFilters
{
    public string? SearchQuery { get; set; }
    public int? CareRecipientId { get; set; }
    public int? ServiceDefinitionId { get; set; }
    public CareServiceStatus? Status { get; set; }
    public List<CareServiceStatus>? Statuses { get; set; }
    public ServicePriority? Priority { get; set; }
    public string? PerformerId { get; set; }
    public ServiceAssignmentStatus? AssignmentStatus { get; set; }
    public bool? OnlyUnassigned { get; set; }
    public ServiceNotificationStatus? NotificationStatus { get; set; }
    public bool? OnlyWithNotification { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public string? CreatedById { get; set; }

    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; } = true;
}

public class PatientServiceStatisticsDto
{
    public int TotalServices { get; set; }
    public int TodayServices { get; set; }
    public int PendingServices { get; set; }
    public int InProgressServices { get; set; }
    public int CompletedServices { get; set; }
    public int CancelledServices { get; set; }
    public int NoShowServices { get; set; }
    public int UnassignedServices { get; set; }
    public int ServicesWithNotification { get; set; }
    public int AssignedServices { get; set; }
    public int ScheduledServices { get; set; }
    public int DraftServices { get; set; }
    public int AcceptedServices { get; set; }
    public int ExpiredServices { get; set; }
}

public class ProviderAvailabilityDto
{
    public string UserId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public bool IsOnline { get; set; }
    public int TodayServicesCount { get; set; }
    public int InProgressServicesCount { get; set; }
    public int DailyCapacity { get; set; } = 8;
    public int WorkloadPercentage => DailyCapacity > 0 ? (int)Math.Round((TodayServicesCount * 100.0) / DailyCapacity) : 0;
    public string? CoverageArea { get; set; }
    public bool HasConflict { get; set; }
    public string? ConflictDescription { get; set; }
}

public class BulkServiceActionDto
{
    public List<int> ServiceIds { get; set; } = new();
    public string? PerformerId { get; set; }
    public CareServiceStatus? NewStatus { get; set; }
    public DateTime? NewScheduledDate { get; set; }
    public TimeSpan? NewScheduledTime { get; set; }
    public string? NotificationTitle { get; set; }
    public string? NotificationMessage { get; set; }
    public string? CancelReason { get; set; }
}

public class BulkServiceActionResult
{
    public int TotalProcessed { get; set; }
    public int Succeeded { get; set; }
    public int Failed { get; set; }
    public List<string> ErrorMessages { get; set; } = new();
}

public class CalendarEventDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime Start { get; set; }
    public DateTime End { get; set; }
    public CareServiceStatus Status { get; set; }
    public ServicePriority Priority { get; set; }
    public string? PatientName { get; set; }
    public string? ProviderName { get; set; }
    public string ColorClass { get; set; } = string.Empty;
}
