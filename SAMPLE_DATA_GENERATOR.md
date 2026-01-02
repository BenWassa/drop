# Sample Data Generator

Generates realistic sample data for testing the drop life tracker app.

## Usage

```bash
# Generate data with default 30 days
node generate-sample-data.js

# Generate specific number of days
node generate-sample-data.js 7

# Generate and save to custom location
node generate-sample-data.js 14 docs/test/data/my-data.json
```

## Important Notes

- **Date Range**: Generates data up to but **NOT including today**
  - Today's date is excluded to simulate real-world usage
  - Data ends yesterday (today - 1 day)
  - Example: If today is 2026-01-02, data will end on 2026-01-01

- **Valid JSON**: All generated files are valid JSON and follow the app's schema version 2

## Examples

```bash
# Generate 5 days of data (yesterday and 4 days before)
node generate-sample-data.js 5 docs/test/data/sample-data-5days.json

# Generate 30 days of data
node generate-sample-data.js 30 docs/test/data/sample-data-30days.json

# Generate 90 days of data
node generate-sample-data.js 90 docs/test/data/sample-data-3months.json
```

## Data Characteristics

The generator creates realistic activity patterns:

- **Rest Days (20%)**: Minimal activity, focus on recovery and reflection
- **Light Days (40%)**: Moderate activity, balanced approach
- **Active Days (30%)**: Higher intensity training and skill work
- **Intense Days (10%)**: Peak training sessions

Each day includes:
- Wake/rest times (realistic sleep schedules)
- Running distance (0-20km based on activity pattern)
- Strength training (levels 0-2)
- Skill work (from configured skill options)
- Reading/writing levels (0-3)
- Meditation practice
- Quadrant mood tracking (1-4)
- Energy and mood scores (-100 to 100)
- Timestamps for various activities
- Domain scores (sleep, fitness, mind, spirit)

## Output Format

```json
{
  "meta": {
    "_version": 2,
    "_schemaDate": "2024-05-01",
    "lastEntryDate": "2026-01-01",
    "settings": {
      "skillOptions": ["Wrestling", "Volleyball", "Mobility", "Yoga", "Plyometrics", "Climbing"],
      "visionTheme": "Build momentum through small wins",
      ...
    }
  },
  "entries": {
    "2026-01-01": {
      "wake": "06:32",
      "rest": "22:45",
      "run": 8,
      "strength": true,
      "strength_level": 1,
      ...
    }
  }
}
```
