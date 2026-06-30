using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salmandyar.Application.DTOs.Assessments;
using Salmandyar.Application.Services.Assessments;
using Salmandyar.Domain.Enums;
using System.Security.Claims;

namespace Salmandyar.API.Controllers;

[ApiController]
[Route("api/admin/assignments")]
public class AssessmentAssignmentsController : ControllerBase
{
    private readonly IAssessmentAssignmentService _service;

    public AssessmentAssignmentsController(IAssessmentAssignmentService service)
    {
        _service = service;
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
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

    [HttpPost("bulk")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<List<AssessmentAssignmentDto>>> BulkAssignAssessment(BulkAssignAssessmentDto dto)
    {
        var results = await _service.BulkAssignAssessmentAsync(dto);
        return Ok(results);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,Manager")]
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
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<List<AssessmentAssignmentDto>>> GetUserAssignments(string userId)
    {
        var result = await _service.GetUserAssignmentsAsync(userId);
        return Ok(result);
    }

    [HttpGet("my/pending")]
    [Authorize]
    public async Task<ActionResult<List<AssessmentAssignmentDto>>> GetMyPendingAssignments()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var assignments = await _service.GetUserAssignmentsAsync(userId);
        var pending = assignments.Where(a => 
            (a.Status == Domain.Enums.AssessmentAssignmentStatus.Pending || 
             a.Status == Domain.Enums.AssessmentAssignmentStatus.InProgress)
        ).ToList();
        
        return Ok(pending);
    }

    [HttpGet("summaries")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<List<UserAssessmentSummaryDto>>> GetUserSummaries([FromQuery] string? role, [FromQuery] bool? isActive, [FromQuery] AssessmentType? formType, [FromQuery] bool excludeExams = false)
    {
        var result = await _service.GetUserAssessmentSummariesAsync(role, isActive, formType, excludeExams);
        return Ok(result);
    }

    [HttpPost("check-expired")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> CheckExpired()
    {
        await _service.MarkAsExpiredAsync();
        return Ok(new { message = "Expired assignments updated." });
    }
}
