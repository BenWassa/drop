# drop Testing

Quick, lean testing for a personal app.

## Run Tests

```bash
cd docs
npm test   # Opens QUnit test suite
```

Tests run in your browser - no server needed, instant feedback.

## What's Tested

- ✓ Domain score display and calculation
- ✓ Accessibility (ARIA, focus states)
- ✓ Overlays (open, close, interaction)
- ✓ Gratitude progress bars
- ✓ Navigation and page switching
- ✓ Data persistence

## Files

- `pages/index.html` - QUnit runner (open this)
- `js/dom.test.js` - Test definitions (422 lines)
- `TEST_STRATEGY.md` - Detailed philosophy & guidelines
- `data/` - Sample test data for manual testing

## Sample Data

For manual testing, use sample data files:

```bash
# View sample data
cat test/data/sample-data-5days.json

# Import into app:
# 1. Open the app
# 2. Go to settings
# 3. Click "Import"
# 4. Paste JSON content
```

Available samples:
- `sample-data-5days.json` - 5 days of test data
- `sample-data-30days.json` - 30 days of test data
- `sample-data-1month.json` - Historical data

## Philosophy

> Keep it simple. The best test is one you actually run.

For a personal single-user app:
- Only essential tests (no overkill)
- Fast feedback (seconds, not minutes)
- Run in browser (visual verification)
- No complex CI/CD setup needed

See `TEST_STRATEGY.md` for full details.
