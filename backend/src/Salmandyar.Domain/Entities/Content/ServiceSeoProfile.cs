using System.ComponentModel.DataAnnotations;

namespace Salmandyar.Domain.Entities.Content;

public class ServiceSeoProfile
{
    public int Id { get; set; }

    public int ServiceDefinitionId { get; set; }

    public virtual ServiceDefinition ServiceDefinition { get; set; } = null!;

    [MaxLength(100)]
    public string Slug { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? LongDescription { get; set; }

    [MaxLength(1000)]
    public string? HeroImageUrl { get; set; }

    [MaxLength(1000)]
    public string? OgImageUrl { get; set; }

    [MaxLength(1000)]
    public string? TwitterImageUrl { get; set; }

    [MaxLength(100)]
    public string? MetaTitle { get; set; }

    [MaxLength(500)]
    public string? MetaDescription { get; set; }

    [MaxLength(200)]
    public string? PrimaryKeyword { get; set; }

    public string? SecondaryKeywordsJson { get; set; }

    [MaxLength(500)]
    public string? CanonicalUrl { get; set; }

    public string? VideoPresentationUrl { get; set; }

    [MaxLength(200)]
    public string? PrimaryCtaText { get; set; }

    [MaxLength(500)]
    public string? PrimaryCtaLink { get; set; }

    public decimal? StartingPrice { get; set; }

    [MaxLength(100)]
    public string? PriceRangeText { get; set; }

    public bool ShowInHomePage { get; set; }

    public bool IsFeatured { get; set; }

    public int DisplayOrder { get; set; }

    public int? ViewCount { get; set; } = 0;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<ServiceBenefit> Benefits { get; set; } = new List<ServiceBenefit>();

    public virtual ICollection<ServiceTargetPatient> TargetPatients { get; set; } = new List<ServiceTargetPatient>();

    public virtual ICollection<ServiceCoverageArea> CoverageAreas { get; set; } = new List<ServiceCoverageArea>();

    public virtual ICollection<ServiceTestimonial> Testimonials { get; set; } = new List<ServiceTestimonial>();
}
