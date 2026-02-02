import api from '@/lib/axios';
import { PatientList, VitalSign, NursingReport, CareService, Medication, MedicationSchedule, CreateMedicationSchedule } from '@/types/patient';

export interface CreateVitalSignRequest {
  careRecipientId: number;
  systolicBloodPressure: number;
  diastolicBloodPressure: number;
  pulseRate: number;
  respiratoryRate: number;
  bodyTemperature: number;
  oxygenSaturation: number;
  measuredAt: string;
}

export interface CreateReportRequest {
  careRecipientId: number;
  shift: string;
  content: string;
}

export const nursePortalService = {
  // Get all patients assigned to the nurse (currently fetches all, backend should filter by nurse)
  getMyPatients: async () => {
    const response = await api.get<PatientList[]>('/patients');
    return response.data;
  },

  getPatientVitals: async (patientId: number) => {
    const response = await api.get<VitalSign[]>(`/patients/${patientId}/vitals`);
    return response.data;
  },

  addVitalSign: async (patientId: number, data: CreateVitalSignRequest) => {
    await api.post(`/patients/${patientId}/vitals`, data);
  },

  getPatientReports: async (patientId: number) => {
    const response = await api.get<NursingReport[]>(`/patients/${patientId}/reports`);
    return response.data;
  },

  addReport: async (patientId: number, data: CreateReportRequest) => {
    await api.post(`/patients/${patientId}/reports`, data);
  },

  getPatientServices: async (patientId: number) => {
    const response = await api.get<CareService[]>(`/patients/${patientId}/services`);
    return response.data;
  },

  addService: async (patientId: number, data: any) => {
    await api.post(`/patients/${patientId}/services`, data);
  },

  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Medication APIs
  getPatientMedications: async (patientId: number) => {
    // This returns the list of prescribed medications
    const response = await api.get<Medication[]>(`/patients/${patientId}/medications`);
    return response.data;
  },

  getMedicationSchedule: async (patientId: number, date: string) => {
    // This returns the schedule for a specific day
    const response = await api.get<MedicationSchedule[]>(`/patients/${patientId}/medications/schedule`, { params: { date } });
    return response.data;
  },

  markMedicationAsTaken: async (scheduleId: number, data: { takenAt: string, note?: string }) => {
    await api.patch(`/medications/schedule/${scheduleId}/taken`, data);
  },

  addMedicationSchedule: async (patientId: number, data: CreateMedicationSchedule) => {
    await api.post(`/patients/${patientId}/medications/schedule`, data);
  }
};
