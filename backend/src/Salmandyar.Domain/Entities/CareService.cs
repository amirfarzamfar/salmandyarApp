namespace Salmandyar.Domain.Entities;

public class CareService
{
    public int Id { get; set; }

    public int CareRecipientId { get; set; }
    public virtual CareRecipient CareRecipient { get; set; } = null!;

    public string? PerformerId { get; set; }
    public virtual User? Performer { get; set; }

    public DateTime PerformedAt { get; set; } // Will be used as Date
    public DateTime? StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    
    // Legacy: ServiceType (can be kept for migration or removed)
    // We will make it optional for backward compatibility or remove it if we migrate data.
    // For this task, we assume new structure replaces old one.
    public string? ServiceType { get; set; } 
    
    public int ServiceDefinitionId { get; set; }
    public virtual ServiceDefinition ServiceDefinition { get; set; } = null!;

    public CareServiceStatus Status { get; set; } = CareServiceStatus.Planned;

    public string Description { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
