using Salmandyar.Domain.Entities;
using Salmandyar.Domain.Enums;

namespace Salmandyar.Application.Services.Notifications;

public interface IUserNotificationService
{
    Task CreateNotificationAsync(string userId, string title, string message, NotificationType type, string? referenceId = null, string? link = null);
    Task<List<UserNotification>> GetUserNotificationsAsync(string userId, bool unreadOnly = false);
    Task MarkAsReadAsync(int notificationId, string userId);
    Task<int> GetUnreadCountAsync(string userId);
}
