using Salmandyar.Domain.Enums;

namespace Salmandyar.Application.DTOs.Medications;

public class MedicationDto
{
    public int Id { get; set; }
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
