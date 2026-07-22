namespace Salmandyar.Domain.Enums;

public enum AssessmentFormWorkflow
{
    Assessment = 0,
    UserEvaluation = 1,
    HomeCareRequest = 2,
    Checklist = 3,
    SatisfactionSurvey = 4
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
