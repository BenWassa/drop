// drop-lite main.js — IndexedDB outbox, sync to Apps Script
const CONFIG = window.APP_CONFIG || {};

const $ = id => document.getElementById(id);

// Stable client id for dedup server-side
function getClientId() {
  let id = localStorage.getItem('drop_client_id');
  if (!id) {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    id = Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
    localStorage.setItem('drop_client_id', id);
  }
  return id;
}

// IndexedDB wrapper
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

async function idbTx(store, mode, fn) {
  const db = await dbp;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode);
    const st = tx.objectStore(store);
    const val = fn(st);
    tx.oncomplete = () => resolve(val);
    tx.onerror = () => reject(tx.error);
  });
}

const idb = {
  async addEntry(entry) { return idbTx('entries', 'readwrite', s => s.put(entry)); },
  async listEntries(limit = 200) {
    const db = await dbp;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('entries', 'readonly');
      const st = tx.objectStore('entries').index('by_createdAt');
      const res = [];
      st.openCursor(null, 'prev').onsuccess = (e) => {
        const c = e.target.result; if (c && res.length < limit) { res.push(c.value); c.continue(); } else resolve(res);
      };
      tx.onerror = () => reject(tx.error);
    });
  },
  async putOutbox(op) { return idbTx('outbox', 'readwrite', s => s.add(op)); },
  async listOutbox(limit = 1000) {
    const db = await dbp; const res = [];
    return new Promise((resolve, reject) => {
      const tx = db.transaction('outbox', 'readonly');
      const st = tx.objectStore('outbox').openCursor();
      st.onsuccess = (e) => { const c = e.target.result; if (c && res.length < limit) { res.push({ id: c.key, ...c.value }); c.continue(); } else resolve(res); };
      tx.onerror = () => reject(tx.error);
    });
  },
  async delOutbox(id) { return idbTx('outbox', 'readwrite', s => s.delete(id)); },
  async markSynced(localId, serverRow) {
    return idbTx('entries', 'readwrite', s => {
      const getReq = s.get(localId);
      getReq.onsuccess = () => {
        const v = getReq.result; if (!v) return; v.synced = true; v.serverRow = serverRow; s.put(v);
      };
    });
  }
};

const state = { online: navigator.onLine, syncing: false };

function updateStatusDisplay(queueCount) {
  const el = $('status');
  if (!el) return;
  el.textContent = `${state.online ? 'Online' : 'Offline'} · Queue: ${typeof queueCount === 'number' ? queueCount : '…'}`;
}

async function renderList() {
  const items = await idb.listEntries(200);
  const list = $('items');
  if (!list) return;
  list.innerHTML = items.map(e => {
    const title = e.title ? e.title.replace(/</g, '&lt;') : 'Untitled';
    const note = e.note ? `<div style="margin-top:6px">${e.note.replace(/</g, '&lt;')}</div>` : '';
    return `<li class="item"> <div><strong>${title}</strong></div><div class="meta">${new Date(e.createdAt).toLocaleString()} · ${e.synced ? 'synced ✓' : 'local'}</div>${note}</li>`;
  }).join('');
}

async function updateQueueCount() { const q = await idb.listOutbox(); updateStatusDisplay(q.length); }

async function addEntry() {
  const title = ($('title') || { value: '' }).value.trim();
  const note = ($('note') || { value: '' }).value.trim();
  if (!title && !note) return;
  const entry = { id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, clientId: getClientId(), createdAt: Date.now(), title, note, synced: false };
  await idb.addEntry(entry);
  await idb.putOutbox({ type: 'ADD_ENTRY', payload: entry, ts: Date.now() });
  if ($('title')) $('title').value = '';
  if ($('note')) $('note').value = '';
  await renderList(); await updateQueueCount(); try { await trySync(); } catch (e) { /* ignore */ }
}

async function trySync() {
  if (state.syncing) return;
  const q = await idb.listOutbox();
  if (!q.length) return;
  if (!navigator.onLine) return;
  state.syncing = true; updateStatusDisplay(q.length);
  const ops = q.map(({ id, ...rest }) => rest);
  try {
    const res = await fetch((CONFIG.SCRIPT_URL || '') + '?action=append', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Api-Key': CONFIG.API_KEY || '' }, body: JSON.stringify({ ops })
    });
    if (!res.ok) throw new Error('bad status ' + res.status);
    const data = await res.json();
    for (const r of data.results || []) { await idb.markSynced(r.localId, r.row); }
    // remove processed outbox items (assumes order)
    const ids = (await idb.listOutbox()).slice(0, (data.results || []).length).map(x => x.id);
    for (const id of ids) await idb.delOutbox(id);
  } catch (e) {
    console.warn('sync failed', e);
  } finally {
    state.syncing = false; await updateQueueCount(); await renderList();
  }
}

// UI wiring
$('add')?.addEventListener('click', addEntry);
$('sync')?.addEventListener('click', trySync);
window.addEventListener('online', () => { state.online = true; updateStatusDisplay(); trySync(); });
window.addEventListener('offline', () => { state.online = false; updateStatusDisplay(); });
updateStatusDisplay(); renderList().then(updateQueueCount);

// Register SW and request Background Sync if available
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then(reg => {
    if ('sync' in reg) {
      // attempt a background sync registration (no harm if unsupported)
      reg.sync.register('sync-outbox').catch(()=>{});
    }
  }).catch(e => console.warn('SW register failed', e));
}
