'use client';

import { useState, useEffect } from 'react';
import { assessmentService } from '@/services/assessment.service';
import { assessmentAssignmentService } from '@/services/assessment-assignment.service';
import { AssessmentForm } from '@/types/assessment';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import DateObject from 'react-date-object';

function toIsoString(date: unknown): string {
    if (!date) return '';
    if (date instanceof Date) return date.toISOString();
    if (date instanceof DateObject) return new Date(date.valueOf()).toISOString();
    if (typeof date === 'object' && date !== null && 'valueOf' in date) {
        const valueOf = (date as { valueOf?: unknown }).valueOf;
        if (typeof valueOf === 'function') {
            return new Date((valueOf as () => number)()).toISOString();
        }
    }
    return '';
}

interface AssignAssessmentModalProps {
    userId: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function AssignAssessmentModal({ userId, isOpen, onClose, onSuccess }: AssignAssessmentModalProps) {
    const [forms, setForms] = useState<AssessmentForm[]>([]);
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

    useEffect(() => {
        if (!startDate || !deadline) return;
        if (new Date(deadline).getTime() < new Date(startDate).getTime()) {
            setDeadline('');
        }
    }, [startDate, deadline]);

    const fetchForms = async () => {
        setLoading(true);
        try {
            const data = await assessmentService.getAllForms();
            setForms(data.filter(f => f.isActive)); // Only active forms
        } catch (error) {
            toast.error('خطا در دریافت لیست آزمون‌ها');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFormId) {
            toast.error('لطفا یک آزمون انتخاب کنید');
            return;
        }

        setSubmitting(true);
        try {
            await assessmentAssignmentService.assignAssessment({
                userId,
                formId: Number(selectedFormId),
                startDate: startDate || undefined,
                deadline: deadline || undefined,
                isMandatory
            });
            onSuccess();
        } catch (error) {
            toast.error('خطا در تخصیص آزمون (ممکن است قبلا تخصیص داده شده باشد)');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-800/50">
                    <h3 className="text-lg font-bold text-white">تخصیص آزمون جدید</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">انتخاب آزمون</label>
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
                            <DatePicker
                                value={startDate ? new Date(startDate) : undefined}
                                onChange={(date: unknown) => {
                                    const iso = toIsoString(date);
                                    setStartDate(iso);
                                }}
                                calendar={persian}
                                locale={persian_fa}
                                calendarPosition="bottom-right"
                                containerClassName="w-full"
                                inputClass="w-full bg-slate-800 border border-slate-700 text-white rounded-md focus:ring-teal-500 focus:border-teal-500 p-2 outline-none"
                                format="YYYY/MM/DD"
                                placeholder="انتخاب تاریخ..."
                                minDate={new Date()}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">مهلت انجام (اختیاری)</label>
                            <DatePicker
                                value={deadline ? new Date(deadline) : undefined}
                                onChange={(date: unknown) => {
                                    const iso = toIsoString(date);
                                    setDeadline(iso);
                                }}
                                calendar={persian}
                                locale={persian_fa}
                                calendarPosition="bottom-right"
                                containerClassName="w-full"
                                inputClass="w-full bg-slate-800 border border-slate-700 text-white rounded-md focus:ring-teal-500 focus:border-teal-500 p-2 outline-none"
                                format="YYYY/MM/DD"
                                placeholder="انتخاب تاریخ..."
                                minDate={startDate ? new Date(startDate) : new Date()}
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
                            این آزمون اجباری است
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
                            {submitting ? 'در حال ثبت...' : 'تخصیص آزمون'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
