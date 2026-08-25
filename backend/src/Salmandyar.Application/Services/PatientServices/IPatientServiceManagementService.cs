using Salmandyar.Application.DTOs.Common;
using Salmandyar.Application.DTOs.PatientServices;

namespace Salmandyar.Application.Services.PatientServices;

public interface IPatientServiceManagementService
{
    Task<PagedResponse<PatientServiceListItemDto>> GetPagedServicesAsync(PatientServiceQueryFilters filters);
    Task<PatientServiceDetailDto?> GetServiceByIdAsync(int id);
    Task<PatientServiceDto> CreateServiceAsync(CreatePatientServiceDto dto, string currentUserId);
    Task<PatientServiceDto?> UpdateServiceAsync(int id, UpdatePatientServiceDto dto, string currentUserId);
    Task<bool> CancelServiceAsync(int id, string reason, string currentUserId);
    Task<bool> DeleteServiceAsync(int id, string currentUserId);

    Task<PatientServiceDto?> AssignProviderAsync(int serviceId, AssignServiceProviderDto dto, string currentUserId);
    Task<PatientServiceDto?> ChangeProviderAsync(int serviceId, AssignServiceProviderDto dto, string currentUserId);

    Task<PatientServiceDto?> ChangeStatusAsync(int serviceId, ChangeServiceStatusDto dto, string currentUserId);
    Task<PatientServiceDto?> StartServiceAsync(int serviceId, string currentUserId);
    Task<PatientServiceDto?> CompleteServiceAsync(int serviceId, string notes, string currentUserId);

    Task<PatientServiceStatisticsDto> GetStatisticsAsync(PatientServiceQueryFilters? filters = null);
    Task<List<ServiceActivityLogDto>> GetServiceTimelineAsync(int serviceId);

    Task<ServiceNotificationRecordDto> CreateNotificationAsync(CreateServiceNotificationDto dto, string currentUserId);
    Task<List<ServiceNotificationRecordDto>> GetServiceNotificationsAsync(int serviceId);

    Task<ServiceScheduleDto> CreateScheduleAsync(CreateServiceScheduleDto dto, string currentUserId);
    Task<List<ServiceScheduleDto>> GetActiveSchedulesAsync(int? careRecipientId = null);
    Task<bool> ToggleScheduleActiveAsync(int scheduleId, bool isActive, string currentUserId);
    Task<List<PatientServiceDto>> GenerateServicesFromScheduleAsync(int scheduleId, string currentUserId);

    Task<List<ProviderAvailabilityDto>> GetAvailableProvidersAsync(int serviceDefinitionId, DateTime scheduledDate, TimeSpan? startTime, int? durationMinutes, int? currentServiceId = null);

    Task<BulkServiceActionResult> BulkAssignAsync(BulkServiceActionDto dto, string currentUserId);
    Task<BulkServiceActionResult> BulkChangeStatusAsync(BulkServiceActionDto dto, string currentUserId);
    Task<BulkServiceActionResult> BulkCancelAsync(BulkServiceActionDto dto, string currentUserId);
    Task<BulkServiceActionResult> BulkSendNotificationAsync(BulkServiceActionDto dto, string currentUserId);
    Task<BulkServiceActionResult> BulkRescheduleAsync(BulkServiceActionDto dto, string currentUserId);

    Task<List<CalendarEventDto>> GetCalendarEventsAsync(DateTime fromDate, DateTime toDate, PatientServiceQueryFilters? filters = null);
}
