'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Clock, AlertTriangle, FileText } from 'lucide-react';
import { notificationService, UserNotification, NotificationType } from '@/services/notification.service';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export function NotificationCenter() {
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
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
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

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-3 border-b border-slate-800 bg-slate-800/50 flex justify-between items-center">
                        <h3 className="font-bold text-white text-sm">اعلان‌ها</h3>
                        {unreadCount > 0 && (
                            <span className="text-xs text-teal-400">{unreadCount} خوانده نشده</span>
                        )}
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center text-slate-500 text-sm">در حال بارگذاری...</div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 text-sm flex flex-col items-center">
                                <Bell className="w-8 h-8 mb-2 opacity-20" />
                                اعلانی وجود ندارد
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-800">
                                {notifications.map(notification => (
                                    <div 
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`p-4 hover:bg-slate-800/50 transition-colors cursor-pointer flex gap-3 ${!notification.isRead ? 'bg-slate-800/20' : ''}`}
                                    >
                                        <div className="mt-1 flex-shrink-0">
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className={`text-sm font-medium truncate ${!notification.isRead ? 'text-white' : 'text-slate-300'}`}>
                                                    {notification.title}
                                                </p>
                                                {!notification.isRead && (
                                                    <span className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 mt-1.5"></span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-400 line-clamp-2 mb-1">
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] text-slate-500">
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
