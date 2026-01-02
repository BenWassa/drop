# drop Testing Strategy

## Philosophy
For a **personal single-user app**, we keep testing practical and lean:
- ✅ Only essential tests (DOM structure, accessibility, core logic)
- ❌ No visual regression (overkill for personal use)
- ❌ No multi-browser testing (use what you use)
- ⚡ Fast feedback (seconds, not minutes)

## Running Tests

```bash
cd docs
npm test   # Opens QUnit test suite in your browser
```

## What's Tested

### QUnit DOM Tests (`test/pages/index.html`)
- ✅ Domain score display and rendering
- ✅ Accessibility (ARIA attributes, focus states)
- ✅ Overlays (open, close, interaction)
- ✅ Gratitude progress bars
- ✅ Page navigation and switching
- ✅ Data persistence (localStorage)

**Run time:** ~10 seconds in browser

## What Was Removed

### Playwright Visual Tests ❌
- **Why removed:** 24 tests × 30s each = 12+ minutes per run
- **Use case:** Production multi-user apps needing visual regression testing
- **Not needed:** Personal app, single user, visual changes visible immediately

### npm test:visual ❌
- Complex setup (dev server + browser + screenshots)
- Slow and overkill for personal project

## Test Files Structure

```
test/
├── pages/
│   └── index.html          ← Run these (QUnit runner)
├── js/
│   ├── dom.test.js         ← Test definitions (422 lines)
│   ├── qunit-enhance.js    ← Better test UI
│   ├── run-qunit-tests.js  ← npm test entry point
│   └── generate-sample-data.js (utility)
├── data/
│   ├── sample-data-5days.json
│   ├── sample-data-30days.json
│   └── sample-data-1month.json
└── TEST_STRATEGY.md (this file)
```

## Removed Files
- `playwright.config.js` - No longer used
- `visual.test.js` - Removed (overkill)
- `test-results/` - Cleaned up

## Quick Validation Checklist

Before committing:
```bash
npm run lint        # Check code style
npm run format      # Auto-format
npm test            # Run QUnit tests (manual validation)
```

## Sample Data for Manual Testing

Test data files are available in `test/data/`:

```bash
# View 5-day sample
cat test/data/sample-data-5days.json

# Use in app:
# 1. npm run dev (or open the app)
# 2. Click Import in settings
# 3. Paste JSON content
```

## When to Write Tests

✅ **Write tests for:**
- Core scoring logic changes
- Data persistence (localStorage)
- Accessibility features
- Bug fixes (prevent regressions)

❌ **Don't write tests for:**
- Minor UI tweaks
- CSS changes
- Layout adjustments

Just use your eyes - you're the only user!

## Philosophy: Lean and Mean

> "The best test is one you actually run."

For a personal app:
- Simple tests you'll actually run
- Clear feedback in seconds
- No setup friction
- No overkill
