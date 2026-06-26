import axios from '@/lib/axios';

export type NotificationDeliveryChannel = 0 | 1 | 2;
export type NotificationDeliveryStatus = 0 | 1 | 2;

export interface NotificationEventConfiguration {
    eventKey: string;
    displayName: string;
    description: string;
    isEnabled: boolean;
    sendInApp: boolean;
    sendSms: boolean;
    sendEmail: boolean;
    recipientRoles: string[];
    additionalEmails: string[];
    additionalPhones: string[];
    inAppTitleTemplate: string;
    inAppBodyTemplate: string;
    smsTemplate: string;
    emailSubjectTemplate: string;
    emailBodyTemplate: string;
}

export interface NotificationSettings {
    emailEnabled: boolean;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpUseSsl: boolean;
    emailFromAddress: string;
    emailFromName: string;
    emailReplyTo: string;
    emailTimeoutSeconds: number;
    smtpPasswordConfigured: boolean;

    smsEnabled: boolean;
    smsProvider: string;
    smsBaseUrl: string;
    smsUsername: string;
    smsApiKey: string;
    smsSenderNumber: string;
    smsSandboxMode: boolean;
    smsPasswordConfigured: boolean;
    smsApiSecretConfigured: boolean;

    updatedAt: string;
    eventConfigurations: NotificationEventConfiguration[];
}

export interface UpdateNotificationSettingsDto extends NotificationSettings {
    smtpPassword?: string;
    clearSmtpPassword?: boolean;
    smsPassword?: string;
    clearSmsPassword?: boolean;
    smsApiSecret?: string;
    clearSmsApiSecret?: boolean;
}

export interface NotificationDeliveryLog {
    id: number;
    createdAtUtc: string;
    eventKey: string;
    eventDisplayName: string;
    channel: NotificationDeliveryChannel;
    status: NotificationDeliveryStatus;
    provider: string;
    recipient: string;
    subject?: string;
    message: string;
    errorMessage?: string;
    patientId?: number;
    referenceId?: string;
    severity?: string;
    link?: string;
}

export interface NotificationTestMessageDto {
    destination: string;
    subject?: string;
    message: string;
}

export interface NotificationResolvedRecipient {
    userId: string;
    displayName: string;
    phoneNumber?: string;
    email?: string;
}

export const notificationSettingsService = {
    get: async (): Promise<NotificationSettings> => {
        const response = await axios.get('/admin/notification-settings');
        return response.data;
    },

    update: async (data: UpdateNotificationSettingsDto): Promise<NotificationSettings> => {
        const response = await axios.put('/admin/notification-settings', data);
        return response.data;
    },

    getLogs: async (take: number = 200): Promise<NotificationDeliveryLog[]> => {
        const response = await axios.get(`/admin/notification-settings/logs?take=${take}`);
        return response.data;
    },

    getResolvedRecipients: async (eventKey: string): Promise<NotificationResolvedRecipient[]> => {
        const response = await axios.get(`/admin/notification-settings/${eventKey}/recipients`);
        return response.data;
    },

    sendTestEmail: async (data: NotificationTestMessageDto): Promise<void> => {
        await axios.post('/admin/notification-settings/test-email', data);
    },

    sendTestSms: async (data: NotificationTestMessageDto): Promise<void> => {
        await axios.post('/admin/notification-settings/test-sms', data);
    }
};
