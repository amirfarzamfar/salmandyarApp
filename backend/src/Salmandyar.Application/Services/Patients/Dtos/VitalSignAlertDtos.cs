namespace Salmandyar.Application.Services.Patients.Dtos;

public enum VitalAlertSeverity
{
    Warning = 1,
    Critical = 2
}

public record VitalSignAlertDto(
    string Code,
    VitalAlertSeverity Severity,
    string Title,
    string Message
);

public record AddVitalSignResultDto(
    int VitalSignId,
    int CareRecipientId,
    DateTime MeasuredAt,
    string PatientName,
    List<string> RecipientUserIds,
    List<VitalSignAlertDto> Alerts
);

public record VitalSignAcknowledgementResultDto(
    int VitalSignId,
    DateTime PatientAcknowledgedAt,
    string? PatientAcknowledgedByName,
    string PatientAcknowledgementNote
);
