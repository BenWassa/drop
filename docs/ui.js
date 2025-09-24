// ui.js - UI layer: DOM manipulation and rendering

const DOMAIN_ICONS = {
  // Inline SVG strings for domain icons
  sleep: `<svg viewBox="0 0 192 192" fill="none" stroke="currentColor" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"><path d="M30 22h62L30 96h62m25-24h46l-46 55h46m-109 0h36l-36 43h36"/></svg>`,
  fitness: `<svg viewBox="0 0 64 64" fill="currentColor" stroke="currentColor" stroke-width="0.00064"><path d="M32,2C15.432,2,2,15.432,2,32s13.432,30,30,30s30-13.432,30-30S48.568,2,32,2z M32,58C18.193,58,7,46.807,7,32 S18.193,6,32,6s25,11.193,25,26S45.807,58,32,58z"/><path d="M32,10c-11.046,0-20,8.954-20,20s8.954,20,20,20s20-8.954,20-20S43.046,10,32,10z M32,46c-8.822,0-16-7.178-16-16 s7.178-16,16-16s16,7.178,16,16S40.822,46,32,46z"/><path d="M32,18c-5.522,0-10,4.478-10,10s4.478,10,10,10s10-4.478,10-10S37.522,18,32,18z M32,34c-3.309,0-6-2.691-6-6 s2.691-6,6-6s6,2.691,6,6S35.309,34,32,34z"/></svg>`,
  mind: `<svg viewBox="0 0 100 100" fill="currentColor" stroke="currentColor" stroke-width="0.8"><path d="M93.998,45.312c0-3.676-1.659-7.121-4.486-9.414c0.123-0.587,0.184-1.151,0.184-1.706c0-4.579-3.386-8.382-7.785-9.037 c0.101-0.526,0.149-1.042,0.149-1.556c0-4.875-3.842-8.858-8.655-9.111c-0.079-0.013-0.159-0.024-0.242-0.024 c-0.04,0-0.079,0.005-0.12,0.006c-0.04-0.001-0.079-0.006-0.12-0.006c-0.458,0-0.919,0.041-1.406,0.126 c-0.846-4.485-4.753-7.825-9.437-7.825c-5.311,0-9.632,4.321-9.632,9.633v65.918c0,6.723,5.469,12.191,12.191,12.191 c4.46,0,8.508-2.413,10.646-6.246c0.479,0.104,0.939,0.168,1.401,0.198c2.903,0.185,5.73-0.766,7.926-2.693 c2.196-1.927,3.51-4.594,3.7-7.51c0.079-1.215-0.057-2.434-0.403-3.638c3.796-2.691,6.027-6.952,6.027-11.621 c0-3.385-1.219-6.635-3.445-9.224C92.731,51.505,93.998,48.471,93.998,45.312z M90.938,62.999c0,3.484-1.582,6.68-4.295,8.819 c-2.008-3.196-5.57-5.237-9.427-5.237c-0.828,0-1.5,0.672-1.5,1.5s0.672,1.5,1.5,1.5c3.341,0,6.384,2.093,7.582,5.208 c0.41,1.088,0.592,2.189,0.521,3.274c-0.138,2.116-1.091,4.051-2.685,5.449c-1.594,1.399-3.641,2.094-5.752,1.954 c-0.594-0.039-1.208-0.167-1.933-0.402c-0.74-0.242-1.541,0.124-1.846,0.84c-1.445,3.404-4.768,5.604-8.465,5.604 c-5.068,0-9.191-4.123-9.191-9.191V16.399c0-3.657,2.975-6.633,6.632-6.633c3.398,0,6.194,2.562,6.558,5.908 c-2.751,1.576-4.612,4.535-4.612,7.926c0,0.829,0.672,1.5,1.5,1.5s1.5-0.671,1.5-1.5c0-3.343,2.689-6.065,6.016-6.13 c3.327,0.065,6.016,2.787,6.016,6.129c0,0.622-0.117,1.266-0.359,1.971c-0.057,0.166-0.084,0.34-0.081,0.515 c0.001,0.041,0.003,0.079,0.007,0.115c-0.006,0.021-0.01,0.035-0.01,0.035c-0.118,0.465-0.006,0.959,0.301,1.328 c0.307,0.369,0.765,0.569,1.251,0.538c0.104-0.007,0.208-0.02,0.392-0.046c3.383,0,6.136,2.753,6.136,6.136 c0,0.572-0.103,1.159-0.322,1.849c-0.203,0.635,0.038,1.328,0.591,1.7c2.434,1.639,3.909,4.329,4.014,7.242 c0,0.004-0.001,0.008-0.001,0.012c0,5.03-4.092,9.123-9.122,9.123s-9.123-4.093-9.123-9.123c0-0.829-0.672-1.5-1.5-1.5 s-1.5,0.671-1.5,1.5c0,6.685,5.438,12.123,12.123,12.123c2.228,0,4.31-0.615,6.106-1.668C89.88,57.539,90.938,60.212,90.938,62.999 z"/><path d="M38.179,6.766c-4.684,0-8.59,3.34-9.435,7.825c-0.488-0.085-0.949-0.126-1.407-0.126c-0.04,0-0.079,0.005-0.12,0.006 c-0.04-0.001-0.079-0.006-0.12-0.006c-0.083,0-0.163,0.011-0.242,0.024c-4.813,0.253-8.654,4.236-8.654,9.111 c0,0.514,0.049,1.03,0.149,1.556c-4.399,0.655-7.785,4.458-7.785,9.037c0,0.554,0.061,1.118,0.184,1.706 c-2.827,2.293-4.486,5.738-4.486,9.414c0,3.159,1.266,6.193,3.505,8.463c-2.227,2.589-3.446,5.839-3.446,9.224 c0,4.669,2.231,8.929,6.027,11.621c-0.347,1.204-0.482,2.423-0.402,3.639c0.19,2.915,1.503,5.582,3.699,7.509 c2.196,1.928,5.015,2.879,7.926,2.693c0.455-0.03,0.919-0.096,1.4-0.199c2.138,3.834,6.186,6.247,10.646,6.247 c6.722,0,12.191-5.469,12.191-12.191V16.399C47.811,11.087,43.49,6.766,38.179,6.766z M44.811,82.317 c0,5.068-4.123,9.191-9.191,9.191c-3.697,0-7.02-2.2-8.464-5.604c-0.241-0.567-0.793-0.914-1.381-0.914 c-0.154,0-0.311,0.023-0.465,0.074c-0.724,0.235-1.338,0.363-1.933,0.402c-2.119,0.139-4.158-0.556-5.751-1.954 c-1.594-1.398-2.547-3.333-2.685-5.449c-0.076-1.16,0.125-2.336,0.598-3.495c0.007-0.017,0.005-0.036,0.011-0.053 c1.342-3.056,4.225-4.953,7.597-4.953c0.829,0,1.5-0.672,1.5-1.5s-0.671-1.5-1.5-1.5c-3.938,0-7.501,2.007-9.548,5.239 c-2.701-2.139-4.277-5.327-4.277-8.802c0-2.787,1.06-5.46,2.978-7.549c1.796,1.053,3.879,1.668,6.107,1.668 c6.685,0,12.123-5.438,12.123-12.123c0-0.829-0.671-1.5-1.5-1.5s-1.5,0.671-1.5,1.5c0,5.03-4.092,9.123-9.123,9.123 s-9.123-4.093-9.123-9.123c0-0.002-0.001-0.004-0.001-0.006c0.103-2.915,1.578-5.607,4.013-7.248 c0.553-0.372,0.793-1.064,0.591-1.699c-0.22-0.691-0.322-1.278-0.322-1.85c0-3.376,2.741-6.125,6.195-6.125 c0.007,0,0.015,0,0.022,0c0.103,0.014,0.206,0.027,0.311,0.034c0.485,0.03,0.948-0.171,1.254-0.542 c0.307-0.372,0.417-0.868,0.294-1.334c0-0.001-0.003-0.014-0.008-0.031c0.003-0.035,0.006-0.067,0.007-0.095 c0.005-0.18-0.022-0.359-0.081-0.529c-0.242-0.707-0.359-1.352-0.359-1.972c0-3.342,2.688-6.065,6.016-6.129 c3.328,0.065,6.016,2.787,6.016,6.13c0,0.829,0.671,1.5,1.5,1.5s1.5-0.671,1.5-1.5c0-3.391-1.861-6.35-4.612-7.926 c0.364-3.346,3.16-5.908,6.558-5.908c3.657,0,6.632,2.976,6.632,6.633V82.317z"/></svg>`,
  spirit: `<svg viewBox="0 0 512 512" fill="currentColor" stroke="currentColor" stroke-width="0.00512"><g><g><path d="M452.09,335.122c62.386-69.965,60.006-177.603,59.867-182.309c-0.255-8.712-7.161-15.767-15.864-16.21 c-2.307-0.116-34.685-1.557-74.997,6.427c-7.934-39.686-21.397-68.089-22.046-69.442c-3.695-7.715-12.621-11.393-20.681-8.529 c-1.409,0.502-30.793,11.089-64.301,33.391c-22.136-33.013-45.055-53.88-46.902-55.536c-6.353-5.7-15.98-5.7-22.333,0 c-1.847,1.658-24.767,22.523-46.902,55.536c-33.507-22.302-62.891-32.891-64.3-33.392c-8.061-2.866-16.983,0.815-20.681,8.529 c-0.649,1.353-14.111,29.756-22.046,69.442c-40.312-7.986-72.689-6.543-74.996-6.426c-8.706,0.441-15.61,7.497-15.865,16.21 c-0.138,4.706-2.518,112.345,59.867,182.309c-25.548,10.116-54.712,27.242-54.712,54.639c0,26.751,27.147,48.071,80.688,63.368 c45.665,13.047,106.079,20.232,170.114,20.232c64.035,0,124.449-7.185,170.114-20.232c53.54-15.297,80.688-36.617,80.688-63.368 C506.802,362.378,477.675,345.252,452.09,335.122z M478.058,170.096c-1.946,31.969-11.425,103.617-56.537,148.728 c-36.2,36.199-89.566,48.414-125.646,52.438c39.064-48.084,66.363-107.116,59.272-168.736 C398.199,176.455,451.645,171.071,478.058,170.096z M374.92,102.738c4.236,11.349,9.815,28.472,13.716,48.559 c-13.576,4.293-27.37,9.806-40.69,16.88c-4.406-14.561-10.245-28.283-16.784-40.922 C348.028,115.898,363.966,107.764,374.92,102.738z M256.021,79.056c35.584,38.182,66.859,90.846,66.859,143.503 c0,63.89-45.323,120.279-66.902,143.503c-21.587-23.163-66.859-79.39-66.859-143.503C189.12,170.1,220.169,117.642,256.021,79.056 z M137.081,102.738c10.957,5.028,26.895,13.161,43.758,24.516c-6.539,12.639-12.377,26.362-16.784,40.922 c-13.319-7.074-27.113-12.587-40.689-16.88C127.267,131.207,132.847,114.083,137.081,102.738z M33.942,170.07 c26.377,0.94,79.734,6.278,122.913,32.453c-7.089,61.584,20.174,120.616,59.271,168.739 c-36.08-4.024-89.446-16.237-125.645-52.438C45.355,273.698,35.883,202.016,33.942,170.07z M416.928,420.976 c-42.759,12.217-99.912,18.946-160.927,18.946c-61.015,0-118.167-6.728-160.928-18.946 c-46.066-13.162-56.434-27.299-56.434-31.214c0-3.733,9.353-16.619,49.518-29.148c45.956,33.345,113.973,48.174,167.843,45.886 c53.029,2.254,121.345-12.148,167.843-45.886c40.165,12.529,49.518,25.415,49.518,29.148 C473.362,393.676,462.995,407.814,416.928,420.976z"/></g></g></svg>`,
};

