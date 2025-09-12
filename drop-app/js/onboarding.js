document.addEventListener('DOMContentLoaded', () => {
    loadState();

    // Populate direct control form if present
    const form = document.getElementById('direct-control-form');
    if(form){
        const baseline = document.getElementById('fitnessBaseline');
        const unit = document.getElementById('fitnessUnit');
        const sleepSel = document.getElementById('sleepIdentity');
        const fitnessModeSel = document.getElementById('fitnessMode');
        const mindSel = document.getElementById('mindFocus');
        const spiritSel = document.getElementById('spiritPractice');

        // Populate with existing commitments if present
        if(state.commitments){
            baseline.value = state.commitments.fitnessBaseline || '';
            unit.value = state.commitments.fitnessUnit || 'km';
            if(state.commitments.sleep) sleepSel.value = state.commitments.sleep;
            if(state.commitments.fitnessMode) fitnessModeSel.value = state.commitments.fitnessMode;
            if(state.commitments.mind) mindSel.value = state.commitments.mind;
            if(state.commitments.spirit) spiritSel.value = state.commitments.spirit;
        }

        const continueBtn = document.getElementById('continue-btn');
        if(continueBtn){
            continueBtn.addEventListener('click', () => {
                state.commitments = state.commitments || {};
                state.commitments.fitnessBaseline = Number(baseline.value) || 0;
                state.commitments.fitnessUnit = unit.value;
                // structured commitments for each domain
                state.commitments.sleep = sleepSel.value;
                state.commitments.fitnessMode = fitnessModeSel.value;
                state.commitments.mind = mindSel.value;
                state.commitments.spirit = spiritSel.value;
                // initialize weeklyTargets if absent
                state.weeklyTargets = state.weeklyTargets || {};
                if(!state.weeklyTargets.fitness){ state.weeklyTargets.fitness = state.commitments.fitnessBaseline || 0; }
                saveState();
                window.location.href = 'confirmation.html';
            });
        }
    }

    // Populate confirmation summary if present
    const summary = document.getElementById('confirmation-summary');
    if(summary){
        const pre = document.getElementById('summary-pre');
        pre.textContent = JSON.stringify(state.commitments || {}, null, 2);

        const quarterInfo = document.getElementById('quarter-info');
        if(quarterInfo){
            const q = getQuarterInfo();
            quarterInfo.textContent = `Quarter ${q.quarter} — ${q.year}`;
        }

        const startBtn = document.getElementById('start-journey-btn');
        if(startBtn){
            startBtn.addEventListener('click', () => {
                state.onboardingComplete = true;
                saveState();
                window.location.href = '../app/index.html';
            });
        }
    }
});
