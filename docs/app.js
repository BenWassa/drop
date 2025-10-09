// === TEST HOOKS (exposed immediately for test environment) ===
if (typeof window !== 'undefined') {
  window.DropApp = window.DropApp || {};
  
  // Expose test hooks immediately so tests can access them
  // These will be available before DOMContentLoaded fires
  window.DropApp.testHooks = {
    initStore: () => Store.init(),
    clearAllData: () => Store.clearAllData(),
    getState: () => JSON.parse(JSON.stringify(Store.state)),
    getDefaults: () => Store.cloneDefaults(),
    validateImport: (payload) => Store.validateImport(payload),
    merge: (payload) => Store.merge(payload),
    update: (key, value) => Store.update(key, value)
  };
}

document.addEventListener('DOMContentLoaded', () => {

  // === DEVELOPER MODE TOGGLE ===
  // Set to true to enable developer features (no loading overlay auto-hide, dev toast, etc.)
  const DEV_MODE = false;
  window.DEV_MODE = DEV_MODE; // Make accessible to other modules

  const App = {
    currentPage: 'home',
    moodAxes: { energy: 0, mood: 0 },

    init() {
      UI.initDate();
      UI.updateQuarterProgress();
      UI.removeDevElements();
      UI.setVisionFields(Store.state);
      this.moodAxes = Scoring.getQuadrantPreset(Store.state.quadrant);
      
      // Expose App globally BEFORE syncDailyUI() so ui.js can access it
      if (typeof window !== 'undefined') {
        window.App = App;
      }
      
      UI.syncDailyUI();

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
      Install.initInstallPrompt();
      UI.showPage('home');

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

      // Wait for CSS to load before hiding loading screen
      const waitForCSS = () => {
        return new Promise((resolve) => {
          // Check if document is already fully loaded
          if (document.readyState === 'complete') {
            resolve();
            return;
          }

          // Check if CSS has loaded by testing if our styles are applied
          const checkCSSLoaded = () => {
            const testElement = document.createElement('div');
            testElement.style.display = 'none';
            document.body.appendChild(testElement);
            
            // Check if CSS custom properties are available (indicates our stylesheet loaded)
            const hasCSS = getComputedStyle(testElement).getPropertyValue('--color-bg') !== '';
            document.body.removeChild(testElement);
            
            return hasCSS;
          };

          // If CSS is already loaded, resolve immediately
          if (checkCSSLoaded()) {
            resolve();
            return;
          }

          // Wait for window load event (includes all assets like CSS, images, etc.)
          window.addEventListener('load', () => {
            resolve();
          });

          // Also check periodically if CSS loads before window load
          const cssCheckInterval = setInterval(() => {
            if (checkCSSLoaded()) {
              clearInterval(cssCheckInterval);
              resolve();
            }
          }, 100);

          // Fallback timeout in case load event doesn't fire
          setTimeout(() => {
            clearInterval(cssCheckInterval);
            console.warn('CSS load timeout - hiding loading screen anyway');
            resolve();
          }, 10000); // 10 second fallback
        });
      };

      // Wait for all assets to load, then hide loading screen with animation
      waitForCSS().then(() => {
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
      });
    },

    updateScores() {
      console.log('🎯 App.updateScores called');
      console.log('📊 Current state:', {
        wake: Store.state.wake,
        rest: Store.state.rest,
        run: Store.state.run,
        strength: Store.state.strength,
        skill: Store.state.skill,
        read: Store.state.read,
        write: Store.state.write,
        meditation: Store.state.meditation,
        quadrant: Store.state.quadrant
      });
      
      const scores = {
        sleep: Scoring.calcSleep(Store.state, Store),
        fitness: Scoring.calcFitness(Store.state, Store),
        mind: Scoring.calcMind(Store.state, Store),
        spirit: Scoring.calcSpirit(Store.state, Store)
      };
      
      console.log('📈 Calculated scores:', scores);
      
      Store.recordHistory(scores);
      const streaks = Analytics.calculateStreaks();
      UI.renderScores(scores, streaks);
      Analytics.renderWeeklyHeatmap();
      
      console.log('✅ Scores updated and rendered');
    },

    bindEvents() {
      UI.bindHomeActions();
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
          UI.showPage(page);
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
          const storeKey = UI.mapVisionKey(key);
          UI.updateVisionHint(event.target, event.target.value);
          if (storeKey) {
            Store.update(storeKey, value);
          }
        });
      });

      const { exportBtn, importBtn, importInput } = UI.elements.dataControls;
      if (exportBtn) {
        exportBtn.addEventListener('click', () => {
          Store.handleExport();
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
            Store.handleImport(file);
          }
          importInput.value = '';
        });
      }

      // Settings menu bindings
      UI.bindSettingsMenu();
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
     * 
     * NOTE: This functionality has been moved to scoring.js module
     * All scoring logic is now in the Scoring object for better modularity
     */

    describeQuadrant(quadrant) {
      // NOTE: This functionality has been moved to ui.js module
      return UI.describeQuadrant(quadrant);
    },

    calculateSleepHours() {
      // NOTE: This functionality has been moved to ui.js module
      return UI.calculateSleepHours();
    },



    /**
     * Analyzes the last 7 days of historical data and determines the heatmap mode.
     */


    /**
     * Renders the Weekly Trajectory Heatmap component based on the weekly data.
     */


    /**
     * Maps raw activity score (0-100) to heatmap intensity level.
     */









          high: 'You’re staying grounded and connected to what matters most.',













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

            // Reset app state to defaults (after storage is cleared)
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

  // Expose App, UI, and Analytics to window (testHooks already exposed at top of file)
  if (typeof window !== 'undefined') {
    window.DropApp = window.DropApp || {};
    window.DropApp.App = App;
    window.DropApp.UI = UI;
    window.DropApp.Analytics = Analytics;
  }

  const isTestEnvironment = document.body && document.body.dataset && document.body.dataset.dropTest === 'true';

  Install.setupInstallPromptEvents();

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