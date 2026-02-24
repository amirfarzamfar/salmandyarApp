using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Salmandyar.Application.DTOs.Assessments;
using Salmandyar.Application.DTOs.UserEvaluations;
using Salmandyar.Application.Services.UserEvaluations;
using Salmandyar.Domain.Entities.UserEvaluations;
using Salmandyar.Domain.Enums;
using Salmandyar.Infrastructure.Persistence;

namespace Salmandyar.Infrastructure.Services.UserEvaluations;

public class UserEvaluationService : IUserEvaluationService
{
    private readonly ApplicationDbContext _context;

    public UserEvaluationService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UserEvaluationFormDto> CreateFormAsync(CreateUserEvaluationFormDto dto)
    {
        var form = new UserEvaluationForm
        {
            Title = dto.Title,
            Description = dto.Description,
            Type = dto.Type,
            IsActive = true,
            Questions = dto.Questions.Select((q, index) => new UserEvaluationQuestion
            {
                Text = q.Question,
                Type = q.Type,
                Weight = q.Weight,
                Tags = q.Tags,
                Order = q.Order == 0 ? index : q.Order,
                Options = q.Options.Select((o, oIndex) => new UserEvaluationOption
                {
                    Text = o.Text,
                    ScoreValue = o.ScoreValue,
                    Order = o.Order == 0 ? oIndex : o.Order
                }).ToList()
            }).ToList()
        };

        _context.UserEvaluationForms.Add(form);
        await _context.SaveChangesAsync();

        return MapToDto(form);
    }

    public async Task<List<UserEvaluationFormDto>> GetAllFormsAsync()
    {
        var forms = await _context.UserEvaluationForms
            .Include(f => f.Questions)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();

        return forms.Select(MapToDto).ToList();
    }

    public async Task<UserEvaluationFormDto?> GetFormByIdAsync(int id)
    {
        var form = await _context.UserEvaluationForms
            .Include(f => f.Questions)
                .ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(f => f.Id == id);

        if (form == null) return null;

        return MapToDto(form);
    }

    public async Task<UserEvaluationFormDto> UpdateFormAsync(int id, CreateUserEvaluationFormDto dto)
    {
        var form = await _context.UserEvaluationForms
            .Include(f => f.Questions)
                .ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(f => f.Id == id);

        if (form == null) throw new Exception("Form not found");

        form.Title = dto.Title;
        form.Description = dto.Description;
        form.Type = dto.Type;

        // Remove existing questions and options (Naive update)
        var existingQuestionIds = form.Questions.Select(q => q.Id).ToList();
        
        // Remove answers related to these questions if any (Optional: might want to prevent update if submissions exist)
        // For now, following the pattern in AssessmentService
        var questionsToRemove = _context.UserEvaluationQuestions.Where(q => existingQuestionIds.Contains(q.Id));
        _context.UserEvaluationQuestions.RemoveRange(questionsToRemove);

        // Note: EF Core cascade delete should handle options and answers if configured correctly.
        // But to be safe and explicit:
        // _context.UserEvaluationOptions.RemoveRange(_context.UserEvaluationOptions.Where(o => existingQuestionIds.Contains(o.QuestionId)));
        
        // Clear the collection in memory
        form.Questions.Clear();

        // Add new questions
        foreach (var qDto in dto.Questions.Select((q, index) => new { q, index }))
        {
            var newQuestion = new UserEvaluationQuestion
            {
                Text = qDto.q.Question,
                Type = qDto.q.Type,
                Weight = qDto.q.Weight,
                Tags = qDto.q.Tags,
                Order = qDto.q.Order == 0 ? qDto.index : qDto.q.Order,
                FormId = form.Id 
            };
            
            foreach (var oDto in qDto.q.Options.Select((o, oIndex) => new { o, oIndex }))
            {
                newQuestion.Options.Add(new UserEvaluationOption
                {
                    Text = oDto.o.Text,
                    ScoreValue = oDto.o.ScoreValue,
                    Order = oDto.o.Order == 0 ? oDto.oIndex : oDto.o.Order
                });
            }
            
            form.Questions.Add(newQuestion);
        }

        await _context.SaveChangesAsync();
        return MapToDto(form);
    }

