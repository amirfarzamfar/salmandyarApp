using Salmandyar.Application.DTOs.UserEvaluations;
using Salmandyar.Domain.Enums;

namespace Salmandyar.Application.Services.UserEvaluations;

public interface IUserEvaluationAssignmentService
{
    Task<UserEvaluationAssignmentDto> AssignEvaluationAsync(CreateUserEvaluationAssignmentDto dto);
    Task<List<UserEvaluationAssignmentDto>> GetUserAssignmentsAsync(string userId);
    Task<List<UserEvaluationSummaryDto>> GetUserEvaluationSummariesAsync(string? role = null, bool? isActive = null, AssessmentType? formType = null);
    Task<UserEvaluationAssignmentDto?> GetAssignmentByIdAsync(int id);
    Task MarkAsExpiredAsync();
}
