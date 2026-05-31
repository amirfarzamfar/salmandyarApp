using System;
using System.Collections.Generic;

namespace Salmandyar.Application.DTOs.PatientProfile;

public class PatientProfileDto
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string? NationalCode { get; set; }
    public string? Gender { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? FatherName { get; set; }
    public string? MaritalStatus { get; set; }
    public string? Nationality { get; set; }
    public string? ProfileImageUrl { get; set; }
    public string? MobileNumber { get; set; }
    public double? Height { get; set; }
    public double? Weight { get; set; }
    public string? BloodGroup { get; set; }
    public string? MobilityStatus { get; set; }
    public bool UsesWheelchair { get; set; }
    public bool UsesWalker { get; set; }
    public string? WalkingAbility { get; set; }
    public string? AttendingPhysician { get; set; }
    public string? PhysicianPhone { get; set; }
    public string? PreviousHospital { get; set; }
    public string? HospitalizationHistory { get; set; }
    public string? SurgeryHistory { get; set; }
    public bool HasHomeOxygen { get; set; }
    public bool HasVentilator { get; set; }
    public bool HasTracheostomy { get; set; }
    public bool HasPEG { get; set; }
    public bool HasUrinaryCatheter { get; set; }
    public bool HasBedsore { get; set; }
    public List<string> NeededHomeMedicalEquipment { get; set; } = new();
    public List<string> AvailableHomeMedicalEquipment { get; set; } = new();
    public string? OtherNeededHomeMedicalEquipment { get; set; }
    public string? OtherAvailableHomeMedicalEquipment { get; set; }
    public string? DynamicAnswersJson { get; set; }
    public int CompletionPercentage { get; set; }
    public int CurrentStep { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime? LastUpdatedAt { get; set; }
    public string? LastUpdatedByName { get; set; }
    
    public AddressDto? Address { get; set; }
    public EmergencyContactDto? EmergencyContact { get; set; }
    public MedicalHistoryDto? MedicalHistory { get; set; }
    public ElderlyAssessmentDto? ElderlyAssessment { get; set; }
    public List<AllergyDto> Allergies { get; set; } = new();
    public List<UploadedDocumentDto> Documents { get; set; } = new();
}

public class AddressDto
{
    public int Id { get; set; }
    public string? State { get; set; }
    public string? City { get; set; }
    public string? FullAddress { get; set; }
    public string? PostalCode { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
}

public class EmergencyContactDto
{
    public int Id { get; set; }
    public string? Name { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Relationship { get; set; }
}

public class MedicalHistoryDto
{
    public int Id { get; set; }
    public bool HasDiabetes { get; set; }
    public bool HasHypertension { get; set; }
    public bool HasHeartDisease { get; set; }
    public bool HasCOPD { get; set; }
    public bool HasAsthma { get; set; }
    public bool HasKidneyFailure { get; set; }
    public bool HasStroke { get; set; }
    public bool HasAlzheimers { get; set; }
    public bool HasParkinsons { get; set; }
    public bool HasCancer { get; set; }
    public bool HasPsychiatricDisorders { get; set; }
    public string? OtherDiseases { get; set; }
}

public class AllergyDto
{
    public int Id { get; set; }
    public string? AllergyType { get; set; }
    public string? Description { get; set; }
}

public class UploadedDocumentDto
{
    public int Id { get; set; }
    public string? DocumentType { get; set; }
    public string? FileUrl { get; set; }
    public DateTime UploadDate { get; set; }
}

public class ElderlyAssessmentDto
{
    public int Id { get; set; }
    public string? ConsciousnessLevel { get; set; }
    public string? DailyActivityAbility { get; set; }
    public string? FallRisk { get; set; }
    public string? SwallowingDisorder { get; set; }
    public string? NutritionStatus { get; set; }
    public bool HasUrinaryIncontinence { get; set; }
    public bool HasFecalIncontinence { get; set; }
}
