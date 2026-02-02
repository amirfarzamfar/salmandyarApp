namespace Salmandyar.Domain.Entities;

public class CareRecipient
{
    public int Id { get; set; }
    
    // If the patient has their own account
    public string? UserId { get; set; }
    public virtual User? User { get; set; }

    // Managed by Family Member
    public string? FamilyMemberId { get; set; }
    public virtual User? FamilyMember { get; set; }

    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public string MedicalHistory { get; set; } = string.Empty;
    public string Needs { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;

    // Medical Info
    public string PrimaryDiagnosis { get; set; } = string.Empty;
    public string CurrentStatus { get; set; } = "Stable"; // Stable, Critical, Recovering
    public CareLevel CareLevel { get; set; } = CareLevel.Level2; // Default 6h

    // Responsible Nurse
    public string? ResponsibleNurseId { get; set; }
    public virtual User? ResponsibleNurse { get; set; }

    // Collections
    public virtual ICollection<VitalSign> VitalSigns { get; set; } = new List<VitalSign>();
    public virtual ICollection<CareService> CareServices { get; set; } = new List<CareService>();
    public virtual ICollection<NursingReport> NursingReports { get; set; } = new List<NursingReport>();
}
