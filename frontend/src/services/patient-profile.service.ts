import api from '@/lib/axios';

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
  dynamicAnswersJson?: string;
  completionPercentage?: number;
  currentStep?: number;
  isCompleted?: boolean;
  lastUpdatedAt?: string;
  
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
    const response = await api.put('/PatientProfile/me', data);
    return response.data;
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
    const response = await api.put(`/PatientProfile/user/${userId}`, data);
    return response.data;
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
