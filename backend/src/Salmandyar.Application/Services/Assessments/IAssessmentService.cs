using Salmandyar.Application.DTOs.Assessments;
using Salmandyar.Domain.Enums;

namespace Salmandyar.Application.Services.Assessments;

public interface IAssessmentService
{
    Task<AssessmentFormDto> CreateFormAsync(CreateAssessmentFormDto dto);
    Task<List<AssessmentFormDto>> GetAllFormsAsync();
    Task<AssessmentFormDto?> GetFormByIdAsync(int id);
    Task<AssessmentFormDto> UpdateFormAsync(int id, CreateAssessmentFormDto dto);
    Task DeleteFormAsync(int id);
    Task ToggleFormActivationAsync(int id);
    Task<AssessmentFormDto?> GetActiveFormAsync(AssessmentType type);
    Task<List<AssessmentFormDto>> GetActiveFormsByTypeAsync(AssessmentType type);
    Task<UserProfileDto> SubmitAssessmentAsync(string userId, SubmitAssessmentDto dto);
    Task<UserProfileDto?> GetUserProfileAsync(string userId);
    Task<List<AssessmentFormDto>> GetAvailableAssessmentsForUserAsync(string userId, AssessmentType roleType);
}
