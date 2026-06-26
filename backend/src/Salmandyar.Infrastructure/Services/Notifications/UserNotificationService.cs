using Microsoft.EntityFrameworkCore;
using Salmandyar.Application.Services.Notifications;
using Salmandyar.Application.Services.Settings;
using Salmandyar.Domain.Constants;
using Salmandyar.Domain.Entities;
using Salmandyar.Domain.Enums;
using Salmandyar.Domain.Entities.Medications;
using Salmandyar.Infrastructure.Persistence;

namespace Salmandyar.Infrastructure.Services.Notifications;

public class UserNotificationService : IUserNotificationService
{
    private readonly ApplicationDbContext _context;
    private readonly IRealtimeNotificationDispatcher _realtimeNotificationDispatcher;
    private readonly INotificationSettingsService _notificationSettingsService;

    public UserNotificationService(
        ApplicationDbContext context,
        IRealtimeNotificationDispatcher realtimeNotificationDispatcher,
        INotificationSettingsService notificationSettingsService)
    {
        _context = context;
        _realtimeNotificationDispatcher = realtimeNotificationDispatcher;
        _notificationSettingsService = notificationSettingsService;
    }

    public async Task CreateNotificationAsync(string userId, string title, string message, NotificationType type, string? referenceId = null, string? link = null, string? severity = null, NotificationSendContext? context = null)
    {
        var effectiveContext = context ?? new NotificationSendContext
        {
            EventKey = NotificationEventKeys.Generic,
            EventDisplayName = GetDefaultEventDisplayName(type),
            RecipientUserId = userId,
            ReferenceId = referenceId,
            Severity = severity,
            Link = link
        };

        effectiveContext.RecipientUserId ??= userId;
        effectiveContext.ReferenceId ??= referenceId;
        effectiveContext.Severity ??= severity;
        effectiveContext.Link ??= link;
        effectiveContext.EventKey = string.IsNullOrWhiteSpace(effectiveContext.EventKey) ? NotificationEventKeys.Generic : effectiveContext.EventKey;
        effectiveContext.EventDisplayName = string.IsNullOrWhiteSpace(effectiveContext.EventDisplayName) ? GetDefaultEventDisplayName(type) : effectiveContext.EventDisplayName;

        if (!effectiveContext.EventKey.Equals(NotificationEventKeys.Generic, StringComparison.OrdinalIgnoreCase))
        {
            var eventConfig = await _notificationSettingsService.GetEventConfigurationAsync(effectiveContext.EventKey);
            if (!eventConfig.IsEnabled || !eventConfig.SendInApp)
            {
                await LogInAppDeliveryAsync(effectiveContext, NotificationDeliveryStatus.Skipped, userId, title, message, "ارسال داخل‌برنامه‌ای برای این رویداد غیرفعال است.");
                return;
            }
        }

        try
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

            await _realtimeNotificationDispatcher.DispatchAsync(
                userId,
                title,
                message,
                type,
                referenceId,
                link,
                severity);

            await LogInAppDeliveryAsync(effectiveContext, NotificationDeliveryStatus.Succeeded, userId, title, message, null);
        }
        catch (Exception ex)
        {
            await LogInAppDeliveryAsync(effectiveContext, NotificationDeliveryStatus.Failed, userId, title, message, ex.Message);
            throw;
        }
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

        await NormalizeMedicationMissedMessagesAsync(items);

