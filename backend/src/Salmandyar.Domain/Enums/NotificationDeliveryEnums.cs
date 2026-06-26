namespace Salmandyar.Domain.Enums;

public enum NotificationDeliveryChannel
{
    InApp = 0,
    Sms = 1,
    Email = 2
}

public enum NotificationDeliveryStatus
{
    Succeeded = 0,
    Failed = 1,
    Skipped = 2
}
