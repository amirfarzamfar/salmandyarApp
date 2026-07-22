using Salmandyar.Domain.Entities.Assessments;

namespace Salmandyar.Domain.Entities;

public class ServiceDefinition
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public ServiceCategory Category { get; set; }
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public int? DefaultFormId { get; set; }
    public virtual AssessmentForm? DefaultForm { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
