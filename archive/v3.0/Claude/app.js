const data = JSON.parse(localStorage.getItem('lifeTracker') || '{}');
const defaults = { wake: '', rest: '', run: 0, strength: false, skill: false, read: false, write: false, quadrant: 0, meditation: false };
Object.keys(defaults).forEach(k => { if (!(k in data)) data[k] = defaults[k]; });

function save() { localStorage.setItem('lifeTracker', JSON.stringify(data)); updateScores(); }
function updateScores() {
  const scores = {
    sleep: calcSleep(),
    fitness: calcFitness(),
    mind: calcMind(),
    spirit: calcSpirit()
  };
  Object.keys(scores).forEach(d => {
    document.getElementById(`${d}-score`).textContent = scores[d];
    document.getElementById(`${d}-card`).textContent = scores[d];
  });
}

function calcSleep() {
  if (!data.wake || !data.rest) return 0;
  const [wh, wm] = data.wake.split(':').map(Number);
  const [rh, rm] = data.rest.split(':').map(Number);
  const wake = wh * 60 + wm;
  const rest = rh * 60 + rm;
  const duration = rest < wake ? (1440 - wake + rest) : (rest - wake);
  const hours = duration / 60;
  if (hours >= 7 && hours <= 9) return 100;
  if (hours >= 6 && hours < 7) return 80;
  if (hours > 9 && hours <= 10) return 80;
  if (hours >= 5 && hours < 6) return 60;
  if (hours > 10 && hours <= 11) return 60;
  return 40;
}

function calcFitness() {
  let score = 0;
  if (data.run >= 20) score += 40;
  else if (data.run >= 10) score += 30;
  else if (data.run >= 5) score += 20;
  if (data.strength) score += 30;
  if (data.skill) score += 30;
  return Math.min(100, score);
}

function calcMind() {
  let score = 0;
  if (data.read) score += 50;
  if (data.write) score += 50;
  return score;
}

function calcSpirit() {
  let score = 0;
  if (data.quadrant === 1 || data.quadrant === 2) score += 50;
  else if (data.quadrant === 3 || data.quadrant === 4) score += 25;
  if (data.meditation) score += 50;
  return Math.min(100, score);
}

document.getElementById('date').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', () => {
    document.getElementById(`${card.dataset.domain}-overlay`).classList.add('active');
    loadOverlayData(card.dataset.domain);
  });
});

function closeOverlay(domain) { document.getElementById(`${domain}-overlay`).classList.remove('active'); }

function loadOverlayData(domain) {
  if (domain === 'sleep') {
    document.getElementById('wake-time').value = data.wake;
    document.getElementById('rest-time').value = data.rest;
  } else if (domain === 'fitness') {
    document.getElementById('run-value').textContent = data.run;
    updateBtn('strength', data.strength);
    updateBtn('skill', data.skill);
  } else if (domain === 'mind') {
    updateBtn('read', data.read);
    updateBtn('write', data.write);
  } else if (domain === 'spirit') {
    document.querySelectorAll('.quad-btn').forEach(b => b.classList.remove('active'));
    if (data.quadrant) document.getElementById(`quad-${data.quadrant}`).classList.add('active');
    updateBtn('meditation', data.meditation);
  }
}

function updateBtn(type, value) {
  document.getElementById(`${type}-no`).classList.toggle('active', !value);
  document.getElementById(`${type}-yes`).classList.toggle('active', value);
}

document.getElementById('wake-time').addEventListener('change', e => { data.wake = e.target.value; save(); });
document.getElementById('rest-time').addEventListener('change', e => { data.rest = e.target.value; save(); });

function adjustRun(delta) {
  data.run = Math.max(0, Math.min(100, data.run + delta));
  document.getElementById('run-value').textContent = data.run;
  save();
}

function setStrength(v) { data.strength = v; updateBtn('strength', v); save(); }
function setSkill(v) { data.skill = v; updateBtn('skill', v); save(); }
function setRead(v) { data.read = v; updateBtn('read', v); save(); }
function setWrite(v) { data.write = v; updateBtn('write', v); save(); }
function setQuadrant(q) {
  data.quadrant = q;
  document.querySelectorAll('.quad-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`quad-${q}`).classList.add('active');
  save();
}
function setMeditation(v) { data.meditation = v; updateBtn('meditation', v); save(); }

if ('serviceWorker' in navigator) { navigator.serviceWorker.register('sw.js'); }
updateScores();