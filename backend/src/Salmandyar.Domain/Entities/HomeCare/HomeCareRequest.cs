using Salmandyar.Domain.Entities.Assessments;
using Salmandyar.Domain.Enums;

namespace Salmandyar.Domain.Entities.HomeCare;

public class HomeCareRequest
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TrackingCode { get; set; } = string.Empty;
    public int ServiceDefinitionId { get; set; }
    public virtual ServiceDefinition ServiceDefinition { get; set; } = null!;
    public int FormId { get; set; }
    public virtual AssessmentForm Form { get; set; } = null!;
    public int SubmissionId { get; set; }
    public virtual AssessmentSubmission Submission { get; set; } = null!;
    public int? CareRecipientId { get; set; }
    public virtual CareRecipient? CareRecipient { get; set; }
    public string RequesterUserId { get; set; } = string.Empty;
    public virtual User RequesterUser { get; set; } = null!;
    public string? AssignedSupervisorId { get; set; }
    public virtual User? AssignedSupervisor { get; set; }
    public string? AssignedCaregiverId { get; set; }
    public virtual User? AssignedCaregiver { get; set; }
    public HomeCareRequestStatus Status { get; set; } = HomeCareRequestStatus.Submitted;
    public HomeCareRequestPriority Priority { get; set; } = HomeCareRequestPriority.Normal;
    public HomeCareContactMethod PreferredContactMethod { get; set; } = HomeCareContactMethod.PhoneCall;
    public string? ContactTimePreference { get; set; }
    public DateTime? PreferredStartAt { get; set; }
    public DateTime? EstimatedContactAt { get; set; }
    public string? City { get; set; }
    public string? Address { get; set; }
    public string? Floor { get; set; }
    public bool HasElevator { get; set; }
    public string? HomeConditionNotes { get; set; }
    public string? PatientRelationship { get; set; }
    public string ContactFirstName { get; set; } = string.Empty;
    public string ContactLastName { get; set; } = string.Empty;
    public string ContactMobile { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ClosedAt { get; set; }

    public virtual ICollection<HomeCareRequestTimelineEvent> TimelineEvents { get; set; } = new List<HomeCareRequestTimelineEvent>();
    public virtual ICollection<HomeCareRequestAttachment> Attachments { get; set; } = new List<HomeCareRequestAttachment>();
    public virtual ICollection<HomeCareConversation> Conversations { get; set; } = new List<HomeCareConversation>();
}

public class HomeCareRequestAttachment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid RequestId { get; set; }
    public virtual HomeCareRequest Request { get; set; } = null!;
    public string Category { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public string StoredFileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public string UploadedByUserId { get; set; } = string.Empty;
    public virtual User UploadedByUser { get; set; } = null!;
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}

public class HomeCareRequestTimelineEvent
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid RequestId { get; set; }
    public virtual HomeCareRequest Request { get; set; } = null!;
    public HomeCareTimelineEventType EventType { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ActorUserId { get; set; }
    public virtual User? ActorUser { get; set; }
    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;
    public string? MetadataJson { get; set; }
}

public class HomeCareConversation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid RequestId { get; set; }
    public virtual HomeCareRequest Request { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public bool IsClosed { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public virtual ICollection<HomeCareConversationParticipant> Participants { get; set; } = new List<HomeCareConversationParticipant>();
    public virtual ICollection<HomeCareMessage> Messages { get; set; } = new List<HomeCareMessage>();
}

public class HomeCareConversationParticipant
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ConversationId { get; set; }
    public virtual HomeCareConversation Conversation { get; set; } = null!;
    public string UserId { get; set; } = string.Empty;
    public virtual User User { get; set; } = null!;
    public string RoleLabel { get; set; } = string.Empty;
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastReadAt { get; set; }
}

public class HomeCareMessage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ConversationId { get; set; }
    public virtual HomeCareConversation Conversation { get; set; } = null!;
    public string SenderUserId { get; set; } = string.Empty;
    public virtual User SenderUser { get; set; } = null!;
    public HomeCareMessageType MessageType { get; set; } = HomeCareMessageType.Text;
    public string Content { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReadAt { get; set; }

    public virtual ICollection<HomeCareMessageAttachment> Attachments { get; set; } = new List<HomeCareMessageAttachment>();
}

public class HomeCareMessageAttachment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid MessageId { get; set; }
    public virtual HomeCareMessage Message { get; set; } = null!;
    public string OriginalFileName { get; set; } = string.Empty;
    public string StoredFileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
}
