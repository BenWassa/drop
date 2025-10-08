document.addEventListener('DOMContentLoaded', () => {

  // === DEVELOPER MODE TOGGLE ===
  // Set to true to enable developer features (no loading overlay auto-hide, dev toast, etc.)
  const DEV_MODE = false;
  const BASE_SKILL_OPTIONS = ['Wrestling', 'Volleyball', 'Mobility', 'Yoga', 'Plyometrics'];

  const App = {
    deferredInstallPrompt: null,
    installEventsBound: false,
    currentPage: 'home',
    moodAxes: { energy: 0, mood: 0 },

    init() {
      UI.initDate();
      UI.updateQuarterProgress();
      UI.removeDevElements();
      UI.setVisionFields(Store.state);
      this.moodAxes = Scoring.getQuadrantPreset(Store.state.quadrant);
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

      // Restore slider positions from Store if available
      const storedEnergy = Store.state.energy || 0;
      const storedMood = Store.state.mood || 0;
      const hasStoredSliders = storedEnergy !== 0 || storedMood !== 0;
      
      if (hasStoredSliders) {
        // Use stored slider values
        this.moodAxes = { energy: storedEnergy, mood: storedMood };
      } else {
        // Fall back to quadrant preset if no slider data
        const fallbackAxes = Scoring.getQuadrantPreset(Store.state.quadrant);
        const currentAxes = this.moodAxes || { energy: 0, mood: 0 };
        const currentQuadrant = Scoring.resolveQuadrant(currentAxes.energy, currentAxes.mood);
        if (!this.moodAxes || currentQuadrant !== Store.state.quadrant) {
          this.moodAxes = { ...fallbackAxes };
        }
      }
      
      const axes = this.moodAxes;
      UI.setMoodSliders(axes.energy, axes.mood);
      UI.positionMoodDot(axes.energy, axes.mood);
      UI.updateSpiritSummary(Store.state.quadrant, Store.state.meditation, axes.energy, axes.mood);
    },

    updateScores() {
      const scores = {
        sleep: Scoring.calcSleep(Store.state, Store),
        fitness: Scoring.calcFitness(Store.state, Store),
        mind: Scoring.calcMind(Store.state, Store),
        spirit: Scoring.calcSpirit(Store.state, Store)
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
      
      // Persist energy and mood to Store
      if (energy !== Store.state.energy) {
        Store.update('energy', energy);
      }
      if (mood !== Store.state.mood) {
        Store.update('mood', mood);
      }
      
      UI.positionMoodDot(energy, mood);
      const quadrant = Scoring.resolveQuadrant(energy, mood);
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
          const timeValue = event.target.value;
          if (timeValue) {
            const [hours] = timeValue.split(':').map(Number);
            // Wake times expected between 04:00-12:00
            if (hours < 4 || hours > 12) {
              UI.notify('Wake times are typically between 04:00-12:00. Please verify.');
            }
          }
          Store.update('wake', timeValue);
          UI.updateSleepStatus(this.calculateSleepHours());
          UI.updateTimeButton('wake-time');
        });
      }
      if (inputs.restTime) {
        inputs.restTime.addEventListener('change', (event) => {
          const timeValue = event.target.value;
          if (timeValue) {
            const [hours] = timeValue.split(':').map(Number);
            // Rest times expected between 20:00-02:00 (20-23 or 0-2)
            if (hours < 20 && hours > 2) {
              UI.notify('Rest times are typically between 20:00-02:00. Please verify.');
            }
          }
          Store.update('rest', timeValue);
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

    setupInstallPromptEvents() {
      if (this.installEventsBound) return;
      this.installEventsBound = true;

      window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        this.deferredInstallPrompt = event;
        this.updateInstallButtonVisibility(true);
      });

      window.addEventListener('appinstalled', () => {
        this.deferredInstallPrompt = null;
        this.updateInstallButtonVisibility(false);
        UI.toast('drop installed');
      });
    },

    updateInstallButtonVisibility(forceShow = false) {
      const settingsInstallBtn = UI.elements.settingsMenu.installBtn;
      if (!settingsInstallBtn) return;

      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

      if (isStandalone) {
        settingsInstallBtn.hidden = true;
        return;
      }

      if (forceShow || this.deferredInstallPrompt) {
        settingsInstallBtn.hidden = false;
        settingsInstallBtn.disabled = false;
      } else {
        settingsInstallBtn.hidden = true;
      }
    },

    initInstallPrompt() {
      const settingsInstallBtn = UI.elements.settingsMenu.installBtn;
      if (!settingsInstallBtn) return;

      // Ensure the button state reflects any prompt captured before initialization
      this.updateInstallButtonVisibility();

      settingsInstallBtn.addEventListener('click', async () => {
        const promptEvent = this.deferredInstallPrompt;
        if (!promptEvent) {
          this.updateInstallButtonVisibility(false);
          return;
        }

        settingsInstallBtn.disabled = true;
        promptEvent.prompt();

        try {
          const { outcome } = await promptEvent.userChoice;
          if (outcome === 'accepted') {
            UI.toast('Installation started');
            this.updateInstallButtonVisibility(false);
            const settingsMenu = UI.elements.settingsMenu.menu;
            if (settingsMenu) {
              settingsMenu.classList.remove('active');
            }
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
      const { menu, openBtn, closeBtn, backdrop, exportBtn, importBtn, importInput, clearBtn } = UI.elements.settingsMenu;
      
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
              const scores = Scoring.calculateDomainScores(entry);
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

      // Add data attribute to app-main for CSS targeting
      const main = document.querySelector('.app-main');
      if (main) {
        main.setAttribute('data-current-page', page);
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
    window.DropApp.App = App;
    window.DropApp.UI = UI;
    window.DropApp.testHooks = testHooks;
  }

  const isTestEnvironment = document.body && document.body.dataset && document.body.dataset.dropTest === 'true';

  App.setupInstallPromptEvents();

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