export enum CareLevel {
  Level1 = 12,
  Level2 = 6,
  Level3 = 4,
  Level4 = 2,
  Level5 = 1
}

export interface PatientList {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  primaryDiagnosis: string;
  currentStatus: string;
  careLevel: CareLevel;
  responsibleNurseName?: string;
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

import { ServiceCategory, CareServiceStatus } from './service';

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
