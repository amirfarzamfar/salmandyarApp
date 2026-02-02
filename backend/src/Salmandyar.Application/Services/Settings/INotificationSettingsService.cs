using System.Threading.Tasks;
using Salmandyar.Application.DTOs.Settings;

namespace Salmandyar.Application.Services.Settings
{
    public interface INotificationSettingsService
    {
        Task<NotificationSettingsDto> GetSettingsAsync();
        Task<NotificationSettingsDto> UpdateSettingsAsync(UpdateNotificationSettingsDto dto);
        
        // Internal use for services (returns full entity including password if needed internally)
        Task<Salmandyar.Domain.Entities.NotificationSettings> GetSettingsEntityAsync();
    }
}