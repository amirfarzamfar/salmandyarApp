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

    public string? QuestionKey { get; set; }
    public string? NextQuestionKey { get; set; }
    public string? PageKey { get; set; }
    public string? PageTitle { get; set; }
    public string? GroupKey { get; set; }
    public string? GroupTitle { get; set; }
    public bool IsRequired { get; set; } = true;
    public string? Placeholder { get; set; }
    public string? Description { get; set; }
    public string? VisibilityConditionJson { get; set; }
    public string? RequiredConditionJson { get; set; }
    public string? ValidationJson { get; set; }
    public decimal? MinValue { get; set; }
    public decimal? MaxValue { get; set; }
    public int? MinFiles { get; set; }
    public int? MaxFiles { get; set; }
    public bool AllowMultipleFiles { get; set; }

    public virtual ICollection<AssessmentOption> Options { get; set; } = new List<AssessmentOption>();
}
