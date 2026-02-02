import api from '@/lib/axios';
import { AssignmentDto, CreateAssignmentDto, AssignmentStatus } from '@/types/assignment';

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

  getCalendar: async (start: string, end: string, patientId?: number, caregiverId?: string) => {
    const params = new URLSearchParams({
      start,
      end
    });
    
    if (patientId) params.append('patientId', patientId.toString());
    if (caregiverId) params.append('caregiverId', caregiverId);

    const response = await api.get<AssignmentDto[]>(`/assignments/calendar?${params.toString()}`);
    return response.data;
  }
};
