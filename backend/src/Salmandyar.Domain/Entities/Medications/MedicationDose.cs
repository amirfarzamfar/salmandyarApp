using Salmandyar.Domain.Enums;

namespace Salmandyar.Domain.Entities.Medications;

public class MedicationDose
{
    public int Id { get; set; }

    public int PatientMedicationId { get; set; }
    public virtual PatientMedication PatientMedication { get; set; } = null!;

    public DateTime ScheduledTime { get; set; }
    public DateTime? AllowedConfirmationUntil { get; set; }
    public ShiftSlot ScheduledShiftSlot { get; set; } = ShiftSlot.None;
    
    public DoseStatus Status { get; set; } = DoseStatus.Scheduled;
    public MedicationAdministrationOutcome AdministrationOutcome { get; set; } = MedicationAdministrationOutcome.Unknown;
    public MedicationTimingStatus TimingStatus { get; set; } = MedicationTimingStatus.Unknown;
    public MedicationVerificationStatus VerificationStatus { get; set; } = MedicationVerificationStatus.Pending;
    public MedicationAdministrationSourceType SourceType { get; set; } = MedicationAdministrationSourceType.Unknown;
    
    public DateTime? TakenAt { get; set; }
    public DateTime? ActualAdministrationAt { get; set; }
    public int? DelayMinutes { get; set; }
    public int AdministrationWindowMinutesSnapshot { get; set; }
    
    public string? TakenByUserId { get; set; }
    public virtual User? TakenByUser { get; set; }
    public string? RecordedByUserId { get; set; }
    public virtual User? RecordedByUser { get; set; }
    public string? VerifiedByUserId { get; set; }
    public virtual User? VerifiedByUser { get; set; }
    public string? CorrectedByUserId { get; set; }
    public virtual User? CorrectedByUser { get; set; }

    public string? Notes { get; set; } // For "Not Taken" reason or side effects
    public string? ClinicalNotes { get; set; }
    public string? PatientComment { get; set; }
    public string? CorrectionReason { get; set; }
    
    public string? MissedReason { get; set; }
    
    public SideEffectSeverity SideEffectSeverity { get; set; } = SideEffectSeverity.None;
    public string? SideEffectDescription { get; set; }

    public string? AttachmentPath { get; set; }
    public bool IsReminderSent { get; set; }
    public DoseEscalationLevel EscalationLevel { get; set; } = DoseEscalationLevel.None;
    public DateTime? LastEscalationTime { get; set; }
    public int AppliedInventoryQuantity { get; set; }
    public ShiftSlot RecordedShiftSlot { get; set; } = ShiftSlot.None;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<MedicationDoseStatusHistory> StatusHistories { get; set; } = new List<MedicationDoseStatusHistory>();
}
