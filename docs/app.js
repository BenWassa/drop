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
      visionMindFocus: '', visionSpiritFocus: ''
    },
    
    init() {
      const savedData = JSON.parse(localStorage.getItem(this.DB_KEY) || '{}');
      this.state = { ...this.defaults, ...savedData };
      this.save();
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
      visionInputs: {
        theme: document.getElementById('vision-theme'),
        sleep: document.getElementById('vision-sleep-focus'),
        fitness: document.getElementById('vision-fitness-focus'),
        mind: document.getElementById('vision-mind-focus'),
        spirit: document.getElementById('vision-spirit-focus')
      },
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
        sleep: { score: document.getElementById('sleep-score'), card: document.getElementById('sleep-card') },
        fitness: { score: document.getElementById('fitness-score'), card: document.getElementById('fitness-card') },
        mind: { score: document.getElementById('mind-score'), card: document.getElementById('mind-card') },
        spirit: { score: document.getElementById('spirit-score'), card: document.getElementById('spirit-card') }
      },
      inputs: {
        wakeTime: document.getElementById('wake-time'),
        restTime: document.getElementById('rest-time'),
        runValue: document.getElementById('run-value'),
      }
    },

    renderScores(scores) {
      for (const domain in scores) {
        this.elements.scoreDisplays[domain].score.textContent = scores[domain];
        this.elements.scoreDisplays[domain].card.textContent = scores[domain];
      }
      this.renderGratitude(scores);
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
    },

    renderGratitude(scores) {
      const {
        topDomain, topScore, topDetail,
        focusDomain, focusScore, focusDetail,
        momentumDetail, sleepSummary, runSummary,
        meditationSummary, progressBars
      } = this.elements.gratitude;

      if (!topDomain) return;

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
      UI.renderScores(scores);
    },

    initInstallPrompt() {
      const installBtn = UI.elements.installButton;
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

      // Vision inputs
      Object.entries(UI.elements.visionInputs).forEach(([key, input]) => {
        if (!input) return;
        input.addEventListener('input', (event) => {
          const value = event.target.value.trim();
          const storeKey = this.mapVisionKey(key);
          if (storeKey) {
            Store.update(storeKey, value);
          }
        });
      });
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

      if (page === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
      const momentum = averageScore >= 75
        ? `Strong average (${averageScore}) across domains—build on what’s working.`
        : `Average sits at ${averageScore}. Choose one ritual to upgrade and lift the whole system.`;

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
    }
  };

  App.init();

});