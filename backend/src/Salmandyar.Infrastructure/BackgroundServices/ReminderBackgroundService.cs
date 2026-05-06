using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Salmandyar.Infrastructure.Persistence;
using Salmandyar.Application.Services.Notifications;
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
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred while processing reminders.");
                }

                // Check every minute
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }
        }

        private async Task ProcessRemindersAsync()
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();
                var userNotificationService = scope.ServiceProvider.GetRequiredService<IUserNotificationService>();
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

                        var note = string.IsNullOrWhiteSpace(reminder.Note) ? "" : $" - {reminder.Note}";
                        var message = $"یادآوری خدمت: {reminder.ServiceDefinition.Title} برای {reminder.CareRecipient.FirstName} {reminder.CareRecipient.LastName}{note}. {whenText}".Trim();

                        if (reminder.TargetUserId != null)
                        {
                            if (reminder.SendInApp)
                            {
                                await userNotificationService.CreateNotificationAsync(
                                    reminder.TargetUserId,
                                    "یادآوری خدمت",
                                    message,
                                    NotificationType.Reminder,
                                    referenceId: reminder.CareServiceId?.ToString(),
                                    link: null
                                );
                            }

                            if (reminder.TargetUser != null)
                            {
                                if (reminder.SendSms && !string.IsNullOrEmpty(reminder.TargetUser.PhoneNumber))
                                    await notificationService.SendSmsAsync(reminder.TargetUser.PhoneNumber, message);

                                if (reminder.SendEmail && !string.IsNullOrEmpty(reminder.TargetUser.Email))
                                    await notificationService.SendEmailAsync(reminder.TargetUser.Email, "Service Reminder", message);
                            }
                        }

                        if (reminder.NotifyPatient)
                        {
                            var patientUser = reminder.CareRecipient.User ?? reminder.CareRecipient.FamilyMember;
                            if (patientUser != null)
                            {
                                if (reminder.SendInApp)
                                {
                                    await userNotificationService.CreateNotificationAsync(
                                        patientUser.Id,
                                        "یادآوری خدمت",
                                        message,
                                        NotificationType.Reminder,
                                        referenceId: reminder.CareServiceId?.ToString(),
                                        link: null
                                    );
                                }

                                if (reminder.SendSms && !string.IsNullOrEmpty(patientUser.PhoneNumber))
                                    await notificationService.SendSmsAsync(patientUser.PhoneNumber, message);

                                if (reminder.SendEmail && !string.IsNullOrEmpty(patientUser.Email))
                                    await notificationService.SendEmailAsync(patientUser.Email, "Service Reminder", message);
                            }
                        }

                        if (reminder.NotifySupervisor && !string.IsNullOrEmpty(reminder.CareRecipient.ResponsibleNurseId))
                        {
                            var supervisor = await userManager.FindByIdAsync(reminder.CareRecipient.ResponsibleNurseId);
                            if (supervisor != null)
                            {
                                if (reminder.SendInApp)
                                {
                                    await userNotificationService.CreateNotificationAsync(
                                        supervisor.Id,
                                        "یادآوری خدمت",
                                        message,
                                        NotificationType.Reminder,
                                        referenceId: reminder.CareServiceId?.ToString(),
                                        link: null
                                    );
                                }

                                if (reminder.SendSms && !string.IsNullOrEmpty(supervisor.PhoneNumber))
                                    await notificationService.SendSmsAsync(supervisor.PhoneNumber, message);

                                if (reminder.SendEmail && !string.IsNullOrEmpty(supervisor.Email))
                                    await notificationService.SendEmailAsync(supervisor.Email, "Service Reminder", message);
                            }
                        }

                        // Notify Admin/Supervisor (Simulated via hardcoded admin email for now or fetched from roles)
                        if (reminder.NotifyAdmin)
                        {
                            var admins = new List<Salmandyar.Domain.Entities.User>();
                            admins.AddRange(await userManager.GetUsersInRoleAsync("Admin"));
                            admins.AddRange(await userManager.GetUsersInRoleAsync("SuperAdmin"));
                            admins = admins.GroupBy(a => a.Id).Select(g => g.First()).ToList();

                            foreach (var admin in admins)
                            {
                                if (reminder.SendInApp)
                                {
                                    await userNotificationService.CreateNotificationAsync(
                                        admin.Id,
                                        "هشدار ادمین: خدمت سررسید",
                                        message,
                                        NotificationType.Alert,
                                        referenceId: reminder.CareServiceId?.ToString(),
                                        link: null
                                    );
                                }

                                if (reminder.SendSms && !string.IsNullOrEmpty(admin.PhoneNumber))
                                    await notificationService.SendSmsAsync(admin.PhoneNumber, message);

                                if (reminder.SendEmail && !string.IsNullOrEmpty(admin.Email))
                                    await notificationService.SendEmailAsync(admin.Email, "Admin Alert: Service Due", message);
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
    }
}
