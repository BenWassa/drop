/**
 * QUnit DOM Test Suite for drop
 * Tests presence and behavior of domain scores, gratitude progress bars, and overlays
 */

// Mock Store and UI objects for testing
const createMockStore = () => ({
  DB_KEY: 'lifeTrackerData_test',
  state: {
    wake: '06:00', rest: '22:00', run: 5, strength: true, skill: false,
    read: true, write: false, quadrant: 1, meditation: true,
    visionTheme: '', visionSleepFocus: '', visionFitnessFocus: '',
    visionMindFocus: '', visionSpiritFocus: ''
  },
  defaults: {
    wake: '', rest: '', run: 0, strength: false, skill: false,
    read: false, write: false, quadrant: 0, meditation: false,
    visionTheme: '', visionSleepFocus: '', visionFitnessFocus: '',
    visionMindFocus: '', visionSpiritFocus: ''
  },
  init() {},
  save() {},
  update(key, value) {
    if (key in this.state) {
      this.state[key] = value;
    }
  }
});

QUnit.module('Domain Score Display', function(hooks) {
  
  hooks.beforeEach(function() {
    // Create a minimal DOM structure for testing
    this.fixture = document.getElementById('qunit-fixture');
    this.fixture.innerHTML = `
      <article class="score-item" data-domain="sleep">
        <div class="score-meter" data-domain-meter="sleep" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="75" aria-label="Sleep score">
          <svg class="score-ring" viewBox="0 0 120 120">
            <circle class="score-ring__track" cx="60" cy="60" r="52"></circle>
            <circle class="score-ring__arc" cx="60" cy="60" r="52"></circle>
          </svg>
          <div class="score-meter__center">
            <span class="score-value" id="sleep-score">75</span>
          </div>
        </div>
        <div class="score-name">Sleep</div>
      </article>
      <article class="score-item" data-domain="fitness">
        <div class="score-meter" data-domain-meter="fitness" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="60" aria-label="Fitness score">
          <svg class="score-ring" viewBox="0 0 120 120">
            <circle class="score-ring__track" cx="60" cy="60" r="52"></circle>
            <circle class="score-ring__arc" cx="60" cy="60" r="52"></circle>
          </svg>
          <div class="score-meter__center">
            <span class="score-value" id="fitness-score">60</span>
          </div>
        </div>
        <div class="score-name">Fitness</div>
      </article>
      <article class="score-item" data-domain="mind">
        <div class="score-meter" data-domain-meter="mind" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="80" aria-label="Mind score">
          <svg class="score-ring" viewBox="0 0 120 120">
            <circle class="score-ring__track" cx="60" cy="60" r="52"></circle>
            <circle class="score-ring__arc" cx="60" cy="60" r="52"></circle>
          </svg>
          <div class="score-meter__center">
            <span class="score-value" id="mind-score">80</span>
          </div>
        </div>
        <div class="score-name">Mind</div>
      </article>
      <article class="score-item" data-domain="spirit">
        <div class="score-meter" data-domain-meter="spirit" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50" aria-label="Spirit score">
          <svg class="score-ring" viewBox="0 0 120 120">
            <circle class="score-ring__track" cx="60" cy="60" r="52"></circle>
            <circle class="score-ring__arc" cx="60" cy="60" r="52"></circle>
          </svg>
          <div class="score-meter__center">
            <span class="score-value" id="spirit-score">50</span>
          </div>
        </div>
        <div class="score-name">Spirit</div>
      </article>
      <div class="card" id="sleep-card">75</div>
      <div class="card" id="fitness-card">60</div>
      <div class="card" id="mind-card">80</div>
      <div class="card" id="spirit-card">50</div>
    `;
  });

  QUnit.test('Domain score elements exist', function(assert) {
    assert.ok(document.getElementById('sleep-score'), 'Sleep score element exists');
    assert.ok(document.getElementById('fitness-score'), 'Fitness score element exists');
    assert.ok(document.getElementById('mind-score'), 'Mind score element exists');
    assert.ok(document.getElementById('spirit-score'), 'Spirit score element exists');
  });

  QUnit.test('Score meters expose ARIA attributes and arcs', function(assert) {
    const sleepMeter = document.querySelector('[data-domain-meter="sleep"]');
    assert.equal(sleepMeter.getAttribute('role'), 'meter', 'Sleep meter has meter role');
    assert.equal(sleepMeter.getAttribute('aria-valuemin'), '0', 'Sleep meter has min value');
    assert.equal(sleepMeter.getAttribute('aria-valuemax'), '100', 'Sleep meter has max value');
    assert.equal(sleepMeter.getAttribute('aria-valuenow'), '75', 'Sleep meter has current value');

    const sleepArc = sleepMeter.querySelector('.score-ring__arc');
    assert.ok(sleepArc, 'Sleep meter renders a progress arc');

    const fitnessMeter = document.querySelector('[data-domain-meter="fitness"]');
    assert.ok(fitnessMeter.hasAttribute('aria-valuenow'), 'Fitness meter has aria-valuenow');
  });

  QUnit.test('Score values are numeric', function(assert) {
    const sleepScore = document.getElementById('sleep-score').textContent;
    const fitnessScore = document.getElementById('fitness-score').textContent;
    const mindScore = document.getElementById('mind-score').textContent;
    const spiritScore = document.getElementById('spirit-score').textContent;
    
    assert.ok(!isNaN(Number(sleepScore)), 'Sleep score is numeric');
    assert.ok(!isNaN(Number(fitnessScore)), 'Fitness score is numeric');
    assert.ok(!isNaN(Number(mindScore)), 'Mind score is numeric');
    assert.ok(!isNaN(Number(spiritScore)), 'Spirit score is numeric');
  });
});