function renderDomainIcon(domain) {
  const v = DOMAIN_ICONS[domain];
  if (!v) return '';
  // Return the inline SVG with class for coloring
  return `<span class="domain-icon ${domain}">${v}</span>`;
}

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
  // Render a compact, lean overview: four circular score rings with single integer scores
  const grid = $('domainScoreGrid');
  if (!grid) return;

  try {
    let allEntries = [];
    try {
      if (typeof window.getAllEntries === 'function') {
        allEntries = await window.getAllEntries();
      }
    } catch (e) {
      console.warn('Failed to load entries for score panel', e);
    }

    // Build rolling 7-day date strings
    const today = new Date();
    const targetDates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      targetDates.push(d.toISOString().split('T')[0]);
    }
    const dateSet = new Set(targetDates);

    // Group entries by domain and date
    const domainCounts = {};
    Object.keys(DOMAINS).forEach(d => domainCounts[d] = { completed: 0, possible: 0 });

    allEntries.forEach(entry => {
      if (!entry || !entry.date || !entry.domain || !dateSet.has(entry.date)) return;
      if (!domainCounts[entry.domain]) return;
      domainCounts[entry.domain].possible += 1;
      if (entry.completed) domainCounts[entry.domain].completed += 1;
    });

    grid.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'lean-domain-overview';

    Object.entries(DOMAINS).forEach(([domain]) => {
      const counts = domainCounts[domain] || { completed: 0, possible: 0 };
      const score = counts.possible > 0 ? Math.round((counts.completed / counts.possible) * 100) : 0;

      const item = document.createElement('div');
      item.className = `lean-domain-item ${domain}`;

      // Ring container with SVG progress arc
      const ringContainer = document.createElement('div');
      ringContainer.className = 'lean-score-ring-container';

      const radius = 30;
      const centerX = 34;
      const centerY = 34;
      const startAngle = 30; // start 30 degrees from top
      const endAngle = 330; // end at 330 degrees, creating 60 degree gap at bottom
      const startX = centerX + radius * Math.sin(startAngle * Math.PI / 180);
      const startY = centerY - radius * Math.cos(startAngle * Math.PI / 180);
      const endX = centerX + radius * Math.sin(endAngle * Math.PI / 180);
      const endY = centerY - radius * Math.cos(endAngle * Math.PI / 180);
      const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
      const pathData = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
      const arcLength = (endAngle / 360) * 2 * Math.PI * radius;
      const progressLength = (score / 100) * arcLength;
      const gapLength = arcLength - progressLength;
      const accentColor = { sleep: '#1e90ff', fitness: '#ff3b30', mind: '#7c3aed', spirit: '#16a34a' }[domain] || '#94a3b8';

      const svg = `<svg width="68" height="68" viewBox="0 0 68 68" class="lean-score-ring-svg">
        <path d="${pathData}" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="4" />
        <path d="${pathData}" fill="none" stroke="${accentColor}" stroke-width="4" stroke-dasharray="${progressLength} ${gapLength}" stroke-dashoffset="0" />
      </svg>`;

      ringContainer.innerHTML = svg;

      // Add accessibility: tooltip and aria-label
      const title = `${counts.completed} of ${counts.possible} completed — ${score}%`;
      ringContainer.title = title;
      ringContainer.setAttribute('aria-label', title);

      // Score value centered in ring
      const value = document.createElement('div');
      value.className = 'lean-score-value';
      value.textContent = String(score);
      ringContainer.appendChild(value);

      // Small icon overlapping bottom gap of ring
      const iconWrap = document.createElement('div');
      iconWrap.className = 'lean-ring-icon';
      iconWrap.innerHTML = renderDomainIcon(domain);
      ringContainer.appendChild(iconWrap);

      const label = document.createElement('div');
      label.className = 'lean-domain-label';
      label.textContent = domain.toUpperCase();

      item.appendChild(ringContainer);
      item.appendChild(label);
      container.appendChild(item);
    });

    grid.appendChild(container);
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
  try {
    if (appState.devMode) {
      console.info('[diagnostic] showScreen', screenName, { currentScreen: appState.currentScreen, visibleAspects: appState.visibleAspects, stack: (new Error()).stack });
    }
  } catch (e) {}
}

