#!/usr/bin/env node

/**
 * Sample data generator for the drop PWA.
 *
 * Usage:
 *   node docs/tests/generate-sample-data.js --days 5
 *   node docs/tests/generate-sample-data.js --days 30 --out docs/tests/custom.json
 *
 * The generator is deterministic: the same number of days
 * always produces the same dataset for repeatable demos/tests.
 */

const fs = require('fs');
const path = require('path');

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

const DATE_FORMAT_OPTIONS = { timeZone: 'UTC', hour12: false };

function formatDateKey(date) {
  const d = new Date(date.getTime());
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
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

  const wakeMinuteOffset = Math.round(r(1) * 50) - 10; // +/- 10 minutes variance
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

function generateSample(days) {
  if (!Number.isInteger(days) || days < 1) {
    throw new Error('`days` must be a positive integer.');
  }

  const today = new Date();
  const entries = {};

  for (let i = 0; i < days; i++) {
    const current = new Date(today.getTime());
    current.setDate(current.getDate() - i);

    const dateKey = formatDateKey(current);
    entries[dateKey] = buildEntry(dateKey, i);
  }

  const dataset = {
    meta: {
      _version: 2,
      _schemaDate: '2024-05-01',
      lastEntryDate: formatDateKey(today),
      settings: DEFAULT_SETTINGS
    },
    entries
  };

  return dataset;
}

function parseArgs(args) {
  let days = 5;
  let outPath = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--days' && args[i + 1]) {
      days = parseInt(args[++i], 10);
    } else if ((arg === '--out' || arg === '-o') && args[i + 1]) {
      outPath = args[++i];
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return { days, outPath };
}

function printHelp() {
  console.log(`Generate deterministic sample data for drop.

Options:
  --days <n>        Number of days to generate (default: 5)
  --out <path>      Output file (defaults to docs/tests/sample-data-<n>days.json)
  -h, --help        Show this message
`);
}

function writeSample(days, outPath) {
  const dataset = generateSample(days);
  const targetPath =
    outPath ||
    path.join(__dirname, `sample-data-${String(days)}days.json`);

  fs.writeFileSync(targetPath, JSON.stringify(dataset, null, 2) + '\n', 'utf8');
  return targetPath;
}

if (require.main === module) {
  try {
    const { days, outPath } = parseArgs(process.argv.slice(2));
    const resolvedPath = writeSample(days, outPath);
    const relative = path.relative(process.cwd(), resolvedPath);
    console.log(`Generated ${days}-day sample dataset → ${relative || resolvedPath}`);
  } catch (error) {
    console.error('Failed to generate sample data:', error.message);
    process.exit(1);
  }
}

module.exports = {
  generateSample,
  writeSample
};
