// Commitments screen module - registers setup handler with the central ScreenRegistry
(function(){
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
        const custom = document.getElementById('custom-sleep-input');
        if (custom) custom.classList.add('hidden');
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

    // Expose selection functions globally for onclick handlers in HTML
    window.selectSleepIdentity = function(identity) {
        state.selectedIdentities.sleep = identity;
        updateIdentityButtonStates();

        const customInput = document.getElementById('custom-sleep-input');
        if (identity === 'custom') {
            customInput?.classList.remove('hidden');
        } else {
            customInput?.classList.add('hidden');
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

    // Register the setup handler with the screen registry if available
    if (window.registerScreen) {
        window.registerScreen('commitments-screen', populateCommitmentsScreen);
    }

    // Keep the function globally available for backward compatibility
    window.populateCommitmentsScreen = populateCommitmentsScreen;
    window.updateIdentityButtonStates = updateIdentityButtonStates;
})();
