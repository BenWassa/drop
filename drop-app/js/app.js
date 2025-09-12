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
    const el = document.getElementById('sleep-card');
    if(!el) return;
    el.classList.add('domain-sleep');
    const identities = window.DOMAIN_IDENTITIES?.sleep || CONFIG.sleep;
    const selected = (state.identities && state.identities.sleep) || null;
    let optionsHtml = '';
    Object.keys(identities).forEach(key => {
        const item = identities[key];
        const active = selected === key ? 'active' : '';
        optionsHtml += `<button onclick="setIdentity('sleep', null, '${key}')" class="glass-button py-3 rounded-lg w-full font-light ripple ${active}"><div class=\"flex items-center justify-between\"><span>${item.icon} ${item.name}</span><span class=\"text-xs text-gray-400\">${item.wake || ''} · ${item.sleep || ''}</span></div></button>`;
    });

    const sleepInfo = state.commitments?.sleep ? `<div class=\"text-sm text-gray-300 mt-3\">Wake: ${state.commitments.sleep.wakeTime || '—'} · Target: ${state.commitments.sleep.target_hours || '—'} hrs</div>` : '';

    el.innerHTML = `
        <div class="mb-3">
            <h3 class="text-xl font-light">🛌 Sleep — pick an identity</h3>
        </div>
        <div class="grid grid-cols-1 gap-3">${optionsHtml}</div>
        ${sleepInfo}
        <div class="mt-4">
            <button onclick="logPresence('embodiedSleep', ${!todayLog.embodiedSleep})" class="glass-button w-full py-3 rounded-xl text-lg font-light ripple ${todayLog.embodiedSleep ? 'active' : ''}">Embody Rhythm</button>
        </div>
    `;
}

function renderFitnessCard(){
    const todayLog = state.logs[getTodaysDateString()] || {};
    const fitnessCommit = state.commitments.fitness || { cardio: 'medium', strength: 'medium', skills: 'medium' };
    const el = document.getElementById('fitness-card');
    if(!el) return;
    el.classList.add('domain-fitness');
    const identities = window.DOMAIN_IDENTITIES?.fitness || CONFIG.fitness;
    const selected = (state.identities && state.identities.fitness) || { cardio: null, strength: null, skills: null };
    const displayIcon = '💪';
    const aspects = ['cardio','strength','skills'];
    let rows = '';
    aspects.forEach(a => {
        const opts = identities[a] || {};
        let optHtml = '';
        Object.keys(opts).forEach(k => {
            const item = opts[k];
            const active = (selected[a] === k) ? 'active' : '';
            optHtml += `<button onclick="setIdentity('fitness','${a}','${k}')" class="glass-button py-2 px-3 rounded-lg mr-2 ${active}">${item.icon} ${item.name}</button>`;
        });
        rows += `<div class=\"mb-3\"><div class=\"text-sm text-gray-400 mb-2 capitalize\">${a}</div><div class=\"flex\">${optHtml}</div></div>`;
    });

    el.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-light">${displayIcon} Fitness</h3>
            <span class="text-sm font-light text-gradient">Target: ${state.weeklyTargets.fitness || 0}</span>
        </div>
        ${rows}
        <div class="flex items-center space-x-4">
            <input type="number" id="fitness-log-input" class="w-full bg-slate-800/50 border border-white/20 rounded-lg p-3 text-base font-light focus:outline-none focus:border-blue-400" value="${todayLog.fitnessLogged || ''}" placeholder="Log units...">
            <button onclick="logFitness()" class="glass-button px-6 py-3 rounded-xl text-lg font-light ripple">Log</button>
        </div>
    `;
}

function renderMindCard(){
    const todayLog = state.logs[getTodaysDateString()] || {};
    const identities = window.DOMAIN_IDENTITIES?.mind || CONFIG.mind;
    const selected = (state.identities && state.identities.mind) || { reading: null, writing: null };
    const el = document.getElementById('mind-card');
    if(!el) return;
    el.classList.add('domain-mind');

    let readingHtml = '';
    Object.keys(identities.reading || {}).forEach(k => {
        const it = identities.reading[k];
        const active = selected.reading === k ? 'active' : '';
        readingHtml += `<button onclick="setIdentity('mind','reading','${k}')" class="glass-button py-3 rounded-lg w-full ${active}">${it.icon} ${it.name}</button>`;
    });
    let writingHtml = '';
    Object.keys(identities.writing || {}).forEach(k => {
        const it = identities.writing[k];
        const active = selected.writing === k ? 'active' : '';
        writingHtml += `<button onclick="setIdentity('mind','writing','${k}')" class="glass-button py-3 rounded-lg w-full ${active}">${it.icon} ${it.name}</button>`;
    });

    el.innerHTML = `
        <div class="mb-4"><h3 class="text-xl font-light">📚 Mind — pick identities</h3></div>
        <div class="grid grid-cols-2 gap-4">
            <div>${readingHtml}</div>
            <div>${writingHtml}</div>
        </div>
    `;
}

function renderSpiritCard(){
    const todayLog = state.logs[getTodaysDateString()] || {};
    const identities = window.DOMAIN_IDENTITIES?.spirit || CONFIG.spirit;
    const selected = (state.identities && state.identities.spirit) || { meditation: null, stress: null };
    const el = document.getElementById('spirit-card');
    if(!el) return;
    el.classList.add('domain-spirit');

    let medHtml = '';
    Object.keys(identities.meditation || {}).forEach(k => {
        const it = identities.meditation[k];
        const active = selected.meditation === k ? 'active' : '';
        medHtml += `<button onclick="setIdentity('spirit','meditation','${k}')" class="glass-button py-3 rounded-lg w-full ${active}">${it.icon} ${it.name}</button>`;
    });
    let stressHtml = '';
    Object.keys(identities.stress || {}).forEach(k => {
        const it = identities.stress[k];
        const active = selected.stress === k ? 'active' : '';
        stressHtml += `<button onclick="setIdentity('spirit','stress','${k}')" class="glass-button py-2 px-3 rounded-lg mr-2 ${active}">${it.icon} ${it.name}</button>`;
    });

    el.innerHTML = `
        <div class="mb-4"><h3 class="text-xl font-light">🧘 Spirit — pick identities</h3></div>
        <div class="grid grid-cols-1 gap-4">
            <div>${medHtml}</div>
            <div class="mt-2"><div class="text-sm text-gray-400 mb-2">Stress tolerance</div><div class="flex">${stressHtml}</div></div>
        </div>
    `;
}

// Helper to persist identity selections
function setIdentity(domain, aspect, key){
    state.identities = state.identities || {};
    if(!aspect){
        // top-level domain identity (sleep)
        state.identities[domain] = key;
    } else {
        state.identities[domain] = state.identities[domain] || {};
        state.identities[domain][aspect] = key;
    }
    debugLog('setIdentity ->', domain, aspect, key);
    saveState();
    renderAllDomainCards();
    try { showToast?.('Identity saved'); } catch {}
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
