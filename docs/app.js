document.addEventListener('DOMContentLoaded', () => {

  // === DEVELOPER MODE TOGGLE ===
  // Set to true to enable developer features (no loading overlay auto-hide, dev toast, etc.)
  const DEV_MODE = true;
  const BASE_SKILL_OPTIONS = ['Wrestling', 'Volleyball', 'Mobility', 'Yoga', 'Plyometrics'];

  const Store = {
    DB_KEY: 'lifeTrackerData',
    state: {},
    dailyKeys: ['wake', 'rest', 'run', 'strength', 'skill', 'read', 'write', 'quadrant', 'meditation'],
    defaults: {
      wake: '', rest: '', run: 0, strength: false, skill: [],
      read: false, write: false, quadrant: 0, meditation: false,
      skillOptions: [],
      visionTheme: '', visionSleepFocus: '', visionFitnessFocus: '',
      visionMindFocus: '', visionSpiritFocus: '',
      history: [],
      lastEntryDate: '',
      dailyTimestamps: {},
      entries: {}
    },

    init() {
      const savedData = JSON.parse(localStorage.getItem(this.DB_KEY) || '{}');
      this.state = { ...this.cloneDefaults(), ...savedData };
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

    expireStaleDailyData() {
      this.ensureDailyTimestamps();
      const today = this.getToday();
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
      const today = this.getToday();
      const staleDataCleared = this.expireStaleDailyData();
      let needsUpdate = false;

      if (this.state.lastEntryDate !== today) {
        this.resetDailyData();
        this.state.lastEntryDate = today;
        needsUpdate = true;
      }

      if (staleDataCleared) {
        needsUpdate = true;
      }

      if (needsUpdate) {
        this.save();
        if (typeof App !== 'undefined') {
          if (typeof App.syncDailyUI === 'function') {
            App.syncDailyUI();
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
      if (key in this.state) {
        let newValue = value;
        if (key === 'skill' || key === 'skillOptions') {
          newValue = this.sanitizeStringArray(Array.isArray(value) ? value : [value]);
        } else if (Array.isArray(value)) {
          newValue = [...value];
        }
        this.state[key] = newValue;
        if (this.dailyKeys.includes(key)) {
          this.state.lastEntryDate = this.getToday();
          this.ensureDailyTimestamps();
          this.state.dailyTimestamps[key] = this.state.lastEntryDate;
          // Save current daily data to entries for history view
          this.saveCurrentEntry();
        }
        this.save();
        if (!key.startsWith('vision')) {
          App.updateScores();
        }
      }
    },

    saveCurrentEntry() {
      this.ensureEntries();
      const today = this.getToday();
      const entry = {};
      
      // Save all daily keys to the entry
      this.dailyKeys.forEach(key => {
        const value = this.state[key];
        entry[key] = Array.isArray(value) ? [...value] : value;
      });

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
      this.state = { ...this.defaults, ...this.state, ...payload };
      this.ensureHistory();
      this.ensureDailyTimestamps();
      this.ensureEntries();
      this.ensureSkillCollections();
      const handled = this.checkForNewDay();
      if (!handled) {
        this.save();
        if (typeof App !== 'undefined') {
          if (typeof App.syncDailyUI === 'function') {
            App.syncDailyUI();
          }
          if (typeof App.updateScores === 'function') {
            App.updateScores();
          }
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
    }
  };

  const UI = {
    elements: {
      dateDisplay: document.getElementById('date-display'),
      cards: document.querySelectorAll('.card'),
      overlays: document.querySelectorAll('.overlay'),
      navButtons: document.querySelectorAll('.nav-btn'),
      pages: document.querySelectorAll('[data-page]'),
      loadingOverlay: document.getElementById('loading-overlay'),
      devPill: document.getElementById('dev-pill'),
      devToast: document.getElementById('dev-toast'),
      appToast: document.getElementById('app-toast'),
      settingsMenu: {
        menu: document.getElementById('settings-menu'),
        openBtn: document.getElementById('settings-icon-btn'),
        closeBtn: document.getElementById('settings-close-btn'),
        backdrop: document.getElementById('settings-backdrop'),
        installBtn: document.getElementById('settings-install-btn'),
        exportBtn: document.getElementById('settings-export-btn'),
        importBtn: document.getElementById('settings-import-btn'),
        importInput: document.getElementById('settings-import-input'),
        historyBtn: document.getElementById('settings-history-btn'),
        clearBtn: document.getElementById('settings-clear-btn')
      },
      historyOverlay: {
        overlay: document.getElementById('history-overlay'),
        closeBtn: document.querySelector('#history-overlay .close-btn'),
        list: document.getElementById('history-list'),
        dateRange: document.getElementById('history-date-range'),
        prevBtn: document.getElementById('history-prev-btn'),
        nextBtn: document.getElementById('history-next-btn')
      },
      dataControls: {
        exportBtn: document.getElementById('export-data-btn'),
        importBtn: document.getElementById('import-data-btn'),
        importInput: document.getElementById('import-data-input')
      },
      visionInputs: {
        theme: document.getElementById('vision-theme'),
        sleep: document.getElementById('vision-sleep-focus'),
        fitness: document.getElementById('vision-fitness-focus'),
        mind: document.getElementById('vision-mind-focus'),
        spirit: document.getElementById('vision-spirit-focus')
      },
      scoreAnnouncer: document.getElementById('score-announcer'),
      gratitude: {
        topDomain: document.getElementById('gratitude-top-domain'),
        topScore: document.getElementById('gratitude-top-score'),
        topDetail: document.getElementById('gratitude-top-detail'),
        focusDomain: document.getElementById('gratitude-focus-domain'),
        focusScore: document.getElementById('gratitude-focus-score'),
        focusDetail: document.getElementById('gratitude-focus-detail'),
        momentumDetail: document.getElementById('gratitude-momentum-detail'),
        sleepSummary: document.getElementById('gratitude-sleep-summary'),
        runSummary: document.getElementById('gratitude-run-summary'),
        meditationSummary: document.getElementById('gratitude-meditation-summary'),
        progressBars: document.querySelectorAll('[data-progress-domain]')
      },
      scoreDisplays: {
        sleep: {
          score: document.getElementById('sleep-score'),
          meter: document.querySelector('[data-domain-meter="sleep"]')
        },
        fitness: {
          score: document.getElementById('fitness-score'),
          meter: document.querySelector('[data-domain-meter="fitness"]')
        },
        mind: {
          score: document.getElementById('mind-score'),
          meter: document.querySelector('[data-domain-meter="mind"]')
        },
        spirit: {
          score: document.getElementById('spirit-score'),
          meter: document.querySelector('[data-domain-meter="spirit"]')
        }
      },
      quarterProgress: {
        fill: document.getElementById('quarter-progress-fill'),
        quarterLabel: document.getElementById('quarter-label'),
        weekLabel: document.getElementById('week-label')
      },
      inputs: {
        wakeTime: document.getElementById('wake-time'),
        restTime: document.getElementById('rest-time'),
        runValue: document.getElementById('run-value'),
      },
      home: {
        actionSection: document.querySelector('.home-actions'),
        sleepStatus: document.getElementById('sleep-status'),
        fitnessSummary: document.getElementById('fitness-summary'),
        mindStatus: document.getElementById('mind-status'),
        spiritStatus: document.getElementById('spirit-status'),
        fitnessCard: document.querySelector('.fitness-card'),
        spiritCard: document.querySelector('.spirit-card'),
        skillContainer: document.getElementById('skill-chip-row'),
        moodDot: document.getElementById('mood-dot'),
        energySlider: document.getElementById('energy-slider'),
        moodSlider: document.getElementById('mood-slider'),
      },
      heatmapContainer: document.getElementById('heatmap-container'),
      heatmapSummary: document.getElementById('heatmap-summary')
    },
    visionHints: {},
    toastTimer: null,

    renderScores(scores, streaks = {}) {
      const announcements = [];
      const history = Array.isArray(Store.state.history) ? Store.state.history : [];
      const daysLogged = history.length;
      const needsBaseline = daysLogged < 7;

      for (const domain in scores) {
        const display = this.elements.scoreDisplays[domain];
        if (!display) continue;

        const score = scores[domain];
        const previousValue = display.score ? display.score.textContent : null;
        
        // Show dash if score is null (insufficient data)
        let scoreText;
        let clampedScore;
        
        if (score === null || score === undefined || !Number.isFinite(score)) {
          scoreText = '—'; // Em dash
          clampedScore = 0;
        } else {
          clampedScore = Math.max(0, Math.min(100, Math.round(score)));
          scoreText = String(clampedScore);
        }

        if (display.score) {
          display.score.textContent = scoreText;
        }
        if (display.meter) {
          display.meter.setAttribute('aria-valuenow', scoreText === '—' ? '0' : scoreText);
          // Score rings are now static CSS - no JavaScript manipulation needed
        }

        if (previousValue !== null && previousValue !== scoreText && scoreText !== '—') {
          announcements.push(`${domain.charAt(0).toUpperCase() + domain.slice(1)} score updated to ${scoreText}`);
        }
      }

      // Show/hide baseline message
      this.updateBaselineMessage(daysLogged, needsBaseline);

      if (announcements.length > 0 && this.elements.scoreAnnouncer) {
        this.elements.scoreAnnouncer.textContent = announcements.join('. ');
      }

      this.renderGratitude(scores);
    },

    updateBaselineMessage(daysLogged, needsBaseline) {
      let baselineCard = document.getElementById('baseline-message-card');
      
      if (needsBaseline) {
        // Create card if it doesn't exist
        if (!baselineCard) {
          baselineCard = document.createElement('div');
          baselineCard.id = 'baseline-message-card';
          baselineCard.className = 'baseline-card';
          
          // Insert before weekly heatmap in the home page section
          const weeklyHeatmap = document.getElementById('weekly-heatmap');
          if (weeklyHeatmap && weeklyHeatmap.parentNode) {
            weeklyHeatmap.parentNode.insertBefore(baselineCard, weeklyHeatmap);
          }
        }
        
        const remaining = 7 - daysLogged;
        const dayWord = remaining === 1 ? 'day' : 'days';
        
        baselineCard.innerHTML = `
          <div class="baseline-icon">📊</div>
          <h3 class="baseline-title">Building Your Baseline</h3>
          <p class="baseline-text">
            Log your daily activities for <strong>${remaining} more ${dayWord}</strong> to establish your personal baseline.
          </p>
          <div class="baseline-progress">
            <div class="baseline-progress-bar">
              <div class="baseline-progress-fill" style="width: ${(daysLogged / 7) * 100}%"></div>
            </div>
            <span class="baseline-progress-label">${daysLogged} of 7 days</span>
          </div>
          <p class="baseline-encouragement">
            ✨ You're on your way! Each day of data helps drop understand your unique patterns.
          </p>
        `;
        
        baselineCard.style.display = 'block';
      } else {
        // Hide or remove card when baseline is established
        if (baselineCard) {
          baselineCard.style.display = 'none';
        }
      }
    },

    updateScoreRing(meter, score) {
      // Score rings are now static CSS - no JavaScript manipulation needed
      // Keeping this function stub for backwards compatibility
    },

    showLoading(show = true) {
      const el = this.elements.loadingOverlay;
      if (!el) return;
      if (show) el.classList.remove('hidden');
      else el.classList.add('hidden');
    },

    removeDevElements() {
      if (DEV_MODE) return;

      const devElements = [
        this.elements.devPill,
        document.getElementById('dev-loader-toggle'),
        this.elements.devToast
      ];

      devElements.forEach(el => {
        if (el && el.parentElement) {
          el.parentElement.removeChild(el);
        }
      });
    },

    toast(msg, ms = 1500) {
      if (!DEV_MODE) return;
      const t = this.elements.devToast;
      if (!t) return;
      t.textContent = msg;
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), ms);
    },

    notify(message, ms = 2000) {
      const toast = this.elements.appToast;
      if (!toast) return;
      toast.textContent = message;
      toast.classList.add('show');
      if (this.toastTimer) {
        clearTimeout(this.toastTimer);
      }
      this.toastTimer = setTimeout(() => {
        toast.classList.remove('show');
      }, ms);
    },

    renderSkillChips() {
      const container = this.elements.home?.skillContainer;
      if (!container) return;
      const options = Store.getSkillOptions();
      const selected = new Set(Array.isArray(Store.state.skill) ? Store.state.skill : []);
      container.innerHTML = '';
      options.forEach(option => {
        const chip = document.createElement('button');
        chip.className = 'skill-chip';
        chip.type = 'button';
        chip.dataset.skillOption = option;
        chip.textContent = option;
        const isActive = selected.has(option);
        if (isActive) chip.classList.add('is-active');
        chip.setAttribute('aria-pressed', String(isActive));
        container.appendChild(chip);
      });
      const addButton = document.createElement('button');
      addButton.className = 'skill-chip skill-chip--add';
      addButton.type = 'button';
      addButton.id = 'skill-add-btn';
      addButton.textContent = '+ Add';
      container.appendChild(addButton);
    },

    updateSkillChips(selected) {
      const container = this.elements.home?.skillContainer;
      if (!container) return;
      const selectedSet = new Set(Array.isArray(selected) ? selected : []);
      container.querySelectorAll('.skill-chip').forEach(chip => {
        if (chip.classList.contains('skill-chip--add')) return;
        const option = chip.dataset.skillOption || '';
        const isActive = selectedSet.has(option);
        chip.classList.toggle('is-active', isActive);
        chip.setAttribute('aria-pressed', String(isActive));
      });
    },

    setToggleState(key, value) {
      const toggles = document.querySelectorAll(`[data-toggle-key="${key}"]`);
      toggles.forEach(toggle => {
        const isActive = Boolean(value);
        toggle.classList.toggle('is-active', isActive);
        toggle.setAttribute('aria-pressed', String(isActive));
      });
    },

    flashButton(button, className = 'is-flashing', duration = 420) {
      if (!button) return;
      if (button.__flashTimer) {
        window.clearTimeout(button.__flashTimer);
        button.__flashTimer = null;
      }
      button.classList.remove(className);
      window.requestAnimationFrame(() => {
        button.classList.add(className);
        if (Number.isFinite(duration) && duration > 0) {
          button.__flashTimer = window.setTimeout(() => {
            button.classList.remove(className);
            button.__flashTimer = null;
          }, duration);
        }
      });
    },

    updateRunDisplay(value) {
      const display = this.elements.inputs.runValue;
      if (!display) return;
      const numeric = Number.isFinite(Number(value)) ? Number(value) : 0;
      display.textContent = String(Math.max(0, Math.round(numeric)));
    },

    updateSleepStatus(hours) {
      const status = this.elements.home?.sleepStatus;
      if (!status) return;
      if (hours === null || hours === undefined || !Number.isFinite(hours)) {
        status.textContent = 'No sleep window logged yet.';
        return;
      }
      const formatted = Number(hours).toFixed(1).replace(/\.0$/, '');
      status.textContent = `${formatted} hr window logged.`;
    },

    updateTimeButton(inputId) {
      const input = document.getElementById(inputId);
      const btn = document.querySelector(`[data-target="${inputId}"]`);
      if (!input || !btn) return;
      
      // Update button text based on whether input has a value
      btn.textContent = input.value ? 'Clear' : 'Now';
    },

    updateFitnessSummary() {
      const summary = this.elements.home?.fitnessSummary;
      if (!summary) return;
      const parts = [];
      const runDistance = Number(Store.state.run);
      if (Number.isFinite(runDistance) && runDistance > 0) {
        parts.push(`${runDistance} km run`);
      }
      if (Store.state.strength) {
        parts.push('Strength session');
      }
      const skills = Array.isArray(Store.state.skill) ? Store.state.skill : [];
      if (skills.length > 0) {
        parts.push(`Skill: ${skills.join(', ')}`);
      }
      summary.textContent = parts.length ? parts.join(' · ') : 'No training logged yet.';
    },

    updateMindStatus() {
      const status = this.elements.home?.mindStatus;
      if (!status) return;
      const { read, write } = Store.state;
      if (read && write) {
        status.textContent = 'Reading and writing logged.';
      } else if (read) {
        status.textContent = 'Reading logged.';
      } else if (write) {
        status.textContent = 'Writing logged.';
      } else {
        status.textContent = 'Nothing logged yet.';
      }
    },

    updateSpiritSummary(quadrant, meditation, energy = 0, mood = 0) {
      const status = this.elements.home?.spiritStatus;
      if (!status) return;
      const descriptors = [];
      const quadrantLabel = App.describeQuadrant(quadrant);
      if (quadrantLabel) {
        descriptors.push(quadrantLabel);
        const energyTone = energy > 40 ? 'High energy' : energy < -40 ? 'Low energy' : 'Balanced energy';
        const moodTone = mood > 40 ? 'Bright mood' : mood < -40 ? 'Grounded mood' : 'Steady mood';
        descriptors.push(`${energyTone}`, `${moodTone}`);
      }
      if (meditation) {
        descriptors.push('Meditation logged');
      }
      status.textContent = descriptors.length ? descriptors.join(' · ') : 'No mood logged yet.';
    },

    positionMoodDot(energy, mood) {
      const dot = this.elements.home?.moodDot;
      if (!dot) return;
      
      // Clamp values to -100 to +100 range
      const clamp = (value) => Math.max(-100, Math.min(100, Number(value) || 0));
      const clampedEnergy = clamp(energy);
      const clampedMood = clamp(mood);
      
      // Map slider values to CSS positioning:
      // Mood (X-axis): -100 (Negative/Left) to +100 (Positive/Right) -> 0% to 100% left
      const xPercent = (clampedMood + 100) / 2;
      
      // Energy (Y-axis): -100 (Low/Bottom) to +100 (High/Top) -> 0% to 100% bottom
      const yPercent = (clampedEnergy + 100) / 2;
      
      dot.style.setProperty('--mood-x', `${xPercent}%`);
      dot.style.setProperty('--mood-y', `${yPercent}%`);
    },

    setMoodSliders(energy, mood) {
      const { energySlider, moodSlider } = this.elements.home || {};
      const clampValue = (value) => Math.max(-100, Math.min(100, Math.round(Number(value) || 0)));
      if (energySlider) {
        energySlider.value = String(clampValue(energy));
      }
      if (moodSlider) {
        moodSlider.value = String(clampValue(mood));
      }
    },

    toggleOverlay(domain, show = true) {
      const overlay = document.getElementById(`${domain}-overlay`);
      if (overlay) {
        overlay.classList.toggle('active', show);
      }
    },

    updateToggleButton(type, value, skipIfDefault = false) {
      const group = document.querySelector(`.btn-group[data-type="${type}"], .quadrant-grid[data-type="${type}"]`);
      if (!group) return;

      const isToggleGroup = group.dataset.toggle === 'true';
      const buttons = group.querySelectorAll('.btn, .quad-btn');

      buttons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      });

      if (isToggleGroup) {
        const [button] = buttons;
        if (button) {
          const isActive = Boolean(value);
          button.classList.toggle('active', isActive);
          button.setAttribute('aria-pressed', String(isActive));
        }
        return;
      }

      if (skipIfDefault) {
        const defaultVal = Store.defaults[type];
        if (Object.is(value, defaultVal)) {
          return;
        }
      }

      const normalizedValue = typeof value === 'string' ? value : String(value);
      let activeBtn = group.querySelector(`[data-value="${normalizedValue}"]`);

      if (!activeBtn && typeof value === 'boolean') {
        activeBtn = group.querySelector(`[data-value="${value ? 'true' : 'false'}"]`);
      }

      if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.setAttribute('aria-pressed', 'true');
      }
    },

    loadOverlayData(domain) {
      Store.checkForNewDay();
      const state = Store.state;
      switch (domain) {
        case 'sleep':
          if (this.elements.inputs.wakeTime) this.elements.inputs.wakeTime.value = state.wake;
          if (this.elements.inputs.restTime) this.elements.inputs.restTime.value = state.rest;
          break;
        case 'fitness':
          if (this.elements.inputs.runValue) this.elements.inputs.runValue.textContent = state.run;
          this.updateToggleButton('strength', state.strength);
          {
            const skillActive = Array.isArray(state.skill) ? state.skill.length > 0 : Boolean(state.skill);
            this.updateToggleButton('skill', skillActive);
          }
          break;
        case 'mind':
          this.updateToggleButton('read', state.read);
          this.updateToggleButton('write', state.write);
          break;
        case 'spirit':
          this.updateToggleButton('quadrant', state.quadrant, true);
          this.updateToggleButton('meditation', state.meditation);
          break;
      }
    },

    initDate() {
      try {
        // Query at runtime in case the cached reference isn't available yet
        const el = document.getElementById('date-display') || (this.elements && this.elements.dateDisplay);
        if (!el) return;
        el.textContent = new Date().toLocaleDateString('en-US', {
          weekday: 'long', month: 'long', day: 'numeric'
        });
      } catch (err) {
        // Swallow to avoid breaking app init; log for debugging
        console.warn('initDate failed to set date display:', err);
      }
    },

    /**
     * Calculate and display weekly progress (week of year, 1-52)
     * Progress bar moves by day for granular tracking, labels show quarter and week
     */
    updateQuarterProgress() {
      const { quarterProgress } = this.elements;
      if (!quarterProgress || !quarterProgress.fill || !quarterProgress.quarterLabel || !quarterProgress.weekLabel) return;

      const TOTAL_WEEKS = 52;
      const DAYS_IN_YEAR = 365; // Approximate (ignoring leap years for simplicity)
      
      // Calculate current day and week of the year
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const dayOfYear = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000)) + 1;
      const currentWeek = Math.ceil(dayOfYear / 7);
      
      // Calculate current quarter (Q1-Q4 based on week)
      const currentQuarter = Math.ceil(currentWeek / 13);
      
      // Calculate percentage for progress bar based on DAYS (more granular)
      const percentComplete = (dayOfYear / DAYS_IN_YEAR) * 100;

      // Update progress bar (moves by day)
      quarterProgress.fill.style.width = `${percentComplete}%`;
      
      // Update labels
      quarterProgress.quarterLabel.textContent = `Q${currentQuarter}`;
      quarterProgress.weekLabel.textContent = `Wk ${currentWeek}`;
      
      // Update aria attribute
      const progressBar = document.querySelector('.quarter-progress__bar');
      if (progressBar) {
        progressBar.setAttribute('aria-valuenow', currentWeek);
        progressBar.setAttribute('aria-valuemax', TOTAL_WEEKS);
      }
    },

    setVisionFields(state) {
      const { visionInputs } = this.elements;
      if (!visionInputs) return;
      if (visionInputs.theme) visionInputs.theme.value = state.visionTheme || '';
      if (visionInputs.sleep) visionInputs.sleep.value = state.visionSleepFocus || '';
      if (visionInputs.fitness) visionInputs.fitness.value = state.visionFitnessFocus || '';
      if (visionInputs.mind) visionInputs.mind.value = state.visionMindFocus || '';
      if (visionInputs.spirit) visionInputs.spirit.value = state.visionSpiritFocus || '';
      this.updateVisionHint(visionInputs.theme, state.visionTheme);
      this.updateVisionHint(visionInputs.sleep, state.visionSleepFocus);
      this.updateVisionHint(visionInputs.fitness, state.visionFitnessFocus);
      this.updateVisionHint(visionInputs.mind, state.visionMindFocus);
      this.updateVisionHint(visionInputs.spirit, state.visionSpiritFocus);
    },

    ensureVisionHint(input) {
      if (!input || !input.dataset.emptyHint) return null;
      if (!this.visionHints[input.id]) {
        const hint = document.createElement('p');
        hint.className = 'vision-empty-hint';
        hint.id = `${input.id}-empty-hint`;
        hint.textContent = input.dataset.emptyHint;
        input.insertAdjacentElement('afterend', hint);
        this.visionHints[input.id] = hint;
      }
      return this.visionHints[input.id];
    },

    updateVisionHint(input, value) {
      if (!input || !input.dataset.emptyHint) return;
      const hint = this.ensureVisionHint(input);
      if (!hint) return;
      hint.textContent = input.dataset.emptyHint;
      if (value && value.trim().length > 0) {
        hint.classList.remove('is-visible');
      } else {
        hint.classList.add('is-visible');
      }
    },

    renderGratitude(scores) {
      const {
        topDomain, topScore, topDetail,
        focusDomain, focusScore, focusDetail,
        momentumDetail, sleepSummary, runSummary,
        meditationSummary, progressBars
      } = this.elements.gratitude;

      if (!topDomain) return;

      progressBars.forEach(bar => {
        const domain = bar.dataset.progressDomain;
        if (domain in scores) {
          bar.style.setProperty('--progress', `${scores[domain]}%`);
          bar.setAttribute('aria-valuenow', scores[domain]);
          const fill = bar.querySelector('.progress-fill');
          const scoreEl = bar.querySelector('.progress-score');
          if (fill) fill.style.width = `${scores[domain]}%`;
          if (scoreEl) scoreEl.textContent = scores[domain];
        }
      });

      const allScoresZero = Object.values(scores).every(value => Number(value) === 0);

      if (allScoresZero) {
        topDomain.textContent = 'Log a win';
        topScore.textContent = '—';
        topDetail.textContent = 'Add your first entries to reveal highlights tailored to you.';

        focusDomain.textContent = 'Where to start';
        focusScore.textContent = '—';
        focusDetail.textContent = 'Log sleep, movement or a reflection to surface your next focus.';

        momentumDetail.textContent = 'Track a full day to unlock momentum stories and week-over-week comparisons.';
        sleepSummary.textContent = 'Enter rest and wake times to unlock recovery coaching.';
        runSummary.textContent = 'Record even a short walk to seed your fitness narrative.';
        meditationSummary.textContent = 'Take two minutes to breathe and log it to spark the streak.';
        return;
      }

      const insights = App.generateInsights(scores);

      topDomain.textContent = insights.topDomain.label;
      topScore.textContent = insights.topDomain.score;
      topDetail.textContent = insights.topDomain.detail;

      focusDomain.textContent = insights.focusDomain.label;
      focusScore.textContent = insights.focusDomain.score;
      focusDetail.textContent = insights.focusDomain.detail;

      momentumDetail.textContent = insights.momentum;
      sleepSummary.textContent = insights.sleepSummary;
      runSummary.textContent = insights.runSummary;
      meditationSummary.textContent = insights.meditationSummary;
    }
  };

  const App = {
    deferredInstallPrompt: null,
    currentPage: 'home',
    moodAxes: { energy: 0, mood: 0 },

    init() {
      UI.initDate();
      UI.updateQuarterProgress();
      UI.removeDevElements();
      UI.setVisionFields(Store.state);
      this.moodAxes = this.getQuadrantPreset(Store.state.quadrant);
      this.syncDailyUI();

      // Check if loading overlay should be skipped (dev mode toggle)
      const skipLoader = DEV_MODE && localStorage.getItem('dev_disable_loader') === 'true';
      
      if (skipLoader) {
        // Skip loading overlay entirely
        UI.showLoading(false);
      } else {
        // Show loading overlay with a 5s breath animation synchronized with the overlay hide
        const animDurationMs = 5000; // matches the CSS breath animation duration
        UI.showLoading(true);
      }
      
      this.updateScores();
      this.bindEvents();
      this.registerServiceWorker();
      this.initInstallPrompt();
      this.showPage('home');

      // Skip loading animation logic if disabled
      if (skipLoader) {
        return;
      }

      // Hide loading overlay when the breath animation finishes (or fallback after animDurationMs)
      const logo = document.querySelector('.loading-logo');
      let fallbackTimeout = null;
      const animDurationMs = 5000;
      const hideOverlay = () => {
        if (fallbackTimeout) clearTimeout(fallbackTimeout);
        UI.showLoading(false);
      };

      // In dev mode, skip the loading overlay auto-hide
      if (DEV_MODE) {
        UI.toast('DEV MODE: Loading overlay will not auto-hide');
        return; // Skip setting up animation listeners and timeout
      }

      if (logo) {
        const onAnimEnd = (e) => {
          if (e.animationName === 'breath') {
            logo.removeEventListener('animationend', onAnimEnd);
            hideOverlay();
          }
        };
        logo.addEventListener('animationend', onAnimEnd);
      }

      // Fallback: ensure loading overlay hidden after animDurationMs
      fallbackTimeout = setTimeout(hideOverlay, animDurationMs);
    },

    syncDailyUI() {
      const { inputs } = UI.elements;
      UI.renderSkillChips();
      UI.updateQuarterProgress(); // Update quarterly progress bar
      if (inputs.wakeTime) inputs.wakeTime.value = Store.state.wake || '';
      if (inputs.restTime) inputs.restTime.value = Store.state.rest || '';

      // Update button text based on whether times are set
      UI.updateTimeButton('wake-time');
      UI.updateTimeButton('rest-time');

      UI.updateRunDisplay(Store.state.run);
      UI.setToggleState('strength', Store.state.strength);
      UI.setToggleState('read', Store.state.read);
      UI.setToggleState('write', Store.state.write);
      UI.setToggleState('meditation', Store.state.meditation);

      UI.updateSkillChips(Store.state.skill);
      UI.updateSleepStatus(this.calculateSleepHours());
      UI.updateFitnessSummary();
      UI.updateMindStatus();

      const fallbackAxes = this.getQuadrantPreset(Store.state.quadrant);
      const currentAxes = this.moodAxes || { energy: 0, mood: 0 };
      const currentQuadrant = this.resolveQuadrant(currentAxes.energy, currentAxes.mood);
      if (!this.moodAxes || currentQuadrant !== Store.state.quadrant) {
        this.moodAxes = { ...fallbackAxes };
      }
      const axes = this.moodAxes;
      UI.setMoodSliders(axes.energy, axes.mood);
      UI.positionMoodDot(axes.energy, axes.mood);
      UI.updateSpiritSummary(Store.state.quadrant, Store.state.meditation, axes.energy, axes.mood);
    },

    updateScores() {
      const scores = {
        sleep: this.calcSleep(),
        fitness: this.calcFitness(),
        mind: this.calcMind(),
        spirit: this.calcSpirit()
      };
      Store.recordHistory(scores);
      const streaks = this.calculateStreaks();
      UI.renderScores(scores, streaks);
      this.renderWeeklyHeatmap();
    },

    handleMoodInput() {
      const { energySlider, moodSlider } = UI.elements.home || {};
      if (!energySlider || !moodSlider) return;
      const energy = Number(energySlider.value) || 0;
      const mood = Number(moodSlider.value) || 0;
      this.moodAxes = { energy, mood };
      UI.positionMoodDot(energy, mood);
      const quadrant = this.resolveQuadrant(energy, mood);
      if (quadrant !== Store.state.quadrant) {
        Store.update('quadrant', quadrant);
      }
      UI.updateSpiritSummary(Store.state.quadrant, Store.state.meditation, energy, mood);
    },

    bindHomeActions() {
      const { inputs, home } = UI.elements;

      document.querySelectorAll('.log-current-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const targetId = btn.dataset.target;
          if (!targetId) return;
          const input = document.getElementById(targetId);
          if (!input) return;
          
          // Toggle between setting time and clearing
          if (input.value) {
            // Clear the value
            input.value = '';
            if (targetId === 'wake-time') {
              Store.update('wake', '');
            } else if (targetId === 'rest-time') {
              Store.update('rest', '');
            }
          } else {
            // Set to current time
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const timeValue = `${hours}:${minutes}`;
            input.value = timeValue;
            if (targetId === 'wake-time') {
              Store.update('wake', timeValue);
            } else if (targetId === 'rest-time') {
              Store.update('rest', timeValue);
            }
            UI.flashButton(btn);
          }
          
          UI.updateTimeButton(targetId);
          UI.updateSleepStatus(this.calculateSleepHours());
        });
      });

      if (inputs.wakeTime) {
        inputs.wakeTime.addEventListener('change', (event) => {
          Store.update('wake', event.target.value);
          UI.updateSleepStatus(this.calculateSleepHours());
          UI.updateTimeButton('wake-time');
        });
      }
      if (inputs.restTime) {
        inputs.restTime.addEventListener('change', (event) => {
          Store.update('rest', event.target.value);
          UI.updateSleepStatus(this.calculateSleepHours());
          UI.updateTimeButton('rest-time');
        });
      }

      document.querySelectorAll('.dropdown-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const targetId = btn.dataset.target;
          if (!targetId) return;
          const dropdown = document.getElementById(targetId);
          if (!dropdown) return;
          const willOpen = dropdown.hidden;
          document.querySelectorAll('.domain-dropdown').forEach(section => {
            const sectionBtn = document.querySelector(`.dropdown-toggle-btn[data-target="${section.id}"]`);
            if (section.id === targetId) {
              section.hidden = !willOpen;
              if (sectionBtn) {
                sectionBtn.setAttribute('aria-expanded', String(willOpen));
              }
            } else {
              section.hidden = true;
              if (sectionBtn) {
                sectionBtn.setAttribute('aria-expanded', 'false');
              }
            }
          });
        });
      });

      if (home.fitnessCard) {
        // Handle fitness pill toggles (Run, Strength, Skill)
        home.fitnessCard.addEventListener('click', (event) => {
          // Handle fitness toggles with dropdowns (Run and Skill)
          const fitnessToggle = event.target.closest('[data-fitness-toggle]');
          if (fitnessToggle) {
            const toggleType = fitnessToggle.dataset.fitnessToggle;
            const isActive = fitnessToggle.classList.contains('is-active');
            
            // Close all fitness dropdowns first
            home.fitnessCard.querySelectorAll('.fitness-dropdown').forEach(dd => dd.hidden = true);
            home.fitnessCard.querySelectorAll('[data-fitness-toggle]').forEach(btn => {
              btn.classList.remove('is-active');
              btn.setAttribute('aria-pressed', 'false');
            });
            
            // If wasn't active, open the dropdown
            if (!isActive) {
              fitnessToggle.classList.add('is-active');
              fitnessToggle.setAttribute('aria-pressed', 'true');
              const dropdown = home.fitnessCard.querySelector(`[data-fitness-dropdown="${toggleType}"]`);
              if (dropdown) dropdown.hidden = false;
            }
            return;
          }
          
          // Handle run preset buttons
          const presetBtn = event.target.closest('.run-preset');
          if (presetBtn) {
            const value = Number(presetBtn.dataset.runValue);
            const newValue = Number.isFinite(value) ? value : 0;
            Store.update('run', newValue);
            UI.updateRunDisplay(newValue);
            UI.updateFitnessSummary();
            return;
          }
          
          // Handle run step buttons
          const stepBtn = event.target.closest('.run-step');
          if (stepBtn) {
            const step = Number(stepBtn.dataset.runStep) || 0;
            const current = Number(Store.state.run) || 0;
            const newValue = Math.max(0, Math.min(200, current + step));
            Store.update('run', newValue);
            UI.updateRunDisplay(newValue);
            UI.updateFitnessSummary();
          }
        });
      }

      if (home.actionSection) {
        home.actionSection.addEventListener('click', (event) => {
          const toggle = event.target.closest('.pill-toggle[data-toggle-key]');
          if (toggle) {
            const key = toggle.dataset.toggleKey;
            if (!(key in Store.state)) return;
            const newValue = !Boolean(Store.state[key]);
            Store.update(key, newValue);
            UI.setToggleState(key, newValue);
            if (key === 'strength') {
              UI.updateFitnessSummary();
            }
            if (key === 'read' || key === 'write') {
              UI.updateMindStatus();
            }
            if (key === 'meditation') {
              UI.updateSpiritSummary(Store.state.quadrant, newValue, this.moodAxes.energy, this.moodAxes.mood);
            }
            return;
          }

          const skillChip = event.target.closest('.skill-chip');
          if (skillChip) {
            if (skillChip.classList.contains('skill-chip--add')) {
              const name = window.prompt('Add a skill focus');
              const trimmed = name ? name.trim() : '';
              if (!trimmed) return;
              const added = Store.addSkillOption(trimmed);
              if (added) {
                UI.renderSkillChips();
                Store.toggleSkill(trimmed);
                UI.updateSkillChips(Store.state.skill);
                UI.updateFitnessSummary();
                UI.notify(`Added "${trimmed}" to skills`);
              } else {
                UI.notify('Skill already exists.');
              }
              return;
            }
            const option = skillChip.dataset.skillOption;
            if (option) {
              Store.toggleSkill(option);
              UI.updateSkillChips(Store.state.skill);
              UI.updateFitnessSummary();
            }
          }
        });
      }

      const { energySlider, moodSlider } = home;
      if (energySlider) {
        energySlider.addEventListener('input', () => this.handleMoodInput());
      }
      if (moodSlider) {
        moodSlider.addEventListener('input', () => this.handleMoodInput());
      }
    },

    initInstallPrompt() {
      const settingsInstallBtn = UI.elements.settingsMenu.installBtn;
      if (!settingsInstallBtn) return;

      // Hide install button by default
      settingsInstallBtn.hidden = true;

      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
      if (isStandalone) {
        // App is already installed, keep button hidden
        return;
      }

      window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        this.deferredInstallPrompt = event;
        
        // Show install button in settings menu
        settingsInstallBtn.hidden = false;
      });

      window.addEventListener('appinstalled', () => {
        this.deferredInstallPrompt = null;
        if (settingsInstallBtn) {
          settingsInstallBtn.hidden = true;
        }
        UI.toast('drop installed');
      });

      settingsInstallBtn.addEventListener('click', async () => {
        const promptEvent = this.deferredInstallPrompt;
        if (!promptEvent) {
          settingsInstallBtn.hidden = true;
          return;
        }

        settingsInstallBtn.disabled = true;
        promptEvent.prompt();

        try {
          const { outcome } = await promptEvent.userChoice;
          if (outcome === 'accepted') {
            UI.toast('Installation started');
            settingsInstallBtn.hidden = true;
          } else {
            settingsInstallBtn.disabled = false;
          }
        } catch (error) {
          console.error('Install prompt failed:', error);
          settingsInstallBtn.disabled = false;
        }

        this.deferredInstallPrompt = null;
      });
    },

    handleExport() {
      try {
        const data = JSON.stringify(Store.state, null, 2);
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
        UI.notify('Data exported');
      } catch (error) {
        console.error('Data export failed:', error);
        UI.notify('Export failed');
      }
    },

    handleImport(file) {
      try {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const raw = event.target?.result;
            const payload = JSON.parse(raw);

            if (!Store.validateImport(payload)) {
              throw new Error('Invalid schema');
            }

            Store.merge(payload);
            UI.setVisionFields(Store.state);
            UI.notify('Data imported');
          } catch (error) {
            console.error('Data import failed:', error);
            UI.notify('Import failed');
          }
        };

        reader.onerror = () => {
          UI.notify('Import failed');
        };

        reader.readAsText(file);
      } catch (error) {
        console.error('Failed to read import file:', error);
        UI.notify('Import failed');
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

      Store.clearAllData();
      UI.setVisionFields(Store.state);
      this.syncDailyUI();

      const zeroScores = { sleep: 0, fitness: 0, mind: 0, spirit: 0 };
      const streaks = this.calculateStreaks();
      UI.renderScores(zeroScores, streaks);

      UI.notify('All data cleared');
      return true;
    },

    bindEvents() {
      this.bindHomeActions();
      // Open overlays
      UI.elements.cards.forEach(card => {
        card.addEventListener('click', () => {
          const domain = card.dataset.domain;
          UI.loadOverlayData(domain);
          UI.toggleOverlay(domain, true);
        });
      });

      // Close overlays and handle inputs via event delegation
      UI.elements.overlays.forEach(overlay => {
        overlay.addEventListener('click', e => {
          if (e.target.classList.contains('close-btn')) {
            UI.toggleOverlay(overlay.dataset.domain, false);
          }
          // Button groups
          if (e.target.matches('.btn, .quad-btn')) {
            const group = e.target.closest('[data-type]');
            if (group) {
              const type = group.dataset.type;
              const isToggleGroup = group.dataset.toggle === 'true';
              if (!(type in Store.state)) {
                return;
              }

              if (isToggleGroup) {
                const newValue = !Boolean(Store.state[type]);
                Store.update(type, newValue);
                UI.updateToggleButton(type, newValue);
                return;
              }

              let value = e.target.dataset.value;
              if (value === 'true') value = true;
              if (value === 'false') value = false;
              if (!isNaN(Number(value))) value = Number(value);

              Store.update(type, value);
              UI.updateToggleButton(type, value);
            }
          }
          // Preset buttons (run)
          if (e.target.matches('.preset-btn') && e.target.dataset.action === 'adjustRun') {
            const delta = parseInt(e.target.dataset.delta, 10);
            const newRunValue = Math.max(0, Math.min(100, Store.state.run + delta));
            Store.update('run', newRunValue);
            UI.elements.inputs.runValue.textContent = newRunValue;
          }
        });
        
        // Time inputs
        overlay.addEventListener('change', e => {
          if (e.target.matches('#wake-time')) {
            Store.update('wake', e.target.value);
          }
          if (e.target.matches('#rest-time')) {
            Store.update('rest', e.target.value);
          }
        });
      });

      // Nav buttons
      UI.elements.navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const page = btn.dataset.page;
          if (!page) return;
          this.showPage(page);
        });
      });

      // Close overlays with Esc key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          const activeOverlay = document.querySelector('.overlay.active');
          if (activeOverlay) {
            const domain = activeOverlay.dataset.domain;
            if (domain) {
              UI.toggleOverlay(domain, false);
            }
          }
        }
      });

      // Vision inputs
      Object.entries(UI.elements.visionInputs).forEach(([key, input]) => {
        if (!input) return;
        input.addEventListener('input', (event) => {
          const value = event.target.value.trim();
          const storeKey = this.mapVisionKey(key);
          UI.updateVisionHint(event.target, event.target.value);
          if (storeKey) {
            Store.update(storeKey, value);
          }
        });
      });

      const { exportBtn, importBtn, importInput } = UI.elements.dataControls;
      if (exportBtn) {
        exportBtn.addEventListener('click', () => {
          this.handleExport();
        });
      }

      if (importBtn && importInput) {
        importBtn.addEventListener('click', () => {
          importInput.value = '';
          importInput.click();
        });

        importInput.addEventListener('change', () => {
          const [file] = importInput.files || [];
          if (file) {
            this.handleImport(file);
          }
          importInput.value = '';
        });
      }

      // Settings menu bindings
      this.bindSettingsMenu();
    },

    bindSettingsMenu() {
      const { menu, openBtn, closeBtn, backdrop, installBtn, exportBtn, importBtn, importInput, clearBtn } = UI.elements.settingsMenu;
      
      if (!menu || !openBtn) return;

      // Open settings
      if (openBtn) {
        openBtn.addEventListener('click', () => {
          menu.classList.add('active');
        });
      }

      // Close settings
      const closeSettings = () => {
        menu.classList.remove('active');
      };

      if (closeBtn) {
        closeBtn.addEventListener('click', closeSettings);
      }

      if (backdrop) {
        backdrop.addEventListener('click', closeSettings);
      }

      // Escape key to close
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu.classList.contains('active')) {
          closeSettings();
        }
      });

      // Install app from settings
      if (installBtn) {
        installBtn.addEventListener('click', async () => {
          if (this.deferredInstallPrompt) {
            this.deferredInstallPrompt.prompt();
            const { outcome } = await this.deferredInstallPrompt.userChoice;
            console.log(`User response to install prompt: ${outcome}`);
            
            installBtn.hidden = true;
            this.deferredInstallPrompt = null;
          }
          closeSettings();
        });
      }

      // Export data from settings
      if (exportBtn) {
        exportBtn.addEventListener('click', () => {
          this.handleExport();
          closeSettings();
        });
      }

      // Import data from settings
      if (importBtn && importInput) {
        importBtn.addEventListener('click', () => {
          importInput.value = '';
          importInput.click();
        });

        importInput.addEventListener('change', () => {
          const [file] = importInput.files || [];
          if (file) {
            this.handleImport(file);
          }
          importInput.value = '';
          closeSettings();
        });
      }

      if (clearBtn) {
        console.log('Clear button found, binding event');
        clearBtn.addEventListener('click', () => {
          console.log('Clear button clicked');
          const cleared = this.handleDataClear();
          if (cleared) {
            closeSettings();
          }
        });
      } else {
        console.log('Clear button not found');
      }

      // History view from settings
      const { historyBtn } = UI.elements.settingsMenu;
      console.log('🔍 History button found:', historyBtn);
      if (historyBtn) {
        historyBtn.addEventListener('click', () => {
          console.log('📅 History button clicked');
          closeSettings();
          this.openHistoryView();
        });
      } else {
        console.log('❌ History button NOT found');
      }
    },

    openHistoryView() {
      console.log('🔓 Opening history view...');
      const { overlay, closeBtn, list, dateRange, prevBtn, nextBtn } = UI.elements.historyOverlay;

      console.log('📊 History overlay elements:', { overlay, closeBtn, list, dateRange, prevBtn, nextBtn });

      if (!overlay) {
        console.log('❌ History overlay element not found!');
        return;
      }

      Store.ensureEntries();
      
      // Migrate: if entries is empty but we have history, populate entries from history
      const entries = Store.state.entries || {};
      const history = Store.state.history || [];
      if (Object.keys(entries).length === 0 && history.length > 0) {
        console.log('🔄 Migrating history to entries format...');
        history.forEach(histEntry => {
          if (histEntry.date) {
            // Create a minimal entry from history scores
            entries[histEntry.date] = {
              wake: '', 
              rest: '', 
              run: 0, 
              strength: false, 
              skill: false,
              read: false, 
              write: false, 
              quadrant: 0, 
              meditation: false
            };
          }
        });
        Store.state.entries = entries;
        Store.save();
        console.log(`✅ Migrated ${history.length} history entries`);
      }

      console.log('📝 Store entries:', Store.state.entries);

      // Current page state
      let currentPage = 0;
      const entriesPerPage = 7;

      // Render history entries
      const renderHistory = () => {
        const entries = Store.state.entries || {};
        const allDates = Object.keys(entries).sort((a, b) => new Date(b) - new Date(a));
        const startIdx = currentPage * entriesPerPage;
        const endIdx = startIdx + entriesPerPage;
        const datesToShow = allDates.slice(startIdx, endIdx);

        // Update navigation buttons
        if (prevBtn) prevBtn.disabled = currentPage === 0;
        if (nextBtn) nextBtn.disabled = endIdx >= allDates.length;

        // Update date range text
        if (dateRange && datesToShow.length > 0) {
          const firstDate = new Date(datesToShow[datesToShow.length - 1]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const lastDate = new Date(datesToShow[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          dateRange.textContent = datesToShow.length === 1 ? lastDate : `${firstDate} - ${lastDate}`;
        }

        // Render entries
        if (list) {
          if (datesToShow.length === 0) {
            list.innerHTML = `
              <div class="history-empty">
                <div class="history-empty__icon">📅</div>
                <p class="history-empty__text">No entries yet. Start tracking your daily progress!</p>
              </div>
            `;
          } else {
            list.innerHTML = datesToShow.map(dateKey => {
              const entry = entries[dateKey];
              const scores = App.calculateDomainScores(entry);
              const totalScore = Math.round((scores.sleep + scores.fitness + scores.mind + scores.spirit) / 4);

              const date = new Date(dateKey);
              const formattedDate = date.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric',
                year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
              });

              return `
                <div class="history-entry" data-date="${dateKey}">
                  <div class="history-entry__header">
                    <div class="history-entry__date">${formattedDate}</div>
                    <div class="history-entry__total">${totalScore}</div>
                  </div>
                  <div class="history-entry__domains">
                    <div class="history-domain">
                      <img src="icons/sleep.svg" alt="" class="history-domain__icon">
                      <div class="history-domain__info">
                        <div class="history-domain__name">Sleep</div>
                        <div class="history-domain__score">${scores.sleep}</div>
                      </div>
                    </div>
                    <div class="history-domain">
                      <img src="icons/fitness.svg" alt="" class="history-domain__icon">
                      <div class="history-domain__info">
                        <div class="history-domain__name">Fitness</div>
                        <div class="history-domain__score">${scores.fitness}</div>
                      </div>
                    </div>
                    <div class="history-domain">
                      <img src="icons/mind.svg" alt="" class="history-domain__icon">
                      <div class="history-domain__info">
                        <div class="history-domain__name">Mind</div>
                        <div class="history-domain__score">${scores.mind}</div>
                      </div>
                    </div>
                    <div class="history-domain">
                      <img src="icons/spirit.svg" alt="" class="history-domain__icon">
                      <div class="history-domain__info">
                        <div class="history-domain__name">Spirit</div>
                        <div class="history-domain__score">${scores.spirit}</div>
                      </div>
                    </div>
                  </div>
                </div>
              `;
            }).join('');

            // Add click handlers to entries
            list.querySelectorAll('.history-entry').forEach(entryEl => {
              entryEl.addEventListener('click', () => {
                const dateKey = entryEl.dataset.date;
                overlay.classList.remove('active');
                // Switch to the date and show home page
                Store.state.currentDate = dateKey;
                UI.updateDateDisplay();
                this.render();
                UI.showPage('home');
              });
            });
          }
        }
      };

      // Navigation handlers
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          currentPage++;
          renderHistory();
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          if (currentPage > 0) {
            currentPage--;
            renderHistory();
          }
        });
      }

      // Close handler
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          console.log('❌ Closing history overlay');
          overlay.classList.remove('active');
        });
      }

      // Open overlay and render
      console.log('✅ Adding active class to overlay');
      overlay.classList.add('active');
      console.log('🎨 Rendering history...');
      renderHistory();
    },

    mapVisionKey(key) {
      switch (key) {
        case 'theme':
          return 'visionTheme';
        case 'sleep':
          return 'visionSleepFocus';
        case 'fitness':
          return 'visionFitnessFocus';
        case 'mind':
          return 'visionMindFocus';
        case 'spirit':
          return 'visionSpiritFocus';
        default:
          return null;
      }
    },

    showPage(page) {
      if (!page) return;

      UI.elements.pages.forEach(section => {
        section.classList.toggle('active', section.dataset.page === page);
      });

      this.currentPage = page;
      this.updateNavState(page);

      const main = document.querySelector('.app-main');
      if (main) {
        main.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },

    updateNavState(page) {
      UI.elements.navButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.page === page);
      });
    },

    // --- SCORE CALCULATION LOGIC (Trend-based with 7-day weighted average) ---
    
    /**
     * Calculates a trend-based score that considers:
     * 1. Today's raw activity score (40% weight)
     * 2. 7-day weighted average (60% weight) - recent days weighted more heavily
     * 3. Baseline adjustment to center around 80 for typical performance
     * 4. Floor and ceiling to prevent extreme values (never 0 or 100)
     * 
     * Returns null if insufficient data (< 7 days) to establish baseline
     */
    calcTrendScore(domain, rawScore) {
      const history = Array.isArray(Store.state.history) ? Store.state.history.slice(-7) : [];
      
      // Require at least 7 days of data to establish baseline trend
      if (history.length < 7) {
        return null; // Not enough data - will display as dash
      }

      // Calculate 7-day weighted average (more recent = higher weight)
      let weightedSum = 0;
      let weightSum = 0;
      
      history.forEach((entry, index) => {
        const score = Number(entry?.scores?.[domain]) || 0;
        // Exponential decay: most recent day has highest weight
        const daysAgo = history.length - index;
        const weight = Math.pow(0.7, daysAgo - 1); // Recent days weighted 1.0, 0.7, 0.49, 0.34...
        weightedSum += score * weight;
        weightSum += weight;
      });
      
      const historicalAverage = weightSum > 0 ? weightedSum / weightSum : 0;
      
      // Blend today's score (40%) with historical trend (60%)
      const blendedScore = (rawScore * 0.4) + (historicalAverage * 0.6);
      
      // Adjust to realistic range centered around 80
      return this.adjustToRealisticRange(blendedScore);
    },

    /**
     * Adjusts raw scores to realistic range:
     * - Centers typical performance around 75-85
     * - 1 standard deviation: 70-88
     * - Never returns 0 or 100
     * - Uses sigmoid-like curve for smooth transitions
     */
    adjustToRealisticRange(rawScore) {
      // Baseline floor: any activity gives you at least 60
      const floor = 60;
      const ceiling = 95;
      const target = 80; // Center point for typical performance
      
      if (rawScore <= 0) return floor;
      if (rawScore >= 100) return ceiling;
      
      // Sigmoid adjustment: compress extremes, expand middle range
      // This creates natural clustering around 70-88 for typical performance
      const normalized = rawScore / 100;
      
      // Apply compression to reduce variance
      // Maps: 0->60, 50->78, 75->84, 100->95
      const compressed = floor + (ceiling - floor) * (
        0.5 + 0.5 * Math.tanh(2.5 * (normalized - 0.5))
      );
      
      return Math.round(compressed);
    },

    /**
     * Calculate domain scores from an entry object (used for history view)
     * @param {Object} entry - Entry object with wake, rest, run, strength, etc.
     * @returns {Object} Object with sleep, fitness, mind, spirit scores
     */
    calculateDomainScores(entry) {
      if (!entry || typeof entry !== 'object') {
        return { sleep: 0, fitness: 0, mind: 0, spirit: 0 };
      }

      // Calculate sleep score
      let sleepScore = 0;
      if (entry.wake && entry.rest) {
        const [wh, wm] = entry.wake.split(':').map(Number);
        const [rh, rm] = entry.rest.split(':').map(Number);
        if (!isNaN(wh) && !isNaN(wm) && !isNaN(rh) && !isNaN(rm)) {
          const wakeMins = wh * 60 + wm;
          const restMins = rh * 60 + rm;
          const duration = restMins < wakeMins ? (1440 - wakeMins + restMins) : (restMins - wakeMins);
          const hours = duration / 60;
          
          if (hours >= 7 && hours <= 9) sleepScore = 100;
          else if (hours >= 6 && hours < 7) sleepScore = 85;
          else if (hours > 9 && hours <= 10) sleepScore = 85;
          else if (hours >= 5 && hours < 6) sleepScore = 65;
          else if (hours > 10 && hours <= 11) sleepScore = 65;
          else if (hours >= 4 && hours < 5) sleepScore = 45;
          else if (hours > 11) sleepScore = 50;
          else sleepScore = 30;
        }
      }

      // Calculate fitness score
      let fitnessScore = 0;
      const run = Number(entry.run) || 0;
      if (run >= 20) fitnessScore += 45;
      else if (run >= 15) fitnessScore += 38;
      else if (run >= 10) fitnessScore += 32;
      else if (run >= 5) fitnessScore += 25;
      else if (run >= 3) fitnessScore += 18;
      else if (run >= 1) fitnessScore += 10;
      
      if (entry.strength) fitnessScore += 35;
      const skillLogged = Array.isArray(entry.skill) ? entry.skill.length > 0 : Boolean(entry.skill);
      if (skillLogged) fitnessScore += 20;
      fitnessScore = Math.min(100, fitnessScore);

      // Calculate mind score
      let mindScore = 0;
      if (entry.read) mindScore += 55;
      if (entry.write) mindScore += 45;

      // Calculate spirit score
      let spiritScore = 0;
      const quadrant = Number(entry.quadrant) || 0;
      if (quadrant === 1 || quadrant === 2) spiritScore += 50;
      else if (quadrant === 3 || quadrant === 4) spiritScore += 25;
      if (entry.meditation) spiritScore += 50;

      return {
        sleep: sleepScore,
        fitness: fitnessScore,
        mind: mindScore,
        spirit: spiritScore
      };
    },

    calcSleep() {
      const { wake, rest } = Store.state;
      if (!wake || !rest) return this.calcTrendScore('sleep', 0);
      
      const [wh, wm] = wake.split(':').map(Number);
      const [rh, rm] = rest.split(':').map(Number);
      const wakeMins = wh * 60 + wm;
      const restMins = rh * 60 + rm;
      const duration = restMins < wakeMins ? (1440 - wakeMins + restMins) : (restMins - wakeMins);
      const hours = duration / 60;
      
      // Raw scoring: optimal sleep (7-9 hours) = 100, poor sleep = lower
      let rawScore;
      if (hours >= 7 && hours <= 9) {
        rawScore = 100; // Optimal
      } else if (hours >= 6 && hours < 7) {
        rawScore = 85; // Good
      } else if (hours > 9 && hours <= 10) {
        rawScore = 85; // Good (slight oversleep)
      } else if (hours >= 5 && hours < 6) {
        rawScore = 65; // Below optimal
      } else if (hours > 10 && hours <= 11) {
        rawScore = 65; // Oversleep
      } else if (hours >= 4 && hours < 5) {
        rawScore = 45; // Poor
      } else if (hours > 11) {
        rawScore = 50; // Significant oversleep
      } else {
        rawScore = 30; // Very poor (<4 hours)
      }
      
      return this.calcTrendScore('sleep', rawScore);
    },

    calcFitness() {
      let rawScore = 0;
      
      // Running: up to 45 points
      if (Store.state.run >= 20) rawScore += 45;
      else if (Store.state.run >= 15) rawScore += 38;
      else if (Store.state.run >= 10) rawScore += 32;
      else if (Store.state.run >= 5) rawScore += 25;
      else if (Store.state.run >= 3) rawScore += 18;
      else if (Store.state.run >= 1) rawScore += 10;
      
      // Strength training: 35 points
      if (Store.state.strength) rawScore += 35;
      
      // Skill practice: 20 points
      const skillSelections = Array.isArray(Store.state.skill) ? Store.state.skill : [];
      if (skillSelections.length > 0) rawScore += 20;
      
      return this.calcTrendScore('fitness', Math.min(100, rawScore));
    },

    calcMind() {
      let rawScore = 0;
      
      // Reading: 55 points (intellectual input)
      if (Store.state.read) rawScore += 55;
      
      // Writing: 45 points (intellectual output/processing)
      if (Store.state.write) rawScore += 45;
      
      return this.calcTrendScore('mind', rawScore);
    },

    calcSpirit() {
      let rawScore = 0;
      const { quadrant, meditation } = Store.state;

      // Mood quadrant: up to 50 points
      // Q1 (motivated/energized) & Q2 (calm/content) = optimal states
      if (quadrant === 1 || quadrant === 2) {
        rawScore += 50;
      } else if (quadrant === 3) {
        // Q3 (calm/unmotivated): neutral state
        rawScore += 35;
      } else if (quadrant === 4) {
        // Q4 (stressed/anxious): challenging state but still scored
        rawScore += 25;
      }
      
      // Meditation: 50 points (mindfulness practice)
      if (meditation) rawScore += 50;
      
      return this.calcTrendScore('spirit', Math.min(100, rawScore));
    },

    getQuadrantPreset(quadrant) {
      switch (quadrant) {
        case 1:
          return { energy: 65, mood: 70 };
        case 2:
          return { energy: -60, mood: 70 };
        case 3:
          return { energy: 65, mood: -65 };
        case 4:
          return { energy: -60, mood: -65 };
        default:
          return { energy: 0, mood: 0 };
      }
    },

    resolveQuadrant(energy, mood) {
      const threshold = 10;
      const e = Number(energy) || 0;
      const m = Number(mood) || 0;
      if (Math.abs(e) < threshold && Math.abs(m) < threshold) {
        return 0;
      }
      if (e >= 0 && m >= 0) return 1;
      if (e < 0 && m >= 0) return 2;
      if (e >= 0 && m < 0) return 3;
      return 4;
    },

    describeQuadrant(quadrant) {
      switch (quadrant) {
        case 1:
          return 'High energy · Positive';
        case 2:
          return 'Low energy · Positive';
        case 3:
          return 'High energy · Challenged';
        case 4:
          return 'Low energy · Challenged';
        default:
          return '';
      }
    },

    calculateSleepHours() {
      const { wake, rest } = Store.state;
      if (!wake || !rest) return null;
      const [wh, wm] = wake.split(':').map(Number);
      const [rh, rm] = rest.split(':').map(Number);
      if ([wh, wm, rh, rm].some(v => isNaN(v))) return null;
      const wakeMins = wh * 60 + wm;
      const restMins = rh * 60 + rm;
      const duration = restMins < wakeMins ? (1440 - wakeMins + restMins) : (restMins - wakeMins);
      return Math.round((duration / 60) * 10) / 10;
    },

    calculateStreaks() {
      const history = Array.isArray(Store.state.history) ? [...Store.state.history] : [];
      const recent = history.slice(-7);
      const domains = ['sleep', 'fitness', 'mind', 'spirit'];
      const streaks = {};
      const denominator = recent.length === 0 ? 7 : recent.length;

      domains.forEach(domain => {
        const activeDays = recent.reduce((count, entry) => {
          const value = Number(entry?.scores?.[domain]);
          return count + (Number.isFinite(value) && value > 0 ? 1 : 0);
        }, 0);
        const labelDenominator = denominator === 1 ? 'day' : 'days';
        const totalLabel = recent.length === 0 ? `7 ${labelDenominator}` : `${denominator} ${labelDenominator}`;
        streaks[domain] = `${activeDays} of ${totalLabel}`;
      });

      return streaks;
    },

    /**
     * Analyzes the last 7 days of historical data and determines the heatmap mode.
     */
    getWeeklyData() {
      const domains = ['sleep', 'fitness', 'mind', 'spirit'];
      const formatDomain = (domain) => domain.charAt(0).toUpperCase() + domain.slice(1);
      const history = Array.isArray(Store.state.history) ? [...Store.state.history] : [];
      const today = Store.getToday();
      const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      const fullDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      // Calculate the current week (Monday to Sunday)
      const now = new Date();
      const currentDayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      
      // Calculate days since last Monday (adjusting so Monday = 0, Sunday = 6)
      const daysSinceMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
      
      // Build array starting from Monday of the current week
      const last7Days = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - daysSinceMonday + i);
        const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const dayIndex = d.getDay();
        const entry = history.find(e => e.date === dateKey) || { date: dateKey, scores: {} };

        last7Days.push({
          dayLabel: dayNames[dayIndex],
          fullDayName: fullDayNames[dayIndex],
          dateKey,
          scores: entry.scores || { sleep: 0, fitness: 0, mind: 0, spirit: 0 },
          isToday: dateKey === today
        });
      }

      const totalDays = last7Days.length || 1;
      const activeDaySet = new Set();
      const domainConsistencies = domains.map(domain => {
        const activeDays = last7Days.reduce((count, day) => {
          const score = Number(day.scores[domain]) || 0;
          if (score >= 50) {
            activeDaySet.add(day.dateKey);
            return count + 1;
          }
          return count;
        }, 0);
        return {
          domain,
          count: activeDays,
          consistency: activeDays / totalDays
        };
      });

      const totalActiveDaysCount = activeDaySet.size;
      const weakestDomain = domainConsistencies.reduce((min, curr) => {
        if (!min || curr.consistency < min.consistency) return curr;
        return min;
      }, null) || { domain: 'sleep', count: 0, consistency: 0 };
      const strongestDomain = domainConsistencies.reduce((max, curr) => {
        if (!max || curr.consistency > max.consistency) return curr;
        return max;
      }, null) || { domain: 'sleep', count: 0, consistency: 0 };

      const requiredDays = Math.ceil(totalDays * 0.5);
      let mode = 'V1';

      if (totalActiveDaysCount === 0) {
        mode = 'V3';
      } else if (weakestDomain.consistency < 0.5) {
        mode = 'V2';
      }

      let summary = '';
      if (mode === 'V3' || !domainConsistencies.length) {
        summary = 'Ready to start? Log an entry now to begin your weekly momentum.';
      } else if (mode === 'V2') {
        const neededDays = Math.max(0, requiredDays - weakestDomain.count);
        const deficitStatement = weakestDomain.count === 0
          ? 'not logged this week'
          : `only tracked ${weakestDomain.count} of ${totalDays} days`;
        const actionStatement = neededDays > 0
          ? `Hit it ${neededDays === 1 ? 'once' : `${neededDays} more times`} this week to rebound.`
          : 'Focus on the missing action today to boost alignment.';
        summary = `${formatDomain(weakestDomain.domain)} shows a clear deficit—${deficitStatement}. ${actionStatement}`;
      } else {
        const allEven = domainConsistencies.every(d => d.count === strongestDomain.count);
        if (allEven) {
          summary = `Exceptional consistency! All domains tracked on ${strongestDomain.count} of ${totalDays} days.`;
        } else {
          summary = `${formatDomain(strongestDomain.domain)} shows great consistency, tracked on ${strongestDomain.count} of ${totalDays} days. Keep pushing for ${formatDomain(weakestDomain.domain)}!`;
        }
      }

      return { last7Days, mode, summary, weakestDomain, strongestDomain, domainConsistencies };
    },

    /**
     * Renders the Weekly Trajectory Heatmap component based on the weekly data.
     */
    renderWeeklyHeatmap() {
      const container = UI.elements.heatmapContainer;
      const summaryEl = UI.elements.heatmapSummary;
      if (!container || !summaryEl) return;

      const { last7Days, mode, summary } = this.getWeeklyData();
      const domains = ['sleep', 'fitness', 'mind', 'spirit'];
      const formatDomain = (domain) => domain.charAt(0).toUpperCase() + domain.slice(1);

      // Build day labels as individual elements
      const dayLabelsHTML = last7Days.map(day => {
        const tooltip = day.isToday ? 'Today' : day.fullDayName;
        return `<div class="day-label" title="${tooltip}">${day.dayLabel}</div>`;
      }).join('');

      // Build rows for each domain
      const rowsHTML = domains.map(domain => {
        const cellsHTML = last7Days.map(day => {
          const score = Number(day.scores[domain]) || 0;
          const intensity = this.getHeatmapIntensity(score);
          const tooltip = `${formatDomain(domain)} on ${day.fullDayName}${day.isToday ? ' (Today)' : ''}: ${score} pts`;
          return `<div class="heatmap-cell" data-intensity="${intensity}" title="${tooltip}"></div>`;
        }).join('');

        return `<div class="domain-label">${formatDomain(domain)}</div>${cellsHTML}`;
      }).join('');

      container.innerHTML = `
        <div class="heatmap-grid">
          <div></div>
          ${dayLabelsHTML}
          ${rowsHTML}
        </div>
      `;

      container.setAttribute('data-mode', mode);
      summaryEl.textContent = summary;
      summaryEl.setAttribute('data-mode', mode);
    },

    /**
     * Maps raw activity score (0-100) to heatmap intensity level.
     */
    getHeatmapIntensity(rawScore) {
      if (!Number.isFinite(rawScore) || rawScore === 0) return 'none';
      if (rawScore < 50) return 'low';
      if (rawScore < 80) return 'med';
      return 'high';
    },

    averageForDomain(entries, domain) {
      if (!entries || entries.length === 0) return 0;
      const total = entries.reduce((sum, entry) => {
        const value = Number(entry?.scores?.[domain]);
        return sum + (Number.isFinite(value) ? value : 0);
      }, 0);
      return total / entries.length;
    },

    computeWeekOverWeekChanges(domainLabels) {
      const history = Array.isArray(Store.state.history) ? [...Store.state.history] : [];
      if (history.length === 0) {
        return '';
      }

      const sorted = history.slice().sort((a, b) => a.date.localeCompare(b.date));
      const recent = sorted.slice(-7);
      const previous = sorted.slice(-14, -7);

      if (recent.length === 0) {
        return '';
      }

      if (recent.length < 7) {
        return 'Log a full week to unlock week-over-week comparisons.';
      }

      if (previous.length === 0) {
        return 'Log another week to unlock week-over-week comparisons.';
      }

      const statements = Object.keys(domainLabels).map(domain => {
        const currentAvg = this.averageForDomain(recent, domain);
        const previousAvg = this.averageForDomain(previous, domain);
        let percentChange;
        if (previousAvg === 0) {
          percentChange = currentAvg === 0 ? 0 : 100;
        } else {
          percentChange = ((currentAvg - previousAvg) / previousAvg) * 100;
        }
        const rounded = Math.round(percentChange);
        const normalized = Object.is(rounded, -0) ? 0 : rounded;
        const sign = normalized > 0 ? '+' : '';
        return `${domainLabels[domain]} ${sign}${normalized}% vs last week.`;
      });

      return statements.join(' ');
    },

    generateInsights(scores) {
      const domainLabels = {
        sleep: 'Sleep',
        fitness: 'Fitness',
        mind: 'Mind',
        spirit: 'Spirit'
      };

      const entries = Object.entries(scores);
      const top = entries.reduce((acc, curr) => (curr[1] > acc[1] ? curr : acc));
      const bottom = entries.reduce((acc, curr) => (curr[1] < acc[1] ? curr : acc));

      const narrative = {
        sleep: {
          high: 'Your routines are setting the tone for energised mornings.',
          low: 'Try reinforcing your wind-down cues to unlock deeper rest.'
        },
        fitness: {
          high: 'Your training block is building real momentum—keep riding it.',
          low: 'A fresh plan for progressive sessions could reignite this lane.'
        },
        mind: {
          high: 'Curiosity is compounding—your inputs are sharpening thinking.',
          low: 'Schedule protected time for reading or writing to refuel clarity.'
        },
        spirit: {
          high: 'You’re staying grounded and connected to what matters most.',
          low: 'Experiment with a micro-practice to recenter during transitions.'
        }
      };

      const topDomain = {
        label: domainLabels[top[0]],
        score: top[1],
        detail: narrative[top[0]].high
      };

      const focusDomain = {
        label: domainLabels[bottom[0]],
        score: bottom[1],
        detail: narrative[bottom[0]].low
      };

      const sleepHours = this.calculateSleepHours();
      const sleepSummary = sleepHours
        ? `Averaged ${sleepHours}h between rest and wake—calibrate toward 7.5h for steady energy.`
        : 'Log wake and rest windows to unlock personalised sleep feedback.';

      const runKm = Store.state.run;
      const runSummary = runKm > 0
        ? `Logged ${runKm} km. Consider a stride session or recovery run to stay balanced.`
        : 'No distance logged yet—set a target run to spark momentum.';

      const meditationSummary = Store.state.meditation
        ? 'Meditation checked in—carry that presence into high-leverage moments.'
        : 'A two-minute pause could reset your baseline before the next sprint.';

      const averageScore = Math.round(entries.reduce((total, [, val]) => total + val, 0) / entries.length);
      const momentumBase = averageScore >= 75
        ? `Strong average (${averageScore}) across domains—build on what’s working.`
        : `Average sits at ${averageScore}. Choose one ritual to upgrade and lift the whole system.`;
      const changeNarrative = this.computeWeekOverWeekChanges(domainLabels).trim();
      const momentum = changeNarrative
        ? `${momentumBase} ${changeNarrative}`
        : momentumBase;

      return {
        topDomain,
        focusDomain,
        sleepSummary,
        runSummary,
        meditationSummary,
        momentum
      };
    },

    registerServiceWorker() {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
          .then(registration => console.log('Service Worker registered successfully:', registration))
          .catch(error => console.log('Service Worker registration failed:', error));
      }
    },

    setupDevPill() {
      // Only setup dev features when DEV_MODE is enabled
      if (!DEV_MODE) return;

      const devPill = UI.elements.devPill;
      if (!devPill) return;

      // Show dev pill
      devPill.classList.add('visible');

      // Click handler to open test suite
      devPill.addEventListener('click', () => {
        // Open test suite in new window
        const testUrl = 'tests/index.html';
        const testWindow = window.open(testUrl, 'drop-tests', 'width=1200,height=800');
        
        if (testWindow) {
          UI.toast('Opening test suite...', 2000);
        } else {
          UI.toast('Please allow pop-ups to open test suite', 3000);
        }
      });

      // Setup loader toggle
      const loaderToggle = document.getElementById('dev-loader-toggle');
      if (loaderToggle) {
        loaderToggle.hidden = false;
        loaderToggle.classList.add('visible');

        // Check localStorage for saved preference
        const loaderDisabled = localStorage.getItem('dev_disable_loader') === 'true';
        if (loaderDisabled) {
          loaderToggle.classList.add('disabled');
          loaderToggle.title = 'Loading screen disabled (click to enable)';
        } else {
          loaderToggle.title = 'Loading screen enabled (click to disable)';
        }

        loaderToggle.addEventListener('click', () => {
          const isCurrentlyDisabled = loaderToggle.classList.contains('disabled');
          
          if (isCurrentlyDisabled) {
            // Enable loader
            localStorage.removeItem('dev_disable_loader');
            loaderToggle.classList.remove('disabled');
            loaderToggle.title = 'Loading screen enabled (click to disable)';
            UI.toast('Loading screen enabled', 2000);
          } else {
            // Disable loader
            localStorage.setItem('dev_disable_loader', 'true');
            loaderToggle.classList.add('disabled');
            loaderToggle.title = 'Loading screen disabled (click to enable)';
            UI.toast('Loading screen disabled - reload to test', 2000);
          }
        });
      }

      // Setup clear app data button (dev only)
      const clearDataBtn = document.getElementById('dev-clear-data');
      if (clearDataBtn) {
        clearDataBtn.hidden = false;
        clearDataBtn.addEventListener('click', async () => {
          const confirmClear = confirm('Clear all app data, caches, service workers, and cookies? This will reload the page.');
          if (!confirmClear) return;

          try {
            // Clear local/session storage keys used by app
            localStorage.clear();
            sessionStorage.clear();

            // Clear caches
            if (window.caches && caches.keys) {
              const keys = await caches.keys();
              await Promise.all(keys.map(k => caches.delete(k)));
            }

            // Unregister service workers
            if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) {
              const regs = await navigator.serviceWorker.getRegistrations();
              await Promise.all(regs.map(r => r.unregister()));
            }

            // Attempt to clear cookies (best-effort)
            try {
              document.cookie.split(';').forEach(function(c) {
                document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date(0).toUTCString() + ';path=/');
              });
            } catch (e) {
              console.warn('Failed to clear cookies programmatically:', e);
            }

            // If Store exists, call clearAllData
            if (window.DropApp && DropApp.Store && typeof DropApp.Store.clearAllData === 'function') {
              DropApp.Store.clearAllData();
            }

            UI.toast('Cleared app data. Reloading...', 1400);
            setTimeout(() => location.reload(true), 800);
          } catch (err) {
            console.error('Error clearing app data:', err);
            UI.toast('Failed to clear some data. Check console.', 3000);
          }
        });
      }
    },

    async checkCriticalResources() {
      const criticalImages = [
        'icons/drop_rounded.png',
        'icons/fitness.svg',
        'icons/sleep.svg',
        'icons/mind.svg',
        'icons/spirit.svg'
      ];

      const checkImage = (src) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve({ src, loaded: true });
          img.onerror = () => resolve({ src, loaded: false });
          img.src = src;
        });
      };

      const results = await Promise.all(criticalImages.map(checkImage));
      const failed = results.filter(r => !r.loaded);

      if (failed.length > 0) {
        console.warn('Failed to load critical resources:', failed.map(f => f.src));
      }

      // Check if styles.css is loaded by checking for a known CSS variable
      const testElement = document.createElement('div');
      testElement.style.display = 'none';
      document.body.appendChild(testElement);
      const computedStyle = getComputedStyle(testElement);
      const cssLoaded = computedStyle.getPropertyValue('--color-primary').trim() !== '';
      document.body.removeChild(testElement);

      if (!cssLoaded) {
        console.error('Critical CSS failed to load');
        UI.toast('Loading styles...', 2000);
      }

      return {
        imagesOk: failed.length === 0,
        cssOk: cssLoaded,
        allOk: failed.length === 0 && cssLoaded
      };
    }
  };

  const testHooks = {
    initStore: () => Store.init(),
    clearAllData: () => Store.clearAllData(),
    getState: () => JSON.parse(JSON.stringify(Store.state)),
    getDefaults: () => Store.cloneDefaults(),
    validateImport: (payload) => Store.validateImport(payload),
    merge: (payload) => Store.merge(payload),
    update: (key, value) => Store.update(key, value)
  };

  if (typeof window !== 'undefined') {
    window.DropApp = window.DropApp || {};
    window.DropApp.Store = Store;
    window.DropApp.App = App;
    window.DropApp.UI = UI;
    window.DropApp.testHooks = testHooks;
  }

  const isTestEnvironment = document.body && document.body.dataset && document.body.dataset.dropTest === 'true';

  if (isTestEnvironment) {
    return;
  }

  // Initialize app with resource checks
  (async () => {
    const resourceCheck = await App.checkCriticalResources();

    if (!resourceCheck.allOk) {
      console.warn('Some resources failed to load, but continuing...');
    }

    Store.init();
    App.init();
    App.setupDevPill();
  })();

});