'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

interface PWAContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isOffline: boolean;
  isServiceWorkerReady: boolean;
  deferredPrompt: BeforeInstallPromptEvent | null;
  installApp: () => Promise<boolean>;
  dismissInstallPrompt: () => void;
  showInstallPrompt: boolean;
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAContext = createContext<PWAContextType>({
  isInstallable: false,
  isInstalled: false,
  isOffline: false,
  isServiceWorkerReady: false,
  deferredPrompt: null,
  installApp: async () => false,
  dismissInstallPrompt: () => {},
  showInstallPrompt: false,
});

const STORAGE_KEY = 'salmandyar-pwa-install-dismissed';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export function PWAProvider({ children }: { children: ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsInstalled(
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );

    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const registerSW = async () => {
      if (!('serviceWorker' in navigator)) return;
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });

        if (registration.active || registration.waiting) {
          setIsServiceWorkerReady(true);
        }

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              setIsServiceWorkerReady(true);
            }
          });
        });

        if (registration.waiting) {
          registration.waiting.postMessage('SKIP_WAITING');
        }
      } catch (err) {
        console.warn('[PWA] Service Worker registration failed:', err);
      }
    };

    if (process.env.NODE_ENV === 'production') {
      registerSW();
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      try {
        const dismissedAt = localStorage.getItem(STORAGE_KEY);
        if (dismissedAt) {
          const elapsed = Date.now() - parseInt(dismissedAt, 10);
          if (elapsed < DISMISS_DURATION_MS) {
            setShowInstallPrompt(false);
            return;
          }
        }
        setShowInstallPrompt(true);
      } catch {
        setShowInstallPrompt(true);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) return false;
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setShowInstallPrompt(false);
        setDeferredPrompt(null);
        return true;
      }
      return false;
    } catch (err) {
      console.error('PWA install error:', err);
      return false;
    } finally {
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  const dismissInstallPrompt = useCallback(() => {
    setShowInstallPrompt(false);
    try {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    } catch {}
  }, []);

  return (
    <PWAContext.Provider
      value={{
        isInstallable: !!deferredPrompt,
        isInstalled,
        isOffline,
        isServiceWorkerReady,
        deferredPrompt,
        installApp,
        dismissInstallPrompt,
        showInstallPrompt,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
}

export function usePWA() {
  return useContext(PWAContext);
}
