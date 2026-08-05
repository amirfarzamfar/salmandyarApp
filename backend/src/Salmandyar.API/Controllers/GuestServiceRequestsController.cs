using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salmandyar.Application.DTOs.GuestRequests;
using Salmandyar.Application.Services.GuestRequests;
using Salmandyar.Domain.Constants;
using System.Security.Claims;

namespace Salmandyar.API.Controllers;

[ApiController]
public class GuestServiceRequestsController : ControllerBase
{
    private readonly IGuestServiceRequestService _service;

    public GuestServiceRequestsController(IGuestServiceRequestService service)
    {
        _service = service;
    }

    [HttpPost("api/public/guest-requests")]
    [AllowAnonymous]
    public async Task<IActionResult> Submit([FromBody] CreateGuestServiceRequestDto dto)
    {
        try
        {
            var result = await _service.SubmitRequestAsync(dto);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("api/admin/guest-requests")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllRequestsAsync();
        return Ok(result);
    }

    [HttpGet("api/admin/guest-requests/{id:guid}")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _service.GetRequestByIdAsync(id);
        if (result == null)
        {
            return NotFound();
        }
        return Ok(result);
    }

    [HttpPatch("api/admin/guest-requests/{id:guid}/status")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateGuestServiceRequestStatusDto dto)
    {
        var actorUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(actorUserId))
        {
            return Unauthorized();
        }

        try
        {
            var result = await _service.UpdateStatusAsync(id, dto, actorUserId);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("api/admin/guest-requests/{id:guid}/notes")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<IActionResult> AddNote(Guid id, [FromBody] AddGuestServiceRequestNoteDto dto)
    {
        var actorUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(actorUserId))
        {
            return Unauthorized();
        }

        try
        {
            var result = await _service.AddNoteAsync(id, dto, actorUserId);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("api/admin/guest-requests/{id:guid}/sms")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<IActionResult> SendSms(Guid id, [FromBody] SendGuestServiceRequestSmsDto dto)
    {
        var actorUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(actorUserId))
        {
            return Unauthorized();
        }

        try
        {
            var result = await _service.SendSmsAsync(id, dto, actorUserId);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("api/admin/guest-requests/{id:guid}/convert-to-patient")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<IActionResult> ConvertToPatient(Guid id, [FromBody] ConvertGuestServiceRequestToPatientDto dto)
    {
        var actorUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(actorUserId))
        {
            return Unauthorized();
        }

        try
        {
            var result = await _service.ConvertToPatientAsync(id, dto, actorUserId);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPatch("api/admin/guest-requests/{id:guid}/assign-caregiver")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<IActionResult> AssignCaregiver(Guid id, [FromBody] AssignGuestServiceRequestCaregiverDto dto)
    {
        var actorUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(actorUserId))
        {
            return Unauthorized();
        }

        try
        {
            var result = await _service.AssignCaregiverAsync(id, dto, actorUserId);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}

