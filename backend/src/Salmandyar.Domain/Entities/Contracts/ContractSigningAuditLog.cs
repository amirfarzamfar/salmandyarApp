using Salmandyar.Domain.Enums;

namespace Salmandyar.Domain.Entities.Contracts;

public class ContractSigningAuditLog
{
    public int Id { get; set; }
    public int AssignmentId { get; set; }
    public virtual ContractAssignment Assignment { get; set; } = null!;
    public string UserId { get; set; } = string.Empty;
    public virtual User User { get; set; } = null!;
    public ContractAuditActionType ActionType { get; set; }
    public DateTime PerformedAt { get; set; } = DateTime.UtcNow;
    public string? ClientIp { get; set; }
    public string? UserAgent { get; set; }
    public string? DeviceInfoJson { get; set; }
    public string? AuthMethod { get; set; }
    public Guid TransactionId { get; set; }
    public string? ContentHash { get; set; }
    public string? DetailsJson { get; set; }
}
