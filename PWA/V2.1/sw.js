const CACHE_NAME = 'drop-v2'; // Incremented cache name to force update
const CACHE_FILES = [
  '/',
  '/index.html',
  '/style.css' // Added the new stylesheet to the cache
];

// Install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(CACHE_FILES);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName); // Deletes old caches (like 'drop-v1')
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch strategy (unchanged)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
      .catch(() => {
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});