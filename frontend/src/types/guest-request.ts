import { AssessmentAnswerDto, AssessmentForm } from '@/types/assessment';

export enum GuestServiceRequestStatus {
  New = 0,
  UnderReview = 1,
  Contacted = 2,
  ConvertedToPatient = 3,
  Assigned = 4,
  Completed = 5,
  Cancelled = 6,
}

export enum GuestServiceRequestTimelineEventType {
  RequestCreated = 0,
  StatusChanged = 1,
  NoteAdded = 2,
  SmsSent = 3,
  ConvertedToPatient = 4,
  CaregiverAssigned = 5,
}

export interface CreateGuestServiceRequestDto {
  formId: number;
  serviceDefinitionId?: number;
  summaryJson?: string;
  answers: AssessmentAnswerDto[];
}

export interface GuestServiceRequestListItem {
  id: string;
  trackingCode: string;
  status: GuestServiceRequestStatus;
  serviceType?: string;
  urgency?: string;
  city?: string;
  contactName: string;
  contactMobile: string;
  createdAt: string;
}

export interface GuestServiceRequestTimelineEvent {
  id: string;
  eventType: GuestServiceRequestTimelineEventType;
  title: string;
  description: string;
  actorName?: string;
  occurredAt: string;
}

export interface GuestServiceRequestDetails {
  id: string;
  trackingCode: string;
  formId: number;
  submissionId: number;
  serviceDefinitionId?: number;
  assignedSupervisorName?: string;
  assignedCaregiverName?: string;
  convertedCareRecipientId?: number;
  status: GuestServiceRequestStatus;
  serviceType?: string;
  urgency?: string;
  city?: string;
  contactName: string;
  contactMobile: string;
  createdAt: string;
  updatedAt: string;
  summaryJson?: string;
  form?: AssessmentForm;
  answers: AssessmentAnswerDto[];
  timeline: GuestServiceRequestTimelineEvent[];
}

export interface UpdateGuestServiceRequestStatusDto {
  status: GuestServiceRequestStatus;
}

export interface AddGuestServiceRequestNoteDto {
  note: string;
}

export interface SendGuestServiceRequestSmsDto {
  message: string;
}

export interface ConvertGuestServiceRequestToPatientDto {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  primaryDiagnosis: string;
  currentStatus: string;
  careLevel: number;
  medicalHistory?: string;
  needs?: string;
  address?: string;
}

export interface AssignGuestServiceRequestCaregiverDto {
  caregiverId?: string;
}

