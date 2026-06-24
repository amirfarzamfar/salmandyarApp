import api from '@/lib/axios';
import { format } from 'date-fns';
import {
  Medication,
  CreateMedicationDto,
  MedicationDose,
  RecordDoseDto,
  MedicationInventoryTransaction,
  MedicationAlertHistory,
  UpdateMedicationInventoryDto,
} from '@/types/medication';

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
      params: { date: format(date, 'yyyy-MM-dd') }
    });
    return response.data;
  },

  logDose: async (doseId: number, data: RecordDoseDto) => {
    await api.post(`/medications/doses/${doseId}/log`, data);
  },

  resetDoseLog: async (doseId: number) => {
    await api.delete(`/medications/doses/${doseId}/log`);
  },

  getInventoryTransactions: async (medicationId: number) => {
    const response = await api.get<MedicationInventoryTransaction[]>(`/medications/${medicationId}/inventory-transactions`);
    return response.data;
  },

  getAlertHistory: async (medicationId: number) => {
    const response = await api.get<MedicationAlertHistory[]>(`/medications/${medicationId}/alert-history`);
    return response.data;
  },

  updateInventory: async (medicationId: number, data: UpdateMedicationInventoryDto) => {
    const response = await api.post<Medication>(`/medications/${medicationId}/inventory`, data);
    return response.data;
  }
};
