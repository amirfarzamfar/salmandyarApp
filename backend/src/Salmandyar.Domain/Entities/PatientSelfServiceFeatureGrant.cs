namespace Salmandyar.Domain.Entities;

public class PatientSelfServiceFeatureGrant
{
    public int Id { get; set; }

    public int PolicyId { get; set; }
    public virtual PatientSelfServiceAccessPolicy Policy { get; set; } = null!;

    public string FeatureKey { get; set; } = string.Empty;
    public bool IsEnabled { get; set; }

    public string? UpdatedById { get; set; }
    public virtual User? UpdatedBy { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
}
