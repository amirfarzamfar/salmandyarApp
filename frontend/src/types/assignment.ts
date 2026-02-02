export enum AssignmentType {
  Daily = 0,
  Monthly = 1,
  ShiftBased = 2,
  TwentyFourHour = 3
}

export enum ShiftSlot {
  None = 0,
  Morning = 1,
  Evening = 2,
  Night = 3
}

export enum AssignmentStatus {
  Active = 0,
  Completed = 1,
  Cancelled = 2,
  Suspended = 3
}

export interface CreateAssignmentDto {
  patientId: number;
  caregiverId: string;
  assignmentType: AssignmentType;
  shiftSlot?: ShiftSlot;
  startDate: string; // ISO string
  endDate?: string;
  isPrimaryCaregiver: boolean;
  notes: string;
}

export interface AssignmentDto {
  id: string;
  patientId: number;
  patientName: string;
  caregiverId: string;
  caregiverName: string;
  assignmentType: AssignmentType;
  shiftSlot?: ShiftSlot;
  startDate: string;
  endDate?: string;
  status: AssignmentStatus;
  isPrimaryCaregiver: boolean;
  notes: string;
  createdAt: string;
}
