// data.js - Data layer: IndexedDB operations and data models

const DOMAINS = {
  sleep: ['wake', 'rest'],
  fitness: ['run', 'strength', 'skill'],
  mind: ['read', 'write'],
  spirit: ['stress', 'meditation']
};

const ASPECT_LABELS = {
  wake: 'Wake',
  rest: 'Rest',
  run: 'Run',
  strength: 'Strength',
  skill: 'Skill',
  read: 'Read',
  write: 'Write',
  stress: 'Stress',
  meditation: 'Meditation'
};

const TOTAL_ASPECTS = Object.values(DOMAINS).reduce((sum, aspects) => sum + aspects.length, 0);

function getClientId() {
  let id = localStorage.getItem('drop_client_id');
  if (!id) {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    id = Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
    localStorage.setItem('drop_client_id', id);
  }
  return id;
}

function isUsingMock() {
  return localStorage.getItem('use_mock_data') === '1';
}

// Ensure required object stores exist. If any are missing, perform an upgrade by opening
// the DB with version+1 and creating the missing stores. Returns the upgraded db instance.
async function ensureStoresExist(storeNames = []) {
  // If another upgrade is in progress, wait for it to finish and re-check
  if (typeof window !== 'undefined' && window.__DB_UPGRADE_LOCK) {
    try { await window.__DB_UPGRADE_LOCK; } catch (e) { /* ignore */ }
  }

  const db = await dbp;
  const missing = storeNames.filter(name => !db.objectStoreNames.contains(name));
  if (missing.length === 0) return db;

  // Close current connection then upgrade
  try { db.close(); } catch (e) {}
  // If running in test mode, avoid performing an actual indexedDB upgrade (tests use an in-memory mock)
  if (typeof window !== 'undefined' && window.__TESTING__) {
    try {
      missing.forEach(name => {
        if (!db.objectStoreNames.contains(name) && typeof db.createObjectStore === 'function') {
          db.createObjectStore(name, { keyPath: 'id' });
        }
      });
      return db;
    } catch (e) {
      // fallback to normal upgrade flow below if test short-circuit fails
    }
  }

  // Create a lock promise so concurrent callers wait for this upgrade to finish
  var lockResolve;
  if (typeof window !== 'undefined') {
    window.__DB_UPGRADE_LOCK = new Promise(function(res) { lockResolve = res; });
  }

  // Open without specifying a low fixed version; use db.version+1 to force an upgrade
  const req = indexedDB.open('drop-tracker', db.version + 1);

  // While the upgrade request is pending, make sure any callers awaiting
  // window.dbp will wait for this new connection rather than getting the
  // old (and soon-to-be-closed) DB. Assign a pending promise to window.dbp
  // immediately so concurrent callers won't attempt transactions on a
  // closing connection.
  if (typeof window !== 'undefined') {
    window.dbp = new Promise((res, rej) => {
      req.onsuccess = () => {
        try { res(req.result); } catch (e) { /* ignore */ }
      };
      req.onerror = () => {
        try { rej(req.error || new Error('DB upgrade failed')); } catch (e) {}
      };
    });
  }

  req.onupgradeneeded = () => {
    const upg = req.result;
    missing.forEach(name => {
      try {
        if (name === 'mock_entries') {
          const s = upg.createObjectStore('mock_entries', { keyPath: 'id' });
          s.createIndex('by_date', 'date');
        } else if (name === 'mock_outbox') {
          upg.createObjectStore('mock_outbox', { keyPath: 'id', autoIncrement: true });
        } else if (name === 'mock_audio_notes') {
          const s = upg.createObjectStore('mock_audio_notes', { keyPath: 'id' });
          s.createIndex('by_date', 'date');
        }
      } catch (e) {
        // ignore create errors if store already exists (race conditions)
      }
    });
  };

  return await new Promise((resolve, reject) => {
    // wire up success/error handlers; we also clear the upgrade lock here
    const onSuccess = () => {
      try { if (lockResolve) lockResolve(); } catch (e) {}
      if (typeof window !== 'undefined') window.__DB_UPGRADE_LOCK = null;
      // ensure window.dbp resolves to the fresh DB (the promise above already does this)
      try { resolve(req.result); } catch (e) { resolve(req.result); }
    };

    const onError = async () => {
      const err = req.error || new Error('DB upgrade failed');
      // Fallback for test/mock environments: if the existing db object
      // supports createObjectStore (our in-memory mock), create the stores
      // directly and return the original db instead of failing.
      try {
        if (db && typeof db.createObjectStore === 'function') {
          missing.forEach(name => {
            try {
              if (!db.objectStoreNames.contains(name) && typeof db.createObjectStore === 'function') {
                db.createObjectStore(name, { keyPath: 'id' });
                try { /* best-effort index creation not available on some mocks */ } catch (e) {}
              }
            } catch (e) {}
          });
          try { if (typeof window !== 'undefined') window.dbp = Promise.resolve(db); } catch (e) {}
          try { if (lockResolve) lockResolve(); } catch (e) {}
          if (typeof window !== 'undefined') window.__DB_UPGRADE_LOCK = null;
          return resolve(db);
        }
      } catch (e) {}

      // If we couldn't patch the mock DB, attempt to refresh a fresh DB connection and retry once
      try {
        const refreshed = await (async function refreshDb() {
          return new Promise((res, rej) => {
            try {
              const r = indexedDB.open('drop-tracker');
              r.onsuccess = function() { try { if (typeof window !== 'undefined') window.dbp = Promise.resolve(r.result); } catch (e) {} ; res(r.result); };
              r.onerror = function() { rej(r.error || new Error('refresh open failed')); };
            } catch (e) { rej(e); }
          });
        })();
        try { if (lockResolve) lockResolve(); } catch (e) {}
        if (typeof window !== 'undefined') window.__DB_UPGRADE_LOCK = null;
        return resolve(refreshed);
      } catch (e) {
        try { if (lockResolve) lockResolve(); } catch (err2) {}
        if (typeof window !== 'undefined') window.__DB_UPGRADE_LOCK = null;
        return reject(err);
      }
    };

    req.onsuccess = onSuccess;
    req.onerror = onError;
  });
}

