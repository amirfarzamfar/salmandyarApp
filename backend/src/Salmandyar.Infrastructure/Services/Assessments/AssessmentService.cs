using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Salmandyar.Application.DTOs.Assessments;
using Salmandyar.Application.Services.Assessments;
using Salmandyar.Domain.Entities.Assessments;
using Salmandyar.Domain.Enums;
using Salmandyar.Infrastructure.Persistence;

namespace Salmandyar.Infrastructure.Services.Assessments;

public class AssessmentService : IAssessmentService
{
    private readonly ApplicationDbContext _context;

    public AssessmentService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AssessmentFormDto> CreateFormAsync(CreateAssessmentFormDto dto)
    {
        var form = new AssessmentForm
        {
            Title = dto.Title,
            Description = dto.Description,
            Type = dto.Type,
            IsActive = true,
            Questions = dto.Questions.Select((q, index) => new AssessmentQuestion
            {
                Text = q.Question,
                Type = q.Type,
                Weight = q.Weight,
                Tags = q.Tags,
                Order = q.Order == 0 ? index : q.Order,
                Options = q.Options.Select((o, oIndex) => new AssessmentOption
                {
                    Text = o.Text,
                    ScoreValue = o.ScoreValue,
                    Order = o.Order == 0 ? oIndex : o.Order
                }).ToList()
            }).ToList()
        };

        _context.AssessmentForms.Add(form);
        await _context.SaveChangesAsync();

        return MapToDto(form);
    }

    public async Task<List<AssessmentFormDto>> GetAllFormsAsync()
    {
        var forms = await _context.AssessmentForms
            .Include(f => f.Questions)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();

        return forms.Select(MapToDto).ToList();
    }

    public async Task<AssessmentFormDto?> GetFormByIdAsync(int id)
    {
        var form = await _context.AssessmentForms
            .Include(f => f.Questions)
                .ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(f => f.Id == id);

        if (form == null) return null;

        return MapToDto(form);
    }

    public async Task<AssessmentFormDto> UpdateFormAsync(int id, CreateAssessmentFormDto dto)
    {
        var form = await _context.AssessmentForms
            .Include(f => f.Questions)
                .ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(f => f.Id == id);

        if (form == null) throw new Exception("Form not found");

        form.Title = dto.Title;
        form.Description = dto.Description;
        form.Type = dto.Type;

        // Naive update: remove all questions and re-add them. 
        // In a real production app, we should check diffs to preserve IDs for existing questions/options.
        _context.QuestionAnswers.RemoveRange(_context.QuestionAnswers.Where(qa => qa.Question.FormId == id));
        _context.AssessmentOptions.RemoveRange(_context.AssessmentOptions.Where(o => o.Question.FormId == id));
        _context.AssessmentQuestions.RemoveRange(form.Questions);

        form.Questions = dto.Questions.Select((q, index) => new AssessmentQuestion
        {
            Text = q.Question,
            Type = q.Type,
            Weight = q.Weight,
            Tags = q.Tags,
            Order = q.Order == 0 ? index : q.Order,
            Options = q.Options.Select((o, oIndex) => new AssessmentOption
            {
                Text = o.Text,
                ScoreValue = o.ScoreValue,
                Order = o.Order == 0 ? oIndex : o.Order
            }).ToList()
        }).ToList();

        await _context.SaveChangesAsync();
        return MapToDto(form);
    }

    public async Task DeleteFormAsync(int id)
    {
        var form = await _context.AssessmentForms.FindAsync(id);
        if (form != null)
        {
            _context.AssessmentForms.Remove(form);
            await _context.SaveChangesAsync();
        }
    }

    public async Task ToggleFormActivationAsync(int id)
    {
        var form = await _context.AssessmentForms.FindAsync(id);
        if (form != null)
        {
            form.IsActive = !form.IsActive;
            await _context.SaveChangesAsync();
        }
    }

    public async Task<AssessmentFormDto?> GetActiveFormAsync(AssessmentType type)
    {
        var form = await _context.AssessmentForms
            .Include(f => f.Questions)
                .ThenInclude(q => q.Options)
            .Where(f => f.Type == type && f.IsActive)
            .OrderByDescending(f => f.CreatedAt)
            .FirstOrDefaultAsync();

        if (form == null) return null;

        return MapToDto(form);
    }

