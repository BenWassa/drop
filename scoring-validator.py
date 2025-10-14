import random
import math
import pandas as pd
from tabulate import tabulate

class Scoring:
    @staticmethod
    def get_quadrant_preset(quadrant):
        presets = {
            1: {'energy': 65, 'mood': 70},
            2: {'energy': -60, 'mood': 70},
            3: {'energy': 65, 'mood': -65},
            4: {'energy': -60, 'mood': -65}
        }
        return presets.get(quadrant, {'energy': 0, 'mood': 0})

    @staticmethod
    def calc_sleep(state):
        wake = state.get('wake')
        if not wake: return 0
        yesterday_rest = state.get('mockYesterdayRest', '22:30')
        if not yesterday_rest: return 0
        wh, wm = map(int, wake.split(':'))
        rh, rm = map(int, yesterday_rest.split(':'))
        wake_mins = wh * 60 + wm
        rest_mins = rh * 60 + rm
        duration = wake_mins + (1440 - rest_mins) if rest_mins <= wake_mins else (wake_mins + (1440 - rest_mins)) % 1440
        hours = duration / 60
        if 7 <= hours <= 9: raw_score = 100
        elif 6 <= hours < 7 or 9 < hours <= 10: raw_score = 85
        elif 5 <= hours < 6 or 10 < hours <= 11: raw_score = 65
        elif 4 <= hours < 5: raw_score = 45
        elif hours > 11: raw_score = 50
        else: raw_score = 30
        return max(0, min(99, raw_score))

    @staticmethod
    def calculate_activity_count_for_state(state):
        if not isinstance(state, dict): return 0
        run_count = 1 if float(state.get('run', 0)) > 0 else 0
        strength_count = 1 if state.get('strength_level', 0) > 0 else 0
        skill_count = 1 if state.get('skill') else 0
        read_count = 1 if state.get('read_level', 0) > 0 else 0
        write_count = 1 if state.get('write_level', 0) > 0 else 0
        meditation_count = 1 if state.get('meditation') else 0
        return run_count + strength_count + skill_count + read_count + write_count + meditation_count

    def calc_fitness(self, state):
        raw_score = 0
        if state.get('skill'): raw_score += 50
        strength_level = state.get('strength_level', 0)
        raw_score += {0: 0, 1: 15, 2: 25, 3: 35}.get(strength_level, 0)
        run_distance = state.get('run', 0)
        if run_distance > 0:
            raw_score += min(50, 15 * math.log(run_distance + 1))
        activity_count = self.calculate_activity_count_for_state(state)
        adjusted_raw = round(raw_score)
        # REMOVED: Dampening - now only UI warning
        return max(0, min(99, adjusted_raw))

    @staticmethod
    def calc_mind(state):
        raw_score = 0
        read_level = int(state.get('read_level', 0))
        write_level = int(state.get('write_level', 0))
        raw_score += {0: 0, 1: 25, 2: 40, 3: 60}.get(read_level, 0)
        raw_score += {0: 0, 1: 25, 2: 40, 3: 60}.get(write_level, 0)
        if read_level > 0 and write_level > 0:
            raw_score += round(((read_level + write_level) / 6) * 10)
        return max(0, min(99, round(raw_score)))

    def calc_spirit(self, state):
        energy, mood, quadrant = state.get('energy', 0), state.get('mood', 0), state.get('quadrant', 0)
        if energy == 0 and mood == 0 and quadrant == 0: return 0
        raw_score = 70
        effective_energy, effective_mood = energy, mood
        if energy == 0 and mood == 0 and quadrant > 0:
            preset = self.get_quadrant_preset(quadrant)
            effective_energy, effective_mood = preset['energy'], preset['mood']
        normalized_energy = (effective_energy + 100) / 200
        normalized_mood = (effective_mood + 100) / 200
        combined_metric = (normalized_energy * 0.4) + (normalized_mood * 0.6)
        raw_score += round(combined_metric * 30)
        return max(0, min(99, raw_score))

