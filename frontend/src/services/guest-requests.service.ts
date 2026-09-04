import api from '@/lib/axios';
import {
  AddGuestServiceRequestNoteDto,
  AssignGuestServiceRequestCaregiverDto,
  AssignGuestServiceRequestSupervisorDto,
  ConvertGuestServiceRequestToPatientDto,
  CreateGuestContactLogDto,
  CreateGuestFollowUpDto,
  CreateGuestServiceRequestDto,
  DuplicatePatientCandidate,
  GuestContactLog,
  GuestFollowUp,
  GuestRequestDashboardStats,
  GuestRequestQueryParams,
  GuestServiceRequestDetails,
  GuestServiceRequestListItem,
  PagedResponse,
  RejectGuestRequestDto,
  SendGuestServiceRequestSmsDto,
  SmsTemplate,
  UpdateGuestFollowUpDto,
  UpdateGuestServiceRequestPriorityDto,
  UpdateGuestServiceRequestStatusDto,
} from '@/types/guest-request';

export const guestRequestsService = {
  submit: async (data: CreateGuestServiceRequestDto) => {
    const traceId = `guest-request-api-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    // #region debug-point D:guest-request-api-start
    fetch("http://127.0.0.1:7777/event",{method:"POST",body:JSON.stringify({sessionId:"guest-request-submit-error",runId:"pre",hypothesisId:"D",location:"guest-requests.service.ts:submit",msg:"[DEBUG] POST /public/guest-requests start",data:{traceId,url:"/public/guest-requests",formId:(data as any)?.formId,answersCount:Array.isArray((data as any)?.answers)?(data as any).answers.length:undefined,hasSummaryJson:typeof (data as any)?.summaryJson==="string",summaryLen:typeof (data as any)?.summaryJson==="string"?(data as any).summaryJson.length:undefined},ts:Date.now()})}).catch(()=>{});
    // #endregion
    try {
      const response = await api.post<GuestServiceRequestDetails>('/public/guest-requests', data);
      // #region debug-point E:guest-request-api-success
      fetch("http://127.0.0.1:7777/event",{method:"POST",body:JSON.stringify({sessionId:"guest-request-submit-error",runId:"pre",hypothesisId:"E",location:"guest-requests.service.ts:submit",msg:"[DEBUG] POST /public/guest-requests success",data:{traceId,status:(response as any)?.status,trackingCode:(response as any)?.data?.trackingCode},ts:Date.now()})}).catch(()=>{});
      // #endregion
      return response.data;
    } catch (error: any) {
      // #region debug-point E:guest-request-api-error
      fetch("http://127.0.0.1:7777/event",{method:"POST",body:JSON.stringify({sessionId:"guest-request-submit-error",runId:"pre",hypothesisId:"E",location:"guest-requests.service.ts:submit",msg:"[DEBUG] POST /public/guest-requests error",data:{traceId,errorName:error?.name,errorMessage:error?.message,status:error?.response?.status,url:error?.config?.url,method:error?.config?.method,baseURL:error?.config?.baseURL,resp:error?.response?.data},ts:Date.now()})}).catch(()=>{});
      // #endregion
      throw error;
    }
  },

  getStats: async () => {
    const response = await api.get<GuestRequestDashboardStats>('/admin/guest-requests/stats');
    return response.data;
  },

  getAll: async () => {
    const response = await api.get<GuestServiceRequestListItem[]>('/admin/guest-requests');
    return response.data;
  },

  getPaged: async (params: GuestRequestQueryParams = {}) => {
    const response = await api.get<PagedResponse<GuestServiceRequestListItem>>('/admin/guest-requests/paged', { params });
    return response.data;
  },

  getSmsTemplates: async () => {
    const response = await api.get<SmsTemplate[]>('/admin/guest-requests/sms-templates');
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

  updatePriority: async (id: string, data: UpdateGuestServiceRequestPriorityDto) => {
    const response = await api.patch<GuestServiceRequestDetails>(`/admin/guest-requests/${id}/priority`, data);
    return response.data;
  },

  assignSupervisor: async (id: string, data: AssignGuestServiceRequestSupervisorDto) => {
    const response = await api.patch<GuestServiceRequestDetails>(`/admin/guest-requests/${id}/assign-supervisor`, data);
    return response.data;
  },

  assignCaregiver: async (id: string, data: AssignGuestServiceRequestCaregiverDto) => {
    const response = await api.patch<GuestServiceRequestDetails>(`/admin/guest-requests/${id}/assign-caregiver`, data);
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

  getContactLogs: async (id: string) => {
    const response = await api.get<GuestContactLog[]>(`/admin/guest-requests/${id}/contact-logs`);
    return response.data;
  },

  createContactLog: async (id: string, data: CreateGuestContactLogDto) => {
    const response = await api.post<GuestServiceRequestDetails>(`/admin/guest-requests/${id}/contact-logs`, data);
    return response.data;
  },

  getFollowUps: async (id: string) => {
    const response = await api.get<GuestFollowUp[]>(`/admin/guest-requests/${id}/follow-ups`);
    return response.data;
  },

  createFollowUp: async (id: string, data: CreateGuestFollowUpDto) => {
    const response = await api.post<GuestServiceRequestDetails>(`/admin/guest-requests/${id}/follow-ups`, data);
    return response.data;
  },

  updateFollowUp: async (followUpId: string, data: UpdateGuestFollowUpDto) => {
    const response = await api.patch<GuestFollowUp>(`/admin/guest-requests/follow-ups/${followUpId}`, data);
    return response.data;
  },

  searchDuplicatePatients: async (id: string) => {
    const response = await api.get<DuplicatePatientCandidate[]>(`/admin/guest-requests/${id}/duplicate-patients`);
    return response.data;
  },

  convertToPatient: async (id: string, data: ConvertGuestServiceRequestToPatientDto) => {
    const response = await api.post<GuestServiceRequestDetails>(`/admin/guest-requests/${id}/convert-to-patient`, data);
    return response.data;
  },

  reject: async (id: string, data: RejectGuestRequestDto) => {
    const response = await api.post<GuestServiceRequestDetails>(`/admin/guest-requests/${id}/reject`, data);
    return response.data;
  },
};
