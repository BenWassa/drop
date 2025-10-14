/**
 * ===========================
 * SCORING MODULE
 * ===========================
 *
 * Robust scoring system for the four life domains: Sleep, Fitness, Mind, Spirit.
 *
 * DESIGN PRINCIPLES (See SCORING_GUIDE.md for full details):
 * 1. Raw scores are calculated from user input, often with qualitative tiers.
 * 2. Trend-adjusted scores blend current performance with 7-day weighted history.
 * 3. Realistic range adjustment prevents extreme scores (centers around 75-85).
 * 4. Spirit domain is intentionally not "gamified."
 */

const Scoring = {

  /**
   * Calculate Sleep score
   * Based on sleep duration. Remains a quantitative measure.
   *
   * @param {Object} state - Store.state object
   * @param {Object} Store - The Store module
   * @returns {number|null} Score or null if insufficient data
   */
  calcSleep(state, Store) {
    const { wake } = state;
    if (!wake) {
      return this.calcTrendScore('sleep', 0, Store);
    }

    const today = Store.getToday();
    const todayDate = new Date(today + 'T12:00:00');
    const yesterdayDate = new Date(todayDate);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    const yesterdayEntry = Store.state.entries[yesterday];
    const yesterdayRest = yesterdayEntry?.rest;

    if (!yesterdayRest) {
      return this.calcTrendScore('sleep', 0, Store);
    }

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

    return this.calcTrendScore('sleep', rawScore, Store);
  },

  /**
   * Calculate Fitness score
   * Components:
   * - Skill Practice: 40 points (binary)
   * - Strength: up to 30 points (3 tiers)
   * - Running: up to 30 points (logarithmic scale)
   * Max: 100 points
   *
   * @param {Object} state - Store.state object
   * @param {Object} Store - The Store module
   * @returns {number|null} Score or null if insufficient data
   */
  calcFitness(state, Store) {
    let rawScore = 0;

    // Skill practice: 40 points
    const skillSelections = Array.isArray(state.skill) ? state.skill : [];
    if (skillSelections.length > 0) rawScore += 40;

    // Strength training: up to 30 points from 3 tiers
    const strengthLevel = state.strength_level || 0; // Assumes state.strength_level (0, 1, 2, 3)
    if (strengthLevel === 1) rawScore += 10; // "Movement"
    else if (strengthLevel === 2) rawScore += 20; // "Session"
    else if (strengthLevel === 3) rawScore += 30; // "Training"

    // Running: up to 30 points (logarithmic)
    const runDistance = state.run || 0;
    if (runDistance > 0) {
      // Logarithmic scaling: More points for starting, diminishing returns.
      // Math.log(1) = 0, Math.log(21) approx 3.
      // This formula gives a nice curve: 1km=10pts, 5km=20pts, 15km=28pts, 20km=30pts
      const runPoints = Math.min(30, 10 * Math.log(runDistance + 1));
      rawScore += runPoints;
    }

    return this.calcTrendScore('fitness', Math.min(100, rawScore), Store);
  },

  /**
   * Calculate Mind score
   * Components:
   * - Reading: up to 50 points (3 tiers of quality)
   * - Writing: up to 50 points (3 tiers of depth)
   * Max: 100 points
   *
   * @param {Object} state - Store.state object
   * @param {Object} Store - The Store module
   * @returns {number|null} Score or null if insufficient data
   */
  calcMind(state, Store) {
    let rawScore = 0;

    // Reading: up to 50 points from 3 tiers
    const readLevel = state.read_level || 0; // Assumes state.read_level (0, 1, 2, 3)
    if (readLevel === 1) rawScore += 25; // "Leisure"
    else if (readLevel === 2) rawScore += 35; // "Perspicacity"
    else if (readLevel === 3) rawScore += 50; // "Erudition"

    // Writing: up to 50 points from 3 tiers
    const writeLevel = state.write_level || 0; // Assumes state.write_level (0, 1, 2, 3)
    if (writeLevel === 1) rawScore += 25; // "Journal"
    else if (writeLevel === 2) rawScore += 35; // "Editorial"
    else if (writeLevel === 3) rawScore += 50; // "Treatise"

    return this.calcTrendScore('mind', Math.min(100, rawScore), Store);
  },

  /**
   * Calculate Spirit score
   * Components:
   * - Mood Log: 70 points for logging + up to 30 bonus points
   * - Meditation: 0 points (intentionally not scored)
   * Max: 100 points
   *
   * @param {Object} state - Store.state object
   * @param {Object} Store - The Store module
   * @returns {number|null} Score or null if insufficient data
   */
  calcSpirit(state, Store) {
    let rawScore = 0;
    const { energy, mood, quadrant } = state; // Assumes energy and mood are on a -100 to 100 scale

    // Check if mood has been logged. Any non-zero value for energy/mood OR quadrant selection implies logging.
    if (energy !== 0 || mood !== 0 || quadrant > 0) {
      // Base score for showing up and logging mood
      rawScore += 70;

      // Bonus points (0-30) based on energy and mood
      // If sliders haven't been moved but quadrant is selected, use quadrant preset values
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

    // Meditation is intentionally not scored.

    return this.calcTrendScore('spirit', Math.min(100, rawScore), Store);
  },

  /**
   * Calculate trend-adjusted score
   * Blends today's raw score with 7-day weighted historical average.
   * Recent days are weighted higher to reflect momentum and growth.
   *
   * @param {string} domain - Domain name ('sleep', 'fitness', 'mind', 'spirit')
   * @param {number} rawScore - Today's raw score (0-100)
   * @param {Object} Store - Store object for accessing history
   * @returns {number|null} Adjusted score (60-95) or null
   */
  calcTrendScore(domain, rawScore, Store) {
    const history = typeof Store.getHistory === 'function' ? Store.getHistory(7) : [];

    if (history.length < 7) {
      return null;
    }

    let weightedSum = 0;
    let weightSum = 0;

    history.forEach((entry, index) => {
      const score = Number(entry?.scores?.[domain]) || 0;
      const daysAgo = history.length - index;
      const weight = Math.pow(0.7, daysAgo - 1);
      weightedSum += score * weight;
      weightSum += weight;
    });

    const historicalAverage = weightSum > 0 ? weightedSum / weightSum : 0;

    const blendedScore = (rawScore * 0.4) + (historicalAverage * 0.6);

    return this.adjustToRealisticRange(blendedScore);
  },

  /**
   * Adjusts scores to a realistic range using a power curve.
   * PHILOSOPHY:
   * - A raw score of 50 maps to a final score of 80 (center of target range).
   * - It's easier to get to 80, but harder to push into the 90s.
   * - Capped at 95 to eliminate the concept of a "perfect" score.
   *
   * @param {number} blendedScore - Blended score (0-100)
   * @returns {number} Adjusted score (60-95)
   */
  adjustToRealisticRange(blendedScore) {
    const floor = 60;
    const ceiling = 95;

    if (blendedScore <= 0) return floor;

    // Normalize score to a 0-1 range
    const normalized = blendedScore / 100;

    // Apply a power curve (e.g., ^0.8). This makes the score rise quickly at the
    // start and then level off, making it easier to hit the 75-85 sweet spot
    // but harder to reach the ceiling.
    const curvedValue = Math.pow(normalized, 0.8);

    const finalScore = floor + (ceiling - floor) * curvedValue;

    return Math.min(ceiling, Math.round(finalScore));
  },

  /**
   * Calculate domain scores from an entry object (used for history view)
   *
   * NOTE: This calculates RAW scores without trend adjustment
   * Used when viewing historical entries where we want to see
   * the actual performance for that specific day.
   *
   * @param {Object} entry - Entry object with wake, rest, run, strength, etc.
   * @returns {Object} Object with sleep, fitness, mind, spirit scores (raw)
   */
  calculateDomainScores(entry) {
    if (!entry || typeof entry !== 'object') {
      return { sleep: 0, fitness: 0, mind: 0, spirit: 0 };
    }

    // Calculate sleep score
    let sleepScore = 0;
    if (entry.wake && entry.rest) {
      const [wh, wm] = entry.wake.split(':').map(Number);
      const [rh, rm] = entry.rest.split(':').map(Number);
      if (!isNaN(wh) && !isNaN(wm) && !isNaN(rh) && !isNaN(rm)) {
        const wakeMins = wh * 60 + wm;
        const restMins = rh * 60 + rm;
        const duration = restMins < wakeMins ? (1440 - wakeMins + restMins) : (restMins - wakeMins);
        const hours = duration / 60;

        if (hours >= 7 && hours <= 9) sleepScore = 100;
        else if (hours >= 6 && hours < 7) sleepScore = 85;
        else if (hours > 9 && hours <= 10) sleepScore = 85;
        else if (hours >= 5 && hours < 6) sleepScore = 65;
        else if (hours > 10 && hours <= 11) sleepScore = 65;
        else if (hours >= 4 && hours < 5) sleepScore = 45;
        else if (hours > 11) sleepScore = 50;
        else sleepScore = 30;
      }
    }

    // Calculate fitness score
    let fitnessScore = 0;
    const run = Number(entry.run) || 0;
    if (run >= 20) fitnessScore += 45;
    else if (run >= 15) fitnessScore += 38;
    else if (run >= 10) fitnessScore += 32;
    else if (run >= 5) fitnessScore += 25;
    else if (run >= 3) fitnessScore += 18;
    else if (run >= 1) fitnessScore += 10;

    if (entry.strength) fitnessScore += 35;
    const skillLogged = Array.isArray(entry.skill) ? entry.skill.length > 0 : Boolean(entry.skill);
    if (skillLogged) fitnessScore += 20;
    fitnessScore = Math.min(100, fitnessScore);

    // Calculate mind score - NEEDS UPDATE for tiered system
    let mindScore = 0;
    const readLevel = entry.read_level || 0;
    if (readLevel === 1) mindScore += 25; // "Leisure"
    else if (readLevel === 2) mindScore += 35; // "Perspicacity"
    else if (readLevel === 3) mindScore += 50; // "Erudition"

    const writeLevel = entry.write_level || 0;
    if (writeLevel === 1) mindScore += 25; // "Journal"
    else if (writeLevel === 2) mindScore += 35; // "Editorial"
    else if (writeLevel === 3) mindScore += 50; // "Treatise"

    // Calculate spirit score - NEEDS UPDATE for new system
    let spiritScore = 0;
    const { energy, mood } = entry;

    // Check if mood has been logged. Any non-zero value for energy/mood implies logging.
    if (energy !== 0 || mood !== 0) {
      // Base score for showing up and logging mood
      spiritScore += 70;

      // Bonus points (0-30) based on energy and mood
      // Normalize values from [-100, 100] to [0, 1]
      const normalizedEnergy = (energy + 100) / 200;
      const normalizedMood = (mood + 100) / 200;

      // Calculate a combined metric. Mood is weighted slightly more.
      const combinedMetric = (normalizedEnergy * 0.4) + (normalizedMood * 0.6);
      const bonusPoints = Math.round(combinedMetric * 30);

      spiritScore += bonusPoints;
    }

    return {
      sleep: sleepScore,
      fitness: fitnessScore,
      mind: mindScore,
      spirit: spiritScore
    };
  },

  /**
   * Get preset energy/mood values for a quadrant
   * Used when user selects a quadrant and we need to position sliders
   *
   * Quadrants (Circumplex Model of Affect):
   * 1: High Energy, Positive Mood (motivated, energized, excited)
   * 2: Low Energy, Positive Mood (calm, content, relaxed)
   * 3: High Energy, Negative Mood (anxious, stressed, tense)
   * 4: Low Energy, Negative Mood (sad, unmotivated, depressed)
   *
   * @param {number} quadrant - Quadrant number (1-4)
   * @returns {Object} {energy, mood} values (-100 to +100)
   */
  getQuadrantPreset(quadrant) {
    switch (quadrant) {
      case 1:
        return { energy: 65, mood: 70 }; // High energy, positive mood
      case 2:
        return { energy: -60, mood: 70 }; // Low energy, positive mood
      case 3:
        return { energy: 65, mood: -65 }; // High energy, negative mood
      case 4:
        return { energy: -60, mood: -65 }; // Low energy, negative mood
      default:
        return { energy: 0, mood: 0 }; // Neutral
    }
  },

  /**
   * Resolve which quadrant an energy/mood coordinate falls into
   *
   * Uses threshold to create "dead zone" around origin (0,0)
   * This prevents micro-movements from constantly switching quadrants
   *
   * @param {number} energy - Energy value (-100 to +100)
   * @param {number} mood - Mood value (-100 to +100)
   * @returns {number} Quadrant (0-4), 0 = neutral/center
   */
  resolveQuadrant(energy, mood) {
    const threshold = 10;
    const e = Number(energy) || 0;
    const m = Number(mood) || 0;

    // Dead zone: if both values near zero, return neutral
    if (Math.abs(e) < threshold && Math.abs(m) < threshold) {
      return 0;
    }

    // Determine quadrant based on signs
    if (e >= 0 && m >= 0) return 1; // High energy, positive mood
    if (e < 0 && m >= 0) return 2;  // Low energy, positive mood
    if (e >= 0 && m < 0) return 3;  // High energy, negative mood
    if (e < 0 && m < 0) return 4;   // Low energy, negative mood

    return 0; // Fallback to neutral
  }
};