namespace Salmandyar.Domain.Entities;

public class CaregiverProfileDocument
{
    public int Id { get; set; }
    public int CaregiverProfileId { get; set; }
    public virtual CaregiverProfile CaregiverProfile { get; set; } = null!;
    public string DocumentType { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string? MimeType { get; set; }
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    public CaregiverProfileDocumentStatus Status { get; set; } = CaregiverProfileDocumentStatus.PendingReview;
    public string? ReviewNote { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? ReviewedByUserId { get; set; }
    public string? ReviewedByName { get; set; }
    public DateTime? ExpireAt { get; set; }
}