async function renderReview() {
  let allEntries = [];
  try {
    if (typeof window.getAllEntries === 'function') {
      allEntries = await window.getAllEntries();
    }
  } catch (e) {
    console.warn('Could not load entries for review', e);
  }

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

    // Default to visible if not yet set
    const visible = (appState.visibleAspects && typeof appState.visibleAspects[domain] !== 'undefined')
      ? Boolean(appState.visibleAspects[domain])
      : true;

    const buttonLabel = visible ? 'HIDE' : 'SHOW';

    const aspectsHtml = aspects.map(aspect => {
      const streakKey = `${domain}-${aspect}`;
      const streak = (appState.streaks && typeof appState.streaks[streakKey] === 'number') ? appState.streaks[streakKey] : 0;
      const label = ASPECT_LABELS[aspect] || aspect;
      return `
        <div class="aspect-item">
          <span class="aspect-label">${label}</span>
          <div class="aspect-streak">STREAK ${streak}</div>
        </div>
      `;
    }).join('');

    domainDiv.innerHTML = `
      <div class="aspect-domain-header">
        <h3>${domain.toUpperCase()}</h3>
        <button class="toggle-domain" data-domain="${domain}">${buttonLabel}</button>
      </div>
      <div class="aspect-list ${visible ? '' : 'hidden'}">
        ${aspectsHtml}
      </div>
    `;

    managerContainer.appendChild(domainDiv);
  });
}

function updateVisibleAspects() {
  Object.entries(DOMAINS).forEach(([domain, aspects]) => {
    const domainContainer = document.querySelector(`.domain[data-domain="${domain}"]`);
    if (domainContainer) {
      const shouldHide = !appState.visibleAspects[domain];
      if (shouldHide && appState.devMode) {
        try {
          console.warn(`[diagnostic] Hiding domain container for ${domain}`, {
            domain,
            visibleAspects: appState.visibleAspects,
            localStorageSnapshot: (function() { try { return { disabled_aspects: localStorage.getItem('disabled_aspects'), visibleAspects: localStorage.getItem('visibleAspects'), drop_client_id: localStorage.getItem('drop_client_id') }; } catch (e) { return {}; } })(),
            stack: (new Error()).stack
          });
        } catch (e) {}
      }
      domainContainer.classList.toggle('hidden', shouldHide);
    }
  });
}

