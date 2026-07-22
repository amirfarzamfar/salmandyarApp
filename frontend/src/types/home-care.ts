import { AssessmentAnswerDto, AssessmentForm } from '@/types/assessment';

export enum HomeCareRequestStatus {
  Draft = 0,
  Submitted = 1,
  UnderSupervisorReview = 2,
  ContactScheduled = 3,
  AwaitingDocuments = 4,
  MatchingCaregiver = 5,
  AwaitingPatientConfirmation = 6,
  InService = 7,
  Completed = 8,
  SatisfactionPending = 9,
  Cancelled = 10,
}

export enum HomeCareContactMethod {
  PhoneCall = 0,
  WhatsApp = 1,
  Sms = 2,
  InAppChat = 3,
}

export enum HomeCareMessageType {
  Text = 0,
  Image = 1,
  File = 2,
  Voice = 3,
  System = 4,
}

export interface SaveHomeCareDraftDto {
  submissionId?: number;
  draftKey?: string;
  serviceDefinitionId: number;
  formId: number;
  careRecipientId?: number;
  patientRelationship: string;
  contactFirstName: string;
  contactLastName: string;
  contactMobile: string;
  preferredContactMethod: HomeCareContactMethod;
  contactTimePreference?: string;
  preferredStartAt?: string;
  city?: string;
  address?: string;
  floor?: string;
  hasElevator: boolean;
  homeConditionNotes?: string;
  notes?: string;
  summaryJson?: string;
  answers: AssessmentAnswerDto[];
}

export interface CreateHomeCareRequestDto extends Omit<SaveHomeCareDraftDto, 'submissionId' | 'draftKey'> {}

export interface HomeCareDraft {
  submissionId: number;
  draftKey: string;
  formId: number;
  serviceDefinitionId: number;
  summaryJson?: string;
  lastSavedAt?: string;
  answers: AssessmentAnswerDto[];
}

export interface HomeCareRequestListItem {
  id: string;
  trackingCode: string;
  serviceTitle: string;
  status: HomeCareRequestStatus;
  contactName: string;
  contactMobile: string;
  createdAt: string;
  estimatedContactAt?: string;
  unreadMessages: number;
}

export interface HomeCareMessageAttachment {
  id: string;
  originalFileName: string;
  contentType: string;
  fileUrl: string;
  fileSizeBytes: number;
}

export interface HomeCareMessage {
  id: string;
  senderUserId: string;
  senderName: string;
  senderRoleLabel: string;
  messageType: HomeCareMessageType;
  content: string;
  isRead: boolean;
  sentAt: string;
  readAt?: string;
  attachments: HomeCareMessageAttachment[];
}

export interface HomeCareConversationParticipant {
  userId: string;
  displayName: string;
  roleLabel: string;
  lastReadAt?: string;
}

export interface HomeCareConversation {
  id: string;
  title: string;
  isClosed: boolean;
  updatedAt: string;
  participants: HomeCareConversationParticipant[];
  messages: HomeCareMessage[];
}

export interface HomeCareTimelineEvent {
  id: string;
  eventType: number;
  title: string;
  description: string;
  actorName?: string;
  occurredAt: string;
}

export interface HomeCareRequestDetails {
  id: string;
  trackingCode: string;
  serviceDefinitionId: number;
  serviceTitle: string;
  formId: number;
  submissionId: number;
  status: HomeCareRequestStatus;
  priority: number;
  preferredContactMethod: HomeCareContactMethod;
  contactTimePreference?: string;
  contactFirstName: string;
  contactLastName: string;
  contactMobile: string;
  patientRelationship?: string;
  city?: string;
  address?: string;
  floor?: string;
  hasElevator: boolean;
  homeConditionNotes?: string;
  notes?: string;
  createdAt: string;
  preferredStartAt?: string;
  estimatedContactAt?: string;
  assignedSupervisorName?: string;
  assignedCaregiverName?: string;
  summaryJson?: string;
  form?: AssessmentForm;
  answers: AssessmentAnswerDto[];
  timeline: HomeCareTimelineEvent[];
  conversations: HomeCareConversation[];
}
