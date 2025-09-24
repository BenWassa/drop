// ui.js - UI layer: DOM manipulation and rendering

// Fallback inline icons (kept for immediate rendering). Prefer runtime inlining from /images/*.svg
const DOMAIN_ICONS_FALLBACK = {
  sleep: `<svg viewBox="0 0 192 192" fill="none" stroke="currentColor" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"><path d="M30 22h62L30 96h62m25-24h46l-46 55h46m-109 0h36l-36 43h36"/></svg>`,
  fitness: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.67 37.36h-3v-8.72h3zM15.67 39.59h-4v-14.18h4zM22.32 42H15.67v-19h6.65zM55.33 37.36h-3v-8.72h3zM52.32 39.59h-4v-14.18h4zM48.32 42H41.67v-19h6.65zM41.67 35H22.32v-5h19.35z"/></svg>`,
  mind: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1"><path d="M93.998 45.312c0-3.676-1.659-7.121-4.486-9.414"/></svg>`,
  spirit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c3.5 3.5 6 6.5 6 10a6 6 0 0 1-12 0c0-3.5 2.5-6.5 6-10z"/></svg>`
};

// Ensure $ and $$ are available (defined in main.js but not global)
if (!window.$) window.$ = (id) => document.getElementById(id);
if (!window.$$) window.$$ = (selector) => document.querySelectorAll(selector);

// Simple cache for fetched SVG files
const SVG_CACHE = {};

async function inlineSvgFromFile(name) {
  if (SVG_CACHE[name]) return SVG_CACHE[name];
  try {
    const url = `images/${name}.svg`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    let text = await res.text();
    // Strip XML prolog (if present) and return the <svg> element string
    text = text.replace(/<\?xml[\s\S]*?\?>/g, '').trim();
    SVG_CACHE[name] = text;
    return text;
  } catch (e) {
    console.warn('inlineSvgFromFile failed for', name, e);
    return DOMAIN_ICONS_FALLBACK[name] || '';
  }
}

// Return a small inline SVG (fallback) for use inside compact UI elements (rings).
function renderDomainIconInline(domain) {
  // Use the fallback inline SVGs which are stroke-only and styleable via currentColor
  return DOMAIN_ICONS_FALLBACK[domain] || '';
}

function renderDomainIcon(domain) {
  // Use CSS background-image to load the canonical SVG for GitHub Pages friendliness.
  // Return a span with domain classes only; CSS will set background-image:url('images/<domain>.svg').
  const wrapper = document.createElement('span');
  wrapper.className = `domain-icon ${domain}`;
  wrapper.setAttribute('role', 'img');
  wrapper.setAttribute('aria-label', `${domain} icon`);
  return wrapper.outerHTML;
}

function getISOWeek(date) {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNr = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const diff = target - firstThursday;
  return 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000));
}

function updateQuarterReservoir() {
  const ledger = $('quarterLedger');
  const fill = $('quarterFill');
  if (!ledger || !fill) {
    return;
  }

  const today = new Date();
  const quarterIndex = Math.floor(today.getMonth() / 3);
  const quarterStart = new Date(today.getFullYear(), quarterIndex * 3, 1);
  const quarterEnd = new Date(today.getFullYear(), quarterIndex * 3 + 3, 0);
  const dayMs = 24 * 60 * 60 * 1000;
  const totalQuarterDays = Math.round((quarterEnd - quarterStart) / dayMs) + 1;
  const daysElapsed = Math.min(totalQuarterDays, Math.floor((today - quarterStart) / dayMs) + 1);
  const progress = Math.max(0, Math.min(1, daysElapsed / totalQuarterDays));
  const percent = Math.round(progress * 100);
  const daysLeft = Math.max(0, totalQuarterDays - daysElapsed);
  const weekNumber = String(getISOWeek(today)).padStart(2, '0');

  const ledgerSegments = [
    today.toLocaleString('en-US', { month: 'short', day: 'numeric' }).toUpperCase(),
    `Q${quarterIndex + 1}`,
    `WK ${weekNumber}`,
    `${percent}%`,
    `${daysLeft} DAYS LEFT`,
  ];

  ledger.textContent = ledgerSegments.join(' · ');
  fill.style.width = `${percent}%`;
}

