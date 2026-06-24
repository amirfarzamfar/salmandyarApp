using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salmandyar.Application.Services.NursingReports;
using Salmandyar.Application.Services.NursingReports.Dtos;
using Salmandyar.Application.Services.Patients;
using Salmandyar.Application.Services.PatientSelfServiceAccess;
using Salmandyar.Domain.Constants;

namespace Salmandyar.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NursingReportsController : ControllerBase
{
    private readonly INursingReportService _service;
    private readonly IPatientService _patientService;

    public NursingReportsController(INursingReportService service, IPatientService patientService)
    {
        _service = service;
        _patientService = patientService;
    }

    private string? GetCaregiverIdIfRestricted()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return null;

        var isShiftRestrictedStaff =
            User.IsInRole(Roles.Nurse) ||
            User.IsInRole(Roles.AssistantNurse) ||
            User.IsInRole(Roles.Physiotherapist) ||
            User.IsInRole(Roles.ElderlyCareAssistant);

        if (isShiftRestrictedStaff)
        {
            return userId;
        }

        if (User.IsInRole(Roles.SuperAdmin) || User.IsInRole(Roles.Admin) || User.IsInRole(Roles.Manager) || User.IsInRole(Roles.Supervisor))
        {
            return null;
        }

        return userId;
    }

    [HttpPost]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor},{Roles.Nurse},{Roles.AssistantNurse},{Roles.Physiotherapist},{Roles.ElderlyCareAssistant}")]
    public async Task<IActionResult> CreateReport(SubmitNursingReportDto dto)
    {
        var authorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (authorId == null) return Unauthorized();

        var restrictedCaregiverId = GetCaregiverIdIfRestricted();
        var patient = await _patientService.GetPatientByIdAsync(dto.CareRecipientId, restrictedCaregiverId);
        if (patient == null) return Forbid();

        try
        {
            var report = await _service.CreateReportAsync(authorId, dto);
            return Ok(new { id = report.Id });
        }
        catch (PatientSelfServiceAccessDeniedException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { error = ex.Message });
        }
    }

    [HttpGet("my-reports")]
    public async Task<IActionResult> GetMyReports()
    {
        var authorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (authorId == null) return Unauthorized();

        var reports = await _service.GetReportsByAuthorAsync(authorId);
        return Ok(reports);
    }
}
