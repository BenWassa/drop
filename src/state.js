// --- DEVELOPER TOGGLE ---
// Set to true to enable the in-app dev toolbar and verbose logging
let DEV_MODE = false; // <<< Toggle developer mode here

// --- STATE MANAGEMENT ---
const state = {
    path: null,
    selectedArchetype: null,
    commitments: {
        sleep: 'balanced',
        fitnessMode: 'maintain',
        fitnessBaseline: 5,
        fitnessUnit: 'km',
        reading: 'perspicacity',
        writing: 'journal',
        meditation: 'awareness'
    },
    weeklyTargets: { fitness: 5 },
    logs: {},
    onboardingComplete: false,
    quarter: {},
    meta: {
        storageOk: true,
        lastError: null
    }
};

function saveState() {
    try {
        localStorage.setItem('oceanDropState_v2', JSON.stringify(state));
        state.meta.storageOk = true;
        state.meta.lastError = null;
        if (typeof window.showToast === 'function') window.showToast('Saved');
    } catch (e) {
        state.meta.storageOk = false;
        state.meta.lastError = e?.message || String(e);
        if (typeof window.showBanner === 'function') window.showBanner('Storage unavailable. Changes may not persist.', 'warning');
    }
}

function loadState() {
    try {
        const savedState = localStorage.getItem('oceanDropState_v2');
        if (savedState) Object.assign(state, JSON.parse(savedState));
        state.meta.storageOk = true;
        state.meta.lastError = null;
    } catch (e) {
        // Corrupted data or storage failure; reset volatile parts and continue
        try { localStorage.removeItem('oceanDropState_v2'); } catch {}
        state.logs = {};
        state.onboardingComplete = false;
        state.meta.storageOk = false;
        state.meta.lastError = e?.message || String(e);
        if (typeof window.showBanner === 'function') window.showBanner('We reset corrupted data. You can start fresh.', 'warning');
    }
    state.commitments.fitnessUnit = state.commitments.fitnessUnit || 'km';
    state.selectedArchetype = state.selectedArchetype || null;
}
