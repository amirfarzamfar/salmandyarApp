namespace Salmandyar.Domain.Enums;

public enum MedicationCriticality
{
    Routine = 0,
    Important = 1,
    HighAlert = 2,
    LifeSaving = 3
}

public enum DoseStatus
{
    Scheduled = 0,
    Due = 1,
    Late = 2,
    Taken = 3,
    Missed = 4,
    Cancelled = 5,
    Skipped = 6
}

public enum SideEffectSeverity
{
    None = 0,
    Mild = 1,
    Moderate = 2,
    Severe = 3
}

public enum MedicationFrequencyType
{
    Daily = 0,
    Weekly = 1,
    PRN = 2,
    Interval = 3, // Every X hours
    SpecificDays = 4
}

public enum DoseEscalationLevel
{
    None = 0,
    NurseNotified = 1,
    SupervisorNotified = 2,
    FamilyNotified = 3
}
