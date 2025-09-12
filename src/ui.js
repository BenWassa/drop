function setupSettingsScreen() {
    document.getElementById('settings-fitness-baseline').value = state.commitments.fitnessBaseline;
    document.getElementById('settings-fitness-unit').value = state.commitments.fitnessUnit;
}

window.saveSettings = function() {
    const btn = document.querySelector('#settings-screen button[onclick="saveSettings()"]');
    if (btn) { btn.classList.add('btn-loading'); btn.disabled = true; }
    state.commitments.fitnessBaseline = parseFloat(document.getElementById('settings-fitness-baseline').value) || 0;
    state.commitments.fitnessUnit = document.getElementById('settings-fitness-unit').value.trim();
    calculateWeeklyFitnessTarget();
    saveState();
    renderAllDomainCards();
    debugLog('saveSettings ->', state.commitments.fitnessBaseline, state.commitments.fitnessUnit);
    if (btn) { setTimeout(() => { btn.classList.remove('btn-loading'); btn.disabled = false; }, 450); }
    showToast('Settings saved');
    showScreen('presence-screen');
};

// Registry for screen-specific render/setup handlers. Keeps showScreen simple and
// makes it easier to move handlers into separate modules later.
const ScreenRegistry = {
    'presence-screen': () => setupPresenceScreen(),
    'gratitude-screen': () => setupGratitudeScreen(),
    'quarterly-review-screen': () => setupQuarterlyReviewScreen(),
    'commitments-screen': () => populateCommitmentsScreen(),
    'confirmation-screen': () => renderConfirmationScreen(),
    'settings-screen': () => setupSettingsScreen()
};

function showScreen(screenId) {
    const current = document.querySelector('.app-screen:not(.hidden)');
    const next = document.getElementById(screenId);

    if (current && current !== next) {
        current.classList.add('fade-out');
        setTimeout(() => {
            current.classList.add('hidden');
            current.classList.remove('fade-out', 'active-screen');
        }, 200);
    }

    next?.classList.remove('hidden');
    next?.classList.add('active-screen', 'fade-in');
    setTimeout(() => next?.classList.remove('fade-in'), 200);

    document.querySelectorAll('.nav-button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick')?.includes(screenId)) btn.classList.add('active');
    });

    if (screenId === 'confirmation-screen') {
        const card = document.querySelector('#confirmation-screen .floating-card');
        card?.classList.add('animate-pop');
        setTimeout(() => card?.classList.remove('animate-pop'), 300);
    }

    debugLog('showScreen ->', screenId);
    // Dynamically render screens that need fresh data using the registry.
    const renderer = ScreenRegistry[screenId];
    if (renderer) renderer();
}

// --- ONBOARDING LOGIC ---
window.selectPath = function(path) {
    state.path = path;
    debugLog('selectPath ->', path);

    // Initialize selected identities based on path
    if (!state.selectedIdentities) {
        state.selectedIdentities = {
            sleep: 'earlybird',
            fitness: 'endurance',
            mind: 'reader',
            spirit: 'mindful'
        };
    }

    if (path === 'growth') {
        // Simple Tracking path - minimal defaults
        state.selectedIdentities = {
            sleep: 'earlybird',
            fitness: 'endurance',
            mind: 'reader',
            spirit: 'mindful'
        };
    }

    populateCommitmentsScreen();
    showScreen('commitments-screen');
}
function populateCommitmentsScreen() {
    // Initialize selected identities if not set
    if (!state.selectedIdentities) {
        state.selectedIdentities = {
            sleep: 'earlybird',
            fitness: 'endurance',
            mind: 'reader',
            spirit: 'mindful'
        };
    }

    // Update button states based on current selections
    updateIdentityButtonStates();

    // Hide custom sleep input by default
    document.getElementById('custom-sleep-input').classList.add('hidden');
}

