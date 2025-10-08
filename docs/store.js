// === STORE MODULE ===
// Data persistence and state management for the drop life tracker app

const BASE_SKILL_OPTIONS = ['Wrestling', 'Volleyball', 'Mobility', 'Yoga', 'Plyometrics'];

const Store = {
  DB_KEY: 'lifeTrackerData',
  state: {},
  dailyKeys: ['wake', 'rest', 'run', 'strength', 'skill', 'read', 'write', 'quadrant', 'meditation', 'energy', 'mood'],
  defaults: {
    wake: '', rest: '', run: 0, strength: false, skill: [],
    read: false, write: false, quadrant: 0, meditation: false,
    energy: 0, mood: 0,
    skillOptions: [],
    visionTheme: '', visionSleepFocus: '', visionFitnessFocus: '',
    visionMindFocus: '', visionSpiritFocus: '',
    history: [],
    lastEntryDate: '',
    dailyTimestamps: {},
    entries: {}
  },

  init() {
    console.log('🔧 Store.init called');
    const savedData = JSON.parse(localStorage.getItem(this.DB_KEY) || '{}');
    console.log('💾 Loaded from localStorage:', Object.keys(savedData).length, 'keys');
    
    this.state = { ...this.cloneDefaults(), ...savedData };
    console.log('📋 Initial state created with', Object.keys(this.state).length, 'keys');
    console.log('📊 Daily values:', {
      wake: this.state.wake,
      rest: this.state.rest,
      run: this.state.run,
      strength: this.state.strength,
      skill: this.state.skill,
      read: this.state.read,
      write: this.state.write,
      meditation: this.state.meditation,
      quadrant: this.state.quadrant
    });
    
    this.ensureHistory();
    this.ensureDailyTimestamps();
    this.ensureEntries();
    this.ensureSkillCollections();
    this.checkForNewDay();
    this.save();
  },

  ensureHistory() {
    if (!Array.isArray(this.state.history)) {
      this.state.history = [];
    }
  },

  ensureDailyTimestamps() {
    if (!this.state.dailyTimestamps || typeof this.state.dailyTimestamps !== 'object' || Array.isArray(this.state.dailyTimestamps)) {
      this.state.dailyTimestamps = {};
      return;
    }

    const sanitized = {};
    Object.entries(this.state.dailyTimestamps).forEach(([key, value]) => {
      if (typeof value === 'string' && value) {
        sanitized[key] = value;
      }
    });
    this.state.dailyTimestamps = sanitized;
  },

  ensureEntries() {
    if (!this.state.entries || typeof this.state.entries !== 'object' || Array.isArray(this.state.entries)) {
      this.state.entries = {};
    }
  },

  ensureSkillCollections() {
    const selections = this.sanitizeStringArray(this.state.skill);
    let options = this.sanitizeStringArray(this.state.skillOptions);
    const baseLower = new Set(BASE_SKILL_OPTIONS.map(opt => opt.toLowerCase()));
    const optionLower = new Set(options.map(opt => opt.toLowerCase()));
    selections.forEach(option => {
      const lower = option.toLowerCase();
      if (!baseLower.has(lower) && !optionLower.has(lower)) {
        options.push(option);
        optionLower.add(lower);
      }
    });
    this.state.skill = selections;
    this.state.skillOptions = this.sanitizeStringArray(options);
  },

  sanitizeStringArray(value) {
    if (!Array.isArray(value)) {
      return [];
    }
    const cleaned = value
      .map(item => (typeof item === 'string' ? item : String(item ?? '')).trim())
      .filter(Boolean);
    return Array.from(new Set(cleaned)).sort((a, b) => a.localeCompare(b));
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
    const baseOptions = BASE_SKILL_OPTIONS
      .map(opt => (typeof opt === 'string' ? opt.trim() : ''))
      .filter(Boolean);
    const baseLower = baseOptions.map(opt => opt.toLowerCase());
    const customOptions = Array.isArray(this.state.skillOptions)
      ? this.sanitizeStringArray(this.state.skillOptions)
      : [];
    const merged = [...baseOptions];
    customOptions.forEach(option => {
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
    const baseLower = BASE_SKILL_OPTIONS.map(opt => opt.toLowerCase());
    if (baseLower.includes(lower)) {
      return false;
    }
    const options = Array.isArray(this.state.skillOptions) ? [...this.state.skillOptions] : [];
    if (options.some(opt => opt.toLowerCase() === lower)) {
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
    return `${year}-${month}-${day}`;
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

  expireStaleDailyData() {
    this.ensureDailyTimestamps();
    // Use sleep day for expiring data (00:00-03:59 counts as previous day)
    const today = this.getSleepDay();
    let changed = false;

    this.dailyKeys.forEach(key => {
      const lastLogged = this.state.dailyTimestamps[key];
      const hasTimestamp = Object.prototype.hasOwnProperty.call(this.state.dailyTimestamps, key);
      const defaultValue = this.defaults[key];
      const currentValue = this.state[key];
      const valueDifferent = !this.valuesEqual(currentValue, defaultValue);

      if (lastLogged !== today && (hasTimestamp || valueDifferent)) {
        if (key in this.defaults) {
          this.state[key] = defaultValue;
        }
        if (hasTimestamp) {
          delete this.state.dailyTimestamps[key];
        }
        changed = true;
      }
    });

    return changed;
  },

  resetDailyData() {
    this.dailyKeys.forEach(key => {
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
    this.state.dailyTimestamps = {};
    this.ensureSkillCollections();
  },

  checkForNewDay() {
    // Use sleep day for checking new day (00:00-03:59 counts as previous day)
    const today = this.getSleepDay();
    const staleDataCleared = this.expireStaleDailyData();
    let needsUpdate = false;

    if (this.state.lastEntryDate !== today) {
      this.resetDailyData();
      this.state.lastEntryDate = today;
      // Clear action timestamps for new day
      this.state.actionTimestamps = {};
      needsUpdate = true;
    }

    if (staleDataCleared) {
      needsUpdate = true;
    }

    if (needsUpdate) {
      this.save();
      if (typeof App !== 'undefined') {
        if (typeof UI !== 'undefined' && typeof UI.syncDailyUI === 'function') {
          UI.syncDailyUI();
        }
        if (typeof App.updateScores === 'function') {
          App.updateScores();
        }
      }
    }

    return needsUpdate;
  },

  save() {
    localStorage.setItem(this.DB_KEY, JSON.stringify(this.state));
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
        // Use sleep day for daily tracking (00:00-03:59 counts as previous day)
        this.state.lastEntryDate = this.getSleepDay();
        this.ensureDailyTimestamps();
        this.state.dailyTimestamps[key] = this.state.lastEntryDate;
        console.log('📅 Daily key logged for:', this.state.lastEntryDate);
        // Add timestamp when data is logged
        if (!this.state.actionTimestamps) {
          this.state.actionTimestamps = {};
        }
        this.state.actionTimestamps[key] = new Date().toISOString();
        // Save current daily data to entries for history view
        this.saveCurrentEntry();
      }
      this.save();
      console.log('💾 State saved to localStorage');
      
      if (!key.startsWith('vision')) {
        console.log('🔄 Triggering score update for key:', key);
        App.updateScores();
      }
    } else {
      console.warn('⚠️ Key not found in state:', key);
    }
  },

  saveCurrentEntry() {
    this.ensureEntries();
    // Use sleep day for saving entries (00:00-03:59 counts as previous day)
    const today = this.getSleepDay();
    const entry = {};

    // Save all daily keys to the entry
    this.dailyKeys.forEach(key => {
      const value = this.state[key];
      entry[key] = Array.isArray(value) ? [...value] : value;
    });

    // Save action timestamps for this day
    if (this.state.actionTimestamps) {
      entry.timestamps = { ...this.state.actionTimestamps };
    }

    // Only save if there's actual data (not all defaults)
    const hasData = this.dailyKeys.some(key => {
      const value = this.state[key];
      const defaultValue = this.defaults[key];
      if (Array.isArray(defaultValue)) {
        return !this.valuesEqual(value, defaultValue);
      }
      return !this.valuesEqual(value, defaultValue);
    });

    if (hasData) {
      this.state.entries[today] = entry;
    }
  },

  validateImport(payload) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return false;
    }

    const allowedKeys = Object.keys(this.defaults);
    return Object.keys(payload).every(key => {
      if (!allowedKeys.includes(key)) return false;
      const defaultValue = this.defaults[key];
      const value = payload[key];

      if (value === null || value === undefined) return false;

      const defaultType = typeof defaultValue;
      if (Array.isArray(defaultValue)) {
        return Array.isArray(value);
      }
      if (defaultType === 'boolean') {
        return typeof value === 'boolean';
      }
      if (defaultType === 'number') {
        return typeof value === 'number' && Number.isFinite(value);
      }
      if (defaultType === 'string') {
        return typeof value === 'string';
      }
      if (defaultType === 'object') {
        return value && typeof value === 'object' && !Array.isArray(value);
      }
      return false;
    });
  },

  merge(payload) {
    this.state = { ...this.state, ...payload };
    this.ensureHistory();
    this.ensureDailyTimestamps();
    this.ensureEntries();
    this.ensureSkillCollections();
    this.save();
    if (typeof App !== 'undefined') {
      if (typeof UI !== 'undefined' && typeof UI.syncDailyUI === 'function') {
        UI.syncDailyUI();
      }
      if (typeof App.updateScores === 'function') {
        App.updateScores();
      }
    }
  },

  clearAllData() {
    this.state = this.cloneDefaults();
    this.ensureHistory();
    this.ensureDailyTimestamps();
    this.ensureEntries();
    this.ensureSkillCollections();
    delete this.state.currentDate;
    this.save();
  },

  recordHistory(scores) {
    if (!scores || typeof scores !== 'object') return;

    this.ensureHistory();

    const today = this.getToday();
    const safeScores = ['sleep', 'fitness', 'mind', 'spirit'].reduce((acc, domain) => {
      const value = Number(scores[domain]);
      const safeValue = Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value))) : 0;
      acc[domain] = safeValue;
      return acc;
    }, {});

    // Don't record history if all scores are zero (no real data entered)
    const hasData = Object.values(safeScores).some(score => score > 0);
    if (!hasData) return;

    const history = Array.isArray(this.state.history) ? [...this.state.history] : [];
    const existingIndex = history.findIndex(entry => entry.date === today);
    const snapshot = { date: today, scores: safeScores };

    if (existingIndex >= 0) {
      history[existingIndex] = snapshot;
    } else {
      history.push(snapshot);
    }

    const MAX_ENTRIES = 14;
    if (history.length > MAX_ENTRIES) {
      history.splice(0, history.length - MAX_ENTRIES);
    }

    this.state.history = history;
    this.state.lastEntryDate = today;
    this.save();
  },

  handleExport() {
    try {
      const data = JSON.stringify(this.state, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `drop-life-tracker-${timestamp}.json`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      if (typeof UI !== 'undefined' && typeof UI.notify === 'function') {
        UI.notify('Data exported');
      }
    } catch (error) {
      console.error('Data export failed:', error);
      if (typeof UI !== 'undefined' && typeof UI.notify === 'function') {
        UI.notify('Export failed');
      }
    }
  },

  handleImport(file) {
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const raw = event.target?.result;
          const payload = JSON.parse(raw);

          if (!this.validateImport(payload)) {
            throw new Error('Invalid schema');
          }

          this.merge(payload);
          if (typeof UI !== 'undefined') {
            if (typeof UI.setVisionFields === 'function') {
              UI.setVisionFields(this.state);
            }
            if (typeof UI.notify === 'function') {
              UI.notify('Data imported');
            }
          }
        } catch (error) {
          console.error('Data import failed:', error);
          if (typeof UI !== 'undefined' && typeof UI.notify === 'function') {
            UI.notify('Import failed');
          }
        }
      };

      reader.onerror = () => {
        if (typeof UI !== 'undefined' && typeof UI.notify === 'function') {
          UI.notify('Import failed');
        }
      };

      reader.readAsText(file);
    } catch (error) {
      console.error('Failed to read import file:', error);
      if (typeof UI !== 'undefined' && typeof UI.notify === 'function') {
        UI.notify('Import failed');
      }
    }
  },

  handleDataClear() {
    console.log('handleDataClear called');
    const confirmationMessage = 'This will remove all saved data, including history. Do you want to continue?';
    const confirmed = window.confirm(confirmationMessage);
    console.log('User confirmed:', confirmed);

    if (!confirmed) {
      return false;
    }

    this.clearAllData();
    if (typeof UI !== 'undefined') {
      if (typeof UI.setVisionFields === 'function') {
        UI.setVisionFields(this.state);
      }
      if (typeof UI.syncDailyUI === 'function') {
        UI.syncDailyUI();
      }
      if (typeof UI.renderScores === 'function') {
        const zeroScores = { sleep: 0, fitness: 0, mind: 0, spirit: 0 };
        const streaks = typeof Analytics !== 'undefined' && typeof Analytics.calculateStreaks === 'function' 
          ? Analytics.calculateStreaks() 
          : {};
        UI.renderScores(zeroScores, streaks);
      }
      if (typeof UI.notify === 'function') {
        UI.notify('All data cleared');
      }
    }
    return true;
  }
};

// Make Store available globally
if (typeof window !== 'undefined') {
  window.Store = Store;
}