async function initializeUI() {
  function logInit(msg, level = 'debug') {
    try {
      if (console && console[level]) console[level]('[init] ' + msg);
      const diag = $('diagAppState');
      if (diag) {
        // append short status to diag area for quick visibility in dev
        diag.textContent = (diag.textContent ? diag.textContent + ' | ' : '') + msg;
      }
    } catch (e) {}
  }

  function showSafe(fn, ...args) {
    return (async () => {
      try {
        logInit('running ' + (fn.name || 'anonymous'));
        await fn(...args);
        logInit('completed ' + (fn.name || 'anonymous'));
      } catch (err) {
        try {
          const panel = $('runtimeErrorContent');
          if (panel) panel.textContent = `${err && err.stack ? err.stack : String(err)}`;
          const container = $('runtimeErrorPanel');
          if (container) container.classList.remove('hidden');
          // also mirror to diagAppState for a quick trace when dev-only hidden
          const diag = $('diagAppState'); if (diag) diag.textContent = 'INIT ERROR: ' + (err && err.message ? err.message : String(err));
        } catch (e) {}
        console.error('Safe wrapper caught error', err);
      }
    })();
  }
  // Global error handlers (dev-only panel)
  window.addEventListener('error', (ev) => {
    try {
      const panel = $('runtimeErrorContent');
      if (panel) panel.textContent = `${ev.message}\n${ev.filename}:${ev.lineno}:${ev.colno}\n${ev.error && ev.error.stack ? ev.error.stack : ''}`;
      const container = $('runtimeErrorPanel');
      if (container) container.classList.remove('hidden');
    } catch (e) {}
  });
  window.addEventListener('unhandledrejection', (ev) => {
    try {
      const panel = $('runtimeErrorContent');
      if (panel) panel.textContent = `UnhandledRejection: ${ev.reason && ev.reason.stack ? ev.reason.stack : String(ev.reason)}`;
      const container = $('runtimeErrorPanel');
      if (container) container.classList.remove('hidden');
    } catch (e) {}
  });

  const runtimeClear = $('runtimeErrorClear');
  if (runtimeClear) runtimeClear.addEventListener('click', () => {
    const panel = $('runtimeErrorContent');
    if (panel) panel.textContent = 'No errors';
    const container = $('runtimeErrorPanel');
    if (container) container.classList.add('hidden');
  });
  initializeParticles();
  logInit('particles initialized');
  updateQuarterReservoir();
  setInterval(updateQuarterReservoir, 60 * 1000);

  // Replace static domain icon placeholders (emoji text) with configured SVGs where available
  function replaceStaticDomainIcons() {
    Object.keys(DOMAINS).forEach(domain => {
      try {
        const container = document.querySelector(`.domain[data-domain="${domain}"] .domain-icon`);
        if (!container) return;
        const iconHtml = renderDomainIcon(domain);
        // If renderDomainIcon returned an SVG <img> or text, replace the container's innerHTML
        container.innerHTML = iconHtml;
      } catch (e) {
        // ignore
      }
    });
  }
  replaceStaticDomainIcons();

  // Initialize todayData and visibleAspects. Load persisted visibleAspects from localStorage
  // so toggling dev/mock or reloading doesn't unexpectedly hide domains.
  let persistedVisible = {};
  try {
    const raw = localStorage.getItem('visibleAspects');
    if (raw) persistedVisible = JSON.parse(raw) || {};
  } catch (e) {
    // ignore parse errors and fall back to defaults
    persistedVisible = {};
  }

  Object.entries(DOMAINS).forEach(([domain, aspects]) => {
    appState.todayData[domain] = {};
    // Use persisted value if present, otherwise default to true
    appState.visibleAspects[domain] = (typeof persistedVisible[domain] !== 'undefined') ? Boolean(persistedVisible[domain]) : true;
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

  // Developer / Mock toggles
  const devToggle = $('devModeToggle');
  const mockToggle = $('mockDataToggle');
  // Clear storage button (dev troubleshooting)
  const clearStorageBtn = $('clearStorageBtn');
  if (clearStorageBtn) {
    clearStorageBtn.addEventListener('click', async () => {
      try {
        clearStorageBtn.disabled = true;
        clearStorageBtn.textContent = 'Clearing...';
        if (window.storageUtils && typeof window.storageUtils.clearAllAppStorage === 'function') {
          await window.storageUtils.clearAllAppStorage({ clearIndexedDB: true });
        }
        // show a small ephemeral banner
        const b = document.createElement('div');
        b.className = 'ephemeral-banner';
        b.textContent = 'Cleared local data and caches. Reloading...';
        document.body.appendChild(b);
        setTimeout(() => { try { document.body.removeChild(b); } catch (e) {} }, 3500);
        setTimeout(() => { location.reload(true); }, 900);
      } catch (e) {
        console.error('Clear storage failed', e);
        clearStorageBtn.disabled = false;
        clearStorageBtn.textContent = 'Clear cached data';
      }
    });
  }
  const devControls = $('devControls');

  // Initialize from localStorage
  const devMode = localStorage.getItem('dev_mode') === '1';
  const useMock = localStorage.getItem('use_mock_data') === '1';
  appState.devMode = devMode;
  appState.useMock = useMock;

  if (devToggle) {
    devToggle.checked = devMode;
    devToggle.addEventListener('change', () => {
      appState.devMode = devToggle.checked;
      localStorage.setItem('dev_mode', devToggle.checked ? '1' : '0');
      // Show/hide all dev-only elements
      document.querySelectorAll('.dev-only').forEach(el => el.classList.toggle('hidden', !devToggle.checked));
    });
  }

  if (mockToggle) {
    mockToggle.checked = useMock;
    mockToggle.addEventListener('change', async () => {
      // If turning ON mock mode, offer to backup current data first
      if (mockToggle.checked) {
        const proceed = confirm('Enable mock mode will switch to sandboxed data and prevent syncing. Create a JSON backup of both real and mock data before switching? Click OK to create backup and enable mock mode, Cancel to abort.');
        if (!proceed) {
          mockToggle.checked = false;
          return;
        }
        try {
          if (typeof window.exportAllData === 'function') {
            const data = await window.exportAllData({ mode: 'both' });
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const dt = new Date().toISOString().split('T')[0];
            a.download = `drop-backup-${dt}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        } catch (e) {
          console.error('Backup failed', e);
          alert('Backup failed — mock mode will not be enabled to avoid risk to your data.');
          mockToggle.checked = false;
          return;
        }
      }

      appState.useMock = mockToggle.checked;
      localStorage.setItem('use_mock_data', mockToggle.checked ? '1' : '0');
      // After switching mode, reload today's data and UI to ensure consistent data source
      try {
        await loadTodayData();
        refreshDomainScorePanel();
        renderReview();
        setMockBanner(appState.useMock);
      } catch (e) {
        console.warn('Reload after mock mode switch failed', e);
      }
    });
  }

  // Initialize dev-only elements
  document.querySelectorAll('.dev-only').forEach(el => el.classList.toggle('hidden', !devMode));
  logInit('dev mode ' + (devMode ? 'ON' : 'OFF') + ', mock ' + (useMock ? 'ON' : 'OFF'));

  // Mock mode banner elements
  const mockBanner = $('mockBanner');
  const mockSeedQuick = $('mockSeedQuick');
  const mockClearQuick = $('mockClearQuick');

  function setMockBanner(visible) {
    if (!mockBanner) return;
    mockBanner.classList.toggle('hidden', !visible);
  }

  // Dev control buttons
  const seedBtn = $('seedMockData');
  const clearBtn = $('clearMockData');
  if (seedBtn) {
    seedBtn.addEventListener('click', async () => {
      if (typeof window.seedMockData === 'function') {
        try {
          await window.seedMockData();
          await loadTodayData();
        } catch (e) {
          console.error('seedMockData error', e);
        }
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', async () => {
      if (typeof window.clearMockData === 'function') {
        try {
          await window.clearMockData();
          await loadTodayData();
        } catch (e) {
          console.error('clearMockData error', e);
        }
      }
    });
  }

  // Quick banner actions
  if (mockSeedQuick) {
    mockSeedQuick.addEventListener('click', async () => {
      if (!confirm('Seed mock data into sandbox? This will not affect real data.')) return;
      try {
        await window.seedMockData();
        await loadTodayData();
        setMockBanner(true);
      } catch (e) {
        console.error('seedMockData error', e);
        alert('Seeding mock data failed. See console.');
      }
    });
  }

  if (mockClearQuick) {
    mockClearQuick.addEventListener('click', async () => {
      if (!confirm('Clear mock sandbox data? This will remove mock entries and outbox.')) return;
      try {
        await window.clearMockData();
        await loadTodayData();
        setMockBanner(true);
      } catch (e) {
        console.error('clearMockData error', e);
        alert('Clearing mock data failed. See console.');
      }
    });
  }

  // Diagnostics panel (dev-only)
  const diagStoresEl = $('diagStores');
  const diagAppStateEl = $('diagAppState');
  const diagRefreshBtn = $('diagRefresh');
  const diagEnsureBtn = $('diagEnsureStores');

  async function renderDiagnostics() {
    try {
      const db = await dbp;
      const names = Array.from(db.objectStoreNames || []);
      const parts = [];
      for (const n of names) {
        try {
          const tx = db.transaction(n, 'readonly');
          const store = tx.objectStore(n);
          const count = await new Promise((res, rej) => {
            const r = store.count();
            r.onsuccess = () => res(r.result);
            r.onerror = () => rej(r.error);
          });
          parts.push(`${n}: ${count}`);
        } catch (e) {
          parts.push(`${n}: (error)`);
        }
      }
      if (diagStoresEl) diagStoresEl.textContent = parts.join(' · ') || 'No stores';
    } catch (e) {
      if (diagStoresEl) diagStoresEl.textContent = 'DB unavailable';
    }

    if (diagAppStateEl) {
      try {
        diagAppStateEl.textContent = JSON.stringify({
          devMode: appState.devMode,
          useMock: appState.useMock,
          currentScreen: appState.currentScreen,
          mood: appState.mood,
          visibleAspects: appState.visibleAspects
        }, null, 0);
      } catch (e) {
        diagAppStateEl.textContent = 'error';
      }
    }
  }

  // Dump app state and storage for debugging
  async function dumpAppState() {
    try {
      const snapshot = {
        timestamp: new Date().toISOString(),
        appState: {
          currentScreen: appState.currentScreen,
          visibleAspects: appState.visibleAspects,
          streaks: appState.streaks,
          mood: appState.mood,
          devMode: appState.devMode,
          useMock: appState.useMock
        },
        localStorage: {},
        indexedDB: {}
      };
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          snapshot.localStorage[k] = localStorage.getItem(k);
        }
      } catch (e) { snapshot.localStorage_error = String(e); }

      try {
        const db = await dbp;
        for (const name of Array.from(db.objectStoreNames || [])) {
          try {
            const tx = db.transaction(name, 'readonly');
            const store = tx.objectStore(name);
            const count = await new Promise((res, rej) => { const r = store.count(); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
            snapshot.indexedDB[name] = { count };
          } catch (e) { snapshot.indexedDB[name] = { error: String(e) }; }
        }
      } catch (e) { snapshot.indexedDB_error = String(e); }

      console.group('[diagnostic] dumpAppState');
      console.log(snapshot);
      console.groupEnd();

      if (diagAppStateEl) {
        diagAppStateEl.textContent = JSON.stringify({ lastDump: snapshot.timestamp, appState: snapshot.appState }, null, 0);
      }
      return snapshot;
    } catch (err) {
      console.error('dumpAppState failed', err);
      throw err;
    }
  }

  if (diagRefreshBtn) {
    diagRefreshBtn.addEventListener('click', async () => {
      await renderDiagnostics();
    });
  }

  // Dump storage button (dev-only)
  const dumpBtn = $('dumpStorageBtn');
  if (dumpBtn) {
    dumpBtn.addEventListener('click', async () => {
      try {
        await dumpAppState();
        alert('Storage dumped to console and diagnostics panel.');
      } catch (e) {
        console.error('dump failed', e);
        alert('Dump failed; see console.');
      }
    });
  }

  if (diagEnsureBtn) {
    diagEnsureBtn.addEventListener('click', async () => {
      if (typeof window.ensureStoresExist === 'function') {
        try {
          await window.ensureStoresExist(['mock_entries', 'mock_outbox', 'mock_audio_notes']);
          await renderDiagnostics();
          alert('Ensure stores: complete');
        } catch (e) {
          console.error('ensureStoresExist failed', e);
          alert('Ensure stores failed. Check console.');
        }
      }
    });
  }

  // Render diagnostics once at init
  renderDiagnostics().catch((e) => { console.warn('renderDiagnostics failed', e); });

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

  initializeVoiceControls();

  document.addEventListener('click', e => {
    if (e.target.classList.contains('toggle-domain')) {
      const domain = e.target.dataset.domain;
      appState.visibleAspects[domain] = !appState.visibleAspects[domain];
      e.target.textContent = appState.visibleAspects[domain] ? 'HIDE' : 'SHOW';
      updateVisibleAspects();
      renderAspectsManager();
      try {
        localStorage.setItem('visibleAspects', JSON.stringify(appState.visibleAspects));
      } catch (e) {
        // ignore quota errors
      }
    }
  });

  await showSafe(refreshDomainScorePanel);

  await showSafe(renderAspectsManager);

  await showSafe(initializeAudioNotesList);

  // If mock data flag is set, load or seed mock data before loading
  if (appState.useMock && typeof window.seedMockData === 'function') {
    try {
      logInit('seeding mock data');
      await window.seedMockData();
      logInit('mock data seeded');
    } catch (e) {
      console.warn('seedMockData failed', e);
    }
  }

  try {
    logInit('loading today data');
    await loadTodayData();
    logInit('today data loaded');
  } catch (e) {
    console.error('loadTodayData failed', e);
    const panel = $('runtimeErrorContent'); if (panel) panel.textContent = `loadTodayData failed: ${e && e.message ? e.message : String(e)}`;
    const container = $('runtimeErrorPanel'); if (container) container.classList.remove('hidden');
  }

  showScreen('todayScreen');
}

const voiceState = {
  mediaRecorder: null,
  stream: null,
  chunks: [],
  recognition: null,
  recognitionShouldRestart: false,
  isRecording: false,
  finalTranscript: '',
  interimTranscript: '',
  transcriptionPromise: Promise.resolve(''),
  resolveTranscriptionPromise: null,
  recordingStartedAt: 0,
  recordingTimerId: null,
};

function supportsSpeechRecognition() {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

function getCurrentTranscript() {
  return `${voiceState.finalTranscript} ${voiceState.interimTranscript}`.trim();
}

function prepareTranscriptionCapture() {
  if (voiceState.resolveTranscriptionPromise) {
    voiceState.resolveTranscriptionPromise(getCurrentTranscript());
  }
  voiceState.transcriptionPromise = new Promise(resolve => {
    voiceState.resolveTranscriptionPromise = resolve;
  });
}

function resolveTranscriptionCapture(value = getCurrentTranscript()) {
  const text = typeof value === 'string' ? value : getCurrentTranscript();
  if (voiceState.resolveTranscriptionPromise) {
    voiceState.resolveTranscriptionPromise(text);
    voiceState.resolveTranscriptionPromise = null;
  }
  voiceState.transcriptionPromise = Promise.resolve(text);
  return text;
}

async function waitForFinalTranscript() {
  try {
    const result = await voiceState.transcriptionPromise;
    return typeof result === 'string' ? result.trim() : '';
  } catch (error) {
    console.warn('Transcription wait failed', error);
    return getCurrentTranscript();
  }
}

function formatRecordingDuration(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function showRecordingIndicator() {
  const indicator = $('recordingIndicator');
  const timer = $('recordingTimer');
  if (!indicator || !timer) {
    return;
  }

  voiceState.recordingStartedAt = Date.now();
  timer.textContent = '0:00';
  indicator.classList.remove('hidden');

  if (voiceState.recordingTimerId) {
    clearInterval(voiceState.recordingTimerId);
  }

  voiceState.recordingTimerId = setInterval(() => {
    timer.textContent = formatRecordingDuration(Date.now() - voiceState.recordingStartedAt);
  }, 250);
}

function hideRecordingIndicator() {
  const indicator = $('recordingIndicator');
  const timer = $('recordingTimer');
  if (voiceState.recordingTimerId) {
    clearInterval(voiceState.recordingTimerId);
    voiceState.recordingTimerId = null;
  }
  if (timer && voiceState.recordingStartedAt) {
    timer.textContent = formatRecordingDuration(Date.now() - voiceState.recordingStartedAt);
  }
  voiceState.recordingStartedAt = 0;
  if (indicator) {
    indicator.classList.add('hidden');
  }
}

const setVoiceStatus = (() => {
  let hideTimer = null;
  return (message, { tone = 'muted', persist = false } = {}) => {
    const status = $('voiceStatus');
    if (!status) {
      return;
    }

    if (!message) {
      status.textContent = '';
      status.classList.add('hidden');
      status.removeAttribute('data-tone');
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
      return;
    }

    status.textContent = message;
    status.dataset.tone = tone;
    status.classList.remove('hidden');

    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }

    if (!persist) {
      hideTimer = setTimeout(() => {
        status.textContent = '';
        status.classList.add('hidden');
        status.removeAttribute('data-tone');
        hideTimer = null;
      }, 6000);
    }
  };
})();

function resetTranscriptState() {
  voiceState.finalTranscript = '';
  voiceState.interimTranscript = '';
}

function updateTranscriptionPreview() {
  const preview = $('transcriptionPreview');
  const content = $('transcriptionContent');
  const copyButton = $('copyTranscription');
  if (!preview || !content || !copyButton) {
    return;
  }

  const transcript = getCurrentTranscript();
  if (transcript) {
    content.textContent = transcript;
    preview.classList.remove('hidden');
    copyButton.disabled = false;
  } else {
    content.textContent = '';
    copyButton.disabled = true;
    if (!voiceState.isRecording) {
      preview.classList.add('hidden');
    }
  }
}

function clearTranscriptionPreview({ hide = true } = {}) {
  const preview = $('transcriptionPreview');
  const content = $('transcriptionContent');
  const copyButton = $('copyTranscription');
  if (content) {
    content.textContent = '';
  }
  if (copyButton) {
    copyButton.disabled = true;
  }
  if (hide && preview) {
    preview.classList.add('hidden');
  }
}

async function copyTextToClipboard(text) {
  if (!text) {
    return;
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const helper = document.createElement('textarea');
  helper.value = text;
  helper.setAttribute('readonly', '');
  helper.style.position = 'absolute';
  helper.style.left = '-9999px';
  document.body.appendChild(helper);
  helper.select();
  document.execCommand('copy');
  document.body.removeChild(helper);
}

function initializeVoiceControls() {
  const voiceButton = $('voiceButton');
  if (!voiceButton) {
    return;
  }

  const copyButton = $('copyTranscription');
  if (copyButton) {
    copyButton.addEventListener('click', async () => {
      const content = $('transcriptionContent');
      const text = content?.textContent?.trim() || '';
      if (!text) {
        setVoiceStatus('No transcription captured yet.', { tone: 'warning' });
        return;
      }
      try {
        await copyTextToClipboard(text);
        setVoiceStatus('Transcription copied to clipboard.', { tone: 'success' });
      } catch (error) {
        console.error('Copy failed', error);
        setVoiceStatus('Unable to copy transcription.', { tone: 'error' });
      }
    });
  }

  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder !== 'function') {
    voiceButton.disabled = true;
    setVoiceStatus('Microphone recording is not supported in this browser.', { tone: 'error', persist: true });
    return;
  }

  if (supportsSpeechRecognition()) {
    setVoiceStatus('Tap to record. Live transcription is available.', { tone: 'muted' });
  } else {
    setVoiceStatus('Tap to record. Add transcription manually after saving.', { tone: 'warning', persist: true });
  }

  const label = voiceButton.querySelector('span:last-child');

  const stopStream = () => {
    if (voiceState.stream) {
      try {
        voiceState.stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.warn('Stream cleanup failed', error);
      }
      voiceState.stream = null;
    }
  };

  const teardownRecording = ({ hidePreview = false } = {}) => {
    voiceState.isRecording = false;
    voiceState.recognitionShouldRestart = false;
    voiceState.mediaRecorder = null;
    voiceState.chunks = [];
    stopRecognition();
    stopStream();
    hideRecordingIndicator();

    voiceButton.classList.remove('recording', 'processing');
    voiceButton.disabled = false;
    voiceButton.setAttribute('aria-pressed', 'false');
    if (label) {
      label.textContent = 'RECORD AUDIO NOTE';
    }

    if (hidePreview) {
      clearTranscriptionPreview({ hide: true });
    } else {
      updateTranscriptionPreview();
    }
  };

  const stopRecognition = () => {
    if (!voiceState.recognition) {
      resolveTranscriptionCapture();
      return;
    }
    try {
      voiceState.recognitionShouldRestart = false;
      voiceState.recognition.stop();
    } catch (error) {
      console.warn('Failed to stop recognition', error);
      resolveTranscriptionCapture();
    }
  };

  const startSpeechRecognition = () => {
    if (!supportsSpeechRecognition()) {
      resolveTranscriptionCapture('');
      resetTranscriptState();
      clearTranscriptionPreview({ hide: false });
      updateTranscriptionPreview();
      setVoiceStatus('Recording… automatic transcription unavailable.', { tone: 'warning' });
      return;
    }

    const RecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    try {
      prepareTranscriptionCapture();
      const recognition = new RecognitionCtor();
      voiceState.recognition = recognition;
      voiceState.recognitionShouldRestart = true;
      resetTranscriptState();
      clearTranscriptionPreview({ hide: true });
      updateTranscriptionPreview();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = 'en-US';

      recognition.onresult = event => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (!result || !result[0]) {
            continue;
          }
          const text = result[0].transcript.trim();
          if (result.isFinal) {
            voiceState.finalTranscript = `${voiceState.finalTranscript} ${text}`.trim();
          } else {
            interim = `${interim} ${text}`.trim();
          }
        }
        voiceState.interimTranscript = interim;
        updateTranscriptionPreview();
      };

      recognition.onerror = event => {
        console.warn('Speech recognition error', event.error);
        if (event.error === 'no-speech') {
          setVoiceStatus('No speech detected. Audio will still be saved.', { tone: 'warning' });
          return;
        }
        if (event.error === 'aborted') {
          return;
        }
        voiceState.recognitionShouldRestart = false;
        resolveTranscriptionCapture();
        setVoiceStatus('Speech recognition stopped. You can edit transcription manually.', { tone: 'warning', persist: true });
        try {
          recognition.stop();
        } catch (error) {
          console.warn('Recognition stop after error failed', error);
        }
      };

      recognition.onend = () => {
        voiceState.interimTranscript = '';
        updateTranscriptionPreview();
        if (voiceState.recognitionShouldRestart) {
          try {
            recognition.start();
          } catch (error) {
            console.warn('Failed to restart recognition', error);
            voiceState.recognitionShouldRestart = false;
            voiceState.recognition = null;
            resolveTranscriptionCapture();
          }
        } else {
          voiceState.recognition = null;
          resolveTranscriptionCapture();
        }
      };

      recognition.start();
      setVoiceStatus('Recording… live transcription active.', { tone: 'muted' });
    } catch (error) {
      console.warn('Speech recognition initialization failed', error);
      resolveTranscriptionCapture('');
      resetTranscriptState();
      clearTranscriptionPreview({ hide: false });
      updateTranscriptionPreview();
      setVoiceStatus('Unable to start speech recognition. Edit transcription manually.', { tone: 'warning', persist: true });
    }
  };

  const startRecording = async () => {
    if (voiceState.isRecording) {
      return;
    }

    voiceButton.disabled = true;
    voiceButton.classList.remove('processing');
    voiceButton.classList.add('recording');
    voiceButton.setAttribute('aria-pressed', 'true');
    if (label) {
      label.textContent = 'STOP RECORDING';
    }

    setVoiceStatus('Preparing microphone…', { tone: 'muted' });

    try {
      voiceState.stream = await navigator.mediaDevices.getUserMedia({
        audio: { noiseSuppression: true, echoCancellation: true },
      });

      voiceState.mediaRecorder = new MediaRecorder(voiceState.stream);
      voiceState.chunks = [];
      voiceState.mediaRecorder.addEventListener('dataavailable', event => {
        if (event.data && event.data.size > 0) {
          voiceState.chunks.push(event.data);
        }
      });
      voiceState.mediaRecorder.addEventListener('error', event => {
        console.error('Recording error', event.error || event);
        setVoiceStatus('Recording failed. Please try again.', { tone: 'error', persist: true });
        teardownRecording({ hidePreview: true });
      });
      voiceState.mediaRecorder.addEventListener('stop', async () => {
        const blob = new Blob(voiceState.chunks, {
          type: voiceState.mediaRecorder?.mimeType || 'audio/webm',
        });

        try {
          setVoiceStatus('Encoding audio…', { tone: 'muted' });
          const mp3Blob = await encodeToMP3(blob);
          const today = new Date().toISOString().split('T')[0];
          const transcript = await waitForFinalTranscript();
          voiceState.finalTranscript = transcript;
          voiceState.interimTranscript = '';
          updateTranscriptionPreview();
          await window.saveAudioNote(today, mp3Blob, transcript);
          if (transcript) {
            setVoiceStatus('Audio note saved with transcription.', { tone: 'success' });
          } else {
            setVoiceStatus('Audio note saved. Add a transcription when ready.', { tone: 'warning' });
          }
          renderAudioNotes();
        } catch (error) {
          console.error('Audio processing failed', error);
          setVoiceStatus('Failed to save audio note. Please retry.', { tone: 'error', persist: true });
          teardownRecording({ hidePreview: true });
          return;
        }

        teardownRecording({ hidePreview: false });
      });

      voiceState.mediaRecorder.start();
      voiceState.isRecording = true;
      voiceButton.disabled = false;
      resetTranscriptState();
      clearTranscriptionPreview({ hide: true });
      updateTranscriptionPreview();
      startSpeechRecognition();
      showRecordingIndicator();
    } catch (error) {
      console.error('Microphone access failed', error);
      setVoiceStatus('Microphone access denied or unavailable.', { tone: 'error', persist: true });
      teardownRecording({ hidePreview: true });
    }
  };

  const stopRecording = () => {
    if (!voiceState.isRecording || !voiceState.mediaRecorder) {
      return;
    }
    voiceState.isRecording = false;
    voiceButton.classList.remove('recording');
    voiceButton.classList.add('processing');
    voiceButton.disabled = true;
    hideRecordingIndicator();
    setVoiceStatus('Processing audio note…', { tone: 'muted' });
    stopRecognition();
    try {
      voiceState.mediaRecorder.stop();
    } catch (error) {
      console.error('Failed to stop recorder', error);
      teardownRecording({ hidePreview: true });
    }
  };

  voiceButton.addEventListener('click', () => {
    if (voiceButton.disabled) {
      return;
    }
    if (voiceState.isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  });

  window.addEventListener('pagehide', () => {
    if (voiceState.isRecording) {
      stopRecording();
    }
  });
}

// Audio recording functions
function encodeToMP3(blob) {
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (typeof lamejs === 'undefined' || typeof lamejs.Mp3Encoder !== 'function' || !AudioContextCtor) {
    return Promise.resolve(blob);
  }

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onerror = () => {
      console.warn('Audio read failed, using original blob.', reader.error);
      resolve(blob);
    };

    reader.onload = async () => {
      const audioContext = new AudioContextCtor();
      try {
        const arrayBuffer = reader.result;
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const channelCount = audioBuffer.numberOfChannels;
        let samples = audioBuffer.getChannelData(0);

        if (channelCount > 1) {
          const mixed = new Float32Array(audioBuffer.length);
          for (let channel = 0; channel < channelCount; channel++) {
            const channelSamples = audioBuffer.getChannelData(channel);
            for (let i = 0; i < mixed.length; i++) {
              mixed[i] += channelSamples[i];
            }
          }
          for (let i = 0; i < mixed.length; i++) {
            mixed[i] /= channelCount;
          }
          samples = mixed;
        }

        const mp3encoder = new lamejs.Mp3Encoder(1, audioBuffer.sampleRate, 128);
        const sampleBlockSize = 1152;
        const mp3Data = [];

        for (let i = 0; i < samples.length; i += sampleBlockSize) {
          const end = Math.min(i + sampleBlockSize, samples.length);
          const chunk = samples.subarray(i, end);
          const int16Samples = new Int16Array(chunk.length);
          for (let j = 0; j < chunk.length; j++) {
            const sample = Math.max(-1, Math.min(1, chunk[j]));
            int16Samples[j] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
          }
          const mp3buf = mp3encoder.encodeBuffer(int16Samples);
          if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
          }
        }

        const flush = mp3encoder.flush();
        if (flush.length > 0) {
          mp3Data.push(flush);
        }

        if (mp3Data.length > 0) {
          resolve(new Blob(mp3Data, { type: 'audio/mp3' }));
        } else {
          resolve(blob);
        }
      } catch (error) {
        console.warn('MP3 encoding failed, using original blob.', error);
        resolve(blob);
      } finally {
        audioContext.close().catch(() => {});
      }
    };

    reader.readAsArrayBuffer(blob);
  });
}

const HTML_ESCAPE_LOOKUP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function escapeHTML(value) {
  return (value ?? '').replace(/[&<>"']/g, char => HTML_ESCAPE_LOOKUP[char] || char);
}

function formatAudioNoteTime(timestamp) {
  if (!timestamp) {
    return '—';
  }
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function initializeAudioNotesList() {
  const list = $('audioNotesList');
  if (!list || list.dataset.bound === 'true') {
    return;
  }

  list.dataset.bound = 'true';

  list.addEventListener('input', event => {
    if (!event.target.matches('[data-role="transcription"]')) {
      return;
    }

    const textarea = event.target;
    const container = textarea.closest('.audio-note');
    if (!container) {
      return;
    }

    const saveButton = container.querySelector('[data-action="save-transcription"]');
    const copyButton = container.querySelector('[data-action="copy-transcription"]');
    const originalValue = decodeURIComponent(textarea.dataset.originalValue || '');
    const currentValue = textarea.value;

    if (saveButton) {
      saveButton.disabled = currentValue.trim() === originalValue.trim();
      if (!saveButton.disabled) {
        saveButton.textContent = 'Save';
      }
    }

    if (copyButton) {
      copyButton.disabled = currentValue.trim().length === 0;
    }
  });

  list.addEventListener('click', async event => {
    const button = event.target.closest('button[data-action]');
    if (!button) {
      return;
    }

    event.preventDefault();

    const container = button.closest('.audio-note');
    if (!container) {
      return;
    }

    const noteId = container.dataset.noteId;
    if (!noteId) {
      return;
    }

    if (button.dataset.action === 'save-transcription') {
      const textarea = container.querySelector('[data-role="transcription"]');
      if (!textarea) {
        return;
      }
      button.disabled = true;
      button.textContent = 'Saving…';
      try {
        await updateTranscription(noteId, textarea.value, { button, textarea });
      } catch (error) {
        console.error('Transcription save failed', error);
      }
      return;
    }

    if (button.dataset.action === 'copy-transcription') {
      const textarea = container.querySelector('[data-role="transcription"]');
      const text = textarea?.value?.trim() || '';
      if (!text) {
        setVoiceStatus('No transcription to copy.', { tone: 'warning' });
        return;
      }
      try {
        await copyTextToClipboard(text);
        setVoiceStatus('Transcription copied to clipboard.', { tone: 'success' });
      } catch (error) {
        console.error('Copy failed', error);
        setVoiceStatus('Unable to copy transcription.', { tone: 'error' });
      }
    }
  });
}

// Render audio notes for today
function renderAudioNotes() {
  const list = $('audioNotesList');
  if (!list) {
    return;
  }

  if (Array.isArray(list._activeUrls)) {
    list._activeUrls.forEach(url => {
      try {
        URL.revokeObjectURL(url);
      } catch (error) {
        console.warn('Failed to revoke audio URL', error);
      }
    });
  }
  list._activeUrls = [];

  const today = new Date().toISOString().split('T')[0];
  window.getAudioNotes(today)
    .then(notes => {
      if (!Array.isArray(notes) || notes.length === 0) {
        list.innerHTML = '<p class="audio-note-empty">No audio notes logged today.</p>';
        return;
      }

      notes.sort((a, b) => {
        const timeA = new Date(a.timestamp || 0).getTime();
        const timeB = new Date(b.timestamp || 0).getTime();
        return timeB - timeA;
      });

      const markup = notes
        .map(note => {
          const audioUrl = URL.createObjectURL(note.blob);
          list._activeUrls.push(audioUrl);
          const transcription = typeof note.transcription === 'string' ? note.transcription : '';
          const encodedOriginal = encodeURIComponent(transcription || '');
          const safeTranscription = escapeHTML(transcription);
          const displayTime = formatAudioNoteTime(note.timestamp);
          return `
            <article class="audio-note" data-note-id="${note.id}">
              <header class="audio-note-header">
                <span class="audio-note-time">${displayTime}</span>
                <button type="button" class="audio-note-copy" data-action="copy-transcription"${transcription ? '' : ' disabled'}>Copy text</button>
              </header>
              <audio controls src="${audioUrl}"></audio>
              <label class="audio-note-label" for="transcription-${note.id}">Transcription</label>
              <textarea id="transcription-${note.id}" data-role="transcription" data-original-value="${encodedOriginal}" placeholder="Add or edit transcription…">${safeTranscription}</textarea>
              <div class="audio-note-actions">
                <button type="button" class="audio-note-save" data-action="save-transcription" disabled>Save</button>
                <a href="${audioUrl}" download="audio-${note.id}.mp3">Download MP3</a>
              </div>
            </article>
          `;
        })
        .join('');

      list.innerHTML = markup;
    })
    .catch(error => {
      console.error('Failed to load audio notes', error);
      list.innerHTML = '<p class="audio-note-empty">Unable to load audio notes.</p>';
    });
}

function updateTranscription(id, text, { button, textarea } = {}) {
  if (!id) {
    return Promise.resolve();
  }

  const trimmed = (text || '').trim();
  const savePromise = window.updateAudioTranscription(id, trimmed);

  return savePromise
    .then(() => {
      if (textarea) {
        textarea.dataset.originalValue = encodeURIComponent(trimmed);
      }
      if (button) {
        button.textContent = 'Saved';
        button.disabled = true;
        setTimeout(() => {
          if (button.dataset.action === 'save-transcription') {
            button.textContent = 'Save';
          }
        }, 1800);
      }
      setVoiceStatus('Transcription saved.', { tone: 'success' });
    })
    .catch(error => {
      if (button) {
        button.disabled = false;
        button.textContent = 'Retry';
        setTimeout(() => {
          if (button.dataset.action === 'save-transcription') {
            button.textContent = 'Save';
          }
        }, 1800);
      }
      setVoiceStatus('Failed to save transcription. Try again.', { tone: 'error', persist: true });
      throw error;
    });
}

// Expose for testing and cross-script usage
window.initializeUI = initializeUI;
window.renderAspectsManager = renderAspectsManager;
window.updateProgress = updateProgress;
window.renderAudioNotes = renderAudioNotes;
window.updateTranscription = updateTranscription;
