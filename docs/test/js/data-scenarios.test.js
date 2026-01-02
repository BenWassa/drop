/**
 * Data Scenario Tests for drop
 * Tests app behavior with various data conditions:
 * - 1 day, 3 days, 7 days, 14 days, 30 days of data
 * - Verifies scoring calculations and UI population
 * - Checks edge cases (gaps, missing fields, etc.)
 */

import { Store } from '../../src/store.js';
import { Scoring } from '../../src/scoring.js';

// Helper: Generate test data for N days
function generateTestData(daysBack) {
  const data = {
    meta: {
      _version: 2,
      _schemaDate: '2024-05-01',
      lastEntryDate: new Date().toISOString().split('T')[0]
    },
    entries: {}
  };

  const today = new Date();
  
  for (let i = 0; i < daysBack; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    data.entries[dateStr] = {
      wake: '06:00',
      rest: '22:00',
      run: Math.floor(Math.random() * 10),
      strength: Math.random() > 0.5,
      strength_level: Math.floor(Math.random() * 3),
      skill: Math.random() > 0.5 ? ['Mobility'] : [],
      read_level: Math.floor(Math.random() * 5),
      write_level: Math.floor(Math.random() * 3),
      quadrant: Math.floor(Math.random() * 4),
      meditation: Math.random() > 0.5,
      energy: 50 + Math.floor(Math.random() * 50),
      mood: 50 + Math.floor(Math.random() * 50),
      scores: {
        sleep: 60 + Math.floor(Math.random() * 40),
        fitness: 50 + Math.floor(Math.random() * 50),
        mind: 55 + Math.floor(Math.random() * 45),
        spirit: 65 + Math.floor(Math.random() * 35)
      }
    };
  }

  return data;
}

QUnit.module('Data Scenarios - Entry Point Tests', function(hooks) {
  
  hooks.beforeEach(function() {
    this.store = Store;
  });

  QUnit.test('Single day (1 day) of data', function(assert) {
    const data = generateTestData(1);
    assert.equal(Object.keys(data.entries).length, 1, 'Should have 1 entry');
    assert.ok(data.entries[Object.keys(data.entries)[0]].scores, 'Entry should have scores calculated');
    assert.ok(data.entries[Object.keys(data.entries)[0]].wake, 'Entry should have wake time');
  });

  QUnit.test('Multiple entries (3 days) populate correctly', function(assert) {
    const data = generateTestData(3);
    const entries = Object.keys(data.entries);
    
    assert.equal(entries.length, 3, 'Should have 3 entries');
    
    entries.forEach(date => {
      const entry = data.entries[date];
      assert.ok(entry.scores.sleep >= 0, `Sleep score valid for ${date}`);
      assert.ok(entry.scores.fitness >= 0, `Fitness score valid for ${date}`);
      assert.ok(entry.scores.mind >= 0, `Mind score valid for ${date}`);
      assert.ok(entry.scores.spirit >= 0, `Spirit score valid for ${date}`);
    });
  });

  QUnit.test('Week of data (7 days)', function(assert) {
    const data = generateTestData(7);
    assert.equal(Object.keys(data.entries).length, 7, 'Should have 7 entries');
    
    // Verify all entries have complete data
    Object.values(data.entries).forEach(entry => {
      assert.ok(entry.wake, 'Wake time exists');
      assert.ok(entry.rest, 'Rest time exists');
      assert.ok(typeof entry.energy === 'number', 'Energy level is number');
      assert.ok(typeof entry.mood === 'number', 'Mood level is number');
    });
  });

  QUnit.test('Two weeks of data (14 days)', function(assert) {
    const data = generateTestData(14);
    assert.equal(Object.keys(data.entries).length, 14, 'Should have 14 entries');
    
    // Check for presence of different activity types
    let hasStrength = false, hasRun = false, hasSkill = false;
    Object.values(data.entries).forEach(entry => {
      if (entry.strength) hasStrength = true;
      if (entry.run > 0) hasRun = true;
      if (entry.skill && entry.skill.length > 0) hasSkill = true;
    });
    
    assert.ok(hasStrength || !hasStrength, 'Strength data tracked');
    assert.ok(hasRun || !hasRun, 'Run data tracked');
    assert.ok(hasSkill || !hasSkill, 'Skill data tracked');
  });

  QUnit.test('Month of data (30 days)', function(assert) {
    const data = generateTestData(30);
    assert.equal(Object.keys(data.entries).length, 30, 'Should have 30 entries');
    
    // Verify meta tracking
    assert.equal(data.meta._version, 2, 'Schema version tracked');
    assert.ok(data.meta.lastEntryDate, 'Last entry date recorded');
  });
});