const dbp = window.dbp || new Promise((resolve, reject) => {
  // Open DB without hard-coded version so we don't request a lower version than other contexts
  const req = indexedDB.open('drop-tracker');
  req.onupgradeneeded = () => {
    const db = req.result;
    if (!db.objectStoreNames.contains('entries')) {
      const store = db.createObjectStore('entries', { keyPath: 'id' });
      store.createIndex('by_date', 'date');
    }
    if (!db.objectStoreNames.contains('outbox')) {
      db.createObjectStore('outbox', { keyPath: 'id', autoIncrement: true });
    }
    if (!db.objectStoreNames.contains('audio_notes')) {
      const store = db.createObjectStore('audio_notes', { keyPath: 'id' });
      store.createIndex('by_date', 'date');
    }
    // sandboxed audio notes for mock mode
    if (!db.objectStoreNames.contains('mock_audio_notes')) {
      const store = db.createObjectStore('mock_audio_notes', { keyPath: 'id' });
      store.createIndex('by_date', 'date');
    }
    // mock_entries is a sandbox store for developer/mock data so we don't overwrite real entries
    if (!db.objectStoreNames.contains('mock_entries')) {
      const mockStore = db.createObjectStore('mock_entries', { keyPath: 'id' });
      mockStore.createIndex('by_date', 'date');
    }
    if (!db.objectStoreNames.contains('mock_outbox')) {
      db.createObjectStore('mock_outbox', { keyPath: 'id', autoIncrement: true });
    }
  };
  req.onsuccess = () => resolve(req.result);
  req.onerror = (e) => {
    // If the upgrade fails because an older tab has the DB open, provide a helpful message
    console.error('IndexedDB open error', e);
    reject(req.error || e);
  };
});

