using Salmandyar.Domain.Enums;

namespace Salmandyar.Domain.Entities.Assessments;

public class AssessmentAssignment
{
    public int Id { get; set; }

    public string UserId { get; set; } = string.Empty;
    public virtual User User { get; set; } = null!;

    public int FormId { get; set; }
    public virtual AssessmentForm Form { get; set; } = null!;

    public DateTime AssignedDate { get; set; } = DateTime.UtcNow;
    public DateTime? Deadline { get; set; }
    public bool IsMandatory { get; set; } = false;

    public AssessmentAssignmentStatus Status { get; set; } = AssessmentAssignmentStatus.Pending;

    // Link to the submission if completed
    public int? SubmissionId { get; set; }
    public virtual AssessmentSubmission? Submission { get; set; }

    public DateTime? CompletedDate { get; set; }
}
