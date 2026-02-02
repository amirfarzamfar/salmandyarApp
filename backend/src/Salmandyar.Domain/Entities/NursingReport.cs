namespace Salmandyar.Domain.Entities;

public class NursingReport
{
    public int Id { get; set; }

    public int CareRecipientId { get; set; }
    public virtual CareRecipient CareRecipient { get; set; } = null!;

    public string? AuthorId { get; set; }
    public virtual User? Author { get; set; }

    public DateTime CreatedAt { get; set; }
    public string Shift { get; set; } = string.Empty; // Morning, Evening, Night
    public string Content { get; set; } = string.Empty;

    public virtual ICollection<NursingReportDetail> Details { get; set; } = new List<NursingReportDetail>();
}
