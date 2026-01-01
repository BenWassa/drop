# drop Test Suite

This directory contains automated tests for the drop PWA.

## Test Types

### 1. DOM Tests (QUnit)
Unit tests for DOM structure, accessibility, and component behavior.

## Running Tests

**Important:** If tests fail unexpectedly, try these cache-clearing steps:

1. **Hard Refresh:** Press `Ctrl+F5` (Windows/Linux) or `Cmd+Shift+R` (Mac) to hard refresh
2. **Clear Browser Cache:** Or use DevTools → Network → Disable cache
3. **Clear localStorage:** Tests automatically clear test data, but you can manually clear:
   ```javascript
   localStorage.clear()
   ```

**Run:**
- Open `pages/index.html` in a browser
- Or visit: `http://localhost:3000/docs/test/pages/` (if running `npm run serve`)

**Coverage:**
- Domain score display elements
- ARIA attributes on score circles
- Gratitude progress bars
- Overlay open/close behavior
- Screen reader announcements
- Navigation accessibility

### 3. Sample Data
Test data files for import/export functionality testing.

**Files:**
- `sample-data-5days.json` - Most recent five days ending today (baseline ramp testing)
- `sample-data-30days.json` - Rolling 30-day history ending today (baseline satisfied)
- `sample-data-1month.json` - Legacy 45-day data set (2025-09-01 to 2025-10-14) for regression checks

**Generate on demand:**
```bash
# 5-day dataset saved to docs/test/data/sample-data-5days.json
node docs/test/js/generate-sample-data.js --days 5

# 30-day dataset (same API; pass --out to customise path)
node docs/test/js/generate-sample-data.js --days 30
```

**Usage:**
- Use in DOM tests for data import validation
- Manual testing of import/export features
- Development/demo data

**Data Structure:** (dates shown are illustrative; generated files use the current date)
```json
{
  "meta": {
    "_version": 2,
    "_schemaDate": "2024-05-01",
    "lastEntryDate": "2025-10-14",
    "settings": {
      "skillOptions": ["Wrestling", "Mobility", "Yoga"],
      "visionTheme": "Build healthy habits..."
    }
  },
  "entries": {
    "2025-10-14": {
      "wake": "06:35",
      "rest": "22:20",
      "run": 7,
      "strength": true,
      "strength_level": 1,
      "skill": ["Mobility"],
      "read_level": 2,
      "write_level": 1,
      "quadrant": 2,
      "meditation": true,
      "energy": 72,
      "mood": 68,
      "scores": {
        "sleep": 90,
        "fitness": 70,
        "mind": 55,
        "spirit": 82
      }
    }
    // ... 44 more entries (2025-09-01 to 2025-10-14)
  }
}
```

### 2. Visual Regression Tests (Playwright)
Screenshot-based tests to catch unintended UI changes.

**Setup:**
```bash
# Install dependencies (from project root)
npm install

# Install Playwright browsers
npx playwright install
```

**Run:**
```bash
# Run visual tests
npm run test:visual

# Update baseline screenshots (after intentional UI changes)
npm run test:visual:update

# Interactive mode
npm run test:visual:ui
```

**Coverage:**
- Home page layout
- Vision and Gratitude page layouts
- Overlay appearances
- Score circles rendering
- Navigation focus states
- Progress bars
- High contrast mode compatibility

## Test Results

- **QUnit**: Results displayed in browser
- **Playwright**: Results in `test-results/` directory
- **Screenshots**: Stored in `screenshots/` directory

## Developer Mode

Enable `DEV_MODE = true` in `app.js` to:
- Show the dev pill in the app UI
- Click dev pill to open test suite
- Access developer toast messages

## CI/CD Integration

Visual tests can be integrated into GitHub Actions or other CI pipelines:

```yaml
- name: Install dependencies
  run: npm ci
  
- name: Install Playwright
  run: npx playwright install --with-deps
  
- name: Run visual tests
  run: npm run test:visual
```

## Updating Baselines

When you make intentional UI changes:

1. Review the changes visually
2. Run: `npm run test:visual:update`
3. Commit the new baseline screenshots
4. Document the changes in your commit message

## Troubleshooting

**QUnit tests not loading:**
- Check browser console for errors
- Ensure you're serving via HTTP (not file://)

**Playwright tests failing:**
- Clear screenshots directory and regenerate baselines
- Check viewport size matches config (360px width)
- Ensure fonts have loaded before screenshots

**Pop-up blocked:**
- Allow pop-ups for localhost
- Or manually navigate to `testing/pages/index.html`

## Adding New Tests

### DOM Test
Add new test modules to `dom.test.js`:

```javascript
QUnit.module('New Feature', function(hooks) {
  QUnit.test('Feature works correctly', function(assert) {
    // Your test here
  });
});
```

### Visual Test
Add new test cases to `visual.test.js`:

```javascript
test('New component appearance', async ({ page }) => {
  // Your test here
  await expect(page).toHaveScreenshot('new-component-baseline.png');
});
```

## Best Practices

1. **Keep tests focused**: One assertion per concept
2. **Use semantic selectors**: Prefer `[data-domain="sleep"]` over classes
3. **Wait for animations**: Use `waitForTimeout()` after transitions
4. **Document failures**: Add clear assertion messages
5. **Update baselines carefully**: Review visual diffs before committing

## Resources

- [QUnit Documentation](https://qunitjs.com/)
- [Playwright Documentation](https://playwright.dev/)
- [ARIA Testing Guide](https://www.w3.org/WAI/test-evaluate/)
