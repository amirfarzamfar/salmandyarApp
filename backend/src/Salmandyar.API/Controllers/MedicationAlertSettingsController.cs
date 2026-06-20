using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salmandyar.Application.DTOs.Settings;
using Salmandyar.Application.Services.Settings;

namespace Salmandyar.API.Controllers
{
    [ApiController]
    [Route("api/admin/medication-alert-settings")]
    [Authorize]
    public class MedicationAlertSettingsController : ControllerBase
    {
        private readonly IMedicationAlertSettingsService _service;

        public MedicationAlertSettingsController(IMedicationAlertSettingsService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<MedicationAlertSettingsDto>> Get()
        {
            return Ok(await _service.GetSettingsAsync());
        }

        [HttpPut]
        public async Task<ActionResult<MedicationAlertSettingsDto>> Update(UpdateMedicationAlertSettingsDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Ok(await _service.UpdateSettingsAsync(dto, userId));
        }
    }
}
