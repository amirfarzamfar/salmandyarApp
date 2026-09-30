using System.ComponentModel.DataAnnotations;
using Salmandyar.Domain.Entities;

namespace Salmandyar.Application.Services;

public record LabActor(string UserId, IReadOnlyCollection<string> Roles);
public class LabCategoryInput
{
    [Required, StringLength(150)] public string Name { get; set; } = "";
    [StringLength(2000)] public string? Description { get; set; }
    [Range(0, 100000)] public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
}
public class LabDefinitionInput : LabCategoryInput
{
    [Range(1, int.MaxValue)] public int CategoryId { get; set; }
    [StringLength(150)] public string? EnglishName { get; set; }
    [Required, RegularExpression("^[A-Za-z0-9_.-]{1,50}$")] public string Code { get; set; } = "";
    [StringLength(50)] public string? Unit { get; set; }
    [EnumDataType(typeof(LabDataType))] public LabDataType DataType { get; set; }
    public decimal? ReferenceMin { get; set; }
    public decimal? ReferenceMax { get; set; }
    public decimal? CriticalMin { get; set; }
    public decimal? CriticalMax { get; set; }
}
public class LabResultInput
{
    public int LabTestDefinitionId { get; set; }
    public decimal? NumericValue { get; set; }
    [StringLength(2000)] public string? TextValue { get; set; }
    public bool? BooleanValue { get; set; }
    [StringLength(1000)] public string? Notes { get; set; }
}
public class LabReportInput
{
    [Range(1, int.MaxValue)] public int CategoryId { get; set; }
    public DateTime PerformedAt { get; set; }
    [Required, StringLength(200)] public string ReportTitle { get; set; } = "";
    [StringLength(200)] public string LaboratoryName { get; set; } = "";
    [StringLength(4000)] public string? Notes { get; set; }
    public Guid? Version { get; set; }
    [MaxLength(150)] public List<LabResultInput> Results { get; set; } = new();
}
public record LabCategoryDto(int Id, string Name, string? Description, bool IsActive, int SortOrder, int DefinitionCount);
public record LabResultDto(Guid Id, int LabTestDefinitionId, string Name, LabDataType DataType,
    decimal? NumericValue, string? TextValue, bool? BooleanValue, string? Unit, decimal? ReferenceMin,
    decimal? ReferenceMax, bool IsAbnormal, string? Notes);
public record LabReportDto(Guid Id, int PatientId, int CategoryId, string CategoryName, DateTime PerformedAt,
    string ReportTitle, string LaboratoryName, string? Notes, string? FileUrl, string? FileType,
    Guid Version, bool CanEdit, List<LabResultDto> Results);
public record LabPage<T>(List<T> Items, int Total, int Page, int PageSize);
public record LabTrendPoint(Guid ReportId, DateTime PerformedAt, decimal Value, string? Unit,
    decimal? ReferenceMin, decimal? ReferenceMax);
public record LabFile(string Key, string ContentType);
public class LabException(int status, string message) : Exception(message)
{
    public int Status { get; } = status;
}

public interface ILabService
{
    Task<int> GetMyPatientIdAsync(LabActor actor, CancellationToken ct);
    Task<List<LabCategoryDto>> GetCategoriesAsync(LabActor actor, bool all, CancellationToken ct);
    Task<List<LabTestDefinition>> GetDefinitionsAsync(LabActor actor, int? categoryId, string? search, bool? active, bool all, CancellationToken ct);
    Task<int> SaveCategoryAsync(LabActor actor, int? id, LabCategoryInput input, CancellationToken ct);
    Task<int> SaveDefinitionAsync(LabActor actor, int? id, LabDefinitionInput input, CancellationToken ct);
    Task DeleteCatalogAsync(LabActor actor, int id, bool category, CancellationToken ct);
    Task<LabPage<LabReportDto>> GetReportsAsync(LabActor actor, int patientId, int? categoryId, DateTime? from, DateTime? to, int page, CancellationToken ct);
    Task<LabReportDto> GetReportAsync(LabActor actor, int patientId, Guid id, CancellationToken ct);
    Task<LabReportDto> SaveReportAsync(LabActor actor, int patientId, Guid? id, LabReportInput input, CancellationToken ct);
    Task DeleteReportAsync(LabActor actor, int patientId, Guid id, Guid version, CancellationToken ct);
    Task<List<LabTrendPoint>> GetTrendAsync(LabActor actor, int patientId, int definitionId, CancellationToken ct);
    Task EnsureFileWriteAsync(LabActor actor, int patientId, Guid id, Guid version, CancellationToken ct);
    Task<LabFile?> SetFileAsync(LabActor actor, int patientId, Guid id, Guid version, LabFile? file, CancellationToken ct);
    Task<LabFile> GetFileAsync(LabActor actor, int patientId, Guid id, CancellationToken ct);
}
