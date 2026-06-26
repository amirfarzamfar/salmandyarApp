namespace Salmandyar.Application.Services.Notifications;

public class NotificationSendContext
{
    public string EventKey { get; set; } = string.Empty;
    public string EventDisplayName { get; set; } = string.Empty;
    public string? RecipientUserId { get; set; }
    public int? PatientId { get; set; }
    public string? ReferenceId { get; set; }
    public string? Severity { get; set; }
    public string? Link { get; set; }
}
