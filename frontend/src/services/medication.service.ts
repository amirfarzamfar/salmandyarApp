import api from '@/lib/axios';
import { Medication, CreateMedicationDto, MedicationDose, RecordDoseDto } from '@/types/medication';

export const medicationService = {
  getPatientMedications: async (patientId: number) => {
    const response = await api.get<Medication[]>(`/medications/patient/${patientId}`);
    return response.data;
  },

  addMedication: async (data: CreateMedicationDto) => {
    const response = await api.post<Medication>('/medications', data);
    return response.data;
  },

  getDailySchedule: async (patientId: number, date: Date) => {
    const response = await api.get<MedicationDose[]>(`/medications/patient/${patientId}/schedule`, {
      params: { date: date.toISOString() }
    });
    return response.data;
  },

  logDose: async (doseId: number, data: RecordDoseDto) => {
    await api.post(`/medications/doses/${doseId}/log`, data);
  }
};
