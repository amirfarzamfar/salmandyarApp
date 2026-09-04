using Salmandyar.Domain.Enums;

namespace Salmandyar.Domain.Entities.GuestRequests;

public class GuestFollowUp
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid RequestId { get; set; }
    public virtual GuestServiceRequest Request { get; set; } = null!;

    public DateTime ScheduledAt { get; set; }
    public GuestFollowUpStatus Status { get; set; } = GuestFollowUpStatus.Pending;

    public string? FollowUpType { get; set; }
    public string? Description { get; set; }

    public string? AssignedToUserId { get; set; }
    public virtual User? AssignedToUser { get; set; }

    public DateTime? CompletedAt { get; set; }
    public string? ResolutionNotes { get; set; }

    public string CreatedByUserId { get; set; } = string.Empty;
    public virtual User CreatedByUser { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
