// WeAreImpact Admin PWA Service Worker v2
// Wereldklasse offline-first experience

const CACHE_VERSION = 'v2';
const CACHE_NAME = `weareimpact-admin-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

// Static assets to precache (only real files, no routes)
const PRECACHE_ASSETS = [
  '/manifest-admin.json',
  '/offline.html',
  '/icon-48x48.png',
  '/icon-96x96.png',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/WeAreImpact_hart.png',
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker v2...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching app assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .catch((err) => {
        console.warn('[SW] Precache failed (non-fatal):', err);
      })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker v2...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('weareimpact-admin-') && name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  // Take control of all clients immediately
  self.clients.claim();
});

// Fetch event - smart caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip API requests - always network
  if (url.pathname.startsWith('/api/')) return;

  // Skip external requests
  if (url.origin !== self.location.origin) return;

  // Skip chrome-extension and other non-http(s)
  if (!url.protocol.startsWith('http')) return;

  // Strategy: Network first, cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Only cache successful responses
        if (response.ok && response.status === 200) {
          const responseClone = response.clone();
          const contentType = response.headers.get('content-type') || '';

          // Cache static assets and HTML pages
          if (
            contentType.includes('text/html') ||
            contentType.includes('text/css') ||
            contentType.includes('application/javascript') ||
            contentType.includes('image/') ||
            contentType.includes('application/json') ||
            contentType.includes('font/')
          ) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
        }
        return response;
      })
      .catch(async () => {
        // Network failed - try cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // For navigation requests, show offline page
        if (request.mode === 'navigate') {
          const offlinePage = await caches.match(OFFLINE_URL);
          if (offlinePage) {
            return offlinePage;
          }
        }

        // Last resort
        return new Response('Offline - Geen verbinding', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      })
  );
});

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    console.log('[SW] Background sync triggered');
    // Future: retry failed POST requests
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  const data = event.data?.json() ?? {};
  const title = data.title || 'WeAreImpact Admin';
  const options = {
    body: data.body || 'Je hebt een nieuwe melding',
    icon: '/icon-192x192.png',
    badge: '/icon-96x96.png',
    vibrate: [100, 50, 100],
    tag: data.tag || 'default',
    renotify: true,
    requireInteraction: data.requireInteraction || false,
    data: {
      url: data.url || '/admin',
      timestamp: Date.now(),
    },
    actions: data.actions || [
      { action: 'open', title: 'Openen' },
      { action: 'dismiss', title: 'Sluiten' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const url = event.notification.data?.url || '/admin';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing window if open
        for (const client of clientList) {
          if (client.url.includes('/admin') && 'focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-updates') {
    console.log('[SW] Periodic sync: checking for updates');
    // Future: check for new tasks, appointments, etc.
  }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    console.log('[SW] Skip waiting requested');
    self.skipWaiting();
  }

  if (event.data?.type === 'CACHE_URLS') {
    const urls = event.data.urls || [];
    caches.open(CACHE_NAME).then((cache) => {
      cache.addAll(urls);
    });
  }
});

console.log('[SW] Service worker script loaded');
