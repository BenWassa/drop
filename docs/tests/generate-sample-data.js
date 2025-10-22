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
  const strengthLevel = runDistance > 0 ? Math.round(r(5) * 3) : Math.round(r(5) * 2);
  const readLevel = Math.round(r(6) * 3);
  const writeLevel = Math.round(r(7) * 2);
  const energy = Math.min(100, Math.max(40, Math.round(55 + r(8) * 40)));
  const mood = Math.min(100, Math.max(40, Math.round(50 + r(9) * 45)));
  const quadrant = Math.max(1, Math.min(4, Math.ceil(r(10) * 4)));
  const meditation = r(11) > 0.4;

  const skillPool = DEFAULT_SETTINGS.skillOptions;
  const skillCount = runDistance > 0 ? (r(12) > 0.6 ? 2 : 1) : (r(12) > 0.75 ? 1 : 0);
  const skillSet = new Set();
  for (let i = 0; i < skillCount; i++) {
    const pickIndex = Math.floor(r(13 + i) * skillPool.length);
    skillSet.add(skillPool[pickIndex]);
  }

  const sleepScore = Math.min(100, Math.max(50, Math.round(70 + r(14) * 25)));
  const fitnessScore = Math.min(100, Math.max(45, Math.round(runDistance ? 60 + r(15) * 35 : 50 + r(15) * 20)));
  const mindScore = Math.min(100, Math.max(40, Math.round(55 + readLevel * 10 + r(16) * 15)));
  const spiritScore = Math.min(100, Math.max(45, Math.round(60 + (meditation ? 15 : 0) + r(17) * 15)));

  const entry = {
    wake: formatTime(Math.floor(wakeTotalMinutes / 60), wakeTotalMinutes % 60),
    rest: formatTime(Math.floor(restTotalMinutes / 60), restTotalMinutes % 60),
    run: runDistance,
    strength: r(18) > 0.5,
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
