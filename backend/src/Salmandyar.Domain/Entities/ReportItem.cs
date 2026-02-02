namespace Salmandyar.Domain.Entities;

public class ReportItem
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public virtual ReportCategory Category { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public string DefaultValue { get; set; } = string.Empty; // The text template or default value
    public int? ParentId { get; set; } // For sub-items
    public virtual ReportItem? Parent { get; set; }
    public virtual ICollection<ReportItem> SubItems { get; set; } = new List<ReportItem>();

    public int Order { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
}
