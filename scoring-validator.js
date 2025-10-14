#!/usr/bin/env node

/**
 * Scoring Validation Tool - Monte Carlo Testing
 * Generates random permutations of daily activity data and validates scoring outcomes
 */

const fs = require('fs');
const path = require('path');

// Scoring logic adapted for Node.js testing - matches actual implementation
const Scoring = {
  calcSleep(state) {
    const { wake } = state;
    if (!wake) return null;

    const today = new Date().toISOString().split('T')[0];
    const todayDate = new Date(today + 'T12:00:00');
    const yesterdayDate = new Date(todayDate);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    // Mock yesterday's rest time for testing
    const yesterdayRest = state.mockYesterdayRest || '22:30';

    if (!yesterdayRest) return null;

    const [wh, wm] = wake.split(':').map(Number);
    const [rh, rm] = yesterdayRest.split(':').map(Number);
    const wakeMins = wh * 60 + wm;
    const restMins = rh * 60 + rm;

    const duration = wakeMins + (1440 - restMins);
    const hours = duration / 60;

    let rawScore;
    if (hours >= 7 && hours <= 9) rawScore = 100;
    else if (hours >= 6 && hours < 7) rawScore = 85;
    else if (hours > 9 && hours <= 10) rawScore = 85;
    else if (hours >= 5 && hours < 6) rawScore = 65;
    else if (hours > 10 && hours <= 11) rawScore = 65;
    else if (hours >= 4 && hours < 5) rawScore = 45;
    else if (hours > 11) rawScore = 50;
    else rawScore = 30;

    return Math.max(0, Math.min(99, rawScore));
  },

  calcFitness(state) {
    let rawScore = 0;

    // Skill practice: up to 40 points
    const skillSelections = Array.isArray(state.skill) ? state.skill : [];
    if (skillSelections.length > 0) rawScore += 40;

    // Strength training: up to 30 points from 3 tiers
    const strengthLevel = state.strength_level || 0;
    if (strengthLevel === 1) rawScore += 10; // "Movement"
    else if (strengthLevel === 2) rawScore += 20; // "Session"
    else if (strengthLevel === 3) rawScore += 30; // "Training"

    // Running: up to 30 points (logarithmic)
    const runDistance = state.run || 0;
    if (runDistance > 0) {
      const runPoints = Math.min(30, 10 * Math.log(runDistance + 1));
      rawScore += runPoints;
    }

    // Apply soft dampening for unrealistic daily load
    const activityCount = this.calculateActivityCountForState(state);
    let adjustedRaw = Math.round(rawScore);
    if (activityCount > 3) {
      const extra = Math.max(0, activityCount - 3);
      const reduction = extra === 1 ? 0.10 : extra === 2 ? 0.18 : 0.25;
      adjustedRaw = Math.round(adjustedRaw * (1 - reduction));
    }

    return Math.max(0, Math.min(99, adjustedRaw));
  },

  calculateActivityCountForState(state) {
    if (!state || typeof state !== 'object') return 0;

    const runCount = (Number(state.run) || 0) > 0 ? 1 : 0;
    const strengthCount = state.strength_level && state.strength_level > 0 ? 1 : 0;
    const skillCount = Array.isArray(state.skill) ? (state.skill.length > 0 ? 1 : 0) : (state.skill ? 1 : 0);
    const readCount = (state.read_level || 0) > 0 ? 1 : 0;
    const writeCount = (state.write_level || 0) > 0 ? 1 : 0;
    const meditationCount = state.meditation ? 1 : 0;

    return runCount + strengthCount + skillCount + readCount + writeCount + meditationCount;
  },

  calcMind(state) {
    let rawScore = 0;

    const readLevel = Number(state.read_level) || 0;
    const writeLevel = Number(state.write_level) || 0;

    // Points maps that allow high-tier activities to be worth more, enabling a synergy bonus
    const readPointsMap = [0, 20, 35, 55];
    const writePointsMap = [0, 20, 35, 55];

    rawScore += readPointsMap[Math.min(3, Math.max(0, readLevel))];
    rawScore += writePointsMap[Math.min(3, Math.max(0, writeLevel))];

    // Re-introduce synergy bonus for combining reading and writing
    if (readLevel > 0 && writeLevel > 0) {
      const synergy = Math.round(((readLevel + writeLevel) / 6) * 10);
      rawScore += synergy;
    }

    // Cap final score at 99 to prevent a perfect 100
    return Math.max(0, Math.min(99, Math.round(rawScore)));
  },

  calcSpirit(state) {
    let rawScore = 0;
    const { energy, mood, quadrant } = state;

    if (energy !== 0 || mood !== 0 || quadrant > 0) {
      rawScore += 70;

      let effectiveEnergy = energy;
      let effectiveMood = mood;
      if (energy === 0 && mood === 0 && quadrant > 0) {
        const preset = this.getQuadrantPreset(quadrant);
        effectiveEnergy = preset.energy;
        effectiveMood = preset.mood;
      }

      const normalizedEnergy = (effectiveEnergy + 100) / 200;
      const normalizedMood = (effectiveMood + 100) / 200;
      const combinedMetric = (normalizedEnergy * 0.4) + (normalizedMood * 0.6);
      const bonusPoints = Math.round(combinedMetric * 30);
      rawScore += bonusPoints;
    }

    return Math.max(0, Math.min(99, rawScore));
  },

  getQuadrantPreset(quadrant) {
    const presets = {
      1: { energy: 65, mood: 70 },
      2: { energy: -60, mood: 70 },
      3: { energy: 65, mood: -65 },
      4: { energy: -60, mood: -65 }
    };
    return presets[quadrant] || { energy: 0, mood: 0 };
  }
};

