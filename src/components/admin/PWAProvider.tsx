'use client';

import { useEffect, useState, useCallback } from 'react';
import { Download, X, RefreshCw, Sparkles } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // Update service worker
  const updateServiceWorker = useCallback(() => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      setShowUpdateBanner(false);
      window.location.reload();
    }
  }, [waitingWorker]);

  useEffect(() => {
    // Track online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('[PWA] Service Worker registered:', registration.scope);

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60 * 1000); // Every minute

          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available
                  console.log('[PWA] New version available');
                  setWaitingWorker(newWorker);
                  setShowUpdateBanner(true);
                }
              });
            }
          });

          // Check if there's already a waiting worker
          if (registration.waiting) {
            setWaitingWorker(registration.waiting);
            setShowUpdateBanner(true);
          }
        })
        .catch((error) => {
          console.error('[PWA] Service Worker registration failed:', error);
        });

      // Handle controller change (new SW took over)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[PWA] New service worker activated');
      });
    }

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      console.log('[PWA] Install prompt available');
      setInstallPrompt(e as BeforeInstallPromptEvent);

      // Check if we should show the banner
      const lastDismissed = localStorage.getItem('pwa-install-dismissed');
      const isInstalled = localStorage.getItem('pwa-installed');

      if (!isInstalled && (!lastDismissed || Date.now() - parseInt(lastDismissed) > 3 * 24 * 60 * 60 * 1000)) {
        // Show after 3 days or if never dismissed
        setTimeout(() => setShowInstallBanner(true), 2000); // Delay for better UX
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Track install
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App installed!');
      localStorage.setItem('pwa-installed', 'true');
      setShowInstallBanner(false);
      setInstallPrompt(null);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('[PWA] User accepted install');
        localStorage.setItem('pwa-installed', 'true');
      } else {
        console.log('[PWA] User dismissed install');
      }
    } catch (err) {
      console.error('[PWA] Install error:', err);
    }

    setInstallPrompt(null);
    setShowInstallBanner(false);
  };

  const dismissInstallBanner = () => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    setShowInstallBanner(false);
  };

  return (
    <>
      {children}

      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed top-16 left-0 right-0 z-50 bg-amber-500 text-white text-center py-2 text-sm font-medium lg:left-64">
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Je bent offline - sommige functies werken mogelijk niet
          </span>
        </div>
      )}

      {/* Update Banner */}
      {showUpdateBanner && (
        <div className="fixed bottom-20 left-4 right-4 lg:bottom-4 lg:left-auto lg:right-4 lg:w-80 z-50 animate-in slide-in-from-bottom duration-300">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-4 text-white">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <RefreshCw className="text-white" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">Update beschikbaar</h3>
                <p className="text-xs text-blue-100 mt-0.5">
                  Er is een nieuwe versie van de app
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={updateServiceWorker}
                    className="px-3 py-1.5 bg-white text-blue-600 text-xs font-medium rounded-lg transition-colors hover:bg-blue-50"
                  >
                    Nu updaten
                  </button>
                  <button
                    onClick={() => setShowUpdateBanner(false)}
                    className="px-3 py-1.5 text-blue-100 hover:text-white text-xs transition-colors"
                  >
                    Later
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowUpdateBanner(false)}
                className="text-blue-200 hover:text-white p-1"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Install Banner */}
      {showInstallBanner && installPrompt && !showUpdateBanner && (
        <div className="fixed bottom-20 left-4 right-4 lg:bottom-4 lg:left-auto lg:right-4 lg:w-80 z-50 animate-in slide-in-from-bottom duration-300">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/30">
                <Sparkles className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 text-sm">
                  Installeer de app
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Snellere toegang tot Iris, je agenda en CRM
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleInstall}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs font-medium rounded-lg transition-all shadow-md shadow-orange-500/30 flex items-center gap-1.5"
                  >
                    <Download size={14} />
                    Installeren
                  </button>
                  <button
                    onClick={dismissInstallBanner}
                    className="px-3 py-2 text-slate-500 hover:text-slate-700 text-xs transition-colors"
                  >
                    Niet nu
                  </button>
                </div>
              </div>
              <button
                onClick={dismissInstallBanner}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
