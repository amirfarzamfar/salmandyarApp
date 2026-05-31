using System;
using System.Collections.Generic;

namespace Salmandyar.Application.DTOs.PatientProfile;

public class UpdatePatientProfileDto
{
    // Common fields
    public int CurrentStep { get; set; }
    public string? DynamicAnswersJson { get; set; }

    // Step 1: Identity
    public string? NationalCode { get; set; }
    public string? Gender { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? FatherName { get; set; }
    public string? MaritalStatus { get; set; }
    public string? Nationality { get; set; }
    public string? ProfileImageUrl { get; set; }

    // Step 2: Contact
    public string? MobileNumber { get; set; }
    public AddressDto? Address { get; set; }
    public EmergencyContactDto? EmergencyContact { get; set; }

    // Step 3: Physical & Basic Info
    public double? Height { get; set; }
    public double? Weight { get; set; }
    public string? BloodGroup { get; set; }
    public string? MobilityStatus { get; set; }
    public bool? UsesWheelchair { get; set; }
    public bool? UsesWalker { get; set; }
    public string? WalkingAbility { get; set; }

    // Step 4: Medical History
    public MedicalHistoryDto? MedicalHistory { get; set; }

    // Step 5: Allergies
    public List<AllergyDto>? Allergies { get; set; }

    // Step 6: Treatment Info
    public string? AttendingPhysician { get; set; }
    public string? PhysicianPhone { get; set; }
    public string? PreviousHospital { get; set; }
    public string? HospitalizationHistory { get; set; }
    public string? SurgeryHistory { get; set; }
    public bool? HasHomeOxygen { get; set; }
    public bool? HasVentilator { get; set; }
    public bool? HasTracheostomy { get; set; }
    public bool? HasPEG { get; set; }
    public bool? HasUrinaryCatheter { get; set; }
    public bool? HasBedsore { get; set; }
    public List<string>? NeededHomeMedicalEquipment { get; set; }
    public List<string>? AvailableHomeMedicalEquipment { get; set; }
    public string? OtherNeededHomeMedicalEquipment { get; set; }
    public string? OtherAvailableHomeMedicalEquipment { get; set; }

    // Step 7: Elderly Assessment
    public ElderlyAssessmentDto? ElderlyAssessment { get; set; }
    
    // Step 8: Documents
    public List<UploadedDocumentDto>? Documents { get; set; }
}
