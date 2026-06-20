using Salmandyar.Domain.Enums;

namespace Salmandyar.Domain.Entities.Medications;

public class MedicationInventoryTransaction
{
    public int Id { get; set; }
    public int PatientMedicationId { get; set; }
    public virtual PatientMedication PatientMedication { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? PerformedByUserId { get; set; }
    public virtual User? PerformedByUser { get; set; }

    public MedicationInventoryTransactionType TransactionType { get; set; }
    public int QuantityChanged { get; set; }
    public int QuantityBefore { get; set; }
    public int QuantityAfter { get; set; }
    public string? Notes { get; set; }
}