ACTIVITY_PATTERNS = {
  'restDay': {'run': [0, 3], 'strength': [False], 'skill': [[], ['Mobility'], ['Yoga']], 'read_level': [1, 2, 3], 'write_level': [0, 1, 2], 'meditation': [True, False], 'weight': 0.1, 'intensity': 1},
  'lightDay': {'run': [3, 5, 8], 'strength': [False, True], 'strength_level': [1], 'skill': [[], ['Mobility'], ['Yoga'], ['Wrestling']], 'read_level': [1, 2], 'write_level': [0, 1], 'meditation': [True, False], 'weight': 0.3, 'intensity': 2},
  'activeDay': {'run': [8, 10, 12, 15], 'strength': [True, False], 'strength_level': [1, 2], 'skill': [['Wrestling'], ['Volleyball'], ['Wrestling', 'Mobility']], 'read_level': [0, 1, 2], 'write_level': [0, 1], 'meditation': [True, False], 'weight': 0.4, 'intensity': 3},
  'intenseDay': {'run': [15, 18, 20], 'strength': [False], 'strength_level': [0], 'skill': [[], ['Mobility']], 'read_level': [0, 1], 'write_level': [0], 'meditation': [True, False], 'weight': 0.2, 'intensity': 4}
}

def select_weighted_pattern():
    patterns = list(ACTIVITY_PATTERNS.keys())
    weights = [p['weight'] for p in ACTIVITY_PATTERNS.values()]
    chosen_pattern_name = random.choices(patterns, weights, k=1)[0]
    return ACTIVITY_PATTERNS[chosen_pattern_name]

def generate_realistic_entry():
    pattern = select_weighted_pattern()
    strength = random.choice(pattern['strength'])
    entry = {
        'run': random.choice(pattern['run']), 'strength': strength,
        'strength_level': random.choice(pattern.get('strength_level', [0])) if strength else 0,
        'skill': random.choice(pattern['skill']), 'read_level': random.choice(pattern['read_level']),
        'write_level': random.choice(pattern['write_level']), 'meditation': random.choice(pattern['meditation']),
        'wake': random.choice(['06:00', '06:30', '07:00', '07:30', '08:00']),
        'rest': random.choice(['22:00', '22:30', '23:00', '23:30', '00:00']),
        'quadrant': random.randint(1, 4),
        'energy': random.randint(-100, 100),
        'mood': random.randint(-100, 100)
    }
    return entry

def adjust_to_realistic_range(score):
    if score is None: return 40
    floor, ceiling = 40, 99
    if score <= 0: return floor
    normalized = max(0, min(1, score / 100))
    mean, sigma = 0.72, 0.14
    z = (normalized - mean) / (sigma * math.sqrt(2))
    phi = 0.5 * (1 + math.erf(z))
    return min(ceiling, round(floor + (ceiling - floor) * phi))

def calculate_all_scores(entry, scoring_instance):
    state = entry.copy()
    state['mockYesterdayRest'] = random.choice(['22:00', '22:30', '23:00', '23:30'])
    raw = {
        'sleep': scoring_instance.calc_sleep(state), 'fitness': scoring_instance.calc_fitness(state),
        'mind': scoring_instance.calc_mind(state), 'spirit': scoring_instance.calc_spirit(state)
    }
    trended = {domain: adjust_to_realistic_range(score) for domain, score in raw.items()}
    return {'raw': raw, 'trended': trended}

def assess_realism(entry, scores, scoring_instance):
    issues = []
    score = 100
    total_activity = scoring_instance.calculate_activity_count_for_state(entry)
    if total_activity > 4:
        issues.append('Overloaded day')
        score -= 20
    if entry['run'] > 15 and entry['strength'] and entry['skill']:
        issues.append('Unrealistic combo (long run + strength + skill)')
        score -= 25
    if total_activity == 0:
        issues.append('Inactive day')
        score -= 10
    return {'score': max(0, score), 'issues': ', '.join(issues) if issues else 'None'}

