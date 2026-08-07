using System.ComponentModel.DataAnnotations;

namespace Salmandyar.Domain.Entities.Content;

public class ArticleSource
{
    public int Id { get; set; }

    public int ArticleId { get; set; }

    public virtual Article Article { get; set; } = null!;

    [MaxLength(500)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Url { get; set; }

    [MaxLength(500)]
    public string? Publisher { get; set; }

    public int? PublicationYear { get; set; }

    public int DisplayOrder { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
