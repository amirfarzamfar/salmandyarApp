using Salmandyar.Domain.Entities.Assessments;
using Salmandyar.Domain.Enums;
using Salmandyar.Domain.Entities;

namespace Salmandyar.Domain.Entities.GuestRequests;

public class GuestServiceRequest
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TrackingCode { get; set; } = string.Empty;
    public int FormId { get; set; }
    public virtual AssessmentForm Form { get; set; } = null!;
    public int SubmissionId { get; set; }
    public virtual AssessmentSubmission Submission { get; set; } = null!;
    public int? ServiceDefinitionId { get; set; }
    public virtual ServiceDefinition? ServiceDefinition { get; set; }
    public string? AssignedSupervisorId { get; set; }
    public virtual User? AssignedSupervisor { get; set; }
    public string? AssignedCaregiverId { get; set; }
    public virtual User? AssignedCaregiver { get; set; }
    public int? ConvertedCareRecipientId { get; set; }
    public virtual CareRecipient? ConvertedCareRecipient { get; set; }
    public GuestServiceRequestStatus Status { get; set; } = GuestServiceRequestStatus.New;
    public string? ServiceType { get; set; }
    public string? Urgency { get; set; }
    public string? City { get; set; }
    public string ContactName { get; set; } = string.Empty;
    public string ContactMobile { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ClosedAt { get; set; }

    public virtual ICollection<GuestServiceRequestTimelineEvent> TimelineEvents { get; set; } = new List<GuestServiceRequestTimelineEvent>();
}

public class GuestServiceRequestTimelineEvent
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid RequestId { get; set; }
    public virtual GuestServiceRequest Request { get; set; } = null!;
    public GuestServiceRequestTimelineEventType EventType { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ActorUserId { get; set; }
    public virtual User? ActorUser { get; set; }
    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;
    public string? MetadataJson { get; set; }
}
