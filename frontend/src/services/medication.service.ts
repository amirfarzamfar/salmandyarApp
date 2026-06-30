import api from '@/lib/axios';
import { format } from 'date-fns';
import {
  Medication,
  CreateMedicationDto,
  MedicationDose,
  RecordDoseDto,
  PatientConfirmMedicationDoseDto,
  PatientSkipMedicationDoseDto,
  PatientMedicationHistoryFilters,
  NurseRecordMedicationDoseDto,
  ReviewMedicationDoseDto,
  CorrectMedicationDoseDto,
  MedicationDoseStatusHistory,
  MedicationAdministrationOverviewReport,
  MedicationAdministrationTrendPoint,
  MedicationAdministrationReportFilters,
  MedicationAdministrationPatientMedicationAdherence,
  MedicationAdministrationStaffPerformance,
  MedicationInventoryTransaction,
  MedicationAlertHistory,
  UpdateMedicationInventoryDto,
  ShiftSlot,
} from '@/types/medication';

export const medicationService = {
  getPatientMedications: async (patientId: number) => {
    const response = await api.get<Medication[]>(`/medications/patient/${patientId}`);
    return response.data;
  },

  getDose: async (patientId: number, doseId: number) => {
    const response = await api.get<MedicationDose>(`/medications/patient/${patientId}/doses/${doseId}`);
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

  getPatientMedicationHistory: async (patientId: number, filters?: PatientMedicationHistoryFilters) => {
    const response = await api.get<MedicationDose[]>(`/medications/patient/${patientId}/history`, {
      params: filters
    });
    return response.data;
  },

  getShiftBoard: async (date: Date, options?: { shiftSlot?: ShiftSlot; pendingOnly?: boolean }) => {
    const response = await api.get<MedicationDose[]>('/medications/shift-board', {
      params: {
        date: format(date, 'yyyy-MM-dd'),
        shiftSlot: options?.shiftSlot,
        pendingOnly: options?.pendingOnly ?? true
      }
    });
    return response.data;
  },

  logDose: async (doseId: number, data: RecordDoseDto) => {
    await api.post(`/medications/doses/${doseId}/log`, data);
  },

  confirmDoseByPatient: async (doseId: number, data: PatientConfirmMedicationDoseDto) => {
    const response = await api.post<MedicationDose>(`/medications/doses/${doseId}/confirm-by-patient`, data);
    return response.data;
  },

  skipDoseByPatient: async (doseId: number, data: PatientSkipMedicationDoseDto) => {
    const response = await api.post<MedicationDose>(`/medications/doses/${doseId}/skip-by-patient`, data);
    return response.data;
  },

  recordDoseByNurse: async (doseId: number, data: NurseRecordMedicationDoseDto) => {
    const response = await api.post<MedicationDose>(`/medications/doses/${doseId}/record-by-nurse`, data);
    return response.data;
  },

  reviewDose: async (doseId: number, data: ReviewMedicationDoseDto) => {
    const response = await api.post<MedicationDose>(`/medications/doses/${doseId}/review`, data);
    return response.data;
  },

  correctDose: async (doseId: number, data: CorrectMedicationDoseDto) => {
    const response = await api.post<MedicationDose>(`/medications/doses/${doseId}/correct`, data);
    return response.data;
  },

  getDoseHistory: async (doseId: number) => {
    const response = await api.get<MedicationDoseStatusHistory[]>(`/medications/doses/${doseId}/history`);
    return response.data;
  },

  getAdministrationOverviewReport: async (filters: MedicationAdministrationReportFilters) => {
    const response = await api.get<MedicationAdministrationOverviewReport>('/medications/reports/overview', {
      params: filters
    });
    return response.data;
  },

  getAdministrationTrendReport: async (filters: MedicationAdministrationReportFilters) => {
    const response = await api.get<MedicationAdministrationTrendPoint[]>('/medications/reports/missed-trends', {
      params: filters
    });
    return response.data;
  },

  getAdministrationAdherenceBreakdownReport: async (filters: MedicationAdministrationReportFilters) => {
    const response = await api.get<MedicationAdministrationPatientMedicationAdherence[]>('/medications/reports/adherence-breakdown', {
      params: filters
    });
    return response.data;
  },

  getAdministrationStaffPerformanceReport: async (filters: MedicationAdministrationReportFilters) => {
    const response = await api.get<MedicationAdministrationStaffPerformance[]>('/medications/reports/staff-performance', {
      params: filters
    });
    return response.data;
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
