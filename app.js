let archetypesConfig = {};
let config = {};

function getArchetype(name) {
    if (!config || !config.archetypes) return null;
    return config.archetypes[name] || null;
}

// Global error handlers to surface errors into the page for debugging in locked environments
window.addEventListener('error', function (ev) {
    console.error('Uncaught error', ev.error || ev.message, ev);
    try {
        document.body.innerHTML = `<pre style="color: white; padding: 20px; background: #111; white-space: pre-wrap;">Uncaught error:\n${(ev.error && ev.error.stack) || ev.message}</pre>`;
    } catch (e) { /* ignore */ }
});
window.addEventListener('unhandledrejection', function (ev) {
    console.error('Unhandled rejection', ev.reason);
    try {
        document.body.innerHTML = `<pre style="color: white; padding: 20px; background: #111; white-space: pre-wrap;">Unhandled rejection:\n${ev.reason && ev.reason.stack ? ev.reason.stack : String(ev.reason)}</pre>`;
    } catch (e) { /* ignore */ }
});

const state = {
    path: null, // 'direct', 'archetypes', 'growth'
    
    // Identity & Allocation choices for the quarter
    commitments: {
        sleep: 'balanced', // Key from config.json (e.g., 'earlybird')
        fitnessMode: 'maintain', // Key from config.json (e.g., 'growth')
        fitnessBaseline: 5, // The 'resource' (e.g., 5 km, 30 mins). User-defined.
        reading: 'perspicacity', // Key from config.json
        writing: 'journal', // Key from config.json
        meditation: 'awareness' // Key from config.json
    },

    // Weekly calculated targets, especially for fitness
    weeklyTargets: {
        fitness: 5 // This will be dynamically calculated
    },

    // User-visible targets (reading/exercise/meditation)
    targets: {
        reading: 3,
        exercise: 4,
        meditation: 3
    },

    // Daily logs remain, but structure is slightly cleaner
    logs: {
        // 'YYYY-MM-DD': {
        //   embodiedSleep: true/false,
        //   fitnessLogged: 5.2, // Actual distance/time logged
        //   reading: true/false,
        //   writing: true/false,
        //   meditation: true/false,
        //   burnout: 3 
        // }
    },

    onboardingComplete: false,
    quarter: {}
};

// --- UTILITY FUNCTIONS ---
function saveState() { localStorage.setItem('oceanDropState', JSON.stringify(state)); }
function loadState() {
    const savedState = localStorage.getItem('oceanDropState');
    if (savedState) Object.assign(state, JSON.parse(savedState));
}

