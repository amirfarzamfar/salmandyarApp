using Salmandyar.Domain.Enums;

namespace Salmandyar.Domain.Entities.Medications;

public class MedicationDoseStatusHistory
{
    public long Id { get; set; }

    public int MedicationDoseId { get; set; }
    public virtual MedicationDose MedicationDose { get; set; } = null!;

    public DoseStatus FromStatus { get; set; } = DoseStatus.Scheduled;
    public DoseStatus ToStatus { get; set; } = DoseStatus.Scheduled;

    public MedicationAdministrationOutcome FromAdministrationOutcome { get; set; } = MedicationAdministrationOutcome.Unknown;
    public MedicationAdministrationOutcome ToAdministrationOutcome { get; set; } = MedicationAdministrationOutcome.Unknown;

    public MedicationTimingStatus FromTimingStatus { get; set; } = MedicationTimingStatus.Unknown;
    public MedicationTimingStatus ToTimingStatus { get; set; } = MedicationTimingStatus.Unknown;

    public MedicationVerificationStatus FromVerificationStatus { get; set; } = MedicationVerificationStatus.Pending;
    public MedicationVerificationStatus ToVerificationStatus { get; set; } = MedicationVerificationStatus.Pending;

    public MedicationAdministrationSourceType SourceType { get; set; } = MedicationAdministrationSourceType.Unknown;
    public string Action { get; set; } = string.Empty;
    public string? Reason { get; set; }
    public string? Notes { get; set; }
    public string? MetadataJson { get; set; }

    public string? ChangedByUserId { get; set; }
    public virtual User? ChangedByUser { get; set; }
    public DateTime ChangedAtUtc { get; set; } = DateTime.UtcNow;
}
