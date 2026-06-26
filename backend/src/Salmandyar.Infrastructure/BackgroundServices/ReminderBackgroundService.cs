using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Salmandyar.Infrastructure.Persistence;
using Salmandyar.Application.Services.Notifications;
using Salmandyar.Application.Services.Settings;
using Salmandyar.Domain.Constants;
using Salmandyar.Domain.Enums;

namespace Salmandyar.Infrastructure.BackgroundServices
{
    public class ReminderBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<ReminderBackgroundService> _logger;

        public ReminderBackgroundService(IServiceProvider serviceProvider, ILogger<ReminderBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("ReminderBackgroundService started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessRemindersAsync();
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred while processing reminders.");
                }

                try
                {
                    await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    break;
                }
            }
        }

        private async Task ProcessRemindersAsync()
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();
                var userNotificationService = scope.ServiceProvider.GetRequiredService<IUserNotificationService>();
                var notificationSettingsService = scope.ServiceProvider.GetRequiredService<INotificationSettingsService>();
                var userManager = scope.ServiceProvider.GetRequiredService<UserManager<Salmandyar.Domain.Entities.User>>();

                var now = DateTime.UtcNow;

                // Find pending reminders due now or in the past
                var dueReminders = await dbContext.ServiceReminders
                    .Include(r => r.CareRecipient)
                        .ThenInclude(cr => cr.User)
                    .Include(r => r.CareRecipient)
                        .ThenInclude(cr => cr.FamilyMember)
                    .Include(r => r.TargetUser)
                    .Include(r => r.ServiceDefinition)
                    .Include(r => r.CareService)
                    .Where(r => !r.IsSent && r.ScheduledTime <= now)
                    .ToListAsync();

                foreach (var reminder in dueReminders)
                {
                    try
                    {
                        var serviceTime = reminder.CareService?.StartTime ?? reminder.CareService?.PerformedAt;
                        var whenText = serviceTime.HasValue
                            ? $"زمان خدمت: {serviceTime.Value:yyyy-MM-dd HH:mm}"
                            : "";

                        var note = string.IsNullOrWhiteSpace(reminder.Note) ? string.Empty : reminder.Note.Trim();
                        var eventConfig = await notificationSettingsService.GetEventConfigurationAsync(NotificationEventKeys.ServiceReminder);
                        var templateValues = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
                        {
                            ["PatientName"] = $"{reminder.CareRecipient.FirstName} {reminder.CareRecipient.LastName}".Trim(),
                            ["ServiceTitle"] = reminder.ServiceDefinition.Title,
                            ["ScheduledTime"] = reminder.ScheduledTime.ToString("yyyy/MM/dd HH:mm"),
                            ["Note"] = note
                        };

                        var inAppTitle = RenderTemplate(eventConfig.InAppTitleTemplate, templateValues, "یادآوری خدمت");
                        var smsMessage = RenderTemplate(eventConfig.SmsTemplate, templateValues, $"یادآوری خدمت {reminder.ServiceDefinition.Title}");
                        var emailSubject = RenderTemplate(eventConfig.EmailSubjectTemplate, templateValues, "Service Reminder");
                        var emailBody = RenderTemplate(eventConfig.EmailBodyTemplate, templateValues, smsMessage);
                        var link = reminder.CareRecipientId > 0 ? $"/dashboard/patients/{reminder.CareRecipientId}?tab=services" : null;

                        if (reminder.TargetUserId != null)
                        {
                            if (reminder.SendInApp && eventConfig.SendInApp)
                            {
                                await userNotificationService.CreateNotificationAsync(
                                    reminder.TargetUserId,
                                    inAppTitle,
                                    smsMessage,
                                    NotificationType.Reminder,
                                    referenceId: reminder.CareServiceId?.ToString(),
                                    link: link,
                                    context: new NotificationSendContext
                                    {
                                        EventKey = NotificationEventKeys.ServiceReminder,
                                        EventDisplayName = eventConfig.DisplayName,
                                        RecipientUserId = reminder.TargetUserId,
                                        PatientId = reminder.CareRecipientId,
                                        ReferenceId = reminder.CareServiceId?.ToString(),
                                        Link = link
                                    }
                                );
                            }

                            if (reminder.TargetUser != null)
                            {
                                if (reminder.SendSms && eventConfig.SendSms && !string.IsNullOrEmpty(reminder.TargetUser.PhoneNumber))
                                    await notificationService.SendSmsAsync(reminder.TargetUser.PhoneNumber, smsMessage, new NotificationSendContext
                                    {
                                        EventKey = NotificationEventKeys.ServiceReminder,
                                        EventDisplayName = eventConfig.DisplayName,
                                        RecipientUserId = reminder.TargetUserId,
                                        PatientId = reminder.CareRecipientId,
                                        ReferenceId = reminder.CareServiceId?.ToString(),
                                        Link = link
                                    });

                                if (reminder.SendEmail && eventConfig.SendEmail && !string.IsNullOrEmpty(reminder.TargetUser.Email))
                                    await notificationService.SendEmailAsync(reminder.TargetUser.Email, emailSubject, emailBody, new NotificationSendContext
                                    {
                                        EventKey = NotificationEventKeys.ServiceReminder,
                                        EventDisplayName = eventConfig.DisplayName,
                                        RecipientUserId = reminder.TargetUserId,
                                        PatientId = reminder.CareRecipientId,
                                        ReferenceId = reminder.CareServiceId?.ToString(),
                                        Link = link
                                    });
                            }
                        }

                        if (reminder.NotifyPatient)
                        {
                            var patientUser = reminder.CareRecipient.User ?? reminder.CareRecipient.FamilyMember;
                            if (patientUser != null)
                            {
                                if (reminder.SendInApp && eventConfig.SendInApp)
                                {
                                    await userNotificationService.CreateNotificationAsync(
                                        patientUser.Id,
                                        inAppTitle,
                                        smsMessage,
                                        NotificationType.Reminder,
                                        referenceId: reminder.CareServiceId?.ToString(),
                                        link: link,
                                        context: new NotificationSendContext
                                        {
                                            EventKey = NotificationEventKeys.ServiceReminder,
                                            EventDisplayName = eventConfig.DisplayName,
                                            RecipientUserId = patientUser.Id,
                                            PatientId = reminder.CareRecipientId,
                                            ReferenceId = reminder.CareServiceId?.ToString(),
                                            Link = link
                                        }
                                    );
                                }

                                if (reminder.SendSms && eventConfig.SendSms && !string.IsNullOrEmpty(patientUser.PhoneNumber))
                                    await notificationService.SendSmsAsync(patientUser.PhoneNumber, smsMessage, new NotificationSendContext
                                    {
                                        EventKey = NotificationEventKeys.ServiceReminder,
                                        EventDisplayName = eventConfig.DisplayName,
                                        RecipientUserId = patientUser.Id,
                                        PatientId = reminder.CareRecipientId,
                                        ReferenceId = reminder.CareServiceId?.ToString(),
                                        Link = link
                                    });

                                if (reminder.SendEmail && eventConfig.SendEmail && !string.IsNullOrEmpty(patientUser.Email))
                                    await notificationService.SendEmailAsync(patientUser.Email, emailSubject, emailBody, new NotificationSendContext
                                    {
                                        EventKey = NotificationEventKeys.ServiceReminder,
                                        EventDisplayName = eventConfig.DisplayName,
                                        RecipientUserId = patientUser.Id,
                                        PatientId = reminder.CareRecipientId,
                                        ReferenceId = reminder.CareServiceId?.ToString(),
                                        Link = link
                                    });
                            }
                        }

                        if (reminder.NotifySupervisor && !string.IsNullOrEmpty(reminder.CareRecipient.ResponsibleNurseId))
                        {
                            var supervisor = await userManager.FindByIdAsync(reminder.CareRecipient.ResponsibleNurseId);
                            if (supervisor != null)
                            {
                                if (reminder.SendInApp && eventConfig.SendInApp)
                                {
                                    await userNotificationService.CreateNotificationAsync(
                                        supervisor.Id,
                                        inAppTitle,
                                        smsMessage,
                                        NotificationType.Reminder,
                                        referenceId: reminder.CareServiceId?.ToString(),
                                        link: link,
                                        context: new NotificationSendContext
                                        {
                                            EventKey = NotificationEventKeys.ServiceReminder,
                                            EventDisplayName = eventConfig.DisplayName,
                                            RecipientUserId = supervisor.Id,
                                            PatientId = reminder.CareRecipientId,
                                            ReferenceId = reminder.CareServiceId?.ToString(),
                                            Link = link
                                        }
                                    );
                                }

                                if (reminder.SendSms && eventConfig.SendSms && !string.IsNullOrEmpty(supervisor.PhoneNumber))
                                    await notificationService.SendSmsAsync(supervisor.PhoneNumber, smsMessage, new NotificationSendContext
                                    {
                                        EventKey = NotificationEventKeys.ServiceReminder,
                                        EventDisplayName = eventConfig.DisplayName,
                                        RecipientUserId = supervisor.Id,
                                        PatientId = reminder.CareRecipientId,
                                        ReferenceId = reminder.CareServiceId?.ToString(),
                                        Link = link
                                    });

                                if (reminder.SendEmail && eventConfig.SendEmail && !string.IsNullOrEmpty(supervisor.Email))
                                    await notificationService.SendEmailAsync(supervisor.Email, emailSubject, emailBody, new NotificationSendContext
                                    {
                                        EventKey = NotificationEventKeys.ServiceReminder,
                                        EventDisplayName = eventConfig.DisplayName,
                                        RecipientUserId = supervisor.Id,
                                        PatientId = reminder.CareRecipientId,
                                        ReferenceId = reminder.CareServiceId?.ToString(),
                                        Link = link
                                    });
                            }
                        }

                        var configuredRoleRecipients = await notificationSettingsService.GetRoleRecipientsAsync(NotificationEventKeys.ServiceReminder);
                        foreach (var extra in configuredRoleRecipients.Where(x => x.UserId != reminder.TargetUserId))
                        {
                            if (eventConfig.SendInApp)
                            {
                                await userNotificationService.CreateNotificationAsync(
                                    extra.UserId,
                                    inAppTitle,
                                    smsMessage,
                                    NotificationType.Reminder,
                                    referenceId: reminder.CareServiceId?.ToString(),
                                    link: link,
                                    context: new NotificationSendContext
                                    {
                                        EventKey = NotificationEventKeys.ServiceReminder,
                                        EventDisplayName = eventConfig.DisplayName,
                                        RecipientUserId = extra.UserId,
                                        PatientId = reminder.CareRecipientId,
                                        ReferenceId = reminder.CareServiceId?.ToString(),
                                        Link = link
                                    });
                            }

                            if (eventConfig.SendSms && !string.IsNullOrWhiteSpace(extra.PhoneNumber))
                            {
                                await notificationService.SendSmsAsync(extra.PhoneNumber, smsMessage, new NotificationSendContext
                                {
                                    EventKey = NotificationEventKeys.ServiceReminder,
                                    EventDisplayName = eventConfig.DisplayName,
                                    RecipientUserId = extra.UserId,
                                    PatientId = reminder.CareRecipientId,
                                    ReferenceId = reminder.CareServiceId?.ToString(),
                                    Link = link
                                });
                            }

                            if (eventConfig.SendEmail && !string.IsNullOrWhiteSpace(extra.Email))
                            {
                                await notificationService.SendEmailAsync(extra.Email, emailSubject, emailBody, new NotificationSendContext
                                {
                                    EventKey = NotificationEventKeys.ServiceReminder,
                                    EventDisplayName = eventConfig.DisplayName,
                                    RecipientUserId = extra.UserId,
                                    PatientId = reminder.CareRecipientId,
                                    ReferenceId = reminder.CareServiceId?.ToString(),
                                    Link = link
                                });
                            }
                        }

                        if (reminder.NotifyAdmin)
                        {
                            var admins = new List<Salmandyar.Domain.Entities.User>();
                            admins.AddRange(await userManager.GetUsersInRoleAsync("Admin"));
                            admins.AddRange(await userManager.GetUsersInRoleAsync("SuperAdmin"));
                            admins = admins.GroupBy(a => a.Id).Select(g => g.First()).ToList();

                            foreach (var admin in admins)
                            {
                                if (reminder.SendInApp && eventConfig.SendInApp)
                                {
                                    await userNotificationService.CreateNotificationAsync(
                                        admin.Id,
                                        "هشدار ادمین: خدمت سررسید",
                                        smsMessage,
                                        NotificationType.Alert,
                                        referenceId: reminder.CareServiceId?.ToString(),
                                        link: link,
                                        context: new NotificationSendContext
                                        {
                                            EventKey = NotificationEventKeys.ServiceReminder,
                                            EventDisplayName = eventConfig.DisplayName,
                                            RecipientUserId = admin.Id,
                                            PatientId = reminder.CareRecipientId,
                                            ReferenceId = reminder.CareServiceId?.ToString(),
                                            Link = link
                                        }
                                    );
                                }

                                if (reminder.SendSms && eventConfig.SendSms && !string.IsNullOrEmpty(admin.PhoneNumber))
                                    await notificationService.SendSmsAsync(admin.PhoneNumber, smsMessage, new NotificationSendContext
                                    {
                                        EventKey = NotificationEventKeys.ServiceReminder,
                                        EventDisplayName = eventConfig.DisplayName,
                                        RecipientUserId = admin.Id,
                                        PatientId = reminder.CareRecipientId,
                                        ReferenceId = reminder.CareServiceId?.ToString(),
                                        Link = link
                                    });

                                if (reminder.SendEmail && eventConfig.SendEmail && !string.IsNullOrEmpty(admin.Email))
                                    await notificationService.SendEmailAsync(admin.Email, emailSubject, emailBody, new NotificationSendContext
                                    {
                                        EventKey = NotificationEventKeys.ServiceReminder,
                                        EventDisplayName = eventConfig.DisplayName,
                                        RecipientUserId = admin.Id,
                                        PatientId = reminder.CareRecipientId,
                                        ReferenceId = reminder.CareServiceId?.ToString(),
                                        Link = link
                                    });
                            }
                        }

                        if (eventConfig.SendSms)
                        {
                            foreach (var phone in eventConfig.AdditionalPhones.Where(x => !string.IsNullOrWhiteSpace(x)).Distinct())
                            {
                                await notificationService.SendSmsAsync(phone, smsMessage, new NotificationSendContext
                                {
                                    EventKey = NotificationEventKeys.ServiceReminder,
                                    EventDisplayName = eventConfig.DisplayName,
                                    PatientId = reminder.CareRecipientId,
                                    ReferenceId = reminder.CareServiceId?.ToString(),
                                    Link = link
                                });
                            }
                        }

                        if (eventConfig.SendEmail)
                        {
                            foreach (var email in eventConfig.AdditionalEmails.Where(x => !string.IsNullOrWhiteSpace(x)).Distinct())
                            {
                                await notificationService.SendEmailAsync(email, emailSubject, emailBody, new NotificationSendContext
                                {
                                    EventKey = NotificationEventKeys.ServiceReminder,
                                    EventDisplayName = eventConfig.DisplayName,
                                    PatientId = reminder.CareRecipientId,
                                    ReferenceId = reminder.CareServiceId?.ToString(),
                                    Link = link
                                });
                            }
                        }

                        // Update Status
                        reminder.IsSent = true;
                        reminder.SentAt = DateTime.UtcNow;
                    }
                    catch (Exception ex)
                    {
                        reminder.FailureReason = ex.Message;
                        _logger.LogError(ex, $"Failed to send reminder {reminder.Id}");
                    }
                }

                if (dueReminders.Any())
                {
                    await dbContext.SaveChangesAsync();
                    _logger.LogInformation($"Processed {dueReminders.Count} reminders.");
                }
            }
        }

        private static string RenderTemplate(string template, IReadOnlyDictionary<string, string> values, string fallback)
    {
        if (string.IsNullOrWhiteSpace(template))
        {
            return fallback;
        }

        var output = template;
        foreach (var item in values)
        {
            output = output.Replace($"{{{item.Key}}}", item.Value, StringComparison.OrdinalIgnoreCase);
        }

        return output;
    }
}
}
