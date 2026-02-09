using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salmandyar.Application.DTOs.Assessments;
using Salmandyar.Application.Services.Assessments;
using Salmandyar.Domain.Enums;
using System.Security.Claims;

namespace Salmandyar.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AssessmentsController : ControllerBase
{
    private readonly IAssessmentService _assessmentService;

    public AssessmentsController(IAssessmentService assessmentService)
    {
        _assessmentService = assessmentService;
    }

    [HttpPost("forms")]
    // [Authorize(Roles = "Admin")] // Uncomment when roles are set up
    public async Task<IActionResult> CreateForm([FromBody] CreateAssessmentFormDto dto)
    {
        var form = await _assessmentService.CreateFormAsync(dto);
        return Ok(form);
    }

    [HttpGet("forms")]
    public async Task<IActionResult> GetAllForms()
    {
        var forms = await _assessmentService.GetAllFormsAsync();
        return Ok(forms);
    }

    [HttpGet("forms/details/{id}")]
    public async Task<IActionResult> GetFormById(int id)
    {
        var form = await _assessmentService.GetFormByIdAsync(id);
        if (form == null) return NotFound();
        return Ok(form);
    }

    [HttpPut("forms/{id}")]
    public async Task<IActionResult> UpdateForm(int id, [FromBody] CreateAssessmentFormDto dto)
    {
        try
        {
            var form = await _assessmentService.UpdateFormAsync(id, dto);
            return Ok(form);
        }
        catch (Exception ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpDelete("forms/{id}")]
    public async Task<IActionResult> DeleteForm(int id)
    {
        await _assessmentService.DeleteFormAsync(id);
        return NoContent();
    }

    [HttpPatch("forms/{id}/toggle")]
    public async Task<IActionResult> ToggleForm(int id)
    {
        await _assessmentService.ToggleFormActivationAsync(id);
        return Ok();
    }

    [HttpGet("forms/{type}")]
    public async Task<IActionResult> GetActiveForm(AssessmentType type)
    {
        var form = await _assessmentService.GetActiveFormAsync(type);
        if (form == null) return NotFound("No active form found for this type.");
        return Ok(form);
    }

    [HttpGet("forms/list/{type}")]
    public async Task<IActionResult> GetActiveFormsByType(AssessmentType type)
    {
        var forms = await _assessmentService.GetActiveFormsByTypeAsync(type);
        return Ok(forms);
    }

    [HttpPost("submit")]
    [Authorize]
    public async Task<IActionResult> SubmitAssessment([FromBody] SubmitAssessmentDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var profile = await _assessmentService.SubmitAssessmentAsync(userId, dto);
        return Ok(profile);
    }

    [HttpGet("profile")]
    [Authorize]
    public async Task<IActionResult> GetMyProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var profile = await _assessmentService.GetUserProfileAsync(userId);
        if (profile == null) return NotFound("Profile not found.");
        return Ok(profile);
    }
}
