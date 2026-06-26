import axios from '@/lib/axios';

export interface OtpLoginSettings {
  isEnabled: boolean;
  allowSms: boolean;
  allowEmail: boolean;
  codeLength: number;
  codeExpiryMinutes: number;
  resendCooldownSeconds: number;
  maxVerifyAttempts: number;
}

export const otpLoginSettingsService = {
  get: async (): Promise<OtpLoginSettings> => {
    const response = await axios.get('/admin/otp-login-settings');
    return response.data;
  },

  update: async (data: OtpLoginSettings): Promise<OtpLoginSettings> => {
    const response = await axios.put('/admin/otp-login-settings', data);
    return response.data;
  }
};
