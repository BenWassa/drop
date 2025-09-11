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
    quarter: {}
};

function saveState() {
    localStorage.setItem('oceanDropState_v2', JSON.stringify(state));
}

function loadState() {
    const savedState = localStorage.getItem('oceanDropState_v2');
    if (savedState) Object.assign(state, JSON.parse(savedState));
    state.commitments.fitnessUnit = state.commitments.fitnessUnit || 'km';
    state.selectedArchetype = state.selectedArchetype || null;
}