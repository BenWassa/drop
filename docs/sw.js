const CACHE_NAME = 'drop-v4'; // Incremented cache name for new design and assets
const CACHE_FILES = [
  '/',
  '/index.html',
  '/style.css',
  '/manifest.json',
  '/mind.svg',
  '/fitness.svg',
  '/sleep.svg',
  '/spirit.svg',
  '/images/drop_colourized.png'
];

// Install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CACHE_FILES))
      .then(() => self.skipWaiting())
      .catch(error => console.error('Service Worker install failed:', error))
  );
});

// Activate service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
      .catch(() => {
        // Fallback for navigation requests
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
        // For other assets, you might serve a generic offline image or just let it fail
        return new Response(null, {status: 503, statusText: 'Service Unavailable'});
      })
  );
});