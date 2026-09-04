import { AssessmentAnswerDto, AssessmentForm } from '@/types/assessment';

export enum GuestServiceRequestStatus {
  New = 0,
  UnderReview = 1,
  NeedContact = 2,
  Contacted = 3,
  FollowUpScheduled = 4,
  Eligible = 5,
  AwaitingConversion = 6,
  ConvertedToPatient = 7,
  Assigned = 8,
  Completed = 9,
  Cancelled = 10,
  Rejected = 11,
  Duplicate = 12,
}

export enum GuestServiceRequestPriority {
  Low = 0,
  Normal = 1,
  High = 2,
  Urgent = 3,
}

export enum GuestContactChannel {
  PhoneCall = 0,
  WhatsApp = 1,
  Sms = 2,
  InPerson = 3,
  Other = 4,
}

export enum GuestContactResult {
  Answered = 0,
  NoAnswer = 1,
  Busy = 2,
  WrongNumber = 3,
  CallBackRequested = 4,
  NotInterested = 5,
  Eligible = 6,
  NotEligible = 7,
}

export enum GuestFollowUpStatus {
  Pending = 0,
  Done = 1,
  Cancelled = 2,
  Overdue = 3,
}

export enum GuestServiceRequestSource {
  LandingForm = 0,
  DirectAdminEntry = 1,
  PhoneCall = 2,
  Referral = 3,
  Other = 4,
}

export enum GuestServiceRequestTimelineEventType {
  RequestCreated = 0,
  StatusChanged = 1,
  NoteAdded = 2,
  SmsSent = 3,
  ConvertedToPatient = 4,
  CaregiverAssigned = 5,
  SupervisorAssigned = 6,
  PriorityChanged = 7,
  ContactLogged = 8,
  FollowUpCreated = 9,
  FollowUpUpdated = 10,
  RequestRejected = 11,
  DuplicateDetected = 12,
  PatientLinked = 13,
}

export const GuestRequestStatusLabels: Record<GuestServiceRequestStatus, string> = {
  [GuestServiceRequestStatus.New]: 'جدید',
  [GuestServiceRequestStatus.UnderReview]: 'در حال بررسی',
  [GuestServiceRequestStatus.NeedContact]: 'نیازمند تماس',
  [GuestServiceRequestStatus.Contacted]: 'تماس گرفته شد',
  [GuestServiceRequestStatus.FollowUpScheduled]: 'پیگیری شده',
  [GuestServiceRequestStatus.Eligible]: 'واجد شرایط',
  [GuestServiceRequestStatus.AwaitingConversion]: 'در انتظار تبدیل',
  [GuestServiceRequestStatus.ConvertedToPatient]: 'تبدیل شده',
  [GuestServiceRequestStatus.Assigned]: 'اختصاص نیرو',
  [GuestServiceRequestStatus.Completed]: 'تکمیل شده',
  [GuestServiceRequestStatus.Cancelled]: 'لغوشده',
  [GuestServiceRequestStatus.Rejected]: 'ردشده',
  [GuestServiceRequestStatus.Duplicate]: 'تکراری',
};

export const GuestRequestPriorityLabels: Record<GuestServiceRequestPriority, string> = {
  [GuestServiceRequestPriority.Low]: 'کم',
  [GuestServiceRequestPriority.Normal]: 'عادی',
  [GuestServiceRequestPriority.High]: 'بالا',
  [GuestServiceRequestPriority.Urgent]: 'فوری',
};

export const GuestContactChannelLabels: Record<GuestContactChannel, string> = {
  [GuestContactChannel.PhoneCall]: 'تماس تلفنی',
  [GuestContactChannel.WhatsApp]: 'واتساپ',
  [GuestContactChannel.Sms]: 'پیامک',
  [GuestContactChannel.InPerson]: 'حضوری',
  [GuestContactChannel.Other]: 'سایر',
};

export const GuestContactResultLabels: Record<GuestContactResult, string> = {
  [GuestContactResult.Answered]: 'پاسخ داده شد',
  [GuestContactResult.NoAnswer]: 'پاسخ داده نشد',
  [GuestContactResult.Busy]: 'مشغول',
  [GuestContactResult.WrongNumber]: 'شماره اشتباه',
  [GuestContactResult.CallBackRequested]: 'درخواست تماس مجدد',
  [GuestContactResult.NotInterested]: 'عدم تمایل',
  [GuestContactResult.Eligible]: 'واجد شرایط',
  [GuestContactResult.NotEligible]: 'غیر واجد شرایط',
};

export const GuestFollowUpStatusLabels: Record<GuestFollowUpStatus, string> = {
  [GuestFollowUpStatus.Pending]: 'در انتظار',
  [GuestFollowUpStatus.Done]: 'انجام شده',
  [GuestFollowUpStatus.Cancelled]: 'لغوشده',
  [GuestFollowUpStatus.Overdue]: 'عقب‌افتاده',
};

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CreateGuestServiceRequestDto {
  formId: number;
  serviceDefinitionId?: number;
  summaryJson?: string;
  answers: AssessmentAnswerDto[];
}

export interface GuestRequestQueryParams {
  pageNumber?: number;
  pageSize?: number;
  searchQuery?: string;
  status?: GuestServiceRequestStatus;
  priority?: GuestServiceRequestPriority;
  assignedSupervisorId?: string;
  assignedCaregiverId?: string;
  formId?: number;
  source?: GuestServiceRequestSource;
  createdFrom?: string;
  createdTo?: string;
  nextFollowUpFrom?: string;
  nextFollowUpTo?: string;
  isConverted?: boolean;
  sortBy?: string;
  sortDescending?: boolean;
}