    public async Task<UserProfileDto> SubmitAssessmentAsync(string userId, SubmitAssessmentDto dto)
    {
        var form = await _context.AssessmentForms
            .Include(f => f.Questions)
                .ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(f => f.Id == dto.FormId);

        if (form == null) throw new Exception("Form not found");

        var submission = new AssessmentSubmission
        {
            FormId = dto.FormId,
            UserId = userId,
            CareRecipientId = dto.CareRecipientId,
            SubmittedAt = DateTime.UtcNow,
            Answers = new List<QuestionAnswer>()
        };

        // Process Answers and Calculate Profile
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

            var answer = new QuestionAnswer
            {
                QuestionId = question.Id,
                SelectedOptionId = answerDto.SelectedOptionId,
                TextResponse = answerDto.TextResponse,
                BooleanResponse = answerDto.BooleanResponse
            };

            submission.Answers.Add(answer);

            // Scoring Logic
            int points = 0;
            if (question.Type == QuestionType.MultipleChoice && answerDto.SelectedOptionId.HasValue)
            {
                var option = question.Options.FirstOrDefault(o => o.Id == answerDto.SelectedOptionId);
                if (option != null) points = option.ScoreValue;
            }
            else if (question.Type == QuestionType.TrueFalse && answerDto.BooleanResponse.HasValue)
            {
                points = answerDto.BooleanResponse.Value ? 1 : 0; // Simplified
            }

            int weightedScore = points * question.Weight;
            totalScore += weightedScore;

            // Profile Tagging Logic
            foreach (var tag in question.Tags)
            {
                ProcessTag(profile, tag, weightedScore);
            }

            // Text Analysis (Simple Keyword Matching)
            if (!string.IsNullOrEmpty(answerDto.TextResponse))
            {
                var extractedTags = ExtractTagsFromText(answerDto.TextResponse);
                foreach (var tag in extractedTags)
                {
                    ProcessTag(profile, tag, question.Weight); // Give some weight to text tags
                }
            }
        }

        submission.TotalScore = totalScore;
        submission.AnalysisResultJson = JsonSerializer.Serialize(profile);

        _context.AssessmentSubmissions.Add(submission);
        await _context.SaveChangesAsync();

        return profile;
    }

    public async Task<UserProfileDto?> GetUserProfileAsync(string userId)
    {
        var submission = await _context.AssessmentSubmissions
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.SubmittedAt)
            .FirstOrDefaultAsync();

        if (submission == null || string.IsNullOrEmpty(submission.AnalysisResultJson))
            return null;

        return JsonSerializer.Deserialize<UserProfileDto>(submission.AnalysisResultJson);
    }

    private void ProcessTag(UserProfileDto profile, string tag, int score)
    {
        // Expected Tag Format: "Category:Name" (e.g., "Skill:Injection", "Need:Mobility")
        // If no colon, default to Skill or Need based on Role? Let's assume generic.
        
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
        // Simple mock implementation
        var tags = new List<string>();
        var lowerText = text.ToLower();
        
        if (lowerText.Contains("night") || lowerText.Contains("شب")) tags.Add("Preference:NightShift");
        if (lowerText.Contains("injection") || lowerText.Contains("تزریق")) tags.Add("Skill:Injection");
        if (lowerText.Contains("diabetes") || lowerText.Contains("دیابت")) tags.Add("Need:DiabetesCare");
        
        return tags;
    }

    private AssessmentFormDto MapToDto(AssessmentForm form)
    {
        return new AssessmentFormDto
        {
            Id = form.Id,
            Title = form.Title,
            Description = form.Description,
            Type = form.Type,
            Questions = form.Questions.OrderBy(q => q.Order).Select(q => new QuestionDto
            {
                QuestionId = q.Id,
                Type = q.Type.ToString(),
                Question = q.Text,
                Weight = q.Weight,
                Tags = q.Tags,
                Options = q.Options.OrderBy(o => o.Order).Select(o => new OptionDto
                {
                    Id = o.Id,
                    Text = o.Text,
                    Value = o.ScoreValue
                }).ToList()
            }).ToList()
        };
    }
}
