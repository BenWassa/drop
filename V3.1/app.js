document.addEventListener('DOMContentLoaded', () => {

  // === DEVELOPER MODE TOGGLE ===
  // Set to true to enable developer features (no loading overlay auto-hide, dev toast, etc.)
  const DEV_MODE = true;

  const Store = {
    DB_KEY: 'lifeTrackerData',
    state: {},
    defaults: {
      wake: '', rest: '', run: 0, strength: false, skill: false,
      read: false, write: false, quadrant: 0, meditation: false
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
        App.updateScores();
      }
    }
  };

  const UI = {
    elements: {
      dateDisplay: document.getElementById('date-display'),
      cards: document.querySelectorAll('.card'),
      overlays: document.querySelectorAll('.overlay'),
      navButtons: document.querySelectorAll('.nav-btn'),
      loadingOverlay: document.getElementById('loading-overlay'),
      devPill: document.getElementById('dev-pill'),
      devToast: document.getElementById('dev-toast'),
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
    },

    showLoading(show = true) {
      const el = this.elements.loadingOverlay;
      if (!el) return;
      if (show) el.classList.remove('hidden');
      else el.classList.add('hidden');
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

    updateToggleButton(type, value) {
      const group = document.querySelector(`.btn-group[data-type="${type}"], .quadrant-grid[data-type="${type}"]`);
      if (group) {
        group.querySelectorAll('.btn, .quad-btn').forEach(btn => {
          btn.classList.remove('active');
        });
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
          this.updateToggleButton('strength', state.strength);
          this.updateToggleButton('skill', state.skill);
          break;
        case 'mind':
          this.updateToggleButton('read', state.read);
          this.updateToggleButton('write', state.write);
          break;
        case 'spirit':
          this.updateToggleButton('quadrant', state.quadrant);
          this.updateToggleButton('meditation', state.meditation);
          break;
      }
    },

    initDate() {
      this.elements.dateDisplay.textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric'
      });
    }
  };

  const App = {
    init() {
      Store.init();
      UI.initDate();
      // Show loading overlay with a 5s breath animation synchronized with the overlay hide
      const animDurationMs = 5000; // matches the CSS breath animation duration
      UI.showLoading(true);
      this.updateScores();
      this.bindEvents();
      this.registerServiceWorker();

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
          const label = btn.querySelector('.nav-label').textContent;
          if (label === 'Vision') {
            alert('Vision page - Coming soon!');
          } else if (label === 'Gratitude') {
            alert('Gratitude page - Coming soon!');
          } else if (label === 'Home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
          // Update active state
          UI.elements.navButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
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