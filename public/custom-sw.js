// Import Workbox scripts
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

// Use Workbox modules
const { precacheAndRoute } = workbox.precaching;
const { registerRoute } = workbox.routing;
const { CacheFirst, NetworkFirst } = workbox.strategies;
const { ExpirationPlugin } = workbox.expiration;
const { CacheableResponsePlugin } = workbox.cacheableResponse;

// Precache manifest will be injected by vite-plugin-pwa
precacheAndRoute(self.__WB_MANIFEST || []);

// Cache Google Fonts stylesheets
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com',
  new CacheFirst({
    cacheName: 'google-fonts-stylesheets',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
      }),
    ],
  })
);

// Cache Google Fonts webfonts
registerRoute(
  ({ url }) => url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
      }),
    ],
  })
);

// CRITICAL: Do NOT cache storage media (audio/video) - let browser handle Range requests directly
const { NetworkOnly } = workbox.strategies;

registerRoute(
  ({ url }) => url.hostname.includes('supabase.co') && 
               (url.pathname.includes('/storage/v1/object/') || 
                url.pathname.includes('/storage/v1/render/')),
  new NetworkOnly()
);

// Cache Supabase API requests with NetworkFirst strategy (excluding storage)
registerRoute(
  ({ url }) => url.hostname.includes('supabase.co') && 
               !url.pathname.includes('/storage/v1/object/') &&
               !url.pathname.includes('/storage/v1/render/'),
  new NetworkFirst({
    cacheName: 'supabase-api',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 5, // 5 minutes
      }),
    ],
  })
);

// ==================== PUSH NOTIFICATION HANDLING ====================

// Handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received:', event);
  
  let data = {};
  
  if (event.data) {
    try {
      data = event.data.json();
      console.log('[SW] Push data:', data);
    } catch (e) {
      console.error('[SW] Error parsing push data:', e);
      data = { title: 'התראה חדשה', body: event.data.text() };
    }
  }
  
  const title = data.title || 'מיינד האקר';
  const options = {
    body: data.body || data.message || 'יש לך התראה חדשה',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [100, 50, 100],
    tag: data.tag || 'notification-' + Date.now(),
    renotify: true,
    requireInteraction: false,
    data: {
      url: data.url || data.link || '/',
      timestamp: Date.now()
    },
    actions: data.actions || []
  };
  
  console.log('[SW] Showing notification:', title, options);
  
  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => console.log('[SW] Notification shown successfully'))
      .catch(err => console.error('[SW] Failed to show notification:', err))
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open with our app
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            if (urlToOpen !== '/') {
              client.navigate(urlToOpen);
            }
            return;
          }
        }
        // If no window is open, open a new one
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

// ==================== BADGE API HANDLER ====================

self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SET_BADGE') {
    const count = event.data.count;
    if ('setAppBadge' in navigator) {
      if (count > 0) {
        navigator.setAppBadge(count).catch(console.error);
      } else {
        navigator.clearAppBadge().catch(console.error);
      }
    }
  }
  
  // Handle skip waiting
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ==================== SERVICE WORKER LIFECYCLE ====================

// Skip waiting and claim clients immediately
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(self.clients.claim());
});
