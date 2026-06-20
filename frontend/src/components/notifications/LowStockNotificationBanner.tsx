'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { notificationService, UserNotification } from '@/services/notification.service';

interface LowStockNotificationBannerProps {
  appearance?: 'dashboard' | 'portal';
}

export function LowStockNotificationBanner({ appearance = 'dashboard' }: LowStockNotificationBannerProps) {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);

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
    window.addEventListener('notifications:refresh', refresh);
    return () => window.removeEventListener('notifications:refresh', refresh);
  }, []);

  const lowStockItems = useMemo(() => {
    return notifications.filter((item) => item.title.includes('موجودی دارو')).slice(0, 3);
  }, [notifications]);

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
              <div key={item.id} className="rounded-2xl bg-white/80 px-3 py-2 text-sm text-amber-900">
                {item.message}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
