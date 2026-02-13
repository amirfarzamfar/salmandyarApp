using Salmandyar.Application.Services.Patients.Dtos;

namespace Salmandyar.Application.Services.Patients;

public interface IPatientService
{
    Task<List<PatientListDto>> GetAllPatientsAsync();
    Task<PatientDto?> GetPatientByIdAsync(int id);
    
    // Vitals
    Task<List<VitalSignDto>> GetVitalSignsAsync(int patientId);
    Task AddVitalSignAsync(string recorderId, CreateVitalSignDto dto);

    // Services
    Task<List<CareServiceDto>> GetCareServicesAsync(int patientId);
    Task AddCareServiceAsync(string performerId, CreateCareServiceDto dto);
    Task UpdateCareServiceAsync(int serviceId, UpdateCareServiceDto dto);
    Task DeleteCareServiceAsync(int serviceId);

    // Reports
    Task<List<NursingReportDto>> GetNursingReportsAsync(int patientId);
    Task AddNursingReportAsync(string authorId, CreateNursingReportDto dto);
}
