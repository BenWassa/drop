// --- UTILITY & LOGIC FUNCTIONS ---
function getQuarterInfo(date = new Date()) {
    const year = date.getFullYear();
    const month = date.getMonth();
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
