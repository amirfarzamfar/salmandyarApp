using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salmandyar.Application.Services.NursingReports;
using Salmandyar.Application.Services.NursingReports.Dtos;

namespace Salmandyar.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NursingReportsController : ControllerBase
{
    private readonly INursingReportService _service;

    public NursingReportsController(INursingReportService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> CreateReport(SubmitNursingReportDto dto)
    {
        var authorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (authorId == null) return Unauthorized();

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
