import { AssessmentAssignment, CreateAssessmentAssignment, UserAssessmentSummary } from '@/types/assessment-assignment';
import { authService } from './auth.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const assessmentAssignmentService = {
    async assignAssessment(data: CreateAssessmentAssignment): Promise<AssessmentAssignment> {
        const response = await fetch(`${API_URL}/admin/assignments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authService.getToken()}`
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to assign assessment');
        return response.json();
    },

    async getUserAssignments(userId: string): Promise<AssessmentAssignment[]> {
        const response = await fetch(`${API_URL}/admin/assignments/user/${userId}`, {
            headers: {
                'Authorization': `Bearer ${authService.getToken()}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch user assignments');
        return response.json();
    },

    async getUserSummaries(role?: string, isActive?: boolean): Promise<UserAssessmentSummary[]> {
        const params = new URLSearchParams();
        if (role) params.append('role', role);
        if (isActive !== undefined) params.append('isActive', isActive.toString());

        const response = await fetch(`${API_URL}/admin/assignments/summaries?${params.toString()}`, {
            headers: {
                'Authorization': `Bearer ${authService.getToken()}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch user summaries');
        return response.json();
    },

    async getAssignmentById(id: number): Promise<AssessmentAssignment> {
        const response = await fetch(`${API_URL}/admin/assignments/${id}`, {
            headers: {
                'Authorization': `Bearer ${authService.getToken()}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch assignment details');
        return response.json();
    }
};
