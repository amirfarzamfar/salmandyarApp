'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Clock, AlertTriangle, FileText } from 'lucide-react';
import { notificationService, UserNotification, NotificationType } from '@/services/notification.service';
import { useRouter } from 'next/navigation';

interface NotificationCenterProps {
    appearance?: 'dashboard' | 'portal';
}

export function NotificationCenter({ appearance = 'dashboard' }: NotificationCenterProps) {
    const [notifications, setNotifications] = useState<UserNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleRefresh = () => {
            fetchUnreadCount();
            if (isOpen) fetchNotifications();
        };
        window.addEventListener('notifications:refresh', handleRefresh);
        return () => window.removeEventListener('notifications:refresh', handleRefresh);
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const count = await notificationService.getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error('Failed to fetch notification count', error);
        }
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const data = await notificationService.getMyNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleDropdown = () => {
        if (!isOpen) {
            fetchNotifications();
        }
        setIsOpen(!isOpen);
    };

    const handleNotificationClick = async (notification: UserNotification) => {
        if (!notification.isRead) {
            try {
                await notificationService.markAsRead(notification.id);
                setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (error) {
                console.error('Failed to mark as read', error);
            }
        }

        if (notification.link) {
            router.push(notification.link);
            setIsOpen(false);
        }
    };

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case NotificationType.Assessment: return <FileText className="w-5 h-5 text-teal-400" />;
            case NotificationType.Alert: return <AlertTriangle className="w-5 h-5 text-red-400" />;
            case NotificationType.Reminder: return <Clock className="w-5 h-5 text-yellow-400" />;
            default: return <Bell className="w-5 h-5 text-blue-400" />;
        }
    };

    const triggerClassName = appearance === 'portal'
        ? 'relative inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-gray-400 shadow-soft-sm transition-all duration-300 hover:bg-medical-50 hover:text-medical-600 hover:shadow-soft-md'
        : 'relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors';

    const dropdownClassName = appearance === 'portal'
        ? 'fixed inset-x-4 top-24 z-[80] max-h-[70vh] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 sm:max-h-96 sm:inset-x-auto'
        : 'absolute left-0 mt-2 w-[min(92vw,24rem)] sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden';

    const headerClassName = appearance === 'portal'
        ? 'p-3 border-b border-gray-100 bg-gray-50/80 flex justify-between items-center'
        : 'p-3 border-b border-slate-800 bg-slate-800/50 flex justify-between items-center';

    return (
        <div className={`relative ${appearance === 'portal' ? 'z-[80]' : ''}`} ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className={triggerClassName}
                type="button"
                aria-haspopup="dialog"
                aria-expanded={isOpen}
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className={dropdownClassName}>
                    <div className={headerClassName}>
                        <h3 className={`font-bold text-sm ${appearance === 'portal' ? 'text-gray-900' : 'text-white'}`}>اعلان‌ها</h3>
                        {unreadCount > 0 && (
                            <span className="text-xs text-teal-400">{unreadCount} خوانده نشده</span>
                        )}
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className={`p-4 text-center text-sm ${appearance === 'portal' ? 'text-gray-500' : 'text-slate-500'}`}>در حال بارگذاری...</div>
                        ) : notifications.length === 0 ? (
                            <div className={`p-8 text-center text-sm flex flex-col items-center ${appearance === 'portal' ? 'text-gray-500' : 'text-slate-500'}`}>
                                <Bell className="w-8 h-8 mb-2 opacity-20" />
                                اعلانی وجود ندارد
                            </div>
                        ) : (
                            <div className={appearance === 'portal' ? 'divide-y divide-gray-100' : 'divide-y divide-slate-800'}>
                                {notifications.map(notification => (
                                    <div 
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`p-4 transition-colors cursor-pointer flex gap-3 ${appearance === 'portal' ? 'hover:bg-gray-50' : 'hover:bg-slate-800/50'} ${!notification.isRead ? (appearance === 'portal' ? 'bg-red-50/30' : 'bg-slate-800/20') : ''}`}
                                    >
                                        <div className="mt-1 flex-shrink-0">
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className={`text-sm font-medium truncate ${appearance === 'portal' ? (!notification.isRead ? 'text-gray-900' : 'text-gray-700') : (!notification.isRead ? 'text-white' : 'text-slate-300')}`}>
                                                    {notification.title}
                                                </p>
                                                {!notification.isRead && (
                                                    <span className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 mt-1.5"></span>
                                                )}
                                            </div>
                                            <p className={`text-xs line-clamp-2 mb-1 ${appearance === 'portal' ? 'text-gray-500' : 'text-slate-400'}`}>
                                                {notification.message}
                                            </p>
                                            <p className={`text-[10px] ${appearance === 'portal' ? 'text-gray-400' : 'text-slate-500'}`}>
                                                {new Date(notification.createdAt).toLocaleString('fa-IR')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
