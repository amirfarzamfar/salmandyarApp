namespace Salmandyar.Domain.Entities.UserEvaluations;

public class UserEvaluationOption
{
    public int Id { get; set; }
    public int QuestionId { get; set; }
    public virtual UserEvaluationQuestion Question { get; set; } = null!;

    public string Text { get; set; } = string.Empty;
    public int ScoreValue { get; set; }
    public bool IsCorrect { get; set; }
    public int Order { get; set; }
}
