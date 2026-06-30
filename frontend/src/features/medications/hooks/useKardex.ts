import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { medicationService } from '@/services/medication.service';
import { MedicationAdministrationOutcome, MedicationAdministrationReportFilters, PatientMedicationHistoryFilters, ShiftSlot } from '@/types/medication';

export const useKardex = (patientId: number, date: string) => {
  return useQuery({
    queryKey: ['kardex', patientId, date],
    queryFn: async () => medicationService.getDailySchedule(patientId, new Date(date)),
    enabled: !!patientId && !!date,
  });
};

export const useShiftMedicationBoard = (date: string, options?: { shiftSlot?: ShiftSlot; pendingOnly?: boolean }) => {
  return useQuery({
    queryKey: ['medication-shift-board', date, options?.shiftSlot, options?.pendingOnly ?? true],
    queryFn: async () => medicationService.getShiftBoard(new Date(date), options),
    enabled: !!date,
  });
};

export const useDoseHistory = (doseId?: number | null) => {
  return useQuery({
    queryKey: ['medication-dose-history', doseId],
    queryFn: async () => medicationService.getDoseHistory(doseId!),
    enabled: !!doseId,
  });
};

export const usePatientMedicationHistory = (patientId: number, filters?: PatientMedicationHistoryFilters | null) => {
  return useQuery({
    queryKey: ['patient-medication-history', patientId, filters],
    queryFn: async () => medicationService.getPatientMedicationHistory(patientId, filters ?? undefined),
    enabled: !!patientId,
  });
};

const invalidateMedicationQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ['kardex'] });
  queryClient.invalidateQueries({ queryKey: ['medications'] });
  queryClient.invalidateQueries({ queryKey: ['medication-shift-board'] });
  queryClient.invalidateQueries({ queryKey: ['medication-dose-history'] });
  queryClient.invalidateQueries({ queryKey: ['patient-medication-history'] });
  queryClient.invalidateQueries({ queryKey: ['medication-administration-report'] });
  queryClient.invalidateQueries({ queryKey: ['medication-administration-trend'] });
};

export const useLogDose = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ doseId, status, notes, missedReason, takenAt }: { doseId: number, status: number, notes?: string, missedReason?: string, takenAt: string }) => {
      return medicationService.logDose(doseId, {
        status,
        notes,
        missedReason,
        takenAt,
        sideEffectSeverity: 0,
      });
    },
    onSuccess: () => {
      invalidateMedicationQueries(queryClient);
    }
  });
};

export const useConfirmDoseByPatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ doseId, notes, patientComment, actualAdministrationAt }: { doseId: number; notes?: string; patientComment?: string; actualAdministrationAt?: string }) =>
      medicationService.confirmDoseByPatient(doseId, { notes, patientComment, actualAdministrationAt }),
    onSuccess: () => invalidateMedicationQueries(queryClient),
  });
};

export const useSkipDoseByPatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ doseId, reason, notes, patientComment }: { doseId: number; reason: string; notes?: string; patientComment?: string }) =>
      medicationService.skipDoseByPatient(doseId, { reason, notes, patientComment }),
    onSuccess: () => invalidateMedicationQueries(queryClient),
  });
};

export const useRecordDoseByNurse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      doseId,
      outcome,
      actualAdministrationAt,
      notes,
      clinicalNotes,
      patientComment,
      missedReason,
    }: {
      doseId: number;
      outcome: MedicationAdministrationOutcome;
      actualAdministrationAt?: string;
      notes?: string;
      clinicalNotes?: string;
      patientComment?: string;
      missedReason?: string;
    }) =>
      medicationService.recordDoseByNurse(doseId, {
        outcome,
        actualAdministrationAt,
        notes,
        clinicalNotes,
        patientComment,
        missedReason,
        sideEffectSeverity: 0,
      }),
    onSuccess: () => invalidateMedicationQueries(queryClient),
  });
};

export const useReviewDose = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ doseId, approve, reason, clinicalNotes }: { doseId: number; approve: boolean; reason?: string; clinicalNotes?: string }) =>
      medicationService.reviewDose(doseId, { approve, reason, clinicalNotes }),
    onSuccess: () => invalidateMedicationQueries(queryClient),
  });
};

export const useCorrectDose = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      doseId,
      outcome,
      actualAdministrationAt,
      correctionReason,
      notes,
      clinicalNotes,
      patientComment,
      missedReason,
    }: {
      doseId: number;
      outcome: MedicationAdministrationOutcome;
      actualAdministrationAt?: string;
      correctionReason: string;
      notes?: string;
      clinicalNotes?: string;
      patientComment?: string;
      missedReason?: string;
    }) =>
      medicationService.correctDose(doseId, {
        outcome,
        actualAdministrationAt,
        correctionReason,
        notes,
        clinicalNotes,
        patientComment,
        missedReason,
        sideEffectSeverity: 0,
      }),
    onSuccess: () => invalidateMedicationQueries(queryClient),
  });
};

export const useResetDoseLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (doseId: number) => medicationService.resetDoseLog(doseId),
    onSuccess: () => {
      invalidateMedicationQueries(queryClient);
    }
  });
};

export const useAdministrationOverviewReport = (filters?: MedicationAdministrationReportFilters | null) => {
  return useQuery({
    queryKey: ['medication-administration-report', filters],
    queryFn: async () => medicationService.getAdministrationOverviewReport(filters!),
    enabled: !!filters,
  });
};

export const useAdministrationTrendReport = (filters?: MedicationAdministrationReportFilters | null) => {
  return useQuery({
    queryKey: ['medication-administration-trend', filters],
    queryFn: async () => medicationService.getAdministrationTrendReport(filters!),
    enabled: !!filters,
  });
};

export const useAdministrationAdherenceBreakdownReport = (filters?: MedicationAdministrationReportFilters | null) => {
  return useQuery({
    queryKey: ['medication-administration-adherence-breakdown', filters],
    queryFn: async () => medicationService.getAdministrationAdherenceBreakdownReport(filters!),
    enabled: !!filters,
  });
};

export const useAdministrationStaffPerformanceReport = (filters?: MedicationAdministrationReportFilters | null) => {
  return useQuery({
    queryKey: ['medication-administration-staff-performance', filters],
    queryFn: async () => medicationService.getAdministrationStaffPerformanceReport(filters!),
    enabled: !!filters,
  });
};
