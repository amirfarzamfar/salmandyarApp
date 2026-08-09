'use client';

import { useEffect, useState } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { usePWA } from '@/providers/pwa-provider';
import { Button } from '@/components/ui/Button';

export function PWAInstallPrompt() {
  const { isInstalled, isInstallable, showInstallPrompt, installApp, dismissInstallPrompt } = usePWA();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (isInstalled) return null;
  if (!isInstallable) return null;
  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 md:left-auto md:max-w-sm z-[100] animate-[slideUp_0.3s_ease-out] pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)] pb-[env(safe-area-inset-bottom)]">
      <div className="relative bg-white rounded-2xl shadow-2xl shadow-gray-900/10 border border-gray-100 p-4 pr-12 overflow-hidden">
        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br from-teal-400/20 to-emerald-400/10" />

        <button
          type="button"
          onClick={dismissInstallPrompt}
          aria-label="بستن"
          className="absolute top-3 left-3 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/25">
            <Smartphone className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="text-sm font-bold text-gray-900 mb-0.5">
              نصب سالمندیار
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-3">
              برنامه را به صفحه اصلی اضافه کنید تا دسترسی سریع‌تر و تجربه بهتری داشته باشید.
            </p>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={installApp}
                className="gap-1.5 !py-2 !px-3.5 text-xs bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/25"
              >
                <Download className="w-3.5 h-3.5" />
                نصب اپلیکیشن
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={dismissInstallPrompt}
                className="!py-2 !px-3 text-xs text-gray-500 hover:text-gray-700"
              >
                بعداً
              </Button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export function OfflineBanner() {
  const { isOffline } = usePWA();
  const [mounted, setMounted] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOffline) setHidden(false);
  }, [isOffline]);

  if (!mounted) return null;
  if (!isOffline) return null;
  if (hidden) return null;

  return (
    <div
      className="fixed top-0 right-0 left-0 z-[90] bg-amber-50 border-b border-amber-200 text-amber-800 text-sm py-2 px-4 text-center flex items-center justify-center gap-2 pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)] pt-[max(0.5rem,env(safe-area-inset-top))]"
      role="alert"
    >
      <span className="inline-flex items-center gap-2">
        <span className="relative flex w-2 h-2">
          <span className="animate-ping absolute inline-flex w-full h-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex w-2 h-2 rounded-full bg-amber-500" />
        </span>
        اتصال اینترنت برقرار نیست — اطلاعات در حالت آفلاین به‌روز نمی‌باشند
      </span>
      <button
        onClick={() => setHidden(true)}
        className="mr-2 p-1 rounded-md hover:bg-amber-100 text-amber-600"
        aria-label="بستن"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
