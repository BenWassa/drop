# UI Flow & Onboarding (drop)

This document explains the user-facing screens and how they are rendered in the app. It's primarily meant for developers working on UI behavior and onboarding logic.

High level flow

1. Vision / Landing — Choose a path: Direct Control, Domain Identities, or Growth Mode.
2. Commitments — Select identities for Sleep, Fitness, Mind, and Spirit. Some selections reveal custom inputs (e.g. custom wake time).
3. Confirmation — Review the quarter summary and begin the journey.
4. Daily Presence — Main app where the user logs daily actions across domains.
5. Gratitude / Quarterly Review — Reflective screens summarizing week's activity and quarter-level metrics.

Screen lifecycle

- showScreen(screenId) — central function in `src/ui.js` that toggles screen visibility and invokes a registered setup function via the ScreenRegistry.
- Screen setup functions must be idempotent: safe to call multiple times and fast.
- Screens can be registered via `window.registerScreen(name, setupFn)` (see `src/screens/commitments.js` for an example).

Onboarding specifics

- `selectPath(path)` sets `state.path` and then opens the commitments screen.
- The commitments screen uses `state.selectedIdentities` as a transient selection buffer. On confirm, these selections are applied to `state.commitments` according to the chosen path:
  - `identities` and `direct` — apply default mappings; user can edit further in settings.
  - `growth` — a simpler tracking mode that reduces baseline expectations and focuses on consistency.

DOM contracts to respect

- Screen elements use `id` attributes matching the screen ids (e.g. `commitments-screen`, `presence-screen`).
- Inline `onclick` handlers in HTML still call global functions (e.g. `selectSleepIdentity`) — per-screen modules currently attach these to `window` for backward compatibility.
- The `commitments` module exposes `populateCommitmentsScreen()` and registers it as the setup function.

Performance & UX notes

- Keep setup functions lightweight; heavy work (analytics, AI suggestions) should be async and run after the screen renders.
- Consider lazy-loading heavy modules using dynamic `import()` in the future (requires converting scripts to ES modules and serving via HTTP).

Testing the flow locally

1. Serve the project (recommended): `python -m http.server 8000` or `npx http-server -p 8000`.
2. Open `http://localhost:8000` and step through the onboarding flow.
3. Use DevTools console to check `state` and `ScreenRegistry` for expected values.

Examples

- Inspect current registry:

```js
console.log(window.ScreenRegistry);
```

- Re-run a screen setup manually:

```js
window.populateCommitmentsScreen();
```

## Recent implementation notes

A short note on recent changes that affect onboarding and screen wiring:

- The app now supports three onboarding second-step flows: `direct` (Direct Control), `identities` (Domain Identities detail), and `growth` (Growth setup). Each path writes into `state.commitments` in a way that downstream rendering and calculations expect.
- Screen modules are now modularized under `src/screens/` and register setup functions with the central ScreenRegistry in `src/ui.js`. To avoid timing issues when scripts load before the registry, the registry auto-registers known `window`-exposed setup functions.
- The fitness model has been updated to be per-aspect (cardio, strength, skills) with tiered multipliers; UI rendering and weekly target calculations prefer the per-aspect model but preserve a legacy fallback for migration.

See **[Creative_Direction.md](Creative_Direction.md)** for designer and product rationale behind these changes.

*** End of UI Flow doc
