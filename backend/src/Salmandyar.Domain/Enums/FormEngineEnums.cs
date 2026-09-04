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
    NeedContact = 2,
    Contacted = 3,
    FollowUpScheduled = 4,
    Eligible = 5,
    AwaitingConversion = 6,
    ConvertedToPatient = 7,
    Assigned = 8,
    Completed = 9,
    Cancelled = 10,
    Rejected = 11,
    Duplicate = 12
}

public enum GuestServiceRequestPriority
{
    Low = 0,
    Normal = 1,
    High = 2,
    Urgent = 3
}

public enum GuestContactChannel
{
    PhoneCall = 0,
    WhatsApp = 1,
    Sms = 2,
    InPerson = 3,
    Other = 4
}

public enum GuestContactResult
{
    Answered = 0,
    NoAnswer = 1,
    Busy = 2,
    WrongNumber = 3,
    CallBackRequested = 4,
    NotInterested = 5,
    Eligible = 6,
    NotEligible = 7
}

public enum GuestFollowUpStatus
{
    Pending = 0,
    Done = 1,
    Cancelled = 2,
    Overdue = 3
}

public enum GuestServiceRequestSource
{
    LandingForm = 0,
    DirectAdminEntry = 1,
    PhoneCall = 2,
    Referral = 3,
    Other = 4
}

public enum GuestServiceRequestTimelineEventType
{
    RequestCreated = 0,
    StatusChanged = 1,
    NoteAdded = 2,
    SmsSent = 3,
    ConvertedToPatient = 4,
    CaregiverAssigned = 5,
    SupervisorAssigned = 6,
    PriorityChanged = 7,
    ContactLogged = 8,
    FollowUpCreated = 9,
    FollowUpUpdated = 10,
    RequestRejected = 11,
    DuplicateDetected = 12,
    PatientLinked = 13
}