async function saveEntry(domain, aspect, completed) {
  if (!DOMAINS[domain] || !DOMAINS[domain].includes(aspect)) {
    console.error('Invalid domain or aspect:', domain, aspect);
    return;
  }
  const today = new Date().toISOString().split('T')[0];
  const id = `${today}-${domain}-${aspect}`;
  const streak = completed ? await getCurrentStreak(domain, aspect) : 0;
  const entry = {
    id,
    clientId: getClientId(),
    date: today,
    domain,
    aspect,
    completed: Boolean(completed),
    streak: Math.max(0, streak),
    timestamp: Date.now(),
    synced: false
  };

  const useMock = isUsingMock();
  const entriesStoreName = useMock ? 'mock_entries' : 'entries';
  const outboxStoreName = useMock ? 'mock_outbox' : 'outbox';
  // Ensure the target stores exist before attempting the transaction
  await ensureStoresExist([entriesStoreName, outboxStoreName]);
  const db = await dbp;
  const tx = db.transaction([entriesStoreName, outboxStoreName], 'readwrite');
  tx.objectStore(entriesStoreName).put(entry);
  // mark outbox payload as mock if writing to mock outbox
  tx.objectStore(outboxStoreName).add({ type: 'ENTRY', payload: entry, ts: Date.now(), __mock: useMock });

  await calculateStreaks();
  window.renderAspectsManager();
  window.updateProgress();
  if (typeof window.updateOutboxCount === 'function') {
    await window.updateOutboxCount();
  }
}

function updateStreaks(domain, aspect, completed) {
  const key = `${domain}-${aspect}`;
  if (!appState.streaks[key]) {
    appState.streaks[key] = 0;
  }
  if (completed) {
    appState.streaks[key] += 1;
  } else {
    appState.streaks[key] = 0;
  }
}

async function calculateStreaks() {
  const allEntries = await getAllEntries();

  // Group entries by aspect
  const aspectData = {};
  allEntries.forEach(entry => {
    if (entry.domain && entry.aspect && entry.completed) {
      const key = `${entry.domain}-${entry.aspect}`;
      if (!aspectData[key]) {
        aspectData[key] = [];
      }
      aspectData[key].push(entry.date);
    }
  });

  // Calculate current streaks
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  Object.keys(aspectData).forEach(key => {
    const dates = aspectData[key].sort();
    let streak = 0;
    let currentDate = today;

    // Check if completed today or yesterday to continue streak
    while (dates.includes(currentDate) || (currentDate === yesterday && dates.includes(today))) {
      streak++;
      const prevDate = new Date(currentDate);
      prevDate.setDate(prevDate.getDate() - 1);
      currentDate = prevDate.toISOString().split('T')[0];
    }

    appState.streaks[key] = streak;
  });

  // Initialize streaks for aspects with no data
  Object.entries(DOMAINS).forEach(([domain, aspects]) => {
    aspects.forEach(aspect => {
      const key = `${domain}-${aspect}`;
      if (!(key in appState.streaks)) {
        appState.streaks[key] = 0;
      }
    });
  });
}

async function getCurrentStreak(domain, aspect) {
  const allEntries = await getAllEntries();
  const key = `${domain}-${aspect}`;
  const dates = allEntries
    .filter(entry => entry.domain === domain && entry.aspect === aspect && entry.completed)
    .map(entry => entry.date)
    .sort();

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let streak = 0;
  let currentDate = today;

  while (dates.includes(currentDate) || (currentDate === yesterday && dates.includes(today))) {
    streak++;
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    currentDate = prevDate.toISOString().split('T')[0];
  }

  return streak;
}

