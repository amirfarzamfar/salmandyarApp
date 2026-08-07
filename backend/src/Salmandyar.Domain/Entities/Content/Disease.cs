using System.ComponentModel.DataAnnotations;

namespace Salmandyar.Domain.Entities.Content;

public class Disease
{
    public int Id { get; set; }

    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Slug { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? ShortDescription { get; set; }

    public string? Definition { get; set; }

    public string? Causes { get; set; }

    public string? Symptoms { get; set; }

    public string? RiskFactors { get; set; }

    public string? Diagnosis { get; set; }

    public string? Treatment { get; set; }

    public string? Prevention { get; set; }

    public string? HomeCareInstructions { get; set; }

    public string? Complications { get; set; }

    public string? Prognosis { get; set; }

    public string? RelatedServicesJson { get; set; }

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

    [MaxLength(100)]
    public string? Icd10Code { get; set; }

    [Range(0, 100)]
    public int? SeverityLevel { get; set; }

    [Range(0, 100)]
    public int? PrevalenceRank { get; set; }

    public bool RequiresImmediateMedicalAttention { get; set; }

    public bool IsActive { get; set; } = true;

    public int DisplayOrder { get; set; }

    public int? ViewCount { get; set; } = 0;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public int? MedicalReviewerId { get; set; }

    public virtual Author? MedicalReviewer { get; set; }

    public virtual ICollection<Article> RelatedArticles { get; set; } = new List<Article>();
}
