# Sprint Verification Checklist

Use this checklist to verify all sprint deliverables before merging to `main`.

## ✅ Accessibility Enhancements

### ARIA Attributes
- [ ] Open DevTools → Elements → Inspect `.score-meter` elements
- [ ] Verify each has `role="meter"`, `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-valuenow`
- [ ] Verify each has `aria-label` (e.g., "Sleep score")

### Screen Reader Announcements
**VoiceOver (macOS):**
- [ ] Enable: Cmd+F5
- [ ] Navigate to score circles: VO+Right Arrow
- [ ] Should announce: "Sleep score, 75 out of 100, meter"
- [ ] Change a score (open overlay, input data, close)
- [ ] Should announce: "Sleep score updated to 80"

**NVDA (Windows):**
- [ ] Enable: Ctrl+Alt+N
- [ ] Navigate: Down Arrow
- [ ] Verify same announcements as VoiceOver

### Keyboard Navigation
- [ ] Press Tab repeatedly - should see visible focus ring on all interactive elements
- [ ] Focus should have 2px solid blue outline
- [ ] Tab order should be logical: date → nav buttons → cards
- [ ] Open any overlay (click card)
- [ ] Press Esc - overlay should close
- [ ] Try all 4 domain overlays

### Focus-Visible Styles
- [ ] Click a navigation button - no focus ring (mouse)
- [ ] Tab to navigation button - should show focus ring (keyboard)
- [ ] Check all 3 nav buttons (Vision, Home, Gratitude)

---

## ✅ QUnit DOM Tests

### Test Execution
- [ ] Open `docs/tests/index.html` in Chrome
- [ ] All tests show green ✓
- [ ] Total tests: 20+
- [ ] Failed tests: 0
- [ ] Open in Firefox - same results
- [ ] Open in Safari - same results

### Test Modules
- [ ] "Domain Score Display" module (4 tests)
- [ ] "Gratitude Progress Bars" module (3 tests)
- [ ] "Overlay Behavior" module (3 tests)
- [ ] "Accessibility Features" module (2 tests)
- [ ] "Score Calculation Logic" module (2 tests)

### Specific Tests to Verify
- [ ] "Score circles have proper ARIA attributes" - passes
- [ ] "Progress fill widths update correctly" - passes
- [ ] "Overlay can be opened and closed" - passes
- [ ] "Screen reader announcement region exists" - passes

---

## ✅ Visual Regression Tests

### Setup (First Time)
```bash
cd c:\Users\benjamin.haddon\Documents\drop
npm install
npx playwright install
```

### Run Tests
```bash
npm run test:visual
```

### Expected Results
- [ ] All tests pass (or baseline warnings on first run)
- [ ] Screenshots saved in `docs/tests/screenshots/`
- [ ] 10+ baseline images created

### Verify Screenshots Exist
- [ ] `home-page-baseline.png`
- [ ] `vision-page-baseline.png`
- [ ] `gratitude-page-baseline.png`
- [ ] `sleep-overlay-baseline.png`
- [ ] `fitness-overlay-baseline.png`
- [ ] `score-meters.png`
- [ ] `nav-focus.png`
- [ ] `progress-bars.png`

### Visual Inspection
- [ ] Open each screenshot
- [ ] Verify layout looks correct
- [ ] Verify no rendering issues
- [ ] Verify colors and fonts render properly

---

## ✅ Developer Experience

### Dev Pill
- [ ] Open `docs/app.js`
- [ ] Set `DEV_MODE = true` (line 5)
- [ ] Reload page
- [ ] Dev pill should appear (bottom right)
- [ ] Click dev pill
- [ ] Test suite opens in new window (or pop-up warning appears)
- [ ] Verify QUnit tests load in new window

### Test Scripts
```bash
# Verify package.json exists
- [ ] File exists at project root

# Verify scripts are defined
- [ ] `npm run test:dom` - shows instructions
- [ ] `npm run test:visual` - runs Playwright
- [ ] `npm run test:visual:update` - updates baselines
- [ ] `npm run test:visual:ui` - opens Playwright UI
- [ ] `npm run serve` - starts dev server on port 3000
```

### Local Dev Server
```bash
npm run serve
```
- [ ] Server starts on http://localhost:3000
- [ ] Visit http://localhost:3000 - app loads
- [ ] Visit http://localhost:3000/tests/ - QUnit loads

---

## ✅ Git & Documentation

### Branch Status
```bash
git branch --show-current
```
- [ ] Currently on `dev` branch

### Commits
```bash
git log --oneline -5
```
- [ ] See commit: "docs: add comprehensive sprint summary"
- [ ] See commit: "feat(accessibility): add ARIA enhancements, test suite, and dev tools"
- [ ] See commit: "fix(mobile): enable body scrolling and overlay scroll behavior"

### Documentation
- [ ] `SPRINT_SUMMARY.md` exists at project root
- [ ] `docs/tests/README.md` exists
- [ ] Both files are comprehensive and well-formatted

### Remote Status
```bash
git status
```
- [ ] "Your branch is up to date with 'origin/dev'"
- [ ] "nothing to commit, working tree clean"

---

## ✅ Code Quality

### No Console Errors
- [ ] Open DevTools → Console
- [ ] Refresh page
- [ ] No red errors in console
- [ ] Service Worker registers successfully

### No Linting Issues
- [ ] No syntax errors in HTML/CSS/JS
- [ ] All files use consistent indentation
- [ ] No unused variables or functions

### Mobile Testing (Optional but Recommended)
- [ ] Test on actual iOS device (Safari)
- [ ] Test on actual Android device (Chrome)
- [ ] Verify scrolling works
- [ ] Verify overlays open/close
- [ ] Verify navigation works

---

## ✅ Acceptance Criteria from Sprint Plan

### Goals
- [x] Add automated checks so regressions are caught early
- [x] Improve accessibility for screen reader and keyboard users
- [x] Create baseline for visual regression testing

### Deliverables
- [x] **Accessibility Enhancements**: ARIA attributes, live announcements, focus states, Esc handler
- [x] **QUnit DOM Tests**: 20+ test cases for DOM structure and behavior
- [x] **Visual Regression Harness**: Playwright tests with screenshot baselines
- [x] **Developer Experience**: Test scripts, dev pill integration, documentation

### Out of Scope (Verified Not Changed)
- [x] No change to score-ring visuals (SVG arcs deferred)
- [x] No restructuring of app state or service worker
- [x] No icon color changes (domain SVGs remain as-is)

---

## 🚀 Ready to Merge?

If all checkboxes above are ✓, you're ready to:

1. Create Pull Request: `dev` → `main`
2. Review changes on GitHub
3. Merge to main
4. Deploy to production (if applicable)

---

## 📝 Notes

Use this section for any issues encountered during verification:

```
[Add notes here]
```
