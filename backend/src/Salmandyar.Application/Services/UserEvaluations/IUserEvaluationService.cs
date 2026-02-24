using Salmandyar.Application.DTOs.UserEvaluations;
using Salmandyar.Application.DTOs.Assessments;
using Salmandyar.Domain.Enums;

namespace Salmandyar.Application.Services.UserEvaluations;

public interface IUserEvaluationService
{
    Task<UserEvaluationFormDto> CreateFormAsync(CreateUserEvaluationFormDto dto);
    Task<List<UserEvaluationFormDto>> GetAllFormsAsync();
    Task<UserEvaluationFormDto?> GetFormByIdAsync(int id);
    Task<UserEvaluationFormDto> UpdateFormAsync(int id, CreateUserEvaluationFormDto dto);
    Task DeleteFormAsync(int id);
    Task ToggleFormActivationAsync(int id);
    Task<UserEvaluationFormDto?> GetActiveFormAsync(AssessmentType type);
    Task<List<UserEvaluationFormDto>> GetActiveFormsByTypeAsync(AssessmentType type);
    
    // This handles submission as well, often kept together with Form service or separate Submission service
    Task<UserProfileDto> SubmitEvaluationAsync(string userId, SubmitUserEvaluationDto dto);
    Task<UserProfileDto?> GetUserProfileAsync(string userId);
    Task<List<UserEvaluationFormDto>> GetAvailableEvaluationsForUserAsync(string userId, AssessmentType roleType);
}
