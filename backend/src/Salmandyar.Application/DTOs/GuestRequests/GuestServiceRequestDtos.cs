using Salmandyar.Application.DTOs.Assessments;
using Salmandyar.Application.DTOs.Common;
using Salmandyar.Domain.Enums;

namespace Salmandyar.Application.DTOs.GuestRequests;

public class CreateGuestServiceRequestDto
{
    public int FormId { get; set; }
    public int? ServiceDefinitionId { get; set; }
    public string? SummaryJson { get; set; }
    public List<SubmitAnswerDto> Answers { get; set; } = new();
}

public class GuestRequestQueryDto
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? SearchQuery { get; set; }
    public GuestServiceRequestStatus? Status { get; set; }
    public GuestServiceRequestPriority? Priority { get; set; }
    public string? AssignedSupervisorId { get; set; }
    public string? AssignedCaregiverId { get; set; }
    public int? FormId { get; set; }
    public GuestServiceRequestSource? Source { get; set; }
    public DateTime? CreatedFrom { get; set; }
    public DateTime? CreatedTo { get; set; }
    public DateTime? NextFollowUpFrom { get; set; }
    public DateTime? NextFollowUpTo { get; set; }
    public bool? IsConverted { get; set; }
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; } = true;
}

public class GuestRequestDashboardStatsDto
{
    public int TotalCount { get; set; }
    public int NewCount { get; set; }
    public int UnderReviewCount { get; set; }
    public int NeedContactCount { get; set; }
    public int FollowUpTodayCount { get; set; }
    public int FollowUpOverdueCount { get; set; }
    public int UnassignedCount { get; set; }
    public int HighPriorityCount { get; set; }
    public int EligibleCount { get; set; }
    public int AwaitingConversionCount { get; set; }
    public int ConvertedCount { get; set; }
    public int RejectedCount { get; set; }
    public int CreatedTodayCount { get; set; }
    public int CreatedThisWeekCount { get; set; }
    public int ConvertedTodayCount { get; set; }
    public int NoContactIn3DaysCount { get; set; }
}

public class GuestServiceRequestListItemDto
{
    public Guid Id { get; set; }
    public string TrackingCode { get; set; } = string.Empty;
    public GuestServiceRequestStatus Status { get; set; }
    public GuestServiceRequestPriority Priority { get; set; }
    public string? ServiceType { get; set; }
    public string ContactName { get; set; } = string.Empty;
    public string ContactMobile { get; set; } = string.Empty;
    public string? City { get; set; }
    public string? Urgency { get; set; }
    public string? AssignedSupervisorName { get; set; }
    public string? AssignedCaregiverName { get; set; }
    public int? ConvertedCareRecipientId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? LastContactAt { get; set; }
    public DateTime? NextFollowUpAt { get; set; }
    public int FormId { get; set; }
    public string? FormTitle { get; set; }
    public GuestServiceRequestSource Source { get; set; }
}

