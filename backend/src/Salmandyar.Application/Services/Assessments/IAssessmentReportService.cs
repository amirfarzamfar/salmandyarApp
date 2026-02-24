using Salmandyar.Application.DTOs.Assessments.Reports;

namespace Salmandyar.Application.Services.Assessments;

public interface IAssessmentReportService
{
    Task<List<ExamStatisticsDto>> GetExamStatisticsAsync(ReportFilterDto filter);
    Task<List<UserExamResultDto>> GetExamUserReportsAsync(int examId, ReportFilterDto filter);
    Task<UserAttemptDetailDto?> GetUserAttemptDetailAsync(int submissionId);
    Task<ExamAnalyticsDto?> GetExamAnalyticsAsync(int examId);
}
