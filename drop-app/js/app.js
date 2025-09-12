document.addEventListener('DOMContentLoaded', () => {
    loadState();
    if(!state.onboardingComplete){
        // redirect back to onboarding
        window.location.href = '../onboarding/index.html';
        return;
    }
    // Render domain cards into their dedicated containers
    renderAllDomainCards();

    if(document.getElementById('gratitude-content')){
        document.getElementById('gratitude-content').textContent = 'No gratitude entries yet.';
    }
    // animate any streak-fill bars
    requestAnimationFrame(() => animateStreaks());
});

function renderAllDomainCards(){
    renderSleepCard();
    renderFitnessCard();
    renderMindCard();
    renderSpiritCard();
}

function renderSleepCard(){
    const todayLog = state.logs[getTodaysDateString()] || {};
    const sleepCommitment = CONFIG.sleep[state.commitments.sleep] || CONFIG.sleep.earlybird;
    const el = document.getElementById('sleep-card');
    if(!el) return;
    el.classList.add('domain-sleep');
    el.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-light">${sleepCommitment.icon} ${sleepCommitment.name}</h3>
            <span class="text-sm font-light text-gray-400">${sleepCommitment.wake} / ${sleepCommitment.sleep}</span>
        </div>
        <button onclick="logPresence('embodiedSleep', ${!todayLog.embodiedSleep})"
            class="glass-button w-full py-4 rounded-xl text-lg font-light ripple ${todayLog.embodiedSleep ? 'active' : ''}">
            Embody Rhythm
        </button>
    `;
}

function renderFitnessCard(){
    const todayLog = state.logs[getTodaysDateString()] || {};
    const fitnessCommit = state.commitments.fitness || { cardio: 'medium', strength: 'medium', skills: 'medium' };
    const cardioCfg = CONFIG.fitness.cardio[fitnessCommit.cardio] || {};
    const strengthCfg = CONFIG.fitness.strength[fitnessCommit.strength] || {};
    const skillsCfg = CONFIG.fitness.skills[fitnessCommit.skills] || {};
    const displayIcon = (cardioCfg && cardioCfg.icon) || (strengthCfg && strengthCfg.icon) || (skillsCfg && skillsCfg.icon) || '💪';
    const el = document.getElementById('fitness-card');
    if(!el) return;
    el.classList.add('domain-fitness');
    el.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-light">${displayIcon} Fitness</h3>
            <span class="text-sm font-light text-gradient">Target: ${state.weeklyTargets.fitness || state.commitments.fitnessBaseline || 0} ${state.commitments.fitnessUnit || ''}</span>
        </div>
        <div class="text-sm text-gray-300 mb-3">
            <div>Cardio: ${fitnessCommit.cardio || ''}</div>
            <div>Strength: ${fitnessCommit.strength || ''}</div>
            <div>Skills: ${fitnessCommit.skills || ''}</div>
        </div>
        <div class="flex items-center space-x-4">
            <input type="number" id="fitness-log-input" class="w-full bg-slate-800/50 border border-white/20 rounded-lg p-3 text-base font-light focus:outline-none focus:border-blue-400"
                   value="${todayLog.fitnessLogged || ''}" placeholder="Log units...">
            <button onclick="logFitness()" class="glass-button px-6 py-3 rounded-xl text-lg font-light ripple">Log</button>
        </div>
    `;
}

function renderMindCard(){
    const todayLog = state.logs[getTodaysDateString()] || {};
    const reading = CONFIG.mind.reading[state.commitments.reading] || CONFIG.mind.reading.casual;
    const writing = CONFIG.mind.writing[state.commitments.writing] || CONFIG.mind.writing.journal;
    const el = document.getElementById('mind-card');
    if(!el) return;
    el.classList.add('domain-mind');
    el.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-light">🧠 Mind</h3>
        </div>
        <div class="grid grid-cols-2 gap-4">
            <button onclick="logPresence('reading', ${!todayLog.reading})" class="glass-button py-4 rounded-xl font-light ripple ${todayLog.reading ? 'active' : ''}">
                ${reading.icon} ${reading.name}
            </button>
            <button onclick="logPresence('writing', ${!todayLog.writing})" class="glass-button py-4 rounded-xl font-light ripple ${todayLog.writing ? 'active' : ''}">
                ${writing.icon} ${writing.name}
            </button>
        </div>
    `;
}

function renderSpiritCard(){
    const todayLog = state.logs[getTodaysDateString()] || {};
    const meditation = CONFIG.spirit.meditation[state.commitments.meditation] || CONFIG.spirit.meditation.awareness;
    const el = document.getElementById('spirit-card');
    if(!el) return;
    el.classList.add('domain-spirit');
    el.innerHTML = `
         <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-light">${meditation.icon} ${meditation.name}</h3>
             <button onclick="logPresence('meditation', ${!todayLog.meditation})" class="glass-button px-8 py-3 rounded-xl font-light ripple ${todayLog.meditation ? 'active' : ''}">
                Meditate
            </button>
        </div>
        <div class="flex items-center space-x-4 mt-6">
            <span class="text-sm font-light text-gray-400">Burnout</span>
            <input type="range" min="1" max="5" value="${todayLog.burnout || 3}" onchange="logPresence('burnout', parseInt(this.value))" class="slider flex-1 domain-spirit">
            <span class="text-sm font-light w-4 text-center">${todayLog.burnout || 3}</span>
        </div>
    `;
}

function logFitness(){
    const value = parseFloat(document.getElementById('fitness-log-input').value);
    logPresence('fitnessLogged', isNaN(value) ? null : value);
}

function logPresence(key, value){
    const today = getTodaysDateString();
    if(!state.logs[today]) state.logs[today] = {};
    state.logs[today][key] = value;
    debugLog('logPresence ->', today, key, '=>', value);
    saveState();
    renderAllDomainCards(); // Re-render to update UI state
    try { showToast?.('Logged'); } catch {}
}

function animateStreaks(){
    document.querySelectorAll('.streak-fill').forEach(el => {
        const target = Number(el.dataset.target) || 0;
        // animate width with a small timeout for staggered effect
        setTimeout(() => {
            el.style.width = target + '%';
        }, Math.random()*500);
    });
}
