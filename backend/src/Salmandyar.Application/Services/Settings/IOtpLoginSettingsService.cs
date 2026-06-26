using Salmandyar.Application.DTOs.Settings;
using Salmandyar.Domain.Entities;

namespace Salmandyar.Application.Services.Settings;

public interface IOtpLoginSettingsService
{
    Task<OtpLoginSettingsDto> GetSettingsAsync();
    Task<OtpLoginSettingsDto> UpdateSettingsAsync(UpdateOtpLoginSettingsDto dto);
    Task<OtpLoginSettings> GetSettingsEntityAsync();
}
