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

    // Defensive: detect obviously-corrupt localStorage and offer to clear it
    try {
      const params = new URLSearchParams(location.search);
      const autoClear = params.get('clear_cache') === '1';
      if (window.storageUtils && typeof window.storageUtils.isLocalStorageCorrupt === 'function') {
        const corrupt = window.storageUtils.isLocalStorageCorrupt();
        if (corrupt) {
          console.warn('Detected potentially corrupt localStorage');
          if (autoClear && window.storageUtils && typeof window.storageUtils.clearAllAppStorage === 'function') {
            await window.storageUtils.clearAllAppStorage({ clearIndexedDB: true });
            console.log('Auto-cleared app storage due to corrupt state');
            // reload to start fresh
            location.replace(location.pathname);
            return; // halt further init while reload happens
          } else {
            // Show a small banner with a clear action so users can fix without incognito
            const banner = document.createElement('div');
            banner.className = 'startup-clear-banner';
            banner.innerHTML = '<div>Detected stale or invalid local data that can hide views. <button id="startupClearBtn">Clear data</button> to recover.</div>';
            document.body.appendChild(banner);
            const btn = document.getElementById('startupClearBtn');
            if (btn) {
              btn.addEventListener('click', async () => {
                try {
                  await window.storageUtils.clearAllAppStorage({ clearIndexedDB: true });
                  location.replace(location.pathname);
                } catch (e) { console.error('Startup clear failed', e); }
              });
            }
          }
        }
      }
    } catch (e) { console.warn('Storage sanity check failed', e); }

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
