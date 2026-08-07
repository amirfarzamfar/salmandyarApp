namespace Salmandyar.Domain.Entities.Content;

public class CityService
{
    public int Id { get; set; }

    public int CityId { get; set; }

    public virtual City City { get; set; } = null!;

    public int ServiceDefinitionId { get; set; }

    public virtual ServiceDefinition ServiceDefinition { get; set; } = null!;

    public bool IsActive { get; set; } = true;

    public decimal? StartingPrice { get; set; }

    public string? PricingNotes { get; set; }

    public int EstimatedResponseMinutes { get; set; } = 60;

    public bool Has24HourService { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
