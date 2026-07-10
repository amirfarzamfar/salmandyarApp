'use client';

import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { AlertOctagon, AlertTriangle, X } from 'lucide-react';
import { NotificationType } from '@/services/notification.service';
import {
  createHubConnection,
  isRealtimeEnabled,
  reportSignalRError,
  stopHubConnectionSafely,
} from '@/lib/network';
import { getStoredToken } from '@/lib/auth-session';
import { useUser } from '@/components/auth/UserContext';

type RealtimeNotificationPayload = {
  title: string;
  message: string;
  link?: string;
  severity?: 'Warning' | 'Critical' | string;
  type?: NotificationType | number;
  referenceId?: string;
  patientId?: number;
  vitalSignId?: number;
};

function playPortalMedicationAlertTone() {
  if (typeof window === 'undefined') return;

  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;

  try {
    const context = new AudioContextClass();
    const master = context.createGain();
    master.connect(context.destination);
    master.gain.value = 0.03;

    const createBeep = (startTime: number, frequency: number, duration: number) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      oscillator.connect(gain);
      gain.connect(master);
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.2, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      oscillator.start(startTime);
      oscillator.stop(startTime + duration + 0.02);
    };

    const now = context.currentTime;
    createBeep(now, 880, 0.12);
    createBeep(now + 0.18, 660, 0.18);

    window.setTimeout(() => {
      void context.close().catch(() => undefined);
    }, 1000);
  } catch {
    // Ignore audio failures to avoid blocking the notification UX.
  }
}

export function RealtimeNotificationListener() {
  const { isAuthenticated } = useUser();

  useEffect(() => {
    // #region debug-point A:client-reporter
    const dbg = (hypothesisId: string, msg: string, data?: Record<string, unknown>) => {
      fetch('http://127.0.0.1:7777/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'medication-alert-missing',
          runId: 'pre-fix',
          hypothesisId,
          location: 'RealtimeNotificationListener',
          msg: `[DEBUG] ${msg}`,
          data,
          ts: Date.now(),
        }),
      }).catch(() => undefined);
    };
    // #endregion

    const realtimeOn = isRealtimeEnabled();
    // #region debug-point A:realtime-flag
    dbg('A', 'isRealtimeEnabled', {
      value: realtimeOn,
      path: window.location.pathname,
      apiBaseUrl: (process.env.NEXT_PUBLIC_API_BASE_URL ?? null),
      signalRTransport: (process.env.NEXT_PUBLIC_SIGNALR_TRANSPORT ?? null),
    });
    // #endregion

    if (!realtimeOn) return;

    const token = getStoredToken();
    // #region debug-point A:token
    dbg('A', 'token-check', { hasToken: Boolean(token) });
    // #endregion
    if (!token) return;

    const connection = createHubConnection({
      hubPath: '/notificationHub',
      accessTokenFactory: () => token,
    });
    let isActive = true;
    let startPromise: Promise<void> | null = null;

    const handleReceiveNotification = (payload: RealtimeNotificationPayload) => {
      // #region debug-point C:receive
      dbg('C', 'ReceiveNotification', {
        title: payload?.title,
        type: payload?.type,
        severity: payload?.severity,
        referenceId: payload?.referenceId,
        link: payload?.link,
      });
      // #endregion
      const severity = payload?.severity;
      const isAlert = severity === 'Critical' || severity === 'Warning';
      const isPortalRoute = window.location.pathname.startsWith('/portal');
      const isNurseRoute = window.location.pathname.startsWith('/nurse-portal');
      const isAdminRoute = window.location.pathname.startsWith('/dashboard') || window.location.pathname.startsWith('/admin');
      
      const isVitalAlert = payload?.type === NotificationType.Alert
        && Boolean(payload?.referenceId)
        && payload?.title?.includes('علائم حیاتی');
      const isMedicationAlert = payload?.type === NotificationType.Alert
        && Boolean(payload?.referenceId)
        && !payload?.title?.includes('موجودی')
        && (payload?.title?.includes('دارو') || payload?.title?.includes('کاردکس') || payload?.title?.includes('هشدار عدم ثبت مصرف دارو'));
      
      const resolvedLink = isPortalRoute && isVitalAlert
        ? `/portal?vitalId=${payload.referenceId}`
        : isPortalRoute && isMedicationAlert
          ? `/portal?doseId=${payload.referenceId}`
          : payload.link;
      // #region debug-point C:classification
      dbg('C', 'classification', {
        path: window.location.pathname,
        isPortalRoute,
        isNurseRoute,
        isAdminRoute,
        isVitalAlert,
        isMedicationAlert,
        resolvedLink: resolvedLink ?? null,
      });
      // #endregion
      
      if (!payload?.title) return;

      if (isMedicationAlert) {
        playPortalMedicationAlertTone();
        window.dispatchEvent(new CustomEvent('portal:medication-alert', {
          detail: {
            title: payload.title,
            message: payload.message,
            doseId: Number(payload.referenceId),
            severity: payload.severity,
          }
        }));
      }

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
                  {resolvedLink && (
                    <button
                      onClick={() => {
                        toast.dismiss(t.id);
                        window.location.assign(resolvedLink);
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
    };

    connection.on('ReceiveNotification', handleReceiveNotification);

    const start = async () => {
      try {
        // #region debug-point A:start
        dbg('A', 'signalr:start', { hubPath: '/notificationHub' });
        // #endregion
        startPromise = connection.start();
        await startPromise;

        if (!isActive) {
          await stopHubConnectionSafely(connection);
          return;
        }

        // #region debug-point A:join
        dbg('A', 'signalr:started', { state: connection.state });
        // #endregion
        await connection.invoke('JoinMyGroup');
        // #region debug-point A:join-success
        dbg('A', 'signalr:JoinMyGroup:success');
        // #endregion
      } catch (err) {
        if (isActive) {
          reportSignalRError('SignalR notification connection error', err);
        }
        // #region debug-point A:join-fail
        dbg('A', 'signalr:error', { error: err instanceof Error ? err.message : String(err) });
        // #endregion
      } finally {
        startPromise = null;
      }
    };

    void start();

    return () => {
      isActive = false;
      connection.off('ReceiveNotification', handleReceiveNotification);

      void (async () => {
        await stopHubConnectionSafely(connection, startPromise);
      })();
    };
  }, [isAuthenticated]);

  return null;
}
