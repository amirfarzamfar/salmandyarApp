namespace Salmandyar.Application.Services.NursingReports.Dtos;

public class NursingReportDto
{
    public int Id { get; set; }
    public int CareRecipientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string Shift { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
