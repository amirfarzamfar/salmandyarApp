'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCheck } from 'lucide-react';
import { notificationService, UserNotification } from '@/services/notification.service';

interface LowStockNotificationBannerProps {
  appearance?: 'dashboard' | 'portal';
}

export function LowStockNotificationBanner({ appearance = 'dashboard' }: LowStockNotificationBannerProps) {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [markingIds, setMarkingIds] = useState<number[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const items = await notificationService.getMyNotifications(true);
        setNotifications(items);
      } catch {
      }
    };

    void load();
    const refresh = () => void load();
    const interval = window.setInterval(refresh, 60000);
    window.addEventListener('notifications:refresh', refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('notifications:refresh', refresh);
    };
  }, []);

  const lowStockItems = useMemo(() => {
    const grouped = new Map<string, UserNotification>();

    notifications
      .filter((item) => item.title.includes('موجودی دارو'))
      .forEach((item) => {
        const key = `${item.referenceId ?? item.id}|${item.title}`;
        const existing = grouped.get(key);
        if (!existing || new Date(item.createdAt).getTime() > new Date(existing.createdAt).getTime()) {
          grouped.set(key, item);
        }
      });

    return Array.from(grouped.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notifications]);

  const handleMarkAsSeen = async (notification: UserNotification) => {
    setMarkingIds((prev) => [...prev, notification.id]);
    try {
      await notificationService.markAsRead(notification.id);
      setNotifications((prev) =>
        prev.filter((item) => !(item.title === notification.title && item.referenceId === notification.referenceId))
      );
      window.dispatchEvent(new CustomEvent('notifications:refresh'));
    } finally {
      setMarkingIds((prev) => prev.filter((id) => id !== notification.id));
    }
  };

  if (lowStockItems.length === 0) {
    return null;
  }

  const wrapperClassName =
    appearance === 'portal'
      ? 'rounded-3xl border border-amber-200 bg-amber-50 px-4 py-4'
      : 'rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 shadow-sm';

  return (
    <div className={wrapperClassName}>
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-amber-100 p-2 text-amber-700">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-amber-900">هشدار موجودی دارو</h3>
          <div className="mt-2 space-y-2">
            {lowStockItems.map((item) => (
              <div key={item.id} className="rounded-2xl bg-white/80 px-3 py-3 text-sm text-amber-900">
                <div>{item.message}</div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-xs text-amber-700/80">
                    {new Date(item.createdAt).toLocaleString('fa-IR')}
                  </span>
                  <button
                    type="button"
                    onClick={() => void handleMarkAsSeen(item)}
                    disabled={markingIds.includes(item.id)}
                    className="inline-flex items-center gap-1 rounded-xl bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800 transition hover:bg-amber-200 disabled:opacity-60"
                  >
                    <CheckCheck className="h-4 w-4" />
                    {markingIds.includes(item.id) ? 'در حال ثبت...' : 'رویت شد'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
