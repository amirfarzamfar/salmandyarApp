namespace Salmandyar.Domain.Entities.PatientProfile;

public class EmergencyContact
{
    public int Id { get; set; }
    public int PatientProfileId { get; set; }
    public virtual PatientProfile PatientProfile { get; set; } = null!;

    public string? Name { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Relationship { get; set; }
}
