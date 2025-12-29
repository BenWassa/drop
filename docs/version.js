// Centralized app version for easy updates
export const APP_VERSION = '4.0.0';

// Make available globally for non-module scripts (e.g., service worker)
if (typeof window !== 'undefined') {
  window.APP_VERSION = APP_VERSION;
}
if (typeof self !== 'undefined') {
  self.APP_VERSION = APP_VERSION;
}
