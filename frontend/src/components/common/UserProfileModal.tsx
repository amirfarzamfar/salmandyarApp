'use client';

import { useState } from 'react';
import { authService } from '@/services/auth.service';
import { AuthResponse } from '@/types/auth';
import { X, User, Lock, Phone, Mail, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface UserProfileModalProps {
    user: AuthResponse;
    isOpen: boolean;
    onClose: () => void;
}

export function UserProfileModal({ user, isOpen, onClose }: UserProfileModalProps) {
    const [activeTab, setActiveTab] = useState<'details' | 'password'>('details');
    
    // Change Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            toast.error('رمز عبور جدید و تکرار آن مطابقت ندارند');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('رمز عبور باید حداقل ۶ کاراکتر باشد');
            return;
        }

        setSubmitting(true);
        try {
            await authService.changePassword({
                currentPassword,
                newPassword
            });
            toast.success('رمز عبور با موفقیت تغییر کرد');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'خطا در تغییر رمز عبور');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const roleMap: Record<string, string> = {
        'Admin': 'مدیر سیستم',
        'Nurse': 'پرستار',
        'Senior': 'سالمندیار',
        'Patient': 'بیمار',
        'Family': 'خانواده'
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-800/50">
                    <h3 className="text-lg font-bold text-white flex items-center">
                        <User className="w-5 h-5 ml-2 text-teal-400" />
                        پروفایل کاربری
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex border-b border-slate-800">
                    <button
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'details' ? 'text-teal-400 border-b-2 border-teal-400 bg-slate-800/50' : 'text-slate-400 hover:text-white hover:bg-slate-800/30'}`}
                        onClick={() => setActiveTab('details')}
                    >
                        مشخصات کاربر
                    </button>
                    <button
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'password' ? 'text-teal-400 border-b-2 border-teal-400 bg-slate-800/50' : 'text-slate-400 hover:text-white hover:bg-slate-800/30'}`}
                        onClick={() => setActiveTab('password')}
                    >
                        تغییر رمز عبور
                    </button>
                </div>

                <div className="p-4">
                    {activeTab === 'details' ? (
                        <div className="space-y-4">
                            <div className="flex flex-col items-center justify-center py-4">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-3xl font-black shadow-lg mb-3">
                                    {user.firstName?.charAt(0) || user.lastName?.charAt(0) || 'U'}
                                </div>
                                <h4 className="text-xl font-bold text-white">{user.firstName} {user.lastName}</h4>
                                <span className="text-teal-400 text-sm mt-1 bg-teal-400/10 px-3 py-1 rounded-full border border-teal-400/20">
                                    {roleMap[user.role] || user.role}
                                </span>
                            </div>

                            <div className="space-y-3 bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                                <div className="flex items-center text-slate-300">
                                    <Phone className="w-4 h-4 ml-3 text-slate-500" />
                                    <span className="text-sm">شماره موبایل:</span>
                                    <span className="mr-auto font-mono text-white" dir="ltr">{user.phoneNumber || '-'}</span> 
                                </div>
                                {user.email && user.email.includes('@') && (
                                     <div className="flex items-center text-slate-300">
                                        <Mail className="w-4 h-4 ml-3 text-slate-500" />
                                        <span className="text-sm">ایمیل:</span>
                                        <span className="mr-auto text-white">{user.email}</span>
                                    </div>
                                )}
                                <div className="flex items-center text-slate-300">
                                    <Shield className="w-4 h-4 ml-3 text-slate-500" />
                                    <span className="text-sm">شناسه کاربر:</span>
                                    <span className="mr-auto font-mono text-xs text-slate-500 truncate max-w-[150px]" title={user.id}>{user.id}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">رمز عبور فعلی</label>
                                <div className="relative">
                                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full bg-slate-800 border-slate-700 text-white rounded-md focus:ring-teal-500 focus:border-teal-500 p-2 pr-10"
                                        placeholder="••••••"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">رمز عبور جدید</label>
                                <div className="relative">
                                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-slate-800 border-slate-700 text-white rounded-md focus:ring-teal-500 focus:border-teal-500 p-2 pr-10"
                                        placeholder="••••••"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">تکرار رمز عبور جدید</label>
                                <div className="relative">
                                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-slate-800 border-slate-700 text-white rounded-md focus:ring-teal-500 focus:border-teal-500 p-2 pr-10"
                                        placeholder="••••••"
                                        required
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
                                    className="px-4 py-2 text-sm bg-teal-600 text-white rounded-md hover:bg-teal-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? 'در حال تغییر...' : 'تغییر رمز عبور'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