function updateIdentityButtonStates() {
    // Clear all active states
    document.querySelectorAll('.identity-button').forEach(btn => {
        btn.classList.remove('active', 'bg-blue-500/30', 'border-blue-400');
        btn.classList.add('bg-slate-800/30', 'border-white/20');
    });

    // Set active state for selected identities
    const { selectedIdentities } = state;

    if (selectedIdentities.sleep) {
        const sleepBtn = document.querySelector(`[onclick="selectSleepIdentity('${selectedIdentities.sleep}')"]`);
        if (sleepBtn) {
            sleepBtn.classList.add('active', 'bg-blue-500/30', 'border-blue-400');
            sleepBtn.classList.remove('bg-slate-800/30', 'border-white/20');
        }
    }

    if (selectedIdentities.fitness) {
        const fitnessBtn = document.querySelector(`[onclick="selectFitnessIdentity('${selectedIdentities.fitness}')"]`);
        if (fitnessBtn) {
            fitnessBtn.classList.add('active', 'bg-blue-500/30', 'border-blue-400');
            fitnessBtn.classList.remove('bg-slate-800/30', 'border-white/20');
        }
    }

    if (selectedIdentities.mind) {
        const mindBtn = document.querySelector(`[onclick="selectMindIdentity('${selectedIdentities.mind}')"]`);
        if (mindBtn) {
            mindBtn.classList.add('active', 'bg-blue-500/30', 'border-blue-400');
            mindBtn.classList.remove('bg-slate-800/30', 'border-white/20');
        }
    }

    if (selectedIdentities.spirit) {
        const spiritBtn = document.querySelector(`[onclick="selectSpiritIdentity('${selectedIdentities.spirit}')"]`);
        if (spiritBtn) {
            spiritBtn.classList.add('active', 'bg-blue-500/30', 'border-blue-400');
            spiritBtn.classList.remove('bg-slate-800/30', 'border-white/20');
        }
    }
}

// Identity selection functions
window.selectSleepIdentity = function(identity) {
    state.selectedIdentities.sleep = identity;
    updateIdentityButtonStates();

    const customInput = document.getElementById('custom-sleep-input');
    if (identity === 'custom') {
        customInput.classList.remove('hidden');
    } else {
        customInput.classList.add('hidden');
    }

    debugLog('selectSleepIdentity ->', identity);
}

window.selectFitnessIdentity = function(identity) {
    state.selectedIdentities.fitness = identity;
    updateIdentityButtonStates();
    debugLog('selectFitnessIdentity ->', identity);
}

window.selectMindIdentity = function(identity) {
    state.selectedIdentities.mind = identity;
    updateIdentityButtonStates();
    debugLog('selectMindIdentity ->', identity);
}

window.selectSpiritIdentity = function(identity) {
    state.selectedIdentities.spirit = identity;
    updateIdentityButtonStates();
    debugLog('selectSpiritIdentity ->', identity);
}
window.confirmCommitments = function() {
    const { selectedIdentities } = state;

    // Handle custom sleep time
    if (selectedIdentities.sleep === 'custom') {
        const customTime = document.getElementById('custom-wake-time').value;
        if (!customTime) {
            showToast('Please set a custom wake-up time');
            return;
        }
        // Store custom time in commitments
        state.commitments.customWakeTime = customTime;
    }

    // Apply selected identities to commitments based on path
    if (state.path === 'identities') {
        // Domain Identities path - use selected identities directly
        applyDomainIdentitiesToCommitments(selectedIdentities);
    } else if (state.path === 'direct') {
        // Direct Control path - use selected identities as defaults but allow full customization
        applyDomainIdentitiesToCommitments(selectedIdentities);
    } else if (state.path === 'growth') {
        // Simple Tracking path - minimal setup, just track without goals
        applySimpleTrackingSetup(selectedIdentities);
    }

    debugLog('confirmCommitments ->', JSON.stringify(state.commitments));
    renderConfirmationScreen();
    showScreen('confirmation-screen');
}

