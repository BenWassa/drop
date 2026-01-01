# Mock Data Generator

Quick-start mock data loader for development and testing.

## Usage

### Option 1: Node.js Generator (Recommended)

```bash
node mock-data/generate-7day-data.js
```

This outputs a localStorage command ready to paste into the browser console.

**In the browser console:**

```javascript
localStorage.setItem('lifeTrackerData', '{"skillOptions":[...]}...')
location.reload()
```

### Option 2: Python Generator

```bash
python3 mock-data/generate-7day-data.py
```

Same process as Node.js version.

**To save output to a file:**

```bash
python3 mock-data/generate-7day-data.py --json-only > data.json
```

## What It Generates

- **7 days of data** ending yesterday (today has no data)
- **Realistic entries** including:
  - Wake/rest times with natural variance
  - Running distances (0-12 miles)
  - Strength training (yes/no + level)
  - Skill practice (selected from your skill options)
  - Reading & writing levels (0-3)
  - Meditation (yes/no)
  - Energy & mood scores (-95 to +95)
  - Calculated scores (sleep, fitness, mind, spirit: 40-100)
  - Timestamps for each entry

- **Vision settings** with pre-configured skill options and focus areas

## Data Structure

The mock data generates entries in the format your app expects:

```javascript
{
  "skillOptions": ["Wrestling", "Volleyball", "Mobility", "Yoga", "Plyometrics"],
  "visionTheme": "Build momentum...",
  "visionSleepFocus": "Lights out...",
  "visionFitnessFocus": "Rotate between...",
  "visionMindFocus": "Read 20 pages...",
  "visionSpiritFocus": "Anchor the evening...",
  "lastEntryDate": "2025-12-30",
  "entries": {
    "2025-12-30": {
      "wake": "06:15",
      "rest": "22:30",
      "run": 8,
      "strength": true,
      "strength_level": 2,
      "skill": ["Wrestling", "Mobility"],
      "read_level": 2,
      "write_level": 1,
      "quadrant": 1,
      "meditation": true,
      "energy": 45,
      "mood": 72,
      "timestamps": { "wake": "...", "rest": "..." },
      "scores": { "sleep": 78, "fitness": 82, "mind": 68, "spirit": 85 }
    },
    ...
  },
  "meta": { "_version": 2, "_schemaDate": "2024-05-01", ... }
}
```

## Quick Debug Tips

1. **Empty app?** Run the generator and paste into console
2. **No progress bar?** The data loads into `entries` and needs UI refresh
3. **Reset?** Open DevTools → Application → Clear Storage (localStorage) → Reload

## Notes

- Data is **deterministic** — same seed always produces same data
- Scores are calculated realistically based on daily activity
- Quadrants are assigned based on energy/mood baselines + activity level
- Use this for feature testing, UI review, and performance testing
