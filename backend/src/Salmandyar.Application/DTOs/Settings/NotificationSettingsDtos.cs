namespace Salmandyar.Application.DTOs.Settings
{
    public class NotificationSettingsDto
    {
        // Email Settings
        public bool EmailEnabled { get; set; }
        public string SmtpHost { get; set; }
        public int SmtpPort { get; set; }
        public string SmtpUser { get; set; }
        // Password is not returned for security, unless explicitly needed (usually hidden)
        public bool SmtpUseSsl { get; set; }

        // SMS Settings
        public bool SmsEnabled { get; set; }
        public string SmsProvider { get; set; }
        public string SmsApiKey { get; set; }
        public string SmsSenderNumber { get; set; }
    }

    public class UpdateNotificationSettingsDto
    {
        public bool EmailEnabled { get; set; }
        public string SmtpHost { get; set; }
        public int SmtpPort { get; set; }
        public string SmtpUser { get; set; }
        public string? SmtpPassword { get; set; } // Optional, only update if provided
        public bool SmtpUseSsl { get; set; }

        public bool SmsEnabled { get; set; }
        public string SmsProvider { get; set; }
        public string SmsApiKey { get; set; }
        public string SmsSenderNumber { get; set; }
    }
}