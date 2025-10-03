# 🚀 Sprint Commissions — Drop PWA

## Sprint 1 — **Stability & Persistence (Launch Blockers)** ✅ Complete

- Add ARIA meter roles and live announcements for domain scores.
- Wire Esc key support and focus-visible outlines for overlays and navigation.
- Introduce DOM (QUnit) and visual (Playwright) regression suites with developer tooling.
- Publish documentation: sprint summary, verification checklist, and developer notes.

### Commission 1: JSON Import / Export

**Goal:** Add backup/restore for `lifeTrackerData`.

**Spec:**

* Add “Export Data” button → downloads `lifeTrackerData` as `.json` file.
* Add “Import Data” button → opens file picker, merges parsed JSON into Store, saves state.
* Must validate schema keys against `Store.defaults` before merging.
* Use **`Blob` + `URL.createObjectURL`** for export.
* Use **`FileReader` API** for import.
* Provide simple toast confirmation (“Data exported”, “Data imported”).

---

### Commission 2: Navigation & Scroll Fix

**Goal:** Ensure mobile navigation works across iOS Safari & Android Chrome.

**Spec:**

* Fix `.app-main` scroll issues (currently overflow/viewport bug).
* Footer nav (`.bottom-nav`) must remain tappable, not blocked by content.
* Test overlays (`.overlay`) → scrolling inside overlay must not break global scroll.
* Deliver CSS patch + regression Playwright tests.
* Verify on `Pixel 5` and `iPhone 12` configs (already in `playwright.config.js`).

---

### Commission 3: Service Worker Cache Versioning

**Goal:** Prevent stale builds when new versions ship.

**Spec:**

* Increment `CACHE_NAME` with app version (e.g., `drop-cache-v3-0-1`).
* On `activate`, delete all old caches not matching.
* Confirm install/fetch still works offline.
* Add console log “Cache updated to vX.Y.Z” for debugging.

---

## Sprint 2 — **Score Rings & Visual Storytelling** ✅ Complete

### Objectives
- Reinstate the SVG score rings so progress is represented visually, not only numerically.
- Pair each domain meter with its icon for stronger visual recognition.
- Keep the experience accessible with proper meter semantics and announcer behaviour.

### Scope & Tasks
1. Replace the header score tiles with SVG-based meters that expose a bottom gap and central score value.
2. Update the design system to style the new meters (ring sizing, colors, icon badge, transitions).
3. Extend app logic so score updates drive the arc animation and aria-valuenow synchronisation.
4. Refresh automated tests (QUnit + Playwright selectors) to target the new meter structure.

### Acceptance Criteria
- Each domain meter renders an SVG arc using the domain color with a visible gap at the bottom.
- Scores update both the numeric label and arc stroke without visual jitter.
- `aria-valuenow` values mirror the latest score and the announcer still reports changes.
- Automated DOM tests acknowledge the new markup; visual tests reference the new selectors.

---

## Sprint 3 — **Stickiness & Insight**

### Commission 4: Smart Empty States

**Goal:** Replace placeholders with contextual guidance.

**Spec:**

* Vision page: if focus fields are empty, show inline example prompts (e.g., “Try setting a bedtime goal”).
* Gratitude page: if scores = 0, show motivational nudge instead of blank copy.
* Implementation: conditional rendering inside `UI.renderGratitude()` + `UI.setVisionFields()`.

---

### Commission 5: Data-Driven Gratitude Insights

**Goal:** Replace generic “Momentum copy” with measurable comparisons.

**Spec:**

* Extend `App.generateInsights()` to compare this week vs last week.
* Calculate % change in each domain.
* Inject into narrative: e.g., “Sleep +10% vs last week.”
* Store still remains single-object; just compute deltas in runtime.

---

### Commission 6: Streaks

**Goal:** Add streak calculation for each domain.

**Spec:**

* Track 7-day history per domain (add `history` array to Store).
* Calculate “X of last 7 days” streak for each.
* Display under domain score in Home.
* Graceful logic: “6 of 7” not “broken streak.”

---

## Sprint 4 — **Delight & Progressive Reveal**

### Commission 7: Quick Log Defaults

**Goal:** Long-press a card to auto-log last values.

**Spec:**

* On `.card` long-press → copy yesterday’s values into today’s state.
* Fire `Store.update()` for each domain key.
* Animate card briefly (pulse glow).

---

### Commission 8: Progressive Unlocks

**Goal:** Reveal deeper insights after user activity.

**Spec:**

* If app has >14 days of logs, unlock secondary UI (mini graphs, extra prompts).
* Lock behind flag until condition met.
* Add subtle “Unlocked new view” toast.

---

### Commission 9: Reward Animations

**Goal:** Make completion satisfying.

**Spec:**

* On domain score = 100, trigger sparkle/confetti CSS animation inside `.score-circle`.
* On overlay save, add subtle sound (ding).
* Must be toggleable in settings.

---

# 📋 Delivery Rules

* All commissions must ship in **vanilla JS, CSS, HTML only** (no frameworks).
* Tests: extend Playwright suite with regression checks for new features.
* No new files unless required; keep within `index.html`, `styles.css`, `app.js`, `sw.js`.

