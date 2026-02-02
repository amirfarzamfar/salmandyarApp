using Microsoft.Extensions.Logging;
using Salmandyar.Application.Services.Notifications;
using Salmandyar.Application.Services.Settings;

namespace Salmandyar.Infrastructure.Services.Notifications
{
    public class LoggerNotificationService : INotificationService
    {
        private readonly ILogger<LoggerNotificationService> _logger;
        private readonly INotificationSettingsService _settingsService;

        public LoggerNotificationService(ILogger<LoggerNotificationService> logger, INotificationSettingsService settingsService)
        {
            _logger = logger;
            _settingsService = settingsService;
        }

        public async Task SendSmsAsync(string phoneNumber, string message)
        {
            var settings = await _settingsService.GetSettingsEntityAsync();
            
            if (!settings.SmsEnabled)
            {
                _logger.LogWarning("SMS Sending is DISABLED. Message to {PhoneNumber} suppressed.", phoneNumber);
                return;
            }

            _logger.LogInformation("================================================");
            _logger.LogInformation("SMS SENT");
            _logger.LogInformation($"Provider: {settings.SmsProvider}");
            _logger.LogInformation($"Sender: {settings.SmsSenderNumber}");
            _logger.LogInformation($"To: {phoneNumber}");
            _logger.LogInformation($"Message: {message}");
            _logger.LogInformation("================================================");
        }

        public async Task SendEmailAsync(string email, string subject, string body)
        {
            var settings = await _settingsService.GetSettingsEntityAsync();

            if (!settings.EmailEnabled)
            {
                _logger.LogWarning("Email Sending is DISABLED. Email to {Email} suppressed.", email);
                return;
            }

            _logger.LogInformation("================================================");
            _logger.LogInformation("EMAIL SENT");
            _logger.LogInformation($"Host: {settings.SmtpHost}:{settings.SmtpPort}");
            _logger.LogInformation($"User: {settings.SmtpUser}");
            _logger.LogInformation($"To: {email}");
            _logger.LogInformation($"Subject: {subject}");
            _logger.LogInformation($"Body: {body}");
            _logger.LogInformation("================================================");
        }
    }
}