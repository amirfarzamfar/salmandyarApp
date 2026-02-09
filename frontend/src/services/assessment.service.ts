import api from '@/lib/axios';
import { AssessmentForm, CreateAssessmentFormDto, MatchingResult, AssessmentType, SubmitAssessmentDto, UserProfileDto } from '@/types/assessment';

export const assessmentService = {
  // Forms
  getAllForms: async () => {
    const response = await api.get<AssessmentForm[]>('/assessments/forms');
    return response.data;
  },

  getFormById: async (id: number) => {
    const response = await api.get<AssessmentForm>(`/assessments/forms/details/${id}`);
    return response.data;
  },

  createForm: async (data: CreateAssessmentFormDto) => {
    const response = await api.post<AssessmentForm>('/assessments/forms', data);
    return response.data;
  },

  updateForm: async (id: number, data: CreateAssessmentFormDto) => {
    const response = await api.put<AssessmentForm>(`/assessments/forms/${id}`, data);
    return response.data;
  },

  deleteForm: async (id: number) => {
    await api.delete(`/assessments/forms/${id}`);
  },

  toggleForm: async (id: number) => {
    await api.patch(`/assessments/forms/${id}/toggle`);
  },
  
  getActiveForm: async (type: AssessmentType) => {
    const response = await api.get<AssessmentForm>(`/assessments/forms/${type}`);
    return response.data;
  },

  getFormsByType: async (type: AssessmentType) => {
    const response = await api.get<AssessmentForm[]>(`/assessments/forms/list/${type}`);
    return response.data;
  },

  submitAssessment: async (data: SubmitAssessmentDto) => {
    const response = await api.post<UserProfileDto>('/assessments/submit', data);
    return response.data;
  },

  // Matching
  findMatches: async (seniorId: string) => {
    const response = await api.get<MatchingResult>(`/matching/recommend/${seniorId}`);
    return response.data;
  },
};
