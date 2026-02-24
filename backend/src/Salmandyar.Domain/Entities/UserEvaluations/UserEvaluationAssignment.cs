using Salmandyar.Domain.Enums;

namespace Salmandyar.Domain.Entities.UserEvaluations;

public class UserEvaluationAssignment
{
    public int Id { get; set; }

    public string UserId { get; set; } = string.Empty;
    public virtual User User { get; set; } = null!;

    public int FormId { get; set; }
    public virtual UserEvaluationForm Form { get; set; } = null!;

    public DateTime AssignedDate { get; set; } = DateTime.UtcNow;
    public DateTime? StartDate { get; set; }
    public DateTime? Deadline { get; set; }
    public bool IsMandatory { get; set; } = false;
    public bool IsDeleted { get; set; } = false;

    public AssessmentAssignmentStatus Status { get; set; } = AssessmentAssignmentStatus.Pending;

    public int? SubmissionId { get; set; }
    public virtual UserEvaluationSubmission? Submission { get; set; }

    public DateTime? CompletedDate { get; set; }
}