    public async Task DeleteFormAsync(int id)
    {
        var form = await _context.UserEvaluationForms.FindAsync(id);
        if (form != null)
        {
            _context.UserEvaluationForms.Remove(form);
            await _context.SaveChangesAsync();
        }
    }

    public async Task ToggleFormActivationAsync(int id)
    {
        var form = await _context.UserEvaluationForms.FindAsync(id);
        if (form != null)
        {
            form.IsActive = !form.IsActive;
            await _context.SaveChangesAsync();
        }
    }

    public async Task<UserEvaluationFormDto?> GetActiveFormAsync(AssessmentType type)
    {
        var form = await _context.UserEvaluationForms
            .Include(f => f.Questions)
                .ThenInclude(q => q.Options)
            .Where(f => f.Type == type && f.IsActive)
            .OrderByDescending(f => f.CreatedAt)
            .FirstOrDefaultAsync();

        if (form == null) return null;

        return MapToDto(form);
    }

    public async Task<List<UserEvaluationFormDto>> GetActiveFormsByTypeAsync(AssessmentType type)
    {
        var forms = await _context.UserEvaluationForms
            .Include(f => f.Questions)
                .ThenInclude(q => q.Options)
            .Where(f => f.Type == type && f.IsActive)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();

        return forms.Select(MapToDto).ToList();
    }

    public async Task<UserProfileDto> SubmitEvaluationAsync(string userId, SubmitUserEvaluationDto dto)
    {
        var form = await _context.UserEvaluationForms
            .Include(f => f.Questions)
                .ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(f => f.Id == dto.FormId);

        if (form == null) throw new Exception("Form not found");

        var submission = new UserEvaluationSubmission
        {
            FormId = dto.FormId,
            UserId = userId,
            CareRecipientId = dto.CareRecipientId,
            SubmittedAt = DateTime.UtcNow,
            Answers = new List<UserEvaluationAnswer>()
        };

        var profile = new UserProfileDto
        {
            UserId = userId,
            Role = form.Type == AssessmentType.NurseAssessment ? "Nurse" : "Senior"
        };

        double totalScore = 0;

        foreach (var answerDto in dto.Answers)
        {
            var question = form.Questions.FirstOrDefault(q => q.Id == answerDto.QuestionId);
            if (question == null) continue;

            var answer = new UserEvaluationAnswer
            {
                QuestionId = question.Id,
                SelectedOptionId = answerDto.SelectedOptionId,
                TextResponse = answerDto.TextResponse,
                BooleanResponse = answerDto.BooleanResponse
            };

            submission.Answers.Add(answer);

            int points = 0;
            if (question.Type == QuestionType.MultipleChoice && answerDto.SelectedOptionId.HasValue)
            {
                var option = question.Options.FirstOrDefault(o => o.Id == answerDto.SelectedOptionId);
                if (option != null) points = option.ScoreValue;
            }
            else if (question.Type == QuestionType.TrueFalse && answerDto.BooleanResponse.HasValue)
            {
                points = answerDto.BooleanResponse.Value ? 1 : 0;
            }

            int weightedScore = points * question.Weight;
            totalScore += weightedScore;

            foreach (var tag in question.Tags)
            {
                ProcessTag(profile, tag, weightedScore);
            }

            if (!string.IsNullOrEmpty(answerDto.TextResponse))
            {
                var extractedTags = ExtractTagsFromText(answerDto.TextResponse);
                foreach (var tag in extractedTags)
                {
                    ProcessTag(profile, tag, question.Weight);
                }
            }
        }

        submission.TotalScore = totalScore;
        submission.AnalysisResultJson = JsonSerializer.Serialize(profile);

        _context.UserEvaluationSubmissions.Add(submission);
        await _context.SaveChangesAsync();

        return profile;
    }

    public async Task<UserProfileDto?> GetUserProfileAsync(string userId)
    {
        var submission = await _context.UserEvaluationSubmissions
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.SubmittedAt)
            .FirstOrDefaultAsync();

