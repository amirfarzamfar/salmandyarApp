'use client';

import { useState, useEffect } from 'react';
import { assessmentAssignmentService } from '@/services/assessment-assignment.service';
import { UserAssessmentSummary, AssessmentAssignment, AssessmentAssignmentStatus } from '@/types/assessment-assignment';
import { AlertTriangle, ChevronLeft, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';

export function DashboardAlert() {
    const [alerts, setAlerts] = useState<AssessmentAssignment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPendingAssignments();
    }, []);

    const fetchPendingAssignments = async () => {
        try {
            // Since we don't have a direct "getMyAssignments" yet, we assume user side fetches similarly
            // Or we use notification service to hint. 
            // BUT for this specific requirement, we should fetch pending assignments.
            // Let's assume we can get user ID from auth or context, but here we'll need an endpoint.
            // Currently existing endpoint is for admin: /admin/assignments/user/{id}
            // We need a user-facing endpoint or reuse admin one if allowed (usually not).
            // Let's stick to the plan: fetch notifications or assignments.
            // Since we don't have a "me/assignments" endpoint yet in my previous steps (I made admin ones),
            // I should update the service to handle "me" or pass ID.
            // However, looking at my plan, I didn't explicitly create a "me" endpoint.
            // I will implement a client-side filter on notifications OR better, add a method to service.
            
            // Wait, I can't easily get my own ID here without decoding token or context.
            // Assuming I have a way, or I'll add a 'me' endpoint.
            // Actually, `notificationService` has `getMyNotifications`.
            // But this alert is about ASSIGNMENTS specifically.
            // Let's try to use the notifications to drive this alert first, 
            // OR use `authService` to get ID and call `getUserAssignments`.
            
            // For now, I'll mock the ID fetching or assume authService has it.
            // Let's just create the component structure and fetch logic placeholder.
            
            // Actually, I can create a new endpoint /api/assignments/my-pending in the controller if needed.
            // But let's check `authService`.
            
            // If I can't get ID easily, I will use notifications to find "Assessment" type notifications that are unread.
            // But user wants "Alert Box... An exam has been assigned".
            // It's better to show actual pending assignments.
            
            // Let's assume I added `getMyAssignments` to `assessmentAssignmentService` which calls an endpoint.
            // I'll add the endpoint in the next step or reuse `GetUserAssignments` with current user ID from token on backend.
            
            // Let's go with fetching assignments using a new service method `getMyPendingAssignments`.
            // I will implement this method in `assessment-assignment.service.ts` which calls `api/assignments/my`.
            // I need to add this endpoint to backend too.
            
            const data = await assessmentAssignmentService.getMyPendingAssignments();
            setAlerts(data);
        } catch (error) {
            console.error('Failed to fetch alerts', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || alerts.length === 0) return null;

    return (
        <div className="space-y-2 mb-6">
            {alerts.map(assignment => (
                <div key={assignment.id} className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/20 rounded-full">
                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div>
                            <h4 className="font-bold text-yellow-500 text-sm">آزمون جدید: {assignment.formTitle}</h4>
                            <div className="flex items-center gap-3 mt-1 text-xs text-yellow-500/80">
                                {assignment.deadline && (
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        مهلت: {new Date(assignment.deadline).toLocaleDateString('fa-IR')}
                                    </span>
                                )}
                                {assignment.startDate && new Date(assignment.startDate) > new Date() && (
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        شروع: {new Date(assignment.startDate).toLocaleDateString('fa-IR')}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <Link 
                        href={`/dashboard/my-assessments`}
                        className="px-4 py-2 bg-yellow-500 text-black text-sm font-bold rounded-md hover:bg-yellow-400 transition-colors flex items-center gap-2"
                    >
                        مشاهده
                        <ChevronLeft className="w-4 h-4" />
                    </Link>
                </div>
            ))}
        </div>
    );
}
