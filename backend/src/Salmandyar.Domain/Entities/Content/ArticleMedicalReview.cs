using System.ComponentModel.DataAnnotations;

namespace Salmandyar.Domain.Entities.Content;

public class ArticleMedicalReview
{
    public int Id { get; set; }

    public int ArticleId { get; set; }

    public virtual Article Article { get; set; } = null!;

    public int MedicalReviewerId { get; set; }

    public virtual Author MedicalReviewer { get; set; } = null!;

    [MaxLength(1000)]
    public string? ReviewNotes { get; set; }

    public bool IsApproved { get; set; }

    public DateTime ReviewedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ExpiresAt { get; set; }
}
