# Sprint Backlog

A running backlog of sprint goals and deliverables for the drop PWA.

## Sprint 1 — Accessibility & Foundations (Complete)
- Add ARIA meter roles and live announcements for domain scores.
- Wire Esc key support and focus-visible outlines for overlays and navigation.
- Introduce DOM (QUnit) and visual (Playwright) regression suites with developer tooling.
- Publish documentation: sprint summary, verification checklist, and developer notes.

## Sprint 2 — Score Rings & Visual Storytelling
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
