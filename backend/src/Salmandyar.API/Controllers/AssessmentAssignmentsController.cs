using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salmandyar.Application.DTOs.Assessments;
using Salmandyar.Application.Services.Assessments;

namespace Salmandyar.API.Controllers;

[ApiController]
[Route("api/admin/assignments")]
[Authorize(Roles = "Admin,Manager")]
public class AssessmentAssignmentsController : ControllerBase
{
    private readonly IAssessmentAssignmentService _service;

    public AssessmentAssignmentsController(IAssessmentAssignmentService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<ActionResult<AssessmentAssignmentDto>> AssignAssessment(CreateAssessmentAssignmentDto dto)
    {
        try
        {
            var result = await _service.AssignAssessmentAsync(dto);
            return CreatedAtAction(nameof(GetAssignment), new { id = result.Id }, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AssessmentAssignmentDto>> GetAssignment(int id)
    {
        var result = await _service.GetAssignmentByIdAsync(id);
        if (result == null)
        {
            return NotFound();
        }
        return Ok(result);
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<List<AssessmentAssignmentDto>>> GetUserAssignments(string userId)
    {
        var result = await _service.GetUserAssignmentsAsync(userId);
        return Ok(result);
    }

    [HttpGet("summaries")]
    public async Task<ActionResult<List<UserAssessmentSummaryDto>>> GetUserSummaries([FromQuery] string? role, [FromQuery] bool? isActive)
    {
        var result = await _service.GetUserAssessmentSummariesAsync(role, isActive);
        return Ok(result);
    }

    [HttpPost("check-expired")]
    public async Task<IActionResult> CheckExpired()
    {
        await _service.MarkAsExpiredAsync();
        return Ok(new { message = "Expired assignments updated." });
    }
}
