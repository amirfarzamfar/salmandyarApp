namespace Salmandyar.Domain.Entities;

public class ServiceAssignmentHistory
{
    public int Id { get; set; }

    public int CareServiceId { get; set; }
    public virtual CareService CareService { get; set; } = null!;

    public string? PreviousProviderId { get; set; }
    public virtual User? PreviousProvider { get; set; }
    public string? PreviousProviderName { get; set; }

    public string? NewProviderId { get; set; }
    public virtual User? NewProvider { get; set; }
    public string? NewProviderName { get; set; }

    public string Reason { get; set; } = string.Empty;

    public string? ChangedById { get; set; }
    public virtual User? ChangedBy { get; set; }
    public string ChangedByName { get; set; } = string.Empty;

    public DateTime ChangedAtUtc { get; set; } = DateTime.UtcNow;
}
