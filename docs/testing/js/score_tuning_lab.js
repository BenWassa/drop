(function () {
  'use strict';

  const DOMAINS = ['sleep', 'fitness', 'mind', 'spirit'];
  const DOMAIN_LABELS = {
    sleep: 'Sleep',
    fitness: 'Fitness',
    mind: 'Mind',
    spirit: 'Spirit'
  };
  const STRENGTH_RATIOS = { 1: 15 / 35, 2: 25 / 35, 3: 1 };
  const READ_RATIOS = [0, 25 / 60, 35 / 60, 1];
  const WRITE_RATIOS = [0, 25 / 60, 35 / 60, 1];
  const MIN_HISTORY = { sleep: 3, fitness: 7, mind: 7, spirit: 7 };
  const DEFAULT_PARAMS = {
    fitness: { skill: 50, strength: 35, runScale: 15, runMax: 50 },
    mind: { read3: 60, write3: 60, synergy: 10 },
    spirit: { base: 70, bonus: 30 }
  };
  const ACTIVITY_PATTERNS = [
    {
      name: 'restDay',
      weight: 0.2,
      run: [0, 3],
      strength: [false],
      strength_level: [0],
      skill: [[], ['Mobility'], ['Yoga']],
      read_level: [1, 2, 3],
      write_level: [0, 1, 2],
      meditation: [true, false]
    },
    {
      name: 'lightDay',
      weight: 0.4,
      run: [3, 5, 8],
      strength: [false, true],
      strength_level: [1],
      skill: [[], ['Mobility'], ['Yoga'], ['Wrestling'], ['Volleyball']],
      read_level: [1, 2],
      write_level: [0, 1],
      meditation: [true, false]
    },
    {
      name: 'activeDay',
      weight: 0.3,
      run: [8, 10, 12, 15],
      strength: [true, false],
      strength_level: [1, 2],
      skill: [
        ['Wrestling'],
        ['Volleyball'],
        ['Wrestling', 'Mobility'],
        ['Volleyball', 'Yoga']
      ],
      read_level: [0, 1, 2],
      write_level: [0, 1],
      meditation: [true, false]
    },
    {
      name: 'intenseDay',
      weight: 0.1,
      run: [15, 18, 20],
      strength: [false],
      strength_level: [0],
      skill: [[], ['Mobility']],
      read_level: [0, 1],
      write_level: [0],
      meditation: [true, false]
    }
  ];

  const QUADRANT_BASELINES = {
    0: { energy: 0, mood: 0 },
    1: { energy: 60, mood: 65 },
    2: { energy: -55, mood: 55 },
    3: { energy: 55, mood: -55 },
    4: { energy: -60, mood: -60 }
  };

  let currentParams = clone(DEFAULT_PARAMS);
  let historyEntries = [];
  let datasetSource = 'Sample';
  let canvas;
  let datasetMetaEl;
  let simulationSummaryEl;
  let runSimulationsBtn;
  let runsSelect;
  let summaryChipEls = {};
  let colorMap = {
    sleep: '#1e90ff',
    fitness: '#ff3b30',
    mind: '#7c3aed',
    spirit: '#16a34a'
  };

  window.generateMockData = generateMockData;
  window.loadSampleData = loadSampleData;
  window.resetToDefaults = resetToDefaults;
  window.exportConfig = exportConfig;
  window.loadPreset = loadPreset;
  window.updateParams = updateParams;
  window.showDomainTab = showDomainTab;

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    canvas = document.getElementById('scoreChart');
    datasetMetaEl = document.getElementById('dataset-meta');
    simulationSummaryEl = document.getElementById('simulation-summary');
    runSimulationsBtn = document.getElementById('run-simulations-btn');
    runsSelect = document.getElementById('simulation-runs');

    summaryChipEls = {
      sleep: document.getElementById('summary-sleep'),
      fitness: document.getElementById('summary-fitness'),
      mind: document.getElementById('summary-mind'),
      spirit: document.getElementById('summary-spirit')
    };

    colorMap = {
      sleep: getCssVar('--sleep', colorMap.sleep),
      fitness: getCssVar('--fitness', colorMap.fitness),
      mind: getCssVar('--mind', colorMap.mind),
      spirit: getCssVar('--spirit', colorMap.spirit)
    };

    if (runSimulationsBtn && runsSelect) {
      runSimulationsBtn.addEventListener('click', () => {
        const runs = parseInt(runsSelect.value, 10) || 1;
        runMonteCarlo(runs);
      });
    }

    updateParams();
    showDomainTab('sleep'); // Initialize first tab
    loadSampleData().then((loaded) => {
      if (!loaded) {
        generateMockData();
      }
    });
  }

  function updateParams() {
    const skillInput = document.getElementById('fitness-skill');
    if (!skillInput) {
      return;
    }

    const skill = Number(skillInput.value);
    const strength = Number(document.getElementById('fitness-strength').value);
    const runScale = Number(document.getElementById('fitness-run').value);
    const mindRead3 = Number(document.getElementById('mind-read3').value);
    const mindWrite3 = Number(document.getElementById('mind-write3').value);
    const mindSynergy = Number(document.getElementById('mind-synergy').value);
    const spiritBase = Number(document.getElementById('spirit-base').value);
    const spiritBonus = Number(document.getElementById('spirit-bonus').value);

    setText('fitness-skill-val', skill);
    setText('fitness-strength-val', strength);
    setText('fitness-run-val', runScale);
    setText('mind-read3-val', mindRead3);
    setText('mind-write3-val', mindWrite3);
    setText('mind-synergy-val', mindSynergy);
    setText('spirit-base-val', spiritBase);
    setText('spirit-bonus-val', spiritBonus);

    currentParams = {
      fitness: { skill, strength, runScale, runMax: DEFAULT_PARAMS.fitness.runMax },
      mind: { read3: mindRead3, write3: mindWrite3, synergy: mindSynergy },
      spirit: { base: spiritBase, bonus: spiritBonus }
    };

    recompute();
  }

  function resetToDefaults() {
    setSlider('fitness-skill', DEFAULT_PARAMS.fitness.skill);
    setSlider('fitness-strength', DEFAULT_PARAMS.fitness.strength);
    setSlider('fitness-run', DEFAULT_PARAMS.fitness.runScale);
    setSlider('mind-read3', DEFAULT_PARAMS.mind.read3);
    setSlider('mind-write3', DEFAULT_PARAMS.mind.write3);
    setSlider('mind-synergy', DEFAULT_PARAMS.mind.synergy);
    setSlider('spirit-base', DEFAULT_PARAMS.spirit.base);
    setSlider('spirit-bonus', DEFAULT_PARAMS.spirit.bonus);
    updateParams();
  }

  function loadPreset(preset) {
    switch (preset) {
      case 'baseline':
        setSlider('fitness-skill', 50);
        setSlider('fitness-strength', 35);
        setSlider('fitness-run', 15);
        setSlider('mind-read3', 60);
        setSlider('mind-write3', 60);
        setSlider('mind-synergy', 10);
        setSlider('spirit-base', 70);
        setSlider('spirit-bonus', 30);
        break;
      case 'burnout':
        setSlider('fitness-skill', 30);
        setSlider('fitness-strength', 20);
        setSlider('fitness-run', 12);
        setSlider('mind-read3', 45);
        setSlider('mind-write3', 40);
        setSlider('mind-synergy', 6);
        setSlider('spirit-base', 80);
        setSlider('spirit-bonus', 35);
        break;
      case 'recovery':
        setSlider('fitness-skill', 40);
        setSlider('fitness-strength', 25);
        setSlider('fitness-run', 12);
        setSlider('mind-read3', 55);
        setSlider('mind-write3', 50);
        setSlider('mind-synergy', 8);
        setSlider('spirit-base', 75);
        setSlider('spirit-bonus', 32);
        break;
      default:
        return;
    }
    updateParams();
  }

  function exportConfig() {
    const config = {
      version: '2.0',
      timestamp: new Date().toISOString(),
      parameters: currentParams,
      dataset: historyEntries.length
        ? {
            source: datasetSource,
            start: historyEntries[0].date,
            end: historyEntries[historyEntries.length - 1].date,
            days: historyEntries.length
          }
        : null
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `scoring-config-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function showDomainTab(domain) {
    // Hide all tabs
    document.querySelectorAll('.domain-details').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    // Show selected tab
    document.getElementById(domain + '-tab').classList.add('active');
    document.querySelector(`[onclick="showDomainTab('${domain}')"]`).classList.add('active');
  }

  function loadSampleData(file = '../data/sample-data-30days.json') {
    if (typeof fetch !== 'function') {
      generateMockData();
      return Promise.resolve(false);
    }

    return fetch(file)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      })
      .then((json) => {
        if (!json || !json.entries) {
          throw new Error('Invalid sample data');
        }

        const sorted = Object.keys(json.entries)
          .sort()
          .map((dateKey) => normalizeEntry(dateKey, json.entries[dateKey]));

        historyEntries = sorted.slice(-7);
        datasetSource = file.includes('30') ? 'Sample (30-day)' : 'Sample';
        updateDatasetMeta(datasetSource, historyEntries);
        recompute();
        return true;
      })
      .catch((error) => {
        console.warn('Failed to load sample data', error);
        return false;
      });
  }

  function generateMockData(days = 14, seed = Date.now()) {
    const synthetic = generateRealisticHistory(days, seed);
    historyEntries = synthetic.slice(-7);
    datasetSource = `Synthetic (seed ${seed})`;
    updateDatasetMeta(datasetSource, historyEntries);
    recompute();
  }

  function recompute() {
    if (!historyEntries.length) {
      updateScoreCards([]);
      updateLatestSummary([]);
      drawChart([]);
      updateDetailsTables([]);
      return;
    }

    const scores = computeScores(historyEntries, currentParams);
    updateScoreCards(scores);
    updateLatestSummary(scores);
    drawChart(scores);
    updateDetailsTables(scores);
  }

  function computeScores(entries, params) {
    const buffers = {
      sleep: [],
      fitness: [],
      mind: [],
      spirit: []
    };

    return entries.map((entry, index) => {
      const previous = index > 0 ? entries[index - 1] : null;

      const sleep = computeSleep(entry, previous, buffers.sleep);
      buffers.sleep.push(sleep);
      trimBuffer(buffers.sleep);

      const fitness = computeFitness(entry, params.fitness, buffers.fitness);
      buffers.fitness.push(fitness);
      trimBuffer(buffers.fitness);

      const mind = computeMind(entry, params.mind, buffers.mind);
      buffers.mind.push(mind);
      trimBuffer(buffers.mind);

      const spirit = computeSpirit(entry, params.spirit, buffers.spirit);
      buffers.spirit.push(spirit);
      trimBuffer(buffers.spirit);

      return {
        date: entry.date,
        sleep,
        fitness,
        mind,
        spirit
      };
    });
  }

  function computeSleep(entry, previous, history) {
    const wake = entry.wake;
    const rest = previous && previous.rest ? previous.rest : entry.rest;

    if (!wake || !rest) {
      return finalizeScore('sleep', 0, history);
    }

    const minutes = computeSleepDuration(wake, rest);
    const hours = minutes / 60;

    let raw;
    if (hours >= 7 && hours <= 9) raw = 100;
    else if (hours >= 6 && hours < 7) raw = 85;
    else if (hours > 9 && hours <= 10) raw = 85;
    else if (hours >= 5 && hours < 6) raw = 65;
    else if (hours > 10 && hours <= 11) raw = 65;
    else if (hours >= 4 && hours < 5) raw = 45;
    else if (hours > 11) raw = 50;
    else raw = 30;

    return finalizeScore('sleep', raw, history);
  }

  function computeFitness(entry, params, history) {
    const skillPoints = Array.isArray(entry.skill) && entry.skill.length ? params.skill : 0;
    const strengthLevel = Number(entry.strength_level) || 0;
    const strengthPoints = params.strength * (STRENGTH_RATIOS[strengthLevel] || 0);
    const runDistance = Number(entry.run) || 0;
    let runPoints = 0;

    if (runDistance > 0) {
      runPoints = Math.min(params.runMax, params.runScale * Math.log(runDistance + 1));
    }

    const raw = Math.min(100, Math.max(0, skillPoints + strengthPoints + runPoints));
    return finalizeScore('fitness', raw, history);
  }

  function computeMind(entry, params, history) {
    const readLevel = clamp(Math.floor(Number(entry.read_level) || 0), 0, 3);
    const writeLevel = clamp(Math.floor(Number(entry.write_level) || 0), 0, 3);

    const readPoints = params.read3 * READ_RATIOS[readLevel];
    const writePoints = params.write3 * WRITE_RATIOS[writeLevel];
    const synergy = readLevel > 0 && writeLevel > 0 ? params.synergy : 0;

    const raw = Math.min(100, Math.max(0, readPoints + writePoints + synergy));
    return finalizeScore('mind', raw, history);
  }

  function computeSpirit(entry, params, history) {
    const energy = Number(entry.energy);
    const mood = Number(entry.mood);

    const hasData = Number.isFinite(energy) || Number.isFinite(mood);
    if (!hasData) {
      return finalizeScore('spirit', 0, history);
    }

    const normalizedEnergy = (clamp(Number.isFinite(energy) ? energy : 0, -100, 100) + 100) / 200;
    const normalizedMood = (clamp(Number.isFinite(mood) ? mood : 0, -100, 100) + 100) / 200;
    const blended = (normalizedEnergy * 0.4) + (normalizedMood * 0.6);
    const bonus = Math.round(blended * params.bonus);

    const raw = Math.min(100, Math.max(0, params.base + bonus));
    return finalizeScore('spirit', raw, history);
  }

  function finalizeScore(domain, rawScore, history) {
    const adjusted = applyTrend(domain, rawScore, history, MIN_HISTORY[domain]);
    return clamp(Math.round(adjusted), 0, 99);
  }

  function applyTrend(domain, rawScore, history, minimum) {
    const adjust = typeof window.Scoring !== 'undefined' && typeof window.Scoring.adjustToRealisticRange === 'function'
      ? (value) => window.Scoring.adjustToRealisticRange(value)
      : (value) => value;

    if (!history || history.length < minimum) {
      return adjust(rawScore);
    }

    let weightedTotal = 0;
    let totalWeight = 0;

    history.forEach((score, index) => {
      if (!Number.isFinite(score)) {
        return;
      }
      const daysAgo = history.length - index;
      const weight = Math.pow(0.7, daysAgo - 1);
      weightedTotal += score * weight;
      totalWeight += weight;
    });

    const historicalAverage = totalWeight > 0 ? weightedTotal / totalWeight : rawScore;
    const blended = (rawScore * 0.5) + (historicalAverage * 0.5);
    return adjust(blended);
  }

  function computeSleepRaw(entry, previous) {
    const wake = entry.wake;
    const rest = previous && previous.rest ? previous.rest : entry.rest;

    if (!wake || !rest) {
      return 0;
    }

    const minutes = computeSleepDuration(wake, rest);
    const hours = minutes / 60;

    if (hours >= 7 && hours <= 9) return 100;
    else if (hours >= 6 && hours < 7) return 85;
    else if (hours > 9 && hours <= 10) return 85;
    else if (hours >= 5 && hours < 6) return 65;
    else if (hours > 10 && hours <= 11) return 65;
    else if (hours >= 4 && hours < 5) return 45;
    else if (hours > 11) return 50;
    else return 30;
  }

  function computeFitnessRaw(entry, params) {
    const skillPoints = Array.isArray(entry.skill) && entry.skill.length ? params.skill : 0;
    const strengthLevel = Number(entry.strength_level) || 0;
    const strengthPoints = params.strength * (STRENGTH_RATIOS[strengthLevel] || 0);
    const runDistance = Number(entry.run) || 0;
    let runPoints = 0;

    if (runDistance > 0) {
      runPoints = Math.min(params.runMax, params.runScale * Math.log(runDistance + 1));
    }

    return Math.min(100, skillPoints + strengthPoints + runPoints);
  }

  function computeMindRaw(entry, params) {
    const readLevel = Number(entry.read_level) || 0;
    const writeLevel = Number(entry.write_level) || 0;

    const readPoints = params.read3 * READ_RATIOS[readLevel];
    const writePoints = params.write3 * WRITE_RATIOS[writeLevel];

    let total = readPoints + writePoints;

    if (readLevel > 0 && writeLevel > 0) {
      const synergy = Math.round(((readLevel + writeLevel) / 6) * params.synergy);
      total += synergy;
    }

    return Math.min(99, Math.round(total));
  }

  function computeSpiritRaw(entry, params) {
    const energy = Number(entry.energy);
    const mood = Number(entry.mood);

    const hasData = Number.isFinite(energy) || Number.isFinite(mood);
    if (!hasData) {
      return 0;
    }

    const normalizedEnergy = (clamp(Number.isFinite(energy) ? energy : 0, -100, 100) + 100) / 200;
    const normalizedMood = (clamp(Number.isFinite(mood) ? mood : 0, -100, 100) + 100) / 200;
    const blended = (normalizedEnergy * 0.4) + (normalizedMood * 0.6);
    const bonus = Math.round(blended * params.bonus);

    return Math.min(100, Math.max(0, params.base + bonus));
  }

  function resolveQuadrant(energy, mood) {
    const e = Number(energy) || 0;
    const m = Number(mood) || 0;
    const threshold = 10;

    if (Math.abs(e) < threshold && Math.abs(m) < threshold) {
      return 0;
    }

    if (e >= 0 && m >= 0) return 1;
    if (e < 0 && m >= 0) return 2;
    if (e >= 0 && m < 0) return 3;
    if (e < 0 && m < 0) return 4;

    return 0;
  }

  function runMonteCarlo(runs) {
    if (!simulationSummaryEl) {
      return;
    }

    simulationSummaryEl.innerHTML = '<p class="summary-placeholder">Running simulations...</p>';
    if (runSimulationsBtn) {
      runSimulationsBtn.disabled = true;
    }

    requestAnimationFrame(() => {
      const samples = createSampleBuckets();
      const baseSeed = Date.now();

      for (let i = 0; i < runs; i += 1) {
        const entries = generateRealisticHistory(14, baseSeed + i).slice(-7);
        const scores = computeScores(entries, currentParams);
        const latest = scores[scores.length - 1] || {};

        DOMAINS.forEach((domain) => {
          const value = latest[domain];
          if (Number.isFinite(value)) {
            samples[domain].push(value);
          }
        });
      }

      renderSimulationResults(samples);
      if (runSimulationsBtn) {
        runSimulationsBtn.disabled = false;
      }
    });
  }

  function renderSimulationResults(samples) {
    if (!simulationSummaryEl) {
      return;
    }

    simulationSummaryEl.innerHTML = '';
    let hasData = false;

    DOMAINS.forEach((domain) => {
      const values = samples[domain];
      if (!values || !values.length) {
        return;
      }
      hasData = true;

      const avg = average(values);
      const med = median(values);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const std = standardDeviation(values, avg);

      const card = document.createElement('div');
      card.className = 'simulation-card';
      card.innerHTML = `
        <h4>${DOMAIN_LABELS[domain]}</h4>
        <div class="score-chip ${scoreClass(avg)}">${avg.toFixed(1)}</div>
        <dl>
          <dt>Median</dt><dd>${med.toFixed(1)}</dd>
          <dt>Min</dt><dd>${min.toFixed(1)}</dd>
          <dt>Max</dt><dd>${max.toFixed(1)}</dd>
          <dt>Std Dev</dt><dd>${std.toFixed(1)}</dd>
        </dl>
      `;
      simulationSummaryEl.appendChild(card);
    });

    if (!hasData) {
      const placeholder = document.createElement('p');
      placeholder.className = 'summary-placeholder';
      placeholder.textContent = 'No simulations returned data. Try generating a new dataset or increasing the run count.';
      simulationSummaryEl.appendChild(placeholder);
    }
  }

  function updateScoreCards(series) {
    const latest = series[series.length - 1] || {};
    setScoreValue('sleep-score', latest.sleep);
    setScoreValue('fitness-score', latest.fitness);
    setScoreValue('mind-score', latest.mind);
    setScoreValue('spirit-score', latest.spirit);
  }

  function updateLatestSummary(series) {
    const latest = series[series.length - 1] || {};
    DOMAINS.forEach((domain) => {
      setChip(summaryChipEls[domain], latest[domain]);
    });
  }

  function updateDetailsTables(series) {
    // Update sleep details
    const sleepTable = document.getElementById('sleep-details');
    sleepTable.innerHTML = '';
    series.forEach((score, index) => {
      const entry = historyEntries[index];
      const previous = index > 0 ? historyEntries[index - 1] : null;
      const rest = previous && previous.rest ? previous.rest : entry.rest;
      const minutes = entry.wake && rest ? computeSleepDuration(entry.wake, rest) : 0;
      const hours = minutes / 60;
      const rawScore = computeSleepRaw(entry, previous);
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${formatLabel(score.date)}</td>
        <td>${entry.wake || '--'}</td>
        <td>${rest || '--'}</td>
        <td>${hours.toFixed(1)}</td>
        <td>${rawScore}</td>
        <td>${score.sleep}</td>
      `;
      sleepTable.appendChild(row);
    });

    // Update fitness details
    const fitnessTable = document.getElementById('fitness-details');
    fitnessTable.innerHTML = '';
    series.forEach((score, index) => {
      const entry = historyEntries[index];
      const rawScore = computeFitnessRaw(entry, currentParams.fitness);
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${formatLabel(score.date)}</td>
        <td>${Array.isArray(entry.skill) ? entry.skill.join(', ') : '--'}</td>
        <td>${entry.strength_level || 0}</td>
        <td>${entry.run || 0} km</td>
        <td>${rawScore}</td>
        <td>${score.fitness}</td>
      `;
      fitnessTable.appendChild(row);
    });

    // Update mind details
    const mindTable = document.getElementById('mind-details');
    mindTable.innerHTML = '';
    series.forEach((score, index) => {
      const entry = historyEntries[index];
      const rawScore = computeMindRaw(entry, currentParams.mind);
      const synergy = entry.read_level > 0 && entry.write_level > 0 ? 
        Math.round(((entry.read_level + entry.write_level) / 6) * currentParams.mind.synergy) : 0;
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${formatLabel(score.date)}</td>
        <td>${entry.read_level || 0}</td>
        <td>${entry.write_level || 0}</td>
        <td>${synergy}</td>
        <td>${rawScore}</td>
        <td>${score.mind}</td>
      `;
      mindTable.appendChild(row);
    });

    // Update spirit details
    const spiritTable = document.getElementById('spirit-details');
    spiritTable.innerHTML = '';
    series.forEach((score, index) => {
      const entry = historyEntries[index];
      const rawScore = computeSpiritRaw(entry, currentParams.spirit);
      const quadrant = entry.energy !== 0 || entry.mood !== 0 || entry.quadrant ? 
        (entry.quadrant || resolveQuadrant(entry.energy, entry.mood)) : '--';
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${formatLabel(score.date)}</td>
        <td>${entry.energy}</td>
        <td>${entry.mood}</td>
        <td>${quadrant}</td>
        <td>${rawScore}</td>
        <td>${score.spirit}</td>
      `;
      spiritTable.appendChild(row);
    });
  }

  function updateDatasetMeta(source, entries) {
    if (!datasetMetaEl) {
      return;
    }
    if (!entries || !entries.length) {
      datasetMetaEl.textContent = '';
      return;
    }

    const start = formatLabel(entries[0].date);
    const end = formatLabel(entries[entries.length - 1].date);
    const dayCount = entries.length;
    datasetMetaEl.textContent = `${source} � ${start} � ${end} � ${dayCount} day${dayCount === 1 ? '' : 's'}`;
  }

  function drawChart(series) {
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const width = canvas.clientWidth || 800;
    const height = canvas.clientHeight || 400;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    if (!series.length) {
      ctx.restore();
      return;
    }

    const padding = { top: 24, right: 24, bottom: 40, left: 56 };
    const chartWidth = Math.max(10, width - padding.left - padding.right);
    const chartHeight = Math.max(10, height - padding.top - padding.bottom);

    const valuesFlat = [];
    series.forEach((point) => {
      DOMAINS.forEach((domain) => {
        const value = point[domain];
        if (Number.isFinite(value)) {
          valuesFlat.push(value);
        }
      });
    });

    const minValue = valuesFlat.length ? Math.min(40, Math.floor(Math.min(...valuesFlat) / 5) * 5) : 40;
    const maxValue = valuesFlat.length ? Math.max(100, Math.ceil(Math.max(...valuesFlat) / 5) * 5) : 100;
    const valueRange = Math.max(20, maxValue - minValue);

    const gridValues = [40, 60, 80, 100];
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.font = '12px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    gridValues.forEach((value) => {
      const y = padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      ctx.fillText(value, padding.left - 10, y);
    });

    const labels = series.map((point) => point.date);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';

    labels.forEach((dateStr, index) => {
      const x = labels.length > 1
        ? padding.left + (chartWidth * (index / (labels.length - 1)))
        : padding.left + chartWidth / 2;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, height - padding.bottom);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.stroke();
      ctx.fillText(formatLabel(dateStr), x, height - padding.bottom + 8);
    });

    DOMAINS.forEach((domain) => {
      const values = series.map((point) => Number.isFinite(point[domain]) ? point[domain] : null);
      ctx.beginPath();
      let started = false;

      values.forEach((value, index) => {
        if (!Number.isFinite(value)) {
          started = false;
          return;
        }
        const x = labels.length > 1
          ? padding.left + (chartWidth * (index / (labels.length - 1)))
          : padding.left + chartWidth / 2;
        const y = padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight;
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.strokeStyle = colorMap[domain] || '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      values.forEach((value, index) => {
        if (!Number.isFinite(value)) {
          return;
        }
        const x = labels.length > 1
          ? padding.left + (chartWidth * (index / (labels.length - 1)))
          : padding.left + chartWidth / 2;
        const y = padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = colorMap[domain] || '#ffffff';
        ctx.fill();
      });
    });

    ctx.restore();
  }

  function computeSleepDuration(wake, rest) {
    const [wh, wm] = wake.split(':').map(Number);
    const [rh, rm] = rest.split(':').map(Number);
    if (!Number.isFinite(wh) || !Number.isFinite(wm) || !Number.isFinite(rh) || !Number.isFinite(rm)) {
      return 0;
    }

    const wakeMinutes = wh * 60 + wm;
    const restMinutes = rh * 60 + rm;

    if (!Number.isFinite(wakeMinutes) || !Number.isFinite(restMinutes)) {
      return 0;
    }

    let duration = wakeMinutes - restMinutes;
    if (duration < 0) {
      duration += 1440;
    }
    return duration;
  }

  function setScoreValue(id, score) {
    const node = document.getElementById(id);
    if (!node) {
      return;
    }
    node.textContent = Number.isFinite(score) ? Math.round(score) : '--';
  }

  function setChip(el, score) {
    if (!el) {
      return;
    }
    if (!Number.isFinite(score)) {
      el.textContent = '--';
      el.className = 'score-chip';
      return;
    }
    el.textContent = score.toFixed(1);
    el.className = `score-chip ${scoreClass(score)}`;
  }

  function scoreClass(score) {
    if (!Number.isFinite(score)) {
      return '';
    }
    if (score >= 80) return 'score-chip--high';
    if (score >= 60) return 'score-chip--mid';
    return 'score-chip--low';
  }

  function trimBuffer(buffer, limit = 30) {
    while (buffer.length > limit) {
      buffer.shift();
    }
  }

  function createSampleBuckets() {
    return {
      sleep: [],
      fitness: [],
      mind: [],
      spirit: []
    };
  }

  function average(values) {
    if (!values.length) return 0;
    return values.reduce((total, value) => total + value, 0) / values.length;
  }

  function median(values) {
    if (!values.length) return 0;
    const sorted = values.slice().sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    }
    return sorted[mid];
  }

  function standardDeviation(values, mean) {
    if (!values.length) return 0;
    const variance = values.reduce((total, value) => total + Math.pow(value - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  function normalizeEntry(dateKey, source) {
    return {
      date: dateKey,
      wake: source.wake || '',
      rest: source.rest || '',
      run: Number(source.run) || 0,
      strength: Boolean(source.strength || (source.strength_level && source.strength_level > 0)),
      strength_level: Number(source.strength_level || (source.strength ? 3 : 0)) || 0,
      skill: Array.isArray(source.skill) ? source.skill.slice() : [],
      read_level: Number(source.read_level) || 0,
      write_level: Number(source.write_level) || 0,
      meditation: Boolean(source.meditation),
      energy: Number.isFinite(Number(source.energy)) ? Number(source.energy) : 0,
      mood: Number.isFinite(Number(source.mood)) ? Number(source.mood) : 0,
      quadrant: Number(source.quadrant) || 0
    };
  }

  function generateRealisticHistory(days = 14, seed = Date.now(), endDate = new Date()) {
    const rand = createRandom(seed);
    const entries = [];
    const end = new Date(endDate);
    end.setHours(12, 0, 0, 0);
    const start = new Date(end);
    start.setDate(end.getDate() - (days - 1));

    for (let i = 0; i < days; i += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      entries.push(buildEntry(date, rand));
    }

    return entries;
  }

  function buildEntry(date, rand) {
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const pattern = selectPattern(rand);
    const weekendFactor = isWeekend ? 0.85 : 1;

    const wakeHour = isWeekend ? randomInt(rand, 6, 8) : randomInt(rand, 5, 7);
    const wakeMinute = randomInt(rand, 0, 59);
    const wake = `${pad(wakeHour)}:${pad(wakeMinute)}`;

    const restHour = randomInt(rand, 22, 23);
    const restMinute = randomInt(rand, 0, 59);
    const rest = `${pad(restHour % 24)}:${pad(restMinute)}`;

    const runBase = pick(pattern.run, rand);
    const run = Math.max(0, Math.round(runBase * weekendFactor));

    const strength = pick(pattern.strength, rand);
    const strengthLevel = strength ? pick(pattern.strength_level || [1], rand) : 0;

    const skillSelection = pick(pattern.skill, rand);
    const skill = Array.isArray(skillSelection) ? skillSelection.slice() : [];

    const read_level = pick(pattern.read_level, rand);
    const write_level = pick(pattern.write_level, rand);
    const meditation = pick(pattern.meditation, rand);

    const activityLoad = (run > 0 ? 1 : 0) + (strength ? 1 : 0) + skill.length;
    let quadrant;
    if (activityLoad >= 3) {
      quadrant = pick([1, 2], rand);
    } else if (activityLoad === 0) {
      quadrant = pick([3, 4], rand);
    } else {
      quadrant = pick([1, 2, 3, 4], rand);
    }

    const activityScore = (run > 0 ? 20 : 0)
      + (strength ? 15 : 0)
      + (skill.length * 10)
      + (read_level * 8)
      + (meditation ? 10 : 0);

    const baseline = QUADRANT_BASELINES[quadrant] || QUADRANT_BASELINES[0];
    const activationShift = clamp(Math.round((activityScore - 50) * 0.6 + randomInt(rand, -20, 18)), -40, 40);
    const skillBoost = skill.length >= 2 ? 5 : (skill.length === 1 ? 3 : 0);

    let energy = clamp(baseline.energy + activationShift + skillBoost, -95, 95);
    if (baseline.energy < 0) {
      energy = Math.min(-5, energy);
    } else if (baseline.energy > 0) {
      energy = Math.max(5, energy);
    }

    const recoveryBoost = meditation ? 8 : 0;
    const moodShift = clamp(Math.round((activityScore - 45) * 0.35 + randomInt(rand, -25, 25) + recoveryBoost), -40, 40);
    let mood = clamp(baseline.mood + moodShift, -95, 95);
    if (baseline.mood < 0) {
      mood = Math.min(-5, mood);
    } else if (baseline.mood > 0) {
      mood = Math.max(5, mood);
    }

    return {
      date: formatDate(date),
      wake,
      rest,
      run,
      strength,
      strength_level: strengthLevel,
      skill,
      read_level,
      write_level,
      meditation,
      energy,
      mood,
      quadrant
    };
  }

  function selectPattern(rand) {
    const roll = rand();
    let cumulative = 0;

    for (let i = 0; i < ACTIVITY_PATTERNS.length; i += 1) {
      cumulative += ACTIVITY_PATTERNS[i].weight;
      if (roll <= cumulative) {
        return ACTIVITY_PATTERNS[i];
      }
    }
    return ACTIVITY_PATTERNS[ACTIVITY_PATTERNS.length - 1];
  }

  function createRandom(seed) {
    let t = seed >>> 0;
    return function random() {
      t += 0x6D2B79F5;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  function randomInt(rand, min, max) {
    return Math.floor(rand() * (max - min + 1)) + min;
  }

  function pick(list, rand) {
    return list[Math.floor(rand() * list.length)];
  }

  function setSlider(id, value) {
    const node = document.getElementById(id);
    if (node) {
      node.value = value;
    }
  }

  function setText(id, value) {
    const node = document.getElementById(id);
    if (node) {
      node.textContent = value;
    }
  }

  function getCssVar(name, fallback) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name);
    return value ? value.trim() : fallback;
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function formatDate(date) {
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    return `${year}-${month}-${day}`;
  }

  function formatLabel(dateString) {
    const date = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
      return dateString;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
})();
