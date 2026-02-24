'use client';

import { useState, useEffect } from 'react';
import { userEvaluationService } from '@/services/user-evaluation.service';
import { UserEvaluationForm, AssessmentType } from '@/types/user-evaluation';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AssignEvaluationModalProps {
    userId: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function AssignEvaluationModal({ userId, isOpen, onClose, onSuccess }: AssignEvaluationModalProps) {
    const [forms, setForms] = useState<UserEvaluationForm[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    // Form State
    const [selectedFormId, setSelectedFormId] = useState<number | ''>('');
    const [startDate, setStartDate] = useState<string>('');
    const [deadline, setDeadline] = useState<string>('');
    const [isMandatory, setIsMandatory] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchForms();
        }
    }, [isOpen]);

    const fetchForms = async () => {
        setLoading(true);
        try {
            const data = await userEvaluationService.getAllForms();
            setForms(data.filter(f => f.isActive)); 
        } catch (error) {
            toast.error('خطا در دریافت لیست ارزیابی‌ها');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFormId) {
            toast.error('لطفا یک ارزیابی انتخاب کنید');
            return;
        }

        setSubmitting(true);
        try {
            await userEvaluationService.assignEvaluation({
                userId,
                formId: Number(selectedFormId),
                startDate: startDate ? new Date(startDate).toISOString() : undefined,
                deadline: deadline ? new Date(deadline).toISOString() : undefined,
                isMandatory
            });
            onSuccess();
        } catch (error) {
            toast.error('خطا در تخصیص ارزیابی (ممکن است قبلا تخصیص داده شده باشد)');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-800/50">
                    <h3 className="text-lg font-bold text-white">تخصیص ارزیابی جدید</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">انتخاب ارزیابی</label>
                        <select
                            value={selectedFormId}
                            onChange={(e) => setSelectedFormId(Number(e.target.value))}
                            className="w-full bg-slate-800 border-slate-700 text-white rounded-md focus:ring-teal-500 focus:border-teal-500 p-2"
                            disabled={loading}
                        >
                            <option value="">انتخاب کنید...</option>
                            {forms.map(form => (
                                <option key={form.id} value={form.id}>{form.title}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">تاریخ شروع (اختیاری)</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-slate-800 border-slate-700 text-white rounded-md focus:ring-teal-500 focus:border-teal-500 p-2"
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">مهلت انجام (اختیاری)</label>
                            <input
                                type="date"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                className="w-full bg-slate-800 border-slate-700 text-white rounded-md focus:ring-teal-500 focus:border-teal-500 p-2"
                                min={startDate || new Date().toISOString().split('T')[0]}
                            />
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isMandatory"
                            checked={isMandatory}
                            onChange={(e) => setIsMandatory(e.target.checked)}
                            className="w-4 h-4 text-teal-600 bg-slate-800 border-slate-700 rounded focus:ring-teal-500"
                        />
                        <label htmlFor="isMandatory" className="mr-2 text-sm text-slate-300">
                            این ارزیابی اجباری است
                        </label>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                        >
                            انصراف
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || loading}
                            className="px-4 py-2 text-sm bg-teal-600 text-white rounded-md hover:bg-teal-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'در حال ثبت...' : 'تخصیص ارزیابی'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
