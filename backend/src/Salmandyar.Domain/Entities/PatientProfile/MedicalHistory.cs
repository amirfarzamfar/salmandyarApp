namespace Salmandyar.Domain.Entities.PatientProfile;

public class MedicalHistory
{
    public int Id { get; set; }
    public int PatientProfileId { get; set; }
    public virtual PatientProfile PatientProfile { get; set; } = null!;

    public bool HasDiabetes { get; set; }
    public bool HasHypertension { get; set; }
    public bool HasHeartDisease { get; set; }
    public bool HasCOPD { get; set; }
    public bool HasAsthma { get; set; }
    public bool HasKidneyFailure { get; set; }
    public bool HasStroke { get; set; }
    public bool HasAlzheimers { get; set; }
    public bool HasParkinsons { get; set; }
    public bool HasCancer { get; set; }
    public bool HasPsychiatricDisorders { get; set; }
    public string? OtherDiseases { get; set; }
}
