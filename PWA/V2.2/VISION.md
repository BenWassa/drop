Drop PWA V2.2 — Vision & Plan

Overview
--------
Drop is a minimal, mobile-first discipline tracking PWA that helps users maintain daily practices across four personal domains: Mind, Fitness, Sleep, and Spirit. V2.2 focuses on producing a polished, compact mobile UX with clear daily data-entry, concise top-line progress scores, and accessible review screens for weekly trends.

Product Goals
-------------
- Make logging quick and delightful: single-tap domain interactions, minimal friction for marking practices.
- At-a-glance progress: a compact top row with circular domain score rings that are visible without scrolling.
- Preserve author SVG artwork: keep icons colorized as authored while communicating domain color through accents.
- Small footprint: no heavy build tooling, works offline via Service Worker, and fast test harness.
- Accessible: keyboard and screen-reader friendly interactions; visible numeric scores and live updates.

UX Principles
-------------
- Mobile-first: prioritize a 360×800 canvas but adapt gracefully to larger devices.
- Minimal cognitive load: group date and context (quarter/week) together in a single card; domain scores sit above the data-entry area.
- Visual clarity: use subtle depth (glassmorphism) and small motion to keep the interface calm and approachable.

Technical Approach
------------------
- Plain HTML/CSS/JavaScript (no build step). Keep files in `PWA/V2.2` for the mobile experience.
- Domain scores implemented as SVG rings (two circles: background track + foreground arc) using stroke-dasharray/stroke-dashoffset to render a visible arc while leaving a transparent bottom gap for an icon.
- Data stored locally (localStorage) per day; rehydrated on load.
- Service Worker is registered for offline availability.

Recent Changes (V2.2 work)
--------------------------
- Restored circular ring score UI with center integer labels and small icon wrappers.
- Moved domain scores to a compact top-row (`.domain-scores-section`) to avoid scrolling.
- Flipped SVG rings so the transparent gap is at the bottom and made the background track use the same dasharray for true transparency.
- Darkened and improved spacing for the data-entry orb quadrants and wrapped them in a `data-entry-card` for visual containment.
- Removed the Overall Discipline card at the user's request and guarded JS that referenced it.

Immediate Next Tasks
--------------------
1. Inventory all SVG assets and produce a mapping of file -> recommended usage (inline vs img).
2. Map which SVG should appear where and inline the ones that need stroke/fill inheritance.
3. Add small QUnit DOM tests for presence of `.progress-arc` and numeric `.domain-score` values.
4. Add accessibility attributes and optionally an `aria-live` region to announce score changes.
5. Add simple visual regression checks (headless screenshots) for the Today screen.

Acceptance Criteria for V2.2
----------------------------
- All four domain scores are visible on a 360px-wide viewport without horizontal scrolling.
- Tapping a quadrant opens the domain details and allows marking practices.
- Scores update instantly and numerically in the center of each ring.
- Icons remain colorized and accessible (alt text present).

Notes and Risks
---------------
- Ring math depends on a hardcoded visible segment length (visibleLen). If SVG radius or stroke widths are updated, JS must either compute the dash lengths dynamically or the constants must be adjusted.
- Accessibility checks are pending — V2.2 should add screen-reader announcements and keyboard focus styles.

Files touched in this sprint
---------------------------
- `PWA/V2.2/index.html` — moved rings to top row, improved data-entry layout, removed overall discipline block.
- `PWA/V2.2/style.css` — compacted rings, rotated arcs, added date-card and data-entry-card styling.
- `PWA/V2.2/VISION.md` — this vision document.

How I validated changes
-----------------------
- Confirmed SVG markup includes matching stroke-dasharray values for track + arc.
- CSS rotates the rings so the bottom gap is visually at the bottom.
- Sizes adjusted to keep the top row visible on a 360px canvas.

Next Steps for you (optional)
-----------------------------
- Tell me whether you'd like dynamic dash math in JS, a larger/smaller gap, or a different visual order.
- I can create the SVG inventory and start mapping icons to UI selectors.
- I can also add QUnit tests and a small headless screenshot script for visual regression.

