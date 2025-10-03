document.addEventListener('DOMContentLoaded', () => {

  // === DEVELOPER MODE TOGGLE ===
  // Set to true to enable developer features (no loading overlay auto-hide, dev toast, etc.)
  const DEV_MODE = false;

  const Store = {
    DB_KEY: 'lifeTrackerData',
    state: {},
    defaults: {
      wake: '', rest: '', run: 0, strength: false, skill: false,
      read: false, write: false, quadrant: 0, meditation: false,
      visionTheme: '', visionSleepFocus: '', visionFitnessFocus: '',
      visionMindFocus: '', visionSpiritFocus: '',
      history: []
    },

    init() {
      const savedData = JSON.parse(localStorage.getItem(this.DB_KEY) || '{}');
      this.state = { ...this.defaults, ...savedData };
      this.ensureHistory();
      this.save();
    },

    ensureHistory() {
      if (!Array.isArray(this.state.history)) {
        this.state.history = [];
      }
    },

    save() {
      localStorage.setItem(this.DB_KEY, JSON.stringify(this.state));
    },

    update(key, value) {
      if (key in this.state) {
        this.state[key] = value;
        this.save();
        if (!key.startsWith('vision')) {
          App.updateScores();
        }
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
        return false;
      });
    },

    merge(payload) {
      this.state = { ...this.defaults, ...this.state, ...payload };
      this.ensureHistory();
      this.save();
    },

    recordHistory(scores) {
      if (!scores || typeof scores !== 'object') return;

      this.ensureHistory();

      const today = new Date().toISOString().split('T')[0];
      const safeScores = ['sleep', 'fitness', 'mind', 'spirit'].reduce((acc, domain) => {
        const value = Number(scores[domain]);
        const safeValue = Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value))) : 0;
        acc[domain] = safeValue;
        return acc;
      }, {});

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
      installButton: document.getElementById('install-button'),
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
        importInput: document.getElementById('settings-import-input')
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
          card: document.getElementById('sleep-card'),
          meter: document.querySelector('[data-domain-meter="sleep"]'),
          streak: document.getElementById('sleep-streak')
        },
        fitness: {
          score: document.getElementById('fitness-score'),
          card: document.getElementById('fitness-card'),
          meter: document.querySelector('[data-domain-meter="fitness"]'),
          streak: document.getElementById('fitness-streak')
        },
        mind: {
          score: document.getElementById('mind-score'),
          card: document.getElementById('mind-card'),
          meter: document.querySelector('[data-domain-meter="mind"]'),
          streak: document.getElementById('mind-streak')
        },
        spirit: {
          score: document.getElementById('spirit-score'),
          card: document.getElementById('spirit-card'),
          meter: document.querySelector('[data-domain-meter="spirit"]'),
          streak: document.getElementById('spirit-streak')
        }
      },
      inputs: {
        wakeTime: document.getElementById('wake-time'),
        restTime: document.getElementById('rest-time'),
        runValue: document.getElementById('run-value'),
      }
    },
    visionHints: {},
    toastTimer: null,

    renderScores(scores, streaks = {}) {
      const announcements = [];
      for (const domain in scores) {
        const display = this.elements.scoreDisplays[domain];
        if (!display) continue;

        const previousValue = display.score ? display.score.textContent : null;
        const numericScore = Number.isFinite(scores[domain]) ? scores[domain] : 0;
        const clampedScore = Math.max(0, Math.min(100, Math.round(numericScore)));
        const scoreText = String(clampedScore);

        if (display.score) {
          display.score.textContent = scoreText;
        }
        if (display.card) {
          display.card.textContent = scoreText;
        }
        if (display.meter) {
          display.meter.setAttribute('aria-valuenow', scoreText);
          this.updateScoreRing(display.meter, clampedScore);
        }
        if (display.streak) {
          const streakText = streaks && streaks[domain] ? streaks[domain] : '0 of 7 days';
          display.streak.textContent = streakText;
        }

        if (previousValue !== null && previousValue !== scoreText) {
          announcements.push(`${domain.charAt(0).toUpperCase() + domain.slice(1)} score updated to ${scoreText}`);
        }
      }

      if (announcements.length > 0 && this.elements.scoreAnnouncer) {
        this.elements.scoreAnnouncer.textContent = announcements.join('. ');
      }

      this.renderGratitude(scores);
    },

    updateScoreRing(meter, score) {
      const arc = meter.querySelector('.score-ring__arc');
      if (!arc) return;
      const track = meter.querySelector('.score-ring__track');
      const radius = (arc.r && arc.r.baseVal ? arc.r.baseVal.value : parseFloat(arc.getAttribute('r'))) || 52;
      const circumference = 2 * Math.PI * radius;
      const rootStyles = getComputedStyle(document.documentElement);
      const gapValue = parseFloat(rootStyles.getPropertyValue('--score-ring-gap'));
      const gapFraction = Number.isFinite(gapValue) ? Math.min(Math.max(gapValue, 0), 0.6) : 0.22;
      const visibleLength = circumference * (1 - gapFraction);
      const gapLength = circumference - visibleLength;
      const dashArray = `${visibleLength.toFixed(2)} ${gapLength.toFixed(2)}`;
      
      // Set arc dasharray with gap
      arc.style.strokeDasharray = dashArray;
      
      // Keep track as complete circle (no gap)
      if (track) {
        track.style.strokeDasharray = 'none';
      }

      const clamped = Math.max(0, Math.min(100, Number(score) || 0));
      
      // Hide arc when score is 0 to avoid showing just the rounded cap
      if (clamped === 0) {
        arc.style.opacity = '0';
      } else {
        arc.style.opacity = '1';
      }
      
      const dashOffset = visibleLength - (clamped / 100) * visibleLength;
      arc.style.strokeDashoffset = `${dashOffset.toFixed(2)}`;
    },

    showLoading(show = true) {
      const el = this.elements.loadingOverlay;
      if (!el) return;
      if (show) el.classList.remove('hidden');
      else el.classList.add('hidden');
    },

    showInstallButton(show = true) {
      const btn = this.elements.installButton;
      if (!btn) return;
      if (show) {
        btn.removeAttribute('hidden');
        btn.disabled = false;
      } else {
        btn.setAttribute('hidden', '');
        btn.disabled = false;
      }
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

    toggleOverlay(domain, show = true) {
      const overlay = document.getElementById(`${domain}-overlay`);
      if (overlay) {
        overlay.classList.toggle('active', show);
      }
    },

    updateToggleButton(type, value, skipIfDefault = false) {
      const group = document.querySelector(`.btn-group[data-type="${type}"], .quadrant-grid[data-type="${type}"]`);
      if (group) {
        group.querySelectorAll('.btn, .quad-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        // If skipIfDefault is true and value matches the default, leave all buttons unclicked
        if (skipIfDefault) {
          const defaultVal = Store.defaults[type];
          if (value === defaultVal) return; // don't highlight any button
        }
        const activeBtn = group.querySelector(`[data-value="${value}"]`);
        if (activeBtn) activeBtn.classList.add('active');
      }
    },

    loadOverlayData(domain) {
      const state = Store.state;
      switch (domain) {
        case 'sleep':
          this.elements.inputs.wakeTime.value = state.wake;
          this.elements.inputs.restTime.value = state.rest;
          break;
        case 'fitness':
          this.elements.inputs.runValue.textContent = state.run;
          this.updateToggleButton('strength', state.strength, true);
          this.updateToggleButton('skill', state.skill, true);
          break;
        case 'mind':
          this.updateToggleButton('read', state.read, true);
          this.updateToggleButton('write', state.write, true);
          break;
        case 'spirit':
          this.updateToggleButton('quadrant', state.quadrant, true);
          this.updateToggleButton('meditation', state.meditation, true);
          break;
      }
    },

    initDate() {
      this.elements.dateDisplay.textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric'
      });
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

    init() {
      Store.init();
      UI.initDate();
      UI.setVisionFields(Store.state);
      // Show loading overlay with a 5s breath animation synchronized with the overlay hide
      const animDurationMs = 5000; // matches the CSS breath animation duration
      UI.showLoading(true);
      this.updateScores();
      this.bindEvents();
      this.registerServiceWorker();
      this.initInstallPrompt();
      this.showPage('home');

      // Hide loading overlay when the breath animation finishes (or fallback after animDurationMs)
      const logo = document.querySelector('.loading-logo');
      let fallbackTimeout = null;
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
    },

    initInstallPrompt() {
      const installBtn = UI.elements.installButton;
      const settingsInstallBtn = UI.elements.settingsMenu.installBtn;
      if (!installBtn) return;

      UI.showInstallButton(false);

      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
      if (isStandalone) {
        return;
      }

      window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        this.deferredInstallPrompt = event;
        UI.showInstallButton(true);
        
        // Also show install button in settings menu
        if (settingsInstallBtn) {
          settingsInstallBtn.hidden = false;
        }
      });

      window.addEventListener('appinstalled', () => {
        this.deferredInstallPrompt = null;
        UI.showInstallButton(false);
        UI.toast('drop installed');
      });

      installBtn.addEventListener('click', async () => {
        const promptEvent = this.deferredInstallPrompt;
        if (!promptEvent) {
          UI.showInstallButton(false);
          return;
        }

        installBtn.disabled = true;
        promptEvent.prompt();

        try {
          const { outcome } = await promptEvent.userChoice;
          if (outcome === 'accepted') {
            UI.toast('Installation started');
            UI.showInstallButton(false);
          } else {
            installBtn.disabled = false;
            UI.showInstallButton(true);
          }
        } catch (error) {
          console.error('Install prompt failed:', error);
          installBtn.disabled = false;
          UI.showInstallButton(true);
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
            if (UI.elements.inputs.runValue) {
              UI.elements.inputs.runValue.textContent = Store.state.run;
            }
            this.updateScores();
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

    bindEvents() {
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
      const { menu, openBtn, closeBtn, backdrop, installBtn, exportBtn, importBtn, importInput } = UI.elements.settingsMenu;
      
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
            UI.elements.installButton.hidden = true;
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

    // --- SCORE CALCULATION LOGIC (Unchanged) ---
    calcSleep() {
      const { wake, rest } = Store.state;
      if (!wake || !rest) return 0;
      const [wh, wm] = wake.split(':').map(Number);
      const [rh, rm] = rest.split(':').map(Number);
      const wakeMins = wh * 60 + wm;
      const restMins = rh * 60 + rm;
      const duration = restMins < wakeMins ? (1440 - wakeMins + restMins) : (restMins - wakeMins);
      const hours = duration / 60;
      if (hours >= 7 && hours <= 9) return 100;
      if (hours >= 6 && hours < 7) return 80;
      if (hours > 9 && hours <= 10) return 80;
      if (hours >= 5 && hours < 6) return 60;
      if (hours > 10 && hours <= 11) return 60;
      return 40;
    },
    calcFitness() {
      let score = 0;
      if (Store.state.run >= 20) score += 40;
      else if (Store.state.run >= 10) score += 30;
      else if (Store.state.run >= 5) score += 20;
      if (Store.state.strength) score += 30;
      if (Store.state.skill) score += 30;
      return Math.min(100, score);
    },
    calcMind() {
      let score = 0;
      if (Store.state.read) score += 50;
      if (Store.state.write) score += 50;
      return score;
    },
    calcSpirit() {
      let score = 0;
      const { quadrant, meditation } = Store.state;
      if (quadrant === 1 || quadrant === 2) score += 50;
      else if (quadrant === 3 || quadrant === 4) score += 25;
      if (meditation) score += 50;
      return Math.min(100, score);
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
      const devPill = UI.elements.devPill;
      if (!devPill) return;

      // Show dev pill if DEV_MODE is enabled
      if (DEV_MODE) {
        devPill.classList.add('visible');
      }

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
    }
  };

  App.init();
  App.setupDevPill();

});