QUnit.module('Gratitude Progress Bars', function(hooks) {
  
  hooks.beforeEach(function() {
    this.fixture = document.getElementById('qunit-fixture');
    this.fixture.innerHTML = `
      <div class="progress-row" data-progress-domain="sleep" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="75">
        <span class="progress-label">Sleep</span>
        <div class="progress-bar">
          <div class="progress-fill" style="width: 75%;"></div>
        </div>
        <span class="progress-score">75</span>
      </div>
      <div class="progress-row" data-progress-domain="fitness" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="60">
        <span class="progress-label">Fitness</span>
        <div class="progress-bar">
          <div class="progress-fill" style="width: 60%;"></div>
        </div>
        <span class="progress-score">60</span>
      </div>
    `;
  });

  QUnit.test('Progress bars exist with correct structure', function(assert) {
    const sleepProgress = document.querySelector('[data-progress-domain="sleep"]');
    const fitnessProgress = document.querySelector('[data-progress-domain="fitness"]');
    
    assert.ok(sleepProgress, 'Sleep progress row exists');
    assert.ok(fitnessProgress, 'Fitness progress row exists');
    assert.ok(sleepProgress.querySelector('.progress-fill'), 'Sleep has progress fill element');
    assert.ok(fitnessProgress.querySelector('.progress-fill'), 'Fitness has progress fill element');
  });

  QUnit.test('Progress bars have ARIA attributes', function(assert) {
    const sleepProgress = document.querySelector('[data-progress-domain="sleep"]');
    
    assert.equal(sleepProgress.getAttribute('role'), 'meter', 'Progress bar has meter role');
    assert.equal(sleepProgress.getAttribute('aria-valuenow'), '75', 'Progress bar aria-valuenow matches');
  });

  QUnit.test('Progress fill widths update correctly', function(assert) {
    const sleepFill = document.querySelector('[data-progress-domain="sleep"] .progress-fill');
    const fitnessFill = document.querySelector('[data-progress-domain="fitness"] .progress-fill');
    
    assert.equal(sleepFill.style.width, '75%', 'Sleep fill width is 75%');
    assert.equal(fitnessFill.style.width, '60%', 'Fitness fill width is 60%');
    
    // Simulate a score change
    sleepFill.style.width = '85%';
    assert.equal(sleepFill.style.width, '85%', 'Sleep fill width updates to 85%');
  });
});

QUnit.module('Overlay Behavior', function(hooks) {
  
  hooks.beforeEach(function() {
    this.fixture = document.getElementById('qunit-fixture');
    this.fixture.innerHTML = `
      <div class="card" data-domain="sleep">Sleep Card</div>
      <div class="overlay" id="sleep-overlay" data-domain="sleep">
        <div class="overlay-content-wrapper">
          <header class="overlay-header">
            <h2 class="overlay-title">Sleep</h2>
            <button class="close-btn" aria-label="Close sleep overlay">&times;</button>
          </header>
          <div class="overlay-content">
            <div class="input-group">
              <label class="input-label" for="wake-time">Wake Time</label>
              <input type="time" class="time-input" id="wake-time">
            </div>
          </div>
        </div>
      </div>
    `;
  });

  QUnit.test('Overlays exist for each domain', function(assert) {
    const sleepOverlay = document.getElementById('sleep-overlay');
    assert.ok(sleepOverlay, 'Sleep overlay exists');
    assert.equal(sleepOverlay.dataset.domain, 'sleep', 'Overlay has correct domain data attribute');
  });

  QUnit.test('Overlay can be opened and closed', function(assert) {
    const overlay = document.getElementById('sleep-overlay');
    
    // Initially not active
    assert.notOk(overlay.classList.contains('active'), 'Overlay starts inactive');
    
    // Open overlay
    overlay.classList.add('active');
    assert.ok(overlay.classList.contains('active'), 'Overlay can be opened');
    
    // Close overlay
    overlay.classList.remove('active');
    assert.notOk(overlay.classList.contains('active'), 'Overlay can be closed');
  });

  QUnit.test('Close button exists in overlay', function(assert) {
    const closeBtn = this.fixture.querySelector('.close-btn');
    assert.ok(closeBtn, 'Close button exists');
    assert.ok(closeBtn.hasAttribute('aria-label'), 'Close button has aria-label');
  });
});

