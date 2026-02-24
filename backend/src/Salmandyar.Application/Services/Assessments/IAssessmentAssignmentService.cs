using Salmandyar.Application.DTOs.Assessments;

namespace Salmandyar.Application.Services.Assessments;

public interface IAssessmentAssignmentService
{
    Task<AssessmentAssignmentDto> AssignAssessmentAsync(CreateAssessmentAssignmentDto dto);
    Task<List<AssessmentAssignmentDto>> GetUserAssignmentsAsync(string userId);
    Task<List<UserAssessmentSummaryDto>> GetUserAssessmentSummariesAsync(string? role = null, bool? isActive = null, AssessmentType? formType = null, bool excludeExams = false);
    Task<AssessmentAssignmentDto?> GetAssignmentByIdAsync(int id);
    Task MarkAsExpiredAsync(); // Scheduled task potentially
}
