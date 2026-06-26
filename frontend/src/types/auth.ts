export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface OtpLoginRequest {
  identifier: string;
  channel: 'sms' | 'email';
}

export interface OtpLoginVerifyRequest {
  identifier: string;
  channel: 'sms' | 'email';
  code: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber: string;
  password: string;
  role: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  identifier: string;
}

export interface ResetPasswordRequest {
  identifier: string;
  token: string;
  newPassword: string;
}

export interface AuthResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  token: string;
}
