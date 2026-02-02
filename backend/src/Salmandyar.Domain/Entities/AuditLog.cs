namespace Salmandyar.Domain.Entities;

public class AuditLog
{
    public int Id { get; set; }
    public string? UserId { get; set; } // Admin who performed the action
    public string Action { get; set; } = string.Empty; // Create, Update, Ban, etc.
    public string EntityName { get; set; } = "User"; // User, Patient, etc.
    public string? EntityId { get; set; } // Affected record ID
    public string? Details { get; set; } // JSON details
    public string? IpAddress { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
