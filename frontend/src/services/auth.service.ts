import api from '@/lib/axios';
import { LoginRequest, RegisterRequest, AuthResponse, ChangePasswordRequest } from '@/types/auth';

export const authService = {
  login: async (data: LoginRequest) => {
    const response = await api.post<AuthResponse>('/auth/login', data);
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
  updateProfile: async (data: { firstName: string; lastName: string; email: string; phoneNumber: string }) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  },
  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || sessionStorage.getItem('token');
    }
    return null;
  },
};