async function saveReflection() {
  const note = $('reflectionNote')?.value.trim() || '';
  const sanitizedNote = note.replace(/[<>\"']/g, '').substring(0, 500); // Basic sanitization
  const today = new Date().toISOString().split('T')[0];
  const entry = {
    id: `${today}-reflection`,
    clientId: getClientId(),
    date: today,
    type: 'reflection',
    mood: Math.max(1, Math.min(5, appState.mood)), // Clamp mood
    note: sanitizedNote,
    timestamp: Date.now(),
    synced: false
  };

  const useMock = isUsingMock();
  const entriesStoreName = useMock ? 'mock_entries' : 'entries';
  const outboxStoreName = useMock ? 'mock_outbox' : 'outbox';
  // Ensure the target stores exist before attempting the transaction
  await ensureStoresExist([entriesStoreName, outboxStoreName]);
  const db = await dbp;
  const tx = db.transaction([entriesStoreName, outboxStoreName], 'readwrite');
  tx.objectStore(entriesStoreName).put(entry);
  tx.objectStore(outboxStoreName).add({ type: 'REFLECTION', payload: entry, ts: Date.now(), __mock: useMock });
  const noteField = $('reflectionNote');
  if (noteField) {
    noteField.value = '';
  }

  const saveButton = $('saveReflection');
  if (saveButton) {
    const originalText = saveButton.textContent;
    saveButton.textContent = 'LOGGED';
    saveButton.classList.add('saved');
    setTimeout(() => {
      saveButton.textContent = originalText || 'LOG REFLECTION';
      saveButton.classList.remove('saved');
    }, 2000);
  }

  // Return the saved entry for tests and callers that need the created object
  return entry;
}


async function exportToCSV(download = true) {
  try {
    const entries = await getAllEntries();

    const header = ['id', 'date', 'domain', 'aspect', 'completed', 'streak', 'type', 'mood', 'note', 'timestamp', 'synced'];
    const rows = entries.map((entry) =>
      header
        .map((key) => {
          const value = entry[key];
          if (value === undefined || value === null) {
            return '';
          }
          const text = String(value).replace(/"/g, '""');
          return `"${text}"`;
        })
        .join(',')
    );

    const csvContent = [header.join(','), ...rows].join('\n');

    if (download) {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const today = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `drop-entries-${today}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    // Return CSV content for testing/inspection
    return csvContent;
  } catch (error) {
    console.error('Export failed:', error);
    return null;
  }
}

async function loadTodayData() {
  const today = new Date().toISOString().split('T')[0];
  const entries = await getEntriesByDate(today);

  entries.forEach((entry) => {
    if (entry && entry.domain && DOMAINS[entry.domain] && DOMAINS[entry.domain].includes(entry.aspect) && typeof entry.completed === 'boolean') {
      appState.todayData[entry.domain][entry.aspect] = Boolean(entry.completed);
      const toggle = document.querySelector(
        `.aspect-toggle[data-domain="${entry.domain}"][data-aspect="${entry.aspect}"]`
      );
      if (toggle) {
        toggle.classList.toggle('completed', Boolean(entry.completed));
      }
    }
    if (entry && entry.type === 'reflection' && entry.mood >= 1 && entry.mood <= 5) {
      appState.mood = entry.mood;
    }
  });

  $$('.mood-option').forEach(option => {
    option.classList.toggle('selected', Number(option.dataset.mood) === appState.mood);
  });

  await calculateStreaks();
  renderAspectsManager();
  updateProgress();
  updateVisibleAspects();
  renderAudioNotes();
}

// Audio notes functions
async function saveAudioNote(date, blob, transcription = '') {
  const useMock = isUsingMock();
  const storeName = useMock ? 'mock_audio_notes' : 'audio_notes';
  await ensureStoresExist([storeName]);
  const db = await dbp;
  const id = `${date}-audio-${Date.now()}`;
  const entry = { id, date, blob, transcription, timestamp: new Date(), __mock: useMock };
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.add(entry);
    req.onsuccess = () => resolve(id);
    req.onerror = () => reject(req.error);
  });
}

async function getAudioNotes(date) {
  try {
    const useMock = isUsingMock();
    const storeName = useMock ? 'mock_audio_notes' : 'audio_notes';
    // Ensure store exists (best-effort). If it still doesn't exist, return empty list.
    try { await ensureStoresExist([storeName]); } catch (e) { /* ignore upgrade failures */ }
    const db = await dbp;
    if (!db.objectStoreNames.contains(storeName)) {
      return [];
    }
    return await new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        // Some stores may lack the index on older installs; guard against that
        let index;
        try { index = store.index('by_date'); } catch (e) { index = null; }
        if (!index) {
          // Fallback: return all and filter by date in JS
          const req = store.getAll();
          req.onsuccess = () => resolve((req.result || []).filter(r => r.date === date));
          req.onerror = () => resolve([]);
          return;
        }
        const req = index.getAll(date);
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      } catch (err) {
        console.warn('getAudioNotes failed', err);
        resolve([]);
      }
    });
  } catch (err) {
    console.warn('getAudioNotes outer failure', err);
    return [];
  }
}

async function updateAudioTranscription(id, transcription) {
  const useMock = isUsingMock();
  const storeName = useMock ? 'mock_audio_notes' : 'audio_notes';
  await ensureStoresExist([storeName]);
  const db = await dbp;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.get(id);
    req.onsuccess = () => {
      const entry = req.result;
      if (entry) {
        entry.transcription = transcription;
        store.put(entry);
      }
      resolve();
    };
    req.onerror = () => reject(req.error);
  });
}

// Expose functions for testing
window.getClientId = getClientId;
window.saveReflection = saveReflection;
window.exportToCSV = exportToCSV;
window.saveAudioNote = saveAudioNote;
window.getAudioNotes = getAudioNotes;
window.updateAudioTranscription = updateAudioTranscription;

// Export all data (real or mock) as JSON for backup. If `mode` is 'both' returns both real and mock as separate keys.
async function exportAllData({ mode = 'current' } = {}) {
  const db = await dbp;
  const result = {};
  const wantReal = mode === 'current' ? !isUsingMock() : true;
  const wantMock = mode === 'current' ? isUsingMock() : (mode === 'both');
  // helper to safely get all records from a store if it exists
  async function safeGetAll(storeName) {
    if (!db.objectStoreNames.contains(storeName)) {
      return [];
    }
    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      } catch (err) {
        // If anything goes wrong, return empty array rather than throwing
        console.warn('safeGetAll failed for', storeName, err);
        resolve([]);
      }
    });
  }

  if (wantReal) {
    result.entries = await safeGetAll('entries');
    result.outbox = await safeGetAll('outbox');
    result.audio_notes = await safeGetAll('audio_notes');
  }

  if (wantMock) {
    result.mock_entries = await safeGetAll('mock_entries');
    result.mock_outbox = await safeGetAll('mock_outbox');
    result.mock_audio_notes = await safeGetAll('mock_audio_notes');
  }

  return result;
}

window.exportAllData = exportAllData;

// Developer: seed and clear mock data
async function seedMockData(days = 7) {
  // Ensure mock stores exist before attempting to write
  await ensureStoresExist(['mock_entries', 'mock_outbox', 'mock_audio_notes']);
  const db = await dbp;
  const tx = db.transaction(['mock_entries', 'mock_outbox'], 'readwrite');
  const entriesStore = tx.objectStore('mock_entries');
  const outbox = tx.objectStore('mock_outbox');

  const today = new Date();
  for (let d = 0; d < days; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() - d);
    const dateStr = date.toISOString().split('T')[0];

    Object.entries(DOMAINS).forEach(([domain, aspects]) => {
      aspects.forEach(aspect => {
        const completed = Math.random() > 0.3; // ~70% complete
        const id = `${dateStr}-${domain}-${aspect}`;
        const entry = {
          id,
          clientId: getClientId(),
          date: dateStr,
          domain,
          aspect,
          completed: Boolean(completed),
          streak: 0,
          timestamp: Date.now(),
          synced: false,
          __mock: true
        };
        entriesStore.put(entry);
        outbox.add({ type: 'ENTRY', payload: entry, ts: Date.now(), __mock: true });
      });
    });

    // Add a reflection for the day
    const reflection = {
      id: `${dateStr}-reflection`,
      clientId: getClientId(),
      date: dateStr,
      type: 'reflection',
      mood: Math.ceil(Math.random() * 5),
      note: d === 0 ? 'Today felt productive (mock)' : 'Mock data reflection',
      timestamp: Date.now(),
      synced: false,
      __mock: true
    };
    entriesStore.put(reflection);
    outbox.add({ type: 'REFLECTION', payload: reflection, ts: Date.now(), __mock: true });
    // Add a small mock audio note for today (first day only)
    if (d === 0) {
      try {
        const audioStore = db.transaction('mock_audio_notes', 'readwrite').objectStore('mock_audio_notes');
        const audioId = `${dateStr}-audio-mock`;
        // Create a minimal non-empty blob to avoid range request errors in some browsers
        const blob = new Blob(['\0'], { type: 'audio/mpeg' });
        const audioEntry = { id: audioId, date: dateStr, blob, transcription: 'Mock audio note', timestamp: Date.now(), __mock: true };
        audioStore.put(audioEntry);
      } catch (e) {
        // ignore audio seed failures
      }
    }
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error || new Error('Transaction failed'));
  });
}

async function clearMockData() {
  // Ensure mock stores exist before attempting to clear
  await ensureStoresExist(['mock_entries', 'mock_outbox', 'mock_audio_notes']);
  const db = await dbp;
  const tx = db.transaction(['mock_entries', 'mock_outbox'], 'readwrite');
  const entriesStore = tx.objectStore('mock_entries');
  const outbox = tx.objectStore('mock_outbox');

  const allEntries = await new Promise((resolve, reject) => {
    const req = entriesStore.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });

  for (const entry of allEntries) {
    try {
      entriesStore.delete(entry.id);
    } catch (e) {
      // ignore per-entry failures
    }
  }

  const allOutbox = await new Promise((resolve, reject) => {
    const req = outbox.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });

  for (const o of allOutbox) {
    try {
      outbox.delete(o.id);
    } catch (e) {}
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error || new Error('Transaction failed'));
  });
}

async function getMockEntries(date) {
  await ensureStoresExist(['mock_entries']);
  const db = await dbp;
  const tx = db.transaction('mock_entries', 'readonly');
  const store = tx.objectStore('mock_entries');
  if (date) {
    const index = store.index('by_date');
    return new Promise((resolve, reject) => {
      const req = index.getAll(date);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

async function getMockOutbox() {
  await ensureStoresExist(['mock_outbox']);
  const db = await dbp;
  const tx = db.transaction('mock_outbox', 'readonly');
  const store = tx.objectStore('mock_outbox');
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

// Data access helpers that respect mock mode
async function getAllEntries() {
  await ensureStoresExist(['entries','mock_entries']);
  const db = await dbp;
  const useMock = isUsingMock();
  const storeName = useMock ? 'mock_entries' : 'entries';
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

async function getEntriesByDate(date) {
  await ensureStoresExist(['entries','mock_entries']);
  const db = await dbp;
  const useMock = isUsingMock();
  const storeName = useMock ? 'mock_entries' : 'entries';
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);
  const index = store.index('by_date');
  return new Promise((resolve, reject) => {
    const req = index.getAll(date);
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

window.seedMockData = seedMockData;
window.clearMockData = clearMockData;
window.getMockEntries = getMockEntries;
window.getMockOutbox = getMockOutbox;
window.getAllEntries = getAllEntries;
window.getEntriesByDate = getEntriesByDate;
window.isUsingMock = isUsingMock;
window.ensureStoresExist = ensureStoresExist;