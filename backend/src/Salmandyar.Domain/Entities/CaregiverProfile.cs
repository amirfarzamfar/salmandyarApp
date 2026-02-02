namespace Salmandyar.Domain.Entities;

public class CaregiverProfile
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public virtual User User { get; set; } = null!;
    
    public string Specialization { get; set; } = string.Empty; // e.g., ICU, Elderly Care
    public string LicenseNumber { get; set; } = string.Empty;
    public int ExperienceYears { get; set; }
    public string Bio { get; set; } = string.Empty;
    public bool IsVerified { get; set; }
}
