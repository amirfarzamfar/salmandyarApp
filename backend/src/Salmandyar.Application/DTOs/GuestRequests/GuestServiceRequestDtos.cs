using Salmandyar.Application.DTOs.Assessments;
using Salmandyar.Domain.Enums;

namespace Salmandyar.Application.DTOs.GuestRequests;

public class CreateGuestServiceRequestDto
{
    public int FormId { get; set; }
    public int? ServiceDefinitionId { get; set; }
    public string? SummaryJson { get; set; }
    public List<SubmitAnswerDto> Answers { get; set; } = new();
}

public class GuestServiceRequestListItemDto
{
    public Guid Id { get; set; }
    public string TrackingCode { get; set; } = string.Empty;
    public GuestServiceRequestStatus Status { get; set; }
    public string? ServiceType { get; set; }
    public string ContactName { get; set; } = string.Empty;
    public string ContactMobile { get; set; } = string.Empty;
    public string? City { get; set; }
    public string? Urgency { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class GuestServiceRequestTimelineEventDto
{
    public Guid Id { get; set; }
    public GuestServiceRequestTimelineEventType EventType { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ActorName { get; set; }
    public DateTime OccurredAt { get; set; }
}

public class GuestServiceRequestDetailsDto
{
    public Guid Id { get; set; }
    public string TrackingCode { get; set; } = string.Empty;
    public int FormId { get; set; }
    public int SubmissionId { get; set; }
    public int? ServiceDefinitionId { get; set; }
    public string? AssignedSupervisorName { get; set; }
    public string? AssignedCaregiverName { get; set; }
    public int? ConvertedCareRecipientId { get; set; }
    public GuestServiceRequestStatus Status { get; set; }
    public string? ServiceType { get; set; }
    public string? Urgency { get; set; }
    public string? City { get; set; }
    public string ContactName { get; set; } = string.Empty;
    public string ContactMobile { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string? SummaryJson { get; set; }
    public AssessmentFormDto? Form { get; set; }
    public List<SubmitAnswerDto> Answers { get; set; } = new();
    public List<GuestServiceRequestTimelineEventDto> Timeline { get; set; } = new();
}

public class UpdateGuestServiceRequestStatusDto
{
    public GuestServiceRequestStatus Status { get; set; }
}

public class AddGuestServiceRequestNoteDto
{
    public string Note { get; set; } = string.Empty;
}

public class SendGuestServiceRequestSmsDto
{
    public string Message { get; set; } = string.Empty;
}

public class ConvertGuestServiceRequestToPatientDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public string PrimaryDiagnosis { get; set; } = string.Empty;
    public string CurrentStatus { get; set; } = string.Empty;
    public int CareLevel { get; set; }
    public string? MedicalHistory { get; set; }
    public string? Needs { get; set; }
    public string? Address { get; set; }
}

public class AssignGuestServiceRequestCaregiverDto
{
    public string? CaregiverId { get; set; }
}
