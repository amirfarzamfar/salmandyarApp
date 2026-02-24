using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salmandyar.Application.DTOs.UserEvaluations;
using Salmandyar.Application.Services.UserEvaluations;
using Salmandyar.Domain.Enums;
using System.Security.Claims;

namespace Salmandyar.API.Controllers;

[ApiController]
[Route("api/admin/user-evaluation-assignments")]
// [Authorize(Roles = "Admin,Manager")]
public class UserEvaluationAssignmentsController : ControllerBase
{
    private readonly IUserEvaluationAssignmentService _service;

    public UserEvaluationAssignmentsController(IUserEvaluationAssignmentService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<ActionResult<UserEvaluationAssignmentDto>> AssignEvaluation(CreateUserEvaluationAssignmentDto dto)
    {
        try
        {
            var result = await _service.AssignEvaluationAsync(dto);
            return CreatedAtAction(nameof(GetAssignment), new { id = result.Id }, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserEvaluationAssignmentDto>> GetAssignment(int id)
    {
        var result = await _service.GetAssignmentByIdAsync(id);
        if (result == null)
        {
            return NotFound();
        }
        return Ok(result);
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<List<UserEvaluationAssignmentDto>>> GetUserAssignments(string userId)
    {
        var result = await _service.GetUserAssignmentsAsync(userId);
        return Ok(result);
    }

    [HttpGet("my/pending")]
    public async Task<ActionResult<List<UserEvaluationAssignmentDto>>> GetMyPendingAssignments()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var assignments = await _service.GetUserAssignmentsAsync(userId);
        var pending = assignments.Where(a => 
            (a.Status == AssessmentAssignmentStatus.Pending || 
             a.Status == AssessmentAssignmentStatus.InProgress)
        ).ToList();
        
        return Ok(pending);
    }

    [HttpGet("summaries")]
    public async Task<ActionResult<List<UserEvaluationSummaryDto>>> GetUserSummaries([FromQuery] string? role, [FromQuery] bool? isActive, [FromQuery] AssessmentType? formType)
    {
        var result = await _service.GetUserEvaluationSummariesAsync(role, isActive, formType);
        return Ok(result);
    }

    [HttpPost("check-expired")]
    public async Task<IActionResult> CheckExpired()
    {
        await _service.MarkAsExpiredAsync();
        return Ok(new { message = "Expired assignments updated." });
    }
}