function applyDomainIdentitiesToCommitments(identities) {
    const { sleep, fitness, mind, spirit } = CONFIG;

    // Apply sleep identity
    if (identities.sleep && sleep[identities.sleep]) {
        state.commitments.sleep = identities.sleep;
    }

    // Apply fitness identity
    if (identities.fitness && fitness[identities.fitness]) {
        state.commitments.fitnessMode = identities.fitness;
        // Set default baseline based on identity
        const fitnessDefaults = {
            endurance: { baseline: 5, unit: 'km' },
            strength: { baseline: 3, unit: 'sessions' },
            mobility: { baseline: 4, unit: 'sessions' },
            custom: { baseline: 3, unit: 'units' }
        };
        const defaults = fitnessDefaults[identities.fitness] || fitnessDefaults.custom;
        state.commitments.fitnessBaseline = defaults.baseline;
        state.commitments.fitnessUnit = defaults.unit;
    }

    // Apply mind identity
    if (identities.mind) {
        const mindDefaults = {
            reader: { reading: 'comprehensive', writing: 'journal' },
            writer: { reading: 'casual', writing: 'article' },
            learner: { reading: 'comprehensive', writing: 'journal' },
            custom: { reading: 'casual', writing: 'journal' }
        };
        const defaults = mindDefaults[identities.mind] || mindDefaults.custom;
        state.commitments.reading = defaults.reading;
        state.commitments.writing = defaults.writing;
    }

    // Apply spirit identity
    if (identities.spirit) {
        const spiritDefaults = {
            mindful: 'mindfulness',
            reflective: 'reflection',
            connected: 'gratitude',
            custom: 'mindfulness'
        };
        state.commitments.meditation = spiritDefaults[identities.spirit] || spiritDefaults.custom;
    }
}

function applySimpleTrackingSetup(identities) {
    // Simple tracking - minimal commitments, just enable tracking
    applyDomainIdentitiesToCommitments(identities);

    // Mark as simple tracking mode
    state.commitments.simpleTracking = true;

    // Reduce baseline expectations for simple tracking
    state.commitments.fitnessBaseline = Math.max(1, state.commitments.fitnessBaseline * 0.6);
}
function renderConfirmationScreen() {
    const { commitments, selectedIdentities } = state;
    const { sleep, fitness, mind } = CONFIG;

    let summaryHTML = '';

    // Sleep summary
    if (commitments.sleep && sleep[commitments.sleep]) {
        const sleepConfig = sleep[commitments.sleep];
        summaryHTML += `<p>${sleepConfig.icon} <strong>Sleep:</strong> ${sleepConfig.name}`;
        if (commitments.customWakeTime) {
            summaryHTML += ` (Wake: ${commitments.customWakeTime})`;
        } else {
            summaryHTML += ` (${sleepConfig.wake})`;
        }
        summaryHTML += '</p>';
    }

    // Fitness summary
    if (commitments.fitnessMode && fitness[commitments.fitnessMode]) {
        const fitnessConfig = fitness[commitments.fitnessMode];
        summaryHTML += `<p>${fitnessConfig.icon} <strong>Fitness:</strong> ${fitnessConfig.name} (${commitments.fitnessBaseline} ${commitments.fitnessUnit})</p>`;
    }

    // Mind summary
    if (commitments.reading && mind.reading[commitments.reading]) {
        const readingConfig = mind.reading[commitments.reading];
        summaryHTML += `<p>${readingConfig.icon} <strong>Reading:</strong> ${readingConfig.name}</p>`;
    }
    if (commitments.writing && mind.writing[commitments.writing]) {
        const writingConfig = mind.writing[commitments.writing];
        summaryHTML += `<p>${writingConfig.icon} <strong>Writing:</strong> ${writingConfig.name}</p>`;
    }

    // Spirit summary
    if (commitments.meditation) {
        summaryHTML += `<p>🧘 <strong>Spirit:</strong> ${commitments.meditation}</p>`;
    }

    // Path-specific messaging
    if (state.path === 'growth') {
        summaryHTML += '<p class="text-green-400 mt-2"><em>Simple tracking mode - focus on consistency, not goals</em></p>';
    } else if (state.path === 'identities') {
        summaryHTML += '<p class="text-purple-400 mt-2"><em>Domain identities selected - you can adjust these anytime</em></p>';
    }

    document.getElementById('path-summary-v2').innerHTML = summaryHTML;

    const q = getQuarterInfo();
    document.getElementById('quarter-info-v2').innerText = `Q${q.quarter} ${q.year} (${q.startDate} - ${q.endDate})`;
}
window.startJourney = function() {
    state.onboardingComplete = true;
    debugLog('startJourney -> onboardingComplete = true');
    calculateWeeklyFitnessTarget(); // Calculate initial target
    saveState();
    initializeApp();
}

