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
        const quadrantLabel = this.describeQuadrant(quadrant);
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
    this.updateDateDisplay();
  },

  /**
   * Update date display to show current "sleep day"
   * If viewing history (Store.state.currentDate is set), show that date
   * Otherwise show current sleep day with note if in early morning hours
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

      // Otherwise show current sleep day
      const now = new Date();
      const hours = now.getHours();
      const sleepDay = Store.getSleepDay();
      const dateObj = new Date(sleepDay + 'T12:00:00');

      let dateText = dateObj.toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric'
      });

      // Add note if we're in early morning hours (logging to "yesterday")
      if (hours < 4) {
        dateText += ` (early ${now.toLocaleDateString('en-US', { weekday: 'short' })}`;
      }

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
  }
};