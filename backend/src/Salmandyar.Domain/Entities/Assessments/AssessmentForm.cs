using Salmandyar.Domain.Enums;

namespace Salmandyar.Domain.Entities.Assessments;

public class AssessmentForm
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public AssessmentType Type { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public virtual ICollection<AssessmentQuestion> Questions { get; set; } = new List<AssessmentQuestion>();
}
