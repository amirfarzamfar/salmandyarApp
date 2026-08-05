import api from '@/lib/axios';
import { AssessmentForm } from '@/types/assessment';

export const publicFormsService = {
  getGuestServiceRequestForm: async (params?: { serviceDefinitionId?: number; code?: string }) => {
    const response = await api.get<AssessmentForm>('/public/forms/guest-service-request', { params });
    return response.data;
  },
};

