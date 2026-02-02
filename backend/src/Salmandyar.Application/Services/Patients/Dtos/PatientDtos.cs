namespace Salmandyar.Application.Services.Patients.Dtos;

public record PatientDto(
    int Id,
    string FirstName,
    string LastName,
    DateTime DateOfBirth,
    string PrimaryDiagnosis,
    string CurrentStatus,
    int CareLevel,
    string? ResponsibleNurseId,
    string? ResponsibleNurseName,
    string MedicalHistory,
    string Needs,
    string Address
);

public record PatientListDto(
    int Id,
    string FirstName,
    string LastName,
    int Age,
    string PrimaryDiagnosis,
    string CurrentStatus,
    int CareLevel,
    string? ResponsibleNurseName
);
