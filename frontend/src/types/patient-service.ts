export enum CareServiceStatus {
  Draft = 0,
  Scheduled = 1,
  Planned = 1,
  Pending = 2,
  Assigned = 3,
  Accepted = 4,
  InProgress = 5,
  Completed = 6,
  Cancelled = 7,
  NoShow = 8,
  Expired = 9
}

export enum ServicePriority {
  Normal = 1,
  Important = 2,
  Urgent = 3
}

export enum ServiceLocationType {
  PatientHome = 1,
  MedicalCenter = 2,
  Other = 3
}

export enum ServiceAssignmentStatus {
  Unassigned = 0,
  Assigned = 1,
  Accepted = 2,
  Declined = 3,
  Reassigned = 4
}

export enum ServiceRecurrenceType {
  None = 0,
  Daily = 1,
  Weekly = 2,
  Monthly = 3
}

export enum ServiceNotificationStatus {
  NotCreated = 0,
  Draft = 1,
  Scheduled = 2,
  Sent = 3,
  Delivered = 4,
  Read = 5,
  Failed = 6
}

export enum ServiceNotificationRecipientType {
  Patient = 1,
  PatientFamily = 2,
  Nurse = 3,
  Caregiver = 4,
  Supervisor = 5,
  All = 10
}

export enum ServiceNotificationChannel {
  InApp = 1,
  Push = 2,
  Sms = 3,
  Email = 4
}

export enum ServiceActivityType {
  Created = 1,
  StatusChanged = 2,
  Assigned = 3,
  ProviderChanged = 4,
  ScheduleUpdated = 5,
  NotificationSent = 6,
  DetailsUpdated = 7,
  Cancelled = 8,
  Completed = 9,
  Started = 10,
  Accepted = 11,
  Declined = 12,
  NoShow = 13,
  PriorityChanged = 14,
  NoteAdded = 15
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PatientServiceDto {
  id: number;
  careRecipientId: number;
  patientFullName: string;
  patientAvatar?: string | null;
  patientCode?: string | null;
  patientPhone?: string | null;
  patientAge: number;
  patientStatus: string;

  serviceDefinitionId: number;
  serviceDefinitionTitle: string;
  serviceDefinitionCode: string;
  customServiceName?: string | null;

  performerId?: string | null;
  performerFullName?: string | null;
  performerRole?: string | null;
  performerPhone?: string | null;

  assignedAt?: string | null;
  assignedById?: string | null;
  assignedByName?: string | null;

  scheduledDate: string;
  scheduledStartTime?: string | null;
  scheduledEndTime?: string | null;
  durationMinutes?: number | null;

  actualStartTime?: string | null;
  actualEndTime?: string | null;

  status: CareServiceStatus;
  priority: ServicePriority;
  locationType: ServiceLocationType;
  assignmentStatus: ServiceAssignmentStatus;

  description: string;
  notes: string;
  locationAddress?: string | null;

  parentScheduleId?: number | null;

  notificationStatus: ServiceNotificationStatus;
  notificationSentAt?: string | null;

  createdById: string;
  createdByName: string;
  updatedById?: string | null;
  updatedByName?: string | null;

  createdAt: string;
  updatedAt?: string | null;

  hasNotification: boolean;
  isUnassigned: boolean;
}

export interface PatientServiceListItemDto {
  id: number;
  careRecipientId: number;
  patientFullName: string;
  patientAvatar?: string | null;

  serviceDefinitionId: number;
  serviceDefinitionTitle: string;
  customServiceName?: string | null;

  performerId?: string | null;
  performerFullName?: string | null;

  scheduledDate: string;
  scheduledStartTime?: string | null;

  status: CareServiceStatus;
  priority: ServicePriority;
  assignmentStatus: ServiceAssignmentStatus;
  notificationStatus: ServiceNotificationStatus;

  createdByName: string;
  createdAt: string;
  updatedAt?: string | null;

  serviceTitle: string;
  isUnassigned: boolean;
  hasNotification: boolean;
}

export interface PatientServiceDetailDto extends PatientServiceDto {
  activityLogs: ServiceActivityLogDto[];
  assignmentHistories: ServiceAssignmentHistoryDto[];
  notifications: ServiceNotificationRecordDto[];
  parentScheduleDetail?: ServiceScheduleDto | null;
}

export interface CreatePatientServiceDto {
  careRecipientId: number;
  serviceDefinitionId: number;
  customServiceName?: string | null;
  performerId?: string | null;

  scheduledDate: string;
  scheduledStartTime?: string | null;
  scheduledEndTime?: string | null;
  durationMinutes?: number | null;

  status?: CareServiceStatus;
  priority?: ServicePriority;
  locationType?: ServiceLocationType;

  description?: string;
  notes?: string;
  locationAddress?: string | null;

  createNotification?: boolean;
  notificationTitle?: string | null;
  notificationMessage?: string | null;
  notificationRecipientType?: ServiceNotificationRecipientType | null;
}

export interface UpdatePatientServiceDto {
  serviceDefinitionId: number;
  customServiceName?: string | null;

  scheduledDate: string;
  scheduledStartTime?: string | null;
  scheduledEndTime?: string | null;
  durationMinutes?: number | null;

  priority: ServicePriority;
  locationType: ServiceLocationType;

