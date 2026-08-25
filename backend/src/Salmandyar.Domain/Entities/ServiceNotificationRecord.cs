namespace Salmandyar.Domain.Entities;

public class ServiceNotificationRecord
{
    public int Id { get; set; }

    public int CareServiceId { get; set; }
    public virtual CareService CareService { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;

    public ServiceNotificationRecipientType RecipientType { get; set; }
    public string? RecipientUserId { get; set; }
    public virtual User? RecipientUser { get; set; }
    public string RecipientDisplayName { get; set; } = string.Empty;

    public ServiceNotificationChannel Channel { get; set; }
    public ServiceNotificationStatus Status { get; set; } = ServiceNotificationStatus.Draft;

    public DateTime? ScheduledSendAt { get; set; }
    public DateTime? SentAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
    public DateTime? ReadAt { get; set; }
    public DateTime? FailedAt { get; set; }

    public string? ErrorMessage { get; set; }

    public string? CreatedById { get; set; }
    public virtual User? CreatedBy { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