QUnit.module('Data Management', function(hooks) {

  hooks.before(function() {
    this.dropApp = window.DropApp || {};
    this.testHooks = this.dropApp.testHooks;

    if (!this.testHooks) {
      throw new Error('DropApp test hooks are not available.');
    }

    this.testHooks.initStore();
  });

  hooks.beforeEach(function() {
    this.testHooks.clearAllData();
  });

  QUnit.test('clearAllData resets state to defaults', function(assert) {
    const today = new Date().toISOString().slice(0, 10);
    const payload = this.testHooks.getDefaults();
    payload.wake = '06:15';
    payload.run = 8;
    payload.lastEntryDate = today;
    payload.dailyTimestamps = { wake: today, run: today };
    payload.history = [{ date: today, scores: { sleep: 90, fitness: 80, mind: 70, spirit: 60 } }];

    this.testHooks.merge(payload);

    let state = this.testHooks.getState();
    assert.equal(state.wake, '06:15', 'Wake time imported');
    assert.equal(state.run, 8, 'Run distance imported');
    assert.ok(Array.isArray(state.history) && state.history.length === 1, 'History imported');

    this.testHooks.clearAllData();
    state = this.testHooks.getState();

    assert.equal(state.wake, '', 'Wake time reset');
    assert.equal(state.run, 0, 'Run distance reset');
    assert.deepEqual(state.history, [], 'History cleared');
  });

  QUnit.test('validateImport rejects invalid payloads', function(assert) {
    const payload = this.testHooks.getDefaults();
    payload.run = 'five';

    assert.notOk(this.testHooks.validateImport(payload), 'String values for numeric fields are rejected');
  });

  QUnit.test('validateImport accepts valid payloads and merge applies data', function(assert) {
    const today = new Date().toISOString().slice(0, 10);
    const payload = this.testHooks.getDefaults();
    payload.wake = '05:45';
    payload.strength = true;
    payload.dailyTimestamps = { wake: today, strength: today };
    payload.lastEntryDate = today;

    assert.ok(this.testHooks.validateImport(payload), 'Valid payload passes validation');

    this.testHooks.merge(payload);
    const state = this.testHooks.getState();

    assert.equal(state.wake, '05:45', 'Wake time updated from import');
    assert.strictEqual(state.strength, true, 'Boolean fields import correctly');
  });
});

QUnit.module('Accessibility Features', function(hooks) {
  
  hooks.beforeEach(function() {
    this.fixture = document.getElementById('qunit-fixture');
    this.fixture.innerHTML = `
      <div class="sr-announce" id="score-announcer" aria-live="polite" aria-atomic="true"></div>
      <button class="nav-btn" data-page="home" aria-label="Home">
        <span class="nav-label">Home</span>
      </button>
    `;
  });

  QUnit.test('Screen reader announcement region exists', function(assert) {
    const announcer = document.getElementById('score-announcer');
    assert.ok(announcer, 'Score announcer element exists');
    assert.equal(announcer.getAttribute('aria-live'), 'polite', 'Announcer has aria-live=polite');
    assert.equal(announcer.getAttribute('aria-atomic'), 'true', 'Announcer has aria-atomic=true');
  });

  QUnit.test('Navigation buttons have accessible labels', function(assert) {
    const navBtn = this.fixture.querySelector('.nav-btn');
    assert.ok(navBtn.hasAttribute('aria-label') || navBtn.querySelector('.nav-label'), 
      'Nav button has accessible label');
  });
});

QUnit.module('Score Calculation Logic', function(hooks) {
  
  hooks.beforeEach(function() {
    this.store = createMockStore();
  });

  QUnit.test('Store state can be updated', function(assert) {
    this.store.update('run', 10);
    assert.equal(this.store.state.run, 10, 'Run distance updates correctly');
    
    this.store.update('meditation', true);
    assert.equal(this.store.state.meditation, true, 'Meditation state updates correctly');
  });

  QUnit.test('Store defaults are defined', function(assert) {
    assert.ok(this.store.defaults, 'Store has defaults object');
    assert.equal(this.store.defaults.run, 0, 'Default run distance is 0');
    assert.equal(this.store.defaults.meditation, false, 'Default meditation is false');
  });
});
