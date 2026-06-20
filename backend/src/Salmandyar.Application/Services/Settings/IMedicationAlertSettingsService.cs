using Salmandyar.Application.DTOs.Settings;
using Salmandyar.Domain.Entities;

namespace Salmandyar.Application.Services.Settings
{
    public interface IMedicationAlertSettingsService
    {
        Task<MedicationAlertSettingsDto> GetSettingsAsync();
        Task<MedicationAlertSettingsDto> UpdateSettingsAsync(UpdateMedicationAlertSettingsDto dto, string? updatedByUserId);
        Task<MedicationAlertSettings> GetSettingsEntityAsync();
    }
}
