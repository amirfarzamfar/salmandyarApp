using Salmandyar.Application.DTOs.Medications;
using Salmandyar.Domain.Enums;

namespace Salmandyar.Application.Services.Medications;

public interface IMedicationService
{
    Task<MedicationDto> AddMedicationAsync(CreateMedicationDto dto);
    Task<MedicationDto?> GetMedicationByIdAsync(int id);
    Task<MedicationDto> UpdateMedicationAsync(int id, UpdateMedicationDto dto);
    Task DeleteMedicationAsync(int id);
    Task<List<MedicationDto>> GetPatientMedicationsAsync(int patientId);
    Task<List<MedicationDoseDto>> GetDailyScheduleAsync(int patientId, DateTime date);
    Task<List<MedicationDoseDto>> GetPatientMedicationHistoryAsync(int patientId, DateTime? from, DateTime? to, MedicationAdministrationOutcome? administrationOutcome, MedicationTimingStatus? timingStatus, bool onlyIssues, string? search);
    Task<MedicationDoseDto?> GetDoseForPatientAsync(int patientId, int doseId);
    Task<List<MedicationDoseDto>> GetShiftMedicationAdministrationAsync(string caregiverId, ShiftSlot? shiftSlot, DateTime date, bool pendingOnly);
    Task<List<MedicationDoseStatusHistoryDto>> GetDoseHistoryAsync(int doseId);
    Task<MedicationAdministrationOverviewReportDto> GetAdministrationOverviewReportAsync(DateTime from, DateTime to, int? patientId, int? medicationId, ShiftSlot? shiftSlot, string? recordedByUserId, string? search);
    Task<List<MedicationAdministrationTrendPointDto>> GetAdministrationTrendReportAsync(DateTime from, DateTime to, int? patientId, int? medicationId, ShiftSlot? shiftSlot, string? recordedByUserId, string? search);
    Task<List<MedicationAdministrationPatientMedicationAdherenceDto>> GetAdministrationAdherenceBreakdownAsync(DateTime from, DateTime to, int? patientId, int? medicationId, ShiftSlot? shiftSlot, string? recordedByUserId, string? search);
    Task<List<MedicationAdministrationStaffPerformanceDto>> GetAdministrationStaffPerformanceReportAsync(DateTime from, DateTime to, int? patientId, int? medicationId, ShiftSlot? shiftSlot, string? recordedByUserId, string? search);
    Task<int?> GetDoseCareRecipientIdAsync(int doseId);
    Task RecordDoseAsync(int doseId, RecordDoseDto dto, string userId, bool preventBeforeScheduledTime);
    Task<MedicationDoseDto> ConfirmDoseByPatientAsync(int doseId, PatientConfirmMedicationDoseDto dto, string userId);
    Task<MedicationDoseDto> SkipDoseByPatientAsync(int doseId, PatientSkipMedicationDoseDto dto, string userId);
    Task<MedicationDoseDto> RecordDoseByNurseAsync(int doseId, NurseRecordMedicationDoseDto dto, string userId, bool isAdminLike);
    Task<MedicationDoseDto> ReviewDoseAsync(int doseId, ReviewMedicationDoseDto dto, string userId, bool isAdminLike);
    Task<MedicationDoseDto> CorrectDoseAsync(int doseId, CorrectMedicationDoseDto dto, string userId);
    Task ResetDoseAsync(int doseId, string userId);
    Task<List<MedicationInventoryTransactionDto>> GetInventoryTransactionsAsync(int medicationId);
    Task<List<MedicationAlertHistoryDto>> GetAlertHistoriesAsync(int medicationId);
    Task<MedicationDto> UpdateInventoryAsync(int medicationId, UpdateMedicationInventoryDto dto, string userId);
    Task GenerateDosesAsync(int medicationId, DateTime from, DateTime to);
    Task CheckMissedDosesAndEscalateAsync();
    Task SendRemindersAsync();
}
