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
    // Look back over the last 21 days (3 weeks)
    const today = new Date();
    const past21Days = [];
    for (let i = 0; i < 21; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        past21Days.push(getDateString(d));
    }

    // Collect logged fitness values
    const loggedValues = past21Days
        .map(date => state.logs[date]?.fitnessLogged)
        .filter(val => val != null && val > 0);

    // Calculate rolling average
    const avgPerformance = loggedValues.length > 0
        ? loggedValues.reduce((a, b) => a + b, 0) / loggedValues.length
        : state.commitments.fitnessBaseline;

    const multiplier = CONFIG.fitness[state.commitments.fitnessMode].multiplier;

    // Raw new target
    let newTarget = avgPerformance * multiplier;

    // Clamp within 80–120% of baseline
    const minTarget = state.commitments.fitnessBaseline * 0.8;
    const maxTarget = state.commitments.fitnessBaseline * 1.2;
    newTarget = Math.max(minTarget, Math.min(maxTarget, newTarget));

    state.weeklyTargets.fitness = Math.round(newTarget * 10) / 10;
    debugLog('calculateWeeklyFitnessTarget -> avg(21d):', avgPerformance, 'target:', state.weeklyTargets.fitness);
}

function getDateString(date) {
    return date.toISOString().split('T')[0];
}

// --- OURA API AUTHENTICATION LOGIC (Client-Side Implicit Flow) ---

// Helper to return the exact redirect URI we registered with Oura.
function getRedirectUri() {
    const host = window.location.hostname;
    const port = window.location.port;

    // For local development
    if (host === '127.0.0.1' || host === 'localhost' || host === '0.0.0.0') {
        const p = port || '5500';
        return `http://${host}:${p}/index.html`;
    }
    
    // For Netlify deployment
    if (host.endsWith('netlify.app')) {
        return `https://${host}/`;
    }

    // For GitHub Pages production host
    if (host === 'benwassa.github.io') {
        return 'https://benwassa.github.io/drop/';
    }

    // Fallback to the current location
    return window.location.origin + window.location.pathname;
}

// 1. Kicks off the authentication process
window.redirectToOuraAuth = async function() {
    // Generate a random string for the state parameter for security
    const stateValue = Math.random().toString(36).substring(2);
    sessionStorage.setItem('oura_state', stateValue);

    const redirectUri = getRedirectUri();

    const params = new URLSearchParams({
        client_id: OURA_CONFIG.CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: 'token', // Use 'token' for client-side flow
        scope: 'sleep activity readiness',
        state: stateValue,
    });

    window.location.href = `${OURA_CONFIG.AUTH_URL}?${params.toString()}`;
}

// 2. Handles the redirect back from Oura after user approval
async function handleOuraRedirect() {
    // For the client-side flow, the token is in the URL fragment (#)
    if (!window.location.hash.includes('access_token')) {
        return; // Not an Oura token redirect
    }

    const fragmentParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = fragmentParams.get('access_token');
    const returnedState = fragmentParams.get('state');
    const expiresIn = fragmentParams.get('expires_in');

    const originalState = sessionStorage.getItem('oura_state');

    // Clean up session storage and URL immediately
    sessionStorage.removeItem('oura_state');
    history.replaceState(null, '', window.location.pathname);

    // Security check: Ensure the state parameter matches
    if (!originalState || returnedState !== originalState) {
        console.error("Oura redirect failed: State mismatch. Possible CSRF attack.");
        showBanner("Oura connection failed due to a security check. Please try again.", "error");
        return;
    }

    if (!accessToken) {
        console.error("Oura redirect failed: No access token provided.");
        showBanner("Oura connection failed. Please try again.", "error");
        return;
    }

    // Store the token and its expiration time
    state.oura.accessToken = accessToken;
    state.oura.refreshToken = null; // No refresh token in this flow
    state.oura.tokenExpiresAt = Date.now() + (parseInt(expiresIn, 10) * 1000);

    saveState();
    showToast("Oura connected successfully!");
    showScreen('settings-screen');
}

// 3. Function to disconnect from Oura
window.disconnectFromOura = function() {
    if (confirm("Are you sure you want to disconnect from Oura?")) {
        state.oura = { accessToken: null, refreshToken: null, tokenExpiresAt: null };
        saveState();
        showToast("Oura disconnected.");
        renderOuraCard(); // Re-render the settings card
    }
}