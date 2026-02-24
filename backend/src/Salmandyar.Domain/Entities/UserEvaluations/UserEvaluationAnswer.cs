namespace Salmandyar.Domain.Entities.UserEvaluations;

public class UserEvaluationAnswer
{
    public int Id { get; set; }
    public int SubmissionId { get; set; }
    public virtual UserEvaluationSubmission Submission { get; set; } = null!;

    public int QuestionId { get; set; }
    public virtual UserEvaluationQuestion Question { get; set; } = null!;

    public int? SelectedOptionId { get; set; }
    public virtual UserEvaluationOption? SelectedOption { get; set; }

    public string? TextResponse { get; set; }
    
    public bool? BooleanResponse { get; set; }
}