// --- DAILY PRESENCE LOGIC ---
function setupPresenceScreen() {
    const today = getTodaysDateString();
    if (!state.logs[today]) {
        state.logs[today] = { embodiedSleep: false, fitnessLogged: null, reading: false, writing: false, meditation: false, burnout: 3 };
        debugLog('setupPresenceScreen -> seeded log for', today);
    }
    document.getElementById('presence-date').innerText = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    document.getElementById('presence-quarter').innerText = `Q${state.quarter.quarter} ${state.quarter.year} - Week ${state.quarter.week}`;
    renderAllDomainCards();
}

function renderAllDomainCards() {
    renderSleepCard();
    renderFitnessCard();
    renderMindCard();
    renderSpiritCard();
}

function renderSleepCard() {
    const todayLog = state.logs[getTodaysDateString()];
    const sleepCommitment = CONFIG.sleep[state.commitments.sleep];
    const content = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-light">${sleepCommitment.icon} ${sleepCommitment.name}</h3>
            <span class="text-sm font-light text-gray-400">${sleepCommitment.wake} / ${sleepCommitment.sleep}</span>
        </div>
        <button onclick="logPresence('embodiedSleep', ${!todayLog.embodiedSleep})"
            class="glass-button w-full py-4 rounded-xl text-lg font-light ripple ${todayLog.embodiedSleep ? 'active' : ''}">
            Embody Rhythm
        </button>
    `;
    document.getElementById('sleep-card-content').innerHTML = content;
}

function renderFitnessCard() {
    const todayLog = state.logs[getTodaysDateString()];
    const fitnessMode = CONFIG.fitness[state.commitments.fitnessMode];
    const content = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-light">${fitnessMode.icon} ${fitnessMode.name}</h3>
            <span class="text-sm font-light text-gradient">Target: ${state.weeklyTargets.fitness} ${state.commitments.fitnessUnit}</span>
        </div>
        <div class="flex items-center space-x-4">
            <input type="number" id="fitness-log-input" class="w-full bg-slate-800/50 border border-white/20 rounded-lg p-3 text-base font-light focus:outline-none focus:border-blue-400"
                   value="${todayLog.fitnessLogged || ''}" placeholder="Log units...">
            <button onclick="logFitness()" class="glass-button px-6 py-3 rounded-xl text-lg font-light ripple">Log</button>
        </div>
    `;
    document.getElementById('fitness-card-content').innerHTML = content;
}
window.logFitness = function() {
    const value = parseFloat(document.getElementById('fitness-log-input').value);
    logPresence('fitnessLogged', isNaN(value) ? null : value);
}

