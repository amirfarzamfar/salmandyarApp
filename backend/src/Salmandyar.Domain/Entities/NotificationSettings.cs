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
        public string EmailFromAddress { get; set; } = string.Empty;
        public string EmailFromName { get; set; } = string.Empty;
        public string EmailReplyTo { get; set; } = string.Empty;
        public int EmailTimeoutSeconds { get; set; } = 30;

        // SMS Settings
        public bool SmsEnabled { get; set; }
        public string SmsProvider { get; set; } = "LogOnly";
        public string SmsBaseUrl { get; set; } = string.Empty;
        public string SmsUsername { get; set; } = string.Empty;
        public string SmsPassword { get; set; } = string.Empty;
        public string SmsApiKey { get; set; } = string.Empty;
        public string SmsApiSecret { get; set; } = string.Empty;
        public string SmsSenderNumber { get; set; } = string.Empty;
        public bool SmsSandboxMode { get; set; }

        // Event Rules
        public string EventConfigurationsJson { get; set; } = string.Empty;

        // Audit
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public string? UpdatedByUserId { get; set; }
    }
}
