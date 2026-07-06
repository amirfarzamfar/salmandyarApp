using Salmandyar.Application.DTOs.Users;
using Salmandyar.Domain.Entities;

namespace Salmandyar.Application.DTOs.CaregiverProfiles;

public class CaregiverProfileDto
{
    public int? Id { get; set; }
    public string UserId { get; set; } = string.Empty;
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
    public string? MobileNumber { get; set; }
    public string? LandlinePhone { get; set; }
    public string? Email { get; set; }
    public string? FullAddress { get; set; }
    public string? Province { get; set; }
    public string? City { get; set; }
    public string? PostalCode { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? CooperationType { get; set; }
    public string? NursingSystemNumber { get; set; }
    public int? ExperienceYears { get; set; }
    public string? LastWorkplace { get; set; }
    public string? CurrentEmploymentStatus { get; set; }
    public List<string> ShiftPreferences { get; set; } = new();
    public bool CanStayAtPatientHome { get; set; }
    public string? VehicleType { get; set; }
    public bool HasDrivingLicense { get; set; }
    public int? ServiceRadiusKm { get; set; }
    public List<CoverageAreaDto> ServiceAreas { get; set; } = new();
    public List<string> Skills { get; set; } = new();
    public List<string> CustomSkills { get; set; } = new();
    public string? LatestDegree { get; set; }
    public string? Major { get; set; }
    public string? University { get; set; }
    public int? GraduationYear { get; set; }
    public decimal? GPA { get; set; }
    public List<CourseCertificateDto> Certificates { get; set; } = new();
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
    public int CompletionPercentage { get; set; }
    public int CurrentStep { get; set; }
    public bool IsCompleted { get; set; }
    public CaregiverEmploymentApprovalStatus EmploymentStatus { get; set; }
    public string EmploymentStatusLabel { get; set; } = string.Empty;
    public string? ReviewNote { get; set; }
    public bool ForceCompletedByAdmin { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public DateTime? LastUpdatedAt { get; set; }
    public string? LastUpdatedByName { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? ReviewedByName { get; set; }
    public List<CaregiverProfileDocumentDto> Documents { get; set; } = new();
    public List<AuditLogDto> AuditLogs { get; set; } = new();
}

public class UpdateCaregiverProfileDto
{
    public int? CurrentStep { get; set; }
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
    public string? LandlinePhone { get; set; }
    public string? Email { get; set; }
    public string? FullAddress { get; set; }
    public string? Province { get; set; }
    public string? City { get; set; }
    public string? PostalCode { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? CooperationType { get; set; }
    public string? NursingSystemNumber { get; set; }
    public int? ExperienceYears { get; set; }
    public string? LastWorkplace { get; set; }
    public string? CurrentEmploymentStatus { get; set; }
    public List<string>? ShiftPreferences { get; set; }
    public bool? CanStayAtPatientHome { get; set; }
    public string? VehicleType { get; set; }
    public bool? HasDrivingLicense { get; set; }
    public int? ServiceRadiusKm { get; set; }
    public List<CoverageAreaDto>? ServiceAreas { get; set; }
    public List<string>? Skills { get; set; }
    public List<string>? CustomSkills { get; set; }
    public string? LatestDegree { get; set; }
    public string? Major { get; set; }
    public string? University { get; set; }
    public int? GraduationYear { get; set; }
    public decimal? GPA { get; set; }
    public List<CourseCertificateDto>? Certificates { get; set; }
    public string? BankName { get; set; }
    public string? AccountNumber { get; set; }
    public string? CardNumber { get; set; }
    public string? Iban { get; set; }
    public string? EmergencyContactName { get; set; }
    public string? EmergencyContactRelationship { get; set; }
    public string? EmergencyContactMobile { get; set; }
    public string? EmergencyContactPhone { get; set; }
    public string? EmergencyContactAddress { get; set; }
    public bool? AcceptCollaborationTerms { get; set; }
    public bool? AcceptPatientConfidentiality { get; set; }
    public bool? AcceptProfessionalEthics { get; set; }
    public bool? AcceptDocumentReviewConsent { get; set; }
}

public class CaregiverProfileStatusDto
{
    public bool HasProfile { get; set; }
    public bool IsCompleted { get; set; }
    public int CompletionPercentage { get; set; }
    public int CurrentStep { get; set; }
    public CaregiverEmploymentApprovalStatus EmploymentStatus { get; set; }
    public string EmploymentStatusLabel { get; set; } = string.Empty;
    public int PendingDocuments { get; set; }
    public int ApprovedDocuments { get; set; }
    public int NeedsCorrectionDocuments { get; set; }
    public int RejectedDocuments { get; set; }
    public int UploadedDocuments { get; set; }
    public string? ReviewNote { get; set; }
}

public class CaregiverDashboardDto
{
    public int ProfileCompletionPercentage { get; set; }
    public string DocumentVerificationStatus { get; set; } = string.Empty;
    public string EmploymentStatus { get; set; } = string.Empty;
    public int PerformanceScore { get; set; }
    public int ShiftCount { get; set; }
    public DateTime? LastActivityAt { get; set; }
}

public class CaregiverProfileDocumentDto
{
    public int Id { get; set; }
    public string DocumentType { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string? MimeType { get; set; }
    public DateTime UploadedAt { get; set; }
    public CaregiverProfileDocumentStatus Status { get; set; }
    public string StatusLabel { get; set; } = string.Empty;
    public string? ReviewNote { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? ReviewedByName { get; set; }
    public DateTime? ExpireAt { get; set; }
}

public class UpdateCaregiverDocumentStatusDto
{
    public CaregiverProfileDocumentStatus Status { get; set; }
    public string? ReviewNote { get; set; }
    public DateTime? ExpireAt { get; set; }
}

public class CoverageAreaDto
{
    public string Province { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
}

public class CourseCertificateDto
{
    public string Title { get; set; } = string.Empty;
    public string Organizer { get; set; } = string.Empty;
    public DateTime? Date { get; set; }
    public string? FileUrl { get; set; }
}
