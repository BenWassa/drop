#!/usr/bin/env python3

"""
7-Day Mock Data Generator for drop (Python version)

Generates realistic mock data for 7 days (ending yesterday).
Save output and paste into browser console to load into the app.

Usage:
    python mock-data/generate-7day-data.py
    python mock-data/generate-7day-data.py --json-only > data.json

Then in the browser console:
    localStorage.setItem('lifeTrackerData', `<paste output>`)
    location.reload()
"""

import json
import sys
import math
from datetime import datetime, timedelta

DEFAULT_SETTINGS = {
    'skillOptions': ['Wrestling', 'Volleyball', 'Mobility', 'Yoga', 'Plyometrics'],
    'visionTheme': 'Build momentum through consistent daily inputs.',
    'visionSleepFocus': 'Lights out by 10:30pm, wake refreshed by 6:30am.',
    'visionFitnessFocus': 'Rotate between strength, endurance, and skill work.',
    'visionMindFocus': 'Read 20 pages and journal 5 minutes each day.',
    'visionSpiritFocus': 'Anchor the evening with gratitude and quiet reflection.'
}

DAILY_KEYS = [
    'wake', 'rest', 'run', 'strength', 'strength_level', 'skill',
    'read_level', 'write_level', 'quadrant', 'meditation', 'energy', 'mood'
]

QUADRANT_BASELINES = {
    0: {'energy': 0, 'mood': 0},
    1: {'energy': 60, 'mood': 65},
    2: {'energy': -55, 'mood': 55},
    3: {'energy': 55, 'mood': -55},
    4: {'energy': -60, 'mood': -60}
}


def format_date_key(date_obj):
    """Format date as YYYY-MM-DD"""
    return date_obj.strftime('%Y-%m-%d')


def format_time(hours, minutes):
    """Format time as HH:MM"""
    return f"{hours:02d}:{minutes:02d}"


def seeded_random(seed):
    """Seeded pseudo-random number generator (0.0 to 1.0)"""
    x = math.sin(seed) * 10000
    return x - math.floor(x)


def clamp(value, min_val, max_val):
    """Clamp value between min and max"""
    return max(min_val, min(max_val, value))


