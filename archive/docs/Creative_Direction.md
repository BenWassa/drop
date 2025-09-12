# Creative Direction & Recent Implementation Notes

This file captures the creative direction, product thinking, and recent implementation choices so they remain visible to contributors and future AI assistants.

Summary of creative direction
- Focus on identity practice over time: design decisions should prioritize small, repeatable actions that compound into a sense of identity.
- Quarterly commitments (≈90 days) remain the core UX pattern used to create resistance to frequent switching.
- Minimal friction logging: interactions should be micro-interactions (tap, slider, quick confirm).

Recent engineering & product decisions (short):
- Modular screens: UI code moved toward per-screen files under `src/screens/` and registered with a central ScreenRegistry in `src/ui.js`.
- ScreenRegistry autoload: per-screen modules may load before `src/ui.js` — the registry now auto-registers known window-exposed setup functions to avoid race conditions and preserve backward compatibility with inline `onclick` handlers.
- Fitness model updated: fitness is now modeled per-aspect (cardio, strength, skills) with tiered multipliers rather than a single-mode setting. This produces clearer mapping from identity → weekly target.
- Onboarding flows expanded: three onboarding second-step paths exist — `direct` (Direct Control), `identities` (Domain Identities detail), and `growth` (Growth setup). Each path writes into `state.commitments` in a way that downstream UI and calculations understand.

Why this matters
- Keeps the product philosophy (identity-first) visible to engineers making UI and logic changes.
- Makes it easier to extend the app safely (screens are modular and idempotent).
- Prevents accidental regressions: the autoload behavior ensures older inline handlers continue to work as screens are migrated.

Implementation guidance (short checklist for contributors)
- When creating a new screen file under `src/screens/`:
  - Export a single setup function (attach it to `window` like `window.setupMyScreen = setup;`) or call `window.registerScreen('my-screen', setup)`.
  - Keep setup idempotent and fast; heavy work should run async after render.
  - Prefer adding a teardown/cleanup function if you attach globally-scoped listeners.
- When changing the commitments model, update `src/config.js` and `src/logic.js` to keep calculations consistent.
- Avoid removing the legacy fallback fields in `state.commitments` immediately; keep fallback logic for a short migration window.

Where to find more detailed context
- High-level flow and onboarding: `docs/UI_Flow.md`
- Modularization guide: `docs/Modularization.md`
- Architectural instructions for AI/devs: `docs/AI_Instructions.md`

If anything here needs elaboration or you want a longer version tailored to non-technical stakeholders, open an issue or ask for a formatted export.
