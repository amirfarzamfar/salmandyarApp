import api from '@/lib/axios';
import {
  AddGuestServiceRequestNoteDto,
  AssignGuestServiceRequestCaregiverDto,
  ConvertGuestServiceRequestToPatientDto,
  CreateGuestServiceRequestDto,
  GuestServiceRequestDetails,
  GuestServiceRequestListItem,
  SendGuestServiceRequestSmsDto,
  UpdateGuestServiceRequestStatusDto,
} from '@/types/guest-request';

export const guestRequestsService = {
  submit: async (data: CreateGuestServiceRequestDto) => {
    const response = await api.post<GuestServiceRequestDetails>('/public/guest-requests', data);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get<GuestServiceRequestListItem[]>('/admin/guest-requests');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<GuestServiceRequestDetails>(`/admin/guest-requests/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, data: UpdateGuestServiceRequestStatusDto) => {
    const response = await api.patch<GuestServiceRequestDetails>(`/admin/guest-requests/${id}/status`, data);
    return response.data;
  },

  addNote: async (id: string, data: AddGuestServiceRequestNoteDto) => {
    const response = await api.post<GuestServiceRequestDetails>(`/admin/guest-requests/${id}/notes`, data);
    return response.data;
  },

  sendSms: async (id: string, data: SendGuestServiceRequestSmsDto) => {
    const response = await api.post<GuestServiceRequestDetails>(`/admin/guest-requests/${id}/sms`, data);
    return response.data;
  },

  convertToPatient: async (id: string, data: ConvertGuestServiceRequestToPatientDto) => {
    const response = await api.post<GuestServiceRequestDetails>(`/admin/guest-requests/${id}/convert-to-patient`, data);
    return response.data;
  },

  assignCaregiver: async (id: string, data: AssignGuestServiceRequestCaregiverDto) => {
    const response = await api.patch<GuestServiceRequestDetails>(`/admin/guest-requests/${id}/assign-caregiver`, data);
    return response.data;
  },
};

