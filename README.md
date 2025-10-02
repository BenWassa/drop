# Drop — Life Tracker

A small Progressive Web App (PWA) for tracking daily life domains: Sleep, Fitness, Mind, and Spirit.

This repository contains several versions (V2.2, V3.0, V3.1). The `V3.1` folder is the active UI iteration with a compact dashboard, domain cards, and PWA support.

## Features
- Minimal dashboard showing per-domain scores
- Domain cards with large scores and icons
- PWA support: `manifest.json` and `sw.js` (service worker) for offline caching
- Uses Google Fonts (Ubuntu for UI text, Wix Madefor Display for numeric scores)
- Lightweight, no build step required — plain HTML/CSS/JS

## Quick start (local)
Open the app locally from the `V3.1` folder. For best results serve over HTTP (service worker requires a secure context or localhost).

Using Python (PowerShell):

```powershell
# from workspace root
cd .\V3.1
python -m http.server 8000
# then open http://localhost:8000 in your browser
```

Using Node (http-server):

```powershell
cd .\V3.1
npx http-server -p 8000
# then open http://localhost:8000
```

If you just open `V3.1/index.html` as a file, the UI will render but the service worker and some PWA features won't work.

## Files of interest (V3.1)
- `index.html` — main UI
- `styles.css` — styling and design tokens
- `app.js` — app logic, event binding, score calc, and service worker registration
- `sw.js` — service worker that caches core assets
- `manifest.json` — PWA manifest
- `icons/` — SVG icons used by the app
- `icons/drop_app_icon.png` — PNG used as the website favicon (referenced in `index.html`)

## Styling / Design notes
- Design tokens and colors live in `styles.css` (`:root`) — domain colors include `--sleep`, `--fitness`, `--mind`, and `--spirit`.
- Numeric scores use the Wix Madefor Display font; UI text uses Ubuntu (loaded from Google Fonts in `index.html`).
- The header was changed to show clean circular score badges; domain icons were moved into the larger domain cards to reduce redundancy.

## Adding / Updating icons
Place new or updated icons in `V3.1/icons/` and reference them from `index.html` or `manifest.json`. The manifest expects `icons/drop_icon.svg`.

Recommended icons to add/check:
- `vision.svg` (for "Vision")
- `gratitude.svg` (for "Gratitude")

## Notes about the service worker
- `sw.js` caches the app shell for offline use. If you change the files listed in `sw.js`, bump the `CACHE_NAME` to force an update.

## Development & Testing
- Use the browser DevTools Application tab to inspect the service worker and manifest.
- Clear site data or unregister the SW when testing major asset changes.

## Contributing
1. Fork and create a branch for your feature/fix.
2. Make changes and test locally (see Quick start).
3. Open a pull request with a summary of changes.

## License
This repo currently has no license file. Add `LICENSE` if you want to publish under an open-source license.

----

If you'd like, I can also:
- Add a small `package.json` and development scripts (start, serve),
- Add a basic test harness or linting, or
- Create a short screenshot and usage section for the README.

Which of those would you like next?