// Ensure minimal defaults exist after load
function ensureStateDefaults() {
    if (!state.targets) state.targets = { reading: 3, exercise: 4, meditation: 3 };
    if (!state.logs) state.logs = {};
}
function getQuarterInfo(date = new Date()) {
    const year = date.getFullYear();
    const month = date.getMonth();
    let quarter, startDate, endDate, week;
    // Calculate quarter number and week-in-quarter (1..13)
    const startOfYear = new Date(year, 0, 1);
    const days = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
    const dayOfYear = days + 1;

    if (month < 3) { quarter = 1; startDate = new Date(year, 0, 1); endDate = new Date(year, 2, 31); week = Math.ceil(dayOfYear / 7); }
    else if (month < 6) { quarter = 2; startDate = new Date(year, 3, 1); endDate = new Date(year, 5, 30); week = Math.ceil((dayOfYear - 90) / 7); }
    else if (month < 9) { quarter = 3; startDate = new Date(year, 6, 1); endDate = new Date(year, 8, 30); week = Math.ceil((dayOfYear - 181) / 7); }
    else { quarter = 4; startDate = new Date(year, 9, 1); endDate = new Date(year, 11, 31); week = Math.ceil((dayOfYear - 273) / 7); }

    const options = { month: 'short', day: 'numeric' };
    return { quarter, year, week, startDate: startDate.toLocaleDateString(undefined, options), endDate: endDate.toLocaleDateString(undefined, options) };
}
function getTodaysDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
function getWeekDateStrings(date = new Date()) {
    const week = [];
    const dayOfWeek = date.getDay();
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - dayOfWeek); 

    for (let i = 0; i < 7; i++) {
        const current = new Date(startOfWeek);
        current.setDate(startOfWeek.getDate() + i);
        week.push(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`);
    }
    return week;
}
function showScreen(screenId) {
    document.querySelectorAll('.min-h-screen:not(.hidden)').forEach(screen => screen.classList.add('hidden'));
    const screenToShow = document.getElementById(screenId);
    if (screenToShow) screenToShow.classList.remove('hidden');

    if (screenId === 'gratitude-screen') setupGratitudeScreen();
    if (screenId === 'quarterly-review-screen') setupQuarterlyReviewScreen();
    if (screenId === 'presence-screen') setupPresenceScreen(); 

    document.querySelectorAll('.nav-button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick')?.includes(screenId)) btn.classList.add('active');
    });
}

function calculateWeeklyFitnessTarget() {
    const fitnessMode = state.commitments.fitnessMode;
    const baseline = state.commitments.fitnessBaseline;
    const multiplier = config.fitness[fitnessMode].multiplier;

    // For this prototype, we'll use a simplified logic.
    // A real implementation would average the last 7 days of logs.
    // Here, we'll just apply the multiplier to the baseline for demonstration.
    const lastWeekPerformance = baseline; // Placeholder for real calculation

    const newTarget = lastWeekPerformance * multiplier;
    
    // Round to one decimal place for display
    state.weeklyTargets.fitness = Math.round(newTarget * 10) / 10;
    saveState();
}

// --- ONBOARDING FLOW ---
function selectPath(path) {
    state.path = path;
    saveState();
    if (path === 'direct') showScreen('targets-screen');
    else if (path === 'archetypes') showScreen('archetype-screen');
    else { state.targets = { reading: 4, exercise: 4, meditation: 4 }; renderConfirmationScreen(); showScreen('confirmation-screen'); }
}
function confirmTargets() {
    state.targets.reading = parseInt(document.getElementById('reading-target').value);
    state.targets.exercise = parseInt(document.getElementById('exercise-target').value);
    state.targets.meditation = parseInt(document.getElementById('meditation-target').value);
    saveState();
    renderConfirmationScreen();
    showScreen('confirmation-screen');
}
function selectArchetype(archetypeName) {
    state.archetype = archetypeName;
    const arch = getArchetype(archetypeName);
    if (arch && arch.targets) state.targets = { ...arch.targets };
    else state.targets = { reading: 3, exercise: 4, meditation: 3 };
    saveState();
    renderArchetypeTargetsScreen();
    showScreen('archetype-targets-screen');
}
function renderArchetypeTargetsScreen() {
    const archetype = getArchetype(state.archetype);
    const icon = archetype ? archetype.icon : '✨';
    const name = archetype ? archetype.name : (state.archetype || 'Archetype');
    document.getElementById('archetype-title').innerText = `${icon} ${name} Path`;
    document.getElementById('archetype-targets-content').innerHTML = `
        <div class="flex items-center justify-between mb-4"><span>📚 Reading</span><input type="number" id="arch-reading-target" min="1" max="7" value="${state.targets.reading}" class="w-16 h-12 bg-transparent border-2 border-white/20 rounded-lg text-center text-lg font-light focus:outline-none focus:border-blue-400"></div>
        <div class="flex items-center justify-between mb-4"><span>💪 Exercise</span><input type="number" id="arch-exercise-target" min="1" max="7" value="${state.targets.exercise}" class="w-16 h-12 bg-transparent border-2 border-white/20 rounded-lg text-center text-lg font-light focus:outline-none focus:border-blue-400"></div>
        <div class="flex items-center justify-between"><span>🧘 Meditation</span><input type="number" id="arch-meditation-target" min="1" max="7" value="${state.targets.meditation}" class="w-16 h-12 bg-transparent border-2 border-white/20 rounded-lg text-center text-lg font-light focus:outline-none focus:border-blue-400"></div>
    `;
}
function confirmArchetypeTargets() {
    state.targets.reading = parseInt(document.getElementById('arch-reading-target').value);
    state.targets.exercise = parseInt(document.getElementById('arch-exercise-target').value);
    state.targets.meditation = parseInt(document.getElementById('arch-meditation-target').value);
    saveState();
    renderConfirmationScreen();
    showScreen('confirmation-screen');
}
function renderConfirmationScreen() {
    let summaryHtml = '';
    if (state.path === 'direct') summaryHtml = `<p class="font-light mb-2">Path: <span class="font-normal text-white">Direct Control</span></p><p>Reading: <span class="font-normal text-white">${state.targets.reading}x</span>/wk</p><p>Exercise: <span class="font-normal text-white">${state.targets.exercise}x</span>/wk</p><p>Meditation: <span class="font-normal text-white">${state.targets.meditation}x</span>/wk</p>`;
    else if (state.path === 'archetypes') {
        const archetype = getArchetype(state.archetype);
        const icon = archetype ? archetype.icon : '✨';
        const name = archetype ? archetype.name : (state.archetype || 'Archetype');
        summaryHtml = `<p class="font-light mb-4">You have chosen the</p><p class="text-3xl mb-2">${icon}</p><p class="text-2xl font-normal text-white mb-4">${name}</p><p class="text-sm">R:${state.targets.reading}x, E:${state.targets.exercise}x, M:${state.targets.meditation}x</p>`;
    } else summaryHtml = `<p class="font-light mb-2">Path: <span class="font-normal text-white">Growth Mode</span></p><p class="text-sm">The system will guide your focus.</p>`;
    document.getElementById('path-summary').innerHTML = summaryHtml;
    const quarterInfo = getQuarterInfo();
    document.getElementById('quarter-info').innerText = `Q${quarterInfo.quarter} ${quarterInfo.year} (${quarterInfo.startDate} - ${quarterInfo.endDate})`;
}
function confirmPath() { state.onboardingComplete = true; saveState(); initializeApp(); }

// --- DAILY PRESENCE LOGIC ---
function setupPresenceScreen() {
    const today = getTodaysDateString();
    if (!state.logs[today]) state.logs[today] = { wake: false, rest: false, exercise: false, intensity: 5, reading: false, writing: false, burnout: 1, meditation: false };
    document.getElementById('current-date').innerText = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    document.getElementById('quarter-display').innerText = `Q${state.quarter.quarter} ${state.quarter.year} - Week ${state.quarter.week}`;
    if (state.path === 'archetypes' && state.archetype && archetypesConfig && archetypesConfig[state.archetype]) {
        const archetype = archetypesConfig[state.archetype];
        document.getElementById('archetype-reminder').innerText = `Embodying: ${archetype.icon} ${archetype.name}`;
    } else document.getElementById('archetype-reminder').innerText = `Path: ${state.path ? state.path.charAt(0).toUpperCase() + state.path.slice(1) : '—'}`;
    setupInteractions();
    updateAllDomainsUI();
}
function setupInteractions() {
    document.querySelectorAll('.hold-button').forEach(button => {
        let pressTimer, holdDuration = 0;
        const fill = button.querySelector('.hold-fill');
        const startPress = (e) => {
            e.preventDefault();
            const action = button.dataset.action;
            const todayLog = state.logs[getTodaysDateString()];
            if (todayLog[action]) { handleInteraction(button.dataset.domain, action, false); return; }
            holdDuration = 0; fill.style.height = '0%';
            pressTimer = setInterval(() => {
                holdDuration += 100;
                fill.style.transition = 'height 0.1s linear';
                fill.style.height = `${Math.min(100, (holdDuration / 1000) * 100)}%`;
                if (holdDuration >= 1000) { clearInterval(pressTimer); handleInteraction(button.dataset.domain, action, true); }
            }, 100);
        };
        const cancelPress = () => {
            clearInterval(pressTimer);
            if (holdDuration < 1000 && !button.classList.contains('active')) { fill.style.transition = 'height 0.3s ease-out'; fill.style.height = '0%'; }
        };
        button.onmousedown = startPress; button.onmouseup = cancelPress; button.onmouseleave = cancelPress;
        button.ontouchstart = startPress; button.ontouchend = cancelPress;
    });
    document.querySelectorAll('.slider').forEach(slider => {
        slider.oninput = (e) => handleInteraction(slider.dataset.action, 'value', parseInt(e.target.value));
    });
}
function handleInteraction(domain, action, value) {
    const today = getTodaysDateString();
    if (action === 'value') state.logs[today][domain] = value;
    else state.logs[today][action] = value;
    saveState();
    updateDomainUI(domain);
    updateDailySummary();
}
function updateAllDomainsUI() {
    ['sleep', 'fitness', 'mind', 'spirit'].forEach(updateDomainUI);
    updateDailySummary();
}
function updateDomainUI(domain) {
    const todayLog = state.logs[getTodaysDateString()]; if (!todayLog) return;
    const card = document.querySelector(`.domain-card[data-domain="${domain}"]`); if (!card) return;
    card.querySelectorAll('.domain-btn').forEach(button => {
        const action = button.dataset.action;
        button.classList.toggle('active', todayLog[action]);
        button.querySelector('.hold-fill').style.height = todayLog[action] ? '100%' : '0%';
    });
    card.querySelectorAll('.slider').forEach(slider => {
        slider.value = todayLog[slider.dataset.action] || slider.min;
    });
    updateCompletionRing(domain, todayLog);
}
function updateCompletionRing(domain, log) {
    const ring = document.querySelector(`.completion-ring.domain-${domain}`); if (!ring) return;
    let completed = 0, total = 0;
    if (domain === 'sleep') { total = 2; if (log.wake) completed++; if (log.rest) completed++; }
    if (domain === 'fitness') { total = 1; if (log.exercise) completed++; }
    if (domain === 'mind') { total = 2; if (log.reading) completed++; if (log.writing) completed++; }
    if (domain === 'spirit') { total = 1; if (log.meditation) completed++; }
    const progress = total > 0 ? (completed / total) * 100 : 0;
    ring.style.background = `conic-gradient(var(--ring-color) ${progress * 3.6}deg, transparent 0deg)`;
    ring.dataset.progress = `${Math.round(progress)}%`;
}
function updateDailySummary() {
    const todayLog = state.logs[getTodaysDateString()]; if (!todayLog) return;
    const completed = Object.keys(todayLog).filter(k => ['wake', 'rest', 'exercise', 'reading', 'writing', 'meditation'].includes(k) && todayLog[k]).length;
    document.getElementById('daily-summary').innerText = `${completed}/6 today`;
}

// --- GRATITUDE & REVIEW LOGIC ---
function setupGratitudeScreen() {
    const weekDates = getWeekDateStrings();
    const weeklyLogs = weekDates.map(date => state.logs[date]).filter(Boolean);
    const weeklyTotals = { reading: 0, exercise: 0, meditation: 0, writing: 0, total: 0 };
    weeklyLogs.forEach(log => {
        if (log.reading) weeklyTotals.reading++;
        if (log.exercise) weeklyTotals.exercise++;
        if (log.meditation) weeklyTotals.meditation++;
        if (log.writing) weeklyTotals.writing++;
    });
    weeklyTotals.total = weeklyTotals.reading + weeklyTotals.exercise + weeklyTotals.meditation + weeklyTotals.writing;

    let content = `<div class="glass-card rounded-3xl p-6"><h3 class="text-lg font-light mb-4 text-gradient">This Week's Reflection</h3>`;
    
    if (state.path === 'direct') {
        const metrics = ['reading', 'exercise', 'meditation'];
        content += metrics.map(metric => {
            const completed = weeklyTotals[metric];
            const target = state.targets[metric];
            const percent = target > 0 ? Math.min(100, (completed / target) * 100) : 0;
            const colorVar = `var(--${metric === 'reading' ? 'mind' : metric === 'exercise' ? 'fitness' : 'spirit'}-color)`;
            return `<div class="mb-4"><div class="flex justify-between items-center text-sm mb-2 text-gray-300 font-light"><span>${metric.charAt(0).toUpperCase() + metric.slice(1)}</span><span>${completed}/${target}</span></div><div class="streak-bar"><div class="streak-fill" style="width: ${percent}%; --ring-color: ${colorVar};"></div></div></div>`;
        }).join('');
    } else if (state.path === 'archetypes') {
        const archetype = getArchetype(state.archetype);
        const primaryMetric = archetype && archetype.primary_metric ? archetype.primary_metric : 'exercise';
        const completed = weeklyTotals[primaryMetric];
        const target = state.targets[primaryMetric] || 0;
        const percent = target > 0 ? Math.min(100, (completed / target) * 100) : 0;
        const name = archetype ? archetype.name : (state.archetype || 'Archetype');
        content += `<div class="text-center"><p class="mb-4 font-light text-gray-400">Embodied ${name}</p><div class="completion-ring domain-${primaryMetric === 'reading' ? 'mind' : primaryMetric === 'exercise' ? 'fitness' : 'spirit'}" style="width: 120px; height: 120px; margin: 0 auto; background: conic-gradient(var(--ring-color) ${percent * 3.6}deg, transparent 0deg);" data-progress="${Math.round(percent)}%"></div><p class="mt-4 text-gray-300">${completed}/${target} days</p></div>`;
    } else { // Growth
        const totalPossible = 28;
        const percent = totalPossible > 0 ? Math.min(100, (weeklyTotals.total / totalPossible) * 100) : 0;
        content += `<div class="text-center"><p class="mb-4 font-light text-gray-400">Cumulative Ocean Fill</p><div class="w-full h-32 rounded-2xl ocean-fill relative"><div class="absolute bottom-0 left-0 w-full bg-blue-900/50 rounded-2xl" style="height: ${100 - percent}%;"></div></div><p class="mt-4 text-lg font-light text-gradient glow-text">${Math.round(percent)}%</p></div>`;
    }

    content += '</div><div class="glass-card rounded-3xl p-6 mt-6 text-center"><p class="text-gray-400 font-light">What deepened this week?</p></div>';
    document.getElementById('gratitude-content').innerHTML = content;
}
function setupQuarterlyReviewScreen() {
    document.getElementById('quarter-progress').innerText = `Week ${state.quarter.week} of 13`;
    const quarterLogs = Object.values(state.logs); 
    const daysLogged = quarterLogs.length;
    if (daysLogged === 0) { document.getElementById('embodiment-percent').innerText = '0%'; return; }

    let primaryMetric, title;
    if (state.path === 'archetypes' && state.archetype) {
        const archetype = getArchetype(state.archetype);
        primaryMetric = archetype && archetype.primary_metric ? archetype.primary_metric : 'exercise';
        title = archetype && archetype.name ? `You embodied ${archetype.name}` : `You embodied ${state.archetype}`;
    } else { primaryMetric = 'exercise'; title = 'Quarterly Consistency'; }
    
    const embodiedDays = quarterLogs.filter(log => log[primaryMetric]).length;
    const embodimentPercent = Math.round((embodiedDays / daysLogged) * 100);

    document.getElementById('embodiment-title').innerText = title;
    document.getElementById('embodiment-percent').innerText = `${embodimentPercent}%`;
}

// --- DATA PORTABILITY ---
function exportData() {
    const dataStr = JSON.stringify(state, null, 2); 
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ocean-in-a-drop-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    alert("Data exported successfully!");
}
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (!confirm("Are you sure? This will overwrite all current data.")) { event.target.value = ''; return; }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedState = JSON.parse(e.target.result);
            if (importedState.hasOwnProperty('onboardingComplete') && importedState.hasOwnProperty('logs')) {
                Object.assign(state, importedState);
                saveState();
                alert("Data imported successfully! The app will now reload.");
                location.reload();
            } else { alert("Import failed: Invalid file format."); }
        } catch (error) { alert("Import failed: Could not parse the file."); console.error(error);
        } finally { event.target.value = ''; }
    };
    reader.readAsText(file);
}

