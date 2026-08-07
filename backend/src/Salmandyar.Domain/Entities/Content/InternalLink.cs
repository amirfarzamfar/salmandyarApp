using System.ComponentModel.DataAnnotations;

namespace Salmandyar.Domain.Entities.Content;

public enum LinkTargetType
{
    Article = 0,
    Service = 1,
    Disease = 2,
    Guide = 3,
    Tool = 4,
    City = 5,
    Author = 6,
    Category = 7,
    Tag = 8,
    CustomUrl = 9
}

public class InternalLink
{
    public int Id { get; set; }

    public LinkTargetType SourceType { get; set; }

    public int? SourceArticleId { get; set; }

    public virtual Article? SourceArticle { get; set; }

    public LinkTargetType TargetType { get; set; }

    public int? TargetArticleId { get; set; }

    public virtual Article? TargetArticle { get; set; }

    public int? TargetServiceId { get; set; }

    public int? TargetDiseaseId { get; set; }

    public int? TargetGuideId { get; set; }

    public int? TargetToolId { get; set; }

    public int? TargetCityId { get; set; }

    [MaxLength(500)]
    public string? TargetCustomUrl { get; set; }

    [MaxLength(200)]
    public string AnchorText { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Title { get; set; }

    [MaxLength(1000)]
    public string? Description { get; set; }

    public int DisplayOrder { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
