using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Salmandyar.Application.DTOs.Settings;
using Salmandyar.Application.Services.Settings;
using Salmandyar.Domain.Constants;
using System.Security.Claims;

namespace Salmandyar.API.Controllers
{
    [ApiController]
    [Route("api/admin/notification-settings")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
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
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var settings = await _service.UpdateSettingsAsync(dto, userId);
                return Ok(settings);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (DbUpdateException)
            {
                return BadRequest(new { error = "ذخیره تنظیمات اعلان انجام نشد." });
            }
        }

        [HttpGet("logs")]
        public async Task<ActionResult<List<NotificationDeliveryLogDto>>> GetLogs([FromQuery] int take = 200)
        {
            var logs = await _service.GetDeliveryLogsAsync(take);
            return Ok(logs);
        }

        [HttpGet("{eventKey}/recipients")]
        public async Task<ActionResult<List<NotificationResolvedRecipientDto>>> GetResolvedRecipients(string eventKey)
        {
            var recipients = await _service.GetRoleRecipientsAsync(eventKey);
            return Ok(recipients);
        }

        [HttpPost("test-email")]
        public async Task<IActionResult> SendTestEmail([FromBody] NotificationTestMessageDto dto)
        {
            try
            {
                await _service.SendTestEmailAsync(dto);
                return Ok();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("test-sms")]
        public async Task<IActionResult> SendTestSms([FromBody] NotificationTestMessageDto dto)
        {
            try
            {
                await _service.SendTestSmsAsync(dto);
                return Ok();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
