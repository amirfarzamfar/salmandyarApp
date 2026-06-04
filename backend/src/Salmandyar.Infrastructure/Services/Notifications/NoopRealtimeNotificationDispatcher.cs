using Salmandyar.Application.Services.Notifications;
using Salmandyar.Domain.Enums;

namespace Salmandyar.Infrastructure.Services.Notifications;

public class NoopRealtimeNotificationDispatcher : IRealtimeNotificationDispatcher
{
    public Task DispatchAsync(
        string userId,
        string title,
        string message,
        NotificationType type,
        string? referenceId = null,
        string? link = null,
        string? severity = null)
    {
        return Task.CompletedTask;
    }
}
