# 🌊 drop

A personal, mobile-first dashboard for quarterly goal setting and daily reflection. This app reimagines habit tracking as **identity practice over time**, helping you align your daily actions with your long-term vision.

# 🌊 drop

A personal, mobile-first dashboard for quarterly goal setting and daily reflection. This app reimagines habit tracking as identity practice over time, helping you align daily actions with a quarterly focus.

## What's new (developer note)
- The UI is now modular: screens register setup handlers with a central ScreenRegistry (`src/ui.js`).
- Commitments UI has been moved to `src/screens/commitments.js` as the first example of a per-screen module.

## Quick Start: No Build Tools Required
Open `index.html` in any modern browser. The app is browser-native and doesn't require Node or a build step.

If you prefer to run a lightweight local server (recommended for consistent module/script loading), you can use either Python or npx:

PowerShell examples:

```powershell
# Using Python 3 (if installed)
python -m http.server 8000

# Using npm's http-server (if you have Node.js)
npx http-server -p 8000
```

Then open http://localhost:8000 in your browser.

## How It Works: Core Flow

1. Quarterly Reset — choose a path (Direct Control, Domain Identities, or Growth Mode).
2. Daily Presence — log actions across Sleep, Fitness, Mind (reading/writing), and Spirit.
3. Reflection — weekly gratitude and quarterly review screens summarize progress.

## Project Structure (updated)

```
drop/
├── index.html
├── style.css
├── src/
│   ├── config.js
│   ├── state.js
   │   ├── logic.js
│   ├── ui.js                # central registry + app shell
│   ├── main.js
│   └── screens/             # per-screen modules (new pattern)
│       └── commitments.js   # commitments screen module (example)
├── docs/
│   ├── TechStack.md
│   ├── UI_Flow.md           # new: onboarding & UI lifecycle
│   └── Modularization.md    # new: how to add/move screens
└── README.md
```

## Developer notes
- The ScreenRegistry in `src/ui.js` maps screen ids (e.g. `commitments-screen`) to setup functions. Screens can register via `window.registerScreen(name, setupFn)`.
- Per-screen files should attach any DOM event handlers they need and can expose teardown logic if necessary.
- This keeps the app single-page (smooth UX) while allowing modular code organization.

## Tests & Debugging
- Unit tests are optional and live in `tests/` (run with Node.js). The app itself runs without Node.
- To debug, enable `DEV_MODE` in `src/state.js` to reveal in-app debug controls.

## Legal & Privacy
- See `PRIVACY.md` and `TERMS.md` for local data handling and terms.

## Running end-to-end smoke tests (Playwright)

These repository includes a small Playwright-based smoke test suite that exercises onboarding flows (Direct Control, Domain Identities, Growth Mode).

1. Install dev dependencies (Playwright):

```powershell
npm install --save-dev playwright @playwright/test
npx playwright install
```

2. Start the local static server and run tests (Playwright will start its own server via playwright.config.js webServer):

```powershell
npm run test:e2e
```

Notes:
- The Playwright config uses `python -m http.server 8000` as the web server command. Ensure Python is available in your PATH.
- Tests run headless by default. To debug visually, run Playwright in headed mode by setting `PWDEBUG=1` in the environment or edit the test command to include `--headed`.
