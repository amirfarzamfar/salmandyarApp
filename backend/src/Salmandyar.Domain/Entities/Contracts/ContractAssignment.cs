using Salmandyar.Domain.Enums;
using System.Collections.Generic;

namespace Salmandyar.Domain.Entities.Contracts;

public class ContractAssignment
{
    public int Id { get; set; }
    public int ContractTemplateId { get; set; }
    public virtual ContractTemplate ContractTemplate { get; set; } = null!;
    public string UserId { get; set; } = string.Empty;
    public virtual User User { get; set; } = null!;
    public string? ContractNumber { get; set; }
    public ContractStatus Status { get; set; } = ContractStatus.Draft;
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    public DateTime? SubmittedAt { get; set; }
    public DateTime? SignedAt { get; set; }
    public string? SignedSnapshotContractText { get; set; }
    public string? ContentHash { get; set; }
    public DateTime? EmployerSignedAt { get; set; }
    public string? EmployerUserId { get; set; }
    public virtual User? EmployerUser { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public DateTime? CancellationRequestedAt { get; set; }
    public string? CancellationReason { get; set; }

    public virtual ICollection<ContractFieldValue> FieldValues { get; set; } = new List<ContractFieldValue>();
    public virtual ICollection<ContractSigningAuditLog> AuditLogs { get; set; } = new List<ContractSigningAuditLog>();
}
