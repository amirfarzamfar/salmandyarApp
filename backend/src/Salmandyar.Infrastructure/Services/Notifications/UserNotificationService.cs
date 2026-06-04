using Microsoft.EntityFrameworkCore;
using Salmandyar.Application.Services.Notifications;
using Salmandyar.Domain.Entities;
using Salmandyar.Domain.Enums;
using Salmandyar.Infrastructure.Persistence;
using System.Net.Http.Json;

namespace Salmandyar.Infrastructure.Services.Notifications;

public class UserNotificationService : IUserNotificationService
{
    private static readonly HttpClient DebugHttpClient = new();
    private readonly ApplicationDbContext _context;
    private readonly IRealtimeNotificationDispatcher _realtimeNotificationDispatcher;

    public UserNotificationService(
        ApplicationDbContext context,
        IRealtimeNotificationDispatcher realtimeNotificationDispatcher)
    {
        _context = context;
        _realtimeNotificationDispatcher = realtimeNotificationDispatcher;
    }

    public async Task CreateNotificationAsync(string userId, string title, string message, NotificationType type, string? referenceId = null, string? link = null, string? severity = null)
    {
        // #region debug-point A:create-entry
        await DebugReportAsync("A", "CreateNotificationAsync:entry", new
        {
            userId,
            title,
            type = type.ToString(),
            referenceId,
            link,
            severity
        });
        // #endregion

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

        // #region debug-point A:create-saved
        await DebugReportAsync("A", "CreateNotificationAsync:saved", new
        {
            notificationId = notification.Id,
            userId,
            title,
            type = type.ToString(),
            referenceId,
            link,
            severity
        });
        // #endregion

        await _realtimeNotificationDispatcher.DispatchAsync(
            userId,
            title,
            message,
            type,
            referenceId,
            link,
            severity);

        // #region debug-point C:dispatch-done
        await DebugReportAsync("C", "CreateNotificationAsync:dispatch-done", new
        {
            notificationId = notification.Id,
            userId,
            title,
            type = type.ToString()
        });
        // #endregion
    }

    public async Task<List<UserNotification>> GetUserNotificationsAsync(string userId, bool unreadOnly = false)
    {
        var query = _context.UserNotifications
            .Where(n => n.UserId == userId);

        if (unreadOnly)
        {
            query = query.Where(n => !n.IsRead);
        }

        var items = await query
            .OrderByDescending(n => n.CreatedAt)
            .Take(50) // Limit to last 50
            .ToListAsync();

        // #region debug-point B:list-result
        await DebugReportAsync("B", "GetUserNotificationsAsync:result", new
        {
            userId,
            unreadOnly,
            count = items.Count,
            items = items.Take(10).Select(x => new
            {
                x.Id,
                x.Title,
                Type = x.Type.ToString(),
                x.ReferenceId,
                x.Link,
                x.IsRead
            }).ToList()
        });
        // #endregion

        return items;
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
        var count = await _context.UserNotifications
            .CountAsync(n => n.UserId == userId && !n.IsRead);

        // #region debug-point B:count-result
        await DebugReportAsync("B", "GetUnreadCountAsync:result", new
        {
            userId,
            count
        });
        // #endregion

        return count;
    }

    // #region debug-point shared:reporter
    private static async Task DebugReportAsync(string hypothesisId, string msg, object data)
    {
        try
        {
            await DebugHttpClient.PostAsJsonAsync("http://127.0.0.1:7777/event", new
            {
                sessionId = "medication-alert-missing",
                runId = "pre-fix",
                hypothesisId,
                location = "UserNotificationService",
                msg = $"[DEBUG] {msg}",
                data,
                ts = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
            });
        }
        catch
        {
            // Intentionally silent during debugging.
        }
    }
    // #endregion
}
