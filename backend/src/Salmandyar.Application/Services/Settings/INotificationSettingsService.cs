using Salmandyar.Application.DTOs.Settings;

namespace Salmandyar.Application.Services.Settings;

public interface INotificationSettingsService
{
    Task<NotificationSettingsDto> GetSettingsAsync();
    Task<NotificationSettingsDto> UpdateSettingsAsync(UpdateNotificationSettingsDto dto, string? updatedByUserId = null);
    Task<NotificationEventConfigurationDto> GetEventConfigurationAsync(string eventKey);
    Task<List<NotificationResolvedRecipientDto>> GetRoleRecipientsAsync(string eventKey);
    Task<List<NotificationDeliveryLogDto>> GetDeliveryLogsAsync(int take = 200);
    Task SendTestEmailAsync(NotificationTestMessageDto dto);
    Task SendTestSmsAsync(NotificationTestMessageDto dto);

    // Internal use for services (returns full entity including password if needed internally)
    Task<Salmandyar.Domain.Entities.NotificationSettings> GetSettingsEntityAsync();
}
