#!/usr/bin/env node

/**
 * 7-Day Mock Data Generator for drop
 *
 * Generates realistic mock data for 7 days (ending yesterday).
 * Save output and paste into browser console to load into the app.
 *
 * Usage:
 *   node mock-data/generate-7day-data.js
 *
 * Then in the browser console:
 *   localStorage.setItem('lifeTrackerData', `<paste output>`)
 *   location.reload()
 */

const DEFAULT_SETTINGS = {
  skillOptions: ['Wrestling', 'Volleyball', 'Mobility', 'Yoga', 'Plyometrics'],
  visionTheme: 'Build momentum through consistent daily inputs.',
  visionSleepFocus: 'Lights out by 10:30pm, wake refreshed by 6:30am.',
  visionFitnessFocus: 'Rotate between strength, endurance, and skill work.',
  visionMindFocus: 'Read 20 pages and journal 5 minutes each day.',
  visionSpiritFocus: 'Anchor the evening with gratitude and quiet reflection.'
};

const DAILY_KEYS = [
  'wake',
  'rest',
  'run',
  'strength',
  'strength_level',
  'skill',
  'read_level',
  'write_level',
  'quadrant',
  'meditation',
  'energy',
  'mood'
];

const QUADRANT_BASELINES = {
  0: { energy: 0, mood: 0 },
  1: { energy: 60, mood: 65 },
  2: { energy: -55, mood: 55 },
  3: { energy: 55, mood: -55 },
  4: { energy: -60, mood: -60 }
};

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatTime(hours, minutes) {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function buildEntry(dateKey, dayIndex) {
  const numericSeed = parseInt(dateKey.replace(/-/g, ''), 10) + dayIndex * 17;
  const r = (offset) => seededRandom(numericSeed + offset);

  const wakeMinuteOffset = Math.round(r(1) * 50) - 10;
  const restMinuteOffset = Math.round(r(2) * 55) - 15;

  const wakeBaseMinutes = 6 * 60 + 20;
  const restBaseMinutes = 22 * 60 + 15;

  const wakeTotalMinutes = Math.max(5 * 60 + 30, wakeBaseMinutes + wakeMinuteOffset);
  const restTotalMinutes = Math.min(23 * 60 + 30, restBaseMinutes + restMinuteOffset);

  const runDistance = r(3) > 0.35 ? Math.round(2 + r(4) * 10) : 0;
  const baseStrengthLevel = runDistance > 0 ? Math.round(r(5) * 3) : Math.round(r(5) * 2);
  const readLevel = Math.round(r(6) * 3);
  const writeLevel = Math.round(r(7) * 2);
  const meditation = r(11) > 0.4;

  const skillPool = DEFAULT_SETTINGS.skillOptions;
  const skillCount = runDistance > 0 ? (r(12) > 0.6 ? 2 : 1) : (r(12) > 0.75 ? 1 : 0);
  const skillSet = new Set();
  for (let i = 0; i < skillCount; i++) {
    const pickIndex = Math.floor(r(13 + i) * skillPool.length);
    skillSet.add(skillPool[pickIndex]);
  }

  const strength = r(18) > 0.5;
  const strengthLevel = strength ? baseStrengthLevel : 0;

  const activityLoad = (runDistance > 0 ? 1 : 0) + (strength ? 1 : 0) + skillSet.size;
  const quadrantRoll = r(10);
  let quadrant;
  if (activityLoad >= 3) {
    quadrant = quadrantRoll > 0.5 ? 1 : 3;
  } else if (activityLoad === 0) {
    quadrant = quadrantRoll > 0.5 ? 2 : 4;
  } else {
    quadrant = Math.max(1, Math.min(4, Math.ceil(quadrantRoll * 4)));
  }

  const runContribution = runDistance > 0 ? 18 + runDistance * 1.2 : -12;
  const strengthContribution = strength ? 12 + strengthLevel * 4 : -8;
  const skillContribution = skillSet.size * 9;
  const cognitiveContribution = readLevel * 6 + writeLevel * 5;
  const effortScore = runContribution + strengthContribution + skillContribution + cognitiveContribution + (meditation ? 8 : -6);

  const baseline = QUADRANT_BASELINES[quadrant] || QUADRANT_BASELINES[0];
  const activationShift = clamp(Math.round((effortScore - 30) * 0.5 + (r(8) * 40 - 20)), -45, 45);
  let energy = clamp(baseline.energy + activationShift, -95, 95);
  if (baseline.energy < 0) {
    energy = Math.min(-5, energy);
  } else if (baseline.energy > 0) {
    energy = Math.max(5, energy);
  }

  const moodShift = clamp(Math.round((effortScore - 25) * 0.35 + (r(9) * 50 - 25) + (meditation ? 10 : 0)), -45, 45);
  let mood = clamp(baseline.mood + moodShift, -95, 95);
  if (baseline.mood < 0) {
    mood = Math.min(-5, mood);
  } else if (baseline.mood > 0) {
    mood = Math.max(5, mood);
  }

  const sleepScore = Math.min(100, Math.max(50, Math.round(70 + r(14) * 25)));
  const fitnessScore = Math.min(100, Math.max(45, Math.round(runDistance ? 60 + r(15) * 35 : 50 + r(15) * 20)));
  const mindScore = Math.min(100, Math.max(40, Math.round(55 + readLevel * 10 + r(16) * 15)));
  const spiritScore = Math.min(100, Math.max(45, Math.round(60 + (meditation ? 15 : 0) + r(17) * 15)));

  const entry = {
    wake: formatTime(Math.floor(wakeTotalMinutes / 60), wakeTotalMinutes % 60),
    rest: formatTime(Math.floor(restTotalMinutes / 60), restTotalMinutes % 60),
    run: runDistance,
    strength,
    strength_level: strengthLevel,
    skill: Array.from(skillSet),
    read_level: readLevel,
    write_level: writeLevel,
    quadrant,
    meditation,
    energy,
    mood,
    timestamps: {
      wake: `${dateKey}T${formatTime(Math.floor(wakeTotalMinutes / 60), wakeTotalMinutes % 60)}:00.000Z`,
      rest: `${dateKey}T${formatTime(Math.floor(restTotalMinutes / 60), restTotalMinutes % 60)}:00.000Z`
    },
    scores: {
      sleep: sleepScore,
      fitness: fitnessScore,
      mind: mindScore,
      spirit: spiritScore
    }
  };

  DAILY_KEYS.forEach((key) => {
    if (!(key in entry)) {
      entry[key] = null;
    }
  });

  return entry;
}

function generate7DayData() {
  const today = new Date();
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const entries = {};

  // Generate 7 days of data ending yesterday
  for (let i = 0; i < 7; i++) {
    const current = new Date(yesterday.getTime());
    current.setDate(current.getDate() - i);

    const dateKey = formatDateKey(current);
    entries[dateKey] = buildEntry(dateKey, i);
  }

  const dataset = {
    skillOptions: DEFAULT_SETTINGS.skillOptions,
    visionTheme: DEFAULT_SETTINGS.visionTheme,
    visionSleepFocus: DEFAULT_SETTINGS.visionSleepFocus,
    visionFitnessFocus: DEFAULT_SETTINGS.visionFitnessFocus,
    visionMindFocus: DEFAULT_SETTINGS.visionMindFocus,
    visionSpiritFocus: DEFAULT_SETTINGS.visionSpiritFocus,
    lastEntryDate: formatDateKey(yesterday),
    entries: entries,
    meta: {
      _version: 2,
      _schemaDate: '2024-05-01',
      settings: DEFAULT_SETTINGS
    }
  };

  return dataset;
}

const data = generate7DayData();
const jsonString = JSON.stringify(data);

console.log('='.repeat(80));
console.log('📊 7-Day Mock Data Generated');
console.log('='.repeat(80));
console.log('\n✅ Copy the JSON below and paste into browser console:\n');
console.log(`localStorage.setItem('lifeTrackerData', '${jsonString}')`);
console.log('\nThen reload the page: location.reload()\n');
console.log('='.repeat(80));
console.log('\nData summary:');
console.log(`  Entries: ${Object.keys(data.entries).length} days`);
console.log(`  Date range: ${Object.keys(data.entries).sort().reverse()[0]} to ${Object.keys(data.entries).sort()[0]}`);
console.log(`  Vision settings: ${DEFAULT_SETTINGS.skillOptions.join(', ')}`);
console.log('='.repeat(80));
