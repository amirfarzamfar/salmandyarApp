using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salmandyar.Application.DTOs.Settings;
using Salmandyar.Application.Services.Settings;

namespace Salmandyar.API.Controllers
{
    [ApiController]
    [Route("api/admin/notification-settings")]
    // [Authorize(Roles = "Admin")] // Uncomment when roles are fully setup
    public class NotificationSettingsController : ControllerBase
    {
        private readonly INotificationSettingsService _service;

        public NotificationSettingsController(INotificationSettingsService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<NotificationSettingsDto>> Get()
        {
            var settings = await _service.GetSettingsAsync();
            return Ok(settings);
        }

        [HttpPut]
        public async Task<ActionResult<NotificationSettingsDto>> Update(UpdateNotificationSettingsDto dto)
        {
            var settings = await _service.UpdateSettingsAsync(dto);
            return Ok(settings);
        }
    }
}