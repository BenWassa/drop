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

    return Math.max(0, Math.min(100, rawScore));
  },

  calcFitness(state) {
    let rawScore = 0;

    // Skill practice: 40 points (binary - any skill selected)
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

    return Math.round(Math.max(0, Math.min(100, rawScore)));
  },

  calcMind(state) {
    let rawScore = 0;

    // Reading: up to 50 points from 3 tiers
    const readLevel = state.read_level || 0;
    if (readLevel === 1) rawScore += 25; // "Leisure"
    else if (readLevel === 2) rawScore += 35; // "Perspicacity"
    else if (readLevel === 3) rawScore += 50; // "Erudition"

    // Writing: up to 50 points from 3 tiers
    const writeLevel = state.write_level || 0;
    if (writeLevel === 1) rawScore += 25; // "Journal"
    else if (writeLevel === 2) rawScore += 35; // "Editorial"
    else if (writeLevel === 3) rawScore += 50; // "Treatise"

    return Math.max(0, Math.min(100, rawScore));
  },

  calcSpirit(state) {
    let rawScore = 0;
    const { energy, mood, quadrant } = state;

    // Check if mood has been logged
    if (energy !== 0 || mood !== 0 || quadrant > 0) {
      // Base score for showing up and logging mood
      rawScore += 70;

      // Bonus points (0-30) based on energy and mood
      let effectiveEnergy = energy;
      let effectiveMood = mood;
      if (energy === 0 && mood === 0 && quadrant > 0) {
        const preset = this.getQuadrantPreset(quadrant);
        effectiveEnergy = preset.energy;
        effectiveMood = preset.mood;
      }

      // Normalize values from [-100, 100] to [0, 1]
      const normalizedEnergy = (effectiveEnergy + 100) / 200;
      const normalizedMood = (effectiveMood + 100) / 200;

      // Calculate a combined metric. Mood is weighted slightly more.
      const combinedMetric = (normalizedEnergy * 0.4) + (normalizedMood * 0.6);
      const bonusPoints = Math.round(combinedMetric * 30);

      rawScore += bonusPoints;
    }

    return Math.max(0, Math.min(100, rawScore));
  },

  getQuadrantPreset(quadrant) {
    const presets = {
      1: { energy: 80, mood: 80 }, // High energy, positive
      2: { energy: -20, mood: 60 }, // Low energy, positive
      3: { energy: 70, mood: -30 }, // High energy, challenged
      4: { energy: -50, mood: -50 } // Low energy, challenged
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
  write_level: [0, 1, 2],
  quadrant: [1, 2, 3, 4],
  meditation: [false, true]
};

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

  // Add energy and mood for spirit scoring (required for mood logging)
  entry.energy = getRandomInt(-100, 100);
  entry.mood = getRandomInt(-100, 100);

  // Add some realistic correlations
  if (entry.run > 10 && Math.random() > 0.7) {
    entry.strength = false; // Long runs might skip strength training
  }

  if (entry.skill.length > 1 && Math.random() > 0.8) {
    entry.run = Math.min(entry.run, 8); // Multiple skills might mean less running
  }

  return entry;
}

function calculateScores(entry) {
  // Create a mock state object
  const state = { ...entry };

  // Mock yesterday's rest for sleep calculation
  state.mockYesterdayRest = getRandomChoice(['22:00', '22:30', '23:00', '23:30']);

  const scores = {
    sleep: Scoring.calcSleep(state),
    fitness: Scoring.calcFitness(state),
    mind: Scoring.calcMind(state),
    spirit: Scoring.calcSpirit(state)
  };

  return scores;
}

function assessRealism(entry, scores) {
  let issues = [];
  let score = 100; // Start with perfect realism score

  // Check for unrealistic combinations
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

  if (entry.run === 0 && entry.strength === false && entry.skill.length === 0 &&
      entry.read_level === 0 && entry.write_level === 0 && entry.meditation === false) {
    issues.push('Completely inactive day');
    score -= 10;
  }

  // Check score correlations
  if (entry.run > 10 && scores.fitness < 60) {
    issues.push('High running distance but low fitness score');
    score -= 15;
  }

  if (entry.meditation && scores.spirit < 50) {
    issues.push('Meditation logged but low spirit score');
    score -= 15;
  }

  if (entry.read_level === 3 && entry.write_level === 2 && scores.mind < 80) {
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

  // First, test the specific example from the user
  console.log('🎯 TESTING USER EXAMPLE: 9km run + strength + wrestling + volleyball');
  const userExample = {
    wake: '06:45',
    rest: '22:30',
    run: 9,
    strength: true,
    strength_level: 1,
    skill: ['Wrestling', 'Volleyball'],
    read_level: 1,
    write_level: 1,
    quadrant: 2,
    meditation: true,
    energy: 60, // Add required fields for spirit scoring
    mood: 70
  };
  const userScores = calculateScores(userExample);
  const userRealism = assessRealism(userExample, userScores);

  console.log('Activities:', formatEntry(userExample));
  console.log('Scores:', userScores);
  console.log(`Realism: ${userRealism.score}/100 ${userRealism.score >= 70 ? '✅' : '⚠️'}`);
  if (userRealism.issues.length > 0) {
    console.log('Issues:', userRealism.issues);
  }
  console.log('---\n');

  // Then run random tests
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