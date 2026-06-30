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

export enum MedicationAdministrationOutcome {
    Unknown = 0,
    Taken = 1,
    Missed = 2,
    SkippedByPatient = 3,
    NotApplicable = 4
}

export enum MedicationTimingStatus {
    Unknown = 0,
    OnTime = 1,
    Late = 2,
    Missed = 3
}

export enum MedicationVerificationStatus {
    Pending = 0,
    ConfirmedByNurse = 1,
    CorrectedByAdmin = 2,
    RejectedByNurse = 3
}

export enum MedicationAdministrationSourceType {
    Unknown = 0,
    Patient = 1,
    Nurse = 2,
    System = 3,
    Admin = 4
}

export enum ShiftSlot {
    None = 0,
    Morning = 1,
    Evening = 2,
    Night = 3,
    Long = 4,
    TwentyFourHour = 5
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
    careRecipientId: number;
    patientName: string;
    medicationName: string;
    dosage: string;
    route: string;
    instructions: string;
    scheduledTime: string;
    allowedConfirmationUntil?: string;
    status: DoseStatus;
    administrationOutcome: MedicationAdministrationOutcome;
    timingStatus: MedicationTimingStatus;
    verificationStatus: MedicationVerificationStatus;
    sourceType: MedicationAdministrationSourceType;
    takenAt?: string;
    actualAdministrationAt?: string;
    delayMinutes?: number;
    administrationWindowMinutesSnapshot: number;
    takenByName?: string;
    recordedByName?: string;
    verifiedByName?: string;
    correctedByName?: string;
    notes?: string;
    clinicalNotes?: string;
    patientComment?: string;
    correctionReason?: string;
    missedReason?: string;
    sideEffectSeverity: SideEffectSeverity;
    sideEffectDescription?: string;
    scheduledShiftSlot: ShiftSlot;
    recordedShiftSlot: ShiftSlot;
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

export interface PatientConfirmMedicationDoseDto {
    actualAdministrationAt?: string;
    patientComment?: string;
    notes?: string;
}

export interface PatientSkipMedicationDoseDto {
    reason: string;
    patientComment?: string;
    notes?: string;
}

export interface PatientMedicationHistoryFilters {
    from?: string;
    to?: string;
    administrationOutcome?: MedicationAdministrationOutcome;
    timingStatus?: MedicationTimingStatus;
    onlyIssues?: boolean;
    search?: string;
}

export interface NurseRecordMedicationDoseDto {
    outcome: MedicationAdministrationOutcome;
    actualAdministrationAt?: string;
    notes?: string;
    clinicalNotes?: string;
    patientComment?: string;
    missedReason?: string;
    sideEffectSeverity: SideEffectSeverity;
    sideEffectDescription?: string;
    attachmentPath?: string;
}

export interface ReviewMedicationDoseDto {
    approve: boolean;
    reason?: string;
    clinicalNotes?: string;
}

export interface CorrectMedicationDoseDto {
    outcome: MedicationAdministrationOutcome;
    actualAdministrationAt?: string;
    correctionReason: string;
    notes?: string;
    clinicalNotes?: string;
    patientComment?: string;
    missedReason?: string;
    sideEffectSeverity: SideEffectSeverity;
    sideEffectDescription?: string;
    attachmentPath?: string;
}

export interface MedicationDoseStatusHistory {
    id: number;
    changedAtUtc: string;
    action: string;
    changedByName?: string;
    reason?: string;
    notes?: string;
    fromStatus: DoseStatus;
    toStatus: DoseStatus;
    fromAdministrationOutcome: MedicationAdministrationOutcome;
    toAdministrationOutcome: MedicationAdministrationOutcome;
    fromTimingStatus: MedicationTimingStatus;
    toTimingStatus: MedicationTimingStatus;
    fromVerificationStatus: MedicationVerificationStatus;
    toVerificationStatus: MedicationVerificationStatus;
    sourceType: MedicationAdministrationSourceType;
    metadataJson?: string;
}

export interface MedicationAdministrationPatientSummary {
    careRecipientId: number;
    patientName: string;
    totalDoses: number;
    takenCount: number;
    missedCount: number;
    lateCount: number;
    adherenceRate: number;
}

export interface MedicationAdministrationMissedMedication {
    medicationId: number;
    medicationName: string;
    missedCount: number;
}

export interface MedicationAdministrationReportRow {
    doseId: number;
    careRecipientId: number;
    patientName: string;
    medicationId: number;
    medicationName: string;
    scheduledTime: string;
    actualAdministrationAt?: string;
    status: DoseStatus;
    administrationOutcome: MedicationAdministrationOutcome;
    timingStatus: MedicationTimingStatus;
    verificationStatus: MedicationVerificationStatus;
    recordedByName?: string;
    verifiedByName?: string;
    scheduledShiftSlot: ShiftSlot;
    delayMinutes?: number;
    notes?: string;
}

export interface MedicationAdministrationOverviewReport {
    totalDoses: number;
    takenCount: number;
    onTimeCount: number;
    lateCount: number;
    missedCount: number;
    skippedCount: number;
    pendingCount: number;
    adherenceRate: number;
    onTimeRate: number;
    patients: MedicationAdministrationPatientSummary[];
    mostMissedMedications: MedicationAdministrationMissedMedication[];
    rows: MedicationAdministrationReportRow[];
}

export interface MedicationAdministrationTrendPoint {
    date: string;
    takenCount: number;
    lateCount: number;
    missedCount: number;
    skippedCount: number;
}

export interface MedicationAdministrationReportFilters {
    from: string;
    to: string;
    patientId?: number;
    medicationId?: number;
    shiftSlot?: ShiftSlot;
    recordedByUserId?: string;
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
