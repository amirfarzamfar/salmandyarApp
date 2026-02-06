using Salmandyar.Domain.Enums;

namespace Salmandyar.Application.DTOs.Assessments;

public class CreateAssessmentFormDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public AssessmentType Type { get; set; }
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
}

public class CreateOptionDto
{
    public string Text { get; set; } = string.Empty;
    public int ScoreValue { get; set; }
    public int Order { get; set; }
}

public class AssessmentFormDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public AssessmentType Type { get; set; }
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
}

public class OptionDto
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public int Value { get; set; }
    public int Order { get; set; }
}

public class SubmitAssessmentDto
{
    public int FormId { get; set; }
    public int? CareRecipientId { get; set; } // Optional, if for a patient
    public List<SubmitAnswerDto> Answers { get; set; } = new List<SubmitAnswerDto>();
}

public class SubmitAnswerDto
{
    public int QuestionId { get; set; }
    public int? SelectedOptionId { get; set; }
    public string? TextResponse { get; set; }
    public bool? BooleanResponse { get; set; }
}