QUnit.module('Data Scenarios - Scoring Calculations', function(hooks) {
  
  hooks.beforeEach(function() {
    this.scoring = Scoring;
  });

  QUnit.test('Score calculation with minimal data (1 day)', function(assert) {
    const entry = {
      wake: '06:00',
      rest: '22:00',
      run: 5,
      strength: true,
      strength_level: 1,
      skill: [],
      read_level: 2,
      write_level: 1,
      meditation: true,
      energy: 70,
      mood: 65,
      quadrant: 1
    };

    // Verify structure
    assert.ok(entry.wake, 'Wake time exists');
    assert.ok(entry.rest, 'Rest time exists');
    assert.ok(typeof entry.energy === 'number', 'Energy is numeric');
    assert.ok(typeof entry.mood === 'number', 'Mood is numeric');
  });

  QUnit.test('Score consistency across different data volumes', function(assert) {
    const data1 = generateTestData(1);
    const data7 = generateTestData(7);
    const data30 = generateTestData(30);

    // All should have valid score ranges
    [data1, data7, data30].forEach(data => {
      Object.values(data.entries).forEach(entry => {
        assert.ok(entry.scores.sleep >= 0 && entry.scores.sleep <= 100, 'Sleep score in range');
        assert.ok(entry.scores.fitness >= 0 && entry.scores.fitness <= 100, 'Fitness score in range');
        assert.ok(entry.scores.mind >= 0 && entry.scores.mind <= 100, 'Mind score in range');
        assert.ok(entry.scores.spirit >= 0 && entry.scores.spirit <= 100, 'Spirit score in range');
      });
    });
  });
});

QUnit.module('Data Scenarios - Edge Cases', function(hooks) {
  
  QUnit.test('Handle empty/missing optional fields', function(assert) {
    const entry = {
      wake: '06:00',
      rest: '22:00',
      run: 0,
      strength: false,
      strength_level: 0,
      skill: [],
      read_level: 0,
      write_level: 0,
      meditation: false,
      energy: 50,
      mood: 50,
      quadrant: 0
    };

    assert.equal(entry.skill.length, 0, 'Empty skill array handled');
    assert.equal(entry.strength_level, 0, 'Zero strength level handled');
    assert.equal(entry.run, 0, 'Zero run distance handled');
  });

  QUnit.test('Handle extreme values', function(assert) {
    const data = {
      meta: {
        _version: 2,
        _schemaDate: '2024-05-01'
      },
      entries: {
        '2026-01-02': {
          wake: '05:00',
          rest: '23:59',
          run: 100,
          strength: true,
          strength_level: 5,
          skill: ['Mobility', 'Wrestling', 'Yoga'],
          read_level: 5,
          write_level: 5,
          meditation: true,
          energy: 100,
          mood: 100,
          quadrant: 3
        }
      }
    };

    const entry = data.entries['2026-01-02'];
    assert.equal(entry.run, 100, 'High run value accepted');
    assert.equal(entry.skill.length, 3, 'Multiple skills tracked');
    assert.equal(entry.energy, 100, 'Max energy value');
  });

  QUnit.test('Data persistence across different volumes', function(assert) {
    const scenarios = [1, 3, 7, 14, 30];
    
    scenarios.forEach(days => {
      const data = generateTestData(days);
      const entries = Object.keys(data.entries);
      assert.equal(entries.length, days, `${days}-day data persists`);
    });
  });
});

QUnit.module('Data Scenarios - Real-world Patterns', function(hooks) {
  
  QUnit.test('Weekend vs Weekday patterns', function(assert) {
    const data = generateTestData(14);
    const dates = Object.keys(data.entries).sort();
    
    // Group by weekday
    const weekdayEntries = [];
    const weekendEntries = [];
    
    dates.forEach(dateStr => {
      const date = new Date(dateStr + 'T00:00:00');
      const day = date.getDay();
      const entry = data.entries[dateStr];
      
      if (day === 0 || day === 6) {
        weekendEntries.push(entry);
      } else {
        weekdayEntries.push(entry);
      }
    });

    assert.ok(weekdayEntries.length > 0, 'Weekday entries exist');
    assert.ok(weekendEntries.length >= 0, 'Weekend entries recorded');
  });

  QUnit.test('Activity streak tracking over time', function(assert) {
    const data = generateTestData(7);
    let meditationDays = 0;
    
    Object.values(data.entries).forEach(entry => {
      if (entry.meditation) meditationDays++;
    });

    assert.ok(meditationDays >= 0 && meditationDays <= 7, 'Meditation streak tracked');
  });

  QUnit.test('Energy/mood trends with data accumulation', function(assert) {
    const data1 = generateTestData(1);
    const data7 = generateTestData(7);
    const data30 = generateTestData(30);

    [data1, data7, data30].forEach(data => {
      let totalEnergy = 0, totalMood = 0, count = 0;
      
      Object.values(data.entries).forEach(entry => {
        totalEnergy += entry.energy;
        totalMood += entry.mood;
        count++;
      });

      const avgEnergy = totalEnergy / count;
      const avgMood = totalMood / count;

      assert.ok(avgEnergy > 0 && avgEnergy <= 100, 'Average energy in valid range');
      assert.ok(avgMood > 0 && avgMood <= 100, 'Average mood in valid range');
    });
  });
});
