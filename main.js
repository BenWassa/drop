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
      try {
        const registration = await navigator.serviceWorker.register('sw.js');
        console.log('SW registered:', registration);

        // Set up background sync
        if ('sync' in registration) {
          await registration.sync.register('background-sync');
        }
      } catch (error) {
        console.error('SW registration failed:', error);
      }
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
