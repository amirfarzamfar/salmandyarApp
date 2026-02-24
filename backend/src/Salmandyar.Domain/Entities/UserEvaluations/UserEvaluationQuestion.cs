using Salmandyar.Domain.Enums;

namespace Salmandyar.Domain.Entities.UserEvaluations;

public class UserEvaluationQuestion
{
    public int Id { get; set; }
    public int FormId { get; set; }
    public virtual UserEvaluationForm Form { get; set; } = null!;

    public string Text { get; set; } = string.Empty;
    public QuestionType Type { get; set; }
    
    public int Weight { get; set; } = 1;
    
    public List<string> Tags { get; set; } = new List<string>(); 

    public int Order { get; set; }

    public virtual ICollection<UserEvaluationOption> Options { get; set; } = new List<UserEvaluationOption>();
}
