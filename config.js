// Configure the deployed Google Apps Script URL and API key
// Example SCRIPT_URL: https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
window.APP_CONFIG = {
  SCRIPT_URL: '', // <-- set this after deploying the Apps Script
  API_KEY: '',    // optional lightweight gate (must match Apps Script)
  SYNC_INTERVAL_MS: 1000 * 60 * 1 // auto-sync every 1 minute when online
};
