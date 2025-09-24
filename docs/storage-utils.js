// storage-utils.js - helpers to clear and validate browser storage used by the app

async function clearLocalAndSessionStorage() {
  try {
    if (window.localStorage && typeof window.localStorage.clear === 'function') {
      window.localStorage.clear();
    }
  } catch (e) {
    console.warn('Failed to clear localStorage', e);
  }
  try {
    if (window.sessionStorage && typeof window.sessionStorage.clear === 'function') {
      window.sessionStorage.clear();
    }
  } catch (e) {
    console.warn('Failed to clear sessionStorage', e);
  }
}

function clearCookies() {
  try {
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    });
  } catch (e) {
    console.warn('Failed to clear cookies', e);
  }
}

async function clearCaches() {
  if (!('caches' in window)) return;
  try {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
  } catch (e) {
    console.warn('Failed to clear caches', e);
  }
}

async function clearIndexedDB(databases = ['drop-tracker']) {
  if (!('indexedDB' in window)) return;
  try {
    // delete known DBs; deleting unknown names may fail silently in some browsers
    await Promise.all(databases.map(name => new Promise((res) => {
      try {
        const req = indexedDB.deleteDatabase(name);
        req.onsuccess = () => res();
        req.onerror = () => res();
        req.onblocked = () => res();
      } catch (e) { res(); }
    })));
  } catch (e) {
    console.warn('Failed to clear IndexedDB', e);
  }
}

async function clearAllAppStorage(opts = {}) {
  // opts: { clearIndexedDB:true }
  await clearLocalAndSessionStorage();
  clearCookies();
  await clearCaches();
  if (opts.clearIndexedDB) await clearIndexedDB(opts.databases || undefined);
}

function isLocalStorageCorrupt() {
  try {
    // Simple heuristics: important keys we expect and JSON parseability
    const disabled = localStorage.getItem('disabled_aspects');
    if (disabled && disabled.length > 10000) return true; // overly large
    if (disabled) JSON.parse(disabled);
    const cid = localStorage.getItem('drop_client_id');
    if (cid && typeof cid !== 'string') return true;
  } catch (e) {
    return true;
  }
  return false;
}

// Expose for other modules
window.storageUtils = {
  clearAllAppStorage,
  clearLocalAndSessionStorage,
  clearCookies,
  clearCaches,
  clearIndexedDB,
  isLocalStorageCorrupt
};
