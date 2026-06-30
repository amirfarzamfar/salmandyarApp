import api from '@/lib/axios';
import { AssignmentDto, CreateAssignmentDto, AssignmentStatus } from '@/types/assignment';

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export const assignmentService = {
  create: async (data: CreateAssignmentDto) => {
    const response = await api.post<AssignmentDto>('/assignments', data);
    return response.data;
  },

  update: async (id: string, data: CreateAssignmentDto) => {
    const response = await api.put<AssignmentDto>(`/assignments/${id}`, data);
    return response.data;
  },

  updateStatus: async (id: string, status: AssignmentStatus) => {
    await api.put(`/assignments/${id}/status`, { status });
  },

  getCalendar: async (start: string, end: string, patientId?: number, caregiverId?: string, status?: AssignmentStatus) => {
    const params = new URLSearchParams({
      start,
      end
    });
    
    if (patientId) params.append('patientId', patientId.toString());
    if (caregiverId) params.append('caregiverId', caregiverId);
    if (status) params.append('status', status.toString());

    const response = await api.get<AssignmentDto[]>(`/assignments/calendar?${params.toString()}`);
    return response.data;
  },

  getPaged: async (params: { page?: number; pageSize?: number; start?: string; end?: string; search?: string; patientId?: number; caregiverId?: string; status?: AssignmentStatus }) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params.start) queryParams.append('start', params.start);
    if (params.end) queryParams.append('end', params.end);
    if (params.search) queryParams.append('search', params.search);
    if (params.patientId) queryParams.append('patientId', params.patientId.toString());
    if (params.caregiverId) queryParams.append('caregiverId', params.caregiverId);
    if (params.status) queryParams.append('status', params.status.toString());

    const response = await api.get<PagedResponse<AssignmentDto>>(`/assignments?${queryParams.toString()}`);
    return response.data;
  },

  getAuditLogs: async (id: string) => {
    const response = await api.get<any[]>(`/assignments/${id}/audit-logs`);
    return response.data;
  }
};
