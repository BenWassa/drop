document.addEventListener('DOMContentLoaded', () => {
    loadState();
    if(!state.onboardingComplete){
        // redirect back to onboarding
        window.location.href = '../onboarding/index.html';
        return;
    }

    if(document.getElementById('presence-screen-content')){
        renderAllDomainCards();
    }

    if(document.getElementById('gratitude-content')){
        // placeholder
        document.getElementById('gratitude-content').textContent = 'No gratitude entries yet.';
    }
});

function renderAllDomainCards(){
    const container = document.getElementById('presence-screen-content');
    container.innerHTML = '';
    const domains = ['sleep','fitness','mind','spirit'];
    domains.forEach(d => {
        const el = document.createElement('div');
        el.className = 'bg-gray-800 rounded p-4 mb-3';
        el.innerHTML = `<h3 class="capitalize font-medium">${d}</h3><p class="text-sm text-gray-400">Status placeholder</p>`;
        container.appendChild(el);
    });
}
