/**
 * ===========================
 * SCORING MODULE
 * ===========================
 * 
 * Robust scoring system for the four life domains: Sleep, Fitness, Mind, Spirit.
 * 
 * DESIGN PRINCIPLES:
 * 1. Raw scores are calculated from user input (0-100 range)
 * 2. Trend-adjusted scores blend current performance with 7-day weighted history
 * 3. Realistic range adjustment prevents extreme scores (centers around 75-85)
 * 4. Each domain has clear, measurable criteria
 * 
 * DOMAIN BREAKDOWN:
 * - Sleep: Duration-based (7-9 hours optimal = 100 raw)
 * - Fitness: Multi-component (run 45pts, strength 35pts, skill 20pts)
 * - Mind: Binary activities (read 55pts, write 45pts)
 * - Spirit: Mood quadrant (50pts) + meditation (50pts)
 */

const Scoring = {
  
  /**
   * Calculate Sleep score
   * Based on sleep duration (wake time - rest time)
   * Optimal: 7-9 hours = 100 raw score
   * 
   * @param {Object} state - Store.state object with wake and rest times
   * @param {Object} Store - Store object for accessing history
   * @returns {number|null} Score (60-95) or null if insufficient data
   */
  calcSleep(state, Store) {
    console.log('😴 calcSleep called with state:', { wake: state.wake, rest: state.rest });
    
    const { wake, rest } = state;
    if (!wake || !rest) {
      console.log('⚠️ Sleep: Missing wake or rest time, returning trend score with 0');
      return this.calcTrendScore('sleep', 0, Store);
    }
    
    const [wh, wm] = wake.split(':').map(Number);
    const [rh, rm] = rest.split(':').map(Number);
    const wakeMins = wh * 60 + wm;
    const restMins = rh * 60 + rm;
    const duration = restMins < wakeMins ? (1440 - wakeMins + restMins) : (restMins - wakeMins);
    const hours = duration / 60;
    
    console.log('😴 Sleep calculated:', { hours, wakeMins, restMins, duration });
    
    // Raw scoring: optimal sleep (7-9 hours) = 100, poor sleep = lower
    let rawScore;
    if (hours >= 7 && hours <= 9) {
      rawScore = 100; // Optimal
    } else if (hours >= 6 && hours < 7) {
      rawScore = 85; // Good
    } else if (hours > 9 && hours <= 10) {
      rawScore = 85; // Good (slight oversleep)
    } else if (hours >= 5 && hours < 6) {
      rawScore = 65; // Below optimal
    } else if (hours > 10 && hours <= 11) {
      rawScore = 65; // Oversleep
    } else if (hours >= 4 && hours < 5) {
      rawScore = 45; // Poor
    } else if (hours > 11) {
      rawScore = 50; // Significant oversleep
    } else {
      rawScore = 30; // Very poor (<4 hours)
    }
    
    return this.calcTrendScore('sleep', rawScore, Store);
  },

  /**
   * Calculate Fitness score
   * Components:
   * - Running: 0-45 points (scaled by distance)
   * - Strength training: 35 points (binary)
   * - Skill practice: 20 points (binary)
   * Max: 100 points
   * 
   * @param {Object} state - Store.state object
   * @param {Object} Store - Store object for accessing history
   * @returns {number|null} Score (60-95) or null if insufficient data
   */
  calcFitness(state, Store) {
    let rawScore = 0;
    
    // Running: up to 45 points
    if (state.run >= 20) rawScore += 45;
    else if (state.run >= 15) rawScore += 38;
    else if (state.run >= 10) rawScore += 32;
    else if (state.run >= 5) rawScore += 25;
    else if (state.run >= 3) rawScore += 18;
    else if (state.run >= 1) rawScore += 10;
    
    // Strength training: 35 points
    if (state.strength) rawScore += 35;
    
    // Skill practice: 20 points
    const skillSelections = Array.isArray(state.skill) ? state.skill : [];
    if (skillSelections.length > 0) rawScore += 20;
    
    return this.calcTrendScore('fitness', Math.min(100, rawScore), Store);
  },

  /**
   * Calculate Mind score
   * Components:
   * - Reading: 55 points (intellectual input)
   * - Writing: 45 points (intellectual output/processing)
   * Max: 100 points
   * 
   * @param {Object} state - Store.state object
   * @param {Object} Store - Store object for accessing history
   * @returns {number|null} Score (60-95) or null if insufficient data
   */
  calcMind(state, Store) {
    let rawScore = 0;
    
    // Reading: 55 points (intellectual input)
    if (state.read) rawScore += 55;
    
    // Writing: 45 points (intellectual output/processing)
    if (state.write) rawScore += 45;
    
    return this.calcTrendScore('mind', rawScore, Store);
  },

  /**
   * Calculate Spirit score
   * Components:
   * - Mood quadrant: 0-50 points based on emotional state
   *   * Q1 (motivated/energized): 50 points
   *   * Q2 (calm/content): 50 points
   *   * Q3 (calm/unmotivated): 35 points
   *   * Q4 (stressed/anxious): 25 points
   * - Meditation: 50 points (mindfulness practice)
   * Max: 100 points
   * 
   * @param {Object} state - Store.state object
   * @param {Object} Store - Store object for accessing history
   * @returns {number|null} Score (60-95) or null if insufficient data
   */
  calcSpirit(state, Store) {
    let rawScore = 0;
    const { quadrant, meditation } = state;

    // Mood quadrant: up to 50 points
    // Q1 (motivated/energized) & Q2 (calm/content) = optimal states
    if (quadrant === 1 || quadrant === 2) {
      rawScore += 50;
    } else if (quadrant === 3) {
      // Q3 (calm/unmotivated): neutral state
      rawScore += 35;
    } else if (quadrant === 4) {
      // Q4 (stressed/anxious): challenging state but still scored
      rawScore += 25;
    }
    
    // Meditation: 50 points (mindfulness practice)
    if (meditation) rawScore += 50;
    
    return this.calcTrendScore('spirit', Math.min(100, rawScore), Store);
  },

  /**
   * Calculate trend-adjusted score
   * Blends today's raw score with 7-day weighted historical average
   * Requires 7 days of data to establish baseline trend
   * 
   * Algorithm:
   * 1. Calculate weighted 7-day average (recent days weighted higher)
   * 2. Blend today's score (40%) with historical trend (60%)
   * 3. Adjust to realistic range (60-95) with center around 80
   * 
   * Returns null if insufficient data (< 7 days) to establish baseline
   * 
   * @param {string} domain - Domain name ('sleep', 'fitness', 'mind', 'spirit')
   * @param {number} rawScore - Today's raw score (0-100)
   * @param {Object} Store - Store object for accessing history
   * @returns {number|null} Adjusted score (60-95) or null
   */
  calcTrendScore(domain, rawScore, Store) {
    const history = Array.isArray(Store.state.history) ? Store.state.history.slice(-7) : [];
    
    // Require at least 7 days of data to establish baseline trend
    if (history.length < 7) {
      return null; // Not enough data - will display as dash
    }

    // Calculate 7-day weighted average (more recent = higher weight)
    let weightedSum = 0;
    let weightSum = 0;
    
    history.forEach((entry, index) => {
      const score = Number(entry?.scores?.[domain]) || 0;
      // Exponential decay: most recent day has highest weight
      const daysAgo = history.length - index;
      const weight = Math.pow(0.7, daysAgo - 1); // Recent days weighted 1.0, 0.7, 0.49, 0.34...
      weightedSum += score * weight;
      weightSum += weight;
    });
    
    const historicalAverage = weightSum > 0 ? weightedSum / weightSum : 0;
    
    // Blend today's score (40%) with historical trend (60%)
    const blendedScore = (rawScore * 0.4) + (historicalAverage * 0.6);
    
    // Adjust to realistic range centered around 80
    return this.adjustToRealisticRange(blendedScore);
  },

  /**
   * Adjusts raw scores to realistic range
   * 
   * PHILOSOPHY:
   * - Real-world performance naturally clusters around 75-85
   * - Perfect scores (100) and failures (0) are rare
   * - Uses sigmoid curve for smooth, natural transitions
   * 
   * MAPPING:
   * - 0 raw → 60 (floor: any activity = baseline)
   * - 50 raw → 78 (typical performance)
   * - 75 raw → 84 (good performance)
   * - 100 raw → 95 (ceiling: excellence)
   * 
   * @param {number} rawScore - Raw score (0-100)
   * @returns {number} Adjusted score (60-95)
   */
  adjustToRealisticRange(rawScore) {
    // Baseline floor: any activity gives you at least 60
    const floor = 60;
    const ceiling = 95;
    const target = 80; // Center point for typical performance
    
    if (rawScore <= 0) return floor;
    if (rawScore >= 100) return ceiling;
    
    // Sigmoid adjustment: compress extremes, expand middle range
    // This creates natural clustering around 70-88 for typical performance
    const normalized = rawScore / 100;
    
    // Apply compression to reduce variance
    // Maps: 0->60, 50->78, 75->84, 100->95
    const compressed = floor + (ceiling - floor) * (
      0.5 + 0.5 * Math.tanh(2.5 * (normalized - 0.5))
    );
    
    return Math.round(compressed);
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

    // Calculate mind score
    let mindScore = 0;
    if (entry.read) mindScore += 55;
    if (entry.write) mindScore += 45;

    // Calculate spirit score
    let spiritScore = 0;
    const quadrant = Number(entry.quadrant) || 0;
    if (quadrant === 1 || quadrant === 2) spiritScore += 50;
    else if (quadrant === 3) spiritScore += 35;
    else if (quadrant === 4) spiritScore += 25;
    if (entry.meditation) spiritScore += 50;

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
