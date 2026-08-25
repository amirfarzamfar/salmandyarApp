import api from '@/lib/axios';
import {
  PatientServiceDto,
  PatientServiceDetailDto,
  PatientServiceListItemDto,
  PatientServiceStatisticsDto,
  PatientServiceQueryFilters,
  CreatePatientServiceDto,
  UpdatePatientServiceDto,
  AssignServiceProviderDto,
  ChangeServiceStatusDto,
  ServiceActivityLogDto,
  ServiceNotificationRecordDto,
  ServiceScheduleDto,
  CreateServiceScheduleDto,
  CreateServiceNotificationDto,
  ProviderAvailabilityDto,
  BulkServiceActionDto,
  BulkServiceActionResult,
  CalendarEventDto,
  PagedResponse
} from '@/types/patient-service';

export const patientServicesService = {
  getPaged: async (filters: PatientServiceQueryFilters = {}): Promise<PagedResponse<PatientServiceListItemDto>> => {
    const params = new URLSearchParams();
    if (filters.pageNumber) params.append('pageNumber', filters.pageNumber.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters.searchQuery) params.append('searchQuery', filters.searchQuery);
    if (filters.careRecipientId) params.append('careRecipientId', filters.careRecipientId.toString());
    if (filters.serviceDefinitionId) params.append('serviceDefinitionId', filters.serviceDefinitionId.toString());
    if (filters.status != null) params.append('status', filters.status.toString());
    if (filters.priority != null) params.append('priority', filters.priority.toString());
    if (filters.performerId) params.append('performerId', filters.performerId);
    if (filters.assignmentStatus != null) params.append('assignmentStatus', filters.assignmentStatus.toString());
    if (filters.onlyUnassigned != null) params.append('onlyUnassigned', filters.onlyUnassigned.toString());
    if (filters.notificationStatus != null) params.append('notificationStatus', filters.notificationStatus.toString());
    if (filters.onlyWithNotification != null) params.append('onlyWithNotification', filters.onlyWithNotification.toString());
    if (filters.fromDate) params.append('fromDate', filters.fromDate);
    if (filters.toDate) params.append('toDate', filters.toDate);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortDescending != null) params.append('sortDescending', filters.sortDescending.toString());

    const response = await api.get<PagedResponse<PatientServiceListItemDto>>(`/patient-services?${params.toString()}`);
    return response.data;
  },

  getById: async (id: number): Promise<PatientServiceDetailDto> => {
    const response = await api.get<PatientServiceDetailDto>(`/patient-services/${id}`);
    return response.data;
  },

  create: async (dto: CreatePatientServiceDto): Promise<PatientServiceDto> => {
    const response = await api.post<PatientServiceDto>('/patient-services', dto);
    return response.data;
  },

  update: async (id: number, dto: UpdatePatientServiceDto): Promise<PatientServiceDto> => {
    const response = await api.put<PatientServiceDto>(`/patient-services/${id}`, dto);
    return response.data;
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/patient-services/${id}`);
  },

  cancel: async (id: number, reason?: string): Promise<void> => {
    await api.post(`/patient-services/${id}/cancel`, { reason: reason || 'لغو توسط ادمین' });
  },

  assignProvider: async (id: number, dto: AssignServiceProviderDto): Promise<PatientServiceDto> => {
    const response = await api.post<PatientServiceDto>(`/patient-services/${id}/assign`, dto);
    return response.data;
  },

  changeProvider: async (id: number, dto: AssignServiceProviderDto): Promise<PatientServiceDto> => {
    const response = await api.post<PatientServiceDto>(`/patient-services/${id}/change-provider`, dto);
    return response.data;
  },

  changeStatus: async (id: number, dto: ChangeServiceStatusDto): Promise<PatientServiceDto> => {
    const response = await api.post<PatientServiceDto>(`/patient-services/${id}/change-status`, dto);
    return response.data;
  },

  start: async (id: number): Promise<PatientServiceDto> => {
    const response = await api.post<PatientServiceDto>(`/patient-services/${id}/start`);
    return response.data;
  },

  complete: async (id: number, notes?: string): Promise<PatientServiceDto> => {
    const response = await api.post<PatientServiceDto>(`/patient-services/${id}/complete`, { notes: notes || '' });
    return response.data;
  },

  getStatistics: async (filters: PatientServiceQueryFilters = {}): Promise<PatientServiceStatisticsDto> => {
    const params = new URLSearchParams();
    if (filters.careRecipientId) params.append('careRecipientId', filters.careRecipientId.toString());
    if (filters.serviceDefinitionId) params.append('serviceDefinitionId', filters.serviceDefinitionId.toString());
    if (filters.status != null) params.append('status', filters.status.toString());
    if (filters.performerId) params.append('performerId', filters.performerId);
    if (filters.fromDate) params.append('fromDate', filters.fromDate);
    if (filters.toDate) params.append('toDate', filters.toDate);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get<PatientServiceStatisticsDto>(`/patient-services/statistics${qs}`);
    return response.data;
  },

  getTimeline: async (id: number): Promise<ServiceActivityLogDto[]> => {
    const response = await api.get<ServiceActivityLogDto[]>(`/patient-services/${id}/timeline`);
    return response.data;
  },

  createNotification: async (dto: CreateServiceNotificationDto): Promise<ServiceNotificationRecordDto> => {
    const response = await api.post<ServiceNotificationRecordDto>(`/patient-services/${dto.careServiceId}/notifications`, dto);
    return response.data;
  },

  getNotifications: async (id: number): Promise<ServiceNotificationRecordDto[]> => {
    const response = await api.get<ServiceNotificationRecordDto[]>(`/patient-services/${id}/notifications`);
    return response.data;
  },

  getAvailableProviders: async (
    serviceDefinitionId: number,
    scheduledDate: string,
    startTimeTicks?: number,
    durationMinutes?: number,
    currentServiceId?: number
  ): Promise<ProviderAvailabilityDto[]> => {
    const params = new URLSearchParams({
      serviceDefinitionId: serviceDefinitionId.toString(),
      scheduledDate
    });
    if (startTimeTicks != null) params.append('startTimeTicks', startTimeTicks.toString());
    if (durationMinutes != null) params.append('durationMinutes', durationMinutes.toString());
    if (currentServiceId != null) params.append('currentServiceId', currentServiceId.toString());

    const response = await api.get<ProviderAvailabilityDto[]>(`/patient-services/available-providers?${params.toString()}`);
    return response.data;
  },

  createSchedule: async (dto: CreateServiceScheduleDto): Promise<ServiceScheduleDto> => {
    const response = await api.post<ServiceScheduleDto>('/patient-services/schedules', dto);
    return response.data;
  },

  getSchedules: async (careRecipientId?: number): Promise<ServiceScheduleDto[]> => {
    const qs = careRecipientId != null ? `?careRecipientId=${careRecipientId}` : '';
    const response = await api.get<ServiceScheduleDto[]>(`/patient-services/schedules${qs}`);
    return response.data;
  },

  toggleSchedule: async (scheduleId: number, isActive: boolean): Promise<void> => {
    await api.post(`/patient-services/schedules/${scheduleId}/toggle`, { isActive });
  },

  generateFromSchedule: async (scheduleId: number): Promise<PatientServiceDto[]> => {
    const response = await api.post<PatientServiceDto[]>(`/patient-services/schedules/${scheduleId}/generate`);
    return response.data;
  },

  bulkAssign: async (dto: BulkServiceActionDto): Promise<BulkServiceActionResult> => {
    const response = await api.post<BulkServiceActionResult>('/patient-services/bulk/assign', dto);
    return response.data;
  },

  bulkChangeStatus: async (dto: BulkServiceActionDto): Promise<BulkServiceActionResult> => {
    const response = await api.post<BulkServiceActionResult>('/patient-services/bulk/change-status', dto);
    return response.data;
  },

  bulkCancel: async (dto: BulkServiceActionDto): Promise<BulkServiceActionResult> => {
    const response = await api.post<BulkServiceActionResult>('/patient-services/bulk/cancel', dto);
    return response.data;
  },

  bulkSendNotification: async (dto: BulkServiceActionDto): Promise<BulkServiceActionResult> => {
    const response = await api.post<BulkServiceActionResult>('/patient-services/bulk/notifications', dto);
    return response.data;
  },

  bulkReschedule: async (dto: BulkServiceActionDto): Promise<BulkServiceActionResult> => {
    const response = await api.post<BulkServiceActionResult>('/patient-services/bulk/reschedule', dto);
    return response.data;
  },

  getCalendarEvents: async (fromDate: string, toDate: string, filters?: PatientServiceQueryFilters): Promise<CalendarEventDto[]> => {
    const params = new URLSearchParams({ fromDate, toDate });
    if (filters?.careRecipientId) params.append('careRecipientId', filters.careRecipientId.toString());
    if (filters?.serviceDefinitionId) params.append('serviceDefinitionId', filters.serviceDefinitionId.toString());
    if (filters?.status != null) params.append('status', filters.status.toString());
    if (filters?.performerId) params.append('performerId', filters.performerId);
    if (filters?.onlyUnassigned != null) params.append('onlyUnassigned', filters.onlyUnassigned.toString());

    const response = await api.get<CalendarEventDto[]>(`/patient-services/calendar?${params.toString()}`);
    return response.data;
  }
};
