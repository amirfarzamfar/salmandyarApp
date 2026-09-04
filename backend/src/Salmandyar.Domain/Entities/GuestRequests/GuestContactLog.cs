using Salmandyar.Domain.Enums;

namespace Salmandyar.Domain.Entities.GuestRequests;

public class GuestContactLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid RequestId { get; set; }
    public virtual GuestServiceRequest Request { get; set; } = null!;

    public DateTime ContactedAt { get; set; } = DateTime.UtcNow;
    public GuestContactChannel Channel { get; set; } = GuestContactChannel.PhoneCall;
    public GuestContactResult Result { get; set; } = GuestContactResult.Answered;

    public int? DurationSeconds { get; set; }
    public string? Notes { get; set; }
    public string? NextAction { get; set; }
    public DateTime? NextFollowUpSuggestedAt { get; set; }

    public string? ActorUserId { get; set; }
    public virtual User? ActorUser { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
