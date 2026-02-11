import { AssessmentAssignment, CreateAssessmentAssignment, UserAssessmentSummary } from '@/types/assessment-assignment';
import api from '@/lib/axios';

export const assessmentAssignmentService = {
    async assignAssessment(data: CreateAssessmentAssignment): Promise<AssessmentAssignment> {
        const response = await api.post<AssessmentAssignment>('/admin/assignments', data);
        return response.data;
    },

    async getUserAssignments(userId: string): Promise<AssessmentAssignment[]> {
        const response = await api.get<AssessmentAssignment[]>(`/admin/assignments/user/${userId}`);
        return response.data;
    },

    async getUserSummaries(role?: string, isActive?: boolean): Promise<UserAssessmentSummary[]> {
        const params = new URLSearchParams();
        if (role) params.append('role', role);
        if (isActive !== undefined) params.append('isActive', isActive.toString());

        const response = await api.get<UserAssessmentSummary[]>(`/admin/assignments/summaries?${params.toString()}`);
        return response.data;
    },

    async getAssignmentById(id: number): Promise<AssessmentAssignment> {
        const response = await api.get<AssessmentAssignment>(`/admin/assignments/${id}`);
        return response.data;
    },

    async getMyPendingAssignments(): Promise<AssessmentAssignment[]> {
        const response = await api.get<AssessmentAssignment[]>('/admin/assignments/my/pending');
        return response.data;
    }
};
