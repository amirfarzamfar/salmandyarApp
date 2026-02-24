using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salmandyar.Application.DTOs.UserEvaluations;
using Salmandyar.Application.Services.UserEvaluations;
using Salmandyar.Domain.Enums;
using System.Security.Claims;

namespace Salmandyar.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserEvaluationsController : ControllerBase
{
    private readonly IUserEvaluationService _evaluationService;

    public UserEvaluationsController(IUserEvaluationService evaluationService)
    {
        _evaluationService = evaluationService;
    }

    [HttpPost("forms")]
    // [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateForm([FromBody] CreateUserEvaluationFormDto dto)
    {
        var form = await _evaluationService.CreateFormAsync(dto);
        return Ok(form);
    }

    [HttpGet("forms")]
    public async Task<IActionResult> GetAllForms()
    {
        var forms = await _evaluationService.GetAllFormsAsync();
        return Ok(forms);
    }

    [HttpGet("forms/details/{id}")]
    public async Task<IActionResult> GetFormById(int id)
    {
        var form = await _evaluationService.GetFormByIdAsync(id);
        if (form == null) return NotFound();
        return Ok(form);
    }

    [HttpPut("forms/{id}")]
    public async Task<IActionResult> UpdateForm(int id, [FromBody] CreateUserEvaluationFormDto dto)
    {
        try
        {
            var form = await _evaluationService.UpdateFormAsync(id, dto);
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
        await _evaluationService.DeleteFormAsync(id);
        return NoContent();
    }

    [HttpPatch("forms/{id}/toggle")]
    public async Task<IActionResult> ToggleForm(int id)
    {
        await _evaluationService.ToggleFormActivationAsync(id);
        return Ok();
    }

    [HttpGet("forms/{type}")]
    public async Task<IActionResult> GetActiveForm(AssessmentType type)
    {
        var form = await _evaluationService.GetActiveFormAsync(type);
        if (form == null) return NotFound("No active form found for this type.");
        return Ok(form);
    }

    [HttpGet("forms/list/{type}")]
    public async Task<IActionResult> GetActiveFormsByType(AssessmentType type)
    {
        var forms = await _evaluationService.GetActiveFormsByTypeAsync(type);
        return Ok(forms);
    }

    [HttpPost("submit")]
    [Authorize]
    public async Task<IActionResult> SubmitEvaluation([FromBody] SubmitUserEvaluationDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var profile = await _evaluationService.SubmitEvaluationAsync(userId, dto);
        return Ok(profile);
    }

    [HttpGet("profile")]
    [Authorize]
    public async Task<IActionResult> GetMyProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var profile = await _evaluationService.GetUserProfileAsync(userId);
        if (profile == null) return NotFound("Profile not found.");
        return Ok(profile);
    }

    [HttpGet("available")]
    [Authorize]
    public async Task<IActionResult> GetAvailableEvaluations([FromQuery] AssessmentType type)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var forms = await _evaluationService.GetAvailableEvaluationsForUserAsync(userId, type);
        return Ok(forms);
    }
}
