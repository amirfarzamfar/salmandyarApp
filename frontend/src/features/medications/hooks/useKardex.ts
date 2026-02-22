import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

export const useKardex = (patientId: number, date: string) => {
  return useQuery({
    queryKey: ['kardex', patientId, date],
    queryFn: async () => {
      const { data } = await api.get(`/medications/patient/${patientId}/schedule`, {
        params: { date }
      });
      return data;
    },
    enabled: !!patientId && !!date,
  });
};

export const useLogDose = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ doseId, status, note, takenAt }: { doseId: number, status: number, note?: string, takenAt: string }) => {
      const { data } = await api.post(`/medications/doses/${doseId}/log`, {
        status,
        note,
        takenAt
      });
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['kardex'] });
    }
  });
};
