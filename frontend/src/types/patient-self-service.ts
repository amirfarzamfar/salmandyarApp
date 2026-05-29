export type PatientSelfServiceFeatureKey = 'VitalSigns' | 'MedicationKardex';

export interface PatientSelfServiceFeatureStatus {
  featureKey: PatientSelfServiceFeatureKey;
  featureTitle: string;
  isEnabled: boolean;
  canSubmitNow: boolean;
  message?: string | null;
}

export interface PatientSelfServiceAccessSummary {
  careRecipientId: number;
  isConfigured: boolean;
  isEnabled: boolean;
  isCurrentlyWithinWindow: boolean;
  isExpired: boolean;
  statusMessage?: string | null;
  accessStartAtUtc?: string | null;
  accessEndAtUtc?: string | null;
  dailyAccessStartTime?: string | null;
  dailyAccessEndTime?: string | null;
  features: PatientSelfServiceFeatureStatus[];
}

export interface PatientSelfServiceFeatureUpdate {
  featureKey: PatientSelfServiceFeatureKey;
  isEnabled: boolean;
}

export interface UpdatePatientSelfServiceAccessDto {
  isEnabled: boolean;
  availableFromDate?: string | null;
  availableToDate?: string | null;
  dailyAccessStartTime?: string | null;
  dailyAccessEndTime?: string | null;
  features: PatientSelfServiceFeatureUpdate[];
}

export interface PatientSelfServiceAccessAuditEntry {
  id: number;
  action: string;
  details?: string | null;
  createdAt: string;
  performedBy: string;
}
