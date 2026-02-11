'use client';

import { useState } from 'react';
import { authService } from '@/services/auth.service';
import { AuthResponse } from '@/types/auth';
import { X, User, Phone, Mail, Save, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useUser } from '@/components/auth/UserContext';

interface EditProfileModalProps {
    user: AuthResponse;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (updatedUser: AuthResponse) => void;
}

export function EditProfileModal({ user, isOpen, onClose, onSuccess }: EditProfileModalProps) {
    const { refreshUser } = useUser();
    const [firstName, setFirstName] = useState(user.firstName || '');
    const [lastName, setLastName] = useState(user.lastName || '');
    const [email, setEmail] = useState(user.email || '');
    const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        setSubmitting(true);
        try {
            await authService.updateProfile({
                firstName,
                lastName,
                email,
                phoneNumber
            });
            
            // Create updated user object
            const updatedUser = {
                ...user,
                firstName,
                lastName,
                email,
                phoneNumber
            };
            
            // Update local storage to persist changes
            if (localStorage.getItem('user')) {
                localStorage.setItem('user', JSON.stringify(updatedUser));
            } else if (sessionStorage.getItem('user')) {
                sessionStorage.setItem('user', JSON.stringify(updatedUser));
            }
            
            // Trigger context refresh
            refreshUser();
            
            toast.success('پروفایل با موفقیت بروزرسانی شد');
            onSuccess(updatedUser);
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'خطا در بروزرسانی پروفایل');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-800/50">
                    <h3 className="text-lg font-bold text-white flex items-center">
                        <User className="w-5 h-5 ml-2 text-teal-400" />
                        ویرایش اطلاعات کاربری
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">نام</label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full bg-slate-800 border-slate-700 text-white rounded-md focus:ring-teal-500 focus:border-teal-500 p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">نام خانوادگی</label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full bg-slate-800 border-slate-700 text-white rounded-md focus:ring-teal-500 focus:border-teal-500 p-2"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">شماره موبایل</label>
                        <div className="relative">
                            <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="w-full bg-slate-800 border-slate-700 text-white rounded-md focus:ring-teal-500 focus:border-teal-500 p-2 pr-10"
                                dir="ltr"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">ایمیل</label>
                        <div className="relative">
                            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-800 border-slate-700 text-white rounded-md focus:ring-teal-500 focus:border-teal-500 p-2 pr-10"
                                dir="ltr"
                            />
                        </div>
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
                            disabled={submitting}
                            className="px-4 py-2 text-sm bg-teal-600 text-white rounded-md hover:bg-teal-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    در حال ذخیره...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    ذخیره تغییرات
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
