import api from '@/lib/axios';
import { NotificationType } from './notification.service';

export enum CaregiverEmploymentApprovalStatus {
  Draft = 1,
  PendingReview = 2,
  UnderReview = 3,
  Approved = 4,
  NeedsCorrection = 5,
  Rejected = 6,
}

export enum CaregiverProfileDocumentStatus {
  PendingReview = 1,
  Approved = 2,
  NeedsCorrection = 3,
  Rejected = 4,
}

export interface CoverageAreaDto {
  province: string;
  city: string;
}

export interface CourseCertificateDto {
  title: string;
  organizer: string;
  date?: string;
  fileUrl?: string;
}

export interface CaregiverProfileDocumentDto {
  id: number;
  documentType: string;
  fileUrl: string;
  fileName: string;
  mimeType?: string;
  uploadedAt: string;
  status: CaregiverProfileDocumentStatus;
  statusLabel: string;
  reviewNote?: string;
  reviewedAt?: string;
  reviewedByName?: string;
  expireAt?: string;
}

export interface CaregiverAuditLogDto {
  id: number;
  action: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
  performedBy: string;
}

export interface CaregiverProfileDto {
  id?: number;
  userId: string;
  registeredRole?: string;
  firstName?: string;
  lastName?: string;
  fatherName?: string;
  nationalCode?: string;
  birthCertificateNumber?: string;
  dateOfBirth?: string;
  birthPlace?: string;
  gender?: string;
  maritalStatus?: string;
  childrenCount?: number;
  nationality?: string;
  personalPhotoUrl?: string;
  mobileNumber?: string;
  landlinePhone?: string;
  email?: string;
  fullAddress?: string;
  province?: string;
  city?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  cooperationType?: string;
  nursingSystemNumber?: string;
  experienceYears?: number;
  lastWorkplace?: string;
  currentEmploymentStatus?: string;
  shiftPreferences: string[];
  canStayAtPatientHome: boolean;
  vehicleType?: string;
  hasDrivingLicense: boolean;
  serviceRadiusKm?: number;
  serviceAreas: CoverageAreaDto[];
  skills: string[];
  customSkills: string[];
  latestDegree?: string;
  major?: string;
  university?: string;
  graduationYear?: number;
  gpa?: number;
  certificates: CourseCertificateDto[];
  bankName?: string;
  accountNumber?: string;
  cardNumber?: string;
  iban?: string;
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactMobile?: string;
  emergencyContactPhone?: string;
  emergencyContactAddress?: string;
  acceptCollaborationTerms: boolean;
  acceptPatientConfidentiality: boolean;
  acceptProfessionalEthics: boolean;
  acceptDocumentReviewConsent: boolean;
  completionPercentage: number;
  currentStep: number;
  isCompleted: boolean;
  employmentStatus: CaregiverEmploymentApprovalStatus;
  employmentStatusLabel: string;
  reviewNote?: string;
  forceCompletedByAdmin: boolean;
  createdAt: string;
  submittedAt?: string;
  lastUpdatedAt?: string;
  lastUpdatedByName?: string;
  reviewedAt?: string;
  reviewedByName?: string;
  documents: CaregiverProfileDocumentDto[];
  auditLogs: CaregiverAuditLogDto[];
}

export interface UpdateCaregiverProfileDto extends Partial<Omit<CaregiverProfileDto, 'documents' | 'auditLogs' | 'employmentStatusLabel' | 'reviewedByName' | 'lastUpdatedByName' | 'createdAt' | 'submittedAt' | 'reviewedAt'>> {
  currentStep?: number;
}

export interface CaregiverProfileStatusDto {
  hasProfile: boolean;
  isCompleted: boolean;
  completionPercentage: number;
  currentStep: number;
  employmentStatus: CaregiverEmploymentApprovalStatus;
  employmentStatusLabel: string;
  pendingDocuments: number;
  approvedDocuments: number;
  needsCorrectionDocuments: number;
  rejectedDocuments: number;
  uploadedDocuments: number;
  reviewNote?: string;
}

