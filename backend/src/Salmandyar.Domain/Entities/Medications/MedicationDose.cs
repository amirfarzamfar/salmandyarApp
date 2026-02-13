using Salmandyar.Domain.Enums;

namespace Salmandyar.Domain.Entities.Medications;

public class MedicationDose
{
    public int Id { get; set; }

    public int PatientMedicationId { get; set; }
    public virtual PatientMedication PatientMedication { get; set; } = null!;

    public DateTime ScheduledTime { get; set; }
    
    public DoseStatus Status { get; set; } = DoseStatus.Scheduled;
    
    public DateTime? TakenAt { get; set; }
    
    public string? TakenByUserId { get; set; }
    public virtual User? TakenByUser { get; set; }

    public string? Notes { get; set; } // For "Not Taken" reason or side effects
    
    public string? MissedReason { get; set; }
    
    public SideEffectSeverity SideEffectSeverity { get; set; } = SideEffectSeverity.None;
    public string? SideEffectDescription { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
