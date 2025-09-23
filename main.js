const CONFIG = window.APP_CONFIG || {};
const $ = (id) => document.getElementById(id);
const $$ = (selector) => document.querySelectorAll(selector);

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

const appState = {
  currentScreen: 'today',
  todayData: Object.fromEntries(
    Object.entries(DOMAINS).map(([domain, aspects]) => [
      domain,
      Object.fromEntries(aspects.map((aspect) => [aspect, false]))
    ])
  ),
  streaks: {},
  mood: 5,
  online: navigator.onLine,
  syncing: false
};

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
  const today = new Date().toISOString().split('T')[0];
  const id = `${today}-${domain}-${aspect}`;
  const entry = {
    id,
    clientId: getClientId(),
    date: today,
    domain,
    aspect,
    completed,
    timestamp: Date.now(),
    synced: false
  };

  const db = await dbp;
  const tx = db.transaction(['entries', 'outbox'], 'readwrite');
  tx.objectStore('entries').put(entry);
  tx.objectStore('outbox').add({ type: 'ENTRY', payload: entry, ts: Date.now() });

  await calculateStreaks();
  updateProgress();
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

function updateProgress() {
  let completed = 0;

  Object.entries(DOMAINS).forEach(([domain, aspects]) => {
    let domainComplete = 0;

    aspects.forEach((aspect) => {
      if (appState.todayData[domain][aspect]) {
        completed += 1;
        domainComplete += 1;
      }
    });

    const domainCard = document.querySelector(`.domain-card.${domain}`);
    if (domainCard) {
      const status = domainCard.querySelector('.domain-status');
      status.textContent = `${domainComplete}/${aspects.length}`;
    }
  });

  if ($('completedCount')) {
    $('completedCount').textContent = completed;
  }
  if ($('totalCount')) {
    $('totalCount').textContent = TOTAL_ASPECTS;
  }

  const circumference = 2 * Math.PI * 50;
  const offset = circumference - (completed / TOTAL_ASPECTS) * circumference;
  const progressRing = $('progressRing');
  if (progressRing) {
    progressRing.style.strokeDashoffset = offset;
  }

  if (completed === TOTAL_ASPECTS) {
    triggerConfetti();
  }
}

function triggerConfetti() {
  const colors = ['#4ade80', '#00b4d8', '#ff6b6b', '#9b59b6', '#4ecdc4'];
  const confettiContainer = document.createElement('div');
  confettiContainer.className = 'confetti';
  document.body.appendChild(confettiContainer);

  for (let i = 0; i < 20; i += 1) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.left = `${Math.random() * 200 - 100}px`;
    piece.style.animationDelay = `${Math.random() * 0.3}s`;
    confettiContainer.appendChild(piece);
  }

  setTimeout(() => confettiContainer.remove(), 1500);
}

async function showScreen(screenName) {
  $$('.screen').forEach((screen) => screen.classList.remove('active'));
  $$('.nav-item').forEach((nav) => nav.classList.remove('active'));
  $$('.bottom-nav-item').forEach((nav) => nav.classList.remove('active'));

  const screenElement = $(`${screenName}Screen`);
  if (screenElement) {
    screenElement.classList.add('active');
  }
  $$(`[data-screen="${screenName}"]`).forEach((nav) => nav.classList.add('active'));

  appState.currentScreen = screenName;

  if (screenName === 'review') {
    await renderReview();
  }
}

