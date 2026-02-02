using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salmandyar.Application.DTOs.Assignments;
using Salmandyar.Application.Services.Assignments;

namespace Salmandyar.API.Controllers;

[Authorize(Roles = "Manager,Supervisor")]
[ApiController]
[Route("api/assignments")]
public class CareAssignmentsController : ControllerBase
{
    private readonly ICareAssignmentService _service;

    public CareAssignmentsController(ICareAssignmentService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateAssignmentDto dto)
    {
        try
        {
            var result = await _service.CreateAssignmentAsync(dto);
            return StatusCode(201, result);
        }
        catch (FluentValidation.ValidationException ex)
        {
            return BadRequest(new { errors = ex.Errors.Select(e => e.ErrorMessage) });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, UpdateAssignmentDto dto)
    {
        try
        {
            var result = await _service.UpdateAssignmentAsync(id, dto);
            return Ok(result);
        }
        catch (FluentValidation.ValidationException ex)
        {
            return BadRequest(new { errors = ex.Errors.Select(e => e.ErrorMessage) });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, UpdateAssignmentStatusDto dto)
    {
        try
        {
            await _service.UpdateAssignmentStatusAsync(id, dto);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpGet("calendar")]
    public async Task<ActionResult<List<AssignmentDto>>> GetCalendar(
        [FromQuery] DateTimeOffset start, 
        [FromQuery] DateTimeOffset end,
        [FromQuery] int? patientId,
        [FromQuery] string? caregiverId)
    {
        if (start == default) start = DateTimeOffset.UtcNow.AddMonths(-1);
        if (end == default) end = DateTimeOffset.UtcNow.AddMonths(1);

        var result = await _service.GetCalendarAsync(start, end, patientId, caregiverId);
        return Ok(result);
    }
}
