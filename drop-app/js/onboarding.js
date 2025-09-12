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
});