  description?: string;
  notes?: string;
  locationAddress?: string | null;
}

export interface AssignServiceProviderDto {
  performerId: string;
  reason?: string | null;
  sendNotification?: boolean;
}

export interface ChangeServiceStatusDto {
  newStatus: CareServiceStatus;
  reason?: string | null;
  notes?: string | null;
}

export interface CreateServiceScheduleDto {
  careRecipientId: number;
  serviceDefinitionId: number;
  customServiceName?: string | null;

  startDate: string;
  startTime: string;
  durationMinutes: number;

  recurrenceType: ServiceRecurrenceType;
  recurrenceInterval?: number | null;
  occurrencesCount?: number | null;
  endDate?: string | null;

  weekDays?: string[] | null;
  dayOfMonth?: number | null;

  priority?: ServicePriority;
  locationType?: ServiceLocationType;
  locationAddress?: string | null;
  description?: string;

  autoAssignAvailable?: boolean;
  createNotifications?: boolean;
}

export interface ServiceScheduleDto {
  id: number;
  careRecipientId: number;
  patientFullName: string;
  serviceDefinitionId: number;
  serviceDefinitionTitle: string;
  customServiceName?: string | null;

  startDate: string;
  startTime: string;
  durationMinutes: number;

  recurrenceType: ServiceRecurrenceType;
  recurrenceInterval?: number | null;
  occurrencesCount?: number | null;
  endDate?: string | null;

  weekDays?: string[] | null;
  dayOfMonth?: number | null;

  priority: ServicePriority;
  locationType: ServiceLocationType;
  locationAddress?: string | null;
  description: string;

  isActive: boolean;
  createdByName: string;
  createdAtUtc: string;
  updatedAtUtc?: string | null;

  generatedServicesCount: number;
}

export interface ServiceActivityLogDto {
  id: number;
  careServiceId: number;
  activityType: ServiceActivityType;
  title: string;
  description: string;
  oldValue?: string | null;
  newValue?: string | null;
  actorUserId?: string | null;
  actorName: string;
  actorRole: string;
  createdAtUtc: string;
}

export interface ServiceAssignmentHistoryDto {
  id: number;
  careServiceId: number;
  previousProviderId?: string | null;
  previousProviderName?: string | null;
  newProviderId?: string | null;
  newProviderName?: string | null;
  reason: string;
  changedById?: string | null;
  changedByName: string;
  changedAtUtc: string;
}

export interface ServiceNotificationRecordDto {
  id: number;
  careServiceId: number;
  title: string;
  message: string;
  recipientType: ServiceNotificationRecipientType;
  recipientUserId?: string | null;
  recipientDisplayName: string;
  channel: ServiceNotificationChannel;
  status: ServiceNotificationStatus;
  scheduledSendAt?: string | null;
  sentAt?: string | null;
  deliveredAt?: string | null;
  readAt?: string | null;
  failedAt?: string | null;
  errorMessage?: string | null;
  createdById?: string | null;
  createdAtUtc: string;
}

export interface CreateServiceNotificationDto {
  careServiceId: number;
  title: string;
  message: string;
  recipientType: ServiceNotificationRecipientType;
  channel?: ServiceNotificationChannel;
  scheduledSendAt?: string | null;
}

export interface PatientServiceQueryFilters {
  searchQuery?: string | null;
  careRecipientId?: number | null;
  serviceDefinitionId?: number | null;
  status?: CareServiceStatus | null;
  statuses?: CareServiceStatus[] | null;
  priority?: ServicePriority | null;
  performerId?: string | null;
  assignmentStatus?: ServiceAssignmentStatus | null;
  onlyUnassigned?: boolean | null;
  notificationStatus?: ServiceNotificationStatus | null;
  onlyWithNotification?: boolean | null;
  fromDate?: string | null;
  toDate?: string | null;
  createdById?: string | null;

  pageNumber?: number;
  pageSize?: number;
  sortBy?: string | null;
  sortDescending?: boolean;
}

export interface PatientServiceStatisticsDto {
  totalServices: number;
  todayServices: number;
  pendingServices: number;
  inProgressServices: number;
  completedServices: number;
  cancelledServices: number;
  noShowServices: number;
  unassignedServices: number;
  servicesWithNotification: number;
  assignedServices: number;
  scheduledServices: number;
  draftServices: number;
  acceptedServices: number;
  expiredServices: number;
}

export interface ProviderAvailabilityDto {
  userId: string;
  fullName: string;
  role: string;
  phoneNumber?: string | null;
  isOnline: boolean;
  todayServicesCount: number;
  inProgressServicesCount: number;
  dailyCapacity: number;
  workloadPercentage: number;
  coverageArea?: string | null;
  hasConflict: boolean;
  conflictDescription?: string | null;
}

export interface BulkServiceActionDto {
  serviceIds: number[];
  performerId?: string | null;
  newStatus?: CareServiceStatus | null;
  newScheduledDate?: string | null;
  newScheduledTime?: string | null;
  notificationTitle?: string | null;
  notificationMessage?: string | null;
  cancelReason?: string | null;
}

export interface BulkServiceActionResultItem {
  serviceId: number;
  success: boolean;
  message?: string | null;
}

export interface BulkServiceActionResult {
  totalItems: number;
  succeeded: number;
  failed: number;
  results: BulkServiceActionResultItem[];
}

export interface CalendarEventDto {
  id: string;
  serviceId: number;
  title: string;
  start: string;
  end: string;
  status: CareServiceStatus;
  priority: ServicePriority;
  color: string;
  textColor: string;
  patientFullName: string;
  patientAvatar?: string | null;
  performerFullName?: string | null;
  locationType: ServiceLocationType;
  allDay: boolean;
}
