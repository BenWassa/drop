// ui.js - UI layer: DOM manipulation and rendering

const DOMAIN_ICONS = {
  sleep: '🌙',
  fitness: '🏃',
  mind: '📚',
  spirit: '🧘',
};

function getISOWeek(date) {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNr = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const diff = target - firstThursday;
  return 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000));
}

function updateQuarterReservoir() {
  const ledger = $('quarterLedger');
  const fill = $('quarterFill');
  if (!ledger || !fill) {
    return;
  }

  const today = new Date();
  const quarterIndex = Math.floor(today.getMonth() / 3);
  const quarterStart = new Date(today.getFullYear(), quarterIndex * 3, 1);
  const quarterEnd = new Date(today.getFullYear(), quarterIndex * 3 + 3, 0);
  const dayMs = 24 * 60 * 60 * 1000;
  const totalQuarterDays = Math.round((quarterEnd - quarterStart) / dayMs) + 1;
  const daysElapsed = Math.min(totalQuarterDays, Math.floor((today - quarterStart) / dayMs) + 1);
  const progress = Math.max(0, Math.min(1, daysElapsed / totalQuarterDays));
  const percent = Math.round(progress * 100);
  const daysLeft = Math.max(0, totalQuarterDays - daysElapsed);
  const weekNumber = String(getISOWeek(today)).padStart(2, '0');

  const ledgerSegments = [
    today.toLocaleString('en-US', { month: 'short', day: 'numeric' }).toUpperCase(),
    `Q${quarterIndex + 1}`,
    `WK ${weekNumber}`,
    `${percent}%`,
    `${daysLeft} DAYS LEFT`,
  ];

  ledger.textContent = ledgerSegments.join(' · ');
  fill.style.width = `${percent}%`;
}

function initializeParticles() {
  const canvas = $('backgroundParticles');
  if (!canvas || !canvas.getContext) {
    return;
  }

  const ctx = canvas.getContext('2d');
  const particles = Array.from({ length: 42 }, () => ({
    x: Math.random(),
    y: Math.random(),
    radius: 0.4 + Math.random() * 1.2,
    speed: 0.00015 + Math.random() * 0.00035,
  }));
  let width = 0;
  let height = 0;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function step() {
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(148, 163, 184, 0.25)';
    particles.forEach(particle => {
      particle.y -= particle.speed;
      if (particle.y < -0.05) {
        particle.y = 1.05;
        particle.x = Math.random();
      }
      const px = particle.x * width;
      const py = particle.y * height;
      ctx.globalAlpha = 0.18;
      ctx.beginPath();
      ctx.arc(px, py, particle.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(step);
  }

  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(step);
}

async function refreshDomainScorePanel() {
  const grid = $('domainScoreGrid');
  if (!grid) {
    return;
  }

  try {
    const db = await dbp;
    const tx = db.transaction('entries', 'readonly');
    const store = tx.objectStore('entries');
    const allEntries = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });

    const today = new Date();
    const targetDates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      targetDates.push(d.toISOString().split('T')[0]);
    }
    const dateSet = new Set(targetDates);
    const entriesByDate = new Map();

    allEntries.forEach(entry => {
      if (!entry || !entry.date || !entry.domain || !dateSet.has(entry.date)) {
        return;
      }
      if (!entriesByDate.has(entry.date)) {
        entriesByDate.set(entry.date, []);
      }
      entriesByDate.get(entry.date).push(entry);
    });

    const styles = getComputedStyle(document.documentElement);
    grid.innerHTML = '';

    Object.entries(DOMAINS).forEach(([domain, aspects]) => {
      const domainColor = styles.getPropertyValue(`--${domain}`).trim() || '#94a3b8';
      let completed = 0;
      let possible = 0;

      targetDates.forEach(dateStr => {
        const dayEntries = entriesByDate.get(dateStr) || [];
        aspects.forEach(aspect => {
          possible += 1;
          const entry = dayEntries.find(e => e.domain === domain && e.aspect === aspect);
          if (entry && entry.completed) {
            completed += 1;
          }
        });
      });

      const score = possible > 0 ? Math.round((completed / possible) * 100) : 0;
      const hasCrown = score >= 80;
      const todayCompleted = aspects.reduce((sum, aspect) => {
        return sum + (appState.todayData?.[domain]?.[aspect] ? 1 : 0);
      }, 0);
      const activeStreaks = aspects.reduce((sum, aspect) => {
        return sum + ((appState.streaks?.[`${domain}-${aspect}`] || 0) > 0 ? 1 : 0);
      }, 0);

      const card = document.createElement('div');
      card.className = 'domain-score-card';
      card.style.setProperty('--accent-color', domainColor);

      const aspectsMarkup = aspects
        .map(aspect => {
          const completedToday = Boolean(appState.todayData?.[domain]?.[aspect]);
          return `<span class="domain-score-aspect ${completedToday ? 'complete' : ''}">${aspect.toUpperCase()}<span class="status">${completedToday ? '✓' : '—'}</span></span>`;
        })
        .join('');

      card.innerHTML = `
        <div class="domain-score-header">
          <div class="domain-score-title">${DOMAIN_ICONS[domain] ? `${DOMAIN_ICONS[domain]} ` : ''}${domain.toUpperCase()}</div>
          <div class="domain-score-score">${score}<span class="unit">%</span>${
        hasCrown ? '<span class="crown-icon" aria-label="High performer">👑</span>' : ''
      }</div>
        </div>
        <div class="domain-score-metrics">
          <div class="domain-score-metric">
            <div class="domain-score-metric-label">ROLLING 7D</div>
            <div class="domain-score-metric-value">${score}%</div>
          </div>
          <div class="domain-score-metric">
            <div class="domain-score-metric-label">ACTIVE STREAKS</div>
            <div class="domain-score-metric-value">${activeStreaks}</div>
          </div>
          <div class="domain-score-metric">
            <div class="domain-score-metric-label">TODAY</div>
            <div class="domain-score-metric-value">${todayCompleted}/${aspects.length}</div>
          </div>
        </div>
        <div class="domain-score-aspects">
          ${aspectsMarkup}
        </div>
      `;

      grid.appendChild(card);
    });
  } catch (error) {
    console.error('Failed to refresh domain score panel', error);
  }
}

