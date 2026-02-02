import axios from '@/lib/axios';

export interface NotificationSettings {
    emailEnabled: boolean;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpUseSsl: boolean;
    
    smsEnabled: boolean;
    smsProvider: string;
    smsApiKey: string;
    smsSenderNumber: string;
}

export interface UpdateNotificationSettingsDto extends NotificationSettings {
    smtpPassword?: string;
}

export const notificationSettingsService = {
    get: async (): Promise<NotificationSettings> => {
        const response = await axios.get('/admin/notification-settings');
        return response.data;
    },

    update: async (data: UpdateNotificationSettingsDto): Promise<NotificationSettings> => {
        const response = await axios.put('/admin/notification-settings', data);
        return response.data;
    }
};