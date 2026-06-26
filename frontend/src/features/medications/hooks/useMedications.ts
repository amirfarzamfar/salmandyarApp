import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { MedicationFormData } from '../types';
import { medicationService } from '@/services/medication.service';
import { UpdateMedicationInventoryDto } from '@/types/medication';

// #region debug-point A:medication-query
const reportMedicationDebug = (hypothesisId: string, msg: string, data?: unknown) =>
  fetch('http://127.0.0.1:7777/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: 'medication-kardex-list',
      runId: 'pre-fix',
      hypothesisId,
      location: 'useMedications.ts',
      msg: `[DEBUG] ${msg}`,
      data,
      ts: Date.now(),
    }),
  }).catch(() => {});
// #endregion

export const useMedications = (patientId: number) => {
  return useQuery({
    queryKey: ['medications', patientId],
    queryFn: async () => {
      void reportMedicationDebug('D', 'medication list query started', { patientId });
      const { data } = await api.get(`/medications/patient/${patientId}`);
      void reportMedicationDebug('D', 'medication list query succeeded', {
        patientId,
        count: Array.isArray(data) ? data.length : null,
        ids: Array.isArray(data) ? data.map((item: { id: number }) => item.id) : null,
      });
      return data;
    },
    enabled: !!patientId,
  });
};

export const useCreateMedication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MedicationFormData) => {
      void reportMedicationDebug('A', 'create medication request started', {
        careRecipientId: data.careRecipientId,
        startDate: data.startDate,
        endDate: data.endDate ?? null,
        name: data.name,
      });
      const { data: res } = await api.post('/medications', data);
      void reportMedicationDebug('A', 'create medication request succeeded', {
        careRecipientId: data.careRecipientId,
        createdMedicationId: res?.id ?? null,
        responseCareRecipientId: res?.careRecipientId ?? null,
      });
      return res;
    },
    onSuccess: (_, variables) => {
      void reportMedicationDebug('A', 'invalidating medication queries after create', {
        careRecipientId: variables.careRecipientId,
      });
      queryClient.invalidateQueries({ queryKey: ['medications', variables.careRecipientId] });
      queryClient.invalidateQueries({ queryKey: ['kardex'] });
    },
  });
};

export const useUpdateMedication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: MedicationFormData }) => {
      const { data: res } = await api.put(`/medications/${id}`, data);
      return res;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['medications', variables.data.careRecipientId] });
      queryClient.invalidateQueries({ queryKey: ['kardex'] });
    },
  });
};

export const useDeleteMedication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: number; patientId: number }) => {
      await api.delete(`/medications/${id}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['medications', variables.patientId] });
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      queryClient.invalidateQueries({ queryKey: ['kardex'] });
    },
  });
};

export const useMedicationInventoryTransactions = (medicationId?: number) => {
  return useQuery({
    queryKey: ['medication-inventory-transactions', medicationId],
    queryFn: async () => medicationService.getInventoryTransactions(medicationId!),
    enabled: !!medicationId,
  });
};

export const useMedicationAlertHistory = (medicationId?: number) => {
  return useQuery({
    queryKey: ['medication-alert-history', medicationId],
    queryFn: async () => medicationService.getAlertHistory(medicationId!),
    enabled: !!medicationId,
  });
};

export const useUpdateMedicationInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateMedicationInventoryDto }) => {
      return medicationService.updateInventory(id, data);
    },
    onSuccess: (updatedMedication) => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      queryClient.invalidateQueries({ queryKey: ['kardex'] });
      queryClient.invalidateQueries({ queryKey: ['medication-inventory-transactions', updatedMedication.id] });
      queryClient.invalidateQueries({ queryKey: ['medication-alert-history', updatedMedication.id] });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('notifications:refresh'));
      }
    },
  });
};