        return items;
    }

    public async Task MarkAsReadAsync(int notificationId, string userId)
    {
        var notification = await _context.UserNotifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

        if (notification != null && !notification.IsRead)
        {
            if (IsLowStockNotification(notification))
            {
                var duplicates = await _context.UserNotifications
                    .Where(n =>
                        n.UserId == userId &&
                        !n.IsRead &&
                        n.ReferenceId == notification.ReferenceId &&
                        n.Title == notification.Title)
                    .ToListAsync();

                foreach (var item in duplicates)
                {
                    item.IsRead = true;
                }
            }
            else
            {
                notification.IsRead = true;
            }

            await _context.SaveChangesAsync();
        }
    }

    public async Task<int> GetUnreadCountAsync(string userId)
    {
        var notifications = await _context.UserNotifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .Select(n => new { n.Id, n.Title, n.ReferenceId })
            .ToListAsync();

        var lowStockCount = notifications
            .Where(n => IsLowStockTitle(n.Title))
            .GroupBy(n => $"{n.ReferenceId}|{n.Title}")
            .Count();

        var regularCount = notifications.Count(n => !IsLowStockTitle(n.Title));
        return regularCount + lowStockCount;
    }

    private static bool IsLowStockNotification(UserNotification notification)
    {
        return IsLowStockTitle(notification.Title);
    }

    private static bool IsLowStockTitle(string? title)
    {
        return !string.IsNullOrWhiteSpace(title) && title.Contains("موجودی دارو", StringComparison.Ordinal);
    }

    private async Task NormalizeMedicationMissedMessagesAsync(List<UserNotification> items)
    {
        const string title = "هشدار عدم ثبت مصرف دارو";
        var doseIds = items
            .Where(n => n.Title == title && !string.IsNullOrWhiteSpace(n.ReferenceId))
            .Select(n => int.TryParse(n.ReferenceId, out var id) ? id : (int?)null)
            .Where(x => x.HasValue)
            .Select(x => x!.Value)
            .Distinct()
            .ToList();

        if (doseIds.Count == 0)
        {
            return;
        }

        var doses = await _context.MedicationDoses
            .Include(d => d.PatientMedication)
                .ThenInclude(m => m.CareRecipient)
            .Where(d => doseIds.Contains(d.Id))
            .ToListAsync();

        if (doses.Count == 0)
        {
            return;
        }

        var tz = GetIranTimeZone();
        var doseById = doses.ToDictionary(d => d.Id);
        var changed = false;

        foreach (var item in items)
        {
            if (item.Title != title || string.IsNullOrWhiteSpace(item.ReferenceId))
            {
                continue;
            }

            if (!int.TryParse(item.ReferenceId, out var doseId))
            {
                continue;
            }

            if (!doseById.TryGetValue(doseId, out var dose))
            {
                continue;
            }

            var careRecipient = dose.PatientMedication.CareRecipient;
            var patientName = $"{careRecipient.FirstName} {careRecipient.LastName}".Trim();
            var scheduledUtc = DateTime.SpecifyKind(dose.ScheduledTime, DateTimeKind.Utc);
            var scheduledLocal = TimeZoneInfo.ConvertTimeFromUtc(scheduledUtc, tz);
            var message = $"{patientName}: مصرف {dose.PatientMedication.Name} ساعت {scheduledLocal:HH:mm} ثبت نشده است.";

            if (item.Message != message)
            {
                item.Message = message;
                changed = true;
            }
        }

        if (changed)
        {
            await _context.SaveChangesAsync();
        }
    }

    private static TimeZoneInfo GetIranTimeZone()
    {
        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById("Iran Standard Time");
        }
        catch
        {
            return TimeZoneInfo.FindSystemTimeZoneById("Asia/Tehran");
        }
    }

    private async Task LogInAppDeliveryAsync(NotificationSendContext context, NotificationDeliveryStatus status, string userId, string title, string message, string? error)
    {
        _context.NotificationDeliveryLogs.Add(new NotificationDeliveryLog
        {
            CreatedAtUtc = DateTime.UtcNow,
            EventKey = string.IsNullOrWhiteSpace(context.EventKey) ? NotificationEventKeys.Generic : context.EventKey,
            EventDisplayName = string.IsNullOrWhiteSpace(context.EventDisplayName) ? "اعلان داخل برنامه" : context.EventDisplayName,
            Channel = NotificationDeliveryChannel.InApp,
            Status = status,
            Provider = "InApp",
            Recipient = userId,
            RecipientUserId = userId,
            Subject = title,
            Message = message,
            ErrorMessage = error,
            PatientId = context.PatientId,
            ReferenceId = context.ReferenceId,
            Severity = context.Severity,
            Link = context.Link
        });

        await _context.SaveChangesAsync();
    }

    private static string GetDefaultEventDisplayName(NotificationType type)
    {
        return type switch
        {
            NotificationType.Assessment => "اعلان ارزیابی",
            NotificationType.Reminder => "یادآوری",
            NotificationType.Alert => "هشدار",
            _ => "اعلان سیستمی"
        };
    }
}
