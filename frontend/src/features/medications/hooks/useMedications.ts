import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { MedicationFormData } from '../types';

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
