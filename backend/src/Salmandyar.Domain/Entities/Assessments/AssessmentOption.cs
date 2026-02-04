namespace Salmandyar.Domain.Entities.Assessments;

public class AssessmentOption
{
    public int Id { get; set; }
    public int QuestionId { get; set; }
    public virtual AssessmentQuestion Question { get; set; } = null!;

    public string Text { get; set; } = string.Empty;
    public int ScoreValue { get; set; } // Points for selecting this option
    public bool IsCorrect { get; set; } // Mainly for quizzes, optional for surveys
    public int Order { get; set; }
}
