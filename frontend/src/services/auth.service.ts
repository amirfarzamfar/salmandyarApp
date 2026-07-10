import api from '@/lib/axios';
import { LoginRequest, RegisterRequest, AuthResponse, ChangePasswordRequest, ForgotPasswordRequest, ResetPasswordRequest, OtpLoginRequest, OtpLoginVerifyRequest } from '@/types/auth';
import { clearAuthSession, getStoredToken } from '@/lib/auth-session';

export const authService = {
  login: async (data: LoginRequest) => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },
  requestOtpLogin: async (data: OtpLoginRequest) => {
    const response = await api.post<{ message: string }>('/auth/login-otp/request', data);
    return response.data;
  },
  verifyOtpLogin: async (data: OtpLoginVerifyRequest) => {
    const response = await api.post<AuthResponse>('/auth/login-otp/verify', data);
    return response.data;
  },
  register: async (data: RegisterRequest) => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },
  changePassword: async (data: ChangePasswordRequest) => {
    const response = await api.post('/auth/change-password', data);
    return response.data;
  },
  forgotPassword: async (data: ForgotPasswordRequest) => {
    const response = await api.post('/auth/forgot-password', data);
    return response.data;
  },
  resetPassword: async (data: ResetPasswordRequest) => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },
  updateProfile: async (data: { firstName: string; lastName: string; email: string; phoneNumber: string }) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      clearAuthSession('logout');
    }
  },
  getToken: () => {
    return getStoredToken();
  },
};
