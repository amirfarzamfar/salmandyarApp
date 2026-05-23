'use client';

import { useEffect, useState } from 'react';
import { userService, UserListDto } from '@/services/user.service';
import { userEvaluationService } from '@/services/user-evaluation.service';
import { Check, Loader2, Search, UserPlus, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import TimePicker from 'react-multi-date-picker/plugins/time_picker';
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

interface AssignEvaluationToUsersModalProps {
    formId: number;
    formTitle: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function AssignEvaluationToUsersModal({ formId, formTitle, isOpen, onClose, onSuccess }: AssignEvaluationToUsersModalProps) {
    const [step, setStep] = useState<1 | 2>(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState<UserListDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
    const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
    const [submitting, setSubmitting] = useState(false);

    const [startDate, setStartDate] = useState<string>('');
    const [deadline, setDeadline] = useState<string>('');
    const [isMandatory, setIsMandatory] = useState(false);

    const roleOptions: Array<{ value: string; label: string }> = [
        { value: 'Nurse', label: 'پرستاران' },
        { value: 'ElderlyCareAssistant', label: 'سالمندیاران' },
        { value: 'AssistantNurse', label: 'کمک‌پرستاران' },
        { value: 'Physiotherapist', label: 'فیزیوتراپ‌ها' },
        { value: 'Elderly', label: 'سالمندان' },
        { value: 'Patient', label: 'بیماران' },
        { value: 'PatientFamily', label: 'خانواده بیمار' }
    ];

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
            setStep(1);
            setSelectedUserIds(new Set());
            setSelectedRoles(new Set());
            setStartDate('');
            setDeadline('');
            setIsMandatory(false);
        }
    }, [isOpen]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (isOpen) fetchUsers();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    useEffect(() => {
        if (!startDate || !deadline) return;
        if (new Date(deadline).getTime() < new Date(startDate).getTime()) {
            setDeadline('');
        }
    }, [startDate, deadline]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const result = await userService.getUsers({
                pageNumber: 1,
                pageSize: 20,
                searchTerm: searchTerm,
                isActive: true
            });
            setUsers(result.items);
        } catch {
            toast.error('خطا در دریافت لیست کاربران');
        } finally {
            setLoading(false);
        }
    };

    const toggleUser = (userId: string) => {
        const newSelected = new Set(selectedUserIds);
        if (newSelected.has(userId)) {
            newSelected.delete(userId);
        } else {
            newSelected.add(userId);
        }
        setSelectedUserIds(newSelected);
    };

    const toggleRole = (role: string) => {
        const newSelected = new Set(selectedRoles);
        if (newSelected.has(role)) {
            newSelected.delete(role);
        } else {
            newSelected.add(role);
        }
        setSelectedRoles(newSelected);
    };

    const handleSubmit = async () => {
        if (selectedUserIds.size === 0 && selectedRoles.size === 0) {
            toast.error('لطفا حداقل یک کاربر یا یک نقش را انتخاب کنید');
            return;
        }

        setSubmitting(true);
        try {
            const results = await userEvaluationService.bulkAssignEvaluation({
                userIds: selectedUserIds.size ? Array.from(selectedUserIds) : undefined,
                roles: selectedRoles.size ? Array.from(selectedRoles) : undefined,
                formId,
                startDate: startDate || undefined,
                deadline: deadline || undefined,
                isMandatory
            });

            if (results.length > 0) {
                toast.success(`${results.length} تخصیص جدید ثبت شد`);
                onSuccess();
                onClose();
                return;
            }

            toast.error('هیچ تخصیص جدیدی ثبت نشد (ممکن است قبلا تخصیص داده شده باشد)');
        } catch {
            toast.error('خطای سیستمی رخ داد');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
                <div className="flex items-start justify-between gap-3 border-b border-slate-800 bg-slate-800/50 p-4">
                    <div className="min-w-0">
                        <h3 className="truncate text-base font-bold text-white sm:text-lg">تخصیص ارزیابی: {formTitle}</h3>
                        <p className="text-xs text-slate-400">
                            {step === 1 ? 'انتخاب کاربران/نقش‌ها' : 'تنظیمات ارزیابی'}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {step === 1 ? (
                        <div className="space-y-4">
                            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                                <div className="text-sm font-medium text-slate-200 mb-2">تخصیص بر اساس نقش</div>
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    {roleOptions.map((r) => (
                                        <label key={r.value} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={selectedRoles.has(r.value)}
                                                onChange={() => toggleRole(r.value)}
                                                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-teal-500 focus:ring-teal-500"
                                            />
                                            {r.label}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="relative">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="جستجو کاربر..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-slate-800 border-slate-700 text-white rounded-md pr-10 pl-3 py-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                                />
                            </div>

                            {loading ? (
                                <div className="text-center py-8 text-slate-400">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                    در حال جستجو...
                                </div>
                            ) : users.length === 0 ? (
                                <div className="text-center py-8 text-slate-500 border border-dashed border-slate-700 rounded-lg">
                                    کاربری یافت نشد
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {users.map((user) => (
                                        <div
                                            key={user.id}
                                            onClick={() => toggleUser(user.id)}
                                            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                                                selectedUserIds.has(user.id)
                                                    ? 'bg-teal-500/10 border-teal-500/50'
                                                    : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                                        selectedUserIds.has(user.id) ? 'bg-teal-500 text-white' : 'bg-slate-700 text-slate-300'
                                                    }`}
                                                >
                                                    {user.firstName?.[0]}
                                                    {user.lastName?.[0]}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-sm font-medium text-white">
                                                        {user.firstName} {user.lastName}
                                                    </div>
                                                    <div className="truncate text-xs text-slate-400">
                                                        {user.phoneNumber} | {user.role}
                                                    </div>
                                                </div>
                                            </div>
                                            {selectedUserIds.has(user.id) && <Check className="w-5 h-5 text-teal-400" />}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-teal-500/10 border border-teal-500/20 rounded-lg p-3 text-sm text-teal-200">
                                {selectedUserIds.size} کاربر و {selectedRoles.size} نقش انتخاب شده‌اند.
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                                        plugins={[<TimePicker key="time-picker" position="bottom" />]}
                                        calendarPosition="bottom-right"
                                        containerClassName="w-full"
                                        inputClass="w-full bg-slate-800 border border-slate-700 text-white rounded-md focus:ring-teal-500 focus:border-teal-500 p-2 text-sm outline-none"
                                        format="YYYY/MM/DD HH:mm"
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
                                        plugins={[<TimePicker key="time-picker" position="bottom" />]}
                                        calendarPosition="bottom-right"
                                        containerClassName="w-full"
                                        inputClass="w-full bg-slate-800 border border-slate-700 text-white rounded-md focus:ring-teal-500 focus:border-teal-500 p-2 text-sm outline-none"
                                        format="YYYY/MM/DD HH:mm"
                                        placeholder="انتخاب تاریخ..."
                                        minDate={startDate ? new Date(startDate) : new Date()}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="isMandatoryBulkUserEval"
                                    checked={isMandatory}
                                    onChange={(e) => setIsMandatory(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-teal-500 focus:ring-teal-500"
                                />
                                <label htmlFor="isMandatoryBulkUserEval" className="text-sm text-slate-300">
                                    این ارزیابی اجباری است
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-800 bg-slate-800/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    {step === 2 ? (
                        <button
                            onClick={() => setStep(1)}
                            className="px-4 py-2 text-right text-slate-400 transition-colors hover:text-white sm:text-right"
                            disabled={submitting}
                        >
                            بازگشت
                        </button>
                    ) : (
                        <div></div>
                    )}

                    {step === 1 ? (
                        <button
                            onClick={() => setStep(2)}
                            disabled={selectedUserIds.size === 0 && selectedRoles.size === 0}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-white transition-colors hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                        >
                            مرحله بعد
                            <UserPlus size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-500 px-6 py-2 text-white transition-colors hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    در حال ثبت...
                                </>
                            ) : (
                                <>
                                    <Check size={18} />
                                    تایید نهایی
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
