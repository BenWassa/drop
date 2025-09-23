// ui.js - UI layer: DOM manipulation and rendering

const DOMAIN_ICONS = {
  sleep: '🌙',
  fitness: '🏃',
  mind: '📚',
  spirit: '🧘',
};

function getISOWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return weekNo;
}

function initializeUI() {
  initializeParticles();
  updateQuarterReservoir();
  setInterval(updateQuarterReservoir, 60 * 1000);

  Object.entries(DOMAINS).forEach(([domain, aspects]) => {
    appState.todayData[domain] = {};
    appState.visibleAspects[domain] = true;
    aspects.forEach(aspect => {
      appState.todayData[domain][aspect] = false;
    });
  });

  $$('.aspect-toggle').forEach(toggle => {
    toggle.addEventListener('click', async () => {
      const domain = toggle.dataset.domain;
      const aspect = toggle.dataset.aspect;
      const currentlyCompleted = appState.todayData[domain][aspect] || false;
      const newCompleted = !currentlyCompleted;

      appState.todayData[domain][aspect] = newCompleted;
      toggle.classList.toggle('completed', newCompleted);

      await saveEntry(domain, aspect, newCompleted);
    });
  });

  $$('.nav-item, .bottom-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const screen = item.dataset.screen;
      showScreen(screen + 'Screen');
    });
  });

  $$('.mood-option').forEach(option => {
    option.addEventListener('click', () => {
      const mood = Number(option.dataset.mood);
      appState.mood = mood;
      $$('.mood-option').forEach(btn => btn.classList.remove('selected'));
      option.classList.add('selected');
    });
  });

  const saveReflectionBtn = $('saveReflection');
  if (saveReflectionBtn) {
    saveReflectionBtn.addEventListener('click', saveReflection);
  }

  const exportBtn = $('exportCSV');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportToCSV);
  }

  const syncBtn = $('syncNow');
  if (syncBtn) {
    syncBtn.addEventListener('click', () => {
      trySync();
    });
  }

  document.addEventListener('click', e => {
    if (e.target.classList.contains('toggle-domain')) {
      const domain = e.target.dataset.domain;
      appState.visibleAspects[domain] = !appState.visibleAspects[domain];
      e.target.textContent = appState.visibleAspects[domain] ? 'HIDE' : 'SHOW';
      updateVisibleAspects();
      renderAspectsManager();
    }
  });

  refreshDomainScorePanel().catch(error => console.error('Domain panel update error', error));

  renderAspectsManager();

  loadTodayData();
  showScreen('todayScreen');
}

// Expose for testing
window.initializeUI = initializeUI;