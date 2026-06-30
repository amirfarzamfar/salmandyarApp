import axios from '@/lib/axios';

export interface MedicationAlertSettings {
  allowEarlyConfirmationMinutes: number;
  allowLateConfirmationMinutes: number;
  smsTemplate: string;
  emailSubjectTemplate: string;
  emailBodyTemplate: string;
  inAppTemplate: string;
  updatedAt: string;
}

export interface UpdateMedicationAlertSettingsDto {
  allowEarlyConfirmationMinutes: number;
  allowLateConfirmationMinutes: number;
  smsTemplate: string;
  emailSubjectTemplate: string;
  emailBodyTemplate: string;
  inAppTemplate: string;
}

export const medicationAlertSettingsService = {
  get: async (): Promise<MedicationAlertSettings> => {
    const response = await axios.get('/admin/medication-alert-settings');
    return response.data;
  },

  update: async (data: UpdateMedicationAlertSettingsDto): Promise<MedicationAlertSettings> => {
    const response = await axios.put('/admin/medication-alert-settings', data);
    return response.data;
  }
};
