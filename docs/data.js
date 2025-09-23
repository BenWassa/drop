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

const dbp = new Promise((resolve, reject) => {
  const req = indexedDB.open('drop-tracker', 1);
  req.onupgradeneeded = () => {
    const db = req.result;
    if (!db.objectStoreNames.contains('entries')) {
      const store = db.createObjectStore('entries', { keyPath: 'id' });
      store.createIndex('by_date', 'date');
    }
    if (!db.objectStoreNames.contains('outbox')) {
      db.createObjectStore('outbox', { keyPath: 'id', autoIncrement: true });
    }
  };
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
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
  const tx = db.transaction(['entries', 'outbox'], 'readwrite');
  tx.objectStore('entries').put(entry);
  tx.objectStore('outbox').add({ type: 'ENTRY', payload: entry, ts: Date.now() });

  await calculateStreaks();
  renderAspectsManager();
  updateProgress();
  await updateOutboxCount();
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
  const db = await dbp;
  const tx = db.transaction('entries', 'readonly');
  const store = tx.objectStore('entries');
  const allEntries = await new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });

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
  const db = await dbp;
  const tx = db.transaction('entries', 'readonly');
  const store = tx.objectStore('entries');
  const allEntries = await new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });

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
  const tx = db.transaction(['entries', 'outbox'], 'readwrite');
  tx.objectStore('entries').put(entry);
  tx.objectStore('outbox').add({ type: 'REFLECTION', payload: entry, ts: Date.now() });
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
}

async function exportToCSV() {
  try {
    const db = await dbp;
    const tx = db.transaction('entries', 'readonly');
    const store = tx.objectStore('entries');
    const entries = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });

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
  } catch (error) {
    console.error('Export failed:', error);
  }
}

async function loadTodayData() {
  const today = new Date().toISOString().split('T')[0];
  const db = await dbp;
  const tx = db.transaction('entries', 'readonly');
  const index = tx.objectStore('entries').index('by_date');

  const entries = await new Promise((resolve, reject) => {
    const request = index.getAll(today);
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });

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
}

// Expose functions for testing
window.getClientId = getClientId;
window.saveReflection = saveReflection;
window.exportToCSV = exportToCSV;