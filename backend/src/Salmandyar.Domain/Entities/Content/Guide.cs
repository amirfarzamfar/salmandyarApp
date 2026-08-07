using System.ComponentModel.DataAnnotations;

namespace Salmandyar.Domain.Entities.Content;

public class Guide
{
    public int Id { get; set; }

    [MaxLength(300)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Slug { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? ShortDescription { get; set; }

    public string? Content { get; set; }

    public string? StepByStepInstructions { get; set; }

    public string? ToolsRequired { get; set; }

    public string? Precautions { get; set; }

    public string? WhenToSeekMedicalHelp { get; set; }

    [Range(1, 10)]
    public int? DifficultyLevel { get; set; }

    [Range(1, 480)]
    public int? EstimatedTimeMinutes { get; set; }

    [MaxLength(1000)]
    public string? CoverImageUrl { get; set; }

    [MaxLength(1000)]
    public string? OgImageUrl { get; set; }

    public string? VideoTutorialUrl { get; set; }

    [MaxLength(100)]
    public string? MetaTitle { get; set; }

    [MaxLength(500)]
    public string? MetaDescription { get; set; }

    [MaxLength(200)]
    public string? PrimaryKeyword { get; set; }

    public string? SecondaryKeywordsJson { get; set; }

    [MaxLength(500)]
    public string? CanonicalUrl { get; set; }

    public int CategoryId { get; set; }

    public virtual ContentCategory Category { get; set; } = null!;

    public int? RelatedServiceId { get; set; }

    public int? RelatedDiseaseId { get; set; }

    public bool IsActive { get; set; } = true;

    public int DisplayOrder { get; set; }

    public int? ViewCount { get; set; } = 0;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public int? AuthorId { get; set; }

    public virtual Author? Author { get; set; }
}
