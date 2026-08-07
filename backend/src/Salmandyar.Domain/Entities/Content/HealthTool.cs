using System.ComponentModel.DataAnnotations;

namespace Salmandyar.Domain.Entities.Content;

public enum HealthToolType
{
    Calculator = 0,
    Checklist = 1,
    Assessment = 2,
    Converter = 3,
    Tracker = 4
}

public class HealthTool
{
    public int Id { get; set; }

    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Slug { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? ShortDescription { get; set; }

    public string? Description { get; set; }

    public HealthToolType ToolType { get; set; }

    public string? ToolConfigurationJson { get; set; }

    public string? HowToUse { get; set; }

    public string? InterpretationGuide { get; set; }

    public string? Disclaimers { get; set; }

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

    public bool IsActive { get; set; } = true;

    public int DisplayOrder { get; set; }

    public int? ViewCount { get; set; } = 0;

    public int? UsageCount { get; set; } = 0;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}
