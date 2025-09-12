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

// --- OURA API AUTHENTICATION LOGIC ---

// Helper to return the exact redirect URI we registered with Oura.
// Accepts multiple local hostnames and preserves the port when present.
function getRedirectUri() {
    const host = window.location.hostname;
    const port = window.location.port;

    // Common local dev hosts — include any port the dev server uses
    if (host === '127.0.0.1' || host === 'localhost' || host === '0.0.0.0') {
        const p = port || '5500';
        return `http://${host}:${p}/index.html`;
    }

    // GitHub pages production host
    if (host === 'benwassa.github.io') {
        return 'https://benwassa.github.io/drop/';
    }

    // Fallback: use the exact current origin + pathname (useful for unusual setups)
    return window.location.origin + window.location.pathname;
}

// Generates a secure random string for the PKCE flow
function generateCodeVerifier() {
    const randomBytes = window.crypto.getRandomValues(new Uint8Array(32));
    return btoa(String.fromCharCode(...randomBytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Hashes the verifier string to create the code challenge
async function generateCodeChallenge(verifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hash = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(hash))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// 1. Kicks off the authentication process (UPDATED with 'state' parameter)
window.redirectToOuraAuth = async function() {
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    
    // ADD THIS: Generate a random string for the state parameter
    const stateValue = generateCodeVerifier(); 

    // Temporarily save both the verifier and the state value
    sessionStorage.setItem('oura_code_verifier', verifier);
    sessionStorage.setItem('oura_state', stateValue); // ADD THIS

    const redirectUri = getRedirectUri();

    const params = new URLSearchParams({
        client_id: OURA_CONFIG.CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'sleep activity readiness',
        state: stateValue, // ADD THIS
        code_challenge: challenge,
        code_challenge_method: 'S256'
    });

    window.location.href = `${OURA_CONFIG.AUTH_URL}?${params.toString()}`;
}

// 2. Handles the redirect back from Oura after user approval (UPDATED with 'state' check)
async function handleOuraRedirect() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const returnedState = urlParams.get('state'); // ADD THIS

    // This is not an Oura redirect if there's no code.
    if (!code) {
        return; 
    }
    
    // --- ADD THIS ENTIRE SECURITY CHECK BLOCK ---
    const originalState = sessionStorage.getItem('oura_state');
    if (!originalState || returnedState !== originalState) {
        console.error("Oura redirect failed: State mismatch. Possible CSRF attack.");
        showBanner("Oura connection failed due to a security check. Please try again.", "error");
        // Clean up immediately
        sessionStorage.removeItem('oura_code_verifier');
        sessionStorage.removeItem('oura_state');
        history.replaceState(null, '', window.location.pathname);
        return;
    }
    // --- END OF SECURITY CHECK BLOCK ---

    const verifier = sessionStorage.getItem('oura_code_verifier');
    if (!verifier) {
        console.error("Oura redirect failed: Code verifier not found.");
        showBanner("Oura connection failed. Please try again.", "error");
        return;
    }

    try {
        const tokenData = await exchangeCodeForToken(code, verifier);
        
        state.oura.accessToken = tokenData.access_token;
        state.oura.refreshToken = tokenData.refresh_token;
        state.oura.tokenExpiresAt = Date.now() + (tokenData.expires_in * 1000);
        
        saveState();
        showToast("Oura connected successfully!");

    } catch (error) {
        console.error("Error exchanging Oura code for token:", error);
        showBanner("Could not connect to Oura. Please try again.", "error");
    } finally {
        // Clean up the URL and session storage
        sessionStorage.removeItem('oura_code_verifier');
        sessionStorage.removeItem('oura_state'); // ADD THIS
        history.replaceState(null, '', window.location.pathname);
        showScreen('settings-screen');
    }
}

// 3. Exchanges the temporary code for a long-lived access token (UPDATED)
async function exchangeCodeForToken(code, verifier) {
    const redirectUri = getRedirectUri(); // Use our new helper function
    // POST to our Netlify function which will exchange the code for us.
    const proxyUrl = '/.netlify/functions/oura-token-proxy';

    const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code, verifier: verifier, redirect_uri: redirectUri })
    });

    if (!response.ok) {
        const text = await response.text();
        let errMsg = response.statusText;
        try { const parsed = JSON.parse(text); errMsg = parsed.error || parsed.message || text; } catch(e) {}
        throw new Error(`Proxy token exchange failed: ${errMsg}`);
    }

    return response.json();
}

// 4. Function to disconnect from Oura
window.disconnectFromOura = function() {
    if (confirm("Are you sure you want to disconnect from Oura?")) {
        state.oura = { accessToken: null, refreshToken: null, tokenExpiresAt: null };
        saveState();
        showToast("Oura disconnected.");
        renderOuraCard(); // Re-render the settings card
    }
}