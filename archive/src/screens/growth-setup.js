// Growth setup screen - user inputs current levels; app suggests targets
(function(){
    function setupGrowth() {
        // Pre-fill with recent averages if available
        const agg = { cardio: '', strength: '', skills: '', reading: '', writing: '', meditation: '' };
        // Try to derive from last week logs
        const week = getWeekDates();
        const logs = week.map(d => state.logs[d] || {});
        const cardioVals = logs.map(l => l.fitnessLogged).filter(v => v != null);
        if (cardioVals.length) agg.cardio = Math.round(cardioVals.reduce((a,b)=>a+b,0)/cardioVals.length*10)/10;
        document.getElementById('growth-cardio').value = agg.cardio;
        document.getElementById('growth-strength').value = agg.strength;
        document.getElementById('growth-skills').value = agg.skills;
        document.getElementById('growth-reading').value = agg.reading;
        document.getElementById('growth-writing').value = agg.writing;
        document.getElementById('growth-meditation').value = agg.meditation;

        const cont = document.getElementById('growth-continue');
        cont.onclick = function(){
            // Save current levels into state.commitments as baseline
            state.commitments = state.commitments || {};
            state.commitments.fitnessBaseline = parseFloat(document.getElementById('growth-cardio').value) || state.commitments.fitnessBaseline || 0;
            state.commitments.fitness = state.commitments.fitness || { cardio: 'medium', strength: 'medium', skills: 'medium' };
            // Keep tiers neutral - growth mode doesn't set identities
            state.commitments.reading = state.commitments.reading || 'perspicacity';
            state.commitments.writing = state.commitments.writing || 'editorial';
            state.commitments.stress = document.getElementById('growth-stress').value;
            state.commitments.meditation = document.getElementById('growth-meditation').value || state.commitments.meditation;

            // Mark path
            state.path = 'growth';
            // Apply simple tracking adjustments
            applySimpleTrackingSetup(state.selectedIdentities || {});
            saveState();
            renderConfirmationScreen();
            showScreen('confirmation-screen');
        };
    }

    if (window.registerScreen) window.registerScreen('growth-setup-screen', setupGrowth);
    window.setupGrowth = setupGrowth;
})();
