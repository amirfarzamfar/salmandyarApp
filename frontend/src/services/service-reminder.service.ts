import axios from '@/lib/axios';

export interface ServiceReminder {
    id: number;
    careRecipientId: number;
    serviceDefinitionId: number;
    serviceTitle: string;
    scheduledTime: string;
    note: string;
    isSent: boolean;
    sentAt?: string;
    notifyPatient: boolean;
    notifyAdmin: boolean;
    notifySupervisor: boolean;
}

export interface CreateServiceReminderDto {
    careRecipientId: number;
    serviceDefinitionId: number;
    scheduledTime: string;
    note: string;
    notifyPatient: boolean;
    notifyAdmin: boolean;
    notifySupervisor: boolean;
}

export const serviceReminderService = {
    getAll: async (patientId: number): Promise<ServiceReminder[]> => {
        const response = await axios.get(`/ServiceReminders/${patientId}`);
        return response.data;
    },

    create: async (data: CreateServiceReminderDto): Promise<void> => {
        await axios.post('/ServiceReminders', data);
    },

    delete: async (id: number): Promise<void> => {
        await axios.delete(`/ServiceReminders/${id}`);
    }
};