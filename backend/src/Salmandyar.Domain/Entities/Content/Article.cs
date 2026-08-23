using System.ComponentModel.DataAnnotations;

namespace Salmandyar.Domain.Entities.Content;

public enum ArticleStatus
{
    Draft = 0,
    PendingReview = 1,
    Published = 2,
    Archived = 3
}

public class Article
{
    public int Id { get; set; }

    [MaxLength(300)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Slug { get; set; } = string.Empty;

    public string Content { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? ShortAnswer { get; set; }

    [MaxLength(1000)]
    public string? Excerpt { get; set; }

    [Range(1, 60)]
    public int? EstimatedReadingTimeMinutes { get; set; }

    [MaxLength(1000)]
    public string? FeaturedImageUrl { get; set; }

    [MaxLength(300)]
    public string? FeaturedImageAlt { get; set; }

    [MaxLength(1000)]
    public string? OgImageUrl { get; set; }

    [MaxLength(1000)]
    public string? TwitterImageUrl { get; set; }

    public string? ImageGalleryJson { get; set; }

    [MaxLength(100)]
    public string? MetaTitle { get; set; }

    [MaxLength(500)]
    public string? MetaDescription { get; set; }

    [MaxLength(200)]
    public string? PrimaryKeyword { get; set; }

    public string? SecondaryKeywordsJson { get; set; }

    [MaxLength(500)]
    public string? CanonicalUrl { get; set; }

    public ArticleStatus Status { get; set; } = ArticleStatus.Draft;

    public int? Version { get; set; } = 1;

    public DateTime? PublishedAt { get; set; }

    public DateTime? LastUpdatedAt { get; set; }

    public int AuthorId { get; set; }

    public virtual Author Author { get; set; } = null!;

    public int CategoryId { get; set; }

    public virtual ContentCategory Category { get; set; } = null!;

    public int? ServiceDefinitionId { get; set; }

    public virtual ServiceDefinition? RelatedService { get; set; }

    public int? DiseaseId { get; set; }

    public virtual Disease? RelatedDisease { get; set; }

    public int? ViewCount { get; set; } = 0;

    public bool AllowComments { get; set; } = true;

    public bool IsFeatured { get; set; }

    public bool IsMedicalContent { get; set; }

    public bool IsFactChecked { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public string? CreatedBy { get; set; }

    public string? UpdatedBy { get; set; }

    public virtual ICollection<ArticleTag> ArticleTags { get; set; } = new List<ArticleTag>();

    public virtual ICollection<ArticleMedicalReview> MedicalReviews { get; set; } = new List<ArticleMedicalReview>();

    public virtual ICollection<ArticleSource> Sources { get; set; } = new List<ArticleSource>();

    public virtual ICollection<FAQ> FAQs { get; set; } = new List<FAQ>();

    public virtual ICollection<InternalLink> InternalLinksFrom { get; set; } = new List<InternalLink>();

    public virtual ICollection<InternalLink> InternalLinksTo { get; set; } = new List<InternalLink>();
}
