// ui.js - UI layer: DOM manipulation and rendering

function updateProgress() {
  const totalCompleted = Object.values(appState.todayData).reduce((sum, domain) => {
    return sum + Object.values(domain).filter(Boolean).length;
  }, 0);

  const progressBar = $('progressBar');
  if (progressBar) {
    const percentage = (totalCompleted / TOTAL_ASPECTS) * 100;
    progressBar.style.width = `${percentage}%`;
  }

  const progressText = $('progressText');
  if (progressText) {
    progressText.textContent = `${totalCompleted}/${TOTAL_ASPECTS}`;
  }

  const dayCounter = $('dayCounter');
  if (dayCounter) {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((today - startOfYear) / (1000 * 60 * 60 * 24)) + 1;
    dayCounter.textContent = `Day ${dayOfYear}`;
  }
}

function triggerConfetti() {
  const confettiContainer = $('confettiContainer');
  if (!confettiContainer) return;

  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.animationDelay = Math.random() * 2 + 's';
    confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 50%)`;
    confettiContainer.appendChild(confetti);

    setTimeout(() => {
      confetti.remove();
    }, 3000);
  }
}

function showScreen(screenId) {
  $$('.screen').forEach(screen => screen.classList.add('hidden'));
  const targetScreen = $(screenId);
  if (targetScreen) {
    targetScreen.classList.remove('hidden');
  }

  // Update navigation
  $$('.nav-item').forEach(item => item.classList.remove('active'));
  const navItem = document.querySelector(`.nav-item[data-screen="${screenId}"]`);
  if (navItem) {
    navItem.classList.add('active');
  }

  // Special handling for review screen
  if (screenId === 'reviewScreen') {
    renderReview();
  }

  // Special handling for reflect screen
  if (screenId === 'reflectScreen') {
    const moodSlider = $('moodSlider');
    if (moodSlider) {
      moodSlider.value = String(appState.mood);
    }
    $$('.mood-emoji').forEach(emoji => {
      emoji.classList.toggle('selected', Number(emoji.dataset.mood) === appState.mood);
    });
  }
}

async function renderReview() {
  const db = await dbp;
  const tx = db.transaction('entries', 'readonly');
  const store = tx.objectStore('entries');
  const allEntries = await new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Group entries by date
  const entriesByDate = {};
  allEntries.forEach(entry => {
    if (!entriesByDate[entry.date]) {
      entriesByDate[entry.date] = [];
    }
    entriesByDate[entry.date].push(entry);
  });

  // Get last 7 days
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000);
    dates.push(date.toISOString().split('T')[0]);
  }

  const reviewContainer = $('reviewContainer');
  if (!reviewContainer) return;

  reviewContainer.innerHTML = '';

  dates.forEach(date => {
    const dayEntries = entriesByDate[date] || [];
    const completedAspects = dayEntries.filter(entry => entry.completed).length;
    const reflection = dayEntries.find(entry => entry.type === 'reflection');

    const dayDiv = document.createElement('div');
    dayDiv.className = 'review-day';
    if (date === today) {
      dayDiv.classList.add('today');
    }

    const dateObj = new Date(date);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const monthDay = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    dayDiv.innerHTML = `
      <div class="review-day-header">
        <div class="review-day-date">
          <div class="review-day-name">${dayName}</div>
          <div class="review-day-month">${monthDay}</div>
        </div>
        <div class="review-day-count">${completedAspects}/${TOTAL_ASPECTS}</div>
      </div>
      <div class="review-day-details">
        ${Object.entries(DOMAINS).map(([domain, aspects]) => `
          <div class="review-domain">
            <div class="review-domain-name">${domain.charAt(0).toUpperCase() + domain.slice(1)}</div>
            <div class="review-aspects">
              ${aspects.map(aspect => {
                const entry = dayEntries.find(e => e.domain === domain && e.aspect === aspect);
                const completed = entry && entry.completed;
                const streak = entry ? entry.streak : 0;
                return `
                  <div class="review-aspect ${completed ? 'completed' : ''}" title="${ASPECT_LABELS[aspect]} (${streak} streak)">
                    ${aspect.charAt(0).toUpperCase()}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `).join('')}
        ${reflection ? `
          <div class="review-reflection">
            <div class="review-mood">Mood: ${'😢😕😐😊'[reflection.mood - 1]}</div>
            ${reflection.note ? `<div class="review-note">${reflection.note}</div>` : ''}
          </div>
        ` : ''}
      </div>
    `;

    reviewContainer.appendChild(dayDiv);
  });
}