export interface GuestRequestDashboardStats {
  totalCount: number;
  newCount: number;
  underReviewCount: number;
  needContactCount: number;
  followUpTodayCount: number;
  followUpOverdueCount: number;
  unassignedCount: number;
  highPriorityCount: number;
  eligibleCount: number;
  awaitingConversionCount: number;
  convertedCount: number;
  rejectedCount: number;
  createdTodayCount: number;
  createdThisWeekCount: number;
  convertedTodayCount: number;
  noContactIn3DaysCount: number;
}

export interface GuestServiceRequestListItem {
  id: string;
  trackingCode: string;
  status: GuestServiceRequestStatus;
  priority: GuestServiceRequestPriority;
  serviceType?: string;
  contactName: string;
  contactMobile: string;
  city?: string;
  urgency?: string;
  assignedSupervisorName?: string;
  assignedCaregiverName?: string;
  convertedCareRecipientId?: number;
  createdAt: string;
  updatedAt: string;
  lastContactAt?: string;
  nextFollowUpAt?: string;
  formId: number;
  formTitle?: string;
  source: GuestServiceRequestSource;
}

export interface GuestServiceRequestTimelineEvent {
  id: string;
  eventType: GuestServiceRequestTimelineEventType;
  title: string;
  description: string;
  actorName?: string;
  actorId?: string;
  occurredAt: string;
  metadataJson?: string;
}

export interface GuestContactLog {
  id: string;
  requestId: string;
  contactedAt: string;
  channel: GuestContactChannel;
  result: GuestContactResult;
  durationSeconds?: number;
  notes?: string;
  nextAction?: string;
  nextFollowUpSuggestedAt?: string;
  actorName?: string;
  actorId?: string;
  createdAt: string;
}

export interface GuestFollowUp {
  id: string;
  requestId: string;
  scheduledAt: string;
  status: GuestFollowUpStatus;
  followUpType?: string;
  description?: string;
  assignedToUserId?: string;
  assignedToUserName?: string;
  completedAt?: string;
  resolutionNotes?: string;
  createdByUserName: string;
  createdByUserId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DynamicFormField {
  questionId: number;
  groupKey?: string;
  groupTitle?: string;
  pageKey?: string;
  pageTitle?: string;
  questionText: string;
  questionType: number;
  displayValue?: string;
  rawValue?: string;
  hasValue: boolean;
  order: number;
  tags?: string[];
}

export interface DynamicFormSection {
  key?: string;
  title?: string;
  order: number;
  fields: DynamicFormField[];
}

export interface GuestServiceRequestDetails {
  id: string;
  trackingCode: string;
  formId: number;
  formVersion: number;
  submissionId: number;
  serviceDefinitionId?: number;
  assignedSupervisorId?: string;
  assignedSupervisorName?: string;
  assignedCaregiverId?: string;
  assignedCaregiverName?: string;
  convertedCareRecipientId?: number;
  status: GuestServiceRequestStatus;
  priority: GuestServiceRequestPriority;
  source: GuestServiceRequestSource;
  serviceType?: string;
  urgency?: string;
  city?: string;
  contactName: string;
  contactMobile: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  lastContactAt?: string;
  nextFollowUpAt?: string;
  convertedAt?: string;
  rejectionReason?: string;
  summaryJson?: string;
  form?: AssessmentForm;
  answers: AssessmentAnswerDto[];
  renderedFormSections: DynamicFormSection[];
  contactLogs: GuestContactLog[];
  followUps: GuestFollowUp[];
  timeline: GuestServiceRequestTimelineEvent[];
}

export interface UpdateGuestServiceRequestStatusDto {
  status: GuestServiceRequestStatus;
  reason?: string;
}

export interface UpdateGuestServiceRequestPriorityDto {
  priority: GuestServiceRequestPriority;
}

export interface AddGuestServiceRequestNoteDto {
  note: string;
}

export interface SendGuestServiceRequestSmsDto {
  message: string;
  templateKey?: string;
}

export interface SmsTemplate {
  key: string;
  name: string;
  body: string;
  description: string;
}

export interface ConvertGuestServiceRequestToPatientDto {
  existingCareRecipientId?: number;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  primaryDiagnosis: string;
  currentStatus: string;
  careLevel: number;
  medicalHistory?: string;
  needs?: string;
  address?: string;
  familyMemberUserId?: string;
}

export interface AssignGuestServiceRequestCaregiverDto {
  caregiverId?: string;
}

export interface AssignGuestServiceRequestSupervisorDto {
  supervisorId?: string;
}

export interface CreateGuestContactLogDto {
  contactedAt?: string;
  channel: GuestContactChannel;
  result: GuestContactResult;
  durationSeconds?: number;
  notes?: string;
  nextAction?: string;
  nextFollowUpSuggestedAt?: string;
}

export interface CreateGuestFollowUpDto {
  scheduledAt: string;
  followUpType?: string;
  description?: string;
  assignedToUserId?: string;
}

export interface UpdateGuestFollowUpDto {
  scheduledAt?: string;
  status?: GuestFollowUpStatus;
  followUpType?: string;
  description?: string;
  assignedToUserId?: string;
  resolutionNotes?: string;
}

export interface DuplicatePatientCandidate {
  careRecipientId: number;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  mobileNumber?: string;
  matchReason: string;
  matchScore: number;
}

export interface RejectGuestRequestDto {
  reason: string;
}
