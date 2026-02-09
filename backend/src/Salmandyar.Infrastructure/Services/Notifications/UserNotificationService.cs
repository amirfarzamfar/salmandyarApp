using Microsoft.EntityFrameworkCore;
using Salmandyar.Application.Services.Notifications;
using Salmandyar.Domain.Entities;
using Salmandyar.Domain.Enums;
using Salmandyar.Infrastructure.Persistence;

namespace Salmandyar.Infrastructure.Services.Notifications;

public class UserNotificationService : IUserNotificationService
{
    private readonly ApplicationDbContext _context;

    public UserNotificationService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task CreateNotificationAsync(string userId, string title, string message, NotificationType type, string? referenceId = null, string? link = null)
    {
        var notification = new UserNotification
        {
            UserId = userId,
            Title = title,
            Message = message,
            Type = type,
            ReferenceId = referenceId,
            Link = link,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.UserNotifications.Add(notification);
        await _context.SaveChangesAsync();
    }

    public async Task<List<UserNotification>> GetUserNotificationsAsync(string userId, bool unreadOnly = false)
    {
        var query = _context.UserNotifications
            .Where(n => n.UserId == userId);

        if (unreadOnly)
        {
            query = query.Where(n => !n.IsRead);
        }

        return await query
            .OrderByDescending(n => n.CreatedAt)
            .Take(50) // Limit to last 50
            .ToListAsync();
    }

    public async Task MarkAsReadAsync(int notificationId, string userId)
    {
        var notification = await _context.UserNotifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

        if (notification != null && !notification.IsRead)
        {
            notification.IsRead = true;
            await _context.SaveChangesAsync();
        }
    }

    public async Task<int> GetUnreadCountAsync(string userId)
    {
        return await _context.UserNotifications
            .CountAsync(n => n.UserId == userId && !n.IsRead);
    }
}
