'use client';

import { useEffect } from 'react';
import { HubConnectionBuilder, HttpTransportType, LogLevel } from '@microsoft/signalr';
import { toast } from 'react-hot-toast';
import { AlertOctagon, AlertTriangle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

type RealtimeNotificationPayload = {
  title: string;
  message: string;
  link?: string;
  severity?: 'Warning' | 'Critical' | string;
  patientId?: number;
  vitalSignId?: number;
};

export function RealtimeNotificationListener() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return;

    const connection = new HubConnectionBuilder()
      .withUrl('http://localhost:5016/notificationHub', {
        accessTokenFactory: () => token,
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets,
      })
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    const start = async () => {
      try {
        await connection.start();
        await connection.invoke('JoinMyGroup');

        connection.on('ReceiveNotification', (payload: RealtimeNotificationPayload) => {
          const severity = payload?.severity;
          const isAlert = severity === 'Critical' || severity === 'Warning';
          
          if (!payload?.title) return;

          if (isAlert) {
            toast.custom((t) => (
              <div 
                className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-white dark:bg-slate-900 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5 dark:ring-white/10 overflow-hidden relative border-r-4 ${severity === 'Critical' ? 'border-red-500' : 'border-orange-500'}`}
                dir="rtl"
              >
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="absolute top-3 left-3 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors z-10"
                  aria-label="بستن"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="flex-1 w-0 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 pt-0.5">
                      {severity === 'Critical' ? (
                        <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-full animate-pulse">
                          <AlertOctagon className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                      ) : (
                        <div className="p-2 bg-orange-100 dark:bg-orange-500/20 rounded-full">
                          <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 pl-6">
                      <p className={`text-sm font-bold ${severity === 'Critical' ? 'text-red-700 dark:text-red-400' : 'text-orange-700 dark:text-orange-400'}`}>
                        {payload.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {payload.message}
                      </p>
                      {payload.link && (
                        <button
                          onClick={() => {
                            toast.dismiss(t.id);
                            router.push(payload.link!);
                          }}
                          className="mt-3 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-500 transition-colors"
                        >
                          مشاهده جزئیات &larr;
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ), { 
              duration: severity === 'Critical' ? Infinity : 15000, 
              position: 'top-center' 
            });
          } else {
            const text = payload?.message ? `${payload.title}: ${payload.message}` : payload?.title;
            toast(text, { duration: 5000 });
          }

          window.dispatchEvent(new CustomEvent('notifications:refresh'));
        });
      } catch (err) {
        console.error('SignalR notification connection error', err);
      }
    };

    start();

    return () => {
      connection.stop();
    };
  }, [router]);

  return null;
}
