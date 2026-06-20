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

    // #region debug-point A:client-reporter
    const dbg = (hypothesisId: string, msg: string, data?: Record<string, unknown>) => {
        fetch('http://127.0.0.1:7777/event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: 'medication-alert-missing',
                runId: 'pre-fix',
                hypothesisId,
                location: `NotificationCenter:${appearance}`,
                msg: `[DEBUG] ${msg}`,
                data,
                ts: Date.now(),
            }),
        }).catch(() => undefined);
    };
    // #endregion

    useEffect(() => {
        // #region debug-point A:mount
        dbg('A', 'mount', {
            path: window.location.pathname,
            apiBaseUrl: (process.env.NEXT_PUBLIC_API_BASE_URL ?? null),
            realtimeEnabled: (process.env.NEXT_PUBLIC_ENABLE_REALTIME ?? null),
            hasToken: Boolean(localStorage.getItem('token') || sessionStorage.getItem('token')),
        });
        // #endregion
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleRefresh = () => {
            // #region debug-point B:refresh-event
            dbg('B', 'notifications:refresh', { isOpen, path: window.location.pathname });
            // #endregion
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
            // #region debug-point B:unread-start
            dbg('B', 'fetchUnreadCount:start', {
                hasToken: Boolean(localStorage.getItem('token') || sessionStorage.getItem('token')),
            });
            // #endregion
            const count = await notificationService.getUnreadCount();
            setUnreadCount(count);
            // #region debug-point B:unread-success
            dbg('B', 'fetchUnreadCount:success', { count });
            // #endregion
        } catch (error) {
            // #region debug-point B:unread-fail
            const status = (error as any)?.response?.status;
            const url = (error as any)?.config?.url;
            dbg('B', 'fetchUnreadCount:fail', { status, url, error: String((error as any)?.message ?? error) });
            // #endregion
            console.error('Failed to fetch notification count', error);
        }
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            // #region debug-point C:list-start
            dbg('C', 'fetchNotifications:start', {
                unreadOnly: true,
                hasToken: Boolean(localStorage.getItem('token') || sessionStorage.getItem('token')),
            });
            // #endregion
            const data = await notificationService.getMyNotifications(true);
            setNotifications(dedupeNotifications(data));
            // #region debug-point C:list-success
            dbg('C', 'fetchNotifications:success', {
                count: data.length,
                items: data.slice(0, 10).map((x) => ({
                    id: x.id,
                    title: x.title,
                    type: x.type,
                    referenceId: x.referenceId ?? null,
                    link: x.link ?? null,
                }))
            });
            // #endregion
        } catch (error) {
            // #region debug-point C:list-fail
            const status = (error as any)?.response?.status;
            const url = (error as any)?.config?.url;
            dbg('C', 'fetchNotifications:fail', { status, url, error: String((error as any)?.message ?? error) });
            // #endregion
            console.error('Failed to fetch notifications', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleDropdown = () => {
        // #region debug-point A:toggle
        dbg('A', 'toggleDropdown', { nextIsOpen: !isOpen, unreadCount });
        // #endregion
        if (!isOpen) {
            fetchNotifications();
        }
        setIsOpen(!isOpen);
    };

    const isPortalVitalAlert = (notification: UserNotification) =>
        appearance === 'portal'
        && notification.type === NotificationType.Alert
        && notification.title.includes('علائم حیاتی')
        && Boolean(notification.referenceId);

    const isPortalMedicationAlert = (notification: UserNotification) =>
        appearance === 'portal'
        && notification.type === NotificationType.Alert
        && !notification.title.includes('موجودی')
        && (notification.title.includes('دارو') || notification.title.includes('کاردکس'))
        && Boolean(notification.referenceId);

    const getNotificationLink = (notification: UserNotification) => {
        if (isPortalVitalAlert(notification)) {
            return `/portal?vitalId=${notification.referenceId}`;
        }

        if (isPortalMedicationAlert(notification)) {
            return `/portal?doseId=${notification.referenceId}`;
        }

        return notification.link;
    };

    const markNotificationAsSeen = async (notificationId: number) => {
        try {
            await notificationService.markAsRead(notificationId);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            void fetchUnreadCount();
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const handleNotificationClick = async (notification: UserNotification) => {
        if (!notification.isRead) {
            await markNotificationAsSeen(notification.id);
        }

        const destination = getNotificationLink(notification);
        if (destination) {
            router.push(destination);
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
        ? 'fixed inset-x-4 top-24 z-[95] max-h-[70vh] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 sm:max-h-96 sm:inset-x-auto'
        : 'absolute left-0 mt-2 w-[min(92vw,24rem)] sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-[95] overflow-hidden';

    const headerClassName = appearance === 'portal'
        ? 'p-3 border-b border-gray-100 bg-white flex justify-between items-center'
        : 'p-3 border-b border-slate-800 bg-slate-800/50 flex justify-between items-center';

    return (
        <div className={`relative ${appearance === 'portal' ? 'z-[95]' : ''}`} ref={dropdownRef}>
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
                                        onClick={() => void handleNotificationClick(notification)}
                                        className={`p-4 transition-colors flex gap-3 ${getNotificationLink(notification) ? 'cursor-pointer' : 'cursor-default'} ${appearance === 'portal' ? 'hover:bg-gray-50' : 'hover:bg-slate-800/50'} ${!notification.isRead ? (appearance === 'portal' ? 'bg-red-50/30' : 'bg-slate-800/20') : ''}`}
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
                                            <div className="mt-3 flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        void markNotificationAsSeen(notification.id);
                                                    }}
                                                    className={`rounded-full border px-3 py-1 text-[11px] font-medium transition ${appearance === 'portal' ? 'border-gray-200 text-gray-600 hover:bg-gray-100' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}`}
                                                >
                                                    رويت شد
                                                </button>
                                            </div>
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

function dedupeNotifications(items: UserNotification[]) {
    const grouped = new Map<string, UserNotification>();

    for (const item of items) {
        const isLowStock = item.title.includes('موجودی دارو');
        const key = isLowStock ? `${item.referenceId ?? item.id}|${item.title}` : `${item.id}`;
        const existing = grouped.get(key);

        if (!existing || new Date(item.createdAt).getTime() > new Date(existing.createdAt).getTime()) {
            grouped.set(key, item);
        }
    }

    return Array.from(grouped.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