function reaffirmPath() { showScreen('presence-screen'); }
function showAdjustWarning() { if (confirm("Are you sure? This will reset your path and targets.")) resetJourney(); }
function resetJourney() {
    state.onboardingComplete = false; state.path = null; state.archetype = null;
    saveState();
    initializeApp();
}

// --- APP INITIALIZATION ---
async function initializeApp() {
    try {
        const response = await fetch('config.json');
        config = await response.json();
        archetypesConfig = config.archetypes;
    } catch (error) {
        console.error("Fatal: Failed to load config.json.", error);
        document.body.innerHTML = `<div style="color: white; text-align: center; padding: 50px;">Could not load app configuration. Make sure config.json is in the same folder.</div>`;
        return;
    }
    loadState();
    ensureStateDefaults();
    state.quarter = getQuarterInfo();
    // Attach DOM event listeners (best-practice instead of inline onclick)
    try { setupDOMListeners(); } catch (e) { console.warn('setupDOMListeners error', e); }
    if (!state.onboardingComplete) showScreen('vision-screen');
    else showScreen('presence-screen');
}
document.addEventListener('DOMContentLoaded', initializeApp);

// Expose commonly-used functions to the global window object so
// inline `onclick` attributes in `index.html` can find them reliably.
// This helps when environments isolate scripts or when debugging.
try {
    window.selectPath = selectPath;
    window.selectArchetype = selectArchetype;
    window.confirmTargets = confirmTargets;
    window.confirmArchetypeTargets = confirmArchetypeTargets;
    window.confirmPath = confirmPath;
    window.showScreen = showScreen;
    window.exportData = exportData;
    window.importData = importData;
    window.reaffirmPath = reaffirmPath;
    window.resetJourney = resetJourney;
    window.showAdjustWarning = showAdjustWarning;
} catch (e) {
    console.warn('Unable to attach globals', e);
}

