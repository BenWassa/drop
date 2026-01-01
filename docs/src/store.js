// === STORE MODULE ===
// Data persistence and state management for the drop life tracker app

import {
  firebaseSignInAnonymous,
  subscribeToAuthState,
  firestoreLoadState,
  firestoreSaveState,
} from './firebase.js';

const BASE_SKILL_OPTIONS = ['Wrestling', 'Volleyball', 'Mobility', 'Yoga', 'Plyometrics'];
const SAVE_DEBOUNCE_MS = 400;
const SCHEMA_VERSION = 2;
const SCHEMA_DATE = '2024-05-01';
const META_SETTINGS_KEYS = [
  'skillOptions',
  'visionTheme',
  'visionSleepFocus',
  'visionFitnessFocus',
  'visionMindFocus',
  'visionSpiritFocus',
];

const Store = {
  DB_KEY: 'lifeTrackerData',
  state: {},
  saveTimer: null,
  _uid: null,
  _remoteSaveTimer: null,
  userId: null,
  firebaseReady: false,
  dailyKeys: [
    'wake',
    'rest',
    'run',
    'strength',
    'strength_level',
    'skill',
    'read_level',
    'write_level',
    'quadrant',
    'meditation',
    'energy',
    'mood',
  ],
  defaults: {
    wake: '',
    rest: '',
    run: 0,
    strength: false,
    strength_level: 0,
    skill: [],
    read_level: 0,
    write_level: 0,
    quadrant: 0,
    meditation: false,
    energy: 0,
    mood: 0,
    skillOptions: [],
    visionTheme: '',
    visionSleepFocus: '',
    visionFitnessFocus: '',
    visionMindFocus: '',
    visionSpiritFocus: '',
    lastEntryDate: '',
    actionTimestamps: {},
    entries: {},
    archivedEntries: {},
    meta: {
      _version: SCHEMA_VERSION,
      _schemaDate: SCHEMA_DATE,
    },
  },

  async init() {
    console.log('🔧 Store.init called');

    this._uid = null;

    try {
      this._uid = await firebaseSignInAnonymous();
      console.log('🔥 Signed in anonymously, UID:', this._uid);
    } catch (e) {
      console.warn('❌ Anonymous sign-in failed, staying offline-safe:', e.message);
    }

    let loadedState = null;

    if (this._uid) {
      try {
        loadedState = await firestoreLoadState(this._uid);
        console.log('☁️ Loaded state from Firestore');
      } catch (e) {
        console.warn('❌ Firestore load failed, falling back to local:', e.message);
        loadedState = null;
      }
    }

    if (loadedState) {
      this.state = loadedState;
      this.saveLocalOnly(); // write local cache immediately
    } else {
      this.loadFromLocalStorage(); // existing init path
    }

    this.applyMigrations(this.state);
    this.ensureMeta();
    this.ensureEntries();
    this.ensureSkillCollections();
    this.state.meta.settings = this.collectSettings();
    this.migrateOldMindFields();
    this.hydrateDailyState();
    this.saveLocalOnly();
  },

  loadFromLocalStorage() {
    const savedData = JSON.parse(localStorage.getItem(this.DB_KEY) || '{}');
    // console.log('💾 Loaded from localStorage:', Object.keys(savedData).length, 'keys');

    this.state = { ...this.cloneDefaults(), ...savedData };
    // console.log('📋 Initial state created with', Object.keys(this.state).length, 'keys');
    // console.log('📊 Daily values:', {
    //   wake: this.state.wake,
    //   rest: this.state.rest,
    //   run: this.state.run,
    //   strength: this.state.strength,
    //   skill: this.state.skill,
    //   read: this.state.read,
    //   write: this.state.write,
    //   meditation: this.state.meditation,
    //   quadrant: this.state.quadrant
    // });
  },

  saveLocalOnly() {
    const payload = this.getPersistedState();
    try {
      localStorage.setItem(this.DB_KEY, JSON.stringify(payload));
      // console.log('💾 Saved to localStorage');
    } catch (error) {
      if (this.isQuotaError(error)) {
        const recovered = this.handleQuotaExceeded();
        if (recovered) {
          this.saveLocalOnly();
          return;
        }
        console.error('Quota exceeded and automatic recovery failed:', error);
        if (typeof UI !== 'undefined' && typeof UI.notify === 'function') {
          UI.notify('Storage is full. Please clear old data.', 5000);
        }
      } else {
        console.error('LocalStorage save failed:', error);
      }
    }
  },

  scheduleRemoteSave() {
    if (!this._uid) return;
    clearTimeout(this._remoteSaveTimer);
    this._remoteSaveTimer = setTimeout(async () => {
      try {
        await firestoreSaveState(this._uid, this.state);
        console.log('☁️ Saved to Firestore');
      } catch (e) {
        console.warn('❌ Firestore save failed (silent):', e.message);
      }
    }, 800);
  },

  applyMigrations(savedData) {
    if (!this.state.meta || typeof this.state.meta !== 'object') {
      this.state.meta = { ...this.cloneDefaults().meta };
    }

    this.state.meta._version = SCHEMA_VERSION;
    this.state.meta._schemaDate = SCHEMA_DATE;

    if (this.state.dailyTimestamps) {
      delete this.state.dailyTimestamps;
    }

    if (Array.isArray(this.state.history)) {
      this.migrateHistoryToEntries(this.state.history);
      delete this.state.history;
    }

    if (Array.isArray(savedData?.history)) {
      this.migrateHistoryToEntries(savedData.history);
    }
  },

  ensureEntries() {
    if (
      !this.state.entries ||
      typeof this.state.entries !== 'object' ||
      Array.isArray(this.state.entries)
    ) {
      this.state.entries = {};
    }
    if (
      !this.state.archivedEntries ||
      typeof this.state.archivedEntries !== 'object' ||
      Array.isArray(this.state.archivedEntries)
    ) {
      this.state.archivedEntries = {};
    }
  },

  ensureMeta() {
    const defaultMeta = this.cloneDefaults().meta;
    if (!this.state.meta || typeof this.state.meta !== 'object' || Array.isArray(this.state.meta)) {
      this.state.meta = { ...defaultMeta };
    }
    this.state.meta = {
      ...defaultMeta,
      ...this.state.meta,
      _version: SCHEMA_VERSION,
      _schemaDate: SCHEMA_DATE,
    };
  },

  hydrateDailyState() {
    const today = this.getToday();
    const entry = this.getEntry(today);

    if (entry) {
      this.applyEntryToState(entry);
      this.state.actionTimestamps = { ...(entry.timestamps || {}) };
    } else {
      this.resetDailyData();
    }

    this.state.lastEntryDate = today;
  },

  applyEntryToState(entry) {
    this.dailyKeys.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(entry, key)) {
        const value = entry[key];
        this.state[key] = Array.isArray(value) ? [...value] : value;
      } else if (key in this.defaults) {
        const defaultValue = this.defaults[key];
        this.state[key] = Array.isArray(defaultValue)
          ? [...defaultValue]
          : defaultValue && typeof defaultValue === 'object'
            ? JSON.parse(JSON.stringify(defaultValue))
            : defaultValue;
      }
    });
  },

  migrateHistoryToEntries(history) {
    if (!Array.isArray(history) || history.length === 0) {
      return;
    }

    this.ensureEntries();
    history.forEach((histEntry) => {
      if (!histEntry || typeof histEntry !== 'object' || !histEntry.date) {
        return;
      }
      const existing = this.state.entries[histEntry.date] || {};
      this.state.entries[histEntry.date] = {
        ...existing,
        scores: { ...(histEntry.scores || {}) },
      };
    });
  },

  getEntry(date) {
    if (!date) return null;
    this.ensureEntries();
    const entry = this.state.entries[date];
    if (!entry || typeof entry !== 'object') {
      return null;
    }
    return JSON.parse(JSON.stringify(entry));
  },

  setEntry(date, entry) {
    if (!date || !entry) return;
    this.ensureEntries();
    const sanitized = {};
    this.dailyKeys.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(entry, key)) {
        const value = entry[key];
        sanitized[key] = Array.isArray(value) ? [...value] : value;
      }
    });
    if (entry.timestamps) {
      sanitized.timestamps = { ...entry.timestamps };
    }
    if (entry.scores) {
      sanitized.scores = { ...entry.scores };
    }
    this.state.entries[date] = sanitized;
  },

  ensureSkillCollections() {
    const selections = this.sanitizeStringArray(this.state.skill);
    const options = this.sanitizeStringArray(this.state.skillOptions);
    const baseLower = new Set(BASE_SKILL_OPTIONS.map((opt) => opt.toLowerCase()));
    const optionLower = new Set(options.map((opt) => opt.toLowerCase()));
    selections.forEach((option) => {
      const lower = option.toLowerCase();
      if (!baseLower.has(lower) && !optionLower.has(lower)) {
        options.push(option);
        optionLower.add(lower);
      }
    });
    this.state.skill = selections;
    this.state.skillOptions = this.sanitizeStringArray(options);
  },

  migrateOldMindFields() {
    // Migrate old boolean read/write fields to new tiered system
    if (this.state.read === true && this.state.read_level === undefined) {
      this.state.read_level = 2; // Default to "Perspicacity" if they were reading
    }
    if (this.state.write === true && this.state.write_level === undefined) {
      this.state.write_level = 2; // Default to "Editorial" if they were writing
    }

    // Remove old boolean fields if they exist
    if (this.state.read !== undefined && typeof this.state.read === 'boolean') {
      delete this.state.read;
    }
    if (this.state.write !== undefined && typeof this.state.write === 'boolean') {
      delete this.state.write;
    }
  },

  sanitizeStringArray(value) {
    if (!Array.isArray(value)) {
      return [];
    }
    const cleaned = value
      .map((item) => (typeof item === 'string' ? item : String(item ?? '')).trim())
      .filter(Boolean);
    return Array.from(new Set(cleaned)).sort((a, b) => a.localeCompare(b));
  },

  sanitizeEntriesObject(entries) {
    if (!entries || typeof entries !== 'object' || Array.isArray(entries)) {
      return {};
    }
    const sanitized = {};
    Object.entries(entries).forEach(([date, entry]) => {
      if (typeof date !== 'string' || !entry || typeof entry !== 'object' || Array.isArray(entry)) {
        return;
      }
      const cleaned = {};
      this.dailyKeys.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(entry, key)) {
          const value = entry[key];
          if (Array.isArray(value)) {
            cleaned[key] = key === 'skill' ? this.sanitizeStringArray(value) : [...value];
          } else if (value && typeof value === 'object') {
            cleaned[key] = JSON.parse(JSON.stringify(value));
          } else {
            cleaned[key] = value;
          }
        }
      });
      if (
        entry.timestamps &&
        typeof entry.timestamps === 'object' &&
        !Array.isArray(entry.timestamps)
      ) {
        cleaned.timestamps = { ...entry.timestamps };
      }
      if (entry.scores && typeof entry.scores === 'object' && !Array.isArray(entry.scores)) {
        cleaned.scores = this.normalizeScores(entry.scores);
      }
      sanitized[date] = cleaned;
    });
    return sanitized;
  },

  isSanitizedPayload(payload) {
    return (
      payload &&
      typeof payload === 'object' &&
      !Array.isArray(payload) &&
      typeof payload.entries === 'object' &&
      typeof payload.meta === 'object'
    );
  },

  extractSettings(settings = {}) {
    const sanitized = {};
    META_SETTINGS_KEYS.forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(settings, key)) {
        return;
      }
      if (key === 'skillOptions') {
        sanitized[key] = this.sanitizeStringArray(settings[key]);
      } else {
        sanitized[key] =
          typeof settings[key] === 'string' ? settings[key] : String(settings[key] ?? '');
      }
    });
    return sanitized;
  },

  applySettings(settings = {}) {
    Object.entries(settings).forEach(([key, value]) => {
      if (META_SETTINGS_KEYS.includes(key)) {
        if (Array.isArray(value)) {
          this.state[key] = [...value];
        } else {
          this.state[key] = value;
        }
      }
    });
    this.ensureSkillCollections();
  },

  collectSettings() {
    const settings = {};
    META_SETTINGS_KEYS.forEach((key) => {
      const value = this.state[key];
      if (Array.isArray(value)) {
        settings[key] = [...value];
      } else if (value !== undefined) {
        settings[key] = value;
      }
    });
    return settings;
  },

  valuesEqual(a, b) {
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i += 1) {
        if (a[i] !== b[i]) return false;
      }
      return true;
    }
    return Object.is(a, b);
  },

  getSkillOptions() {
    const baseOptions = BASE_SKILL_OPTIONS.map((opt) =>
      typeof opt === 'string' ? opt.trim() : ''
    ).filter(Boolean);
    const baseLower = baseOptions.map((opt) => opt.toLowerCase());
    const customOptions = Array.isArray(this.state.skillOptions)
      ? this.sanitizeStringArray(this.state.skillOptions)
      : [];
    const merged = [...baseOptions];
    customOptions.forEach((option) => {
      if (!baseLower.includes(option.toLowerCase())) {
        merged.push(option);
      }
    });
    return merged;
  },

  toggleSkill(option) {
    if (!option) return;
    const normalized = String(option).trim();
    if (!normalized) return;
    const current = Array.isArray(this.state.skill) ? [...this.state.skill] : [];
    const index = current.indexOf(normalized);
    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(normalized);
    }
    this.update('skill', current);
  },

  addSkillOption(option) {
    if (!option) return false;
    const normalized = String(option).trim();
    if (!normalized) return false;
    const lower = normalized.toLowerCase();
    const baseLower = BASE_SKILL_OPTIONS.map((opt) => opt.toLowerCase());
    if (baseLower.includes(lower)) {
      return false;
    }
    const options = Array.isArray(this.state.skillOptions) ? [...this.state.skillOptions] : [];
    if (options.some((opt) => opt.toLowerCase() === lower)) {
      return false;
    }
    options.push(normalized);
    this.state.skillOptions = this.sanitizeStringArray(options);
    this.save();
    return true;
  },

  cloneDefaults() {
    return JSON.parse(JSON.stringify(this.defaults));
  },

  getToday() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;
    if (typeof window !== 'undefined' && window.DEV_MODE) {
      console.log('📅 getToday():', dateKey, 'from Date:', now, 'ISO:', now.toISOString());
    }
    return dateKey;
  },

  /**
   * Get the "sleep day" - calendar day adjusted for sleep cycles.
   * Hours 00:00-03:59 are considered part of the previous calendar day.
   * This ensures that going to bed at 2 AM logs to "yesterday's" sleep cycle.
   */
  getSleepDay() {
    const now = new Date();
    const hours = now.getHours();

    // If it's between midnight and 4 AM, use previous calendar day
    if (hours < 4) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const year = yesterday.getFullYear();
      const month = String(yesterday.getMonth() + 1).padStart(2, '0');
      const day = String(yesterday.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    // Otherwise use current calendar day
    return this.getToday();
  },

  resetDailyData() {
    this.dailyKeys.forEach((key) => {
      if (key in this.defaults) {
        const defaultValue = this.defaults[key];
        if (Array.isArray(defaultValue)) {
          this.state[key] = [...defaultValue];
        } else if (defaultValue && typeof defaultValue === 'object') {
          this.state[key] = JSON.parse(JSON.stringify(defaultValue));
        } else {
          this.state[key] = defaultValue;
        }
      }
    });
    this.state.actionTimestamps = {};
    this.ensureSkillCollections();
  },

  checkForNewDay() {
    const today = this.getToday();

    if (this.state.lastEntryDate === today) {
      return false;
    }

    const entry = this.getEntry(today);
    if (entry) {
      this.applyEntryToState(entry);
      this.state.actionTimestamps = { ...(entry.timestamps || {}) };
    } else {
      this.resetDailyData();
    }

    this.state.lastEntryDate = today;
    this.scheduleSave();

    if (typeof App !== 'undefined') {
      if (typeof UI !== 'undefined' && typeof UI.syncDailyUI === 'function') {
        UI.syncDailyUI();
      }
      if (typeof App.updateScores === 'function') {
        App.updateScores();
      }
    }

    return true;
  },

  save() {
    this.scheduleSave();
  },

  scheduleSave() {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }

    this.saveTimer = setTimeout(() => {
      this.saveTimer = null;
      this.persistState();
    }, SAVE_DEBOUNCE_MS);
  },

  flushSave() {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
    this.persistState();
  },

  persistState() {
    this.saveLocalOnly();
    this.scheduleRemoteSave();
  },

  isQuotaError(error) {
    if (!error) return false;
    return (
      error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error.code === 22 ||
      error.code === 1014
    );
  },

  handleQuotaExceeded() {
    const pruned = this.archiveOldEntries();
    if (pruned > 0) {
      console.warn(`Storage quota exceeded. Archived ${pruned} old entries.`);
      return true;
    }
    return false;
  },

  archiveOldEntries(limit = 14) {
    this.ensureEntries();
    const dates = Object.keys(this.state.entries).sort();
    if (dates.length === 0) {
      return 0;
    }

    const count = Math.min(limit, Math.max(1, Math.floor(dates.length * 0.1)));
    const toArchive = dates.slice(0, count);

    toArchive.forEach((date) => {
      const entry = this.state.entries[date];
      if (entry) {
        this.state.archivedEntries[date] = entry;
        delete this.state.entries[date];
      }
    });

    this.state.meta = {
      ...this.state.meta,
      lastArchive: new Date().toISOString(),
      archivedCount: (this.state.meta?.archivedCount || 0) + toArchive.length,
    };

    return toArchive.length;
  },

  getPersistedState() {
    return { ...this.state };
  },

  getSanitizedExport() {
    const entries = this.sanitizeEntriesObject(this.state.entries);
    const archivedEntries = this.sanitizeEntriesObject(this.state.archivedEntries);
    const meta = {
      ...this.state.meta,
      _version: SCHEMA_VERSION,
      _schemaDate: SCHEMA_DATE,
      exportedAt: new Date().toISOString(),
      lastEntryDate: this.state.lastEntryDate || '',
      settings: this.collectSettings(),
    };

    if (Object.keys(archivedEntries).length > 0) {
      meta.archivedEntries = archivedEntries;
    }

    return { meta, entries };
  },

  update(key, value) {
    this.checkForNewDay();
    console.log('📝 Store.update called:', key, '=', value);

    if (key in this.state) {
      let newValue = value;
      if (key === 'skill' || key === 'skillOptions') {
        newValue = this.sanitizeStringArray(Array.isArray(value) ? value : [value]);
      } else if (Array.isArray(value)) {
        newValue = [...value];
      }
      this.state[key] = newValue;
      console.log('✅ State updated:', key, '=', this.state[key]);

      if (this.dailyKeys.includes(key)) {
        // Use current calendar day for all entries
        const entryDate = this.getToday();
        this.state.lastEntryDate = entryDate;
        console.log('📅 Daily key logged for:', entryDate);
        // Add timestamp when data is logged
        if (!this.state.actionTimestamps) {
          this.state.actionTimestamps = {};
        }
        this.state.actionTimestamps[key] = new Date().toISOString();
        // Save current daily data to entries for history view
        this.saveCurrentEntry();
      }
      this.save();
      // console.log('💾 State saved to localStorage');

      if (!key.startsWith('vision')) {
        console.log('🔄 Triggering score update for key:', key);
        App.updateScores();
        if (typeof UI !== 'undefined') {
          UI.updatePracticeValues();
        }
      }
    } else {
      console.warn('⚠️ Key not found in state:', key);
    }
  },

  saveCurrentEntry() {
    this.ensureEntries();
    // Use current calendar day for saving entries
    const today = this.getToday();
    if (typeof window !== 'undefined' && window.DEV_MODE) {
      // console.log('💾 saveCurrentEntry: today =', today, 'existing entries:', Object.keys(this.state.entries));
    }
    const existing = this.state.entries[today] || {};
    const entry = { ...existing };

    // Save all daily keys to the entry
    this.dailyKeys.forEach((key) => {
      const value = this.state[key];
      entry[key] = Array.isArray(value) ? [...value] : value;
    });

    // Save action timestamps for this day
    if (this.state.actionTimestamps) {
      entry.timestamps = { ...this.state.actionTimestamps };
    }

    if (existing.scores) {
      entry.scores = { ...existing.scores };
    }

    // Only save if there's actual data (not all defaults)
    const hasData = this.dailyKeys.some((key) => {
      const value = this.state[key];
      const defaultValue = this.defaults[key];
      if (Array.isArray(defaultValue)) {
        return !this.valuesEqual(value, defaultValue);
      }
      return !this.valuesEqual(value, defaultValue);
    });

    if (hasData) {
      this.setEntry(today, entry);
    } else if (this.state.entries[today]) {
      delete this.state.entries[today];
    }
  },

  validateImport(payload) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      console.error('❌ Import validation failed: payload is not an object');
      return false;
    }

    if (this.isSanitizedPayload(payload)) {
      return this.validateSanitizedPayload(payload);
    }

    return this.validateLegacyPayload(payload);
  },

  validateSanitizedPayload(payload) {
    const { meta, entries } = payload;

    if (!meta || typeof meta !== 'object' || Array.isArray(meta)) {
      console.error('❌ Import validation failed: meta must be an object');
      return false;
    }

    if (!entries || typeof entries !== 'object' || Array.isArray(entries)) {
      console.error('❌ Import validation failed: entries must be an object');
      return false;
    }

    if (meta.settings && (typeof meta.settings !== 'object' || Array.isArray(meta.settings))) {
      console.error('❌ Import validation failed: meta.settings must be an object when provided');
      return false;
    }

    return true;
  },

  validateLegacyPayload(payload) {
    const allowedKeys = Object.keys(this.defaults);

    for (const key of Object.keys(payload)) {
      if (!allowedKeys.includes(key)) {
        console.warn(`⚠️ Import: Ignoring unknown key "${key}"`);
        continue;
      }

      const defaultValue = this.defaults[key];
      const value = payload[key];

      if (value === null || value === undefined) {
        console.warn(`⚠️ Import: Key "${key}" is null/undefined, will use default`);
        continue;
      }

      const defaultType = typeof defaultValue;

      if (Array.isArray(defaultValue)) {
        if (!Array.isArray(value)) {
          console.error(
            `❌ Import validation failed: "${key}" should be array, got ${typeof value}`
          );
          return false;
        }
        continue;
      }

      if (defaultType === 'boolean') {
        if (typeof value !== 'boolean') {
          console.error(
            `❌ Import validation failed: "${key}" should be boolean, got ${typeof value}`
          );
          return false;
        }
        continue;
      }

      if (defaultType === 'number') {
        if (typeof value !== 'number' || !Number.isFinite(value)) {
          console.error(
            `❌ Import validation failed: "${key}" should be finite number, got ${typeof value}`
          );
          return false;
        }
        continue;
      }

      if (defaultType === 'string') {
        if (typeof value !== 'string') {
          console.error(
            `❌ Import validation failed: "${key}" should be string, got ${typeof value}`
          );
          return false;
        }
        continue;
      }

      if (defaultType === 'object') {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
          console.error(
            `❌ Import validation failed: "${key}" should be object, got ${typeof value}`
          );
          return false;
        }

        if (key === 'entries') {
          console.log('✅ Import: entries object detected (legacy format)');
          continue;
        }
      }
    }

    console.log('✅ Legacy import validation passed');
    return true;
  },

  merge(payload) {
    if (this.isSanitizedPayload(payload)) {
      this.mergeSanitizedPayload(payload);
      return;
    }

    this.mergeLegacyPayload(payload);
  },

  mergeSanitizedPayload(payload) {
    const defaults = this.cloneDefaults();
    const sanitizedEntries = this.sanitizeEntriesObject(payload.entries);
    const archivedEntries = this.sanitizeEntriesObject(payload.meta?.archivedEntries || {});

    // Preserve current meta and settings, only merge entries
    this.state = {
      ...defaults,
      entries: sanitizedEntries,
      archivedEntries,
      meta: {
        ...defaults.meta,
        ...this.state.meta, // Preserve current meta and settings
      },
    };

    this.applySettings(settings);

    if (payload.meta?.lastEntryDate) {
      this.state.lastEntryDate = payload.meta.lastEntryDate;
      const entry = this.getEntry(payload.meta.lastEntryDate);
      if (entry) {
        this.applyEntryToState(entry);
        this.state.actionTimestamps = { ...(entry.timestamps || {}) };
      } else {
        this.hydrateDailyState();
      }
    } else {
      this.hydrateDailyState();
    }

    this.state.meta.settings = this.collectSettings();
    this.flushSave();
    this.notifyStateUpdated();
  },

  mergeLegacyPayload(payload) {
    const mergedState = { ...this.state, ...payload };

    if (payload.entries) {
      mergedState.entries = this.sanitizeEntriesObject(payload.entries);
    }

    if (payload.archivedEntries) {
      mergedState.archivedEntries = this.sanitizeEntriesObject(payload.archivedEntries);
    }

    if (payload.skillOptions) {
      mergedState.skillOptions = this.sanitizeStringArray(payload.skillOptions);
    }

    if (payload.skill) {
      mergedState.skill = this.sanitizeStringArray(payload.skill);
    }

    delete mergedState.history;
    delete mergedState.dailyTimestamps;

    mergedState.meta = {
      ...this.cloneDefaults().meta,
      ...(mergedState.meta || {}),
    };

    this.state = mergedState;
    this.ensureEntries();
    this.ensureMeta();
    this.ensureSkillCollections();
    this.state.meta.settings = this.collectSettings();
    this.hydrateDailyState();
    this.flushSave();
    this.notifyStateUpdated();
  },

  clearAllData() {
    this.state = this.cloneDefaults();
    this.ensureEntries();
    this.ensureMeta();
    this.ensureSkillCollections();
    this.state.meta.settings = this.collectSettings();
    delete this.state.currentDate;
    this.flushSave();
  },

  recordHistory(scores) {
    if (!scores || typeof scores !== 'object') return;

    const today = this.getToday();
    const safeScores = ['sleep', 'fitness', 'mind', 'spirit'].reduce((acc, domain) => {
      const value = Number(scores[domain]);
      const safeValue = Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value))) : 0;
      acc[domain] = safeValue;
      return acc;
    }, {});

    // Don't record history if all scores are zero (no real data entered)
    const hasData = Object.values(safeScores).some((score) => score > 0);
    if (!hasData) return;

    const entry = this.getEntry(today) || {};
    entry.scores = safeScores;
    if (!entry.timestamps && this.state.actionTimestamps) {
      entry.timestamps = { ...this.state.actionTimestamps };
    }

    this.setEntry(today, entry);
    this.state.lastEntryDate = today;
    this.save();
  },

  getHistory(days = 14, options = {}) {
    const { includeArchived = false } = options;
    this.ensureEntries();

    const activeEntries = this.state.entries || {};
    const archivedEntries = includeArchived ? this.state.archivedEntries || {} : {};
    const combined = { ...archivedEntries, ...activeEntries };
    const dates = Object.keys(combined).sort();

    const limitedDates = typeof days === 'number' && days > 0 ? dates.slice(-days) : dates;

    return limitedDates.map((date) => {
      const entry = combined[date] || {};
      const scores = this.normalizeScores(entry.scores || this.calculateScores(entry));
      return { date, scores };
    });
  },

  calculateScores(entry) {
    if (typeof Scoring !== 'undefined' && typeof Scoring.calculateDomainScores === 'function') {
      return Scoring.calculateDomainScores(entry);
    }
    return { sleep: 0, fitness: 0, mind: 0, spirit: 0 };
  },

  normalizeScores(scores = {}) {
    const domains = ['sleep', 'fitness', 'mind', 'spirit'];
    return domains.reduce((acc, domain) => {
      const value = Number(scores[domain]);
      acc[domain] = Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value))) : 0;
      return acc;
    }, {});
  },

  notifyStateUpdated() {
    if (typeof UI !== 'undefined') {
      if (typeof UI.syncDailyUI === 'function') {
        UI.syncDailyUI();
      }
      if (typeof UI.setVisionFields === 'function') {
        UI.setVisionFields(this.state);
      }
      if (typeof UI.updatePracticeValues === 'function') {
        UI.updatePracticeValues();
      }
    }

    if (typeof App !== 'undefined' && typeof App.updateScores === 'function') {
      App.updateScores();
    }
  },
};

// Make Store available globally
if (typeof window !== 'undefined') {
  window.Store = Store;
}

export { Store };