function renderMindCard() {
    const todayLog = state.logs[getTodaysDateString()];
    const reading = CONFIG.mind.reading[state.commitments.reading];
    const writing = CONFIG.mind.writing[state.commitments.writing];
    const content = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-light">🧠 Mind</h3>
        </div>
        <div class="grid grid-cols-2 gap-4">
            <button onclick="logPresence('reading', ${!todayLog.reading})" class="glass-button py-4 rounded-xl font-light ripple ${todayLog.reading ? 'active' : ''}">
                ${reading.icon} ${reading.name}
            </button>
            <button onclick="logPresence('writing', ${!todayLog.writing})" class="glass-button py-4 rounded-xl font-light ripple ${todayLog.writing ? 'active' : ''}">
                ${writing.icon} ${writing.name}
            </button>
        </div>
    `;
    document.getElementById('mind-card-content').innerHTML = content;
}

function renderSpiritCard() {
    const todayLog = state.logs[getTodaysDateString()];
    const meditation = CONFIG.spirit.meditation[state.commitments.meditation];
    const content = `
         <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-light">${meditation.icon} ${meditation.name}</h3>
             <button onclick="logPresence('meditation', ${!todayLog.meditation})" class="glass-button px-8 py-3 rounded-xl font-light ripple ${todayLog.meditation ? 'active' : ''}">
                Meditate
            </button>
        </div>
        <div class="flex items-center space-x-4 mt-6">
            <span class="text-sm font-light text-gray-400">Burnout</span>
            <input type="range" min="1" max="5" value="${todayLog.burnout}" onchange="logPresence('burnout', parseInt(this.value))" class="slider flex-1 domain-spirit">
            <span class="text-sm font-light w-4 text-center">${todayLog.burnout}</span>
        </div>
    `;
    document.getElementById('spirit-card-content').innerHTML = content;
}

function logPresence(key, value) {
    const today = getTodaysDateString();
    state.logs[today][key] = value;
    debugLog('logPresence ->', today, key, '=>', value);
    saveState();
    renderAllDomainCards(); // Re-render to update UI state
    try { showToast(value ? 'Logged' : 'Updated'); } catch {}
}

function calculateWeeklyFitnessTarget() {
    const lastWeek = getWeekDates(new Date(new Date().setDate(new Date().getDate() - 7)));
    const loggedValues = lastWeek.map(date => state.logs[date]?.fitnessLogged).filter(val => val != null && val > 0);

    const lastWeekPerformance = loggedValues.length > 0
        ? loggedValues.reduce((a, b) => a + b, 0) / loggedValues.length
        : state.commitments.fitnessBaseline;

    const multiplier = CONFIG.fitness[state.commitments.fitnessMode].multiplier;
    const newTarget = lastWeekPerformance * multiplier;
    state.weeklyTargets.fitness = Math.round(newTarget * 10) / 10;
    debugLog('calculateWeeklyFitnessTarget -> avg:', lastWeekPerformance, 'mode*:', multiplier, 'target:', state.weeklyTargets.fitness);
}


// --- GRATITUDE & REVIEW LOGIC ---
function setupGratitudeScreen() {
    const weekDates = getWeekDates();
    const weeklyLogs = weekDates.map(date => state.logs[date]);

    let readingCount = 0, writingCount = 0;
    weeklyLogs.forEach(log => {
        if (log?.reading) readingCount++;
        if (log?.writing) writingCount++;
    });

    const readingTarget = CONFIG.mind.reading[state.commitments.reading].target;
    const writingTarget = CONFIG.mind.writing[state.commitments.writing].target;
    const readingPercent = Math.min(100, (readingCount / readingTarget) * 100);
    const writingPercent = Math.min(100, (writingCount / writingTarget) * 100);

    // Burnout visualization
    const burnoutHTML = `
        <div class="flex justify-between items-center text-sm mb-2 text-gray-300 font-light">
            <span>Burnout Trend</span>
        </div>
        <div class="flex justify-around items-center h-10 glass rounded-lg p-2">
            ${weekDates.map((date, i) => {
                const burnout = state.logs[date]?.burnout || 0;
                const height = burnout > 0 ? (burnout / 5) * 100 : 0;
                const color = burnout > 3 ? 'bg-red-500' : burnout > 2 ? 'bg-yellow-500' : 'bg-green-500';
                return `<div class="w-4 h-full flex items-end justify-center"><div style="height: ${height}%" class="${color} w-2 rounded-full"></div></div>`;
            }).join('')}
        </div>`;

    const container = document.getElementById('gratitude-content');
    container.innerHTML = `
        <div class="glass-card rounded-3xl p-6">
            <h3 class="text-lg font-light mb-4 text-gradient">This Week's Mind Practice</h3>
            <div class="mb-4">
                <div class="flex justify-between items-center text-sm mb-2 text-gray-300 font-light"><span>Reading</span><span>${readingCount}/${readingTarget}</span></div>
                <div class="streak-bar"><div class="streak-fill" data-target="${readingPercent}" style="width:0%; --ring-color: var(--mind-color);"></div></div>
            </div>
            <div>
                <div class="flex justify-between items-center text-sm mb-2 text-gray-300 font-light"><span>Writing</span><span>${writingCount}/${writingTarget}</span></div>
                <div class="streak-bar"><div class="streak-fill" data-target="${writingPercent}" style="width:0%; --ring-color: var(--mind-color);"></div></div>
            </div>
        </div>
        <div class="glass-card rounded-3xl p-6">${burnoutHTML}</div>`;

    if (readingCount === 0 && writingCount === 0) {
        container.innerHTML += `<p class="text-center text-gray-400 font-light">Log your daily actions to see your weekly reflection here.</p>`;
    }

    requestAnimationFrame(() => {
        container.querySelectorAll('.streak-fill').forEach(el => {
            const target = el.getAttribute('data-target');
            el.style.width = `${target}%`;
        });
    });

    debugLog('setupGratitudeScreen -> counts', { readingCount, writingCount, weekDates });
}

function setupQuarterlyReviewScreen() {
    const q = getQuarterInfo();
    document.getElementById('review-quarter-progress').innerText = `Week ${q.week} of 13`;

    const totalDays = Object.keys(state.logs).length;
    if (totalDays === 0) {
        document.getElementById('review-content').innerHTML = `<p class="text-center text-gray-400 font-light">Log your daily actions to see your quarter review here.</p>`;
        debugLog('setupQuarterlyReviewScreen -> no data');
        return;
    }

    const embodiedDays = Object.values(state.logs).filter(log => log.embodiedSleep).length;
    const embodimentPercent = Math.round((embodiedDays / totalDays) * 100);

    document.getElementById('review-content').innerHTML = `
        <div class="space-y-6">
            <div class="glass-card rounded-3xl p-8 text-center"><h3 class="text-xl font-light mb-6 text-gradient">Sleep Embodiment</h3><div class="text-6xl font-light mb-4 text-gradient glow-text">${embodimentPercent}%</div><p class="text-gray-400 font-light">of days</p></div>
            <div class="space-y-4">
                <button onclick="showScreen('vision-screen')" class="glass-button w-full py-4 rounded-2xl text-lg font-light ripple border-yellow-500/30">Adjust Journey</button>
            </div>
            <p class="text-xs text-gray-400 text-center">A new quarter is a great time to <strong>export your data</strong> for backup.</p>
        </div>`;
    debugLog('setupQuarterlyReviewScreen -> embodimentPercent', embodimentPercent);
}

// --- INITIALIZATION ---
function debugLog(...args) {
    if (!DEV_MODE) return;
    try { console.log('[DEV]', ...args); } catch (e) {}
    const panel = document.getElementById('debug-messages');
    if (panel) {
        const line = document.createElement('div');
        line.className = 'text-xs text-gray-300';
        line.textContent = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
        panel.appendChild(line);
        panel.scrollTop = panel.scrollHeight;
    }
}

function ensureDevToolbar() {
    if (document.getElementById('dev-toolbar')) return;
    const wrap = document.createElement('div');
    wrap.id = 'dev-toolbar';
    wrap.className = 'fixed top-2 left-2 z-50 glass-card rounded-xl p-3 shadow-lg w-[min(92vw,720px)]';
    wrap.innerHTML = `
        <div class="flex items-center justify-between mb-2">
            <div class="text-sm font-light text-gradient">DEV</div>
            <div class="flex items-center space-x-2">
                <label class="text-xs text-gray-300 font-light">onboarding:</label>
                <button id="dev-toggle-onboard" class="glass-button px-2 py-1 rounded text-xs font-light">${state.onboardingComplete ? 'Complete' : 'Incomplete'}</button>
                <button id="dev-reset" class="glass-button px-2 py-1 rounded text-xs font-light">Reset</button>
            </div>
        </div>
        <div class="flex flex-wrap gap-2 mb-2">
            <button data-screen="vision-screen" class="glass-button px-2 py-1 rounded text-xs font-light">Vision</button>
            <button data-screen="commitments-screen" class="glass-button px-2 py-1 rounded text-xs font-light">Commitments</button>
            <button data-screen="confirmation-screen" class="glass-button px-2 py-1 rounded text-xs font-light">Confirm</button>
            <button data-screen="presence-screen" class="glass-button px-2 py-1 rounded text-xs font-light">Presence</button>
            <button data-screen="gratitude-screen" class="glass-button px-2 py-1 rounded text-xs font-light">Gratitude</button>
            <button data-screen="quarterly-review-screen" class="glass-button px-2 py-1 rounded text-xs font-light">Review</button>
            <button id="dev-recalc" class="glass-button px-2 py-1 rounded text-xs font-light">Recalc Target</button>
        </div>
        <div id="debug-messages" class="max-h-40 overflow-auto bg-slate-900/40 rounded p-2 border border-white/10"></div>
    `;
    document.body.appendChild(wrap);

    wrap.querySelectorAll('[data-screen]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-screen');
            if (id === 'commitments-screen') populateCommitmentsScreen();
            if (id === 'confirmation-screen') renderConfirmationScreen();
            if (id === 'presence-screen') setupPresenceScreen();
            if (id === 'gratitude-screen') setupGratitudeScreen();
            if (id === 'quarterly-review-screen') setupQuarterlyReviewScreen();
            showScreen(id);
        });
    });

    document.getElementById('dev-reset').addEventListener('click', () => {
        localStorage.removeItem('oceanDropState_v2');
        debugLog('DEV reset -> localStorage cleared');
        location.reload();
    });
    document.getElementById('dev-recalc').addEventListener('click', () => {
        calculateWeeklyFitnessTarget();
        saveState();
        renderAllDomainCards();
        debugLog('DEV recalc -> new target', state.weeklyTargets.fitness);
    });
    document.getElementById('dev-toggle-onboard').addEventListener('click', (e) => {
        state.onboardingComplete = !state.onboardingComplete;
        e.currentTarget.textContent = state.onboardingComplete ? 'Complete' : 'Incomplete';
        saveState();
        debugLog('DEV toggle onboarding ->', state.onboardingComplete);
    });
}

// --- LIGHTWEIGHT UI FEEDBACK & SETTINGS HELPERS ---
window.showToast = function(message = 'Saved') {
    const toast = document.getElementById('app-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('hidden');
    toast.classList.add('toast-show');
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => {
        toast.classList.remove('toast-show');
        toast.classList.add('hidden');
    }, 1600);
};

window.showBanner = function(message, type = 'info') {
    const banner = document.getElementById('app-banner');
    if (!banner) return;
    banner.textContent = message;
    banner.setAttribute('data-type', type);
    banner.classList.remove('hidden');
};

window.resetData = function() {
    try { localStorage.removeItem('oceanDropState_v2'); } catch {}
    state.logs = {};
    state.onboardingComplete = false;
    state.meta = { storageOk: true, lastError: null };
    showToast('Data reset');
    initializeApp();
};

document.addEventListener('DOMContentLoaded', () => {
    if (state?.meta && state.meta.storageOk === false) {
        showBanner('Storage unavailable. Changes may not persist.', 'warning');
    }
});
