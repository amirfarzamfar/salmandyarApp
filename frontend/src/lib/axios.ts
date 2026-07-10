import axios from 'axios';
import { getApiBaseUrl } from '@/lib/network';
import { clearAuthSession, getStoredToken } from '@/lib/auth-session';

const protectedPrefixes = ['/dashboard', '/nurse-portal', '/portal'];

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        clearAuthSession('expired');
        const isProtectedPage = protectedPrefixes.some((prefix) => window.location.pathname === prefix || window.location.pathname.startsWith(`${prefix}/`));
        if (isProtectedPage && window.location.pathname !== '/login') {
          window.location.replace('/login');
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