export interface CaregiverDashboardDto {
  profileCompletionPercentage: number;
  documentVerificationStatus: string;
  employmentStatus: string;
  performanceScore: number;
  shiftCount: number;
  lastActivityAt?: string;
}

export interface UpdateCaregiverDocumentStatusDto {
  status: CaregiverProfileDocumentStatus;
  reviewNote?: string;
  expireAt?: string;
}

export const CAREGIVER_DOCUMENT_TYPES = [
  { id: 'NationalCardFront', label: 'کارت ملی - رو', required: true },
  { id: 'NationalCardBack', label: 'کارت ملی - پشت', required: true },
  { id: 'BirthCertificate', label: 'شناسنامه کامل', required: true },
  { id: 'ProfilePhoto', label: 'عکس پرسنلی', required: true },
  { id: 'EducationDegree', label: 'مدرک تحصیلی', required: true },
  { id: 'Resume', label: 'رزومه', required: true },
  { id: 'WorkHistory', label: 'سابقه کار', required: true },
  { id: 'CPR', label: 'گواهی CPR', required: true },
  { id: 'HealthCertificate', label: 'گواهی سلامت', required: true },
  { id: 'NoCriminalRecord', label: 'سوء پیشینه', required: true },
  { id: 'NoAddiction', label: 'عدم اعتیاد', required: true },
  { id: 'Insurance', label: 'بیمه', required: false },
  { id: 'ReferralLetter', label: 'معرفی‌نامه', required: false },
  { id: 'DigitalSignature', label: 'امضا دیجیتال', required: true },
] as const;

export const CAREGIVER_DOCUMENT_ACCEPT = '.pdf,.jpg,.jpeg,.png,.webp,.doc,.docx';

export const caregiverProfileService = {
  async getMyProfile() {
    const response = await api.get<CaregiverProfileDto>('/CaregiverProfiles/me');
    return response.data;
  },

  async getMyStatus() {
    const response = await api.get<CaregiverProfileStatusDto>('/CaregiverProfiles/me/status');
    return response.data;
  },

  async getMyDashboard() {
    const response = await api.get<CaregiverDashboardDto>('/CaregiverProfiles/me/dashboard');
    return response.data;
  },

  async updateMyProfile(payload: UpdateCaregiverProfileDto) {
    const response = await api.put<CaregiverProfileDto>('/CaregiverProfiles/me', payload);
    return response.data;
  },

  async completeMyProfile() {
    const response = await api.post<CaregiverProfileDto>('/CaregiverProfiles/me/complete');
    return response.data;
  },

  async uploadMyDocument(documentType: string, file: File) {
    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('file', file);

    const response = await api.post<CaregiverProfileDocumentDto>('/CaregiverProfiles/me/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async getUserProfile(userId: string) {
    const response = await api.get<CaregiverProfileDto>(`/CaregiverProfiles/user/${userId}`);
    return response.data;
  },

  async getUserStatus(userId: string) {
    const response = await api.get<CaregiverProfileStatusDto>(`/CaregiverProfiles/user/${userId}/status`);
    return response.data;
  },

  async updateUserProfile(userId: string, payload: UpdateCaregiverProfileDto) {
    const response = await api.put<CaregiverProfileDto>(`/CaregiverProfiles/user/${userId}`, payload);
    return response.data;
  },

  async forceCompleteUserProfile(userId: string) {
    const response = await api.post<CaregiverProfileDto>(`/CaregiverProfiles/user/${userId}/complete`);
    return response.data;
  },

  async uploadUserDocument(userId: string, documentType: string, file: File) {
    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('file', file);

    const response = await api.post<CaregiverProfileDocumentDto>(`/CaregiverProfiles/user/${userId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async updateDocumentStatus(userId: string, documentId: number, payload: UpdateCaregiverDocumentStatusDto) {
    const response = await api.patch<CaregiverProfileDocumentDto>(`/CaregiverProfiles/user/${userId}/documents/${documentId}/status`, payload);
    return response.data;
  },
};

export const caregiverProfileRealtimeEvent = {
  type: NotificationType.System,
};
