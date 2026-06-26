using Salmandyar.Application.DTOs.Settings;
using Salmandyar.Application.Services.Settings;
using Salmandyar.Domain.Constants;

namespace Salmandyar.Infrastructure.Services.Settings
{
    public class MedicationAlertSettingsService : IMedicationAlertSettingsService
    {
        private readonly INotificationSettingsService _notificationSettingsService;

        public MedicationAlertSettingsService(INotificationSettingsService notificationSettingsService)
        {
            _notificationSettingsService = notificationSettingsService;
        }

        public async Task<MedicationAlertSettingsDto> GetSettingsAsync()
        {
            var config = await _notificationSettingsService.GetEventConfigurationAsync(NotificationEventKeys.MedicationLowStock);
            return MapToDto(config);
        }

        public async Task<MedicationAlertSettingsDto> UpdateSettingsAsync(UpdateMedicationAlertSettingsDto dto, string? updatedByUserId)
        {
            var settings = await _notificationSettingsService.GetSettingsAsync();
            var target = settings.EventConfigurations.First(x => x.EventKey == NotificationEventKeys.MedicationLowStock);
            target.SmsTemplate = dto.SmsTemplate;
            target.EmailSubjectTemplate = dto.EmailSubjectTemplate;
            target.EmailBodyTemplate = dto.EmailBodyTemplate;
            target.InAppBodyTemplate = dto.InAppTemplate;

            await _notificationSettingsService.UpdateSettingsAsync(new UpdateNotificationSettingsDto
            {
                EmailEnabled = settings.EmailEnabled,
                SmtpHost = settings.SmtpHost,
                SmtpPort = settings.SmtpPort,
                SmtpUser = settings.SmtpUser,
                SmtpUseSsl = settings.SmtpUseSsl,
                EmailFromAddress = settings.EmailFromAddress,
                EmailFromName = settings.EmailFromName,
                EmailReplyTo = settings.EmailReplyTo,
                EmailTimeoutSeconds = settings.EmailTimeoutSeconds,
                SmsEnabled = settings.SmsEnabled,
                SmsProvider = settings.SmsProvider,
                SmsBaseUrl = settings.SmsBaseUrl,
                SmsUsername = settings.SmsUsername,
                SmsApiKey = settings.SmsApiKey,
                SmsSenderNumber = settings.SmsSenderNumber,
                SmsSandboxMode = settings.SmsSandboxMode,
                EventConfigurations = settings.EventConfigurations
            }, updatedByUserId);

            return await GetSettingsAsync();
        }

        public Task<Salmandyar.Domain.Entities.MedicationAlertSettings> GetSettingsEntityAsync()
        {
            return Task.FromResult(new Salmandyar.Domain.Entities.MedicationAlertSettings());
        }

        private static MedicationAlertSettingsDto MapToDto(NotificationEventConfigurationDto settings)
        {
            return new MedicationAlertSettingsDto
            {
                SmsTemplate = settings.SmsTemplate,
                EmailSubjectTemplate = settings.EmailSubjectTemplate,
                EmailBodyTemplate = settings.EmailBodyTemplate,
                InAppTemplate = settings.InAppBodyTemplate,
                UpdatedAt = DateTime.UtcNow
            };
        }
    }
}
