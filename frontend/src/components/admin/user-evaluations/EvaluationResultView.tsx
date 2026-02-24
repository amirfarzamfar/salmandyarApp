'use client';

import { useState, useEffect } from 'react';
import { userEvaluationService } from '@/services/user-evaluation.service';
import { UserEvaluation, QuestionAnswerDetail } from '@/types/user-evaluation';
import { X, CheckCircle, XCircle, AlertCircle, Award } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface EvaluationResultViewProps {
    assignment: UserEvaluation;
    onClose: () => void;
}

export function EvaluationResultView({ assignment, onClose }: EvaluationResultViewProps) {
    const [detail, setDetail] = useState<UserEvaluation | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const data = await userEvaluationService.getEvaluationById(assignment.id);
                setDetail(data);
            } catch (error) {
                toast.error('خطا در دریافت جزئیات ارزیابی');
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [assignment.id]);

    if (!loading && !detail?.submissionDetails) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 text-center">
                    <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-white text-lg font-bold">جزئیات یافت نشد</h3>
                    <p className="text-slate-400 mt-2">اطلاعات پاسخنامه برای این ارزیابی موجود نیست.</p>
                    <button onClick={onClose} className="mt-6 px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700">بستن</button>
                </div>
            </div>
        );
    }

    const submission = detail?.submissionDetails;

    // Group answers by Category (Tags)
    const groupedAnswers: Record<string, QuestionAnswerDetail[]> = {};
    submission?.answers.forEach(ans => {
        const category = ans.tags && ans.tags.length > 0 ? ans.tags[0] : 'عمومی';
        if (!groupedAnswers[category]) groupedAnswers[category] = [];
        groupedAnswers[category].push(ans);
    });

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-800/50">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Award className="w-6 h-6 text-teal-400" />
                            نتایج ارزیابی: {assignment.formTitle}
                        </h2>
                        <div className="mt-1 text-sm text-slate-400">
                            کاربر: <span className="text-white">{assignment.userFullName}</span> | 
                            تاریخ ارزیابی: <span className="text-white">{new Date(submission?.submittedAt || '').toLocaleString('fa-IR')}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-center px-4 py-2 bg-slate-800 rounded-lg border border-slate-700">
                            <div className="text-xs text-slate-400">نمره نهایی</div>
                            <div className="text-2xl font-bold text-teal-400">{submission?.totalScore}</div>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-full">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {loading ? (
                        <div className="text-center py-10 text-slate-400">در حال دریافت جزئیات...</div>
                    ) : (
                        Object.entries(groupedAnswers).map(([category, answers]) => (
                            <div key={category} className="space-y-4">
                                <h3 className="text-lg font-bold text-teal-400 border-b border-slate-800 pb-2 mb-4">
                                    {category}
                                </h3>
                                
                                {answers.map((ans, idx) => (
                                    <div key={idx} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 hover:border-slate-600 transition-colors">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <span className="text-slate-500 text-sm ml-2">سوال {idx + 1}:</span>
                                                <span className="text-white font-medium">{ans.questionText}</span>
                                            </div>
                                            <div className="flex items-center gap-2 mr-4 min-w-fit">
                                                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">وزن: {ans.weight}</span>
                                                <span className={`text-xs px-2 py-1 rounded font-bold ${
                                                    (ans.selectedOptionScore || 0) > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                                }`}>
                                                    امتیاز: {ans.selectedOptionScore ?? 0}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mr-6 space-y-2">
                                            {/* User Answer */}
                                            <div className="flex items-start gap-2">
                                                <span className="text-sm text-slate-400 min-w-[80px]">پاسخ کاربر:</span>
                                                <div className="text-sm text-slate-200">
                                                    {ans.selectedOptionText && (
                                                        <span className="flex items-center gap-2">
                                                            {ans.selectedOptionText}
                                                        </span>
                                                    )}
                                                    {ans.textResponse && (
                                                        <p className="whitespace-pre-wrap bg-slate-900/50 p-2 rounded text-slate-300 border border-slate-800 mt-1">
                                                            {ans.textResponse}
                                                        </p>
                                                    )}
                                                    {ans.booleanResponse !== null && (
                                                        <span>{ans.booleanResponse ? 'بله' : 'خیر'}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
