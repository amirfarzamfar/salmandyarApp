using Salmandyar.Domain.Enums;

namespace Salmandyar.Application.DTOs.Assessments;

public class CreateAssessmentFormDto
{
    public string? Code { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public AssessmentType Type { get; set; }
    public List<AssessmentType> TargetTypes { get; set; } = new();
    public AssessmentFormWorkflow Workflow { get; set; } = AssessmentFormWorkflow.Assessment;
    public int Version { get; set; } = 1;
    public bool IsDefault { get; set; }
    public int? ServiceDefinitionId { get; set; }
    public string? IntroTitle { get; set; }
    public string? IntroDescription { get; set; }
    public int EstimatedDurationMinutes { get; set; } = 10;
    public string? LayoutJson { get; set; }
    public List<CreateQuestionDto> Questions { get; set; } = new List<CreateQuestionDto>();
}

public class CreateQuestionDto
{
    public string Question { get; set; } = string.Empty;
    public QuestionType Type { get; set; }
    public int Weight { get; set; }
    public List<string> Tags { get; set; } = new List<string>();
    public List<CreateOptionDto> Options { get; set; } = new List<CreateOptionDto>();
    public int Order { get; set; }
    public string? QuestionKey { get; set; }
    public string? NextQuestionKey { get; set; }
    public string? PageKey { get; set; }
    public string? PageTitle { get; set; }
    public string? GroupKey { get; set; }
    public string? GroupTitle { get; set; }
    public bool IsRequired { get; set; } = true;
    public string? Placeholder { get; set; }
    public string? Description { get; set; }
    public string? VisibilityConditionJson { get; set; }
    public string? RequiredConditionJson { get; set; }
    public string? ValidationJson { get; set; }
    public decimal? MinValue { get; set; }
    public decimal? MaxValue { get; set; }
    public int? MinFiles { get; set; }
    public int? MaxFiles { get; set; }
    public bool AllowMultipleFiles { get; set; }
}

public class CreateOptionDto
{
    public string Text { get; set; } = string.Empty;
    public int ScoreValue { get; set; }
    public int Order { get; set; }
    public string? NextQuestionKey { get; set; }
}

public class AssessmentFormDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public AssessmentType Type { get; set; }
    public List<AssessmentType> TargetTypes { get; set; } = new();
    public AssessmentFormWorkflow Workflow { get; set; }
    public int Version { get; set; }
    public bool IsDefault { get; set; }
    public int? ServiceDefinitionId { get; set; }
    public string? IntroTitle { get; set; }
    public string? IntroDescription { get; set; }
    public int EstimatedDurationMinutes { get; set; }
    public string? LayoutJson { get; set; }
    public List<QuestionDto> Questions { get; set; } = new List<QuestionDto>();
}

public class QuestionDto
{
    public int QuestionId { get; set; }
    public QuestionType Type { get; set; }
    public string Question { get; set; } = string.Empty;
    public List<OptionDto> Options { get; set; } = new List<OptionDto>();
    public int Weight { get; set; }
    public List<string> Tags { get; set; } = new List<string>();
    public int Order { get; set; }
    public string? QuestionKey { get; set; }
    public string? NextQuestionKey { get; set; }
    public string? PageKey { get; set; }
    public string? PageTitle { get; set; }
    public string? GroupKey { get; set; }
    public string? GroupTitle { get; set; }
    public bool IsRequired { get; set; }
    public string? Placeholder { get; set; }
    public string? Description { get; set; }
    public string? VisibilityConditionJson { get; set; }
    public string? RequiredConditionJson { get; set; }
    public string? ValidationJson { get; set; }
    public decimal? MinValue { get; set; }
    public decimal? MaxValue { get; set; }
    public int? MinFiles { get; set; }
    public int? MaxFiles { get; set; }
    public bool AllowMultipleFiles { get; set; }
}

public class OptionDto
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public int Value { get; set; }
    public int Order { get; set; }
    public string? NextQuestionKey { get; set; }
}

public class SubmitAssessmentDto
{
    public int FormId { get; set; }
    public int? CareRecipientId { get; set; } // Optional, if for a patient
    public int? SubmissionId { get; set; }
    public bool SaveAsDraft { get; set; }
    public string? DraftKey { get; set; }
    public string? SummaryJson { get; set; }
    public List<SubmitAnswerDto> Answers { get; set; } = new List<SubmitAnswerDto>();
}

public class SubmitAnswerDto
{
    public int QuestionId { get; set; }
    public int? SelectedOptionId { get; set; }
    public string? TextResponse { get; set; }
    public bool? BooleanResponse { get; set; }
    public decimal? NumberResponse { get; set; }
    public DateTime? DateResponse { get; set; }
    public string? JsonResponse { get; set; }
}
