using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salmandyar.Application.Services.Assessments;
using Salmandyar.Domain.Enums;

namespace Salmandyar.API.Controllers;

[ApiController]
[Route("api/public/forms")]
public class PublicFormsController : ControllerBase
{
    private readonly IAssessmentService _assessmentService;

    public PublicFormsController(IAssessmentService assessmentService)
    {
        _assessmentService = assessmentService;
    }

    [HttpGet("guest-service-request")]
    [AllowAnonymous]
    public async Task<IActionResult> GetGuestServiceRequestForm([FromQuery] int? serviceDefinitionId, [FromQuery] string? code)
    {
        var form = await _assessmentService.GetActivePublicFormByWorkflowAsync(
            AssessmentFormWorkflow.GuestServiceRequest,
            serviceDefinitionId,
            code);

        if (form == null)
        {
            return NotFound("No active guest request form found.");
        }

        return Ok(form);
    }

    [HttpGet("by-code/{code}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetByCode(string code)
    {
        var form = await _assessmentService.GetActivePublicFormByWorkflowAsync(
            AssessmentFormWorkflow.GuestServiceRequest,
            null,
            code);

        if (form == null)
        {
            return NotFound("No active form found for this code.");
        }

        return Ok(form);
    }
}

