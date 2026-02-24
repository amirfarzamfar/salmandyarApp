import { UserEvaluation, CreateUserEvaluation, UserEvaluationSummary, AssessmentType, UserEvaluationForm, CreateUserEvaluationFormDto } from '@/types/user-evaluation';
import api from '@/lib/axios';

export const userEvaluationService = {
    // Assignments
    async assignEvaluation(data: CreateUserEvaluation): Promise<UserEvaluation> {
        const response = await api.post<UserEvaluation>('/admin/user-evaluation-assignments', data);
        return response.data;
    },

    async getUserEvaluations(userId: string): Promise<UserEvaluation[]> {
        const response = await api.get<UserEvaluation[]>(`/admin/user-evaluation-assignments/user/${userId}`);
        return response.data;
    },

    async getUserSummaries(role?: string, isActive?: boolean): Promise<UserEvaluationSummary[]> {
        const params = new URLSearchParams();
        if (role) params.append('role', role);
        if (isActive !== undefined) params.append('isActive', isActive.toString());
        
        const response = await api.get<any[]>(`/admin/user-evaluation-assignments/summaries?${params.toString()}`);
        
        return response.data.map(item => ({
            userId: item.userId,
            fullName: item.fullName,
            role: item.role,
            isActive: item.isActive,
            totalEvaluations: item.totalAssigned,
            completed: item.completed,
            pending: item.pending,
            overdue: item.overdue
        }));
    },

    async getEvaluationById(id: number): Promise<UserEvaluation> {
        const response = await api.get<UserEvaluation>(`/admin/user-evaluation-assignments/${id}`);
        return response.data;
    },

    async getAvailableEvaluations(type: AssessmentType): Promise<UserEvaluationForm[]> {
        const response = await api.get<UserEvaluationForm[]>('/UserEvaluations/available', { params: { type } });
        return response.data;
    },

    async getFormById(id: number): Promise<UserEvaluationForm> {
        const response = await api.get<UserEvaluationForm>(`/UserEvaluations/forms/details/${id}`);
        return response.data;
    },

    async submitEvaluation(data: any): Promise<any> { // Using any for simplicity as DTOs match
        const response = await api.post('/UserEvaluations/submit', data);
        return response.data;
    },

    // Forms
    async getAllForms(): Promise<UserEvaluationForm[]> {
        const response = await api.get<UserEvaluationForm[]>('/UserEvaluations/forms');
        return response.data;
    },

    async getFormById(id: number): Promise<UserEvaluationForm> {
        const response = await api.get<UserEvaluationForm>(`/UserEvaluations/forms/details/${id}`);
        return response.data;
    },

    async createForm(data: CreateUserEvaluationFormDto): Promise<UserEvaluationForm> {
        const response = await api.post<UserEvaluationForm>('/UserEvaluations/forms', data);
        return response.data;
    },

    async updateForm(id: number, data: CreateUserEvaluationFormDto): Promise<UserEvaluationForm> {
        const response = await api.put<UserEvaluationForm>(`/UserEvaluations/forms/${id}`, data);
        return response.data;
    },

    async deleteForm(id: number): Promise<void> {
        await api.delete(`/UserEvaluations/forms/${id}`);
    },

    async toggleForm(id: number): Promise<void> {
        await api.patch(`/UserEvaluations/forms/${id}/toggle`);
    },
    
    async getActiveForm(type: AssessmentType): Promise<UserEvaluationForm> {
        const response = await api.get<UserEvaluationForm>(`/UserEvaluations/forms/${type}`);
        return response.data;
    },

    async getFormsByType(type: AssessmentType): Promise<UserEvaluationForm[]> {
        const response = await api.get<UserEvaluationForm[]>(`/UserEvaluations/forms/list/${type}`);
        return response.data;
    }
};
