using Salmandyar.Domain.Enums;

namespace Salmandyar.Application.DTOs.Medications;

public class MedicationDto
{
    public int Id { get; set; }
    public int CareRecipientId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Form { get; set; } = string.Empty;
    public string Dosage { get; set; } = string.Empty;
    public string Route { get; set; } = string.Empty;
    public MedicationFrequencyType FrequencyType { get; set; }
    public string? FrequencyDetail { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsPRN { get; set; }
    public bool HighAlert { get; set; }
    public MedicationCriticality Criticality { get; set; }
    public string? Instructions { get; set; }
    
    public int GracePeriodMinutes { get; set; }
    public bool NotifyPatient { get; set; }
    public bool NotifyNurse { get; set; }
    public bool NotifySupervisor { get; set; }
    public bool NotifyFamily { get; set; }
    public bool EscalationEnabled { get; set; }

    public int TotalQuantity { get; set; }
    public int AlertLimit { get; set; }
    public int DoseQuantity { get; set; }
    public MedicationStockStatus StockStatus { get; set; }
    public string StockStatusLabel { get; set; } = string.Empty;
    public bool IsLowStockAlertActive { get; set; }
    public DateTime? LowStockAlertActivatedAt { get; set; }
    public bool AlertLowStockInAppEnabled { get; set; }
    public bool AlertLowStockSmsEnabled { get; set; }
    public bool AlertLowStockEmailEnabled { get; set; }
    public bool AlertLowStockPatient { get; set; }
    public bool AlertLowStockNurse { get; set; }
    public bool AlertLowStockFamily { get; set; }
    public bool AlertLowStockAdmin { get; set; }
    public string? AlertLowStockCustomPhone { get; set; }
    public string? AlertLowStockCustomEmail { get; set; }
}

public class CreateMedicationDto
{
    public int CareRecipientId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Form { get; set; } = string.Empty;
    public string Dosage { get; set; } = string.Empty;
    public string Route { get; set; } = string.Empty;
    public MedicationFrequencyType FrequencyType { get; set; }
    public string? FrequencyDetail { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsPRN { get; set; }
    public bool HighAlert { get; set; }
    public MedicationCriticality Criticality { get; set; }
    public string? Instructions { get; set; }

    public int GracePeriodMinutes { get; set; } = 30;
    public bool NotifyPatient { get; set; }
    public bool NotifyNurse { get; set; }
    public bool NotifySupervisor { get; set; }
    public bool NotifyFamily { get; set; }
    public bool EscalationEnabled { get; set; }

    public int TotalQuantity { get; set; }
    public int AlertLimit { get; set; }
    public int DoseQuantity { get; set; } = 1;
    public bool AlertLowStockInAppEnabled { get; set; } = true;
    public bool AlertLowStockSmsEnabled { get; set; }
    public bool AlertLowStockEmailEnabled { get; set; }
    public bool AlertLowStockPatient { get; set; }
    public bool AlertLowStockNurse { get; set; }
    public bool AlertLowStockFamily { get; set; }
    public bool AlertLowStockAdmin { get; set; }
    public string? AlertLowStockCustomPhone { get; set; }
    public string? AlertLowStockCustomEmail { get; set; }
}

public class UpdateMedicationDto
{
    public string Name { get; set; } = string.Empty;
    public string Form { get; set; } = string.Empty;
    public string Dosage { get; set; } = string.Empty;
    public string Route { get; set; } = string.Empty;
    public MedicationFrequencyType FrequencyType { get; set; }
    public string? FrequencyDetail { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsPRN { get; set; }
    public bool HighAlert { get; set; }
    public MedicationCriticality Criticality { get; set; }
    public string? Instructions { get; set; }

    public int GracePeriodMinutes { get; set; } = 30;
    public bool NotifyPatient { get; set; }
    public bool NotifyNurse { get; set; }
    public bool NotifySupervisor { get; set; }
    public bool NotifyFamily { get; set; }
    public bool EscalationEnabled { get; set; }

    public int TotalQuantity { get; set; }
    public int AlertLimit { get; set; }
    public int DoseQuantity { get; set; } = 1;
    public bool AlertLowStockInAppEnabled { get; set; } = true;
    public bool AlertLowStockSmsEnabled { get; set; }
    public bool AlertLowStockEmailEnabled { get; set; }
    public bool AlertLowStockPatient { get; set; }
    public bool AlertLowStockNurse { get; set; }
    public bool AlertLowStockFamily { get; set; }
    public bool AlertLowStockAdmin { get; set; }
    public string? AlertLowStockCustomPhone { get; set; }
    public string? AlertLowStockCustomEmail { get; set; }
}

public class MedicationDoseDto
{
    public int Id { get; set; }
    public int MedicationId { get; set; }
    public int CareRecipientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string MedicationName { get; set; } = string.Empty;
    public string Dosage { get; set; } = string.Empty;
    public string Route { get; set; } = string.Empty;
    public string Instructions { get; set; } = string.Empty;
    public DateTime ScheduledTime { get; set; }
    public DateTime? AllowedConfirmationUntil { get; set; }
    public DoseStatus Status { get; set; }
    public MedicationAdministrationOutcome AdministrationOutcome { get; set; }
    public MedicationTimingStatus TimingStatus { get; set; }
    public MedicationVerificationStatus VerificationStatus { get; set; }
    public MedicationAdministrationSourceType SourceType { get; set; }
    public DateTime? TakenAt { get; set; }
    public DateTime? ActualAdministrationAt { get; set; }
    public int? DelayMinutes { get; set; }
    public int AdministrationWindowMinutesSnapshot { get; set; }
    public string? TakenByName { get; set; }
    public string? RecordedByName { get; set; }
    public string? VerifiedByName { get; set; }
    public string? CorrectedByName { get; set; }
    public string? Notes { get; set; }
    public string? ClinicalNotes { get; set; }
    public string? PatientComment { get; set; }
    public string? CorrectionReason { get; set; }
    public string? MissedReason { get; set; }
    public SideEffectSeverity SideEffectSeverity { get; set; }
    public string? SideEffectDescription { get; set; }
    public ShiftSlot ScheduledShiftSlot { get; set; }
    public ShiftSlot RecordedShiftSlot { get; set; }
    public int CurrentQuantity { get; set; }
    public int AlertLimit { get; set; }
    public int DoseQuantity { get; set; }
    public MedicationStockStatus StockStatus { get; set; }
    public string StockStatusLabel { get; set; } = string.Empty;
    public bool IsLowStockAlertActive { get; set; }
    
