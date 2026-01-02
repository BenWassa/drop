#!/usr/bin/env node

/**
 * Sample Data Generator
 * Usage: node generate-sample-data.js <days> [outputFile]
 * Example: node generate-sample-data.js 7 test/data/sample-data-7days.json
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const DAYS_TO_GENERATE = parseInt(args[0]) || 30;
const OUTPUT_FILE = args[1] || `docs/test/data/sample-data-${DAYS_TO_GENERATE}days.json`;

// End date is YESTERDAY (today minus 1 day, to exclude today)
const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);
const END_DATE = new Date(TODAY);
END_DATE.setDate(TODAY.getDate() - 1); // Yesterday

// Start date
const START_DATE = new Date(END_DATE);
START_DATE.setDate(END_DATE.getDate() - DAYS_TO_GENERATE + 1);

// Base skill options
const SKILL_OPTIONS = ['Wrestling', 'Volleyball', 'Mobility', 'Yoga', 'Plyometrics', 'Climbing'];

// Realistic activity patterns
const ACTIVITY_PATTERNS = {
  restDay: {
    run: [0, 3],
    strength: [false],
    skill: [[], ['Mobility'], ['Yoga']],
    read_level: [1, 2, 3],
    write_level: [0, 1, 2],
    meditation: [true, false],
    weight: 0.2 // 20% of days
  },
  lightDay: {
    run: [3, 5, 8],
    strength: [false, true],
    strength_level: [1],
    skill: [[], ['Mobility'], ['Yoga'], ['Wrestling'], ['Volleyball']],
    read_level: [1, 2],
    write_level: [0, 1],
    meditation: [true, false],
    weight: 0.4 // 40% of days
  },
  activeDay: {
    run: [8, 10, 12, 15],
    strength: [true, false],
    strength_level: [1, 2],
    skill: [['Wrestling'], ['Volleyball'], ['Wrestling', 'Mobility'], ['Volleyball', 'Yoga']],
    read_level: [0, 1, 2],
    write_level: [0, 1],
    meditation: [true, false],
    weight: 0.3 // 30% of days
  },
  intenseDay: {
    run: [15, 18, 20],
    strength: [false],
    strength_level: [0],
    skill: [[], ['Mobility']],
    read_level: [0, 1],
    write_level: [0],
    meditation: [true, false],
    weight: 0.1 // 10% of days
  }
};

const QUADRANT_BASELINES = {
  0: { energy: 0, mood: 0 },
  1: { energy: 60, mood: 65 },
  2: { energy: -55, mood: 55 },
  3: { energy: 55, mood: -55 },
  4: { energy: -60, mood: -60 }
};

// Helper functions
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function selectWeightedPattern() {
  const rand = Math.random();
  let cumulative = 0;

  for (const [patternName, pattern] of Object.entries(ACTIVITY_PATTERNS)) {
    cumulative += pattern.weight;
    if (rand <= cumulative) {
      return pattern;
    }
  }

  return ACTIVITY_PATTERNS.lightDay;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// Generate realistic activity data
function generateEntry(date) {
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const pattern = selectWeightedPattern();

  // Wake time (6:00-7:30 AM, earlier on weekdays)
  const wakeHour = isWeekend ? getRandomInt(6, 8) : getRandomInt(6, 7);
  const wakeMinute = getRandomInt(0, 59);
  const wake = `${String(wakeHour).padStart(2, '0')}:${String(wakeMinute).padStart(2, '0')}`;

  // Rest time (10:00-11:59 PM)
  const restHour = getRandomInt(22, 23);
  const restMinute = getRandomInt(0, 59);
  const rest = `${String(restHour).padStart(2, '0')}:${String(restMinute).padStart(2, '0')}`;

  // Select activities from pattern
  const run = getRandomChoice(pattern.run);
  const strength = getRandomChoice(pattern.strength);
  const strength_level = strength ? getRandomChoice(pattern.strength_level) : 0;
  const skill = getRandomChoice(pattern.skill);
  const read_level = getRandomChoice(pattern.read_level);
  const write_level = getRandomChoice(pattern.write_level);
  const meditation = getRandomChoice(pattern.meditation);

  // Quadrant (1-4, correlated with activity level)
  const activityLevel = (run > 0 ? 1 : 0) + (strength ? 1 : 0) + skill.length;
  let quadrant;
  if (activityLevel >= 3) {
    quadrant = getRandomChoice([1, 2]);
  } else if (activityLevel === 0) {
    quadrant = getRandomChoice([3, 4]);
  } else {
    quadrant = getRandomChoice([1, 2, 3, 4]);
  }

  // Energy and mood aligned to quadrant baselines (-100 to 100)
  const effortScore = (run > 0 ? 22 + run * 1.3 : -15)
    + (strength ? 14 + strength_level * 4 : -10)
    + (skill.length * 9)
    + (read_level * 7)
    + (write_level * 5)
    + (meditation ? 10 : -6);

  const baseline = QUADRANT_BASELINES[quadrant] || QUADRANT_BASELINES[0];
  const activationShift = clamp(Math.round((effortScore - 40) * 0.5 + getRandomInt(-20, 18)), -45, 45);
  let energy = clamp(baseline.energy + activationShift, -95, 95);
  if (baseline.energy < 0) {
    energy = Math.min(-5, energy);
  } else if (baseline.energy > 0) {
    energy = Math.max(5, energy);
  }

  const moodShift = clamp(Math.round((effortScore - 35) * 0.35 + getRandomInt(-25, 25) + (meditation ? 10 : 0)), -45, 45);
  let mood = clamp(baseline.mood + moodShift, -95, 95);
  if (baseline.mood < 0) {
    mood = Math.min(-5, mood);
  } else if (baseline.mood > 0) {
    mood = Math.max(5, mood);
  }

  // Generate timestamps
  const timestamps = {};
  const dateStr = formatDate(date);

  if (run > 0) {
    const runHour = getRandomInt(17, 19);
    const runMinute = getRandomInt(0, 59);
    timestamps.run = `${dateStr}T${String(runHour).padStart(2, '0')}:${String(runMinute).padStart(2, '0')}:00.000Z`;
  }

  if (strength) {
    const strengthHour = getRandomInt(18, 20);
    const strengthMinute = getRandomInt(0, 59);
    timestamps.strength = `${dateStr}T${String(strengthHour).padStart(2, '0')}:${String(strengthMinute).padStart(2, '0')}:00.000Z`;
  }

  if (meditation) {
    const meditationHour = getRandomInt(20, 22);
    const meditationMinute = getRandomInt(0, 59);
    timestamps.meditation = `${dateStr}T${String(meditationHour).padStart(2, '0')}:${String(meditationMinute).padStart(2, '0')}:00.000Z`;
  }

  timestamps.wake = `${dateStr}T${wake}:00.000Z`;

  return {
    wake,
    rest,
    run,
    strength,
    strength_level,
    skill,
    read_level,
    write_level,
    quadrant,
    meditation,
    energy,
    mood,
    timestamps,
    scores: {
      sleep: Math.round(Math.min(100, Math.max(60, (24 - restHour + wakeHour) * 8 + getRandomInt(-5, 5)))),
      fitness: Math.round(Math.min(100, Math.max(15, run * 3 + (strength ? strength_level * 15 : 0) + getRandomInt(-10, 10)))),
      mind: Math.round(Math.min(100, Math.max(0, read_level * 25 + write_level * 15 + getRandomInt(-10, 10)))),
      spirit: Math.round(Math.min(100, Math.max(35, (meditation ? 60 : 30) + quadrant * 10 + getRandomInt(-15, 15))))
    }
  };
}

// Generate the sample data
function generateSampleData() {
  const entries = {};
  const currentDate = new Date(START_DATE);

  for (let i = 0; i < DAYS_TO_GENERATE; i++) {
    const dateStr = formatDate(currentDate);
    entries[dateStr] = generateEntry(currentDate);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const sampleData = {
    meta: {
      _version: 2,
      _schemaDate: '2024-05-01',
      lastEntryDate: formatDate(END_DATE),
      settings: {
        skillOptions: SKILL_OPTIONS,
        visionTheme: 'Build momentum through small wins',
        visionSleepFocus: 'Consistent 10:30pm bedtime, wake by 6:45am for morning routine',
        visionFitnessFocus: '3-4 runs per week, mix of tempo and recovery sessions',
        visionMindFocus: 'Read 20-30 pages daily, write morning pages',
        visionSpiritFocus: 'Daily gratitude practice and meditation before bed'
      }
    },
    entries
  };

  return sampleData;
}

// Main execution
console.log('🎲 Generating sample data...');
console.log(`📅 Date range: ${formatDate(START_DATE)} to ${formatDate(END_DATE)} (${DAYS_TO_GENERATE} days)`);
console.log(`⚠️  Excluding today (${formatDate(TODAY)})`);

const sampleData = generateSampleData();
const outputPath = path.join(__dirname, OUTPUT_FILE);

// Ensure directory exists
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const jsonContent = JSON.stringify(sampleData, null, 2);
fs.writeFileSync(outputPath, jsonContent, 'utf8');

console.log(`✅ Generated ${DAYS_TO_GENERATE} days of realistic sample data`);
console.log(`💾 Saved to: ${outputPath}`);

// Analyze the generated data
const entries = Object.values(sampleData.entries);
const activityStats = {
  restDays: entries.filter(e => e.run === 0 && !e.strength && e.skill.length === 0).length,
  lightDays: entries.filter(e => e.run <= 8 && (!e.strength || e.strength_level === 1)).length,
  activeDays: entries.filter(e => e.run > 8 || (e.strength && e.strength_level >= 2)).length,
  intenseDays: entries.filter(e => e.run >= 15).length,
  meditationDays: entries.filter(e => e.meditation).length,
  strengthDays: entries.filter(e => e.strength).length
};

console.log('\n📊 Activity Distribution:');
console.log(`   Rest/Light days: ${activityStats.restDays + activityStats.lightDays}/${DAYS_TO_GENERATE}`);
console.log(`   Active days: ${activityStats.activeDays}/${DAYS_TO_GENERATE}`);
console.log(`   Intense days: ${activityStats.intenseDays}/${DAYS_TO_GENERATE}`);
console.log(`   Meditation days: ${activityStats.meditationDays}/${DAYS_TO_GENERATE}`);
console.log(`   Strength days: ${activityStats.strengthDays}/${DAYS_TO_GENERATE}`);