        if (submission == null || string.IsNullOrEmpty(submission.AnalysisResultJson))
            return null;

        return JsonSerializer.Deserialize<UserProfileDto>(submission.AnalysisResultJson);
    }

    public async Task<List<UserEvaluationFormDto>> GetAvailableEvaluationsForUserAsync(string userId, AssessmentType roleType)
    {
        var submittedFormIds = await _context.UserEvaluationSubmissions
            .Where(s => s.UserId == userId)
            .Select(s => s.FormId)
            .ToListAsync();

        var publicForms = await _context.UserEvaluationForms
            .Include(f => f.Questions)
                .ThenInclude(q => q.Options)
            .Where(f => f.IsActive && f.Type == roleType && !submittedFormIds.Contains(f.Id))
            .ToListAsync();

        var assignedFormIds = await _context.UserEvaluationAssignments
            .Where(a => a.UserId == userId && !a.IsDeleted && 
                       (a.Status == AssessmentAssignmentStatus.Pending || a.Status == AssessmentAssignmentStatus.InProgress))
            .Select(a => a.FormId)
            .ToListAsync();

        var assignedForms = await _context.UserEvaluationForms
            .Include(f => f.Questions)
                .ThenInclude(q => q.Options)
            .Where(f => assignedFormIds.Contains(f.Id) && f.IsActive && !submittedFormIds.Contains(f.Id))
            .ToListAsync();

        var allForms = publicForms.UnionBy(assignedForms, f => f.Id).ToList();

        return allForms.Select(MapToDto).ToList();
    }

    private void ProcessTag(UserProfileDto profile, string tag, int score)
    {
        var parts = tag.Split(':');
        string category = parts.Length > 1 ? parts[0] : "General";
        string name = parts.Length > 1 ? parts[1] : tag;

        if (category.Equals("Skill", StringComparison.OrdinalIgnoreCase))
        {
            if (!profile.Skills.ContainsKey(name)) profile.Skills[name] = 0;
            profile.Skills[name] += score;
        }
        else if (category.Equals("Need", StringComparison.OrdinalIgnoreCase))
        {
            if (!profile.Needs.ContainsKey(name)) profile.Needs[name] = 0;
            profile.Needs[name] += score;
        }
        else if (category.Equals("Personality", StringComparison.OrdinalIgnoreCase))
        {
            if (!profile.Personality.ContainsKey(name)) profile.Personality[name] = 0;
            profile.Personality[name] += score;
        }
        else if (category.Equals("Preference", StringComparison.OrdinalIgnoreCase))
        {
             profile.Preferences[name] = true;
        }
    }

    private List<string> ExtractTagsFromText(string text)
    {
        var tags = new List<string>();
        var lowerText = text.ToLower();
        
        if (lowerText.Contains("night") || lowerText.Contains("شب")) tags.Add("Preference:NightShift");
        if (lowerText.Contains("injection") || lowerText.Contains("تزریق")) tags.Add("Skill:Injection");
        if (lowerText.Contains("diabetes") || lowerText.Contains("دیابت")) tags.Add("Need:DiabetesCare");
        
        return tags;
    }

    private UserEvaluationFormDto MapToDto(UserEvaluationForm form)
    {
        return new UserEvaluationFormDto
        {
            Id = form.Id,
            Title = form.Title,
            Description = form.Description,
            Type = form.Type,
            IsActive = form.IsActive,
            Questions = form.Questions.OrderBy(q => q.Order).Select(q => new UserEvaluationQuestionDto
            {
                QuestionId = q.Id,
                Type = q.Type,
                Question = q.Text,
                Weight = q.Weight,
                Tags = q.Tags,
                Order = q.Order,
                Options = q.Options.OrderBy(o => o.Order).Select(o => new UserEvaluationOptionDto
                {
                    Id = o.Id,
                    Text = o.Text,
                    Value = o.ScoreValue,
                    Order = o.Order
                }).ToList()
            }).ToList()
        };
    }
}
