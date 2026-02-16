using Salmandyar.Domain.Enums;

namespace Salmandyar.Domain.Entities.Medications;

public class PatientMedication
{
    public int Id { get; set; }

    public int CareRecipientId { get; set; }
    public virtual CareRecipient CareRecipient { get; set; } = null!;

    public string Name { get; set; } = string.Empty;
    public string Form { get; set; } = string.Empty; // Tablet, Syrup, etc.
    public string Dosage { get; set; } = string.Empty; // e.g. "500mg"
    public string Route { get; set; } = string.Empty; // e.g. "Oral"
    
    public MedicationFrequencyType FrequencyType { get; set; }
    public string? FrequencyDetail { get; set; } // e.g. "8" for Every 8 hours, or "08:00,20:00"
    
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    
    public bool IsPRN { get; set; }
    public bool HighAlert { get; set; }
    public MedicationCriticality Criticality { get; set; } = MedicationCriticality.Routine;

    public string? Instructions { get; set; }

    public int GracePeriodMinutes { get; set; } = 30;
    
    public bool NotifyPatient { get; set; }
    public bool NotifyNurse { get; set; }
    public bool NotifySupervisor { get; set; }
    public bool NotifyFamily { get; set; }
    public bool EscalationEnabled { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedByUserId { get; set; }

    public virtual ICollection<MedicationDose> Doses { get; set; } = new List<MedicationDose>();
}
