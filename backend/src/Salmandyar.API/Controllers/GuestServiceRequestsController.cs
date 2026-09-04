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

    private string? ActorUserId => User.FindFirstValue(ClaimTypes.NameIdentifier);

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

    [HttpGet("api/admin/guest-requests/stats")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<IActionResult> GetStats()
    {
        var result = await _service.GetDashboardStatsAsync();
        return Ok(result);
    }

    [HttpGet("api/admin/guest-requests")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllRequestsAsync();
        return Ok(result);
    }

    [HttpGet("api/admin/guest-requests/paged")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<IActionResult> GetPaged([FromQuery] GuestRequestQueryDto query)
    {
        var result = await _service.GetPagedRequestsAsync(query);
        return Ok(result);
    }

    [HttpGet("api/admin/guest-requests/sms-templates")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public IActionResult GetSmsTemplates()
    {
        var result = _service.GetSmsTemplates();
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
        if (string.IsNullOrWhiteSpace(ActorUserId)) return Unauthorized();

        try
        {
            var result = await _service.UpdateStatusAsync(id, dto, ActorUserId);
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

    [HttpPatch("api/admin/guest-requests/{id:guid}/priority")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<IActionResult> UpdatePriority(Guid id, [FromBody] UpdateGuestServiceRequestPriorityDto dto)
    {
        if (string.IsNullOrWhiteSpace(ActorUserId)) return Unauthorized();

        try
        {
            var result = await _service.UpdatePriorityAsync(id, dto, ActorUserId);
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

    [HttpPatch("api/admin/guest-requests/{id:guid}/assign-supervisor")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<IActionResult> AssignSupervisor(Guid id, [FromBody] AssignGuestServiceRequestSupervisorDto dto)
    {
        if (string.IsNullOrWhiteSpace(ActorUserId)) return Unauthorized();

        try
        {
            var result = await _service.AssignSupervisorAsync(id, dto, ActorUserId);
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
        if (string.IsNullOrWhiteSpace(ActorUserId)) return Unauthorized();

        try
        {
            var result = await _service.AssignCaregiverAsync(id, dto, ActorUserId);
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
        if (string.IsNullOrWhiteSpace(ActorUserId)) return Unauthorized();

        try
        {
            var result = await _service.AddNoteAsync(id, dto, ActorUserId);
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
        if (string.IsNullOrWhiteSpace(ActorUserId)) return Unauthorized();

        try
        {
            var result = await _service.SendSmsAsync(id, dto, ActorUserId);
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

    [HttpGet("api/admin/guest-requests/{id:guid}/contact-logs")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<IActionResult> GetContactLogs(Guid id)
    {
        try
        {
            var result = await _service.GetContactLogsAsync(id);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost("api/admin/guest-requests/{id:guid}/contact-logs")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<IActionResult> CreateContactLog(Guid id, [FromBody] CreateGuestContactLogDto dto)
    {
        if (string.IsNullOrWhiteSpace(ActorUserId)) return Unauthorized();

        try
        {
            var result = await _service.CreateContactLogAsync(id, dto, ActorUserId);
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

    [HttpGet("api/admin/guest-requests/{id:guid}/follow-ups")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<IActionResult> GetFollowUps(Guid id)
    {
        try
        {
            var result = await _service.GetFollowUpsAsync(id);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost("api/admin/guest-requests/{id:guid}/follow-ups")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<IActionResult> CreateFollowUp(Guid id, [FromBody] CreateGuestFollowUpDto dto)
    {
        if (string.IsNullOrWhiteSpace(ActorUserId)) return Unauthorized();

        try
        {
            var result = await _service.CreateFollowUpAsync(id, dto, ActorUserId);
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

    [HttpPatch("api/admin/guest-requests/follow-ups/{followUpId:guid}")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<IActionResult> UpdateFollowUp(Guid followUpId, [FromBody] UpdateGuestFollowUpDto dto)
    {
        if (string.IsNullOrWhiteSpace(ActorUserId)) return Unauthorized();

        try
        {
            var result = await _service.UpdateFollowUpAsync(followUpId, dto, ActorUserId);
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

    [HttpGet("api/admin/guest-requests/{id:guid}/duplicate-patients")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<IActionResult> SearchDuplicatePatients(Guid id)
    {
        try
        {
            var result = await _service.SearchDuplicatePatientsAsync(id);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost("api/admin/guest-requests/{id:guid}/convert-to-patient")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<IActionResult> ConvertToPatient(Guid id, [FromBody] ConvertGuestServiceRequestToPatientDto dto)
    {
        if (string.IsNullOrWhiteSpace(ActorUserId)) return Unauthorized();

        try
        {
            var result = await _service.ConvertToPatientAsync(id, dto, ActorUserId);
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

    [HttpPost("api/admin/guest-requests/{id:guid}/reject")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<IActionResult> Reject(Guid id, [FromBody] RejectGuestRequestDto dto)
    {
        if (string.IsNullOrWhiteSpace(ActorUserId)) return Unauthorized();

        try
        {
            var result = await _service.RejectRequestAsync(id, dto, ActorUserId);
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
