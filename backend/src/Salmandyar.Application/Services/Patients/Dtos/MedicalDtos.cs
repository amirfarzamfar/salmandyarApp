using Salmandyar.Domain.Entities;

namespace Salmandyar.Application.Services.Patients.Dtos;

public record VitalSignDto(
    int Id,
    DateTime RecordedAt,
    DateTime MeasuredAt,
    bool IsLateEntry,
    string? DelayReason,
    string? Note,
    string RecorderName,
    int SystolicBloodPressure,
    int DiastolicBloodPressure,
    double MeanArterialPressure,
    int PulseRate,
    int RespiratoryRate,
    double BodyTemperature,
    int OxygenSaturation,
    int? GlasgowComaScale
);

public record CreateVitalSignDto(
    int CareRecipientId,
    DateTime MeasuredAt,
    string? DelayReason,
    string? Note,
    int SystolicBloodPressure,
    int DiastolicBloodPressure,
    int PulseRate,
    int RespiratoryRate,
    double BodyTemperature,
    int OxygenSaturation,
    int? GlasgowComaScale
);

public record CareServiceDto(
    int Id,
    DateTime PerformedAt,
    string PerformerName,
    string? PerformerId, // Added for editing
    int ServiceDefinitionId, // Added for editing
    string ServiceTitle, // Replaces ServiceType
    ServiceCategory Category,
    CareServiceStatus Status,
    DateTime? StartTime,
    DateTime? EndTime,
    string Description,
    string Notes
);

public record CreateCareServiceDto(
    int CareRecipientId,
    int ServiceDefinitionId,
    DateTime PerformedAt, // ServiceDate
    DateTime? StartTime,
    DateTime? EndTime,
    string Description,
    string Notes,
    string? PerformerId = null // Optional override for performer
);

public record UpdateCareServiceDto(
    int ServiceDefinitionId,
    DateTime PerformedAt,
    DateTime? StartTime,
    DateTime? EndTime,
    string Description,
    string Notes,
    CareServiceStatus Status,
    string? PerformerId = null
);

public record NursingReportDto(
    int Id,
    DateTime CreatedAt,
    string AuthorName,
    string Shift,
    string Content
);

public record CreateNursingReportDto(
    int CareRecipientId,
    string Shift,
    string Content
);
