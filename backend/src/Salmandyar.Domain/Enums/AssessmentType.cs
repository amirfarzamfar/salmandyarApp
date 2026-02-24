namespace Salmandyar.Domain.Enums;

public enum AssessmentType
{
    // Legacy types (kept for compatibility, but hidden in UI)
    NurseAssessment = 0,
    SeniorAssessment = 1,
    SpecializedAssessment = 2,
    Exam = 3,

    // Role-based types
    Manager = 10,
    Supervisor = 11,
    Nurse = 12,
    AssistantNurse = 13,
    Physiotherapist = 14,
    ElderlyCareAssistant = 15,
    Elderly = 16,
    Patient = 17,
    PatientFamily = 18
}