async function renderReview() {
  const grid = $('weekGrid');
  if (grid) {
    // Load entries for past 7 days
    const db = await dbp;
    const tx = db.transaction('entries', 'readonly');
    const store = tx.objectStore('entries');
    const allEntries = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });

    // Group by date and aspect
    const dateAspectMap = {};
    allEntries.forEach(entry => {
      if (entry.domain && entry.aspect && entry.completed) {
        const key = `${entry.date}-${entry.domain}-${entry.aspect}`;
        dateAspectMap[key] = true;
      }
    });

    const today = new Date();
    const rows = Object.entries(DOMAINS)
      .flatMap(([domain, aspects]) => aspects.map((aspect) => ({ domain, aspect })));

    grid.innerHTML = rows
      .map(({ domain, aspect }) => `
        <div class="week-row">
          <div class="aspect-label">${ASPECT_LABELS[aspect] || aspect}</div>
          ${Array.from({ length: 7 }, (_, i) => {
            const date = new Date(today);
            date.setDate(today.getDate() - (6 - i));
            const dateStr = date.toISOString().split('T')[0];
            const key = `${dateStr}-${domain}-${aspect}`;
            const isDone = dateAspectMap[key];
            return `
              <div class="day-check ${isDone ? 'done' : ''}">
                ${isDone ? '✓' : ''}
              </div>
            `;
          }).join('')}
        </div>
      `)
      .join('');
  }

  const streaksContainer = $('streaksContainer');
  if (streaksContainer) {
    const streakItems = Object.entries(appState.streaks)
      .filter(([key, count]) => count > 0)
      .map(([key, count]) => {
        const [domain, aspect] = key.split('-');
        const icon = {
          sleep: '🌙',
          fitness: '🏃',
          mind: '📚',
          spirit: '🧘'
        }[domain] || '🔥';
        return {
          icon,
          aspect: ASPECT_LABELS[aspect] || aspect,
          count
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 4); // Top 4 streaks

    streaksContainer.innerHTML = streakItems
      .map(
        (streak) => `
          <div class="streak-item">
            <span class="streak-icon">${streak.icon}</span>
            <div class="streak-info">
              <div class="streak-aspect">${streak.aspect}</div>
              <div class="streak-count">${streak.count} days</div>
            </div>
          </div>
        `
      )
      .join('');
  }
}

function updateSyncStatus() {
  const syncStatus = $('syncStatus');
  const syncText = $('syncText');
  if (!syncStatus || !syncText) {
    return;
  }

  syncStatus.classList.toggle('offline', !appState.online);
  if (!appState.online) {
    syncText.textContent = 'Offline';
  } else if (appState.syncing) {
    syncText.textContent = 'Syncing...';
  } else {
    syncText.textContent = 'Online';
  }
}

async function trySync() {
  if (!navigator.onLine || appState.syncing) {
    return;
  }

  appState.syncing = true;
  updateSyncStatus();

  try {
    const db = await dbp;
    const outboxTx = db.transaction('outbox', 'readonly');
    const outboxStore = outboxTx.objectStore('outbox');
    const outbox = await new Promise((resolve, reject) => {
      const request = outboxStore.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (!outbox.length) {
      return;
    }

    const response = await fetch(`${CONFIG.SCRIPT_URL || ''}?action=append`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': CONFIG.API_KEY || ''
      },
      body: JSON.stringify({ ops: outbox })
    });

    if (!response.ok) {
      throw new Error(`Sync failed with status ${response.status}`);
    }

    const dbWrite = db.transaction('outbox', 'readwrite');
    const store = dbWrite.objectStore('outbox');
    outbox.forEach((item) => {
      store.delete(item.id);
    });

    const lastSyncTime = $('lastSyncTime');
    if (lastSyncTime) {
      lastSyncTime.textContent = 'just now';
    }
  } catch (error) {
    console.error('Sync failed:', error);
  } finally {
    appState.syncing = false;
    appState.online = navigator.onLine;
    updateSyncStatus();
  }
}

async function saveReflection() {
  const note = $('reflectionNote')?.value.trim() || '';
  const today = new Date().toISOString().split('T')[0];
  const entry = {
    id: `${today}-reflection`,
    clientId: getClientId(),
    date: today,
    type: 'reflection',
    mood: appState.mood,
    note,
    timestamp: Date.now(),
    synced: false
  };

  const db = await dbp;
  const tx = db.transaction(['entries', 'outbox'], 'readwrite');
  tx.objectStore('entries').put(entry);
  tx.objectStore('outbox').add({ type: 'REFLECTION', payload: entry, ts: Date.now() });

  triggerConfetti();
  const noteField = $('reflectionNote');
  if (noteField) {
    noteField.value = '';
  }

  const saveButton = $('saveReflection');
  if (saveButton) {
    const originalText = saveButton.textContent;
    saveButton.textContent = 'Saved! ✨';
    setTimeout(() => {
      saveButton.textContent = originalText || 'Save Reflection';
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

    const header = ['id', 'date', 'domain', 'aspect', 'completed', 'type', 'mood', 'note', 'timestamp', 'synced'];
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
    if (entry.domain && DOMAINS[entry.domain] && DOMAINS[entry.domain].includes(entry.aspect)) {
      appState.todayData[entry.domain][entry.aspect] = Boolean(entry.completed);
      const toggle = document.querySelector(
        `.aspect-toggle[data-domain="${entry.domain}"][data-aspect="${entry.aspect}"]`
      );
      if (toggle) {
        toggle.classList.toggle('completed', Boolean(entry.completed));
      }
    }
    if (entry.type === 'reflection') {
      appState.mood = entry.mood || appState.mood;
    }
  });

  const moodSlider = $('moodSlider');
  if (moodSlider) {
    moodSlider.value = String(appState.mood);
  }
  $$('.mood-emoji').forEach((emoji) => {
    emoji.classList.toggle('selected', Number(emoji.dataset.mood) === appState.mood);
  });

  await calculateStreaks();
  updateProgress();
}

async function initializeUI() {
  if ($('totalCount')) {
    $('totalCount').textContent = TOTAL_ASPECTS;
  }

  $$('.aspect-toggle').forEach((toggle) => {
    toggle.addEventListener('click', async function handleToggle() {
      const { domain, aspect } = this.dataset;
      if (!domain || !aspect) {
        return;
      }
      const isCompleted = this.classList.toggle('completed');
      appState.todayData[domain][aspect] = isCompleted;
      await saveEntry(domain, aspect, isCompleted);
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    });
  });

  $$('.nav-item, .bottom-nav-item').forEach((item) => {
    item.addEventListener('click', function handleNav() {
      const { screen } = this.dataset;
      if (screen) {
        showScreen(screen);
      }
    });
  });

  const moodSlider = $('moodSlider');
  const moodEmojis = $$('.mood-emoji');

  moodSlider?.addEventListener('input', function handleMoodInput() {
    const value = Number(this.value);
    appState.mood = value;
    moodEmojis.forEach((emoji) => {
      emoji.classList.toggle('selected', Number(emoji.dataset.mood) === value);
    });
  });

  moodEmojis.forEach((emoji) => {
    emoji.addEventListener('click', function handleMoodClick() {
      const value = Number(this.dataset.mood);
      appState.mood = value;
      if (moodSlider) {
        moodSlider.value = String(value);
      }
      moodEmojis.forEach((el) => el.classList.remove('selected'));
      this.classList.add('selected');
    });
  });

  $('saveReflection')?.addEventListener('click', async () => {
    await saveReflection();
    trySync();
  });

  $('fabNote')?.addEventListener('click', () => {
    showScreen('reflect');
  });

  $('syncNow')?.addEventListener('click', () => {
    trySync();
  });

  $('exportCSV')?.addEventListener('click', () => {
    exportToCSV();
  });

  const startDateStr = localStorage.getItem('user_start_date');
  let startDate;
  if (startDateStr) {
    startDate = new Date(startDateStr);
  } else {
    // Set start date to today or earliest entry
    const db = await dbp;
    const tx = db.transaction('entries', 'readonly');
    const store = tx.objectStore('entries');
    const allEntries = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
    if (allEntries.length > 0) {
      const dates = allEntries.map(e => e.date).sort();
      startDate = new Date(dates[0]);
    } else {
      startDate = new Date();
    }
    localStorage.setItem('user_start_date', startDate.toISOString().split('T')[0]);
  }
  const today = new Date();
  const dayCount = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
  const dayCounter = $('dayCount');
  if (dayCounter) {
    dayCounter.textContent = String(dayCount);
  }

  window.addEventListener('online', () => {
    appState.online = true;
    updateSyncStatus();
    trySync();
  });

  window.addEventListener('offline', () => {
    appState.online = false;
    updateSyncStatus();
  });
}

(async () => {
  await initializeUI();
  updateProgress();
  await loadTodayData();
  updateSyncStatus();

  if (Number.isFinite(CONFIG.SYNC_INTERVAL_MS) && CONFIG.SYNC_INTERVAL_MS > 0) {
    setInterval(() => {
      trySync();
    }, CONFIG.SYNC_INTERVAL_MS);
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('sw.js')
      .catch((error) => console.warn('SW register failed', error));
  }
})();
