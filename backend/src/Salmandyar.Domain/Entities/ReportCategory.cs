namespace Salmandyar.Domain.Entities;

public class ReportCategory
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public int Order { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;

    public virtual ICollection<ReportItem> Items { get; set; } = new List<ReportItem>();
}