// Attach listeners to elements using data-action attributes.
function setupDOMListeners() {
    console.log('[drop] setupDOMListeners: attaching delegated click handler');
    document.body.addEventListener('click', function (e) {
        try {
            // Find closest element with a data-action attribute
            const btn = e.target && e.target.closest && e.target.closest('[data-action]');
            if (!btn) return;

            const action = btn.getAttribute('data-action');
            console.log('[drop] click -> action=', action, ' element=', btn);
            if (!action) return;

            switch (action) {
                case 'select-path':
                    selectPath(btn.getAttribute('data-path'));
                    break;
                case 'confirm-targets':
                    confirmTargets();
                    break;
                case 'select-archetype':
                    selectArchetype(btn.getAttribute('data-name'));
                    break;
                case 'confirm-archetype-targets':
                    confirmArchetypeTargets();
                    break;
                case 'confirm-path':
                    confirmPath();
                    break;
                case 'nav':
                    showScreen(btn.getAttribute('data-target'));
                    break;
                case 'reaffirm-path':
                    reaffirmPath();
                    break;
                case 'adjust-journey':
                    showAdjustWarning();
                    break;
                case 'export-data':
                    exportData();
                    break;
                case 'open-import':
                    document.getElementById('import-file').click();
                    break;
                default:
                    console.warn('[drop] Unhandled action', action);
            }
        } catch (err) {
            console.error('[drop] Error handling delegated click', err);
            // Surface the error visibly in the page for debugging
            try { document.body.insertAdjacentHTML('afterbegin', `<pre style="color: #fff; background:#800; padding:12px;">Delegated click handler error:\n${err && err.stack ? err.stack : String(err)}</pre>`); } catch (e) { /* ignore */ }
        }
    });
}