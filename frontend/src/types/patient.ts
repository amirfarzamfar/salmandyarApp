export enum CareLevel {
  Level1 = 12,
  Level2 = 6,
  Level3 = 4,
  Level4 = 2,
  Level5 = 1
}

export interface PatientList {
  id: number;
  userId?: string;
  firstName: string;
  lastName: string;
  age: number;
  primaryDiagnosis: string;
  currentStatus: string;
  careLevel: CareLevel;
  responsibleNurseName?: string;
  isProfileCompleted?: boolean;
}

export interface Patient extends PatientList {
  dateOfBirth: string;
  medicalHistory: string;
  needs: string;
  address: string;
  responsibleNurseId?: string;
}

export interface VitalSign {
  id: number;
  recordedAt: string;
  measuredAt: string;
  isLateEntry: boolean;
  delayReason?: string;
  note?: string;
  recorderName: string;
  systolicBloodPressure: number;
  diastolicBloodPressure: number;
  meanArterialPressure: number;
  pulseRate: number;
  respiratoryRate: number;
  bodyTemperature: number;
  oxygenSaturation: number;
  glasgowComaScale?: number;
}

export type VitalAlertSeverity = 'Warning' | 'Critical';

export interface VitalSignAlert {
  code: string;
  severity: VitalAlertSeverity;
  title: string;
  message: string;
}

export interface AddVitalSignResult {
  vitalSignId: number;
  careRecipientId: number;
  measuredAt: string;
  patientName: string;
  recipientUserIds: string[];
  alerts: VitalSignAlert[];
}

import { ServiceCategory, CareServiceStatus } from './service';
export { ServiceCategory, CareServiceStatus };

export interface CareService {
  id: number;
  performedAt: string;
  performerName: string;
  performerId?: string;
  serviceTitle: string;
  serviceDefinitionId: number;
  category: ServiceCategory;
  status: CareServiceStatus;
  startTime?: string;
  endTime?: string;
  description: string;
  notes: string;
}

export interface CreateCareService {
  careRecipientId: number;
  serviceDefinitionId: number;
  performedAt: string;
  startTime?: string;
  endTime?: string;
  description: string;
  notes: string;
  performerId?: string;
  reminderOptions?: CareServiceReminderOptions;
}

export interface CareServiceReminderOptions {
  enabled: boolean;
  dayBefore: boolean;
  hoursBefore?: number | null;
  note?: string;
  smsToPatient: boolean;
  smsToSupervisor: boolean;
  smsToAdmin: boolean;
  smsToPerformer: boolean;
  inAppToPatient: boolean;
  inAppToSupervisor: boolean;
  inAppToAdmin: boolean;
  inAppToPerformer: boolean;
}

export interface NursingReport {
  id: number;
  createdAt: string;
  authorName?: string; // Optional as backend DTO doesn't have it (uses AuthorId/Name in other DTOs)
  shift: string;
  content: string;
  careRecipientId: number;
  patientName: string;
}

export interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string; // e.g., "Every 8 hours", "Daily"
  route: string; // e.g., "Oral", "IV"
  startDate: string;
  endDate?: string;
  instructions?: string;
}

export interface MedicationSchedule {
  id: number;
  medicationId: number;
  medicationName: string;
  scheduledTime: string; // HH:mm
  status: 'pending' | 'taken' | 'missed';
  takenAt?: string;
  note?: string;
}

export interface CreateMedicationSchedule {
  medicationId: number;
  scheduledTime: string;
  careRecipientId: number;
}
