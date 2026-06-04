using Microsoft.AspNetCore.SignalR;
using Salmandyar.API.Hubs;
using Salmandyar.Application.Services.Notifications;
using Salmandyar.Domain.Enums;

namespace Salmandyar.API.Services;

public class SignalRRealtimeNotificationDispatcher : IRealtimeNotificationDispatcher
{
    private readonly IHubContext<NotificationHub> _notificationHub;

    public SignalRRealtimeNotificationDispatcher(IHubContext<NotificationHub> notificationHub)
    {
        _notificationHub = notificationHub;
    }

    public async Task DispatchAsync(
        string userId,
        string title,
        string message,
        NotificationType type,
        string? referenceId = null,
        string? link = null,
        string? severity = null)
    {
        await _notificationHub.Clients.Group($"User_{userId}").SendAsync("ReceiveNotification", new
        {
            title,
            message,
            link,
            referenceId,
            type = (int)type,
            severity
        });
    }
}
