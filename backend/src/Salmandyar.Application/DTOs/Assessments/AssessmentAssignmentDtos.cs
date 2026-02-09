using Salmandyar.Domain.Enums;

namespace Salmandyar.Application.DTOs.Assessments;

public class AssessmentAssignmentDto
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string UserFullName { get; set; } = string.Empty;
    public int FormId { get; set; }
    public string FormTitle { get; set; } = string.Empty;
    public DateTime AssignedDate { get; set; }
    public DateTime? Deadline { get; set; }
    public bool IsMandatory { get; set; }
    public AssessmentAssignmentStatus Status { get; set; }
    public int? SubmissionId { get; set; }
    public double? Score { get; set; } // From Submission
    public DateTime? CompletedDate { get; set; }
    
    // Detailed Result (Only populated when fetching single assignment)
    public SubmissionDetailDto? SubmissionDetails { get; set; }
}

public class SubmissionDetailDto 
{
    public int Id { get; set; }
    public double TotalScore { get; set; }
    public DateTime SubmittedAt { get; set; }
    public List<QuestionAnswerDetailDto> Answers { get; set; } = new();
}

public class QuestionAnswerDetailDto
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

public class CreateAssessmentAssignmentDto
{
    public string UserId { get; set; } = string.Empty;
    public int FormId { get; set; }
    public DateTime? Deadline { get; set; }
    public bool IsMandatory { get; set; }
}

public class UserAssessmentSummaryDto
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
