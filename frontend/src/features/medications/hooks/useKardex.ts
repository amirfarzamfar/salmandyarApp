import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { medicationService } from '@/services/medication.service';

// #region debug-point C:kardex-query
const reportKardexDebug = (hypothesisId: string, msg: string, data?: unknown) =>
  fetch('http://127.0.0.1:7777/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: 'medication-kardex-list',
      runId: 'pre-fix',
      hypothesisId,
      location: 'useKardex.ts',
      msg: `[DEBUG] ${msg}`,
      data,
      ts: Date.now(),
    }),
  }).catch(() => {});
// #endregion

export const useKardex = (patientId: number, date: string) => {
  return useQuery({
    queryKey: ['kardex', patientId, date],
    queryFn: async () => {
      void reportKardexDebug('C', 'kardex query started', { patientId, date });
      const { data } = await api.get(`/medications/patient/${patientId}/schedule`, {
        params: { date }
      });
      void reportKardexDebug('C', 'kardex query succeeded', {
        patientId,
        date,
        count: Array.isArray(data) ? data.length : null,
        medicationIds: Array.isArray(data) ? [...new Set(data.map((item: { medicationId: number }) => item.medicationId))] : null,
      });
      return data;
    },
    enabled: !!patientId && !!date,
  });
};

export const useLogDose = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ doseId, status, notes, missedReason, takenAt }: { doseId: number, status: number, notes?: string, missedReason?: string, takenAt: string }) => {
      const { data } = await api.post(`/medications/doses/${doseId}/log`, {
        status,
        notes,
        missedReason,
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

export const useResetDoseLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (doseId: number) => medicationService.resetDoseLog(doseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kardex'] });
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    }
  });
};
