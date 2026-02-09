import { authService } from './auth.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
        const response = await fetch(`${API_URL}/notifications?unreadOnly=${unreadOnly}`, {
            headers: {
                'Authorization': `Bearer ${authService.getToken()}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch notifications');
        return response.json();
    },

    async getUnreadCount(): Promise<number> {
        const response = await fetch(`${API_URL}/notifications/unread-count`, {
            headers: {
                'Authorization': `Bearer ${authService.getToken()}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch unread count');
        return response.json();
    },

    async markAsRead(id: number): Promise<void> {
        const response = await fetch(`${API_URL}/notifications/${id}/read`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authService.getToken()}`
            }
        });
        if (!response.ok) throw new Error('Failed to mark notification as read');
    }
};
