namespace Salmandyar.Domain.Entities;

public class PatientSelfServiceAccessPolicy
{
    public int Id { get; set; }

    public int CareRecipientId { get; set; }
    public virtual CareRecipient CareRecipient { get; set; } = null!;

    public bool IsEnabled { get; set; }

    public DateTime? AccessStartAtUtc { get; set; }
    public DateTime? AccessEndAtUtc { get; set; }

    public int? DailyAccessStartMinutes { get; set; }
    public int? DailyAccessEndMinutes { get; set; }

    public string? CreatedById { get; set; }
    public virtual User? CreatedBy { get; set; }
    public DateTime CreatedAtUtc { get; set; }

    public string? UpdatedById { get; set; }
    public virtual User? UpdatedBy { get; set; }
    public DateTime UpdatedAtUtc { get; set; }

    public string? RevokedById { get; set; }
    public virtual User? RevokedBy { get; set; }
    public DateTime? RevokedAtUtc { get; set; }

    public virtual ICollection<PatientSelfServiceFeatureGrant> FeatureGrants { get; set; } = new List<PatientSelfServiceFeatureGrant>();
}
