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
        var targetTypes = NormalizeTargetTypes(dto.Type, dto.TargetTypes);
        var serviceDefinitionId = dto.Workflow == AssessmentFormWorkflow.HomeCareRequest
            ? dto.ServiceDefinitionId
            : null;

        var form = new AssessmentForm
        {
            Code = string.IsNullOrWhiteSpace(dto.Code)
                ? ($"form-{Guid.NewGuid():N}")[..13]
                : dto.Code.Trim(),
            Title = dto.Title,
            Description = dto.Description,
            Type = targetTypes[0],
            TargetTypesJson = SerializeTargetTypes(targetTypes),
            Workflow = dto.Workflow,
            IsActive = true,
            Version = dto.Version <= 0 ? 1 : dto.Version,
            IsDefault = dto.IsDefault,
            ServiceDefinitionId = serviceDefinitionId,
            IntroTitle = dto.IntroTitle,
            IntroDescription = dto.IntroDescription,
            EstimatedDurationMinutes = dto.EstimatedDurationMinutes,
            LayoutJson = dto.LayoutJson,
            Questions = dto.Questions.Select((q, index) => new AssessmentQuestion
            {
                Text = q.Question,
                Type = q.Type,
                Weight = q.Weight,
                Tags = q.Tags,
                Order = q.Order == 0 ? index : q.Order,
                QuestionKey = string.IsNullOrEmpty(q.QuestionKey) ? Guid.NewGuid().ToString() : q.QuestionKey,
                NextQuestionKey = q.NextQuestionKey,
                PageKey = q.PageKey,
                PageTitle = q.PageTitle,
                GroupKey = q.GroupKey,
                GroupTitle = q.GroupTitle,
                IsRequired = q.IsRequired,
                Placeholder = q.Placeholder,
                Description = q.Description,
                VisibilityConditionJson = q.VisibilityConditionJson,
                RequiredConditionJson = q.RequiredConditionJson,
                ValidationJson = q.ValidationJson,
                MinValue = q.MinValue,
                MaxValue = q.MaxValue,
                MinFiles = q.MinFiles,
                MaxFiles = q.MaxFiles,
                AllowMultipleFiles = q.AllowMultipleFiles,
                Options = q.Options.Select((o, oIndex) => new AssessmentOption
                {
                    Text = o.Text,
                    ScoreValue = o.ScoreValue,
                    Order = o.Order == 0 ? oIndex : o.Order,
                    NextQuestionKey = o.NextQuestionKey
                }).ToList()
            }).ToList()
        };

        _context.AssessmentForms.Add(form);
        await _context.SaveChangesAsync();
        await SyncDefaultHomeCareFormAsync(form);

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

        var targetTypes = NormalizeTargetTypes(dto.Type, dto.TargetTypes);
        var serviceDefinitionId = dto.Workflow == AssessmentFormWorkflow.HomeCareRequest
            ? dto.ServiceDefinitionId
            : null;

        form.Title = dto.Title;
        form.Description = dto.Description;
        form.Type = targetTypes[0];
        form.Code = string.IsNullOrWhiteSpace(dto.Code) ? form.Code : dto.Code.Trim();
        form.TargetTypesJson = SerializeTargetTypes(targetTypes);
        form.Workflow = dto.Workflow;
        form.Version = dto.Version <= 0 ? form.Version : dto.Version;
        form.IsDefault = dto.IsDefault;
        form.ServiceDefinitionId = serviceDefinitionId;
        form.IntroTitle = dto.IntroTitle;
        form.IntroDescription = dto.IntroDescription;
        form.EstimatedDurationMinutes = dto.EstimatedDurationMinutes;
        form.LayoutJson = dto.LayoutJson;
        form.UpdatedAt = DateTime.UtcNow;

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
            QuestionKey = string.IsNullOrEmpty(q.QuestionKey) ? Guid.NewGuid().ToString() : q.QuestionKey,
            NextQuestionKey = q.NextQuestionKey,
            PageKey = q.PageKey,
            PageTitle = q.PageTitle,
            GroupKey = q.GroupKey,
            GroupTitle = q.GroupTitle,
            IsRequired = q.IsRequired,
            Placeholder = q.Placeholder,
            Description = q.Description,
            VisibilityConditionJson = q.VisibilityConditionJson,
            RequiredConditionJson = q.RequiredConditionJson,
            ValidationJson = q.ValidationJson,
            MinValue = q.MinValue,
            MaxValue = q.MaxValue,
            MinFiles = q.MinFiles,
            MaxFiles = q.MaxFiles,
            AllowMultipleFiles = q.AllowMultipleFiles,
            Options = q.Options.Select((o, oIndex) => new AssessmentOption
            {
                Text = o.Text,
                ScoreValue = o.ScoreValue,
                Order = o.Order == 0 ? oIndex : o.Order,
                NextQuestionKey = o.NextQuestionKey
            }).ToList()
        }).ToList();

        await _context.SaveChangesAsync();
        await SyncDefaultHomeCareFormAsync(form);
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
        var forms = await _context.AssessmentForms
            .Include(f => f.Questions)
                .ThenInclude(q => q.Options)
            .Where(f => f.IsActive)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();

        var form = forms.FirstOrDefault(f => MatchesTargetType(f, type));

        if (form == null) return null;

        return MapToDto(form);
    }

    public async Task<List<AssessmentFormDto>> GetActiveFormsByTypeAsync(AssessmentType type)
    {
        var forms = await _context.AssessmentForms
            .Include(f => f.Questions)
                .ThenInclude(q => q.Options)
            .Where(f => f.IsActive)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();

        return forms.Where(f => MatchesTargetType(f, type)).Select(MapToDto).ToList();
    }

    public async Task<UserProfileDto> SubmitAssessmentAsync(string userId, SubmitAssessmentDto dto)
    {
        var form = await _context.AssessmentForms
            .Include(f => f.Questions)
                .ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(f => f.Id == dto.FormId);

        if (form == null) throw new Exception("Form not found");

        // Check for existing submission
        var existingSubmission = await _context.AssessmentSubmissions
            .Where(s => s.UserId == userId && s.FormId == dto.FormId && s.Status == AssessmentSubmissionStatus.Submitted)
            .AnyAsync();
            
        if (existingSubmission && !dto.SaveAsDraft)
        {
            throw new InvalidOperationException("User has already submitted this assessment.");
        }

        AssessmentSubmission submission;
        if (dto.SubmissionId.HasValue)
        {
            submission = await _context.AssessmentSubmissions
                .Include(s => s.Answers)
                .FirstOrDefaultAsync(s => s.Id == dto.SubmissionId.Value && s.UserId == userId)
                ?? throw new InvalidOperationException("پیش‌نویس فرم یافت نشد.");

            _context.QuestionAnswers.RemoveRange(submission.Answers);
            submission.Answers.Clear();
            submission.CareRecipientId = dto.CareRecipientId;
            submission.DraftKey = dto.DraftKey;
            submission.SummaryJson = dto.SummaryJson;
            submission.LastSavedAt = DateTime.UtcNow;
            submission.Status = dto.SaveAsDraft ? AssessmentSubmissionStatus.Draft : AssessmentSubmissionStatus.Submitted;
            if (!dto.SaveAsDraft)
            {
                submission.SubmittedAt = DateTime.UtcNow;
            }
        }
        else
        {
            submission = new AssessmentSubmission
            {
                FormId = dto.FormId,
                UserId = userId,
                CareRecipientId = dto.CareRecipientId,
                DraftKey = dto.DraftKey,
                SummaryJson = dto.SummaryJson,
                SubmittedAt = DateTime.UtcNow,
                LastSavedAt = DateTime.UtcNow,
                Status = dto.SaveAsDraft ? AssessmentSubmissionStatus.Draft : AssessmentSubmissionStatus.Submitted,
                Answers = new List<QuestionAnswer>()
            };
        }

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
                BooleanResponse = answerDto.BooleanResponse,
                NumberResponse = answerDto.NumberResponse,
                DateResponse = answerDto.DateResponse,
                JsonResponse = answerDto.JsonResponse
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
            else if ((question.Type == QuestionType.Number || question.Type == QuestionType.Slider || question.Type == QuestionType.Rating) && answerDto.NumberResponse.HasValue)
            {
                points = (int)Math.Round(answerDto.NumberResponse.Value);
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

        if (submission.Id == 0)
        {
            _context.AssessmentSubmissions.Add(submission);
        }
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

    public async Task<List<AssessmentFormDto>> GetAvailableAssessmentsForUserAsync(string userId, AssessmentType roleType)
    {
        // 1. Get IDs of assessments the user has already submitted
        var submittedFormIds = await _context.AssessmentSubmissions
            .Where(s => s.UserId == userId)
            .Select(s => s.FormId)
            .ToListAsync();

        // 2. Get public active assessments matching the role
        // Assuming "Nurse" users see NurseAssessment, "Senior" see SeniorAssessment.
        // We also include "Exam" type if relevant, but let's stick to roleType first.
        var publicForms = await _context.AssessmentForms
            .Include(f => f.Questions)
                .ThenInclude(q => q.Options)
            .Where(f => f.IsActive && !submittedFormIds.Contains(f.Id))
            .ToListAsync();

        // 3. Get assigned assessments specifically for this user that are not completed
        var assignedFormIds = await _context.AssessmentAssignments
            .Where(a => a.UserId == userId && !a.IsDeleted && 
                       (a.Status == AssessmentAssignmentStatus.Pending || a.Status == AssessmentAssignmentStatus.InProgress))
            .Select(a => a.FormId)
            .ToListAsync();

        var assignedForms = await _context.AssessmentForms
            .Include(f => f.Questions)
                .ThenInclude(q => q.Options)
            .Where(f => assignedFormIds.Contains(f.Id) && f.IsActive && !submittedFormIds.Contains(f.Id))
            .ToListAsync();

        // Merge and return unique list
        var allForms = publicForms
            .Concat(assignedForms)
            .Where(f => MatchesTargetType(f, roleType))
            .DistinctBy(f => f.Id)
            .ToList();

        return allForms.Select(MapToDto).ToList();
    }

    private async Task SyncDefaultHomeCareFormAsync(AssessmentForm form)
    {
        if (form.Workflow != AssessmentFormWorkflow.HomeCareRequest || !form.ServiceDefinitionId.HasValue)
        {
            return;
        }

        var relatedForms = await _context.AssessmentForms
            .Where(f => f.Workflow == AssessmentFormWorkflow.HomeCareRequest && f.ServiceDefinitionId == form.ServiceDefinitionId)
            .ToListAsync();

        if (form.IsDefault)
        {
            foreach (var relatedForm in relatedForms.Where(f => f.Id != form.Id && f.IsDefault))
            {
                relatedForm.IsDefault = false;
            }

            var service = await _context.ServiceDefinitions.FindAsync(form.ServiceDefinitionId.Value);
            if (service != null)
            {
                service.DefaultFormId = form.Id;
                service.UpdatedAt = DateTime.UtcNow;
            }
        }
        else
        {
            var service = await _context.ServiceDefinitions.FindAsync(form.ServiceDefinitionId.Value);
            if (service?.DefaultFormId == form.Id)
            {
                service.DefaultFormId = relatedForms
                    .Where(f => f.Id != form.Id && f.IsDefault)
                    .OrderByDescending(f => f.UpdatedAt ?? f.CreatedAt)
                    .Select(f => (int?)f.Id)
                    .FirstOrDefault();
                service.UpdatedAt = DateTime.UtcNow;
            }
        }

        await _context.SaveChangesAsync();
    }

    private static List<AssessmentType> NormalizeTargetTypes(AssessmentType type, IReadOnlyCollection<AssessmentType>? targetTypes)
    {
        var normalized = (targetTypes ?? Array.Empty<AssessmentType>())
            .Distinct()
            .ToList();

        if (normalized.Count == 0)
        {
            normalized.Add(type);
        }

        return normalized;
    }

    private static string SerializeTargetTypes(IReadOnlyCollection<AssessmentType> targetTypes)
    {
        return JsonSerializer.Serialize(targetTypes.Distinct().Select(t => (int)t));
    }

    private static List<AssessmentType> ParseTargetTypes(AssessmentForm form)
    {
        if (string.IsNullOrWhiteSpace(form.TargetTypesJson))
        {
            return new List<AssessmentType> { form.Type };
        }

        try
        {
            var rawValues = JsonSerializer.Deserialize<List<int>>(form.TargetTypesJson) ?? new List<int>();
            var parsed = rawValues
                .Distinct()
                .Select(value => (AssessmentType)value)
                .ToList();

            return parsed.Count > 0 ? parsed : new List<AssessmentType> { form.Type };
        }
        catch
        {
            return new List<AssessmentType> { form.Type };
        }
    }

    private static bool MatchesTargetType(AssessmentForm form, AssessmentType type)
    {
        return ParseTargetTypes(form).Contains(type);
    }

    private AssessmentFormDto MapToDto(AssessmentForm form)
    {
        var targetTypes = ParseTargetTypes(form);
        return new AssessmentFormDto
        {
            Id = form.Id,
            Code = form.Code,
            Title = form.Title,
            Description = form.Description,
            Type = form.Type,
            TargetTypes = targetTypes,
            IsActive = form.IsActive,
            Workflow = form.Workflow,
            Version = form.Version,
            IsDefault = form.IsDefault,
            ServiceDefinitionId = form.ServiceDefinitionId,
            IntroTitle = form.IntroTitle,
            IntroDescription = form.IntroDescription,
            EstimatedDurationMinutes = form.EstimatedDurationMinutes,
            LayoutJson = form.LayoutJson,
            Questions = form.Questions.OrderBy(q => q.Order).Select(q => new QuestionDto
            {
                QuestionId = q.Id,
                Type = q.Type,
                Question = q.Text,
                Weight = q.Weight,
                Tags = q.Tags,
                Order = q.Order,
                QuestionKey = q.QuestionKey,
                NextQuestionKey = q.NextQuestionKey,
                PageKey = q.PageKey,
                PageTitle = q.PageTitle,
                GroupKey = q.GroupKey,
                GroupTitle = q.GroupTitle,
                IsRequired = q.IsRequired,
                Placeholder = q.Placeholder,
                Description = q.Description,
                VisibilityConditionJson = q.VisibilityConditionJson,
                RequiredConditionJson = q.RequiredConditionJson,
                ValidationJson = q.ValidationJson,
                MinValue = q.MinValue,
                MaxValue = q.MaxValue,
                MinFiles = q.MinFiles,
                MaxFiles = q.MaxFiles,
                AllowMultipleFiles = q.AllowMultipleFiles,
                Options = q.Options.OrderBy(o => o.Order).Select(o => new OptionDto
                {
                    Id = o.Id,
                    Text = o.Text,
                    Value = o.ScoreValue,
                    Order = o.Order,
                    NextQuestionKey = o.NextQuestionKey
                }).ToList()
            }).ToList()
        };
    }
}
