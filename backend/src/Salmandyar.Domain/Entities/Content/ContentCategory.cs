using System.ComponentModel.DataAnnotations;

namespace Salmandyar.Domain.Entities.Content;

public class ContentCategory
{
    public int Id { get; set; }

    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Slug { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    public int? ParentId { get; set; }

    public virtual ContentCategory? Parent { get; set; }

    public virtual ICollection<ContentCategory> Children { get; set; } = new List<ContentCategory>();

    public int DisplayOrder { get; set; }

    [MaxLength(100)]
    public string? MetaTitle { get; set; }

    [MaxLength(500)]
    public string? MetaDescription { get; set; }

    [MaxLength(100)]
    public string? CanonicalUrl { get; set; }

    [MaxLength(1000)]
    public string? CoverImageUrl { get; set; }

    public bool IsActive { get; set; } = true;

    public bool ShowInMenu { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<Article> Articles { get; set; } = new List<Article>();
}
