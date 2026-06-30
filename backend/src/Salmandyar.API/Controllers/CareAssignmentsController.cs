using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salmandyar.Application.DTOs.Assignments;
using Salmandyar.Application.DTOs.Common;
using Salmandyar.Application.Services.Assignments;
using Salmandyar.Domain.Enums;
using System.Security.Claims;

namespace Salmandyar.API.Controllers;

[Authorize(Roles = "Admin,SuperAdmin,Manager,Supervisor")]
[ApiController]
[Route("api/assignments")]
public class CareAssignmentsController : ControllerBase
{
    private readonly ICareAssignmentService _service;

    public CareAssignmentsController(ICareAssignmentService service)
    {
        _service = service;
    }

    private string? CurrentUserId => User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    [HttpPost]
    public async Task<IActionResult> Create(CreateAssignmentDto dto)
    {
        try
        {
            var result = await _service.CreateAssignmentAsync(dto, CurrentUserId);
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
            var result = await _service.UpdateAssignmentAsync(id, dto, CurrentUserId);
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
            await _service.UpdateAssignmentStatusAsync(id, dto, CurrentUserId);
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
        [FromQuery] string? caregiverId,
        [FromQuery] AssignmentStatus? status)
    {
        if (start == default) start = DateTimeOffset.UtcNow.AddMonths(-1);
        if (end == default) end = DateTimeOffset.UtcNow.AddMonths(1);

        var result = await _service.GetCalendarAsync(start, end, patientId, caregiverId, status);
        return Ok(result);
    }

    [HttpGet]
    public async Task<ActionResult<PagedResponse<AssignmentDto>>> GetPaged(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] DateTimeOffset? start = null, 
        [FromQuery] DateTimeOffset? end = null,
        [FromQuery] string? search = null,
        [FromQuery] int? patientId = null,
        [FromQuery] string? caregiverId = null,
        [FromQuery] AssignmentStatus? status = null)
    {
        var result = await _service.GetAssignmentsPagedAsync(page, pageSize, start, end, search, patientId, caregiverId, status);
        return Ok(result);
    }

    [HttpGet("{id}/audit-logs")]
    public async Task<IActionResult> GetAuditLogs(Guid id, [FromServices] Salmandyar.Infrastructure.Persistence.ApplicationDbContext context)
    {
        var logs = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync(
            System.Linq.Queryable.OrderByDescending(
                System.Linq.Queryable.Where(context.AuditLogs, a => a.EntityName == "CareAssignment" && a.EntityId == id.ToString()),
                a => a.CreatedAt));

        return Ok(logs);
    }
}
