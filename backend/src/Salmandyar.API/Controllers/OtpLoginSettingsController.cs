using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salmandyar.Application.DTOs.Settings;
using Salmandyar.Application.Services.Settings;
using Salmandyar.Domain.Constants;

namespace Salmandyar.API.Controllers;

[ApiController]
[Route("api/admin/otp-login-settings")]
[Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
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
