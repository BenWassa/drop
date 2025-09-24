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

const dbp = window.dbp || new Promise((resolve, reject) => {
  const req = indexedDB.open('drop-tracker', 2);
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

  const db = await dbp;
  const useMock = isUsingMock();
  const entriesStoreName = useMock ? 'mock_entries' : 'entries';
  const outboxStoreName = useMock ? 'mock_outbox' : 'outbox';
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

  const db = await dbp;
  const useMock = isUsingMock();
  const entriesStoreName = useMock ? 'mock_entries' : 'entries';
  const outboxStoreName = useMock ? 'mock_outbox' : 'outbox';
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
  const db = await dbp;
  const id = `${date}-audio-${Date.now()}`;
  const entry = { id, date, blob, transcription, timestamp: new Date() };
  return new Promise((resolve, reject) => {
    const tx = db.transaction('audio_notes', 'readwrite');
    const store = tx.objectStore('audio_notes');
    const req = store.add(entry);
    req.onsuccess = () => resolve(id);
    req.onerror = () => reject(req.error);
  });
}

async function getAudioNotes(date) {
  const db = await dbp;
  return new Promise((resolve, reject) => {
    const tx = db.transaction('audio_notes', 'readonly');
    const store = tx.objectStore('audio_notes');
    const index = store.index('by_date');
    const req = index.getAll(date);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function updateAudioTranscription(id, transcription) {
  const db = await dbp;
  return new Promise((resolve, reject) => {
    const tx = db.transaction('audio_notes', 'readwrite');
    const store = tx.objectStore('audio_notes');
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

// Developer: seed and clear mock data
async function seedMockData(days = 7) {
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
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error || new Error('Transaction failed'));
  });
}

async function clearMockData() {
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