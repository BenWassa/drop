// Service Worker for drop PWA

const APP_VERSION = '3.3.2';
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

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        return fetch(event.request)
          .then(networkResponse => {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque') {
              return networkResponse;
            }

            // Only cache requests from the same origin to avoid chrome-extension errors
            if (event.request.url.startsWith(self.location.origin)) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
            }
            return networkResponse;
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
