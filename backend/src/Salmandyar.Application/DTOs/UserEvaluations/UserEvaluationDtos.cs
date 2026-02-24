using Salmandyar.Domain.Enums;

namespace Salmandyar.Application.DTOs.UserEvaluations;

// --- Form DTOs ---

public class CreateUserEvaluationFormDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public AssessmentType Type { get; set; }
    public List<CreateUserEvaluationQuestionDto> Questions { get; set; } = new List<CreateUserEvaluationQuestionDto>();
}

public class CreateUserEvaluationQuestionDto
{
    public string Question { get; set; } = string.Empty;
    public QuestionType Type { get; set; }
    public int Weight { get; set; }
    public List<string> Tags { get; set; } = new List<string>();
    public List<CreateUserEvaluationOptionDto> Options { get; set; } = new List<CreateUserEvaluationOptionDto>();
    public int Order { get; set; }
}

public class CreateUserEvaluationOptionDto
{
    public string Text { get; set; } = string.Empty;
    public int ScoreValue { get; set; }
    public int Order { get; set; }
}

public class UserEvaluationFormDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public AssessmentType Type { get; set; }
    public List<UserEvaluationQuestionDto> Questions { get; set; } = new List<UserEvaluationQuestionDto>();
}

public class UserEvaluationQuestionDto
{
    public int QuestionId { get; set; }
    public QuestionType Type { get; set; }
    public string Question { get; set; } = string.Empty;
    public List<UserEvaluationOptionDto> Options { get; set; } = new List<UserEvaluationOptionDto>();
    public int Weight { get; set; }
    public List<string> Tags { get; set; } = new List<string>();
    public int Order { get; set; }
}

public class UserEvaluationOptionDto
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public int Value { get; set; }
    public int Order { get; set; }
}

// --- Assignment DTOs ---

public class UserEvaluationAssignmentDto
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string UserFullName { get; set; } = string.Empty;
    public int FormId { get; set; }
    public string FormTitle { get; set; } = string.Empty;
    public AssessmentType FormType { get; set; }
    public DateTime AssignedDate { get; set; }
    public DateTime? Deadline { get; set; }
    public DateTime? StartDate { get; set; }
    public bool IsMandatory { get; set; }
    public AssessmentAssignmentStatus Status { get; set; }
    public int? SubmissionId { get; set; }
    public double? Score { get; set; }
    public DateTime? CompletedDate { get; set; }
    
    public UserEvaluationSubmissionDetailDto? SubmissionDetails { get; set; }
}

public class UserEvaluationSubmissionDetailDto 
{
    public int Id { get; set; }
    public double TotalScore { get; set; }
    public DateTime SubmittedAt { get; set; }
    public List<UserEvaluationAnswerDetailDto> Answers { get; set; } = new();
}

public class UserEvaluationAnswerDetailDto
{
    public int QuestionId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public int Weight { get; set; }
    public List<string> Tags { get; set; } = new();
    public string? SelectedOptionText { get; set; }
    public int? SelectedOptionScore { get; set; }
    public string? TextResponse { get; set; }
    public bool? BooleanResponse { get; set; }
}

public class CreateUserEvaluationAssignmentDto
{
    public string UserId { get; set; } = string.Empty;
    public int FormId { get; set; }
    public DateTime? Deadline { get; set; }
    public DateTime? StartDate { get; set; }
    public bool IsMandatory { get; set; }
}

public class UserEvaluationSummaryDto
{
    public string UserId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public int TotalAssigned { get; set; }
    public int Completed { get; set; }
    public int Pending { get; set; }
    public int Overdue { get; set; }
}

// --- Submission DTOs ---

public class SubmitUserEvaluationDto
{
    public int FormId { get; set; }
    public int? CareRecipientId { get; set; }
    public List<SubmitUserEvaluationAnswerDto> Answers { get; set; } = new List<SubmitUserEvaluationAnswerDto>();
}

public class SubmitUserEvaluationAnswerDto
{
    public int QuestionId { get; set; }
    public int? SelectedOptionId { get; set; }
    public string? TextResponse { get; set; }
    public bool? BooleanResponse { get; set; }
}
