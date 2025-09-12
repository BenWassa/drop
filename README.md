# drop

A personal, mobile-first dashboard for quarterly goal setting and daily reflection. drop reimagines habit tracking as identity practice over time — focusing on small, repeatable actions that build identity across a 90-day quarter.

## Quick Start (no Node required)

Open `index.html` in any modern browser. For a reliable local experience (recommended), start a simple HTTP server with Python and open the app in your browser:

```powershell
python -m http.server 8000
# then open http://localhost:8000 in your browser
```

## How It Works — Core Flow

1. Vision / Path Selection — choose Direct Control, Domain Identities, or Growth Mode.
2. Commitments — pick domain identities or set per-aspect tiers.
3. Confirmation & Journey — begin daily presence logging and weekly reflection.

## Project structure

```
drop/
├── index.html
├── style.css
├── src/
│   ├── config.js
│   ├── state.js
│   ├── logic.js
│   ├── ui.js          # central registry + app shell
│   ├── main.js
│   └── screens/       # per-screen modules
│       └── commitments.js
└── docs/
   ├── TechStack.md
   ├── UI_Flow.md
   └── Modularization.md
```

## Developer notes

- Screen modules register setup functions with the ScreenRegistry in `src/ui.js` via `window.registerScreen(name, setupFn)` or by exposing a `window.setup<ScreenName>` function (the registry auto-registers common window-exposed setup functions).
- Keep setup functions idempotent and lightweight; run heavy work asynchronously after render.
- Use `DEV_MODE` in `src/state.js` to enable an in-app developer toolbar for quick navigation and testing.

## Tests & debugging

- The app is browser-native and runs without Node. Some unit tests in `tests/` may require Node tooling; if you do not use Node, test manually in a browser and use the in-app dev tools.

## Legal & Privacy

See `PRIVACY.md` and `TERMS.md` for details on local data handling and terms.
