export enum MedicationCriticality {
    Routine = 0,
    Important = 1,
    HighAlert = 2,
    LifeSaving = 3
}

export enum MedicationFrequencyType {
    Daily = 0,
    Weekly = 1,
    PRN = 2,
    Interval = 3,
    SpecificDays = 4
}

export enum DoseStatus {
    Scheduled = 0,
    Due = 1,
    Late = 2,
    Taken = 3,
    Missed = 4,
    Cancelled = 5,
    Skipped = 6
}

export enum SideEffectSeverity {
    None = 0,
    Mild = 1,
    Moderate = 2,
    Severe = 3
}

export interface Medication {
    id: number;
    name: string;
    form: string;
    dosage: string;
    route: string;
    frequencyType: MedicationFrequencyType;
    frequencyDetail?: string;
    startDate: string;
    endDate?: string;
    isPRN: boolean;
    highAlert: boolean;
    criticality: MedicationCriticality;
    instructions?: string;
    
    gracePeriodMinutes: number;
    notifyPatient: boolean;
    notifyNurse: boolean;
    notifySupervisor: boolean;
    notifyFamily: boolean;
    escalationEnabled: boolean;
}

export interface CreateMedicationDto {
    careRecipientId: number;
    name: string;
    form: string;
    dosage: string;
    route: string;
    frequencyType: MedicationFrequencyType;
    frequencyDetail?: string;
    startDate: string;
    endDate?: string;
    isPRN: boolean;
    highAlert: boolean;
    criticality: MedicationCriticality;
    instructions?: string;

    gracePeriodMinutes: number;
    notifyPatient: boolean;
    notifyNurse: boolean;
    notifySupervisor: boolean;
    notifyFamily: boolean;
    escalationEnabled: boolean;
}

export interface MedicationDose {
    id: number;
    medicationId: number;
    medicationName: string;
    dosage: string;
    route: string;
    instructions: string;
    scheduledTime: string;
    status: DoseStatus;
    takenAt?: string;
    takenByName?: string;
    notes?: string;
    missedReason?: string;
    sideEffectSeverity: SideEffectSeverity;
    sideEffectDescription?: string;
}

export interface RecordDoseDto {
    takenAt: string;
    status: DoseStatus;
    notes?: string;
    missedReason?: string;
    sideEffectSeverity: SideEffectSeverity;
    sideEffectDescription?: string;
}