def run_monte_carlo_test(iterations=10):
    scoring_instance = Scoring()
    print('🎲 IMPROVED SCORING VALIDATION TOOL (Python)')
    print('================================================\n')
    
    # --- Deterministic Tests ---
    print('🧪 Running Deterministic Validation Cases...')
    deterministic_tests = [
        {'label': 'High Fitness Day', 'entry': {'run': 12, 'strength': True, 'strength_level': 3, 'skill': ['Wrestling'], 'read_level': 0, 'write_level': 0, 'quadrant': 1, 'meditation': False, 'energy': 70, 'mood': 80, 'wake': '06:00'}},
        {'label': 'High Mind Day', 'entry': {'run': 0, 'strength': False, 'strength_level': 0, 'skill': [], 'read_level': 3, 'write_level': 3, 'quadrant': 0, 'meditation': False, 'energy': 0, 'mood': 0, 'wake': '07:00'}},
        {'label': 'Unrealistic Day', 'entry': {'run': 20, 'strength': True, 'strength_level': 2, 'skill': ['Wrestling','Volleyball'], 'read_level': 1, 'write_level': 1, 'quadrant': 1, 'meditation': False, 'energy': 80, 'mood': 85, 'wake': '06:00'}}
    ]
    table_data = []
    for test in deterministic_tests:
        scores = calculate_all_scores(test['entry'], scoring_instance)['raw']
        realism = assess_realism(test['entry'], scores, scoring_instance)
        table_data.append([test['label'], scores['sleep'], scores['fitness'], scores['mind'], scores['spirit'], f"{realism['score']}/100", realism['issues']])
    print(tabulate(table_data, headers=['Scenario', 'Sleep', 'Fitness', 'Mind', 'Spirit', 'Realism', 'Issues'], tablefmt='grid'))
    
    # --- Monte Carlo Simulation ---
    print(f'\n🔄 Running {iterations} Realistic Random Test Cases (Monte Carlo)...')
    results = []
    for _ in range(iterations):
        entry = generate_realistic_entry()
        scores = calculate_all_scores(entry, scoring_instance)
        realism = assess_realism(entry, scores['raw'], scoring_instance)
        results.append({'entry': entry, 'scores': scores, 'realism': realism})
    
    table_data = []
    for res in results:
        s_raw = res['scores']['raw']
        s_trended = res['scores']['trended']
        activities = f"Run: {res['entry']['run']}km, Strength: L{res['entry']['strength_level']}, Read: L{res['entry']['read_level']}, Write: L{res['entry']['write_level']}"
        scores_str = f"Raw: {s_raw['fitness']}/{s_raw['mind']} | Trend: {s_trended['fitness']}/{s_trended['mind']}"
        table_data.append([activities, scores_str, f"{res['realism']['score']}/100", res['realism']['issues']])
    print(tabulate(table_data, headers=['Key Activities', 'Fit/Mind Scores (Raw|Trend)', 'Realism', 'Issues'], tablefmt='grid'))

    # --- Summary Statistics ---
    print('\n📊 Aggregate Summary Analysis...')
    df = pd.DataFrame([r['scores']['raw'] for r in results])
    df_trended = pd.DataFrame([r['scores']['trended'] for r in results])
    
    summary_data = []
    for domain in ['sleep', 'fitness', 'mind', 'spirit']:
        raw_stats = df[domain].agg(['mean', 'min', 'max', 'median']).to_dict()
        trend_stats = df_trended[domain].agg(['mean', 'min', 'max', 'median']).to_dict()
        summary_data.append([
            domain.capitalize(),
            f"{raw_stats['mean']:.1f}", f"{raw_stats['min']}-{raw_stats['max']}", f"{raw_stats['median']:.1f}",
            f"{trend_stats['mean']:.1f}", f"{trend_stats['min']}-{trend_stats['max']}", f"{trend_stats['median']:.1f}"
        ])
    
    print(tabulate(summary_data, headers=['Domain', 'Avg Raw', 'Range Raw', 'Median Raw', 'Avg Trend', 'Range Trend', 'Median Trend'], tablefmt='grid'))
    
    issues_count = sum(1 for r in results if r['realism']['issues'] != 'None')
    print(f"\n- Realism Issues Detected in {issues_count} of {iterations} cases ({issues_count/iterations:.0%}).")

run_monte_carlo_test(iterations=10)