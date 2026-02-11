import api from '@/lib/axios';

export enum NotificationType {
    System = 0,
    Assessment = 1,
    Reminder = 2,
    Alert = 3
}

export interface UserNotification {
    id: number;
    userId: string;
    title: string;
    message: string;
    isRead: boolean;
    type: NotificationType;
    referenceId?: string;
    link?: string;
    createdAt: string;
}

export const notificationService = {
    async getMyNotifications(unreadOnly: boolean = false): Promise<UserNotification[]> {
        const response = await api.get<UserNotification[]>(`/notifications?unreadOnly=${unreadOnly}`);
        return response.data;
    },

    async getUnreadCount(): Promise<number> {
        const response = await api.get<number>('/notifications/unread-count');
        return response.data;
    },

    async markAsRead(id: number): Promise<void> {
        await api.post(`/notifications/${id}/read`);
    }
};
