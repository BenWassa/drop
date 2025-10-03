# Drop — Project Context (Verified)

This file is a self-contained context primer for the Drop PWA. It consolidates verified details from the codebase (as of commit on dev branch) and is safe to paste into a new chat/session.

---

## Project Summary

Drop is a minimalist Progressive Web App (PWA) to track daily practices across four domains:

- Sleep — wake time and rest time entries
- Fitness — run distance, strength and skill toggles
- Mind — reading and writing toggles
- Spirit — mood quadrant and meditation toggle

Primary flows:
1. Set weekly intentions in Vision
2. Log daily activities quickly from Home
3. Review weekly aggregates and insights in Gratitude

---

## Verified Design & UX Principles

- Mobile-first UI optimized for ~360×800 viewports; content constrained to max-width 412px
- Minimal friction: large tappable cards open lightweight overlays for quick logging
- Persistent header shows domain score circles for at-a-glance status
- Aesthetic choices: subtle gradients, rounded card radii, glass-like header/footer
- Accessibility: score circles expose `role="meter"` and `aria-valuenow`, header includes an `aria-live="polite"` announcer, nav is keyboard navigable, overlays close with `Escape`
- Offline-first: `sw.js` registers a service worker that caches the app shell

---

## Architecture (Concrete)

- Stack: plain HTML, CSS, vanilla JavaScript (no front-end frameworks)
- SPA navigation: page sections have `data-page` attributes and are toggled via `classList.toggle('active')` in `App.showPage()`
- State persistence: a single localStorage key `lifeTrackerData` stores the app state object (see `Store.DB_KEY`)
- Dev toggle: `DEV_MODE` boolean at top of `docs/app.js` toggles dev-only behavior (dev pill, toast, loading overlay behavior)

### Storage keys
- `lifeTrackerData` — main app state object persisted to localStorage
- Vision fields are stored inside `lifeTrackerData` under keys like `visionTheme`, `visionSleepFocus`, etc. (no separate `vision:YYYY-Www` key in current code)

---

## Scoring Logic (Exact)

From `App.calc*()` implementations:

- Sleep: calculates hours between `wake` and `rest` (handles crossing midnight). Scoring bands:
  - 7–9h -> 100
  - 6–7h or 9–10h -> 80
  - 5–6h or 10–11h -> 60
  - otherwise -> 40

- Fitness:
  - run >= 20km -> +40
  - run >= 10km -> +30
  - run >= 5km -> +20
  - strength true -> +30
  - skill true -> +30
  - capped at 100

- Mind:
  - read true -> +50
  - write true -> +50
  - total 0–100

- Spirit:
  - quadrant 1 or 2 -> +50
  - quadrant 3 or 4 -> +25
  - meditation true -> +50
  - capped at 100

---

## Data Flow & Lifecycle (Verified)

- `Store.init()` loads `lifeTrackerData` and applies defaults (see `Store.defaults` in `docs/app.js`). `Store.update(key, value)` writes updated keys back to localStorage and triggers `App.updateScores()` for non-vision keys.
- Overlays call `Store.update(...)` for domain inputs. `UI.renderScores()` updates both header meter values and card scores, and writes announcements to the `#score-announcer` region when value changes.
- Weekly aggregates and insights are generated on demand via `App.generateInsights(scores)` — there is no persistent `agg:YYYY-Www` object in current code; weekly aggregates are computed from state at render time.

---

## UI Elements & Selectors (for tests / automation)

- Header date: `#date-display`
- Score meters: `.score-circle` with child `.score-value` (`#sleep-score`, `#fitness-score`, `#mind-score`, `#spirit-score`)
- Cards: `.card[data-domain="sleep"|"fitness"|"mind"|"spirit"]` with inner `.card-score` elements (`#sleep-card` etc.)
- Overlays: `#sleep-overlay`, `#fitness-overlay`, `#mind-overlay`, `#spirit-overlay` (class `.overlay`)
- Vision inputs: `#vision-theme`, `#vision-sleep-focus`, `#vision-fitness-focus`, `#vision-mind-focus`, `#vision-spirit-focus`
- Gratitude scoreboard rows: `.progress-row[data-progress-domain="sleep"|...]` with `.progress-fill` and `.progress-score`
- Dev pill: `#dev-pill` (visible when `DEV_MODE` is true)
- Test runner: `docs/tests/index.html` (QUnit)

---

## Tests & Automation

- QUnit DOM tests live in `docs/tests/dom.test.js` and are loaded by `docs/tests/index.html` (no build required)
- Visual regression tests: `docs/tests/visual.test.js` (Playwright). Playwright config lives at `docs/playwright.config.js`.
- `package.json` with scripts and devDependencies is located in `docs/package.json` (so all test tooling is inside `docs/` for GitHub Pages compatibility)

---

## Known Constraints & TODOs (from code)

- Vision storage uses fields in `lifeTrackerData` rather than separate per-week keys; if week-scoped vision is required, implement `vision:YYYY-Www` creation and migration.
- Weekly aggregates are computed on demand; no long-term aggregate persistence exists.
- Score-ring SVG visuals are intentionally omitted / deferred; current implementation uses numeric scores and progress bars.
- The aria-live announcer is polite; it will announce only when detected score changes occur.

---

## Files of Interest

- `docs/index.html` — markup and structure
- `docs/app.js` — app logic, Store, UI, scoring, events
- `docs/styles.css` — layout, tokens, responsive rules
- `docs/tests/*` — test harness and scripts
- `docs/sw.js` — service worker caching

---

## Author & License

- Author: Benjamin Haddon
- Repository: https://github.com/BenWassa/drop
- License: MIT (README indicates MIT; check for LICENSE file)

---

Paste this document into a new chat or share with a collaborator to provide a verified, up-to-date context for the Drop project.