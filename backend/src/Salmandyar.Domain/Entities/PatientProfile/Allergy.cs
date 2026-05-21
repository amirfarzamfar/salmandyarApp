namespace Salmandyar.Domain.Entities.PatientProfile;

public class Allergy
{
    public int Id { get; set; }
    public int PatientProfileId { get; set; }
    public virtual PatientProfile PatientProfile { get; set; } = null!;

    public string? AllergyType { get; set; } // Drug, Food, Respiratory
    public string? Description { get; set; }
}
