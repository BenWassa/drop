/**
 * ===========================
 * UI MODULE
 * ===========================
 *
 * User Interface manipulation and rendering functions.
 * Handles DOM updates, visual feedback, and user interactions.
 *
 * DEPENDENCIES:
 * - Store: For accessing application state
 * - App: For generating insights and describing quadrants
 * - Scoring: For calculating domain scores
 */

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
      backupSetupBtn: document.getElementById('settings-backup-setup-btn'),
      backupNowBtn: document.getElementById('settings-backup-now-btn'),
      backupStatus: document.getElementById('settings-backup-status'),
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
      listView: document.getElementById('history-list-view'),
      editView: document.getElementById('history-edit-view'),
      backBtn: document.getElementById('history-back-btn'),
      editDate: document.getElementById('history-edit-date'),
      editForm: document.getElementById('history-edit-form'),
      cancelBtn: document.getElementById('edit-cancel-btn'),
      addBtn: document.getElementById('history-add-btn'),
      title: document.getElementById('history-title')
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
      moodDot: document.getElementById('spirit-mood-dot'),
    },
    heatmapContainer: document.getElementById('heatmap-container'),
    heatmapSummary: document.getElementById('heatmap-summary')
  },
  visionHints: {},
  toastTimer: null,

    // Helper function to parse date keys correctly as local dates
    parseDateKey(dateKey) {
    if (window.DEV_MODE) {
      console.log('🔍 parseDateKey input:', dateKey);
    }
    const [year, month, day] = dateKey.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    if (window.DEV_MODE) {
      console.log('📅 parseDateKey result:', date, 'ISO:', date.toISOString(), 'Locale:', date.toLocaleDateString());
    }
    return date;
    },  renderScores(scores, streaks = {}) {
    const announcements = [];
    const history = typeof Store.getHistory === 'function' ? Store.getHistory(30) : [];

    // Count days with valid baseline data (must have wake AND rest)
    const entries = Store.state.entries || {};
    const daysLogged = Object.values(entries).filter(entry => {
      return entry && entry.wake && entry.rest;
    }).length;

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

    // Show a non-blocking warning if today's logged activities look unrealistic
    try {
      const todayState = Store.getTodayEntry ? Store.getTodayEntry() : Store.state;
      const activityCount = (typeof Scoring !== 'undefined' && typeof Scoring.calculateActivityCountForState === 'function')
        ? Scoring.calculateActivityCountForState(todayState)
        : 0;

      this.renderActivityWarning(activityCount);
    } catch (e) {
      // Don't let UI rendering fail if Store or Scoring is unavailable
      console.warn('Activity warning check skipped:', e && e.message);
    }

    if (announcements.length > 0 && this.elements.scoreAnnouncer) {
      this.elements.scoreAnnouncer.textContent = announcements.join('. ');
    }

    this.renderGratitude(scores);
  },

  /**
   * Renders a small, dismissible warning when the day's activity count looks unrealistically high.
   * This is intentionally non-blocking: it simply informs the user and links to guidance in the app.
   */
  renderActivityWarning(activityCount) {
    const existing = document.getElementById('activity-warning-card');
    if (activityCount <= 3) {
      if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
      return;
    }

    // Create or update the warning card
    let card = existing;
    if (!card) {
      card = document.createElement('div');
      card.id = 'activity-warning-card';
      card.className = 'app-warning-card';
      card.innerHTML = `
        <div class="warning-icon">⚠️</div>
        <div class="warning-content">
          <strong>Multiple activities detected</strong>
          <p>You've logged a large number of different practices today. This might reflect an unusual day — consider splitting heavy training and long endurance sessions across different days for recovery.</p>
          <button id="activity-warning-dismiss" class="btn btn--small">Dismiss</button>
        </div>
      `;

      // Insert near the top of the home page (after date display) if possible
      const target = document.getElementById('home-top') || document.body;
      if (target && target.parentNode) {
        target.parentNode.insertBefore(card, target.nextSibling);
      } else {
        document.body.insertBefore(card, document.body.firstChild);
      }

      const dismissBtn = document.getElementById('activity-warning-dismiss');
      if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
          if (card && card.parentNode) card.parentNode.removeChild(card);
        });
      }
    }
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
    // Check if DEV_MODE exists globally or on window
    const devMode = (typeof DEV_MODE !== 'undefined' && DEV_MODE) || 
                    (typeof window.DEV_MODE !== 'undefined' && window.DEV_MODE);
    
    if (devMode) return;

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

  setBackupState({ statusText = '', ready, needsPermission = false, unsupported = false, busy = false } = {}) {
    const { backupStatus, backupNowBtn, backupSetupBtn } = this.elements.settingsMenu;
    const resolvedReady = typeof ready === 'boolean' ? ready : Boolean(!unsupported && !needsPermission);

    if (backupStatus) {
      backupStatus.textContent = statusText;
      if (unsupported) {
        backupStatus.dataset.state = 'unsupported';
      } else if (needsPermission) {
        backupStatus.dataset.state = 'permission';
      } else if (resolvedReady) {
        backupStatus.dataset.state = 'ready';
      } else {
        backupStatus.dataset.state = 'idle';
      }
    }

    if (backupNowBtn) {
      const disabled = !resolvedReady || busy;
      backupNowBtn.disabled = disabled;
      backupNowBtn.setAttribute('aria-disabled', String(disabled));
      backupNowBtn.classList.toggle('is-busy', Boolean(busy));
      backupNowBtn.style.display = resolvedReady ? '' : 'none';
    }

    if (backupSetupBtn) {
      const disabled = Boolean(busy);
      backupSetupBtn.disabled = disabled;
      backupSetupBtn.setAttribute('aria-disabled', String(disabled));
    }
  },

  renderSkillChips() {
    const container = this.elements.home?.skillContainer;
    if (!container) return;
    const options = Store.getSkillOptions();
    const selected = new Set(Array.isArray(Store.state.skill) ? Store.state.skill : []);
    container.innerHTML = '';
    options.forEach(option => {
      const chip = document.createElement('button');
      chip.className = 'skill-chip skill-chip--fitness'; // Add fitness class for red styling
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
    
    // Update practice states for sleep
    UI.updatePracticeState('wake', !!Store.state.wake);
    UI.updatePracticeState('rest', !!Store.state.rest);
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
    const strengthLevel = Store.state.strength_level || 0;
    if (strengthLevel > 0) {
      const levels = ['', 'Movement', 'Session', 'Training'];
      parts.push(`Strength: ${levels[strengthLevel]}`);
    }
    const skills = Array.isArray(Store.state.skill) ? Store.state.skill : [];
    if (skills.length > 0) {
      parts.push(`Skill: ${skills.join(', ')}`);
    }
    summary.textContent = parts.length ? parts.join(' · ') : 'No training logged yet.';
    
    // Update practice states for fitness
    UI.updatePracticeState('run', runDistance > 0);
    UI.updatePracticeState('strength', strengthLevel > 0);
    UI.updatePracticeState('skill', skills.length > 0);
  },

  updateMindStatus() {
    const status = this.elements.home?.mindStatus;
    if (!status) return;
    const { read_level, write_level } = Store.state;
    const parts = [];
    
    if (read_level > 0) {
      const levels = ['', 'Leisure', 'Perspicacity', 'Erudition'];
      parts.push(`Reading: ${levels[read_level]}`);
    }
    if (write_level > 0) {
      const levels = ['', 'Journal', 'Editorial', 'Treatise'];
      parts.push(`Writing: ${levels[write_level]}`);
    }
    
    status.textContent = parts.length ? parts.join(' · ') : 'Nothing logged yet.';
    
    // Update practice states for mind
    UI.updatePracticeState('reading', read_level > 0);
    UI.updatePracticeState('writing', write_level > 0);
  },

  updateMindTierButtons(type, selectedValue) {
    const selector = type === 'reading' ? '[data-mind-tier="reading"]' : '[data-mind-tier="writing"]';
    const container = document.querySelector(selector);
    if (!container) return;
    
    const buttons = container.querySelectorAll('.tier-btn');
    buttons.forEach(btn => {
      const value = Number(btn.dataset.tierValue);
      const isSelected = value === selectedValue;
      btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
      btn.classList.toggle('selected', isSelected);
    });
  },

  updateStrengthTierButtons(selectedValue) {
    const buttons = document.querySelectorAll('.tiered-selection[data-fitness-tier="strength"] .tier-btn');
    buttons.forEach(btn => {
      const value = Number(btn.dataset.tierValue);
      const isSelected = value === selectedValue && selectedValue > 0;
      btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
      btn.classList.toggle('selected', isSelected);
    });
  },

  updateSpiritSummary(quadrant, meditation, energy = 0, mood = 0) {
    const status = this.elements.home?.spiritStatus;
    if (!status) return;
    const descriptors = [];
        const quadrantLabel = this.describeQuadrant(quadrant);
    if (quadrant > 0 && quadrantLabel) {
      // If quadrant is selected, show the quadrant label
      descriptors.push(quadrantLabel);
    }
    if (meditation) {
      descriptors.push('Meditation logged');
    }
    status.textContent = descriptors.length ? descriptors.join(' · ') : 'No mood logged yet.';
    
    // Update practice states for spirit
    UI.updatePracticeState('mindfulness', !!meditation);
    UI.updatePracticeState('mood', quadrant > 0);
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
    this.updateDateDisplay();
  },

  /**
   * Update date display to show current calendar day
   * If viewing history (Store.state.currentDate is set), show that date
   * Otherwise show current calendar day
   */
  updateDateDisplay() {
    try {
      const el = document.getElementById('date-display') || (this.elements && this.elements.dateDisplay);
      if (!el) return;

      // If viewing a historical date, show that
      if (Store.state.currentDate) {
        const dateObj = new Date(Store.state.currentDate + 'T12:00:00');
        el.textContent = dateObj.toLocaleDateString('en-US', {
          weekday: 'long', month: 'long', day: 'numeric'
        }) + ' (History)';
        return;
      }

      // Otherwise show current calendar day
      const today = Store.getToday();
      const dateObj = new Date(today + 'T12:00:00');

      let dateText = dateObj.toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric'
      });

      el.textContent = dateText;
    } catch (err) {
      console.warn('updateDateDisplay failed:', err);
    }
  },

  /**
   * Calculate and display weekly progress (week of year, 1-52)
   * Progress bar moves by day for granular tracking, labels show quarter and week
   */
  updateQuarterProgress() {
    const { quarterProgress } = this.elements;
    
    console.log('🔍 updateQuarterProgress called');
    console.log('quarterProgress elements:', quarterProgress);
    
    // Check if we have at least the labels (progress bar fill is optional since it may be hidden)
    if (!quarterProgress || !quarterProgress.quarterLabel || !quarterProgress.weekLabel) {
      console.error('❌ Quarter/Week labels not found!', quarterProgress);
      return;
    }

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

    console.log('📊 Quarter/Week calculated:', { dayOfYear, currentWeek, currentQuarter, percentComplete });

    // Update progress bar (moves by day) - only if it exists
    if (quarterProgress.fill) {
      quarterProgress.fill.style.width = `${percentComplete}%`;
    }

    // Update labels (these should always exist)
    quarterProgress.quarterLabel.textContent = `Q${currentQuarter}`;
    quarterProgress.weekLabel.textContent = `Wk ${currentWeek}`;

    console.log('✅ Quarter/Week updated:', `Q${currentQuarter}`, `Wk ${currentWeek}`);

    // Update aria attribute - only if progress bar exists
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

    const insights = this.generateInsights(scores);

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
    const { wake } = Store.state;
    if (!wake) return null;
    
    // Get today's date and yesterday's date
    const today = Store.getToday();
    const todayDate = new Date(today + 'T12:00:00');
    const yesterdayDate = new Date(todayDate);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];
    
    // Get yesterday's rest time from entries
    const yesterdayEntry = Store.state.entries[yesterday];
    const rest = yesterdayEntry?.rest;
    
    if (!rest) return null;
    
    const [wh, wm] = wake.split(':').map(Number);
    const [rh, rm] = rest.split(':').map(Number);
    if ([wh, wm, rh, rm].some(v => isNaN(v))) return null;
    
    const wakeMins = wh * 60 + wm;
    const restMins = rh * 60 + rm;
    
    // Calculate duration: from yesterday's rest time to today's wake time
    // This spans midnight, so add wake time to time from rest to midnight
    const duration = wakeMins + (1440 - restMins);
    return Math.round((duration / 60) * 10) / 10;
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
    const history = typeof Store.getHistory === 'function' ? Store.getHistory(14, { includeArchived: true }) : [];
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
        high: 'You\'re staying grounded and connected to what matters most.',
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
      ? `Strong average (${averageScore}) across domains—build on what\'s working.`
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
    UI.updateMindTierButtons('reading', Store.state.read_level || 0);
    UI.updateMindTierButtons('writing', Store.state.write_level || 0);
    UI.updateStrengthTierButtons(Store.state.strength_level || 0);
    UI.setToggleState('meditation', Store.state.meditation);

    UI.updateSkillChips(Store.state.skill);
    UI.updateSleepStatus(UI.calculateSleepHours());
    UI.updateFitnessSummary();
    UI.updateMindStatus();

    // Update collapsible practice states
    UI.updatePracticeStates();

    // Restore slider positions from Store
    const storedEnergy = Store.state.energy || 0;
    const storedMood = Store.state.mood || 0;
    
    // Check if App is available (it might not be during initial load)
    const hasApp = typeof App !== 'undefined';
    
    // Always use stored values if available, otherwise use quadrant preset
    let axes;
    if (storedEnergy !== 0 || storedMood !== 0) {
      // Use stored slider values
      axes = { energy: storedEnergy, mood: storedMood };
      if (hasApp) App.moodAxes = { ...axes };
    } else {
      // Fall back to quadrant preset if no slider data
      axes = Scoring.getQuadrantPreset(Store.state.quadrant);
      if (hasApp) App.moodAxes = { ...axes };
    }
    
    // Update App.moodAxes if App is available
    if (hasApp) {
      App.moodAxes = { ...axes };
    }

    // Update quadrant if it changed
    const quadrant = Scoring.resolveQuadrant(axes.energy, axes.mood);
    if (quadrant !== Store.state.quadrant) {
      Store.update('quadrant', quadrant);
    }

    // Update the dot position and summary
    UI.positionMoodDot(axes.energy, axes.mood);
    UI.updateSpiritSummary(Store.state.quadrant, Store.state.meditation, axes.energy, axes.mood);
  },

  // === COLLAPSIBLE PRACTICE SECTIONS ===
  bindCollapsiblePractices() {
    document.querySelectorAll('.practice-header').forEach(header => {
      header.addEventListener('click', (event) => {
        event.stopPropagation();
        const practice = header.closest('.collapsible-practice');
        if (!practice) return;
        
        const isExpanded = practice.classList.contains('is-expanded');
        
        // Close other practices in the same card when opening this one (accordion behavior)
        if (!isExpanded) {
          const card = practice.closest('.action-card');
          if (card) {
            card.querySelectorAll('.collapsible-practice.is-expanded').forEach(p => {
              if (p !== practice) p.classList.remove('is-expanded');
            });
          }
        }
        
        // Toggle this practice
        practice.classList.toggle('is-expanded', !isExpanded);
      });
    });

    // Initialize practice states on load
    UI.updatePracticeStates();
  },

  updatePracticeStates() {
    const state = Store.state;

    // Sleep practices
    UI.updatePracticeState('wake', !!state.wake);
    UI.updatePracticeState('rest', !!state.rest);

    // Fitness practices
    UI.updatePracticeState('run', state.run > 0);
    UI.updatePracticeState('strength', (state.strength_level || 0) > 0);
    const hasSkill = Array.isArray(state.skill) && state.skill.length > 0;
    UI.updatePracticeState('skill', hasSkill);

    // Mind practices
    UI.updatePracticeState('reading', (state.read_level || 0) > 0);
    UI.updatePracticeState('writing', (state.write_level || 0) > 0);

    // Spirit practices
    UI.updatePracticeState('mindfulness', !!state.meditation);
    UI.updatePracticeState('mood', state.quadrant > 0);

    // Update displayed values
    UI.updatePracticeValues();
  },

  updatePracticeState(practiceId, isLogged) {
    const practice = document.querySelector(`[data-practice="${practiceId}"]`);
    if (!practice) return;
    
    practice.classList.toggle('is-logged', isLogged);
  },

  updatePracticeValues() {
    const state = Store.state;
    const formatTime = (time) => {
      if (!time) return '';
      const [hours, minutes] = time.split(':');
      const hour12 = hours % 12 || 12;
      const ampm = hours < 12 ? 'AM' : 'PM';
      return `${hour12}:${minutes} ${ampm}`;
    };

    // Sleep practices
    UI.updatePracticeValue('wake', state.wake ? formatTime(state.wake) : '');
    UI.updatePracticeValue('rest', state.rest ? formatTime(state.rest) : '');

    // Fitness practices
    UI.updatePracticeValue('run', state.run ? `${state.run}km` : '');
    const strengthLevels = {1: 'Movement', 2: 'Session', 3: 'Training'};
    UI.updatePracticeValue('strength', state.strength_level ? strengthLevels[state.strength_level] || `Level ${state.strength_level}` : '');
    
    if (Array.isArray(state.skill) && state.skill.length > 0) {
      const first = state.skill[0];
      const extra = state.skill.length - 1;
      UI.updatePracticeValue('skill', extra > 0 ? `${first} + ${extra}` : first);
    } else {
      UI.updatePracticeValue('skill', '');
    }

    // Mind practices
    const readingLevels = {1: 'Leisure', 2: 'Perspicacity', 3: 'Erudition'};
    UI.updatePracticeValue('reading', state.read_level ? readingLevels[state.read_level] || `Level ${state.read_level}` : '');
    const writingLevels = {1: 'Journal', 2: 'Editorial', 3: 'Treatise'};
    UI.updatePracticeValue('writing', state.write_level ? writingLevels[state.write_level] || `Level ${state.write_level}` : '');

    // Spirit practices
    UI.updatePracticeValue('mindfulness', state.meditation ? 'Meditated' : '');
    UI.updatePracticeValue('mood', state.quadrant ? `Quadrant ${state.quadrant}` : '');
  },

  updatePracticeValue(practiceId, value) {
    const practice = document.querySelector(`[data-practice="${practiceId}"]`);
    if (!practice) return;
    
    const valueEl = practice.querySelector('.practice-value');
    if (valueEl) {
      valueEl.textContent = value;
    }
  },



  bindHomeActions() {
    const { inputs, home } = UI.elements;

    // === COLLAPSIBLE PRACTICE SECTIONS ===
    UI.bindCollapsiblePractices();

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
        UI.updateSleepStatus(UI.calculateSleepHours());
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
        UI.updateSleepStatus(UI.calculateSleepHours());
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
        UI.updateSleepStatus(UI.calculateSleepHours());
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
            const energy = (typeof App !== 'undefined' && App.moodAxes) ? App.moodAxes.energy : Store.state.energy || 0;
            const mood = (typeof App !== 'undefined' && App.moodAxes) ? App.moodAxes.mood : Store.state.mood || 0;
            UI.updateSpiritSummary(Store.state.quadrant, newValue, energy, mood);
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

        // Handle mind tier buttons (reading and writing levels)
        const tierBtn = event.target.closest('.tier-btn[data-tier-value]');
        if (tierBtn) {
          const tierValue = Number(tierBtn.dataset.tierValue);
          const tierGroup = tierBtn.closest('.tiered-selection');
          const tierType = tierGroup?.dataset.mindTier; // 'reading' or 'writing'
          const fitnessTier = tierGroup?.dataset.fitnessTier; // 'strength'
          
          if (tierType === 'reading') {
            const currentValue = Store.state.read_level || 0;
            const newValue = currentValue === tierValue ? 0 : tierValue; // Toggle off if same
            Store.update('read_level', newValue);
            UI.updateMindTierButtons('reading', newValue);
            UI.updateMindStatus();
            return;
          } else if (tierType === 'writing') {
            const currentValue = Store.state.write_level || 0;
            const newValue = currentValue === tierValue ? 0 : tierValue; // Toggle off if same
            Store.update('write_level', newValue);
            UI.updateMindTierButtons('writing', newValue);
            UI.updateMindStatus();
            return;
          } else if (fitnessTier === 'strength') {
            const currentValue = Store.state.strength_level || 0;
            const newValue = currentValue === tierValue ? 0 : tierValue; // Toggle off if same
            Store.update('strength_level', newValue);
            UI.updateStrengthTierButtons(newValue);
            UI.updateFitnessSummary();
            return;
          }
        }
      });
    }

    // Add click handler for mood quadrant
    const moodGrid = document.getElementById('spirit-mood-grid');
    if (moodGrid) {
      moodGrid.addEventListener('click', (event) => {
        const rect = moodGrid.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Convert to percentage (0-100)
        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;
        
        // Convert to mood/energy values (-100 to 100)
        // X axis: left = negative mood (-100), right = positive mood (100)
        const mood = (xPercent - 50) * 2;
        // Y axis: top = high energy (100), bottom = low energy (-100)
        const energy = (50 - yPercent) * 2;
        
        // Clamp values
        const clampedMood = Math.max(-100, Math.min(100, Math.round(mood)));
        const clampedEnergy = Math.max(-100, Math.min(100, Math.round(energy)));
        
        // Update App.moodAxes if App is available
        if (typeof App !== 'undefined') {
          App.moodAxes = { energy: clampedEnergy, mood: clampedMood };
        }
        
        // Persist energy and mood to Store
        if (clampedEnergy !== Store.state.energy) {
          Store.update('energy', clampedEnergy);
        }
        if (clampedMood !== Store.state.mood) {
          Store.update('mood', clampedMood);
        }
        
        // Update quadrant if it changed
        const quadrant = Scoring.resolveQuadrant(clampedEnergy, clampedMood);
        if (quadrant !== Store.state.quadrant) {
          Store.update('quadrant', quadrant);
        }
        
        // Update the dot position and summary
        UI.positionMoodDot(clampedEnergy, clampedMood);
        UI.updateSpiritSummary(Store.state.quadrant, Store.state.meditation, clampedEnergy, clampedMood);
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

    if (typeof App !== 'undefined') {
      App.currentPage = page;
    }
    UI.updateNavState(page);

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

  bindSettingsMenu() {
    const {
      menu,
      openBtn,
      closeBtn,
      backdrop,
      exportBtn,
      importBtn,
      importInput,
      clearBtn,
      backupSetupBtn,
      backupNowBtn
    } = UI.elements.settingsMenu;
    
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
        Store.handleExport();
        closeSettings();
      });
    }

    if (backupSetupBtn) {
      backupSetupBtn.addEventListener('click', async () => {
        if (typeof Backup === 'undefined' || typeof Backup.chooseDirectory !== 'function') {
          UI.notify('Local folder backups are not supported on this device.');
          return;
        }
        try {
          await Backup.chooseDirectory();
        } catch (error) {
          console.error('Backup setup failed:', error);
        }
      });
    }

    if (backupNowBtn) {
      backupNowBtn.addEventListener('click', async () => {
        if (typeof Backup === 'undefined' || typeof Backup.manualBackup !== 'function') {
          UI.notify('Local folder backups are not supported on this device.');
          return;
        }
        try {
          await Backup.manualBackup();
        } catch (error) {
          console.error('Manual backup failed:', error);
        }
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
          Store.handleImport(file);
        }
        importInput.value = '';
        closeSettings();
      });
    }

    if (clearBtn) {
      console.log('Clear button found, binding event');
      clearBtn.addEventListener('click', () => {
        console.log('Clear button clicked');
        const cleared = Store.handleDataClear();
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
        UI.openHistoryView();
      });
    } else {
      console.log('❌ History button NOT found');
    }
  },

  openHistoryView() {
    console.log('🔓 Opening history view...');
    const { overlay, closeBtn, list, dateRange, addBtn } = UI.elements.historyOverlay;

    console.log('📊 History overlay elements:', { overlay, closeBtn, list, dateRange, addBtn });

    if (!overlay) {
      console.log('❌ History overlay element not found!');
      return;
    }

    Store.ensureEntries();
    
    // Render history entries grouped by month and week
    const renderHistory = () => {
      const entries = Store.state.entries || {};
      const allDates = Object.keys(entries).sort((a, b) => UI.parseDateKey(b) - UI.parseDateKey(a));

      // Group entries by month-year and then by week of year
      const groupedEntries = {};
      allDates.forEach(dateKey => {
        const date = UI.parseDateKey(dateKey);
        const monthYear = `${date.toLocaleDateString('en-US', { month: 'long' })} - ${date.getFullYear()}`;
        const weekOfYear = getWeekOfYear(date);

        if (!groupedEntries[monthYear]) {
          groupedEntries[monthYear] = {};
        }
        if (!groupedEntries[monthYear][weekOfYear]) {
          groupedEntries[monthYear][weekOfYear] = [];
        }
        groupedEntries[monthYear][weekOfYear].push(dateKey);
      });

      // Update date range text to show total entries
      if (dateRange) {
        const totalEntries = allDates.length;
        dateRange.textContent = `${totalEntries} ${totalEntries === 1 ? 'entry' : 'entries'}`;
      }

      // Render grouped entries
      if (list) {
        if (allDates.length === 0) {
          list.innerHTML = `
            <div class="history-empty">
              <div class="history-empty__icon">📅</div>
              <p class="history-empty__text">No entries yet. Start tracking your daily progress!</p>
            </div>
          `;
        } else {
          list.innerHTML = Object.keys(groupedEntries).map(monthYear => {
            const monthWeeks = groupedEntries[monthYear];
            const weekKeys = Object.keys(monthWeeks).sort((a, b) => Number(b) - Number(a)); // Sort weeks descending

            return `
              <div class="history-month" data-month="${monthYear}">
                <button class="history-month__header" aria-expanded="true">
                  <span class="history-month__title">${monthYear}</span>
                  <span class="history-month__toggle" aria-hidden="true">▼</span>
                </button>
                <div class="history-month__content">
                  ${weekKeys.map(weekNum => {
                    const weekDates = monthWeeks[weekNum].sort((a, b) => UI.parseDateKey(b) - UI.parseDateKey(a));
                    const weekStart = UI.parseDateKey(weekDates[weekDates.length - 1]);
                    const weekEnd = UI.parseDateKey(weekDates[0]);
                    const weekRange = weekStart.toDateString() === weekEnd.toDateString()
                      ? weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

                    return `
                      <div class="history-week">
                        <div class="history-week__header">Week ${weekNum} • ${weekRange}</div>
                        <div class="history-week__entries">
                          ${weekDates.map(dateKey => {
                            const entry = entries[dateKey];
                            const scores = Scoring.calculateDomainScores(entry);
                            const totalScore = Math.round((scores.sleep + scores.fitness + scores.mind + scores.spirit) / 4);

                            const date = UI.parseDateKey(dateKey);
                            const formattedDate = date.toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            });

                            return `
                              <div class="history-entry" data-date="${dateKey}">
                                <div class="history-entry__header">
                                  <div class="history-entry__date">${formattedDate}</div>
                                  <div class="history-entry__total">${totalScore}</div>
                                  <button class="history-entry__delete" data-date="${dateKey}" aria-label="Delete entry for ${formattedDate}">
                                    <span aria-hidden="true">×</span>
                                  </button>
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
                          }).join('')}
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('');

          // Add click handlers for month headers (collapsible)
          list.querySelectorAll('.history-month__header').forEach(header => {
            header.addEventListener('click', () => {
              const monthEl = header.closest('.history-month');
              const content = monthEl.querySelector('.history-month__content');
              const toggle = header.querySelector('.history-month__toggle');
              const isExpanded = header.getAttribute('aria-expanded') === 'true';

              header.setAttribute('aria-expanded', !isExpanded);
              content.style.display = isExpanded ? 'none' : 'block';
              toggle.textContent = isExpanded ? '▶' : '▼';
            });
          });

          // Add click handlers to entries
          list.querySelectorAll('.history-entry').forEach(entryEl => {
            entryEl.addEventListener('click', () => {
              const dateKey = entryEl.dataset.date;
              UI.showHistoryEditForm(dateKey);
            });
          });
        }
      }
    };

    // Helper function to get week of year
    const getWeekOfYear = (date) => {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    };

    // Close handler
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        console.log('❌ Closing history overlay');
        UI.hideHistoryEditForm(); // Ensure edit form is hidden
        overlay.classList.remove('active');
      });
    }

    // Edit form event listeners
    const { backBtn, cancelBtn, editForm } = UI.elements.historyOverlay;
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        UI.hideHistoryEditForm();
      });
    }
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        UI.hideHistoryEditForm();
      });
    }
    if (editForm) {
      editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        UI.saveHistoryEdit();
      });
    }

    // Add entry button
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        UI.showAddEntryForm();
      });
    }

    // Event delegation for delete buttons and entry clicks
    if (list) {
      list.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.history-entry__delete');
        const entryEl = e.target.closest('.history-entry');

        if (deleteBtn) {
          e.stopPropagation();
          const dateKey = deleteBtn.dataset.date;
          if (confirm(`Are you sure you want to delete the entry for ${UI.parseDateKey(dateKey).toLocaleDateString()}?`)) {
            UI.deleteHistoryEntry(dateKey);
          }
        } else if (entryEl && !e.target.closest('.history-entry__delete')) {
          const dateKey = entryEl.dataset.date;
          UI.showHistoryEditForm(dateKey);
        }
      });
    }

    // Open overlay and render
    console.log('✅ Adding active class to overlay');
    overlay.classList.add('active');
    console.log('🎨 Rendering history...');
    UI.renderHistory();
  },

  showHistoryEditForm(dateKey) {
    const { listView, editView, editDate, editForm, title } = UI.elements.historyOverlay;
    const entries = Store.state.entries || {};
    const entry = entries[dateKey];

    if (!entry) return;

    // Update title and date
    title.textContent = 'Edit Entry';
    const date = UI.parseDateKey(dateKey);
    editDate.textContent = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Populate form with current values
    const form = editForm;
    form.dataset.dateKey = dateKey;

    // Sleep fields
    form.wake.value = entry.wake || '';
    form.rest.value = entry.rest || '';

    // Fitness fields
    form.run.value = entry.run || '';
    form.strength_level.value = entry.strength_level || 0;
    form.skill.value = Array.isArray(entry.skill) ? entry.skill.join(', ') : (entry.skill || '');

    // Mind fields
    form.read_level.value = entry.read_level || 0;
    form.write_level.value = entry.write_level || 0;

    // Spirit fields
    form.meditation.value = entry.meditation ? 'true' : 'false';
    form.mood.value = entry.mood || '';
    form.energy.value = entry.energy || '';

    // Show edit view
    listView.style.display = 'none';
    editView.style.display = 'block';
  },

  hideHistoryEditForm() {
    const { listView, editView, title } = UI.elements.historyOverlay;
    title.textContent = 'History';
    listView.style.display = 'block';
    editView.style.display = 'none';
  },

  saveHistoryEdit() {
    const { editForm, editDate } = UI.elements.historyOverlay;
    let dateKey = editForm.dataset.dateKey;

    // If no dateKey, this is a new entry - get date from the date picker
    if (!dateKey) {
      const datePicker = editDate.querySelector('#add-entry-date');
      if (datePicker && datePicker.value) {
        dateKey = datePicker.value;
      } else {
        UI.notify('Please select a date for the new entry.');
        return;
      }
    }

    const formData = new FormData(editForm);

    // Build updated entry
    const updatedEntry = {
      wake: formData.get('wake') || '',
      rest: formData.get('rest') || '',
      run: parseFloat(formData.get('run')) || 0,
      strength_level: parseInt(formData.get('strength_level')) || 0,
      skill: formData.get('skill') ? formData.get('skill').split(',').map(s => s.trim()).filter(s => s) : [],
      read_level: parseInt(formData.get('read_level')) || 0,
      write_level: parseInt(formData.get('write_level')) || 0,
      meditation: formData.get('meditation') === 'true',
      mood: parseInt(formData.get('mood')) || 0,
      energy: parseInt(formData.get('energy')) || 0,
      quadrant: 0 // Will be recalculated
    };

    // Update the entry in store
    if (!Store.state.entries) Store.state.entries = {};
    Store.state.entries[dateKey] = updatedEntry;

    // Recalculate quadrant
    const { mood, energy } = updatedEntry;
    if (mood > 0 && energy > 0) {
      if (mood > 50 && energy > 50) updatedEntry.quadrant = 1; // High mood, high energy
      else if (mood > 50 && energy <= 50) updatedEntry.quadrant = 2; // High mood, low energy
      else if (mood <= 50 && energy > 50) updatedEntry.quadrant = 3; // Low mood, high energy
      else updatedEntry.quadrant = 4; // Low mood, low energy
    }

    // Save and update
    Store.save();
    UI.hideHistoryEditForm();
    UI.renderHistory(); // Re-render the list

    // Show success feedback
    if (typeof UI.showToast === 'function') {
      UI.showToast(dateKey === editForm.dataset.dateKey ? 'Entry updated successfully!' : 'Entry added successfully!');
    }
  },

  deleteHistoryEntry(dateKey) {
    if (Store.state.entries && Store.state.entries[dateKey]) {
      delete Store.state.entries[dateKey];
      Store.save();
      UI.renderHistory();
      if (typeof UI.showToast === 'function') {
        UI.showToast('Entry deleted successfully!');
      }
    }
  },

  renderHistory() {
    const getWeekOfYear = (date) => {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    };

      const { list, dateRange } = UI.elements.historyOverlay;
      const entries = Store.state.entries || {};
    if (window.DEV_MODE) {
      console.log('📊 Rendering history with entries:', Object.keys(entries));
    }
    const allDates = Object.keys(entries).sort((a, b) => UI.parseDateKey(b) - UI.parseDateKey(a));    // Group entries by month-year and then by week of year
    const groupedEntries = {};
    allDates.forEach(dateKey => {
      const date = UI.parseDateKey(dateKey);
      const monthYear = `${date.toLocaleDateString('en-US', { month: 'long' })} - ${date.getFullYear()}`;
      const weekOfYear = getWeekOfYear(date);

      if (!groupedEntries[monthYear]) {
        groupedEntries[monthYear] = {};
      }
      if (!groupedEntries[monthYear][weekOfYear]) {
        groupedEntries[monthYear][weekOfYear] = [];
      }
      groupedEntries[monthYear][weekOfYear].push(dateKey);
    });

    // Update date range text to show total entries
    if (dateRange) {
      const totalEntries = allDates.length;
      dateRange.textContent = `${totalEntries} ${totalEntries === 1 ? 'entry' : 'entries'}`;
    }

    // Render grouped entries
    if (list) {
      if (allDates.length === 0) {
        list.innerHTML = `
          <div class="history-empty">
            <div class="history-empty__icon">📅</div>
            <p class="history-empty__text">No entries yet. Start tracking your daily progress!</p>
          </div>
        `;
      } else {
        list.innerHTML = Object.keys(groupedEntries).map(monthYear => {
          const monthWeeks = groupedEntries[monthYear];
          const weekKeys = Object.keys(monthWeeks).sort((a, b) => Number(b) - Number(a)); // Sort weeks descending

          return `
            <div class="history-month" data-month="${monthYear}">
              <button class="history-month__header" aria-expanded="true">
                <span class="history-month__title">${monthYear}</span>
                <span class="history-month__toggle" aria-hidden="true">▼</span>
              </button>
              <div class="history-month__content">
                ${weekKeys.map(weekNum => {
                  const weekDates = monthWeeks[weekNum].sort((a, b) => UI.parseDateKey(b) - UI.parseDateKey(a));
                  const weekStart = UI.parseDateKey(weekDates[weekDates.length - 1]);
                  const weekEnd = UI.parseDateKey(weekDates[0]);
                  const weekRange = weekStart.toDateString() === weekEnd.toDateString()
                    ? weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

                  return `
                    <div class="history-week">
                      <div class="history-week__header">Week ${weekNum} • ${weekRange}</div>
                      <div class="history-week__entries">
                        ${weekDates.map(dateKey => {
                          const entry = entries[dateKey];
                          const scores = Scoring.calculateDomainScores(entry);
                          const totalScore = Math.round((scores.sleep + scores.fitness + scores.mind + scores.spirit) / 4);

                          const date = UI.parseDateKey(dateKey);
                          const formattedDate = date.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          });

                          if (window.DEV_MODE) {
                            console.log('📅 Entry', dateKey, 'formatted as:', formattedDate, 'Date object:', date);
                          }

                          return `
                            <div class="history-entry" data-date="${dateKey}">
                              <div class="history-entry__header">
                                <div class="history-entry__date">${formattedDate}</div>
                                <div class="history-entry__total">${totalScore}</div>
                                <button class="history-entry__delete" data-date="${dateKey}" aria-label="Delete entry for ${formattedDate}">
                                  <span aria-hidden="true">×</span>
                                </button>
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
                        }).join('')}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }).join('');
      }
    }
  },

  showAddEntryForm() {
    const { listView, editView, editDate, editForm, title } = UI.elements.historyOverlay;

    // Update title
    title.textContent = 'Add New Entry';

    // Show date picker for selecting the date
    const datePicker = document.createElement('input');
    datePicker.type = 'date';
    datePicker.id = 'add-entry-date';
    datePicker.max = new Date().toISOString().split('T')[0]; // Can't add future dates

    // Clear the form
    editForm.reset();

    // Update the date display
    editDate.innerHTML = '';
    editDate.appendChild(datePicker);

    // Switch to edit view
    listView.style.display = 'none';
    editView.style.display = 'block';

    // Focus on date picker
    datePicker.focus();

    // Handle date selection
    datePicker.addEventListener('change', () => {
      const selectedDate = datePicker.value;
      if (selectedDate) {
        const date = new Date(selectedDate);
        editDate.textContent = date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        datePicker.remove();
      }
    });
  },
};