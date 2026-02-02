using Microsoft.AspNetCore.Identity;

namespace Salmandyar.Domain.Entities;

public class User : IdentityUser
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    
    // New Fields for User Management
    public string? NationalCode { get; set; }
    public bool IsActive { get; set; } = true;
    public string? BanReason { get; set; }
    public string? AdminNotes { get; set; }
    public DateTime? LastLoginDate { get; set; }
    public string? LastLoginIp { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual CaregiverProfile? CaregiverProfile { get; set; }
    public virtual ICollection<CareRecipient> CareRecipients { get; set; } = new List<CareRecipient>(); // If user is Family
}
