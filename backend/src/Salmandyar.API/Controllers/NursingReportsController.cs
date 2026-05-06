using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salmandyar.Application.Services.NursingReports;
using Salmandyar.Application.Services.NursingReports.Dtos;
using Salmandyar.Application.Services.Patients;
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
        if (User.IsInRole(Roles.SuperAdmin) || User.IsInRole(Roles.Admin) || User.IsInRole(Roles.Manager) || User.IsInRole(Roles.Supervisor))
        {
            return null;
        }
        return User.FindFirstValue(ClaimTypes.NameIdentifier);
    }

    [HttpPost]
    public async Task<IActionResult> CreateReport(SubmitNursingReportDto dto)
    {
        var authorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (authorId == null) return Unauthorized();

        var restrictedCaregiverId = GetCaregiverIdIfRestricted();
        var patient = await _patientService.GetPatientByIdAsync(dto.CareRecipientId, restrictedCaregiverId);
        if (patient == null) return Forbid();

        var report = await _service.CreateReportAsync(authorId, dto);
        return Ok(new { id = report.Id });
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
