using Salmandyar.Domain.Enums;

namespace Salmandyar.Application.DTOs.Settings;

public class NotificationSettingsDto
{
    public bool EmailEnabled { get; set; }
    public string SmtpHost { get; set; } = string.Empty;
    public int SmtpPort { get; set; }
    public string SmtpUser { get; set; } = string.Empty;
    public bool SmtpUseSsl { get; set; }
    public string EmailFromAddress { get; set; } = string.Empty;
    public string EmailFromName { get; set; } = string.Empty;
    public string EmailReplyTo { get; set; } = string.Empty;
    public int EmailTimeoutSeconds { get; set; }
    public bool SmtpPasswordConfigured { get; set; }

    public bool SmsEnabled { get; set; }
    public string SmsProvider { get; set; } = string.Empty;
    public string SmsBaseUrl { get; set; } = string.Empty;
    public string SmsUsername { get; set; } = string.Empty;
    public string SmsApiKey { get; set; } = string.Empty;
    public string SmsSenderNumber { get; set; } = string.Empty;
    public bool SmsSandboxMode { get; set; }
    public bool SmsPasswordConfigured { get; set; }
    public bool SmsApiSecretConfigured { get; set; }

    public DateTime UpdatedAt { get; set; }
    public List<NotificationEventConfigurationDto> EventConfigurations { get; set; } = new();
}

public class UpdateNotificationSettingsDto
{
    public bool EmailEnabled { get; set; }
    public string SmtpHost { get; set; } = string.Empty;
    public int SmtpPort { get; set; }
    public string SmtpUser { get; set; } = string.Empty;
    public string? SmtpPassword { get; set; }
    public bool ClearSmtpPassword { get; set; }
    public bool SmtpUseSsl { get; set; }
    public string EmailFromAddress { get; set; } = string.Empty;
    public string EmailFromName { get; set; } = string.Empty;
    public string EmailReplyTo { get; set; } = string.Empty;
    public int EmailTimeoutSeconds { get; set; } = 30;

    public bool SmsEnabled { get; set; }
    public string SmsProvider { get; set; } = string.Empty;
    public string SmsBaseUrl { get; set; } = string.Empty;
    public string SmsUsername { get; set; } = string.Empty;
    public string? SmsPassword { get; set; }
    public bool ClearSmsPassword { get; set; }
    public string SmsApiKey { get; set; } = string.Empty;
    public string? SmsApiSecret { get; set; }
    public bool ClearSmsApiSecret { get; set; }
    public string SmsSenderNumber { get; set; } = string.Empty;
    public bool SmsSandboxMode { get; set; }

    public List<NotificationEventConfigurationDto> EventConfigurations { get; set; } = new();
}

public class NotificationEventConfigurationDto
{
    public string EventKey { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsEnabled { get; set; } = true;
    public bool SendInApp { get; set; } = true;
    public bool SendSms { get; set; }
    public bool SendEmail { get; set; }
    public List<string> RecipientRoles { get; set; } = new();
    public List<string> AdditionalEmails { get; set; } = new();
    public List<string> AdditionalPhones { get; set; } = new();
    public string InAppTitleTemplate { get; set; } = string.Empty;
    public string InAppBodyTemplate { get; set; } = string.Empty;
    public string SmsTemplate { get; set; } = string.Empty;
    public string EmailSubjectTemplate { get; set; } = string.Empty;
    public string EmailBodyTemplate { get; set; } = string.Empty;
}

public class NotificationDeliveryLogDto
{
    public long Id { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public string EventKey { get; set; } = string.Empty;
    public string EventDisplayName { get; set; } = string.Empty;
    public NotificationDeliveryChannel Channel { get; set; }
    public NotificationDeliveryStatus Status { get; set; }
    public string Provider { get; set; } = string.Empty;
    public string Recipient { get; set; } = string.Empty;
    public string? Subject { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? ErrorMessage { get; set; }
    public int? PatientId { get; set; }
    public string? ReferenceId { get; set; }
    public string? Severity { get; set; }
    public string? Link { get; set; }
}

public class NotificationResolvedRecipientDto
{
    public string UserId { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? Email { get; set; }
}

public class NotificationTestMessageDto
{
    public string Destination { get; set; } = string.Empty;
    public string? Subject { get; set; }
    public string Message { get; set; } = string.Empty;
}