function renderAspectsManager() {
  const managerContainer = $('aspectsManager');
  if (!managerContainer) return;

  managerContainer.innerHTML = '';

  Object.entries(DOMAINS).forEach(([domain, aspects]) => {
    const domainDiv = document.createElement('div');
    domainDiv.className = 'aspect-domain';

    domainDiv.innerHTML = `
      <div class="aspect-domain-header">
        <h3>${domain.charAt(0).toUpperCase() + domain.slice(1)}</h3>
        <button class="toggle-domain" data-domain="${domain}">
          ${appState.visibleAspects[domain] ? 'Hide' : 'Show'}
        </button>
      </div>
      <div class="aspect-list ${appState.visibleAspects[domain] ? '' : 'hidden'}">
        ${aspects.map(aspect => `
          <div class="aspect-item">
            <span class="aspect-label">${ASPECT_LABELS[aspect]}</span>
            <div class="aspect-streak">🔥 ${appState.streaks[`${domain}-${aspect}`] || 0}</div>
          </div>
        `).join('')}
      </div>
    `;

    managerContainer.appendChild(domainDiv);
  });
}

function updateVisibleAspects() {
  Object.entries(DOMAINS).forEach(([domain, aspects]) => {
    const domainContainer = document.querySelector(`.domain[data-domain="${domain}"]`);
    if (domainContainer) {
      domainContainer.classList.toggle('hidden', !appState.visibleAspects[domain]);
    }
  });
}

function initializeUI() {
  // Initialize app state
  Object.keys(DOMAINS).forEach(domain => {
    appState.todayData[domain] = {};
    appState.visibleAspects[domain] = true;
  });

  // Set up aspect toggles
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

  // Set up navigation
  $$('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const screen = item.dataset.screen;
      showScreen(screen);
    });
  });

  // Set up mood selector
  $$('.mood-emoji').forEach(emoji => {
    emoji.addEventListener('click', () => {
      const mood = Number(emoji.dataset.mood);
      appState.mood = mood;
      $$('.mood-emoji').forEach(e => e.classList.remove('selected'));
      emoji.classList.add('selected');
      const moodSlider = $('moodSlider');
      if (moodSlider) {
        moodSlider.value = String(mood);
      }
    });
  });

  // Set up mood slider
  const moodSlider = $('moodSlider');
  if (moodSlider) {
    moodSlider.addEventListener('input', () => {
      const mood = Number(moodSlider.value);
      appState.mood = mood;
      $$('.mood-emoji').forEach(emoji => {
        emoji.classList.toggle('selected', Number(emoji.dataset.mood) === mood);
      });
    });
  }

  // Set up save reflection button
  const saveReflectionBtn = $('saveReflection');
  if (saveReflectionBtn) {
    saveReflectionBtn.addEventListener('click', saveReflection);
  }

  // Set up export button
  const exportBtn = $('exportData');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportToCSV);
  }

  // Set up aspect manager toggles
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('toggle-domain')) {
      const domain = e.target.dataset.domain;
      appState.visibleAspects[domain] = !appState.visibleAspects[domain];
      e.target.textContent = appState.visibleAspects[domain] ? 'Hide' : 'Show';
      updateVisibleAspects();
      renderAspectsManager();
    }
  });

  // Load initial data
  loadTodayData();

  // Show initial screen
  showScreen('todayScreen');
}