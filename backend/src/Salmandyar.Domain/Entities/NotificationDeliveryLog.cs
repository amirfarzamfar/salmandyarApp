using Salmandyar.Domain.Enums;

namespace Salmandyar.Domain.Entities;

public class NotificationDeliveryLog
{
    public long Id { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public string EventKey { get; set; } = string.Empty;
    public string EventDisplayName { get; set; } = string.Empty;
    public NotificationDeliveryChannel Channel { get; set; }
    public NotificationDeliveryStatus Status { get; set; }
    public string Provider { get; set; } = string.Empty;
    public string Recipient { get; set; } = string.Empty;
    public string? RecipientUserId { get; set; }
    public string? Subject { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? ErrorMessage { get; set; }
    public int? PatientId { get; set; }
    public string? ReferenceId { get; set; }
    public string? Severity { get; set; }
    public string? Link { get; set; }
}
