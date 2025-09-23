# Drop — Discipline Dashboard

A mobile-first Progressive Web App (PWA) that measures daily execution across four life domains: Sleep, Fitness, Mind, and Spirit. Works offline and syncs to a personal Google Sheet. The product emphasizes clear, numeric domain scores and fast, tap-only logging.

## 🎯 What It Does

- Fixed 8 Practices: Wake, Rest, Run, Strength, Skill, Read, Write, Stress, Meditation
- Performance Log: Tap-only daily recording for fast execution tracking
- Domain Scores: 0–100 numeric scores computed as 7-day rolling averages per domain
- Crowns: domains with scores ≥ 80 earn a crown for the current period
- Streaks: per-aspect streak counters for momentum tracking
- Weekly Review: pattern grid with domain scores and streaks
- Reflections: optional end-of-day mood + one-line note + audio notes
- Audio Notes: Record voice thoughts, compressed MP3 storage, transcription editing, organized per day with today prominence
- Offline-First: local-first operation with optional sync

## 📱 Quick Start

1. **Set up Google Sheet**:
   - Create a new Google Sheet
   - Add sheet named `domain_entries` with headers: `Timestamp`, `LocalId`, `ClientId`, `Date`, `Domain`, `Aspect`, `Completed`, `Streak`, `Type`, `Mood`, `Note`

2. **Deploy Apps Script**:
   - Open the script editor (Extensions → Apps Script)
   - Paste contents of `apps-script.gs`
   - Replace `SPREADSHEET_ID` and `API_KEY` with your values
   - Deploy as web app and copy the URL

3. **Configure App**:
   - Edit `config.js` and set `APP_CONFIG.SCRIPT_URL` to your Apps Script URL
   - Set `APP_CONFIG.API_KEY` to match your Apps Script API key

4. **Install & Use**:
   - Open `index.html` locally or host on GitHub Pages
   - For GitHub Pages: Go to repository Settings → Pages → Source: "Deploy from a branch" → Branch: main → Folder: /docs
   - Install as PWA on your device

## 🧪 Testing

Run tests manually:
1. Serve the app locally (e.g., `python -m http.server 8080`).
2. Open `http://localhost:8080/tests/tests.html` in a browser.
3. Check the QUnit results for passing tests.

Tests cover smoke tests, data functions, UI interactions, and CSV export.

### CI/CD
- No automated CI due to no Node.js usage.
- Manually verify tests pass before considering a version stable.
- Pull requests should include test results.

## 🔢 Versioning

- **Stable Version:** Latest tagged release on `main` branch (e.g., `v1.0.0`).
- **Development Version:** Latest commit on `dev` branch.
- **Version File:** Update `VERSION` file manually (e.g., `1.0.1`) before tagging releases.

To create a stable release:
1. Merge `dev` to `main` (after manual testing).
2. Update `VERSION` file.
3. Commit and push.
4. Create a Git tag: `git tag v1.0.1 && git push origin v1.0.1`.

## 🗂️ Files

- `index.html` — Main UI with Today/Review/Reflect/Settings screens
- `main.js` — App orchestration and initialization
- `data.js` — IndexedDB operations and data models (includes domain scoring)
- `sync.js` — Background sync and API communication
- `ui.js` — DOM manipulation and rendering
- `config.js` — API endpoints and configuration
- `sw.js` — Service worker for offline caching
- `apps-script.gs` — Google Apps Script for Sheet sync
- `manifest.json` — PWA manifest
- `styles/app.css` — Dark theme styling
- `UX.md` — UX documentation

## 🔧 Technical Stack

- Frontend: Vanilla JavaScript, HTML5, CSS3
- Storage: IndexedDB for local data, Service Worker outbox
- Sync: Google Apps Script → Google Sheets
- PWA: Offline-first, installable, background sync
- Target: Pixel 8 (Chrome), mobile-optimized

## 📊 Data Model

Each practice entry contains:

```js
{
  id: string,           // "2025-09-23-sleep-wake"
  date: string,         // "2025-09-23"
  domain: string,       // "sleep"|"fitness"|"mind"|"spirit"
  aspect: string,       // "wake"|"rest"|"run"|etc.
  completed: boolean,
  streak: number,
  mood?: number,        // 1-4
  note?: string,
  timestamp: number,
  synced: boolean
}
```

## 🎨 Design Philosophy

- Tone: performance-first, direct, and factual. Avoids decorative or supportive language.
- Visual: bold, uppercase headings, minimal motion, high-contrast accents.
- Typography:
  - Headline: 28px, bold, uppercase
  - Body: 16px system-ui
  - Micro: 12–13px, muted

## 🚀 Development

Static PWA with no build tools. Edit files directly and test in Chrome.

### Key Principles
- Single-user, single-device focus (Pixel 8)
- Offline-first with local-first UX
- Fast tap-only logging over feature complexity

## 📈 Roadmap

- V1: Core performance loop with fixed domains and domain scoring
- Next: Voice log for reflections, advanced analytics and visualizations, quarter dashboards

---

*Drop — Discipline Dashboard.*

