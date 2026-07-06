using System.Collections.Generic;

namespace Salmandyar.Domain.Entities;

public class CaregiverProfile
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public virtual User User { get; set; } = null!;

    // Step 1: Identity
    public string? RegisteredRole { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? FatherName { get; set; }
    public string? NationalCode { get; set; }
    public string? BirthCertificateNumber { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? BirthPlace { get; set; }
    public string? Gender { get; set; }
    public string? MaritalStatus { get; set; }
    public int? ChildrenCount { get; set; }
    public string? Nationality { get; set; }
    public string? PersonalPhotoUrl { get; set; }

    // Step 2: Contact
    public string? MobileNumber { get; set; }
    public string? LandlinePhone { get; set; }
    public string? Email { get; set; }
    public string? FullAddress { get; set; }
    public string? Province { get; set; }
    public string? City { get; set; }
    public string? PostalCode { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    // Step 3: Employment
    public string? CooperationType { get; set; }
    public string? NursingSystemNumber { get; set; }
    public int? ExperienceYears { get; set; }
    public string? LastWorkplace { get; set; }
    public string? CurrentEmploymentStatus { get; set; }
    public string? ShiftPreferencesJson { get; set; }
    public bool CanStayAtPatientHome { get; set; }
    public string? VehicleType { get; set; }
    public bool HasDrivingLicense { get; set; }
    public int? ServiceRadiusKm { get; set; }
    public string? ServiceAreasJson { get; set; }

    // Step 4-6
    public string? SkillsJson { get; set; }
    public string? CustomSkillsJson { get; set; }
    public string? LatestDegree { get; set; }
    public string? Major { get; set; }
    public string? University { get; set; }
    public int? GraduationYear { get; set; }
    public decimal? GPA { get; set; }
    public string? CertificatesJson { get; set; }

    // Step 8-10
    public string? BankName { get; set; }
    public string? AccountNumber { get; set; }
    public string? CardNumber { get; set; }
    public string? Iban { get; set; }
    public string? EmergencyContactName { get; set; }
    public string? EmergencyContactRelationship { get; set; }
    public string? EmergencyContactMobile { get; set; }
    public string? EmergencyContactPhone { get; set; }
    public string? EmergencyContactAddress { get; set; }
    public bool AcceptCollaborationTerms { get; set; }
    public bool AcceptPatientConfidentiality { get; set; }
    public bool AcceptProfessionalEthics { get; set; }
    public bool AcceptDocumentReviewConsent { get; set; }

    // Workflow
    public int CompletionPercentage { get; set; }
    public int CurrentStep { get; set; }
    public bool IsCompleted { get; set; }
    public CaregiverEmploymentApprovalStatus EmploymentStatus { get; set; } = CaregiverEmploymentApprovalStatus.Draft;
    public string? ReviewNote { get; set; }
    public bool ForceCompletedByAdmin { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? SubmittedAt { get; set; }
    public DateTime? LastUpdatedAt { get; set; }
    public string? LastUpdatedByUserId { get; set; }
    public string? LastUpdatedByName { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? ReviewedByUserId { get; set; }
    public string? ReviewedByName { get; set; }

    public virtual ICollection<CaregiverProfileDocument> Documents { get; set; } = new List<CaregiverProfileDocument>();
}
