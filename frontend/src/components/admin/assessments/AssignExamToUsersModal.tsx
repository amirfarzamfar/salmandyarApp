'use client';

import { useState, useEffect } from 'react';
import { userService, UserListDto } from '@/services/user.service';
import { assessmentAssignmentService } from '@/services/assessment-assignment.service';
import { X, Search, UserPlus, Check, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AssignExamToUsersModalProps {
    formId: number;
    formTitle: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function AssignExamToUsersModal({ formId, formTitle, isOpen, onClose, onSuccess }: AssignExamToUsersModalProps) {
    const [step, setStep] = useState<1 | 2>(1); // 1: Select Users, 2: Configure Settings
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState<UserListDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
    const [submitting, setSubmitting] = useState(false);

    // Settings
    const [startDate, setStartDate] = useState<string>('');
    const [deadline, setDeadline] = useState<string>('');
    const [isMandatory, setIsMandatory] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
            setStep(1);
            setSelectedUserIds(new Set());
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
        } catch (error) {
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

    const handleSubmit = async () => {
        if (selectedUserIds.size === 0) {
            toast.error('لطفا حداقل یک کاربر را انتخاب کنید');
            return;
        }

        setSubmitting(true);
        let successCount = 0;
        let failCount = 0;

        try {
            const promises = Array.from(selectedUserIds).map(userId => 
                assessmentAssignmentService.assignAssessment({
                    userId,
                    formId,
                    startDate: startDate ? new Date(startDate).toISOString() : undefined,
                    deadline: deadline ? new Date(deadline).toISOString() : undefined,
                    isMandatory
                }).then(() => {
                    successCount++;
                }).catch(() => {
                    failCount++;
                })
            );

            await Promise.all(promises);

            if (successCount > 0) {
                toast.success(`${successCount} کاربر با موفقیت تخصیص داده شدند`);
                if (failCount > 0) {
                    toast.error(`${failCount} خطا در تخصیص رخ داد`);
                }
                onSuccess();
                onClose();
            } else {
                toast.error('خطا در تخصیص آزمون به کاربران');
            }
        } catch (error) {
            toast.error('خطای سیستمی رخ داد');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-800/50">
                    <div>
                        <h3 className="text-lg font-bold text-white">تخصیص آزمون: {formTitle}</h3>
                        <p className="text-xs text-slate-400">
                            {step === 1 ? 'انتخاب کاربران' : 'تنظیمات آزمون'}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {step === 1 ? (
                        <div className="space-y-4">
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
                                    {users.map(user => (
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
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                                    selectedUserIds.has(user.id) ? 'bg-teal-500 text-white' : 'bg-slate-700 text-slate-300'
                                                }`}>
                                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-white">
                                                        {user.firstName} {user.lastName}
                                                    </div>
                                                    <div className="text-xs text-slate-400">
                                                        {user.phoneNumber} | {user.role}
                                                    </div>
                                                </div>
                                            </div>
                                            {selectedUserIds.has(user.id) && (
                                                <Check className="w-5 h-5 text-teal-400" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-teal-500/10 border border-teal-500/20 rounded-lg p-3 text-sm text-teal-200">
                                {selectedUserIds.size} کاربر انتخاب شده‌اند.
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">تاریخ شروع (اختیاری)</label>
                                    <input
                                        type="datetime-local"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full bg-slate-800 border-slate-700 text-white rounded-md focus:ring-teal-500 focus:border-teal-500 p-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">مهلت انجام (اختیاری)</label>
                                    <input
                                        type="datetime-local"
                                        value={deadline}
                                        onChange={(e) => setDeadline(e.target.value)}
                                        className="w-full bg-slate-800 border-slate-700 text-white rounded-md focus:ring-teal-500 focus:border-teal-500 p-2 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="isMandatoryBulk"
                                    checked={isMandatory}
                                    onChange={(e) => setIsMandatory(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-teal-500 focus:ring-teal-500"
                                />
                                <label htmlFor="isMandatoryBulk" className="text-sm text-slate-300">
                                    این آزمون اجباری است
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-800 bg-slate-800/50 flex justify-between">
                    {step === 2 ? (
                        <button
                            onClick={() => setStep(1)}
                            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
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
                            disabled={selectedUserIds.size === 0}
                            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                            مرحله بعد
                            <UserPlus size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="px-6 py-2 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
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
