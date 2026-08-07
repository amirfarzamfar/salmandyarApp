using System.ComponentModel.DataAnnotations;

namespace Salmandyar.Domain.Entities.Content;

public class City
{
    public int Id { get; set; }

    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Slug { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? Province { get; set; }

    [MaxLength(1000)]
    public string? ShortDescription { get; set; }

    public string? AboutRegion { get; set; }

    public string? CoveredAreas { get; set; }

    public string? LocalFAQs { get; set; }

    [MaxLength(20)]
    public string? PhoneNumber { get; set; }

    [MaxLength(1000)]
    public string? CoverImageUrl { get; set; }

    [MaxLength(1000)]
    public string? OgImageUrl { get; set; }

    [MaxLength(100)]
    public string? MetaTitle { get; set; }

    [MaxLength(500)]
    public string? MetaDescription { get; set; }

    [MaxLength(200)]
    public string? PrimaryKeyword { get; set; }

    public string? SecondaryKeywordsJson { get; set; }

    [MaxLength(500)]
    public string? CanonicalUrl { get; set; }

    [Range(-90, 90)]
    public double? Latitude { get; set; }

    [Range(-180, 180)]
    public double? Longitude { get; set; }

    public bool IsActive { get; set; } = true;

    public int DisplayOrder { get; set; }

    public int? Population { get; set; }

    public int? ViewCount { get; set; } = 0;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<CityService> CityServices { get; set; } = new List<CityService>();
}
