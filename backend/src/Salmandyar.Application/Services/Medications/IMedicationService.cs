using Salmandyar.Application.DTOs.Medications;

namespace Salmandyar.Application.Services.Medications;

public interface IMedicationService
{
    Task<MedicationDto> AddMedicationAsync(CreateMedicationDto dto);
    Task<List<MedicationDto>> GetPatientMedicationsAsync(int patientId);
    Task<List<MedicationDoseDto>> GetDailyScheduleAsync(int patientId, DateTime date);
    Task RecordDoseAsync(int doseId, RecordDoseDto dto, string userId);
    Task GenerateDosesAsync(int medicationId, DateTime from, DateTime to);
    Task CheckMissedDosesAndEscalateAsync();
    Task SendRemindersAsync();
}
