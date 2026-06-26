using Microsoft.AspNetCore.Mvc;
using Salmandyar.Application.DTOs.Settings;
using Salmandyar.Application.Services.Settings;

namespace Salmandyar.API.Controllers;

[ApiController]
[Route("api/admin/otp-login-settings")]
public class OtpLoginSettingsController : ControllerBase
{
    private readonly IOtpLoginSettingsService _service;

    public OtpLoginSettingsController(IOtpLoginSettingsService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<OtpLoginSettingsDto>> Get()
    {
        var settings = await _service.GetSettingsAsync();
        return Ok(settings);
    }

    [HttpPut]
    public async Task<ActionResult<OtpLoginSettingsDto>> Update(UpdateOtpLoginSettingsDto dto)
    {
        var settings = await _service.UpdateSettingsAsync(dto);
        return Ok(settings);
    }
}
