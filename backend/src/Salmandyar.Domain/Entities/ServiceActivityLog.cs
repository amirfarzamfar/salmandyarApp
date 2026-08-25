namespace Salmandyar.Domain.Entities;

public class ServiceActivityLog
{
    public int Id { get; set; }

    public int CareServiceId { get; set; }
    public virtual CareService CareService { get; set; } = null!;

    public ServiceActivityType ActivityType { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public string? OldValue { get; set; }
    public string? NewValue { get; set; }

    public string? ActorUserId { get; set; }
    public virtual User? ActorUser { get; set; }

    public string ActorName { get; set; } = string.Empty;
    public string ActorRole { get; set; } = string.Empty;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