function updateProgress() {
  Object.entries(DOMAINS).forEach(([domain, aspects]) => {
    const completedCount = aspects.reduce((sum, aspect) => {
      return sum + (appState.todayData?.[domain]?.[aspect] ? 1 : 0);
    }, 0);
    const statusEl = document.querySelector(`[data-domain-status="${domain}"]`);
    if (statusEl) {
      statusEl.textContent = `${completedCount}/${aspects.length}`;
    }
  });

  refreshDomainScorePanel().catch(error => console.error('Domain panel update error', error));
}

function showScreen(screenId) {
  $$('.screen').forEach(screen => screen.classList.remove('active'));
  const targetScreen = $(screenId);
  if (targetScreen) {
    targetScreen.classList.add('active');
  }

  $$('.nav-item, .bottom-nav-item').forEach(item => item.classList.remove('active'));
  const screenName = screenId.replace('Screen', '');
  const navItems = document.querySelectorAll(`[data-screen="${screenName}"]`);
  navItems.forEach(item => item.classList.add('active'));

  if (screenId === 'reviewScreen') {
    renderReview();
  }

  if (screenId === 'reflectScreen') {
    $$('.mood-option').forEach(option => {
      option.classList.toggle('selected', Number(option.dataset.mood) === appState.mood);
    });
  }

  appState.currentScreen = screenName;
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

  const reviewContainer = $('weekGrid');
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
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const monthDay = dateObj
      .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      .toUpperCase();

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
            <div class="review-domain-name">${domain.toUpperCase()}</div>
            <div class="review-aspects">
              ${aspects.map(aspect => {
                const entry = dayEntries.find(e => e.domain === domain && e.aspect === aspect);
                const completed = entry && entry.completed;
                const streak = entry ? entry.streak : 0;
                return `
                  <div class="review-aspect ${completed ? 'completed' : ''}" title="${ASPECT_LABELS[aspect]} · streak ${streak}">
                    ${aspect.charAt(0).toUpperCase()}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `).join('')}
        ${reflection ? `
          <div class="review-reflection">
            <div class="review-mood">MOOD ${reflection.mood}</div>
            ${reflection.note ? `<div class="review-note">${reflection.note}</div>` : ''}
          </div>
        ` : ''}
      </div>
    `;

    reviewContainer.appendChild(dayDiv);
  });

  // Render streaks
  const streaksContainer = $('streaksContainer');
  if (streaksContainer) {
    streaksContainer.innerHTML = '';
    Object.entries(DOMAINS).forEach(([domain, aspects]) => {
      const domainDiv = document.createElement('div');
      domainDiv.className = 'streak-domain';
      domainDiv.innerHTML = `
        <h4>${domain.toUpperCase()}</h4>
        <div class="streak-list">
          ${aspects.map(aspect => {
            const streak = appState.streaks[`${domain}-${aspect}`] || 0;
            return `<div class="streak-item">${ASPECT_LABELS[aspect].toUpperCase()} · STREAK ${streak}</div>`;
          }).join('')}
        </div>
      `;
      streaksContainer.appendChild(domainDiv);
    });
  }

  // Render weekly completion
  const weeklyCompletion = $('weeklyCompletion');
  if (weeklyCompletion) {
    const totalPossible = dates.length * TOTAL_ASPECTS;
    const totalCompleted = dates.reduce((sum, date) => {
      const dayEntries = entriesByDate[date] || [];
      return sum + dayEntries.filter(entry => entry.completed).length;
    }, 0);
    const completionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
    const activeStreaks = Object.values(appState.streaks || {}).filter(count => count > 0).length;
    weeklyCompletion.textContent = `${totalCompleted} / ${totalPossible} · ${completionRate}% · ${activeStreaks} ACTIVE STREAKS`;
  }
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
        <h3>${domain.toUpperCase()}</h3>
        <button class="toggle-domain" data-domain="${domain}">
          ${appState.visibleAspects[domain] ? 'HIDE' : 'SHOW'}
        </button>
      </div>
      <div class="aspect-list ${appState.visibleAspects[domain] ? '' : 'hidden'}">
        ${aspects.map(aspect => `
          <div class="aspect-item">
            <span class="aspect-label">${ASPECT_LABELS[aspect]}</span>
            <div class="aspect-streak">STREAK ${appState.streaks[`${domain}-${aspect}`] || 0}</div>
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
    exportBtn.addEventListener('click', window.exportToCSV);
  }

  const syncBtn = $('syncNow');
  if (syncBtn) {
    syncBtn.addEventListener('click', () => {
      trySync();
    });
  }

  // Audio recording
  const voiceButton = $('voiceButton');
  let mediaRecorder;
  let audioChunks = [];
  if (voiceButton) {
    voiceButton.addEventListener('click', async () => {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        voiceButton.classList.remove('recording');
        voiceButton.classList.add('processing');
        voiceButton.querySelector('span:last-child').textContent = 'PROCESSING...';
      } else {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaRecorder = new MediaRecorder(stream);
          audioChunks = [];
          mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
          mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const mp3Blob = await encodeToMP3(audioBlob);
            const today = new Date().toISOString().split('T')[0];
            await window.saveAudioNote(today, mp3Blob);
            voiceButton.querySelector('span:last-child').textContent = 'RECORD AUDIO NOTE';
            voiceButton.classList.remove('processing');
            stream.getTracks().forEach(track => track.stop());
            renderAudioNotes();
          };
          mediaRecorder.start();
          voiceButton.classList.add('recording');
          voiceButton.querySelector('span:last-child').textContent = 'STOP RECORDING';
        } catch (err) {
          console.error('Recording failed', err);
          alert('Microphone access denied or not available.');
        }
      }
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

// Audio recording functions
function encodeToMP3(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result;
      const audioContext = new AudioContext();
      audioContext.decodeAudioData(arrayBuffer, buffer => {
        const mp3encoder = new lamejs.Mp3Encoder(1, buffer.sampleRate, 128); // mono, sampleRate, bitrate
        const samples = buffer.getChannelData(0); // left channel
        const mp3Data = [];
        const sampleBlockSize = 1152;
        for (let i = 0; i < samples.length; i += sampleBlockSize) {
          const sampleChunk = samples.subarray(i, i + sampleBlockSize);
          const intSamples = sampleChunk.map(s => s * 32767); // to 16-bit
          const mp3buf = mp3encoder.encodeBuffer(intSamples);
          if (mp3buf.length > 0) mp3Data.push(mp3buf);
        }
        const mp3buf = mp3encoder.flush();
        if (mp3buf.length > 0) mp3Data.push(mp3buf);
        const blob = new Blob(mp3Data, { type: 'audio/mp3' });
        resolve(blob);
      });
    };
    reader.readAsArrayBuffer(blob);
  });
}

// Render audio notes for today
function renderAudioNotes() {
  const list = $('audioNotesList');
  if (!list) return;
  const today = new Date().toISOString().split('T')[0];
  window.getAudioNotes(today).then(notes => {
    list.innerHTML = notes.map(note => `
      <div class="audio-note">
        <audio controls src="${URL.createObjectURL(note.blob)}"></audio>
        <textarea placeholder="Transcription">${note.transcription}</textarea>
        <button onclick="updateTranscription('${note.id}', this.previousElementSibling.value)">Save Transcription</button>
        <a href="${URL.createObjectURL(note.blob)}" download="audio-${note.id}.mp3">Download MP3</a>
      </div>
    `).join('');
  });
}

function updateTranscription(id, text) {
  window.updateAudioTranscription(id, text).then(() => {
    alert('Transcription saved');
  });
}

// Expose for testing and cross-script usage
window.initializeUI = initializeUI;
window.renderAspectsManager = renderAspectsManager;
window.updateProgress = updateProgress;
window.renderAudioNotes = renderAudioNotes;
window.updateTranscription = updateTranscription;
