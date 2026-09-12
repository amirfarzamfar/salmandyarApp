import api from '@/lib/axios';
import { AssessmentForm } from '@/types/assessment';

export const publicFormsService = {
  getGuestServiceRequestForm: async (params?: { serviceDefinitionId?: number; code?: string }) => {
    const response = await api.get<AssessmentForm>('/public/forms/guest-service-request', { params });
    return response.data;
  },

  listPublicHealthTests: async (): Promise<AssessmentForm[]> => {
    try {
      const response = await api.get<AssessmentForm[]>('/public/forms/health-tests');
      return Array.isArray(response.data) ? response.data : [];
    } catch {
      return [];
    }
  },

  getPublicHealthTestByCode: async (code: string): Promise<AssessmentForm | undefined> => {
    try {
      const response = await api.get<AssessmentForm>(`/public/forms/health-tests/${encodeURIComponent(code)}`);
      return response.data || undefined;
    } catch {
      return undefined;
    }
  },
};

