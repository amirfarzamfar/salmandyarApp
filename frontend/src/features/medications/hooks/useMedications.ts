import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { MedicationFormData } from '../types';
import { medicationService } from '@/services/medication.service';
import { UpdateMedicationInventoryDto } from '@/types/medication';

export const useMedications = (patientId: number) => {
  return useQuery({
    queryKey: ['medications', patientId],
    queryFn: async () => {
      const { data } = await api.get(`/medications/patient/${patientId}`);
      return data;
    },
    enabled: !!patientId,
  });
};

export const useCreateMedication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MedicationFormData) => {
      const { data: res } = await api.post('/medications', data);
      return res;
    },
    onSuccess: (_, variables) => {
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
    mutationFn: async (id: number) => {
      await api.delete(`/medications/${id}`);
    },
    onSuccess: () => {
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
