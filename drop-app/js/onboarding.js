document.addEventListener('DOMContentLoaded', () => {
    loadState();

    // Populate direct control form if present
    const form = document.getElementById('direct-control-form');
    if(form){
        const baseline = document.getElementById('fitnessBaseline');
        const unit = document.getElementById('fitnessUnit');
        if(state.commitments){
            baseline.value = state.commitments.fitnessBaseline || '';
            unit.value = state.commitments.fitnessUnit || 'km';
        }

        const continueBtn = document.getElementById('continue-btn');
        if(continueBtn){
            continueBtn.addEventListener('click', () => {
                state.commitments = state.commitments || {};
                state.commitments.fitnessBaseline = Number(baseline.value) || 0;
                state.commitments.fitnessUnit = unit.value;
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
