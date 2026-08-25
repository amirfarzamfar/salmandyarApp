namespace Salmandyar.Domain.Entities;

public class ServiceSchedule
{
    public int Id { get; set; }

    public int CareRecipientId { get; set; }
    public virtual CareRecipient CareRecipient { get; set; } = null!;

    public int ServiceDefinitionId { get; set; }
    public virtual ServiceDefinition ServiceDefinition { get; set; } = null!;

    public string? CustomServiceName { get; set; }

    public DateTime StartDate { get; set; }
    public TimeSpan StartTime { get; set; }
    public int DurationMinutes { get; set; }

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

    public bool IsActive { get; set; } = true;

    public string CreatedById { get; set; } = string.Empty;
    public virtual User? CreatedBy { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public string? UpdatedById { get; set; }
    public virtual User? UpdatedBy { get; set; }
    public DateTime? UpdatedAtUtc { get; set; }

    public virtual ICollection<CareService> GeneratedServices { get; set; } = new List<CareService>();
}
