import api from '@/lib/axios';
import { Patient, PatientList, VitalSign, CareService, NursingReport, CreateCareService, AddVitalSignResult, VitalSignAcknowledgementResult } from '@/types/patient';

export const patientService = {
  getAll: async () => {
    const response = await api.get<PatientList[]>('/patients');
    return response.data;
  },
  getAccessiblePatient: async () => {
    const patients = await patientService.getAll();
    return patients[0] ?? null;
  },
  create: async (data: Record<string, unknown>) => {
    const response = await api.post<Patient>('/patients', data);
    return response.data;
  },
  getById: async (id: number) => {
    try {
      const response = await api.get<Patient>(`/patients/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching patient ${id}:`, error);
      throw error;
    }
  },
  getVitals: async (id: number) => {
    const response = await api.get<VitalSign[]>(`/patients/${id}/vitals`);
    return response.data;
  },
  addVitalSign: async (id: number, data: Record<string, unknown>) => {
    const response = await api.post<AddVitalSignResult>(`/patients/${id}/vitals`, data);
    return response.data;
  },
  acknowledgeVitalSign: async (patientId: number, vitalSignId: number, note: string) => {
    const response = await api.post<VitalSignAcknowledgementResult>(`/patients/${patientId}/vitals/${vitalSignId}/acknowledge`, { note });
    return response.data;
  },
  getServices: async (id: number) => {
    const response = await api.get<CareService[]>(`/patients/${id}/services`);
    return response.data;
  },
  addService: async (data: CreateCareService) => {
    const response = await api.post(`/patients/${data.careRecipientId}/services`, data);
    return response.data;
  },
  updateService: async (serviceId: number, data: Record<string, unknown>) => {
    await api.put(`/patients/services/${serviceId}`, data);
  },
  getReports: async (id: number) => {
    const response = await api.get<NursingReport[]>(`/patients/${id}/reports`);
    return response.data;
  }
};
