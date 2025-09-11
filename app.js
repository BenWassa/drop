// --- DEVELOPER TOGGLE ---
// Set to true to enable the in-app dev toolbar and verbose logging
let DEV_MODE = true; // <<< Toggle developer mode here

// --- STATE MANAGEMENT ---
const state = {
    path: null,
    selectedArchetype: null,
    commitments: {
        sleep: 'balanced', fitnessMode: 'maintain', fitnessBaseline: 5, fitnessUnit: 'km',
        reading: 'perspicacity', writing: 'journal', meditation: 'awareness'
    },
    weeklyTargets: { fitness: 5 },
    logs: {},
    onboardingComplete: false,
    quarter: {}
};

function saveState() { localStorage.setItem('oceanDropState_v2', JSON.stringify(state)); }
function loadState() {
    const savedState = localStorage.getItem('oceanDropState_v2');
    if (savedState) Object.assign(state, JSON.parse(savedState));
    state.commitments.fitnessUnit = state.commitments.fitnessUnit || 'km';
    state.selectedArchetype = state.selectedArchetype || null;
}

// --- UTILITY FUNCTIONS ---
function getQuarterInfo(date = new Date()) {
    const year = date.getFullYear(); const month = date.getMonth();
    const startOfYear = new Date(year, 0, 1);
    const days = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
    let week = Math.ceil(days / 7);
    let quarter, startDate, endDate;
    if (month < 3) { quarter = 1; startDate = new Date(year, 0, 1); endDate = new Date(year, 2, 31); }
    else if (month < 6) { quarter = 2; startDate = new Date(year, 3, 1); endDate = new Date(year, 5, 30); week -= 13; }
    else if (month < 9) { quarter = 3; startDate = new Date(year, 6, 1); endDate = new Date(year, 8, 30); week -= 26; }
    else { quarter = 4; startDate = new Date(year, 9, 1); endDate = new Date(year, 11, 31); week -= 39; }
    const options = { month: 'short', day: 'numeric' };
    return { quarter, year, week, startDate: startDate.toLocaleDateString(undefined, options), endDate: endDate.toLocaleDateString(undefined, options) };
}
function getTodaysDateString() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function getWeekDates(date = new Date()) {
    const week = []; const dayOfWeek = date.getDay();
    const startOfWeek = new Date(date); startOfWeek.setDate(date.getDate() - dayOfWeek);
    for (let i = 0; i < 7; i++) {
        const current = new Date(startOfWeek); current.setDate(startOfWeek.getDate() + i);
        week.push(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`);
    }
    return week;
}

function applyArchetype(key) {
    const arch = ARCHETYPES[key];
    if (!arch) return;
    Object.assign(state.commitments, arch.commitments);
}

function applyGrowthSuggestions() {
    let readingCount = 0, writingCount = 0;
    const today = new Date();
    for (let i = 1; i <= 91; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const log = state.logs[dateStr];
        if (log?.reading) readingCount++;
        if (log?.writing) writingCount++;
    }
    const readingAvg = readingCount / 13;
    const writingAvg = writingCount / 13;
    state.commitments.sleep = state.commitments.sleep || 'Earlybird';
    state.commitments.fitnessMode = state.commitments.fitnessMode || 'maintain';
    state.commitments.reading = readingAvg >= CONFIG.mind.reading.perspicacity.target ? 'erudition' : 'perspicacity';
    state.commitments.writing = writingAvg >= CONFIG.mind.writing.editorial.target ? 'treatise'
        : writingAvg >= CONFIG.mind.writing.journal.target ? 'editorial' : 'journal';
}

function setupSettingsScreen() {
    document.getElementById('settings-fitness-baseline').value = state.commitments.fitnessBaseline;
    document.getElementById('settings-fitness-unit').value = state.commitments.fitnessUnit;
}

window.saveSettings = function() {
    state.commitments.fitnessBaseline = parseFloat(document.getElementById('settings-fitness-baseline').value) || 0;
    state.commitments.fitnessUnit = document.getElementById('settings-fitness-unit').value.trim();
    calculateWeeklyFitnessTarget();
    saveState();
    renderAllDomainCards();
    debugLog('saveSettings ->', state.commitments.fitnessBaseline, state.commitments.fitnessUnit);
    showScreen('presence-screen');
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
    // Dynamically render screens that need fresh data
    if (screenId === 'presence-screen') setupPresenceScreen();
    if (screenId === 'gratitude-screen') setupGratitudeScreen();
    if (screenId === 'quarterly-review-screen') setupQuarterlyReviewScreen();
    if (screenId === 'commitments-screen') populateCommitmentsScreen();
    if (screenId === 'confirmation-screen') renderConfirmationScreen();
    if (screenId === 'settings-screen') setupSettingsScreen();
}

// --- ONBOARDING LOGIC ---
window.selectPath = function(path) {
    state.path = path;
    debugLog('selectPath ->', path);
    if (path === 'archetypes') {
        state.selectedArchetype = Object.keys(ARCHETYPES)[0];
    } else {
        state.selectedArchetype = null;
    }
    if (path === 'growth') {
        applyGrowthSuggestions();
    }
    populateCommitmentsScreen();
    showScreen('commitments-screen');
}
function populateCommitmentsScreen() {
    const { sleep, fitness, mind, spirit } = CONFIG;
    document.getElementById('commit-sleep').innerHTML = Object.entries(sleep).map(([k, v]) => `<option value="${k}">${v.icon} ${v.name} (${v.wake} / ${v.sleep})</option>`).join('');
    document.getElementById('commit-fitness-mode').innerHTML = Object.entries(fitness).map(([k, v]) => `<option value="${k}">${v.icon} ${v.name}</option>`).join('');
    document.getElementById('commit-reading').innerHTML = Object.entries(mind.reading).map(([k, v]) => `<option value="${k}">${v.icon} ${v.name} Reading (${v.target}x/wk)</option>`).join('');
    document.getElementById('commit-writing').innerHTML = Object.entries(mind.writing).map(([k, v]) => `<option value="${k}">${v.icon} ${v.name} Writing (${v.target}x/wk)</option>`).join('');
    document.getElementById('commit-meditation').innerHTML = Object.entries(spirit.meditation).map(([k, v]) => `<option value="${k}">${v.icon} ${v.name}</option>`).join('');

    const archDiv = document.getElementById('archetype-select');
    if (state.path === 'archetypes') {
        archDiv.classList.remove('hidden');
        const select = document.getElementById('archetype-choice');
        select.innerHTML = Object.entries(ARCHETYPES).map(([k, v]) => `<option value="${k}">${v.name}</option>`).join('');
        if (!state.selectedArchetype) state.selectedArchetype = Object.keys(ARCHETYPES)[0];
        select.value = state.selectedArchetype;
        select.onchange = (e) => { state.selectedArchetype = e.target.value; applyArchetype(state.selectedArchetype); populateCommitmentsScreen(); };
        applyArchetype(state.selectedArchetype);
    } else {
        archDiv.classList.add('hidden');
    }

    document.getElementById('commit-sleep').value = state.commitments.sleep;
    document.getElementById('commit-fitness-mode').value = state.commitments.fitnessMode;
    document.getElementById('commit-fitness-baseline').value = state.commitments.fitnessBaseline;
    document.getElementById('commit-fitness-unit').value = state.commitments.fitnessUnit;
    document.getElementById('commit-reading').value = state.commitments.reading;
    document.getElementById('commit-writing').value = state.commitments.writing;
    document.getElementById('commit-meditation').value = state.commitments.meditation;
}
window.confirmCommitments = function() {
    state.commitments.sleep = document.getElementById('commit-sleep').value;
    state.commitments.fitnessMode = document.getElementById('commit-fitness-mode').value;
    state.commitments.fitnessBaseline = parseFloat(document.getElementById('commit-fitness-baseline').value) || 0;
    state.commitments.fitnessUnit = document.getElementById('commit-fitness-unit').value.trim();
    state.commitments.reading = document.getElementById('commit-reading').value;
    state.commitments.writing = document.getElementById('commit-writing').value;
    state.commitments.meditation = document.getElementById('commit-meditation').value;
    if (state.commitments.reading === 'erudition' && state.commitments.writing === 'treatise') {
        const ok = confirm('This is an ambitious Mind commitment for the quarter! Are you sure you want to proceed?');
        if (!ok) return;
    }
    debugLog('confirmCommitments ->', JSON.stringify(state.commitments));
    renderConfirmationScreen();
    showScreen('confirmation-screen');
}
function renderConfirmationScreen() {
    const { commitments } = state; const { sleep, fitness, mind } = CONFIG;
    document.getElementById('path-summary-v2').innerHTML = `
        <p>${sleep[commitments.sleep].icon} <strong>Sleep:</strong> ${sleep[commitments.sleep].name}</p>
        <p>${fitness[commitments.fitnessMode].icon} <strong>Fitness:</strong> ${fitness[commitments.fitnessMode].name} (${commitments.fitnessBaseline} ${commitments.fitnessUnit})</p>
        <p>${mind.reading[commitments.reading].icon} <strong>Reading:</strong> ${mind.reading[commitments.reading].name}</p>
        <p>${mind.writing[commitments.writing].icon} <strong>Writing:</strong> ${mind.writing[commitments.writing].name}</p>
    `;
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
    const embodiedDays = Object.values(state.logs).filter(log => log.embodiedSleep).length;
    const embodimentPercent = totalDays > 0 ? Math.round((embodiedDays / totalDays) * 100) : 0;

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
function initializeApp() {
    loadState();
    state.quarter = getQuarterInfo();
    debugLog('initializeApp -> quarter', state.quarter);

    if (DEV_MODE) ensureDevToolbar();

    if (state.onboardingComplete) {
        calculateWeeklyFitnessTarget();
        showScreen('presence-screen');
    } else {
        showScreen('vision-screen');
    }
}

document.addEventListener('DOMContentLoaded', initializeApp);

// --- DEV TOOLING ---
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
