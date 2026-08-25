namespace Salmandyar.Domain.Entities;

public class CareService
{
    public int Id { get; set; }

    public int CareRecipientId { get; set; }
    public virtual CareRecipient CareRecipient { get; set; } = null!;

    public int ServiceDefinitionId { get; set; }
    public virtual ServiceDefinition ServiceDefinition { get; set; } = null!;

    public string? CustomServiceName { get; set; }

    public string? PerformerId { get; set; }
    public virtual User? Performer { get; set; }

    public DateTime? AssignedAt { get; set; }
    public string? AssignedById { get; set; }
    public virtual User? AssignedBy { get; set; }

    public DateTime ScheduledDate { get; set; }
    public TimeSpan? ScheduledStartTime { get; set; }
    public TimeSpan? ScheduledEndTime { get; set; }
    public int? DurationMinutes { get; set; }

    public DateTime? ActualStartTime { get; set; }
    public DateTime? ActualEndTime { get; set; }

    public DateTime PerformedAt { get; set; } = DateTime.UtcNow;
    public DateTime? StartTime { get; set; }
    public DateTime? EndTime { get; set; }

    public CareServiceStatus Status { get; set; } = CareServiceStatus.Draft;
    public ServicePriority Priority { get; set; } = ServicePriority.Normal;
    public ServiceLocationType LocationType { get; set; } = ServiceLocationType.PatientHome;
    public ServiceAssignmentStatus AssignmentStatus { get; set; } = ServiceAssignmentStatus.Unassigned;

    public string Description { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public string? LocationAddress { get; set; }

    public int? ParentScheduleId { get; set; }
    public virtual ServiceSchedule? ParentSchedule { get; set; }

    public ServiceNotificationStatus NotificationStatus { get; set; } = ServiceNotificationStatus.NotCreated;
    public DateTime? NotificationSentAt { get; set; }

    public string? CreatedById { get; set; }
    public virtual User? CreatedBy { get; set; }

    public string? UpdatedById { get; set; }
    public virtual User? UpdatedBy { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<ServiceActivityLog> ActivityLogs { get; set; } = new List<ServiceActivityLog>();
    public virtual ICollection<ServiceAssignmentHistory> AssignmentHistories { get; set; } = new List<ServiceAssignmentHistory>();
    public virtual ICollection<ServiceNotificationRecord> Notifications { get; set; } = new List<ServiceNotificationRecord>();
}
