using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using Salmandyar.Infrastructure.Persistence;
using Salmandyar.Application.Services.Notifications;

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

                var now = DateTime.UtcNow;

                // Find pending reminders due now or in the past
                var dueReminders = await dbContext.ServiceReminders
                    .Include(r => r.CareRecipient)
                        .ThenInclude(cr => cr.User)
                    .Include(r => r.ServiceDefinition)
                    .Where(r => !r.IsSent && r.ScheduledTime <= now)
                    .ToListAsync();

                foreach (var reminder in dueReminders)
                {
                    try
                    {
                        var message = $"Reminder: {reminder.ServiceDefinition.Title} for {reminder.CareRecipient.FirstName} {reminder.CareRecipient.LastName} is due now.";
                        
                        // Notify Patient/Family
                        if (reminder.NotifyPatient && reminder.CareRecipient.User != null)
                        {
                            if (!string.IsNullOrEmpty(reminder.CareRecipient.User.PhoneNumber))
                                await notificationService.SendSmsAsync(reminder.CareRecipient.User.PhoneNumber, message);
                            
                            if (!string.IsNullOrEmpty(reminder.CareRecipient.User.Email))
                                await notificationService.SendEmailAsync(reminder.CareRecipient.User.Email, "Service Reminder", message);
                        }

                        // Notify Admin/Supervisor (Simulated via hardcoded admin email for now or fetched from roles)
                        if (reminder.NotifyAdmin)
                        {
                            await notificationService.SendEmailAsync("admin@salmandyar.com", "Admin Alert: Service Due", message);
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