using System.ComponentModel.DataAnnotations;

namespace Salmandyar.Domain.Entities;

public enum LabDataType { Number, Text, Boolean }

public class LabTestCategory
{
    public int Id { get; set; }
    [MaxLength(150)] public string Name { get; set; } = "";
    [MaxLength(2000)] public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; }
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

public class LabTestDefinition
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public LabTestCategory Category { get; set; } = null!;
    [MaxLength(150)] public string Name { get; set; } = "";
    [MaxLength(150)] public string? EnglishName { get; set; }
    [MaxLength(50)] public string Code { get; set; } = "";
    [MaxLength(50)] public string? Unit { get; set; }
    public LabDataType DataType { get; set; }
    public decimal? ReferenceMin { get; set; }
    public decimal? ReferenceMax { get; set; }
    public decimal? CriticalMin { get; set; }
    public decimal? CriticalMax { get; set; }
    [MaxLength(2000)] public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; }
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

public class PatientLabReport
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public int PatientId { get; set; }
    public CareRecipient Patient { get; set; } = null!;
    public int CategoryId { get; set; }
    public LabTestCategory Category { get; set; } = null!;
    public DateTime PerformedAt { get; set; }
    [MaxLength(200)] public string LaboratoryName { get; set; } = "";
    [MaxLength(200)] public string ReportTitle { get; set; } = "";
    [MaxLength(4000)] public string? Notes { get; set; }
    // Opaque storage key, never a public URL. API maps this to an authorized endpoint.
    [MaxLength(100)] public string? FileUrl { get; set; }
    [MaxLength(50)] public string? FileType { get; set; }
    [MaxLength(450)] public string CreatedByUserId { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsDeleted { get; set; }
    [ConcurrencyCheck] public Guid Version { get; set; } = Guid.NewGuid();
    public List<PatientLabResult> Results { get; set; } = new();
}

public class PatientLabResult
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PatientLabReportId { get; set; }
    public PatientLabReport Report { get; set; } = null!;
    public int LabTestDefinitionId { get; set; }
    public LabTestDefinition Definition { get; set; } = null!;
    // Name and type are also snapshots so historical results stay interpretable.
    [MaxLength(150)] public string Name { get; set; } = "";
    public LabDataType DataType { get; set; }
    public decimal? NumericValue { get; set; }
    [MaxLength(2000)] public string? TextValue { get; set; }
    public bool? BooleanValue { get; set; }
    [MaxLength(50)] public string? Unit { get; set; }
    public decimal? ReferenceMin { get; set; }
    public decimal? ReferenceMax { get; set; }
    public decimal? CriticalMin { get; set; }
    public decimal? CriticalMax { get; set; }
    public bool IsAbnormal { get; set; }
    [MaxLength(1000)] public string? Notes { get; set; }
}
