'use client';

import { useState, useEffect } from 'react';
import { assessmentAssignmentService } from '@/services/assessment-assignment.service';
import { AssessmentAssignment, AssessmentAssignmentStatus } from '@/types/assessment-assignment';
import { Clock, Calendar, CheckCircle, AlertCircle, PlayCircle, Eye, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function MyAssessmentsList() {
    const [assignments, setAssignments] = useState<AssessmentAssignment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            const data = await assessmentAssignmentService.getMyPendingAssignments();
            setAssignments(data);
        } catch (error) {
            toast.error('خطا در دریافت لیست آزمون‌ها');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: AssessmentAssignmentStatus) => {
        switch (status) {
            case AssessmentAssignmentStatus.Pending:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">انجام نشده</span>;
            case AssessmentAssignmentStatus.InProgress:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">در حال انجام</span>;
            case AssessmentAssignmentStatus.Completed:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">تکمیل شده</span>;
            case AssessmentAssignmentStatus.Expired:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">منقضی شده</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">نامشخص</span>;
        }
    };

    const isStartable = (assignment: AssessmentAssignment) => {
        if (assignment.status === AssessmentAssignmentStatus.Completed || assignment.status === AssessmentAssignmentStatus.Expired) return false;
        if (assignment.startDate && new Date(assignment.startDate) > new Date()) return false;
        return true;
    };

    if (loading) {
        return <div className="text-center py-10 text-slate-500">در حال بارگذاری آزمون‌ها...</div>;
    }

    if (assignments.length === 0) {
        return (
            <div className="text-center py-16 bg-white rounded-lg border border-slate-200 shadow-sm">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-700">همه چیز مرتب است!</h3>
                <p className="text-slate-500 mt-2">هیچ آزمون فعالی برای انجام دادن ندارید.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {assignments.map((assignment) => (
                <div key={assignment.id} className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                    <div className="p-5">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-lg text-slate-800 line-clamp-1" title={assignment.formTitle}>
                                {assignment.formTitle}
                            </h3>
                            {getStatusBadge(assignment.status)}
                        </div>
                        
                        <div className="space-y-3 text-sm text-slate-600 mb-6">
                            {assignment.startDate && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    <span>شروع: {new Date(assignment.startDate).toLocaleDateString('fa-IR')}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-slate-400" />
                                <span>مهلت: {assignment.deadline ? new Date(assignment.deadline).toLocaleDateString('fa-IR') : 'نامحدود'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <AlertCircle className={`w-4 h-4 ${assignment.isMandatory ? 'text-red-500' : 'text-slate-400'}`} />
                                <span className={assignment.isMandatory ? 'text-red-600 font-medium' : ''}>
                                    {assignment.isMandatory ? 'اجباری' : 'اختیاری'}
                                </span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex justify-end">
                            {isStartable(assignment) ? (
                                <Link 
                                    href={`/dashboard/assessments/${assignment.id}/take`}
                                    className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-500 transition-colors text-sm font-medium"
                                >
                                    <PlayCircle className="w-4 h-4 ml-2" />
                                    {assignment.status === AssessmentAssignmentStatus.InProgress ? 'ادامه آزمون' : 'شروع آزمون'}
                                </Link>
                            ) : (
                                <button disabled className="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-400 rounded-md cursor-not-allowed text-sm font-medium">
                                    <Clock className="w-4 h-4 ml-2" />
                                    در انتظار شروع
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
