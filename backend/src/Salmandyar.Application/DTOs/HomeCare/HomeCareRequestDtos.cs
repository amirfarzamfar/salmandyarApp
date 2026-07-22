using Salmandyar.Application.DTOs.Assessments;
using Salmandyar.Domain.Entities;
using Salmandyar.Domain.Enums;

namespace Salmandyar.Application.DTOs.HomeCare;

public class CreateHomeCareRequestDto
{
    public int ServiceDefinitionId { get; set; }
    public int FormId { get; set; }
    public int? CareRecipientId { get; set; }
    public string PatientRelationship { get; set; } = string.Empty;
    public string ContactFirstName { get; set; } = string.Empty;
    public string ContactLastName { get; set; } = string.Empty;
    public string ContactMobile { get; set; } = string.Empty;
    public HomeCareContactMethod PreferredContactMethod { get; set; } = HomeCareContactMethod.PhoneCall;
    public string? ContactTimePreference { get; set; }
    public DateTime? PreferredStartAt { get; set; }
    public string? City { get; set; }
    public string? Address { get; set; }
    public string? Floor { get; set; }
    public bool HasElevator { get; set; }
    public string? HomeConditionNotes { get; set; }
    public string? Notes { get; set; }
    public string? SummaryJson { get; set; }
    public List<SubmitAnswerDto> Answers { get; set; } = new();
}

public class HomeCareUploadedFilePayload
{
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = "application/octet-stream";
    public long Length { get; set; }
    public byte[] Content { get; set; } = Array.Empty<byte>();
}

public class SaveHomeCareDraftDto : CreateHomeCareRequestDto
{
    public int? SubmissionId { get; set; }
    public string? DraftKey { get; set; }
}

public class HomeCareMessageAttachmentDto
{
    public Guid Id { get; set; }
    public string OriginalFileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
}

public class HomeCareMessageDto
{
    public Guid Id { get; set; }
    public string SenderUserId { get; set; } = string.Empty;
    public string SenderName { get; set; } = string.Empty;
    public string SenderRoleLabel { get; set; } = string.Empty;
    public HomeCareMessageType MessageType { get; set; }
    public string Content { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime SentAt { get; set; }
    public DateTime? ReadAt { get; set; }
    public List<HomeCareMessageAttachmentDto> Attachments { get; set; } = new();
}

public class HomeCareTimelineEventDto
{
    public Guid Id { get; set; }
    public HomeCareTimelineEventType EventType { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ActorName { get; set; }
    public DateTime OccurredAt { get; set; }
}

public class HomeCareConversationParticipantDto
{
    public string UserId { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string RoleLabel { get; set; } = string.Empty;
    public DateTime? LastReadAt { get; set; }
}

public class HomeCareConversationDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public bool IsClosed { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<HomeCareConversationParticipantDto> Participants { get; set; } = new();
    public List<HomeCareMessageDto> Messages { get; set; } = new();
}

public class HomeCareRequestListItemDto
{
    public Guid Id { get; set; }
    public string TrackingCode { get; set; } = string.Empty;
    public string ServiceTitle { get; set; } = string.Empty;
    public ServiceCategory ServiceCategory { get; set; }
    public HomeCareRequestStatus Status { get; set; }
    public string ContactName { get; set; } = string.Empty;
    public string ContactMobile { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? EstimatedContactAt { get; set; }
    public int UnreadMessages { get; set; }
}

public class HomeCareRequestDetailsDto
{
    public Guid Id { get; set; }
    public string TrackingCode { get; set; } = string.Empty;
    public int ServiceDefinitionId { get; set; }
    public string ServiceTitle { get; set; } = string.Empty;
    public ServiceCategory ServiceCategory { get; set; }
    public int FormId { get; set; }
    public int SubmissionId { get; set; }
    public HomeCareRequestStatus Status { get; set; }
    public HomeCareRequestPriority Priority { get; set; }
    public HomeCareContactMethod PreferredContactMethod { get; set; }
    public string? ContactTimePreference { get; set; }
    public string ContactFirstName { get; set; } = string.Empty;
    public string ContactLastName { get; set; } = string.Empty;
    public string ContactMobile { get; set; } = string.Empty;
    public string? PatientRelationship { get; set; }
    public string? City { get; set; }
    public string? Address { get; set; }
    public string? Floor { get; set; }
    public bool HasElevator { get; set; }
    public string? HomeConditionNotes { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? PreferredStartAt { get; set; }
    public DateTime? EstimatedContactAt { get; set; }
    public string? AssignedSupervisorName { get; set; }
    public string? AssignedCaregiverName { get; set; }
    public string? SummaryJson { get; set; }
    public AssessmentFormDto? Form { get; set; }
    public List<SubmitAnswerDto> Answers { get; set; } = new();
    public List<HomeCareTimelineEventDto> Timeline { get; set; } = new();
    public List<HomeCareConversationDto> Conversations { get; set; } = new();
}

public class HomeCareDraftDto
{
    public int SubmissionId { get; set; }
    public string DraftKey { get; set; } = string.Empty;
    public int FormId { get; set; }
    public int ServiceDefinitionId { get; set; }
    public string? SummaryJson { get; set; }
    public DateTime? LastSavedAt { get; set; }
    public List<SubmitAnswerDto> Answers { get; set; } = new();
}

public class SendHomeCareMessageDto
{
    public Guid ConversationId { get; set; }
    public HomeCareMessageType MessageType { get; set; } = HomeCareMessageType.Text;
    public string Content { get; set; } = string.Empty;
}

public class UpdateHomeCareRequestStatusDto
{
    public HomeCareRequestStatus Status { get; set; }
    public string? Note { get; set; }
    public DateTime? EstimatedContactAt { get; set; }
    public string? AssignedSupervisorId { get; set; }
    public string? AssignedCaregiverId { get; set; }
}
