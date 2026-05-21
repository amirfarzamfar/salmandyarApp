using System;

namespace Salmandyar.Domain.Entities.PatientProfile;

public class UploadedDocument
{
    public int Id { get; set; }
    public int PatientProfileId { get; set; }
    public virtual PatientProfile PatientProfile { get; set; } = null!;

    public string? DocumentType { get; set; } // NationalId, Insurance, LabTest, CT_MRI, Prescription
    public string? FileUrl { get; set; }
    public DateTime UploadDate { get; set; } = DateTime.UtcNow;
}
