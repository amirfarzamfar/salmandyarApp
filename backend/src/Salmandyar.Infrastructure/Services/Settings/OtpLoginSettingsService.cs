using Microsoft.EntityFrameworkCore;
using Salmandyar.Application.DTOs.Settings;
using Salmandyar.Application.Services.Settings;
using Salmandyar.Domain.Entities;
using Salmandyar.Infrastructure.Persistence;

namespace Salmandyar.Infrastructure.Services.Settings;

public class OtpLoginSettingsService : IOtpLoginSettingsService
{
    private readonly ApplicationDbContext _context;

    public OtpLoginSettingsService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<OtpLoginSettingsDto> GetSettingsAsync()
    {
        var settings = await GetSettingsEntityAsync();
        return MapToDto(settings);
    }

    public async Task<OtpLoginSettingsDto> UpdateSettingsAsync(UpdateOtpLoginSettingsDto dto)
    {
        var settings = await GetSettingsEntityAsync();

        settings.IsEnabled = dto.IsEnabled;
        settings.AllowSms = dto.AllowSms;
        settings.AllowEmail = dto.AllowEmail;
        settings.CodeLength = Math.Clamp(dto.CodeLength, 4, 8);
        settings.CodeExpiryMinutes = Math.Clamp(dto.CodeExpiryMinutes, 1, 15);
        settings.ResendCooldownSeconds = Math.Clamp(dto.ResendCooldownSeconds, 30, 300);
        settings.MaxVerifyAttempts = Math.Clamp(dto.MaxVerifyAttempts, 3, 10);

        await _context.SaveChangesAsync();
        return MapToDto(settings);
    }

    public async Task<OtpLoginSettings> GetSettingsEntityAsync()
    {
        var settings = await _context.OtpLoginSettings.FirstOrDefaultAsync();

        if (settings == null)
        {
            settings = new OtpLoginSettings();
            _context.OtpLoginSettings.Add(settings);
            await _context.SaveChangesAsync();
        }

        return settings;
    }

    private static OtpLoginSettingsDto MapToDto(OtpLoginSettings settings)
    {
        return new OtpLoginSettingsDto
        {
            IsEnabled = settings.IsEnabled,
            AllowSms = settings.AllowSms,
            AllowEmail = settings.AllowEmail,
            CodeLength = settings.CodeLength,
            CodeExpiryMinutes = settings.CodeExpiryMinutes,
            ResendCooldownSeconds = settings.ResendCooldownSeconds,
            MaxVerifyAttempts = settings.MaxVerifyAttempts
        };
    }
}
