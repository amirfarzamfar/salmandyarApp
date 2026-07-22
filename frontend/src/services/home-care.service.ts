import api from '@/lib/axios';
import {
  CreateHomeCareRequestDto,
  HomeCareDraft,
  HomeCareMessage,
  HomeCareMessageType,
  HomeCareRequestDetails,
  HomeCareRequestListItem,
  SaveHomeCareDraftDto,
} from '@/types/home-care';

export const homeCareService = {
  saveDraft: async (data: SaveHomeCareDraftDto) => {
    const response = await api.post<HomeCareDraft>('/home-care/drafts', data);
    return response.data;
  },

  submitRequest: async (data: CreateHomeCareRequestDto) => {
    const response = await api.post<HomeCareRequestDetails>('/home-care/requests', data);
    return response.data;
  },

  getMyRequests: async () => {
    const response = await api.get<HomeCareRequestListItem[]>('/home-care/requests/mine');
    return response.data;
  },

  getAllRequests: async () => {
    const response = await api.get<HomeCareRequestListItem[]>('/home-care/requests');
    return response.data;
  },

  getRequestById: async (requestId: string) => {
    const response = await api.get<HomeCareRequestDetails>(`/home-care/requests/${requestId}`);
    return response.data;
  },

  uploadAttachments: async (requestId: string, category: string, files: File[]) => {
    const formData = new FormData();
    formData.append('category', category);
    files.forEach((file) => formData.append('files', file));

    const response = await api.post<HomeCareRequestDetails>(`/home-care/requests/${requestId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  sendMessage: async (conversationId: string, content: string, messageType: HomeCareMessageType, files?: File[]) => {
    const formData = new FormData();
    formData.append('conversationId', conversationId);
    formData.append('messageType', String(messageType));
    formData.append('content', content);
    files?.forEach((file) => formData.append('files', file));

    const response = await api.post<HomeCareMessage>('/home-care/messages', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  updateStatus: async (
    requestId: string,
    data: {
      status: number;
      note?: string;
      estimatedContactAt?: string;
      assignedSupervisorId?: string;
      assignedCaregiverId?: string;
    }
  ) => {
    const response = await api.patch<HomeCareRequestDetails>(`/home-care/requests/${requestId}/status`, data);
    return response.data;
  },
};
