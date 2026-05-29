using System;
using System.Collections.Generic;

namespace Salmandyar.Domain.Entities.PatientProfile;

public class PatientProfile
{
    public int Id { get; set; }
    
    // Linked to the main User account of the patient
    public string UserId { get; set; } = string.Empty;
    public virtual User User { get; set; } = null!;

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
    
    // Step 3: Physical & Basic Info
    public double? Height { get; set; }
    public double? Weight { get; set; }
    public string? BloodGroup { get; set; }
    public string? MobilityStatus { get; set; }
    public bool UsesWheelchair { get; set; }
    public bool UsesWalker { get; set; }
    public string? WalkingAbility { get; set; }

    // Step 6: Treatment Info
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

    // Dynamic Form Answers (JSON) for Conditional Questions
    public string? DynamicAnswersJson { get; set; }

    // Wizard Status
    public int CompletionPercentage { get; set; }
    public int CurrentStep { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastUpdatedAt { get; set; }
    public string? LastUpdatedByUserId { get; set; }
    public string? LastUpdatedByName { get; set; }

    // Navigation Properties
    public virtual Address? Address { get; set; }
    public virtual EmergencyContact? EmergencyContact { get; set; }
    public virtual MedicalHistory? MedicalHistory { get; set; }
    public virtual ElderlyAssessment? ElderlyAssessment { get; set; }
    
    public virtual ICollection<Allergy> Allergies { get; set; } = new List<Allergy>();
    public virtual ICollection<UploadedDocument> Documents { get; set; } = new List<UploadedDocument>();
}