    public string? AttachmentPath { get; set; }
    public bool IsReminderSent { get; set; }
    public DoseEscalationLevel EscalationLevel { get; set; }
}

public class RecordDoseDto
{
    public DateTime TakenAt { get; set; }
    public string? Notes { get; set; }
    public string? MissedReason { get; set; }
    public DoseStatus Status { get; set; } = DoseStatus.Taken;
    public SideEffectSeverity SideEffectSeverity { get; set; }
    public string? SideEffectDescription { get; set; }
    
    public string? AttachmentPath { get; set; }
}

public class PatientConfirmMedicationDoseDto
{
    public DateTime? ActualAdministrationAt { get; set; }
    public string? PatientComment { get; set; }
    public string? Notes { get; set; }
}

public class PatientSkipMedicationDoseDto
{
    public string Reason { get; set; } = string.Empty;
    public string? PatientComment { get; set; }
    public string? Notes { get; set; }
}

public class NurseRecordMedicationDoseDto
{
    public MedicationAdministrationOutcome Outcome { get; set; }
    public DateTime? ActualAdministrationAt { get; set; }
    public string? Notes { get; set; }
    public string? ClinicalNotes { get; set; }
    public string? PatientComment { get; set; }
    public string? MissedReason { get; set; }
    public SideEffectSeverity SideEffectSeverity { get; set; }
    public string? SideEffectDescription { get; set; }
    public string? AttachmentPath { get; set; }
}

public class ReviewMedicationDoseDto
{
    public bool Approve { get; set; }
    public string? Reason { get; set; }
    public string? ClinicalNotes { get; set; }
}

public class CorrectMedicationDoseDto
{
    public MedicationAdministrationOutcome Outcome { get; set; }
    public DateTime? ActualAdministrationAt { get; set; }
    public string CorrectionReason { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string? ClinicalNotes { get; set; }
    public string? PatientComment { get; set; }
    public string? MissedReason { get; set; }
    public SideEffectSeverity SideEffectSeverity { get; set; }
    public string? SideEffectDescription { get; set; }
    public string? AttachmentPath { get; set; }
}

public class MedicationDoseStatusHistoryDto
{
    public long Id { get; set; }
    public DateTime ChangedAtUtc { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? ChangedByName { get; set; }
    public string? Reason { get; set; }
    public string? Notes { get; set; }
    public DoseStatus FromStatus { get; set; }
    public DoseStatus ToStatus { get; set; }
    public MedicationAdministrationOutcome FromAdministrationOutcome { get; set; }
    public MedicationAdministrationOutcome ToAdministrationOutcome { get; set; }
    public MedicationTimingStatus FromTimingStatus { get; set; }
    public MedicationTimingStatus ToTimingStatus { get; set; }
    public MedicationVerificationStatus FromVerificationStatus { get; set; }
    public MedicationVerificationStatus ToVerificationStatus { get; set; }
    public MedicationAdministrationSourceType SourceType { get; set; }
    public string? MetadataJson { get; set; }
}

public class MedicationAdministrationOverviewReportDto
{
    public int TotalDoses { get; set; }
    public int TakenCount { get; set; }
    public int OnTimeCount { get; set; }
    public int LateCount { get; set; }
    public int MissedCount { get; set; }
    public int SkippedCount { get; set; }
    public int PendingCount { get; set; }
    public decimal AdherenceRate { get; set; }
    public decimal OnTimeRate { get; set; }
    public List<MedicationAdministrationPatientSummaryDto> Patients { get; set; } = [];
    public List<MedicationAdministrationMissedMedicationDto> MostMissedMedications { get; set; } = [];
    public List<MedicationAdministrationReportRowDto> Rows { get; set; } = [];
}

public class MedicationAdministrationPatientSummaryDto
{
    public int CareRecipientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public int TotalDoses { get; set; }
    public int TakenCount { get; set; }
    public int MissedCount { get; set; }
    public int LateCount { get; set; }
    public decimal AdherenceRate { get; set; }
}

public class MedicationAdministrationMissedMedicationDto
{
    public int MedicationId { get; set; }
    public string MedicationName { get; set; } = string.Empty;
    public int MissedCount { get; set; }
}

public class MedicationAdministrationReportRowDto
{
    public int DoseId { get; set; }
    public int CareRecipientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public int MedicationId { get; set; }
    public string MedicationName { get; set; } = string.Empty;
    public DateTime ScheduledTime { get; set; }
    public DateTime? ActualAdministrationAt { get; set; }
    public DoseStatus Status { get; set; }
    public MedicationAdministrationOutcome AdministrationOutcome { get; set; }
    public MedicationTimingStatus TimingStatus { get; set; }
    public MedicationVerificationStatus VerificationStatus { get; set; }
    public string? RecordedByName { get; set; }
    public string? VerifiedByName { get; set; }
    public ShiftSlot ScheduledShiftSlot { get; set; }
    public int? DelayMinutes { get; set; }
    public string? Notes { get; set; }
}

public class MedicationAdministrationTrendPointDto
{
    public DateTime Date { get; set; }
    public int TakenCount { get; set; }
    public int LateCount { get; set; }
    public int MissedCount { get; set; }
    public int SkippedCount { get; set; }
}

public class MedicationInventoryTransactionDto
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? PerformedByName { get; set; }
    public MedicationInventoryTransactionType TransactionType { get; set; }
    public string TransactionTypeLabel { get; set; } = string.Empty;
    public int QuantityChanged { get; set; }
    public int QuantityBefore { get; set; }
    public int QuantityAfter { get; set; }
    public string? Notes { get; set; }
}

public class MedicationAlertHistoryDto
{
    public int Id { get; set; }
    public string MedicationName { get; set; } = string.Empty;
    public string PatientName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public MedicationAlertType AlertType { get; set; }
    public string AlertTypeLabel { get; set; } = string.Empty;
    public string Recipient { get; set; } = string.Empty;
    public MedicationAlertChannel Channel { get; set; }
    public string ChannelLabel { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public MedicationAlertHistoryStatus DeliveryStatus { get; set; }
    public string DeliveryStatusLabel { get; set; } = string.Empty;
    public string? ErrorMessage { get; set; }
}

public class UpdateMedicationInventoryDto
{
    public MedicationInventoryTransactionType TransactionType { get; set; }
    public int Quantity { get; set; }
    public string? Notes { get; set; }
}
