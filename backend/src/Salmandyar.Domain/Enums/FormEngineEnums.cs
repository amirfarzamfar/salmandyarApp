namespace Salmandyar.Domain.Enums;

public enum AssessmentFormWorkflow
{
    Assessment = 0,
    UserEvaluation = 1,
    HomeCareRequest = 2,
    Checklist = 3,
    SatisfactionSurvey = 4,
    GuestServiceRequest = 5
}

public enum AssessmentSubmissionStatus
{
    Draft = 0,
    Submitted = 1,
    Archived = 2
}

public enum HomeCareRequestStatus
{
    Draft = 0,
    Submitted = 1,
    UnderSupervisorReview = 2,
    ContactScheduled = 3,
    AwaitingDocuments = 4,
    MatchingCaregiver = 5,
    AwaitingPatientConfirmation = 6,
    InService = 7,
    Completed = 8,
    SatisfactionPending = 9,
    Cancelled = 10
}

public enum HomeCareRequestPriority
{
    Normal = 0,
    Urgent = 1,
    Critical = 2
}

public enum HomeCareContactMethod
{
    PhoneCall = 0,
    WhatsApp = 1,
    Sms = 2,
    InAppChat = 3
}

public enum HomeCareTimelineEventType
{
    RequestSubmitted = 0,
    SupervisorReviewStarted = 1,
    PatientContactScheduled = 2,
    DocumentsRequested = 3,
    DocumentsReceived = 4,
    CaregiverMatchingStarted = 5,
    CaregiverSuggested = 6,
    PatientConfirmed = 7,
    ServiceStarted = 8,
    ServiceCompleted = 9,
    SatisfactionCaptured = 10,
    StatusChanged = 11,
    NoteAdded = 12
}

public enum HomeCareMessageType
{
    Text = 0,
    Image = 1,
    File = 2,
    Voice = 3,
    System = 4
}

public enum GuestServiceRequestStatus
{
    New = 0,
    UnderReview = 1,
    Contacted = 2,
    ConvertedToPatient = 3,
    Assigned = 4,
    Completed = 5,
    Cancelled = 6
}

public enum GuestServiceRequestTimelineEventType
{
    RequestCreated = 0,
    StatusChanged = 1,
    NoteAdded = 2,
    SmsSent = 3,
    ConvertedToPatient = 4,
    CaregiverAssigned = 5
}
