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

public enum MedicationAdministrationOutcome
{
    Unknown = 0,
    Taken = 1,
    Missed = 2,
    SkippedByPatient = 3,
    NotApplicable = 4
}

public enum MedicationTimingStatus
{
    Unknown = 0,
    OnTime = 1,
    Late = 2,
    Missed = 3
}

public enum MedicationVerificationStatus
{
    Pending = 0,
    ConfirmedByNurse = 1,
    CorrectedByAdmin = 2,
    RejectedByNurse = 3
}

public enum MedicationAdministrationSourceType
{
    Unknown = 0,
    Patient = 1,
    Nurse = 2,
    System = 3,
    Admin = 4
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

public enum MedicationStockStatus
{
    InStock = 0,
    LowStock = 1,
    OutOfStock = 2
}

public enum MedicationInventoryTransactionType
{
    InitialStock = 0,
    DoseConsumption = 1,
    ManualIncrease = 2,
    ManualDecrease = 3,
    Adjustment = 4,
    StockReturn = 5
}

public enum MedicationAlertChannel
{
    InApp = 0,
    Sms = 1,
    Email = 2
}

public enum MedicationAlertHistoryStatus
{
    Success = 0,
    Failed = 1
}

public enum MedicationAlertRecipientType
{
    Patient = 0,
    Nurse = 1,
    Admin = 2,
    CustomPhone = 3,
    CustomEmail = 4,
    Family = 5
}

public enum MedicationAlertType
{
    LowStock = 0
}
