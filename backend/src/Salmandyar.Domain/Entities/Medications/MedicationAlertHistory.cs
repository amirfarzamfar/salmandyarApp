using Salmandyar.Domain.Enums;

namespace Salmandyar.Domain.Entities.Medications;

public class MedicationAlertHistory
{
    public int Id { get; set; }
    public int PatientMedicationId { get; set; }
    public virtual PatientMedication PatientMedication { get; set; } = null!;

    public int CareRecipientId { get; set; }
    public virtual CareRecipient CareRecipient { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public MedicationAlertType AlertType { get; set; } = MedicationAlertType.LowStock;
    public MedicationAlertRecipientType RecipientType { get; set; }
    public string RecipientDisplay { get; set; } = string.Empty;
    public string? RecipientUserId { get; set; }
    public virtual User? RecipientUser { get; set; }
    public MedicationAlertChannel Channel { get; set; }
    public string Message { get; set; } = string.Empty;
    public MedicationAlertHistoryStatus DeliveryStatus { get; set; } = MedicationAlertHistoryStatus.Success;
    public string? ErrorMessage { get; set; }
}
