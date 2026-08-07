using System.ComponentModel.DataAnnotations;

namespace Salmandyar.Domain.Entities.Content;

public class ServiceBenefit
{
    public int Id { get; set; }

    public int ServiceSeoProfileId { get; set; }

    public virtual ServiceSeoProfile ServiceSeoProfile { get; set; } = null!;

    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    [MaxLength(100)]
    public string? IconName { get; set; }

    [MaxLength(100)]
    public string? ColorClass { get; set; }

    public int DisplayOrder { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
