using Salmandyar.Domain.Enums;

namespace Salmandyar.Application.Services.Notifications;

public interface IRealtimeNotificationDispatcher
{
    Task DispatchAsync(
        string userId,
        string title,
        string message,
        NotificationType type,
        string? referenceId = null,
        string? link = null,
        string? severity = null);
}