function initializeParticles() {
  const canvas = $('backgroundParticles');
  if (!canvas || !canvas.getContext) {
    return;
  }

  const ctx = canvas.getContext('2d');
  const particles = Array.from({ length: 42 }, () => ({
    x: Math.random(),
    y: Math.random(),
    radius: 0.4 + Math.random() * 1.2,
    speed: 0.00015 + Math.random() * 0.00035,
  }));
  let width = 0;
  let height = 0;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function step() {
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(148, 163, 184, 0.25)';
    particles.forEach(particle => {
      particle.y -= particle.speed;
      if (particle.y < -0.05) {
        particle.y = 1.05;
        particle.x = Math.random();
      }
      const px = particle.x * width;
      const py = particle.y * height;
      ctx.globalAlpha = 0.18;
      ctx.beginPath();
      ctx.arc(px, py, particle.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(step);
  }

  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(step);
}

// Simple logging helper for initialization steps
function logInit(message) {
  console.log('[init]', message);
}

// This function binds all event listeners that should only be attached once.
function initializeEventListeners() {
  if (window.listenersAreBound) {
    return;
  }

  // Global error handlers (dev-only panel)
  window.addEventListener('error', (ev) => {
    try {
      const panel = $('runtimeErrorContent');
      if (panel) panel.textContent = `${ev.message}\n${ev.filename}:${ev.lineno}:${ev.colno}\n${ev.error && ev.error.stack ? ev.error.stack : ''}`;
      const container = $('runtimeErrorPanel');
      if (container) container.classList.remove('hidden');
    } catch (e) {}
  });
  window.addEventListener('unhandledrejection', (ev) => {
    try {
      const panel = $('runtimeErrorContent');
      if (panel) panel.textContent = `UnhandledRejection: ${ev.reason && ev.reason.stack ? ev.reason.stack : String(ev.reason)}`;
      const container = $('runtimeErrorPanel');
      if (container) container.classList.remove('hidden');
    } catch (e) {}
  });

  const runtimeClear = $('runtimeErrorClear');
  if (runtimeClear) runtimeClear.addEventListener('click', () => {
    const panel = $('runtimeErrorContent');
    if (panel) panel.textContent = 'No errors';
    const container = $('runtimeErrorPanel');
    if (container) container.classList.add('hidden');
  });

  // Aspect Toggles
  $$('.aspect-toggle').forEach(toggle => {
    toggle.addEventListener('click', async () => {
      const domain = toggle.dataset.domain;
      const aspect = toggle.dataset.aspect;
      const currentlyCompleted = appState.todayData[domain][aspect] || false;
      const newCompleted = !currentlyCompleted;

      appState.todayData[domain][aspect] = newCompleted;
      toggle.classList.toggle('completed', newCompleted);

      await saveEntry(domain, aspect, newCompleted);
    });
  });

  // Navigation
  $$('.nav-item, .bottom-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const screen = item.dataset.screen;
      showScreen(screen + 'Screen');
      document.querySelectorAll('.nav-item, .bottom-nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });

  // Mood Selection
  $$('.mood-option').forEach(option => {
    option.addEventListener('click', () => {
      const mood = Number(option.dataset.mood);
      appState.mood = mood;
      $$('.mood-option').forEach(btn => btn.classList.remove('selected'));
      option.classList.add('selected');
    });
  });

  // Developer / Mock Toggles
  const devToggle = $('devModeToggle');
  const mockToggle = $('mockDataToggle');
  const clearStorageBtn = $('clearStorageBtn');

  if (clearStorageBtn) {
    clearStorageBtn.addEventListener('click', async () => {
      try {
        clearStorageBtn.disabled = true;
        clearStorageBtn.textContent = 'Clearing...';
        if (window.storageUtils && typeof window.storageUtils.clearAllAppStorage === 'function') {
          await window.storageUtils.clearAllAppStorage({ clearIndexedDB: true });
        }
        const b = document.createElement('div');
        b.className = 'ephemeral-banner';
        b.textContent = 'Cleared local data and caches. Reloading...';
        document.body.appendChild(b);
        setTimeout(() => { try { document.body.removeChild(b); } catch (e) {} }, 3500);
        setTimeout(() => { location.reload(true); }, 900);
      } catch (e) {
        console.error('Clear storage failed', e);
        clearStorageBtn.disabled = false;
        clearStorageBtn.textContent = 'Clear cached data';
      }
    });
  }

  if (devToggle) {
    devToggle.addEventListener('change', () => {
      appState.devMode = devToggle.checked;
      localStorage.setItem('dev_mode', devToggle.checked ? '1' : '0');
      document.querySelectorAll('.dev-only').forEach(el => el.classList.toggle('hidden', !devToggle.checked));
    });
  }

  if (mockToggle) {
    mockToggle.addEventListener('change', async () => {
      if (mockToggle.checked) {
        const proceed = confirm('Enable mock mode will switch to sandboxed data and prevent syncing. Create a JSON backup of both real and mock data before switching? Click OK to create backup and enable mock mode, Cancel to abort.');
        if (!proceed) {
          mockToggle.checked = false;
          return;
        }
        try {
          if (typeof window.exportAllData === 'function') {
            const data = await window.exportAllData({ mode: 'both' });
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const dt = new Date().toISOString().split('T')[0];
            a.download = `drop-backup-${dt}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        } catch (e) {
          console.error('Backup failed', e);
          alert('Backup failed — mock mode will not be enabled to avoid risk to your data.');
          mockToggle.checked = false;
          return;
        }
      }

      appState.useMock = mockToggle.checked;
      localStorage.setItem('use_mock_data', mockToggle.checked ? '1' : '0');
      try {
        await loadTodayData();
        renderReview();
        $('mockBanner').classList.toggle('hidden', !appState.useMock);
      } catch (e) {
        console.warn('Reload after mock mode switch failed', e);
      }
    });
  }

  // Dev Control Buttons
  const seedBtn = $('seedMockData');
  if (seedBtn) seedBtn.addEventListener('click', async () => { if (typeof window.seedMockData === 'function') try { await window.seedMockData(); await loadTodayData(); } catch (e) { console.error('seedMockData error', e); } });

  const clearBtn = $('clearMockData');
  if (clearBtn) clearBtn.addEventListener('click', async () => { if (typeof window.clearMockData === 'function') try { await window.clearMockData(); await loadTodayData(); } catch (e) { console.error('clearMockData error', e); } });

  const mockSeedQuick = $('mockSeedQuick');
  if (mockSeedQuick) mockSeedQuick.addEventListener('click', async () => { if (!confirm('Seed mock data into sandbox? This will not affect real data.')) return; try { await window.seedMockData(); await loadTodayData(); $('mockBanner').classList.remove('hidden'); } catch (e) { console.error('seedMockData error', e); alert('Seeding mock data failed. See console.'); } });

  const mockClearQuick = $('mockClearQuick');
  if (mockClearQuick) mockClearQuick.addEventListener('click', async () => { if (!confirm('Clear mock sandbox data? This will remove mock entries and outbox.')) return; try { await window.clearMockData(); await loadTodayData(); $('mockBanner').classList.remove('hidden'); } catch (e) { console.error('clearMockData error', e); alert('Clearing mock data failed. See console.'); } });

  // Other Buttons
  const saveReflectionBtn = $('saveReflection');
  if (saveReflectionBtn) saveReflectionBtn.addEventListener('click', saveReflection);

  const exportBtn = $('exportCSV');
  if (exportBtn) exportBtn.addEventListener('click', window.exportToCSV);

  const syncBtn = $('syncNow');
  if (syncBtn) syncBtn.addEventListener('click', () => { trySync(); });

  // Diagnostics Panel
  const diagRefreshBtn = $('diagRefresh');
  if(diagRefreshBtn) diagRefreshBtn.addEventListener('click', renderDiagnostics);
  
  const dumpBtn = $('dumpStorageBtn');
  if (dumpBtn) dumpBtn.addEventListener('click', async () => { try { await dumpAppState(); alert('Storage dumped to console and diagnostics panel.'); } catch (e) { console.error('dump failed', e); alert('Dump failed; see console.'); } });

  const diagEnsureBtn = $('diagEnsureStores');
  if (diagEnsureBtn) diagEnsureBtn.addEventListener('click', async () => { if (typeof window.ensureStoresExist === 'function') try { await window.ensureStoresExist(['mock_entries', 'mock_outbox', 'mock_audio_notes']); await renderDiagnostics(); alert('Ensure stores: complete'); } catch (e) { console.error('ensureStoresExist failed', e); alert('Ensure stores failed. Check console.'); } });

  // Manage Aspects Toggles
  document.addEventListener('click', e => {
    if (e.target.classList.contains('toggle-domain')) {
      const domain = e.target.dataset.domain;
      appState.visibleAspects[domain] = !appState.visibleAspects[domain];
      e.target.textContent = appState.visibleAspects[domain] ? 'HIDE' : 'SHOW';
      updateVisibleAspects();
      renderAspectsManager();
      try {
        localStorage.setItem('visibleAspects', JSON.stringify(appState.visibleAspects));
      } catch (e) {}
    }
  });

  window.listenersAreBound = true;
}

async function renderDiagnostics() {
    const diagStoresEl = $('diagStores');
    const diagAppStateEl = $('diagAppState');
    try {
      const db = await dbp;
      const names = Array.from(db.objectStoreNames || []);
      const parts = [];
      for (const n of names) {
        try {
          const tx = db.transaction(n, 'readonly');
          const store = tx.objectStore(n);
          const count = await new Promise((res, rej) => { const r = store.count(); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
          parts.push(`${n}: ${count}`);
        } catch (e) { parts.push(`${n}: (error)`); }
      }
      if (diagStoresEl) diagStoresEl.textContent = parts.join(' · ') || 'No stores';
    } catch (e) { if (diagStoresEl) diagStoresEl.textContent = 'DB unavailable'; }
    if (diagAppStateEl) {
      try {
        diagAppStateEl.textContent = JSON.stringify({ devMode: appState.devMode, useMock: appState.useMock, currentScreen: appState.currentScreen, mood: appState.mood, visibleAspects: appState.visibleAspects }, null, 0);
      } catch (e) { diagAppStateEl.textContent = 'error'; }
    }
}

async function dumpAppState() {
    try {
      const snapshot = {
        timestamp: new Date().toISOString(),
        appState: { currentScreen: appState.currentScreen, visibleAspects: appState.visibleAspects, streaks: appState.streaks, mood: appState.mood, devMode: appState.devMode, useMock: appState.useMock },
        localStorage: {},
        indexedDB: {}
      };
      try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); snapshot.localStorage[k] = localStorage.getItem(k); } } catch (e) { snapshot.localStorage_error = String(e); }
      try {
        const db = await dbp;
        for (const name of Array.from(db.objectStoreNames || [])) {
          try {
            const tx = db.transaction(name, 'readonly');
            const store = tx.objectStore(name);
            const count = await new Promise((res, rej) => { const r = store.count(); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
            snapshot.indexedDB[name] = { count };
          } catch (e) { snapshot.indexedDB[name] = { error: String(e) }; }
        }
      } catch (e) { snapshot.indexedDB_error = String(e); }
      console.group('[diagnostic] dumpAppState');
      console.log(snapshot);
      console.groupEnd();
      const diagAppStateEl = $('diagAppState');
      if (diagAppStateEl) { diagAppStateEl.textContent = JSON.stringify({ lastDump: snapshot.timestamp, appState: snapshot.appState }, null, 0); }
      return snapshot;
    } catch (err) { console.error('dumpAppState failed', err); throw err; }
}

async function refreshDomainScorePanel() {
  const grid = $('domainScoreGrid');
  if (!grid) return;
  const domains = ['sleep', 'fitness', 'mind', 'spirit'];
  // Color palette used by the rings (kept in JS for deterministic rendering)
  const DOMAIN_COLORS = { sleep: '#1e90ff', fitness: '#ff3b30', mind: '#7c3aed', spirit: '#16a34a' };

  grid.innerHTML = domains.map(domain => {
    const score = (appState && appState.overviewScores && typeof appState.overviewScores[domain] !== 'undefined') ? Number(appState.overviewScores[domain]) : null;
    const display = (score === null || Number.isNaN(score)) ? '—' : String(score);

    // Ring geometry
    const radius = 30; // visual radius inside a 68x68 container
    const circumference = 2 * Math.PI * radius;
    const pct = (typeof score === 'number' && !Number.isNaN(score)) ? Math.max(0, Math.min(100, score)) : 0;
    const dashOffset = Math.round(circumference * (1 - pct / 100));

    // Small inline icon SVG (fallback stroke-only) — prefer inline fallback so icons are styled by currentColor
    const inlineIcon = renderDomainIconInline(domain) || '';

    const glowing = (typeof score === 'number' && score >= 80) ? 'glowing' : '';
    return `
      <div class="lean-domain-item ${glowing}" aria-hidden="false">
        <div class="lean-score-ring-container" title="${domain.toUpperCase()} ${display}">
          <svg class="lean-score-ring-svg" viewBox="0 0 72 72" width="78" height="78" aria-hidden="true">
            <defs></defs>
            <g transform="translate(36,36)">
              <circle r="${radius}" cx="0" cy="0" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="6"></circle>
              <circle r="${radius}" cx="0" cy="0" fill="none" stroke="${DOMAIN_COLORS[domain]}" stroke-width="6" stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}"></circle>
            </g>
          </svg>
          <div class="lean-score-value">${display}</div>
          <div class="lean-ring-icon" aria-hidden="false"><span class="domain-icon ${domain}">${inlineIcon}</span></div>
          ${glowing ? '<div class="lean-crown">👑</div>' : ''}
        </div>
        <div class="lean-domain-label">${domain.toUpperCase()}</div>
      </div>
    `;
  }).join('');
}

// Main UI initialization function
async function initializeUI() {
  if (document.readyState === 'loading') {
    await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
  }

  // Bind all event listeners once.
  initializeEventListeners();

  // Perform initial UI setup that doesn't involve listeners.
  initializeParticles();
  logInit('particles initialized');
  updateQuarterReservoir();
  setInterval(updateQuarterReservoir, 60 * 1000);

  function replaceStaticDomainIcons() {
    Object.keys(DOMAINS).forEach(domain => {
      try {
        const container = document.querySelector(`.domain[data-domain="${domain}"] .domain-icon`);
        if (container) container.innerHTML = renderDomainIcon(domain);
      } catch (e) {}
    });
  }
  replaceStaticDomainIcons();

  let persistedVisible = {};
  try {
    const raw = localStorage.getItem('visibleAspects');
    if (raw) persistedVisible = JSON.parse(raw) || {};
  } catch (e) { persistedVisible = {}; }

  Object.entries(DOMAINS).forEach(([domain, aspects]) => {
    appState.todayData[domain] = {};
    appState.visibleAspects[domain] = (typeof persistedVisible[domain] !== 'undefined') ? Boolean(persistedVisible[domain]) : true;
    aspects.forEach(aspect => { appState.todayData[domain][aspect] = false; });
  });

  // Initialize state from localStorage
  const devMode = localStorage.getItem('dev_mode') === '1';
  const useMock = localStorage.getItem('use_mock_data') === '1';
  appState.devMode = devMode;
  appState.useMock = useMock;
  if ($('devModeToggle')) $('devModeToggle').checked = devMode;
  if ($('mockDataToggle')) $('mockDataToggle').checked = useMock;
  document.querySelectorAll('.dev-only').forEach(el => el.classList.toggle('hidden', !devMode));
  logInit('dev mode ' + (devMode ? 'ON' : 'OFF') + ', mock ' + (useMock ? 'ON' : 'OFF'));
  if ($('mockBanner')) $('mockBanner').classList.toggle('hidden', !useMock);

  // Initial render calls
  await refreshDomainScorePanel();
  await renderAspectsManager();
  await initializeAudioNotesList();
  await renderDiagnostics();

  // If mock data flag is set, load or seed mock data before loading
  if (appState.useMock && typeof window.seedMockData === 'function') {
    try {
      logInit('seeding mock data');
      const mockEntries = await getMockEntries();
      if(mockEntries.length === 0) await window.seedMockData();
      logInit('mock data seeded');
    } catch (e) { console.warn('seedMockData failed', e); }
  }

  try {
    logInit('loading today data');
    await loadTodayData();
    logInit('today data loaded');
  } catch (e) {
    console.error('loadTodayData failed', e);
    const panel = $('runtimeErrorContent'); if (panel) panel.textContent = `loadTodayData failed: ${e && e.message ? e.message : String(e)}`;
    const container = $('runtimeErrorPanel'); if (container) container.classList.remove('hidden');
  }

  showScreen('todayScreen');
}

const voiceState = {
  mediaRecorder: null,
  stream: null,
  chunks: [],
  recognition: null,
  recognitionShouldRestart: false,
  isRecording: false,
  finalTranscript: '',
  interimTranscript: '',
  transcriptionPromise: Promise.resolve(''),
  resolveTranscriptionPromise: null,
  recordingStartedAt: 0,
  recordingTimerId: null,
};

function supportsSpeechRecognition() {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

function getCurrentTranscript() {
  return `${voiceState.finalTranscript} ${voiceState.interimTranscript}`.trim();
}

function prepareTranscriptionCapture() {
  if (voiceState.resolveTranscriptionPromise) {
    voiceState.resolveTranscriptionPromise(getCurrentTranscript());
  }
  voiceState.transcriptionPromise = new Promise(resolve => {
    voiceState.resolveTranscriptionPromise = resolve;
  });
}

function resolveTranscriptionCapture(value = getCurrentTranscript()) {
  const text = typeof value === 'string' ? value : getCurrentTranscript();
  if (voiceState.resolveTranscriptionPromise) {
    voiceState.resolveTranscriptionPromise(text);
    voiceState.resolveTranscriptionPromise = null;
  }
  voiceState.transcriptionPromise = Promise.resolve(text);
  return text;
}

async function waitForFinalTranscript() {
  try {
    const result = await voiceState.transcriptionPromise;
    return typeof result === 'string' ? result.trim() : '';
  } catch (error) {
    console.warn('Transcription wait failed', error);
    return getCurrentTranscript();
  }
}

function formatRecordingDuration(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function showRecordingIndicator() {
  const indicator = $('recordingIndicator');
  const timer = $('recordingTimer');
  if (!indicator || !timer) {
    return;
  }

  voiceState.recordingStartedAt = Date.now();
  timer.textContent = '0:00';
  indicator.classList.remove('hidden');

  if (voiceState.recordingTimerId) {
    clearInterval(voiceState.recordingTimerId);
  }

  voiceState.recordingTimerId = setInterval(() => {
    timer.textContent = formatRecordingDuration(Date.now() - voiceState.recordingStartedAt);
  }, 250);
}

function hideRecordingIndicator() {
  const indicator = $('recordingIndicator');
  const timer = $('recordingTimer');
  if (voiceState.recordingTimerId) {
    clearInterval(voiceState.recordingTimerId);
    voiceState.recordingTimerId = null;
  }
  if (timer && voiceState.recordingStartedAt) {
    timer.textContent = formatRecordingDuration(Date.now() - voiceState.recordingStartedAt);
  }
  voiceState.recordingStartedAt = 0;
  if (indicator) {
    indicator.classList.add('hidden');
  }
}

const setVoiceStatus = (() => {
  let hideTimer = null;
  return (message, { tone = 'muted', persist = false } = {}) => {
    const status = $('voiceStatus');
    if (!status) {
      return;
    }

    if (!message) {
      status.textContent = '';
      status.classList.add('hidden');
      status.removeAttribute('data-tone');
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
      return;
    }

    status.textContent = message;
    status.dataset.tone = tone;
    status.classList.remove('hidden');

    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }

    if (!persist) {
      hideTimer = setTimeout(() => {
        status.textContent = '';
        status.classList.add('hidden');
        status.removeAttribute('data-tone');
        hideTimer = null;
      }, 6000);
    }
  };
})();

function resetTranscriptState() {
  voiceState.finalTranscript = '';
  voiceState.interimTranscript = '';
}

function updateTranscriptionPreview() {
  const preview = $('transcriptionPreview');
  const content = $('transcriptionContent');
  const copyButton = $('copyTranscription');
  if (!preview || !content || !copyButton) {
    return;
  }

  const transcript = getCurrentTranscript();
  if (transcript) {
    content.textContent = transcript;
    preview.classList.remove('hidden');
    copyButton.disabled = false;
  } else {
    content.textContent = '';
    copyButton.disabled = true;
    if (!voiceState.isRecording) {
      preview.classList.add('hidden');
    }
  }
}

function clearTranscriptionPreview({ hide = true } = {}) {
  const preview = $('transcriptionPreview');
  const content = $('transcriptionContent');
  const copyButton = $('copyTranscription');
  if (content) {
    content.textContent = '';
  }
  if (copyButton) {
    copyButton.disabled = true;
  }
  if (hide && preview) {
    preview.classList.add('hidden');
  }
}

async function copyTextToClipboard(text) {
  if (!text) {
    return;
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const helper = document.createElement('textarea');
  helper.value = text;
  helper.setAttribute('readonly', '');
  helper.style.position = 'absolute';
  helper.style.left = '-9999px';
  document.body.appendChild(helper);
  helper.select();
  document.execCommand('copy');
  document.body.removeChild(helper);
}

function initializeVoiceControls() {
  const voiceButton = $('voiceButton');
  if (!voiceButton) {
    return;
  }

  const copyButton = $('copyTranscription');
  if (copyButton) {
    copyButton.addEventListener('click', async () => {
      const content = $('transcriptionContent');
      const text = content?.textContent?.trim() || '';
      if (!text) {
        setVoiceStatus('No transcription captured yet.', { tone: 'warning' });
        return;
      }
      try {
        await copyTextToClipboard(text);
        setVoiceStatus('Transcription copied to clipboard.', { tone: 'success' });
      } catch (error) {
        console.error('Copy failed', error);
        setVoiceStatus('Unable to copy transcription.', { tone: 'error' });
      }
    });
  }

  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder !== 'function') {
    voiceButton.disabled = true;
    setVoiceStatus('Microphone recording is not supported in this browser.', { tone: 'error', persist: true });
    return;
  }

  if (supportsSpeechRecognition()) {
    setVoiceStatus('Tap to record. Live transcription is available.', { tone: 'muted' });
  } else {
    setVoiceStatus('Tap to record. Add transcription manually after saving.', { tone: 'warning', persist: true });
  }

  const label = voiceButton.querySelector('span:last-child');

  const stopStream = () => {
    if (voiceState.stream) {
      try {
        voiceState.stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.warn('Stream cleanup failed', error);
      }
      voiceState.stream = null;
    }
  };

  const teardownRecording = ({ hidePreview = false } = {}) => {
    voiceState.isRecording = false;
    voiceState.recognitionShouldRestart = false;
    voiceState.mediaRecorder = null;
    voiceState.chunks = [];
    stopRecognition();
    stopStream();
    hideRecordingIndicator();

    voiceButton.classList.remove('recording', 'processing');
    voiceButton.disabled = false;
    voiceButton.setAttribute('aria-pressed', 'false');
    if (label) {
      label.textContent = 'RECORD AUDIO NOTE';
    }

    if (hidePreview) {
      clearTranscriptionPreview({ hide: true });
    } else {
      updateTranscriptionPreview();
    }
  };

  const stopRecognition = () => {
    if (!voiceState.recognition) {
      resolveTranscriptionCapture();
      return;
    }
    try {
      voiceState.recognitionShouldRestart = false;
      voiceState.recognition.stop();
    } catch (error) {
      console.warn('Failed to stop recognition', error);
      resolveTranscriptionCapture();
    }
  };

  const startSpeechRecognition = () => {
    if (!supportsSpeechRecognition()) {
      resolveTranscriptionCapture('');
      resetTranscriptState();
      clearTranscriptionPreview({ hide: false });
      updateTranscriptionPreview();
      setVoiceStatus('Recording… automatic transcription unavailable.', { tone: 'warning' });
      return;
    }

    const RecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    try {
      prepareTranscriptionCapture();
      const recognition = new RecognitionCtor();
      voiceState.recognition = recognition;
      voiceState.recognitionShouldRestart = true;
      resetTranscriptState();
      clearTranscriptionPreview({ hide: true });
      updateTranscriptionPreview();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = 'en-US';

      recognition.onresult = event => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (!result || !result[0]) {
            continue;
          }
          const text = result[0].transcript.trim();
          if (result.isFinal) {
            voiceState.finalTranscript = `${voiceState.finalTranscript} ${text}`.trim();
          } else {
            interim = `${interim} ${text}`.trim();
          }
        }
        voiceState.interimTranscript = interim;
        updateTranscriptionPreview();
      };

      recognition.onerror = event => {
        console.warn('Speech recognition error', event.error);
        if (event.error === 'no-speech') {
          setVoiceStatus('No speech detected. Audio will still be saved.', { tone: 'warning' });
          return;
        }
        if (event.error === 'aborted') {
          return;
        }
        voiceState.recognitionShouldRestart = false;
        resolveTranscriptionCapture();
        setVoiceStatus('Speech recognition stopped. You can edit transcription manually.', { tone: 'warning', persist: true });
        try {
          recognition.stop();
        } catch (error) {
          console.warn('Recognition stop after error failed', error);
        }
      };

      recognition.onend = () => {
        voiceState.interimTranscript = '';
        updateTranscriptionPreview();
        if (voiceState.recognitionShouldRestart) {
          try {
            recognition.start();
          } catch (error) {
            console.warn('Failed to restart recognition', error);
            voiceState.recognitionShouldRestart = false;
            voiceState.recognition = null;
            resolveTranscriptionCapture();
          }
        } else {
          voiceState.recognition = null;
          resolveTranscriptionCapture();
        }
      };

      recognition.start();
      setVoiceStatus('Recording… live transcription active.', { tone: 'muted' });
    } catch (error) {
      console.warn('Speech recognition initialization failed', error);
      resolveTranscriptionCapture('');
      resetTranscriptState();
      clearTranscriptionPreview({ hide: false });
      updateTranscriptionPreview();
      setVoiceStatus('Unable to start speech recognition. Edit transcription manually.', { tone: 'warning', persist: true });
    }
  };

  const startRecording = async () => {
    if (voiceState.isRecording) {
      return;
    }

    voiceButton.disabled = true;
    voiceButton.classList.remove('processing');
    voiceButton.classList.add('recording');
    voiceButton.setAttribute('aria-pressed', 'true');
    if (label) {
      label.textContent = 'STOP RECORDING';
    }

    setVoiceStatus('Preparing microphone…', { tone: 'muted' });

    try {
      voiceState.stream = await navigator.mediaDevices.getUserMedia({
        audio: { noiseSuppression: true, echoCancellation: true },
      });

      voiceState.mediaRecorder = new MediaRecorder(voiceState.stream);
      voiceState.chunks = [];
      voiceState.mediaRecorder.addEventListener('dataavailable', event => {
        if (event.data && event.data.size > 0) {
          voiceState.chunks.push(event.data);
        }
      });
      voiceState.mediaRecorder.addEventListener('error', event => {
        console.error('Recording error', event.error || event);
        setVoiceStatus('Recording failed. Please try again.', { tone: 'error', persist: true });
        teardownRecording({ hidePreview: true });
      });
      voiceState.mediaRecorder.addEventListener('stop', async () => {
        const blob = new Blob(voiceState.chunks, {
          type: voiceState.mediaRecorder?.mimeType || 'audio/webm',
        });

        try {
          setVoiceStatus('Encoding audio…', { tone: 'muted' });
          const mp3Blob = await encodeToMP3(blob);
          const today = new Date().toISOString().split('T')[0];
          const transcript = await waitForFinalTranscript();
          voiceState.finalTranscript = transcript;
          voiceState.interimTranscript = '';
          updateTranscriptionPreview();
          await window.saveAudioNote(today, mp3Blob, transcript);
          if (transcript) {
            setVoiceStatus('Audio note saved with transcription.', { tone: 'success' });
          } else {
            setVoiceStatus('Audio note saved. Add a transcription when ready.', { tone: 'warning' });
          }
          renderAudioNotes();
        } catch (error) {
          console.error('Audio processing failed', error);
          setVoiceStatus('Failed to save audio note. Please retry.', { tone: 'error', persist: true });
          teardownRecording({ hidePreview: true });
          return;
        }

        teardownRecording({ hidePreview: false });
      });

      voiceState.mediaRecorder.start();
      voiceState.isRecording = true;
      voiceButton.disabled = false;
      resetTranscriptState();
      clearTranscriptionPreview({ hide: true });
      updateTranscriptionPreview();
      startSpeechRecognition();
      showRecordingIndicator();
    } catch (error) {
      console.error('Microphone access failed', error);
      setVoiceStatus('Microphone access denied or unavailable.', { tone: 'error', persist: true });
      teardownRecording({ hidePreview: true });
    }
  };

  const stopRecording = () => {
    if (!voiceState.isRecording || !voiceState.mediaRecorder) {
      return;
    }
    voiceState.isRecording = false;
    voiceButton.classList.remove('recording');
    voiceButton.classList.add('processing');
    voiceButton.disabled = true;
    hideRecordingIndicator();
    setVoiceStatus('Processing audio note…', { tone: 'muted' });
    stopRecognition();
    try {
      voiceState.mediaRecorder.stop();
    } catch (error) {
      console.error('Failed to stop recorder', error);
      teardownRecording({ hidePreview: true });
    }
  };

  voiceButton.addEventListener('click', () => {
    if (voiceButton.disabled) {
      return;
    }
    if (voiceState.isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  });

  window.addEventListener('pagehide', () => {
    if (voiceState.isRecording) {
      stopRecording();
    }
  });
}

// Audio recording functions
function encodeToMP3(blob) {
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (typeof lamejs === 'undefined' || typeof lamejs.Mp3Encoder !== 'function' || !AudioContextCtor) {
    return Promise.resolve(blob);
  }

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onerror = () => {
      console.warn('Audio read failed, using original blob.', reader.error);
      resolve(blob);
    };

    reader.onload = async () => {
      const audioContext = new AudioContextCtor();
      try {
        const arrayBuffer = reader.result;
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const channelCount = audioBuffer.numberOfChannels;
        let samples = audioBuffer.getChannelData(0);

        if (channelCount > 1) {
          const mixed = new Float32Array(audioBuffer.length);
          for (let channel = 0; channel < channelCount; channel++) {
            const channelSamples = audioBuffer.getChannelData(channel);
            for (let i = 0; i < mixed.length; i++) {
              mixed[i] += channelSamples[i];
            }
          }
          for (let i = 0; i < mixed.length; i++) {
            mixed[i] /= channelCount;
          }
          samples = mixed;
        }

        const mp3encoder = new lamejs.Mp3Encoder(1, audioBuffer.sampleRate, 128);
        const sampleBlockSize = 1152;
        const mp3Data = [];

        for (let i = 0; i < samples.length; i += sampleBlockSize) {
          const end = Math.min(i + sampleBlockSize, samples.length);
          const chunk = samples.subarray(i, end);
          const int16Samples = new Int16Array(chunk.length);
          for (let j = 0; j < chunk.length; j++) {
            const sample = Math.max(-1, Math.min(1, chunk[j]));
            int16Samples[j] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
          }
          const mp3buf = mp3encoder.encodeBuffer(int16Samples);
          if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
          }
        }

        const flush = mp3encoder.flush();
        if (flush.length > 0) {
          mp3Data.push(flush);
        }

        if (mp3Data.length > 0) {
          resolve(new Blob(mp3Data, { type: 'audio/mp3' }));
        } else {
          resolve(blob);
        }
      } catch (error) {
        console.warn('MP3 encoding failed, using original blob.', error);
        resolve(blob);
      } finally {
        audioContext.close().catch(() => {});
      }
    };

    reader.readAsArrayBuffer(blob);
  });
}

const HTML_ESCAPE_LOOKUP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function escapeHTML(value) {
  return (value ?? '').replace(/[&<>"']/g, char => HTML_ESCAPE_LOOKUP[char] || char);
}

function formatAudioNoteTime(timestamp) {
  if (!timestamp) {
    return '—';
  }
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function initializeAudioNotesList() {
  const list = $('audioNotesList');
  if (!list || list.dataset.bound === 'true') {
    return;
  }

  list.dataset.bound = 'true';

  list.addEventListener('input', event => {
    if (!event.target.matches('[data-role="transcription"]')) {
      return;
    }

    const textarea = event.target;
    const container = textarea.closest('.audio-note');
    if (!container) {
      return;
    }

    const saveButton = container.querySelector('[data-action="save-transcription"]');
    const copyButton = container.querySelector('[data-action="copy-transcription"]');
    const originalValue = decodeURIComponent(textarea.dataset.originalValue || '');
    const currentValue = textarea.value;

    if (saveButton) {
      saveButton.disabled = currentValue.trim() === originalValue.trim();
      if (!saveButton.disabled) {
        saveButton.textContent = 'Save';
      }
    }

    if (copyButton) {
      copyButton.disabled = currentValue.trim().length === 0;
    }
  });

  list.addEventListener('click', async event => {
    const button = event.target.closest('button[data-action]');
    if (!button) {
      return;
    }

    event.preventDefault();

    const container = button.closest('.audio-note');
    if (!container) {
      return;
    }

    const noteId = container.dataset.noteId;
    if (!noteId) {
      return;
    }

    if (button.dataset.action === 'save-transcription') {
      const textarea = container.querySelector('[data-role="transcription"]');
      if (!textarea) {
        return;
      }
      button.disabled = true;
      button.textContent = 'Saving…';
      try {
        await updateTranscription(noteId, textarea.value, { button, textarea });
      } catch (error) {
        console.error('Transcription save failed', error);
      }
      return;
    }

    if (button.dataset.action === 'copy-transcription') {
      const textarea = container.querySelector('[data-role="transcription"]');
      const text = textarea?.value?.trim() || '';
      if (!text) {
        setVoiceStatus('No transcription to copy.', { tone: 'warning' });
        return;
      }
      try {
        await copyTextToClipboard(text);
        setVoiceStatus('Transcription copied to clipboard.', { tone: 'success' });
      } catch (error) {
        console.error('Copy failed', error);
        setVoiceStatus('Unable to copy transcription.', { tone: 'error' });
      }
    }
  });
}

// Render audio notes for today
function renderAudioNotes() {
  const list = $('audioNotesList');
  if (!list) {
    return;
  }

  if (Array.isArray(list._activeUrls)) {
    list._activeUrls.forEach(url => {
      try {
        URL.revokeObjectURL(url);
      } catch (error) {
        console.warn('Failed to revoke audio URL', error);
      }
    });
  }
  list._activeUrls = [];

  const today = new Date().toISOString().split('T')[0];
  window.getAudioNotes(today)
    .then(notes => {
      if (!Array.isArray(notes) || notes.length === 0) {
        list.innerHTML = '<p class="audio-note-empty">No audio notes logged today.</p>';
        return;
      }

      notes.sort((a, b) => {
        const timeA = new Date(a.timestamp || 0).getTime();
        const timeB = new Date(b.timestamp || 0).getTime();
        return timeB - timeA;
      });

      const markup = notes
        .map(note => {
          const audioUrl = URL.createObjectURL(note.blob);
          list._activeUrls.push(audioUrl);
          const transcription = typeof note.transcription === 'string' ? note.transcription : '';
          const encodedOriginal = encodeURIComponent(transcription || '');
          const safeTranscription = escapeHTML(transcription);
          const displayTime = formatAudioNoteTime(note.timestamp);
          return `
            <article class="audio-note" data-note-id="${note.id}">
              <header class="audio-note-header">
                <span class="audio-note-time">${displayTime}</span>
                <button type="button" class="audio-note-copy" data-action="copy-transcription"${transcription ? '' : ' disabled'}>Copy text</button>
              </header>
              <audio controls src="${audioUrl}"></audio>
              <label class="audio-note-label" for="transcription-${note.id}">Transcription</label>
              <textarea id="transcription-${note.id}" data-role="transcription" data-original-value="${encodedOriginal}" placeholder="Add or edit transcription…">${safeTranscription}</textarea>
              <div class="audio-note-actions">
                <button type="button" class="audio-note-save" data-action="save-transcription" disabled>Save</button>
                <a href="${audioUrl}" download="audio-${note.id}.mp3">Download MP3</a>
              </div>
            </article>
          `;
        })
        .join('');

      list.innerHTML = markup;
    })
    .catch(error => {
      console.error('Failed to load audio notes', error);
      list.innerHTML = '<p class="audio-note-empty">Unable to load audio notes.</p>';
    });
}

function updateVisibleAspects() {
  Object.keys(appState.visibleAspects || {}).forEach(domain => {
    const card = document.querySelector(`.domain-card[data-domain="${domain}"]`);
    if (card) {
      card.style.display = appState.visibleAspects[domain] ? '' : 'none';
    }
  });
}

function showScreen(screenId) {
  try {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(screenId);
    if (el) el.classList.add('active');
    appState.currentScreen = (screenId || appState.currentScreen).replace(/Screen$/, '') || appState.currentScreen;
  } catch (e) {
    console.warn('showScreen failed', e);
  }
}

function renderAspectsManager() {
  const container = $('aspectsManager');
  if (!container) return;
  try {
    container.innerHTML = '';
    Object.keys(DOMAINS).forEach(domain => {
      const row = document.createElement('div');
      row.className = 'manage-row';
      const label = document.createElement('span');
      label.className = 'manage-label';
      label.textContent = domain.toUpperCase();

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'toggle-domain';
      btn.dataset.domain = domain;
      btn.textContent = appState.visibleAspects && appState.visibleAspects[domain] ? 'HIDE' : 'SHOW';

      row.appendChild(label);
      row.appendChild(btn);
      container.appendChild(row);
    });
  } catch (e) {
    console.warn('renderAspectsManager failed', e);
  }
}

function updateProgress() {
  try {
    Object.keys(DOMAINS).forEach(domain => {
      const total = DOMAINS[domain].length;
      const completed = Object.values(appState.todayData[domain] || {}).filter(Boolean).length;
      const el = document.querySelector(`.domain-status[data-domain-status="${domain}"]`);
      if (el) el.textContent = `${completed}/${total}`;
    });

    try {
      const allCompleted = Object.values(appState.todayData || {}).reduce((acc, byAspect) => acc + Object.values(byAspect).filter(Boolean).length, 0);
      const percent = TOTAL_ASPECTS ? Math.round((allCompleted / TOTAL_ASPECTS) * 100) : 0;
      const fill = $('quarterFill');
      if (fill) fill.style.width = `${percent}%`;
    } catch (e) { /* ignore */ }
  } catch (e) {
    console.warn('updateProgress failed', e);
  }
}

function renderReview() {
  const el = $('weeklyCompletion');
  const weekGrid = $('weekGrid');
  const streaksEl = $('streaksContainer');
  if (!el || !weekGrid || !streaksEl) return;

  try {
    // Weekly completion summary (simple percent of aspects completed today)
    const totals = Object.keys(DOMAINS).reduce((acc, d) => {
      const total = (DOMAINS[d] || []).length;
      const completed = Object.values(appState.todayData[d] || {}).filter(Boolean).length;
      acc.total += total; acc.completed += completed;
      return acc;
    }, { total: 0, completed: 0 });

    const percent = totals.total ? Math.round((totals.completed / totals.total) * 100) : 0;
    el.innerHTML = `<div class="review-summary"><div>Weekly completion</div><div style="margin-left:8px;font-weight:700">${percent}%</div></div>`;

    // Build the last 7 days rows inside #weekGrid
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }

    weekGrid.innerHTML = '';
    days.forEach(dateStr => {
      const row = document.createElement('div');
      row.className = 'review-day' + (dateStr === new Date().toISOString().split('T')[0] ? ' today' : '');
      const header = document.createElement('div');
      header.className = 'review-day-header';
      const dateLabel = document.createElement('div');
      dateLabel.className = 'review-day-date';
      const d = new Date(dateStr);
      const dayName = d.toLocaleString('en-US', { weekday: 'short' }).toUpperCase();
      const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      dateLabel.innerHTML = `<div class="review-day-name">${dayName}</div><div class="review-day-month">${month} ${d.getDate()}</div>`;
      const count = document.createElement('div');
      count.className = 'review-day-count';
      // compute completed count for the day
      (async () => {
        try {
          const entries = (await getEntriesByDate(dateStr)) || [];
          const completedCount = entries.filter(e => e.completed).length;
          count.textContent = `${completedCount}`;
        } catch (e) {
          count.textContent = '-';
        }
      })();

      header.appendChild(dateLabel);
      header.appendChild(count);
      row.appendChild(header);

      // List each domain with small aspect boxes
      const details = document.createElement('div');
      details.className = 'review-day-details';
      Object.keys(DOMAINS).forEach(domain => {
        const domainRow = document.createElement('div');
        domainRow.className = 'review-domain';
        const name = document.createElement('div');
        name.className = 'review-domain-name';
        name.textContent = domain.toUpperCase();
        const aspectsWrap = document.createElement('div');
        aspectsWrap.className = 'review-aspects';

        (DOMAINS[domain] || []).forEach(aspect => {
          const box = document.createElement('div');
          box.className = 'review-aspect';
          // query entry by date
          (async () => {
            try {
              const entries = await getEntriesByDate(dateStr);
              const e = entries.find(it => it.domain === domain && it.aspect === aspect);
              if (e && e.completed) box.classList.add('completed');
            } catch (err) {}
          })();
          box.title = aspect;
          box.textContent = '';
          aspectsWrap.appendChild(box);
        });

        domainRow.appendChild(name);
        domainRow.appendChild(aspectsWrap);
        details.appendChild(domainRow);
      });

      row.appendChild(details);
      weekGrid.appendChild(row);
    });

    // Streaks
    streaksEl.innerHTML = '';
    Object.keys(DOMAINS).forEach(domain => {
      const container = document.createElement('div');
      container.className = 'streak-domain';
      const h4 = document.createElement('h4');
      h4.textContent = domain.toUpperCase();
      container.appendChild(h4);
      const list = document.createElement('div');
      list.className = 'streak-list';
      (DOMAINS[domain] || []).forEach(aspect => {
        const item = document.createElement('div');
        item.className = 'streak-item';
        const key = `${domain}-${aspect}`;
        const val = (appState.streaks && typeof appState.streaks[key] !== 'undefined') ? appState.streaks[key] : 0;
        item.textContent = `${aspect}: ${val}`;
        list.appendChild(item);
      });
      container.appendChild(list);
      streaksEl.appendChild(container);
    });

  } catch (e) { console.warn('renderReview failed', e); }
}

async function updateTranscription(noteId, newValue, { button, textarea }) {
    if (!button || !textarea) return;
    try {
      await window.updateAudioTranscription(noteId, newValue);
      textarea.dataset.originalValue = encodeURIComponent(newValue);
      button.textContent = 'Saved';
      button.disabled = true;
      setTimeout(() => {
        if (button.textContent === 'Saved') {
          button.textContent = 'Save';
        }
      }, 2000);
    } catch (error) {
      console.error('Failed to update transcription:', error);
      button.textContent = 'Retry';
      button.disabled = false;
    }
}

window.initializeUI = initializeUI;
window.renderAspectsManager = renderAspectsManager;
window.updateProgress = updateProgress;
window.updateVisibleAspects = updateVisibleAspects;
window.renderAudioNotes = renderAudioNotes;
window.updateTranscription = updateTranscription;