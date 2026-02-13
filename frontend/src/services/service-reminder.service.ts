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
    getAll: async (patientId?: number): Promise<ServiceReminder[]> => {
        const url = patientId ? `/ServiceReminders/${patientId}` : '/ServiceReminders/my-reminders'; // Assuming backend supports my-reminders or similar
        // Since backend might not have 'my-reminders' yet, we might need to handle it in frontend or add backend endpoint.
        // For now, if no patientId, we might need to fetch all patients and then their reminders, OR user nursePortalService logic.
        // Actually, let's keep it simple: if patientId is provided use it.
        // If not, we need a way to get ALL reminders for the nurse.
        // Let's assume for now we will handle the "all" logic in the component by iterating patients if backend doesn't support it directly, 
        // OR add a new method here if we had a backend endpoint.
        // But wait, the backend controller:
        // [HttpGet("{patientId}")] public async Task<ActionResult<List<ServiceReminderDto>>> GetByPatient(int patientId)
        // It does NOT have a "Get All My Reminders" endpoint.
        // I should probably add one to backend or fetch per patient in frontend.
        // Fetching per patient in frontend is easier for now to avoid backend changes if not requested, but "my-reminders" is better.
        // Let's check ServiceRemindersController.cs again.
        const response = await axios.get(`/ServiceReminders/${patientId}`);
        return response.data;
    },

    create: async (data: CreateServiceReminderDto): Promise<void> => {
        await axios.post('/ServiceReminders', data);
    },

    update: async (id: number, data: any): Promise<void> => {
        await axios.put(`/ServiceReminders/${id}`, data);
    },

    delete: async (id: number): Promise<void> => {
        await axios.delete(`/ServiceReminders/${id}`);
    }
};