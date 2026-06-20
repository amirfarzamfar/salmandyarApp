using Microsoft.EntityFrameworkCore;
using Salmandyar.Application.DTOs.Settings;
using Salmandyar.Application.Services.Settings;
using Salmandyar.Domain.Entities;
using Salmandyar.Infrastructure.Persistence;

namespace Salmandyar.Infrastructure.Services.Settings
{
    public class MedicationAlertSettingsService : IMedicationAlertSettingsService
    {
        private readonly ApplicationDbContext _context;

        public MedicationAlertSettingsService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<MedicationAlertSettingsDto> GetSettingsAsync()
        {
            var settings = await GetSettingsEntityAsync();
            return MapToDto(settings);
        }

        public async Task<MedicationAlertSettingsDto> UpdateSettingsAsync(UpdateMedicationAlertSettingsDto dto, string? updatedByUserId)
        {
            var settings = await GetSettingsEntityAsync();
            settings.SmsTemplate = dto.SmsTemplate;
            settings.EmailSubjectTemplate = dto.EmailSubjectTemplate;
            settings.EmailBodyTemplate = dto.EmailBodyTemplate;
            settings.InAppTemplate = dto.InAppTemplate;
            settings.UpdatedAt = DateTime.UtcNow;
            settings.UpdatedByUserId = updatedByUserId;

            await _context.SaveChangesAsync();
            return MapToDto(settings);
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

            return settings;
        }

        private static MedicationAlertSettingsDto MapToDto(MedicationAlertSettings settings)
        {
            return new MedicationAlertSettingsDto
            {
                SmsTemplate = settings.SmsTemplate,
                EmailSubjectTemplate = settings.EmailSubjectTemplate,
                EmailBodyTemplate = settings.EmailBodyTemplate,
                InAppTemplate = settings.InAppTemplate,
                UpdatedAt = settings.UpdatedAt
            };
        }
    }
}
