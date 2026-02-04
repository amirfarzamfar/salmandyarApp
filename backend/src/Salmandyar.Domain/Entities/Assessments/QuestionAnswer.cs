namespace Salmandyar.Domain.Entities.Assessments;

public class QuestionAnswer
{
    public int Id { get; set; }
    public int SubmissionId { get; set; }
    public virtual AssessmentSubmission Submission { get; set; } = null!;

    public int QuestionId { get; set; }
    public virtual AssessmentQuestion Question { get; set; } = null!;

    // For Multiple Choice
    public int? SelectedOptionId { get; set; }
    public virtual AssessmentOption? SelectedOption { get; set; }

    // For Text Answers (Short/Long)
    public string? TextResponse { get; set; }
    
    // For True/False (could use SelectedOption or a boolean field, keeping generic)
    public bool? BooleanResponse { get; set; }
}
