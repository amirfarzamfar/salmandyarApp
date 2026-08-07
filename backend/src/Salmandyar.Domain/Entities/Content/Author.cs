using System.ComponentModel.DataAnnotations;

namespace Salmandyar.Domain.Entities.Content;

public class Author
{
    public int Id { get; set; }

    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? Title { get; set; }

    [MaxLength(500)]
    public string? Specialization { get; set; }

    [MaxLength(2000)]
    public string? Biography { get; set; }

    [MaxLength(500)]
    public string? ExperienceSummary { get; set; }

    [Range(0, 60)]
    public int? YearsOfExperience { get; set; }

    [MaxLength(1000)]
    public string? ProfileImageUrl { get; set; }

    [MaxLength(200)]
    public string? MedicalLicenseNumber { get; set; }

    [MaxLength(100)]
    public string? Email { get; set; }

    [MaxLength(100)]
    public string? Slug { get; set; }

    [MaxLength(100)]
    public string? MetaTitle { get; set; }

    [MaxLength(500)]
    public string? MetaDescription { get; set; }

    public bool IsMedicalReviewer { get; set; }

    public bool IsActive { get; set; } = true;

    public string? UserId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<Article> AuthoredArticles { get; set; } = new List<Article>();

    public virtual ICollection<ArticleMedicalReview> MedicalReviews { get; set; } = new List<ArticleMedicalReview>();

    public string FullName => $"{FirstName} {LastName}";
}