def build_entry(date_key, day_index):
    """Build a single day's entry with realistic data"""
    numeric_seed = int(date_key.replace('-', '')) + day_index * 17
    
    def r(offset):
        return seeded_random(numeric_seed + offset)
    
    # Sleep data
    wake_minute_offset = round(r(1) * 50) - 10
    rest_minute_offset = round(r(2) * 55) - 15
    
    wake_base_minutes = 6 * 60 + 20
    rest_base_minutes = 22 * 60 + 15
    
    wake_total_minutes = max(5 * 60 + 30, wake_base_minutes + wake_minute_offset)
    rest_total_minutes = min(23 * 60 + 30, rest_base_minutes + rest_minute_offset)
    
    # Fitness data
    run_distance = round(2 + r(4) * 10) if r(3) > 0.35 else 0
    base_strength_level = round(r(5) * 3) if run_distance > 0 else round(r(5) * 2)
    
    # Cognitive data
    read_level = round(r(6) * 3)
    write_level = round(r(7) * 2)
    meditation = r(11) > 0.4
    
    # Skills
    skill_pool = DEFAULT_SETTINGS['skillOptions']
    skill_count = (2 if r(12) > 0.6 else 1) if run_distance > 0 else (1 if r(12) > 0.75 else 0)
    skill_set = set()
    for i in range(skill_count):
        pick_index = int(r(13 + i) * len(skill_pool))
        skill_set.add(skill_pool[pick_index])
    
    # Determine quadrant based on activity
    strength = r(18) > 0.5
    strength_level = base_strength_level if strength else 0
    
    activity_load = (1 if run_distance > 0 else 0) + (1 if strength else 0) + len(skill_set)
    quadrant_roll = r(10)
    
    if activity_load >= 3:
        quadrant = 1 if quadrant_roll > 0.5 else 3
    elif activity_load == 0:
        quadrant = 2 if quadrant_roll > 0.5 else 4
    else:
        quadrant = max(1, min(4, math.ceil(quadrant_roll * 4)))
    
    # Calculate energy and mood
    run_contribution = (18 + run_distance * 1.2) if run_distance > 0 else -12
    strength_contribution = (12 + strength_level * 4) if strength else -8
    skill_contribution = len(skill_set) * 9
    cognitive_contribution = read_level * 6 + write_level * 5
    effort_score = run_contribution + strength_contribution + skill_contribution + cognitive_contribution + (8 if meditation else -6)
    
    baseline = QUADRANT_BASELINES.get(quadrant, QUADRANT_BASELINES[0])
    activation_shift = clamp(round((effort_score - 30) * 0.5 + (r(8) * 40 - 20)), -45, 45)
    
    energy = clamp(baseline['energy'] + activation_shift, -95, 95)
    if baseline['energy'] < 0:
        energy = min(-5, energy)
    elif baseline['energy'] > 0:
        energy = max(5, energy)
    
    mood_shift = clamp(round((effort_score - 25) * 0.35 + (r(9) * 50 - 25) + (10 if meditation else 0)), -45, 45)
    mood = clamp(baseline['mood'] + mood_shift, -95, 95)
    if baseline['mood'] < 0:
        mood = min(-5, mood)
    elif baseline['mood'] > 0:
        mood = max(5, mood)
    
    # Calculate scores
    sleep_score = min(100, max(50, round(70 + r(14) * 25)))
    fitness_score = min(100, max(45, round((60 + r(15) * 35) if run_distance else (50 + r(15) * 20))))
    mind_score = min(100, max(40, round(55 + read_level * 10 + r(16) * 15)))
    spirit_score = min(100, max(45, round(60 + (15 if meditation else 0) + r(17) * 15)))
    
    # Build entry
    wake_hours = int(wake_total_minutes / 60)
    wake_mins = wake_total_minutes % 60
    rest_hours = int(rest_total_minutes / 60)
    rest_mins = rest_total_minutes % 60
    
    entry = {
        'wake': format_time(wake_hours, wake_mins),
        'rest': format_time(rest_hours, rest_mins),
        'run': run_distance,
        'strength': strength,
        'strength_level': strength_level,
        'skill': list(skill_set),
        'read_level': read_level,
        'write_level': write_level,
        'quadrant': quadrant,
        'meditation': meditation,
        'energy': energy,
        'mood': mood,
        'timestamps': {
            'wake': f"{date_key}T{format_time(wake_hours, wake_mins)}:00.000Z",
            'rest': f"{date_key}T{format_time(rest_hours, rest_mins)}:00.000Z"
        },
        'scores': {
            'sleep': sleep_score,
            'fitness': fitness_score,
            'mind': mind_score,
            'spirit': spirit_score
        }
    }
    
    # Ensure all daily keys present
    for key in DAILY_KEYS:
        if key not in entry:
            entry[key] = None
    
    return entry


def generate_7day_data():
    """Generate 7 days of mock data ending yesterday"""
    today = datetime.now().date()
    yesterday = today - timedelta(days=1)
    entries = {}
    
    # Generate 7 days of data ending yesterday
    for i in range(7):
        current = yesterday - timedelta(days=i)
        date_key = format_date_key(current)
        entries[date_key] = build_entry(date_key, i)
    
    dataset = {
        'skillOptions': DEFAULT_SETTINGS['skillOptions'],
        'visionTheme': DEFAULT_SETTINGS['visionTheme'],
        'visionSleepFocus': DEFAULT_SETTINGS['visionSleepFocus'],
        'visionFitnessFocus': DEFAULT_SETTINGS['visionFitnessFocus'],
        'visionMindFocus': DEFAULT_SETTINGS['visionMindFocus'],
        'visionSpiritFocus': DEFAULT_SETTINGS['visionSpiritFocus'],
        'lastEntryDate': format_date_key(yesterday),
        'entries': entries,
        'meta': {
            '_version': 2,
            '_schemaDate': '2024-05-01',
            'settings': DEFAULT_SETTINGS
        }
    }
    
    return dataset


def main():
    """Main entry point"""
    data = generate_7day_data()
    json_string = json.dumps(data, separators=(',', ':'))
    
    if '--json-only' in sys.argv:
        print(json_string)
    else:
        print('=' * 80)
        print('📊 7-Day Mock Data Generated')
        print('=' * 80)
        print('\n✅ Copy the command below and paste into browser console:\n')
        print(f"localStorage.setItem('lifeTrackerData', '{json_string}')")
        print('\nThen reload the page: location.reload()\n')
        print('=' * 80)
        print('\nData summary:')
        print(f"  Entries: {len(data['entries'])} days")
        sorted_dates = sorted(data['entries'].keys())
        print(f"  Date range: {sorted_dates[0]} to {sorted_dates[-1]}")
        print(f"  Vision skills: {', '.join(DEFAULT_SETTINGS['skillOptions'])}")
        print('=' * 80)


if __name__ == '__main__':
    main()
