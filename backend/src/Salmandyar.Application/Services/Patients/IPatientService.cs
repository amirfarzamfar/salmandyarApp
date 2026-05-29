using Salmandyar.Application.Services.Patients.Dtos;

namespace Salmandyar.Application.Services.Patients;

public interface IPatientService
{
    Task<List<PatientListDto>> GetAllPatientsAsync(string? caregiverId = null);
    Task<PatientDto?> GetPatientByIdAsync(int id, string? caregiverId = null);
    Task<PatientDto> CreatePatientAsync(CreatePatientDto dto);
    Task CreatePatientForUserAsync(string userId, string firstName, string lastName);
    
    // Vitals
    Task<List<VitalSignDto>> GetVitalSignsAsync(int patientId);
    Task<AddVitalSignResultDto> AddVitalSignAsync(string recorderId, CreateVitalSignDto dto);
    Task<VitalSignAcknowledgementResultDto> AcknowledgeVitalSignAsync(int patientId, int vitalSignId, string userId, AcknowledgeVitalSignDto dto);

    // Services
    Task<List<CareServiceDto>> GetCareServicesAsync(int patientId);
    Task AddCareServiceAsync(string performerId, CreateCareServiceDto dto);
    Task<int> UpdateCareServiceAsync(int serviceId, UpdateCareServiceDto dto);
    Task<int> DeleteCareServiceAsync(int serviceId);

    // Reports
    Task<List<NursingReportDto>> GetNursingReportsAsync(int patientId);
    Task AddNursingReportAsync(string authorId, CreateNursingReportDto dto);
}
