// --- STATE MANAGEMENT ---
const state = {
    path: null,
    commitments: {
        sleep: 'balanced',
        fitnessMode: 'maintain',
        fitnessBaseline: 5,
        reading: 'perspicacity',
        writing: 'journal',
        meditation: 'awareness'
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
}

// --- UTILITY FUNCTIONS ---
function getQuarterInfo(date = new Date()) {
    const year = date.getFullYear();
    const month = date.getMonth();
    let quarter, startDate, endDate;
    if (month < 3) { quarter = 1; startDate = new Date(year, 0, 1); endDate = new Date(year, 2, 31); }
    else if (month < 6) { quarter = 2; startDate = new Date(year, 3, 1); endDate = new Date(year, 5, 30); }
    else if (month < 9) { quarter = 3; startDate = new Date(year, 6, 1); endDate = new Date(year, 8, 30); }
    else { quarter = 4; startDate = new Date(year, 9, 1); endDate = new Date(year, 11, 31); }
    const options = { month: 'short', day: 'numeric' };
    return { quarter, year, startDate: startDate.toLocaleDateString(undefined, options), endDate: endDate.toLocaleDateString(undefined, options) };
}

function showScreen(screenId) {
    document.querySelectorAll('.app-screen').forEach(screen => screen.classList.add('hidden'));
    document.getElementById(screenId)?.classList.remove('hidden');
}

// --- ONBOARDING LOGIC ---
window.selectPath = function(path) {
    state.path = path;
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
}

window.confirmCommitments = function() {
    state.commitments.sleep = document.getElementById('commit-sleep').value;
    state.commitments.fitnessMode = document.getElementById('commit-fitness-mode').value;
    state.commitments.fitnessBaseline = parseFloat(document.getElementById('commit-fitness-baseline').value) || 0;
    state.commitments.reading = document.getElementById('commit-reading').value;
    state.commitments.writing = document.getElementById('commit-writing').value;
    state.commitments.meditation = document.getElementById('commit-meditation').value;

    renderConfirmationScreen();
    showScreen('confirmation-screen');
}

function renderConfirmationScreen() {
    const { commitments } = state;
    const { sleep, fitness, mind } = CONFIG;
    const summaryEl = document.getElementById('path-summary-v2');
    
    summaryEl.innerHTML = `
        <p>${sleep[commitments.sleep].icon} <strong>Sleep:</strong> ${sleep[commitments.sleep].name}</p>
        <p>${fitness[commitments.fitnessMode].icon} <strong>Fitness:</strong> ${fitness[commitments.fitnessMode].name} (${commitments.fitnessBaseline} units)</p>
        <p>${mind.reading[commitments.reading].icon} <strong>Reading:</strong> ${mind.reading[commitments.reading].name}</p>
        <p>${mind.writing[commitments.writing].icon} <strong>Writing:</strong> ${mind.writing[commitments.writing].name}</p>
    `;

    const quarterInfo = getQuarterInfo();
    document.getElementById('quarter-info-v2').innerText = `Q${quarterInfo.quarter} ${quarterInfo.year} (${quarterInfo.startDate} - ${quarterInfo.endDate})`;
}

window.startJourney = function() {
    state.onboardingComplete = true;
    saveState();
    initializeApp();
}

// --- INITIALIZATION ---
function initializeApp() {
    loadState();
    state.quarter = getQuarterInfo();

    if (state.onboardingComplete) {
        // TODO: Build and show the main presence screen
        showScreen('presence-screen');
    } else {
        showScreen('vision-screen');
    }
}

document.addEventListener('DOMContentLoaded', initializeApp);

