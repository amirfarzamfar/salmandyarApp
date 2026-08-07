using System.ComponentModel.DataAnnotations;

namespace Salmandyar.Domain.Entities.Content;

public class ServiceTestimonial
{
    public int Id { get; set; }

    public int ServiceSeoProfileId { get; set; }

    public virtual ServiceSeoProfile ServiceSeoProfile { get; set; } = null!;

    [MaxLength(200)]
    public string ClientFullName { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? ClientRole { get; set; }

    [MaxLength(1000)]
    public string? ProfileImageUrl { get; set; }

    [Range(1, 5)]
    public int Rating { get; set; } = 5;

    [MaxLength(2000)]
    public string Content { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? Highlight { get; set; }

    public DateTime? TestimonialDate { get; set; }

    public int DisplayOrder { get; set; }

    public bool IsApproved { get; set; } = true;

    public bool IsFeatured { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
