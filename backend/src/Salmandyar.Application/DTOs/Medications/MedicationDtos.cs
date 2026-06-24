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
    public string MedicationName { get; set; } = string.Empty;
    public string Dosage { get; set; } = string.Empty;
    public string Route { get; set; } = string.Empty;
    public string Instructions { get; set; } = string.Empty;
    public DateTime ScheduledTime { get; set; }
    public DoseStatus Status { get; set; }
    public DateTime? TakenAt { get; set; }
    public string? TakenByName { get; set; }
    public string? Notes { get; set; }
    public string? MissedReason { get; set; }
    public SideEffectSeverity SideEffectSeverity { get; set; }
    public string? SideEffectDescription { get; set; }
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
