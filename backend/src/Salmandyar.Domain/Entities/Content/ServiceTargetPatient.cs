using System.ComponentModel.DataAnnotations;

namespace Salmandyar.Domain.Entities.Content;

public class ServiceTargetPatient
{
    public int Id { get; set; }

    public int ServiceSeoProfileId { get; set; }

    public virtual ServiceSeoProfile ServiceSeoProfile { get; set; } = null!;

    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    public int? RelatedDiseaseId { get; set; }

    public int DisplayOrder { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
