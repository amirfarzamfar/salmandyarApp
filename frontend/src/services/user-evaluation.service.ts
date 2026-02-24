import { UserEvaluation, CreateUserEvaluation, UserEvaluationSummary, AssessmentType } from '@/types/user-evaluation';
import api from '@/lib/axios';

export const userEvaluationService = {
    async assignEvaluation(data: CreateUserEvaluation): Promise<UserEvaluation> {
        const response = await api.post<UserEvaluation>('/admin/assignments', data);
        return response.data;
    },

    async getUserEvaluations(userId: string): Promise<UserEvaluation[]> {
        const response = await api.get<UserEvaluation[]>(`/admin/assignments/user/${userId}`);
        // Filter out Exams on frontend if backend returns mixed types
        // Although we updated backend DTO to include FormType, the GetUserAssignments endpoint might not filter.
        // But since we want "User Evaluation Management" to NOT show Exams, we filter here.
        return response.data.filter(e => e.formType !== AssessmentType.Exam);
    },

    async getUserSummaries(role?: string, isActive?: boolean): Promise<UserEvaluationSummary[]> {
        const params = new URLSearchParams();
        if (role) params.append('role', role);
        if (isActive !== undefined) params.append('isActive', isActive.toString());
        
        // Use the new excludeExams parameter
        params.append('excludeExams', 'true');

        const response = await api.get<any[]>(`/admin/assignments/summaries?${params.toString()}`);
        
        // Map backend DTO (UserAssessmentSummaryDto) to UserEvaluationSummary
        // Backend DTO: TotalAssigned -> Frontend: totalEvaluations
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
        const response = await api.get<UserEvaluation>(`/admin/assignments/${id}`);
        return response.data;
    }
};
