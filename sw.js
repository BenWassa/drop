// drop-lite sw.js — cache static assets + background sync flush
const CACHE = 'drop-lite-static-v1';
const STATIC_ASSETS = [
  '/', '/index.html', '/main.js', '/config.js', '/manifest.json'
];

const CONFIG = {
  SCRIPT_URL: 'https://script.google.com/macros/s/YOUR_NEW_SCRIPT_ID_HERE/exec',
  API_KEY: '1QnI2H56tNySDZjLAKsiAAvkp7RzzvAUnfs-Hcsf6Z4S1PLgX5_HXTkQk',
};

// Minimal IndexedDB mirror for outbox flushing
const dbp = new Promise((resolve, reject) => {
  const req = indexedDB.open('drop-lite', 1);
  req.onupgradeneeded = () => {
    const db = req.result;
    if (!db.objectStoreNames.contains('entries')) {
      const s = db.createObjectStore('entries', { keyPath: 'id' });
      s.createIndex('by_createdAt', 'createdAt');
    }
    if (!db.objectStoreNames.contains('outbox')) {
      db.createObjectStore('outbox', { keyPath: 'id', autoIncrement: true });
    }
  };
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});

async function idbTx(store, mode, fn) { const db = await dbp; return new Promise((resolve, reject) => { const tx = db.transaction(store, mode); const st = tx.objectStore(store); const val = fn(st); tx.oncomplete = () => resolve(val); tx.onerror = () => reject(tx.error); }); }
async function listOutbox() { const db = await dbp; const res = []; return new Promise((resolve, reject) => { const tx = db.transaction('outbox', 'readonly'); const st = tx.objectStore('outbox').openCursor(); st.onsuccess = (e) => { const c = e.target.result; if (c) { res.push({ id: c.key, ...c.value }); c.continue(); } else resolve(res); }; tx.onerror = () => reject(tx.error); }); }
async function delOutbox(id) { return idbTx('outbox', 'readwrite', s => s.delete(id)); }
async function markSynced(localId, row) { return idbTx('entries', 'readwrite', s => { const g = s.get(localId); g.onsuccess = () => { const v = g.result; if (v) { v.synced = true; v.serverRow = row; s.put(v); } }; }); }

self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC_ASSETS)).then(() => self.skipWaiting())); });

self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });

self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);
  if (request.method === 'GET' && url.origin === location.origin) {
    e.respondWith(caches.match(request).then(cached => {
      const fetchPromise = fetch(request).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(request, copy)); return res; }).catch(() => cached);
      return cached || fetchPromise;
    }));
    return;
  }
});

self.addEventListener('sync', (e) => { if (e.tag === 'sync-outbox') { e.waitUntil(flushOutbox()); } });

async function flushOutbox() {
  const q = await listOutbox(); if (!q.length) return;
  try {
    const ops = q.map(({ id, ...rest }) => rest);
    const res = await fetch((CONFIG.SCRIPT_URL || '') + '?action=append', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Api-Key': CONFIG.API_KEY || '' }, body: JSON.stringify({ ops }) });
    if (!res.ok) throw new Error('sync failed: ' + res.status);
    const data = await res.json();
    for (const r of data.results || []) await markSynced(r.localId, r.row);
    for (const it of await listOutbox()) await delOutbox(it.id);
  } catch (err) {
    // retry later
  }
}

