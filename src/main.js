async function initializeApp() { // Make the function async
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