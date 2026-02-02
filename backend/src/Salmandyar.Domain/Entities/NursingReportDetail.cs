namespace Salmandyar.Domain.Entities;

public class NursingReportDetail
{
    public int Id { get; set; }
    
    public int ReportId { get; set; }
    public virtual NursingReport Report { get; set; } = null!;

    public int ItemId { get; set; }
    public virtual ReportItem Item { get; set; } = null!;

    public bool IsChecked { get; set; }
    public string Value { get; set; } = string.Empty; // The final text for this item in this specific report
}
