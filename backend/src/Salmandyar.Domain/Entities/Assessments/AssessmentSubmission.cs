using Salmandyar.Domain.Enums;

namespace Salmandyar.Domain.Entities.Assessments;

public class AssessmentSubmission
{
    public int Id { get; set; }
    public int FormId { get; set; }
    public virtual AssessmentForm Form { get; set; } = null!;

    // Can be submitted by a User (Nurse/Family) or related to a CareRecipient
    public string? UserId { get; set; }
    public virtual User? User { get; set; }

    public int? CareRecipientId { get; set; } // If this assessment is FOR a patient
    public virtual CareRecipient? CareRecipient { get; set; }

    public AssessmentSubmissionStatus Status { get; set; } = AssessmentSubmissionStatus.Submitted;
    public string? DraftKey { get; set; }
    public string? SummaryJson { get; set; }
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastSavedAt { get; set; }
    
    // Calculated Result
    public double TotalScore { get; set; }
    public string? AnalysisResultJson { get; set; } // Store the JSON profile here

    public virtual ICollection<QuestionAnswer> Answers { get; set; } = new List<QuestionAnswer>();
}
