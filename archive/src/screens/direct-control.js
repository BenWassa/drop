// Direct Control screen - lets users set per-aspect tiers directly
(function(){
    function setupDirectControl() {
        // Populate inputs with existing commitments if present
        const c = state.commitments || {};
        const fitness = c.fitness || { cardio: 'medium', strength: 'medium', skills: 'medium' };
        document.getElementById('direct-fitness-cardio').value = fitness.cardio;
        document.getElementById('direct-fitness-strength').value = fitness.strength;
        document.getElementById('direct-fitness-skills').value = fitness.skills;

        document.getElementById('direct-mind-reading').value = c.reading || 'perspicacity';
        document.getElementById('direct-mind-writing').value = c.writing || 'editorial';

        document.getElementById('direct-spirit-stress').value = c.stress || 'medium';
        document.getElementById('direct-spirit-meditation').value = c.meditation || 'introspection';

        // Sleep times
        if (c.customWakeTime) {
            document.getElementById('direct-wake-time').value = c.customWakeTime;
        }
        // Continue handler
        const cont = document.getElementById('direct-continue');
        cont.onclick = function(){
            // Save selections into state.commitments
            state.commitments = state.commitments || {};
            state.commitments.fitness = {
                cardio: document.getElementById('direct-fitness-cardio').value,
                strength: document.getElementById('direct-fitness-strength').value,
                skills: document.getElementById('direct-fitness-skills').value
            };
            state.commitments.reading = document.getElementById('direct-mind-reading').value;
            state.commitments.writing = document.getElementById('direct-mind-writing').value;
            state.commitments.stress = document.getElementById('direct-spirit-stress').value;
            state.commitments.meditation = document.getElementById('direct-spirit-meditation').value;

            const wake = document.getElementById('direct-wake-time').value;
            const sleep = document.getElementById('direct-sleep-time').value;
            if (wake) state.commitments.customWakeTime = wake;
            if (sleep) state.commitments.customSleepTime = sleep;

            // Recompute derived values
            if (!state.weeklyTargets) state.weeklyTargets = {};
            if (!state.weeklyTargets.fitness) state.weeklyTargets.fitness = state.commitments.fitnessBaseline || 0;
            calculateWeeklyFitnessTarget();
            saveState();
            renderConfirmationScreen();
            showScreen('confirmation-screen');
        };
    }

    if (window.registerScreen) window.registerScreen('direct-control-screen', setupDirectControl);
    window.setupDirectControl = setupDirectControl;
})();
