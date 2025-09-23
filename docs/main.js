// main.js - Main application entry point

const CONFIG = window.APP_CONFIG || {};
const $ = (id) => document.getElementById(id);
const $$ = (selector) => document.querySelectorAll(selector);

const appState = {
  currentScreen: 'today',
  todayData: {},
  streaks: {},
  mood: 4,
  online: navigator.onLine,
  syncing: false,
  disabledAspects: JSON.parse(localStorage.getItem('disabled_aspects') || '[]'),
  lastSyncTime: localStorage.getItem('last_sync_time') || 'Never',
  syncError: null,
  syncRetryCount: 0,
  transitioning: false,
  outboxCount: 0,
  visibleAspects: {}
};

// Main application initialization
(async () => {
  try {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
    }

    // Initialize UI
    initializeUI();

    // Set up online/offline detection
    window.addEventListener('online', () => {
      appState.online = true;
      updateSyncStatus('Back online');
      trySync();
    });

    window.addEventListener('offline', () => {
      appState.online = false;
      updateSyncStatus('Offline');
    });

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').then(registration => {
        console.log('SW registered:', registration);
      }).catch(error => {
        console.error('SW registration failed:', error);
      });

      navigator.serviceWorker.ready.then(registration => {
        if ('sync' in registration) {
          registration.sync.register('sync-outbox') // Correct tag
            .then(() => {
              console.log('Background sync registered');
            })
            .catch(err => {
              console.error('Background sync registration failed:', err);
            });
        }
      });
    }

    // Initial sync attempt
    if (navigator.onLine) {
      trySync();
    }

    // Periodic sync (every 5 minutes)
    setInterval(() => {
      if (navigator.onLine && !appState.syncing) {
        trySync();
      }
    }, 5 * 60 * 1000);

    console.log('Drop tracker initialized');
  } catch (error) {
    console.error('Initialization error:', error);
  }
})();
