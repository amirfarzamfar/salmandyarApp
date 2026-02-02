using Microsoft.EntityFrameworkCore;
using Salmandyar.Application.DTOs.Settings;
using Salmandyar.Application.Services.Settings;
using Salmandyar.Domain.Entities;
using Salmandyar.Infrastructure.Persistence;

namespace Salmandyar.Infrastructure.Services.Settings
{
    public class NotificationSettingsService : INotificationSettingsService
    {
        private readonly ApplicationDbContext _context;

        public NotificationSettingsService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<NotificationSettingsDto> GetSettingsAsync()
        {
            var settings = await GetSettingsEntityAsync();
            return MapToDto(settings);
        }

        public async Task<NotificationSettingsDto> UpdateSettingsAsync(UpdateNotificationSettingsDto dto)
        {
            var settings = await GetSettingsEntityAsync();

            settings.EmailEnabled = dto.EmailEnabled;
            settings.SmtpHost = dto.SmtpHost;
            settings.SmtpPort = dto.SmtpPort;
            settings.SmtpUser = dto.SmtpUser;
            settings.SmtpUseSsl = dto.SmtpUseSsl;
            
            if (!string.IsNullOrEmpty(dto.SmtpPassword))
            {
                settings.SmtpPassword = dto.SmtpPassword;
            }

            settings.SmsEnabled = dto.SmsEnabled;
            settings.SmsProvider = dto.SmsProvider;
            settings.SmsApiKey = dto.SmsApiKey;
            settings.SmsSenderNumber = dto.SmsSenderNumber;

            await _context.SaveChangesAsync();
            return MapToDto(settings);
        }

        public async Task<NotificationSettings> GetSettingsEntityAsync()
        {
            var settings = await _context.NotificationSettings.FirstOrDefaultAsync();
            
            if (settings == null)
            {
                settings = new NotificationSettings();
                _context.NotificationSettings.Add(settings);
                await _context.SaveChangesAsync();
            }

            return settings;
        }

        private NotificationSettingsDto MapToDto(NotificationSettings settings)
        {
            return new NotificationSettingsDto
            {
                EmailEnabled = settings.EmailEnabled,
                SmtpHost = settings.SmtpHost,
                SmtpPort = settings.SmtpPort,
                SmtpUser = settings.SmtpUser,
                SmtpUseSsl = settings.SmtpUseSsl,
                SmsEnabled = settings.SmsEnabled,
                SmsProvider = settings.SmsProvider,
                SmsApiKey = settings.SmsApiKey,
                SmsSenderNumber = settings.SmsSenderNumber
            };
        }
    }
}