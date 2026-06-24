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

export enum MedicationStockStatus {
    InStock = 0,
    LowStock = 1,
    OutOfStock = 2
}

export enum MedicationInventoryTransactionType {
    InitialStock = 0,
    DoseConsumption = 1,
    ManualIncrease = 2,
    ManualDecrease = 3,
    Adjustment = 4,
    StockReturn = 5
}

export enum MedicationAlertChannel {
    InApp = 0,
    Sms = 1,
    Email = 2
}

export enum MedicationAlertHistoryStatus {
    Success = 0,
    Failed = 1
}

export interface Medication {
    id: number;
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

    totalQuantity: number;
    alertLimit: number;
    doseQuantity: number;
    stockStatus: MedicationStockStatus;
    stockStatusLabel: string;
    isLowStockAlertActive: boolean;
    lowStockAlertActivatedAt?: string;
    alertLowStockInAppEnabled: boolean;
    alertLowStockSmsEnabled: boolean;
    alertLowStockEmailEnabled: boolean;
    alertLowStockPatient: boolean;
    alertLowStockNurse: boolean;
    alertLowStockFamily: boolean;
    alertLowStockAdmin: boolean;
    alertLowStockCustomPhone?: string;
    alertLowStockCustomEmail?: string;
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

    totalQuantity: number;
    alertLimit: number;
    doseQuantity: number;
    alertLowStockInAppEnabled: boolean;
    alertLowStockSmsEnabled: boolean;
    alertLowStockEmailEnabled: boolean;
    alertLowStockPatient: boolean;
    alertLowStockNurse: boolean;
    alertLowStockFamily: boolean;
    alertLowStockAdmin: boolean;
    alertLowStockCustomPhone?: string;
    alertLowStockCustomEmail?: string;
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
    currentQuantity: number;
    alertLimit: number;
    doseQuantity: number;
    stockStatus: MedicationStockStatus;
    stockStatusLabel: string;
    isLowStockAlertActive: boolean;
}

export interface RecordDoseDto {
    takenAt: string;
    status: DoseStatus;
    notes?: string;
    missedReason?: string;
    sideEffectSeverity: SideEffectSeverity;
    sideEffectDescription?: string;
}

export interface MedicationInventoryTransaction {
    id: number;
    createdAt: string;
    performedByName?: string;
    transactionType: MedicationInventoryTransactionType;
    transactionTypeLabel: string;
    quantityChanged: number;
    quantityBefore: number;
    quantityAfter: number;
    notes?: string;
}

export interface MedicationAlertHistory {
    id: number;
    medicationName: string;
    patientName: string;
    createdAt: string;
    alertTypeLabel: string;
    recipient: string;
    channel: MedicationAlertChannel;
    channelLabel: string;
    message: string;
    deliveryStatus: MedicationAlertHistoryStatus;
    deliveryStatusLabel: string;
    errorMessage?: string;
}

export interface UpdateMedicationInventoryDto {
    transactionType: MedicationInventoryTransactionType;
    quantity: number;
    notes?: string;
}
