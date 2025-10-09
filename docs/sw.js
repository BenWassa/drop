// Service Worker for drop PWA

const APP_VERSION = '3.0.3';
const CACHE_NAME = `drop-cache-v${APP_VERSION.replace(/\./g, '-')}`;
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icons/drop_rounded_app_icon.png',
  './icons/drop_rounded.png',
  './icons/drop_icon.svg',
  './icons/vision.svg',
  './icons/gratitude.svg',
  './icons/fitness.svg',
  './icons/mind.svg',
  './icons/sleep.svg',
  './icons/spirit.svg'
];

// Install event: Cache all the essential resources.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Fetch event: Serve from cache first, with a network fallback.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }
  const requestUrl = new URL(event.request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;

  // Treat navigations and core assets as network-first so updates flow through quickly
  const networkFirst = (
    event.request.mode === 'navigate' ||
    requestUrl.pathname.endsWith('.html') ||
    requestUrl.pathname.endsWith('.css') ||
    requestUrl.pathname.endsWith('.js') ||
    requestUrl.pathname.endsWith('.json')
  );

  if (networkFirst) {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          // Cache successful same-origin responses (non-opaque)
          if (networkResponse && networkResponse.ok && isSameOrigin && networkResponse.type !== 'opaque') {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback to cache for offline or failed network
          return caches.match(event.request).then(cached => cached || caches.match('./index.html'));
        })
    );
    return;
  }

  // Default: cache-first for static assets (images, fonts, etc.) with network fallback
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(networkResponse => {
        // Only cache same-origin, successful, non-opaque responses
        if (networkResponse && networkResponse.ok && isSameOrigin && networkResponse.type !== 'opaque') {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return networkResponse;
      }).catch(() => {
        // Nothing available
        return;
      });
    })
  );
});

// Activate event: Clean up old caches to save space.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      ).then(() => {
        console.log(`Cache updated to v${APP_VERSION}`);
        return self.clients.claim();
      });
    })
  );
});