// Activity data ranges for realistic permutations
const ACTIVITY_RANGES = {
  wake: ['06:00', '06:30', '07:00', '07:30', '08:00'],
  rest: ['22:00', '22:30', '23:00', '23:30', '00:00'],
  run: [0, 3, 5, 8, 10, 12, 15, 18, 20],
  strength: [false, true],
  strength_level: [0, 1, 2, 3],
  skill: [[], ['Wrestling'], ['Volleyball'], ['Mobility'], ['Yoga'], ['Wrestling', 'Mobility'], ['Volleyball', 'Yoga']],
  read_level: [0, 1, 2, 3],
  write_level: [0, 1, 2, 3],
  quadrant: [1, 2, 3, 4],
  meditation: [false, true]
};

// Helper: adjust blended score to realistic range (mirrors app)
function adjustToRealisticRange(blendedScore) {
  const floor = 60;
  const ceiling = 99;
  if (blendedScore <= 0) return floor;
  const normalized = Math.max(0, Math.min(1, blendedScore / 100));
  const mean = 0.55;
  const sigma = 0.14;

  function erf(x) {
    const sign = x >= 0 ? 1 : -1;
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;
    const t = 1 / (1 + p * Math.abs(x));
    const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y;
  }

  const z = (normalized - mean) / (sigma * Math.SQRT2);
  const phi = 0.5 * (1 + erf(z));
  const finalScore = floor + (ceiling - floor) * phi;
  return Math.min(ceiling, Math.round(finalScore));
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRandomEntry() {
  const entry = {};
  Object.keys(ACTIVITY_RANGES).forEach(key => {
    entry[key] = getRandomChoice(ACTIVITY_RANGES[key]);
  });

  entry.energy = getRandomInt(-100, 100);
  entry.mood = getRandomInt(-100, 100);

  if (entry.run > 10 && Math.random() > 0.7) {
    entry.strength = false;
  }

  if (entry.skill.length > 1 && Math.random() > 0.8) {
    entry.run = Math.min(entry.run, 8);
  }

  return entry;
}

function calculateScores(entry, useTrend = true) {
  if (!useTrend) {
    return calculateDailyScores(entry);
  }

  const state = { ...entry };
  state.mockYesterdayRest = getRandomChoice(['22:00', '22:30', '23:00', '23:30']);

  function calcTrend(domain, raw) {
    const minHistory = domain === 'sleep' ? 3 : 7;
    const simulatedHistoryLength = getRandomChoice([0, 1, 2, 3, 4, 5, 6, 7]);
    if (simulatedHistoryLength < minHistory) {
      return adjustToRealisticRange(raw);
    }

    const historicalAverage = 65 + getRandomInt(-7, 12);
    const blended = (raw * 0.4) + (historicalAverage * 0.6);
    return adjustToRealisticRange(blended);
  }

  const raw = {
    sleep: Scoring.calcSleep(state),
    fitness: Scoring.calcFitness(state),
    mind: Scoring.calcMind(state),
    spirit: Scoring.calcSpirit(state)
  };

  const scores = {
    sleep: calcTrend('sleep', raw.sleep),
    fitness: calcTrend('fitness', raw.fitness),
    mind: calcTrend('mind', raw.mind),
    spirit: calcTrend('spirit', raw.spirit)
  };

  return scores;
}

function calculateDailyScores(entry) {
  const state = { ...entry };
  state.mockYesterdayRest = getRandomChoice(['22:00', '22:30', '23:00', '23:30']);

  const sleepScore = Scoring.calcSleep(state);
  const fitnessScore = Scoring.calcFitness(state);
  const mindScore = Scoring.calcMind(state);
  const spiritScore = Scoring.calcSpirit(state);

  return { sleep: sleepScore, fitness: fitnessScore, mind: mindScore, spirit: spiritScore };
}

function assessRealism(entry, scores) {
  let issues = [];
  let score = 100;

  const totalActivity = (entry.run > 0 ? 1 : 0) +
                       (entry.strength ? 1 : 0) +
                       (entry.skill.length > 0 ? 1 : 0) +
                       (entry.read_level > 0 ? 1 : 0) +
                       (entry.write_level > 0 ? 1 : 0) +
                       (entry.meditation ? 1 : 0);

  if (totalActivity > 4) {
    issues.push('Too many activities for one day');
    score -= 20;
  }

  if (entry.run > 15 && entry.strength && entry.skill.length > 1) {
    issues.push('Long run + strength + multiple skills = unrealistic daily load');
    score -= 25;
  }

  if (entry.run === 0 && !entry.strength && entry.skill.length === 0 &&
      entry.read_level === 0 && entry.write_level === 0 && !entry.meditation) {
    issues.push('Completely inactive day');
    score -= 10;
  }

  if (entry.run > 10 && scores.fitness < 60) {
    issues.push('High running distance but low fitness score');
    score -= 15;
  }

  if (entry.meditation && scores.spirit < 50) {
    issues.push('Meditation logged but low spirit score');
    score -= 15;
  }

  if (entry.read_level === 3 && entry.write_level === 3 && scores.mind < 90) {
    issues.push('High reading/writing but low mind score');
    score -= 15;
  }

  return { score: Math.max(0, score), issues };
}

function formatEntry(entry) {
  return {
    wake: entry.wake,
    rest: entry.rest,
    run: `${entry.run}km`,
    strength: entry.strength ? `Level ${entry.strength_level}` : 'None',
    skill: entry.skill.length > 0 ? entry.skill.join(', ') : 'None',
    read: `Level ${entry.read_level}`,
    write: `Level ${entry.write_level}`,
    quadrant: entry.quadrant,
    meditation: entry.meditation ? 'Yes' : 'No'
  };
}

function runMonteCarloTest(iterations = 5) {
  console.log('🎲 SCORING VALIDATION TOOL - Monte Carlo Testing');
  console.log('================================================\n');

  console.log('🧪 Running deterministic validation cases (from SCORING_GUIDE)');
  const deterministicTests = [
    {
      label: 'Fitness - Full training + skill + mid run (expected high ~95-99 raw)',
      entry: { wake: '06:00', rest: '22:00', run: 12, strength: true, strength_level: 3, skill: ['Wrestling'], read_level: 0, write_level: 0, quadrant: 1, meditation: false, energy: 70, mood: 80 }
    },
    {
      label: 'Mind - High reading & writing with synergy (expected 99 raw)',
      entry: { wake: '07:00', rest: '23:00', run: 0, strength: false, strength_level: 0, skill: [], read_level: 3, write_level: 3, quadrant: 0, meditation: false, energy: 0, mood: 0 }
    },
    {
      label: 'Spirit - Mood logged via quadrant (Q1: High E, Pos M - expected high bonus)',
      entry: { wake: '07:00', rest: '23:00', run: 0, strength: false, strength_level: 0, skill: [], read_level: 0, write_level: 0, quadrant: 1, meditation: false, energy: 0, mood: 0 }
    },
    {
      label: 'Unrealistic combo - long run + strength + multiple skills (should flag)',
      entry: { wake: '06:00', rest: '22:30', run: 20, strength: true, strength_level: 2, skill: ['Wrestling','Volleyball'], read_level: 1, write_level: 1, quadrant: 1, meditation: false, energy: 80, mood: 85 }
    }
  ];

  deterministicTests.forEach(test => {
    const scores = calculateDailyScores(test.entry);
    const realism = assessRealism(test.entry, scores);
    console.log(`\n🧾 ${test.label}`);
    console.log('Activities:', formatEntry(test.entry));
    console.log('Scores:', scores);
    console.log('(Daily scores shown - trend adjustment requires sufficient history)');
    console.log(`Realism: ${realism.score}/100 ${realism.score >= 70 ? '✅' : '⚠️'}`);
    if (realism.issues.length > 0) console.log('Issues:', realism.issues);
  });

  console.log('\n---\n');

  console.log(`🔄 GENERATING ${iterations} RANDOM TEST CASES:`);
  console.log('================================================\n');

  for (let i = 0; i < iterations; i++) {
    const entry = generateRandomEntry();
    const scores = calculateScores(entry);
    const realism = assessRealism(entry, scores);

    console.log(`📊 Test Case ${i + 1}:`);
    console.log('Activities:', formatEntry(entry));
    console.log('Scores:', scores);
    console.log(`Realism: ${realism.score}/100 ${realism.score >= 70 ? '✅' : '⚠️'}`);
    if (realism.issues.length > 0) {
      console.log('Issues:', realism.issues);
    }
    console.log('---\n');
  }

  console.log('💡 Assessment Guide:');
  console.log('- 90-100: Highly realistic daily activity');
  console.log('- 70-89: Realistic with minor concerns');
  console.log('- 50-69: Questionable activity combinations');
  console.log('- <50: Likely unrealistic daily load');
  console.log('\nRun again with: node scoring-validator.js [number]');
}

// Main execution
const iterations = process.argv[2] ? parseInt(process.argv[2]) : 5;
runMonteCarloTest(iterations);