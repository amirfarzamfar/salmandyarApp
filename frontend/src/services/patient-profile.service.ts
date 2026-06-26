import api from '@/lib/axios';

// #region debug-point C:profile-service
const reportPatientProfileDebug = (hypothesisId: string, msg: string, data?: unknown) =>
  fetch('http://127.0.0.1:7778/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: 'profile-edit-403',
      runId: 'pre-fix',
      hypothesisId,
      location: 'patient-profile.service.ts',
      msg: `[DEBUG] ${msg}`,
      data,
      ts: Date.now(),
    }),
  }).catch(() => {});
// #endregion

export interface PatientProfileDto {
  id?: number;
  userId?: string;
  nationalCode?: string;
  gender?: string;
  dateOfBirth?: string;
  fatherName?: string;
  maritalStatus?: string;
  nationality?: string;
  profileImageUrl?: string;
  mobileNumber?: string;
  height?: number;
  weight?: number;
  bloodGroup?: string;
  mobilityStatus?: string;
  usesWheelchair?: boolean;
  usesWalker?: boolean;
  walkingAbility?: string;
  attendingPhysician?: string;
  physicianPhone?: string;
  previousHospital?: string;
  hospitalizationHistory?: string;
  surgeryHistory?: string;
  hasHomeOxygen?: boolean;
  hasVentilator?: boolean;
  hasTracheostomy?: boolean;
  hasPEG?: boolean;
  hasUrinaryCatheter?: boolean;
  hasBedsore?: boolean;
  neededHomeMedicalEquipment?: string[];
  availableHomeMedicalEquipment?: string[];
  otherNeededHomeMedicalEquipment?: string;
  otherAvailableHomeMedicalEquipment?: string;
  dynamicAnswersJson?: string;
  completionPercentage?: number;
  currentStep?: number;
  isCompleted?: boolean;
  lastUpdatedAt?: string;
  lastUpdatedByName?: string;
  
  address?: AddressDto;
  emergencyContact?: EmergencyContactDto;
  medicalHistory?: MedicalHistoryDto;
  elderlyAssessment?: ElderlyAssessmentDto;
  allergies?: AllergyDto[];
  documents?: UploadedDocumentDto[];
}

export interface AddressDto {
  state?: string;
  city?: string;
  fullAddress?: string;
  postalCode?: string;
}

export interface EmergencyContactDto {
  name?: string;
  phoneNumber?: string;
  relationship?: string;
}

export interface MedicalHistoryDto {
  hasDiabetes?: boolean;
  hasHypertension?: boolean;
  hasHeartDisease?: boolean;
  hasCOPD?: boolean;
  hasAsthma?: boolean;
  hasKidneyFailure?: boolean;
  hasStroke?: boolean;
  hasAlzheimers?: boolean;
  hasParkinsons?: boolean;
  hasCancer?: boolean;
  hasPsychiatricDisorders?: boolean;
  otherDiseases?: string;
}

export interface AllergyDto {
  id?: number;
  allergyType?: string;
  description?: string;
}

export interface UploadedDocumentDto {
  id?: number;
  documentType?: string;
  fileUrl?: string;
  uploadDate?: string;
}

export interface ElderlyAssessmentDto {
  consciousnessLevel?: string;
  dailyActivityAbility?: string;
  fallRisk?: string;
  swallowingDisorder?: string;
  nutritionStatus?: string;
  hasUrinaryIncontinence?: boolean;
  hasFecalIncontinence?: boolean;
}

export interface ProfileStatus {
  hasProfile: boolean;
  isCompleted: boolean;
  completionPercentage: number;
  currentStep: number;
}

export const PatientProfileService = {
  getMyProfile: async (): Promise<PatientProfileDto> => {
    const response = await api.get('/PatientProfile/me');
    return response.data;
  },
  
  getMyProfileStatus: async (): Promise<ProfileStatus> => {
    const response = await api.get('/PatientProfile/me/status');
    return response.data;
  },

  updateMyProfile: async (data: Partial<PatientProfileDto>): Promise<PatientProfileDto> => {
    void reportPatientProfileDebug('C', 'updateMyProfile request started', {
      hasUserId: Boolean(data.userId),
      currentStep: data.currentStep ?? null,
    });
    try {
      const response = await api.put('/PatientProfile/me', data);
      void reportPatientProfileDebug('C', 'updateMyProfile request succeeded', {
        status: response.status,
      });
      return response.data;
    } catch (error: unknown) {
      void reportPatientProfileDebug('C', 'updateMyProfile request failed', {
        status: typeof error === 'object' && error !== null && 'response' in error
          ? (error as { response?: { status?: number } }).response?.status ?? null
          : null,
        message: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },

  uploadMyDocument: async (documentType: string, file: File): Promise<UploadedDocumentDto> => {
    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('file', file);

    const response = await api.post('/PatientProfile/me/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  completeMyProfile: async (): Promise<PatientProfileDto> => {
    const response = await api.post('/PatientProfile/me/complete');
    return response.data;
  },

  // Admin methods
  getUserProfile: async (userId: string): Promise<PatientProfileDto> => {
    const response = await api.get(`/PatientProfile/user/${userId}`);
    return response.data;
  },
  
  updateUserProfile: async (userId: string, data: Partial<PatientProfileDto>): Promise<PatientProfileDto> => {
    void reportPatientProfileDebug('C', 'updateUserProfile request started', {
      userId,
      payloadUserId: data.userId ?? null,
      currentStep: data.currentStep ?? null,
    });
    try {
      const response = await api.put(`/PatientProfile/user/${userId}`, data);
      void reportPatientProfileDebug('C', 'updateUserProfile request succeeded', {
        userId,
        status: response.status,
      });
      return response.data;
    } catch (error: unknown) {
      void reportPatientProfileDebug('C', 'updateUserProfile request failed', {
        userId,
        payloadUserId: data.userId ?? null,
        status: typeof error === 'object' && error !== null && 'response' in error
          ? (error as { response?: { status?: number; data?: unknown } }).response?.status ?? null
          : null,
        responseData: typeof error === 'object' && error !== null && 'response' in error
          ? (error as { response?: { data?: unknown } }).response?.data ?? null
          : null,
        message: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },

  uploadUserDocument: async (userId: string, documentType: string, file: File): Promise<UploadedDocumentDto> => {
    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('file', file);

    const response = await api.post(`/PatientProfile/user/${userId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};
