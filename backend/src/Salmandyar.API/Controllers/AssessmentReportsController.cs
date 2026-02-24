using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salmandyar.Application.DTOs.Assessments.Reports;
using Salmandyar.Application.Services.Assessments;
using Salmandyar.Domain.Constants;

namespace Salmandyar.API.Controllers;

[ApiController]
[Route("api/assessment-reports")]
// [Authorize(Roles = Roles.Admin)] // Should be restricted to Admin
public class AssessmentReportsController : ControllerBase
{
    private readonly IAssessmentReportService _reportService;

    public AssessmentReportsController(IAssessmentReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<List<ExamStatisticsDto>>> GetExamStatistics([FromQuery] ReportFilterDto filter)
    {
        var stats = await _reportService.GetExamStatisticsAsync(filter);
        return Ok(stats);
    }

    [HttpGet("exams/{examId}")]
    public async Task<ActionResult<List<UserExamResultDto>>> GetExamUserReports(int examId, [FromQuery] ReportFilterDto filter)
    {
        var reports = await _reportService.GetExamUserReportsAsync(examId, filter);
        return Ok(reports);
    }

    [HttpGet("attempts/{submissionId}")]
    public async Task<ActionResult<UserAttemptDetailDto>> GetUserAttemptDetail(int submissionId)
    {
        var detail = await _reportService.GetUserAttemptDetailAsync(submissionId);
        if (detail == null) return NotFound();
        return Ok(detail);
    }

    [HttpGet("analytics/{examId}")]
    public async Task<ActionResult<ExamAnalyticsDto>> GetExamAnalytics(int examId)
    {
        var analytics = await _reportService.GetExamAnalyticsAsync(examId);
        if (analytics == null) return NotFound();
        return Ok(analytics);
    }
}
