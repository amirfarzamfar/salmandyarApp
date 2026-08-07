using System.ComponentModel.DataAnnotations;

namespace Salmandyar.Domain.Entities.Content;

public class ServiceCoverageArea
{
    public int Id { get; set; }

    public int ServiceSeoProfileId { get; set; }

    public virtual ServiceSeoProfile ServiceSeoProfile { get; set; } = null!;

    public int? CityId { get; set; }

    public virtual City? City { get; set; }

    [MaxLength(200)]
    public string AreaName { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? District { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }

    public bool Has24HourService { get; set; }

    public decimal? AdditionalCost { get; set; }

    public int DisplayOrder { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
