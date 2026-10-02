using Salmandyar.Domain.Enums;
using System.Collections.Generic;

namespace Salmandyar.Domain.Entities.Contracts;

public class ContractTemplate
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string CooperationType { get; set; } = string.Empty;
    public string ContractText { get; set; } = string.Empty;
    public int Version { get; set; } = 1;
    public bool IsActive { get; set; } = false;
    public DateTime? EffectiveStartDate { get; set; }
    public DateTime? EffectiveEndDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedByUserId { get; set; }
    public virtual User? CreatedByUser { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedByUserId { get; set; }
    public virtual User? UpdatedByUser { get; set; }
    public DateTime? PublishedAt { get; set; }

    public virtual ICollection<ContractField> Fields { get; set; } = new List<ContractField>();
    public virtual ICollection<ContractAssignment> Assignments { get; set; } = new List<ContractAssignment>();
}
