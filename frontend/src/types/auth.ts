export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber: string;
  password: string;
  role: string;
}

export interface AuthResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  token: string;
}