public class GuestServiceRequestTimelineEventDto
{
    public Guid Id { get; set; }
    public GuestServiceRequestTimelineEventType EventType { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ActorName { get; set; }
    public string? ActorId { get; set; }
    public DateTime OccurredAt { get; set; }
    public string? MetadataJson { get; set; }
}

public class GuestContactLogDto
{
    public Guid Id { get; set; }
    public Guid RequestId { get; set; }
    public DateTime ContactedAt { get; set; }
    public GuestContactChannel Channel { get; set; }
    public GuestContactResult Result { get; set; }
    public int? DurationSeconds { get; set; }
    public string? Notes { get; set; }
    public string? NextAction { get; set; }
    public DateTime? NextFollowUpSuggestedAt { get; set; }
    public string? ActorName { get; set; }
    public string? ActorId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class GuestFollowUpDto
{
    public Guid Id { get; set; }
    public Guid RequestId { get; set; }
    public DateTime ScheduledAt { get; set; }
    public GuestFollowUpStatus Status { get; set; }
    public string? FollowUpType { get; set; }
    public string? Description { get; set; }
    public string? AssignedToUserId { get; set; }
    public string? AssignedToUserName { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? ResolutionNotes { get; set; }
    public string CreatedByUserName { get; set; } = string.Empty;
    public string CreatedByUserId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class DynamicFormFieldDto
{
    public int QuestionId { get; set; }
    public string? GroupKey { get; set; }
    public string? GroupTitle { get; set; }
    public string? PageKey { get; set; }
    public string? PageTitle { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public QuestionType QuestionType { get; set; }
    public string? DisplayValue { get; set; }
    public string? RawValue { get; set; }
    public bool HasValue { get; set; }
    public int Order { get; set; }
    public List<string>? Tags { get; set; }
}

public class DynamicFormSectionDto
{
    public string? Key { get; set; }
    public string? Title { get; set; }
    public int Order { get; set; }
    public List<DynamicFormFieldDto> Fields { get; set; } = new();
}

public class GuestServiceRequestDetailsDto
{
    public Guid Id { get; set; }
    public string TrackingCode { get; set; } = string.Empty;
    public int FormId { get; set; }
    public int FormVersion { get; set; }
    public int SubmissionId { get; set; }
    public int? ServiceDefinitionId { get; set; }
    public string? AssignedSupervisorId { get; set; }
    public string? AssignedSupervisorName { get; set; }
    public string? AssignedCaregiverId { get; set; }
    public string? AssignedCaregiverName { get; set; }
    public int? ConvertedCareRecipientId { get; set; }
    public GuestServiceRequestStatus Status { get; set; }
    public GuestServiceRequestPriority Priority { get; set; }
    public GuestServiceRequestSource Source { get; set; }
    public string? ServiceType { get; set; }
    public string? Urgency { get; set; }
    public string? City { get; set; }
    public string ContactName { get; set; } = string.Empty;
    public string ContactMobile { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? ClosedAt { get; set; }
    public DateTime? LastContactAt { get; set; }
    public DateTime? NextFollowUpAt { get; set; }
    public DateTime? ConvertedAt { get; set; }
    public string? RejectionReason { get; set; }
    public string? SummaryJson { get; set; }

    public AssessmentFormDto? Form { get; set; }
    public List<SubmitAnswerDto> Answers { get; set; } = new();
    public List<DynamicFormSectionDto> RenderedFormSections { get; set; } = new();
    public List<GuestContactLogDto> ContactLogs { get; set; } = new();
    public List<GuestFollowUpDto> FollowUps { get; set; } = new();
    public List<GuestServiceRequestTimelineEventDto> Timeline { get; set; } = new();
}

public class UpdateGuestServiceRequestStatusDto
{
    public GuestServiceRequestStatus Status { get; set; }
    public string? Reason { get; set; }
}

public class UpdateGuestServiceRequestPriorityDto
{
    public GuestServiceRequestPriority Priority { get; set; }
}

public class AddGuestServiceRequestNoteDto
{
    public string Note { get; set; } = string.Empty;
}

public class SendGuestServiceRequestSmsDto
{
    public string Message { get; set; } = string.Empty;
    public string? TemplateKey { get; set; }
}

public class SmsTemplateDto
{
    public string Key { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class ConvertGuestServiceRequestToPatientDto
{
    public int? ExistingCareRecipientId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string PrimaryDiagnosis { get; set; } = string.Empty;
    public string CurrentStatus { get; set; } = "Stable";
    public int CareLevel { get; set; } = 2;
    public string? MedicalHistory { get; set; }
    public string? Needs { get; set; }
    public string? Address { get; set; }
    public string? FamilyMemberUserId { get; set; }
}

public class DuplicatePatientCandidateDto
{
    public int CareRecipientId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateTime? DateOfBirth { get; set; }
    public string? MobileNumber { get; set; }
    public string MatchReason { get; set; } = string.Empty;
    public double MatchScore { get; set; }
}

public class AssignGuestServiceRequestSupervisorDto
{
    public string? SupervisorId { get; set; }
}

public class AssignGuestServiceRequestCaregiverDto
{
    public string? CaregiverId { get; set; }
}

public class CreateGuestContactLogDto
{
    public DateTime? ContactedAt { get; set; }
    public GuestContactChannel Channel { get; set; } = GuestContactChannel.PhoneCall;
    public GuestContactResult Result { get; set; } = GuestContactResult.Answered;
    public int? DurationSeconds { get; set; }
    public string? Notes { get; set; }
    public string? NextAction { get; set; }
    public DateTime? NextFollowUpSuggestedAt { get; set; }
}

public class CreateGuestFollowUpDto
{
    public DateTime ScheduledAt { get; set; }
    public string? FollowUpType { get; set; }
    public string? Description { get; set; }
    public string? AssignedToUserId { get; set; }
}

public class UpdateGuestFollowUpDto
{
    public DateTime? ScheduledAt { get; set; }
    public GuestFollowUpStatus? Status { get; set; }
    public string? FollowUpType { get; set; }
    public string? Description { get; set; }
    public string? AssignedToUserId { get; set; }
    public string? ResolutionNotes { get; set; }
}

public class RejectGuestRequestDto
{
    public string Reason { get; set; } = string.Empty;
}
