using System;

namespace Salmandyar.Domain.Entities
{
    public class NotificationSettings
    {
        public int Id { get; set; }

        // Email Settings
        public bool EmailEnabled { get; set; }
        public string SmtpHost { get; set; } = string.Empty;
        public int SmtpPort { get; set; } = 587;
        public string SmtpUser { get; set; } = string.Empty;
        public string SmtpPassword { get; set; } = string.Empty;
        public bool SmtpUseSsl { get; set; } = true;

        // SMS Settings
        public bool SmsEnabled { get; set; }
        public string SmsProvider { get; set; } = string.Empty; // e.g. "KavehNegar", "Twilio"
        public string SmsApiKey { get; set; } = string.Empty;
        public string SmsSenderNumber { get; set; } = string.Empty;
    }
}