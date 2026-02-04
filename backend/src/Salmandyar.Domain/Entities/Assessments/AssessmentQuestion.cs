using Salmandyar.Domain.Enums;

namespace Salmandyar.Domain.Entities.Assessments;

public class AssessmentQuestion
{
    public int Id { get; set; }
    public int FormId { get; set; }
    public virtual AssessmentForm Form { get; set; } = null!;

    public string Text { get; set; } = string.Empty; // The Question text
    public QuestionType Type { get; set; }
    
    public int Weight { get; set; } = 1; // 0-5
    
    // Stored as JSON or Comma Separated, or using EF Core primitive collection
    public List<string> Tags { get; set; } = new List<string>(); 

    public int Order { get; set; }

    public virtual ICollection<AssessmentOption> Options { get; set; } = new List<AssessmentOption>();
}
