namespace Salmandyar.Domain.Entities;

public enum CareServiceStatus
{
    Draft = 0,
    Scheduled = 1,
    Planned = 1,
    Pending = 2,
    Assigned = 3,
    Accepted = 4,
    InProgress = 5,
    Completed = 6,
    Cancelled = 7,
    NoShow = 8,
    Expired = 9
}

public enum ServicePriority
{
    Normal = 1,
    Important = 2,
    Urgent = 3
}

public enum ServiceLocationType
{
    PatientHome = 1,
    MedicalCenter = 2,
    Other = 3
}

public enum ServiceAssignmentStatus
{
    Unassigned = 0,
    Assigned = 1,
    Accepted = 2,
    Declined = 3,
    Reassigned = 4
}

public enum ServiceRecurrenceType
{
    None = 0,
    Daily = 1,
    Weekly = 2,
    Monthly = 3
}

public enum ServiceNotificationStatus
{
    NotCreated = 0,
    Draft = 1,
    Scheduled = 2,
    Sent = 3,
    Delivered = 4,
    Read = 5,
    Failed = 6
}

public enum ServiceNotificationRecipientType
{
    Patient = 1,
    PatientFamily = 2,
    Nurse = 3,
    Caregiver = 4,
    Supervisor = 5,
    All = 10
}

public enum ServiceNotificationChannel
{
    InApp = 1,
    Push = 2,
    Sms = 3,
    Email = 4
}

public enum ServiceActivityType
{
    Created = 1,
    StatusChanged = 2,
    Assigned = 3,
    ProviderChanged = 4,
    ScheduleUpdated = 5,
    NotificationSent = 6,
    DetailsUpdated = 7,
    Cancelled = 8,
    Completed = 9,
    Started = 10,
    Accepted = 11,
    Declined = 12,
    NoShow = 13,
    PriorityChanged = 14,
    NoteAdded = 15
}
