using Microsoft.EntityFrameworkCore;
using Salmandyar.Application.DTOs.Settings;
using Salmandyar.Application.Services.Settings;
using Salmandyar.Domain.Constants;
using Salmandyar.Domain.Entities;
using Salmandyar.Infrastructure.Persistence;

namespace Salmandyar.Infrastructure.Services.Settings
{
    public class MedicationAlertSettingsService : IMedicationAlertSettingsService
    {
        private readonly ApplicationDbContext _context;
        private readonly INotificationSettingsService _notificationSettingsService;

        public MedicationAlertSettingsService(
            ApplicationDbContext context,
            INotificationSettingsService notificationSettingsService)
        {
            _context = context;
            _notificationSettingsService = notificationSettingsService;
        }

        public async Task<MedicationAlertSettingsDto> GetSettingsAsync()
        {
            var entity = await GetSettingsEntityAsync();
            var config = await _notificationSettingsService.GetEventConfigurationAsync(NotificationEventKeys.MedicationLowStock);
            return MapToDto(entity, config);
        }

        public async Task<MedicationAlertSettingsDto> UpdateSettingsAsync(UpdateMedicationAlertSettingsDto dto, string? updatedByUserId)
        {
            var entity = await GetSettingsEntityAsync();
            var settings = await _notificationSettingsService.GetSettingsAsync();
            var target = settings.EventConfigurations.First(x => x.EventKey == NotificationEventKeys.MedicationLowStock);
            entity.AllowEarlyConfirmationMinutes = Math.Clamp(dto.AllowEarlyConfirmationMinutes, 0, 720);
            entity.AllowLateConfirmationMinutes = Math.Clamp(dto.AllowLateConfirmationMinutes, 1, 1440);
            target.SmsTemplate = dto.SmsTemplate;
            target.EmailSubjectTemplate = dto.EmailSubjectTemplate;
            target.EmailBodyTemplate = dto.EmailBodyTemplate;
            target.InAppBodyTemplate = dto.InAppTemplate;
            entity.UpdatedAt = DateTime.UtcNow;
            entity.UpdatedByUserId = updatedByUserId;

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

            await _context.SaveChangesAsync();
            return await GetSettingsAsync();
        }

        public async Task<MedicationAlertSettings> GetSettingsEntityAsync()
        {
            var settings = await _context.MedicationAlertSettings.FirstOrDefaultAsync();

            if (settings == null)
            {
                settings = new MedicationAlertSettings();
                _context.MedicationAlertSettings.Add(settings);
                await _context.SaveChangesAsync();
            }

            var changed = false;
            if (settings.AllowEarlyConfirmationMinutes < 0)
            {
                settings.AllowEarlyConfirmationMinutes = 30;
                changed = true;
            }

            if (settings.AllowLateConfirmationMinutes <= 0)
            {
                settings.AllowLateConfirmationMinutes = 120;
                changed = true;
            }

            if (changed)
            {
                await _context.SaveChangesAsync();
            }

            return settings;
        }

        private static MedicationAlertSettingsDto MapToDto(MedicationAlertSettings entity, NotificationEventConfigurationDto settings)
        {
            return new MedicationAlertSettingsDto
            {
                AllowEarlyConfirmationMinutes = entity.AllowEarlyConfirmationMinutes,
                AllowLateConfirmationMinutes = entity.AllowLateConfirmationMinutes,
                SmsTemplate = settings.SmsTemplate,
                EmailSubjectTemplate = settings.EmailSubjectTemplate,
                EmailBodyTemplate = settings.EmailBodyTemplate,
                InAppTemplate = settings.InAppBodyTemplate,
                UpdatedAt = entity.UpdatedAt
            };
        }
    }
}
