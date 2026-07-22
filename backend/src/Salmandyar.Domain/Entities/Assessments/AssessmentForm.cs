using Salmandyar.Domain.Enums;
using Salmandyar.Domain.Entities;

namespace Salmandyar.Domain.Entities.Assessments;

public class AssessmentForm
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public AssessmentType Type { get; set; }
    public string? TargetTypesJson { get; set; }
    public AssessmentFormWorkflow Workflow { get; set; } = AssessmentFormWorkflow.Assessment;
    public bool IsActive { get; set; } = true;
    public int Version { get; set; } = 1;
    public bool IsDefault { get; set; }
    public int? ServiceDefinitionId { get; set; }
    public virtual ServiceDefinition? ServiceDefinition { get; set; }
    public string? IntroTitle { get; set; }
    public string? IntroDescription { get; set; }
    public int EstimatedDurationMinutes { get; set; } = 10;
    public string? LayoutJson { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<AssessmentQuestion> Questions { get; set; } = new List<AssessmentQuestion>();
    public virtual ICollection<AssessmentSubmission> Submissions { get; set; } = new List<AssessmentSubmission>();
}
