# 🌊 Drop - Daily Practice Journal

A mobile-first Progressive Web App (PWA) for tracking your daily identity practices across four life domains: Sleep, Fitness, Mind, and Spirit. Works entirely offline with background sync to a personal Google Sheet.

## 🎯 What It Does

Drop helps you answer one question every day: **"Did I live today according to my Sleep, Fitness, Mind, Spirit practices?"**

- **8 Fixed Practices**: Wake, Rest, Run, Strength, Skill, Read, Write, Stress, Meditation
- **Daily Ritual**: Quick toggles with joyful feedback and celebrations
- **Weekly Review**: See patterns and streak progress
- **Reflections**: End-of-day mood logging and notes
- **Offline-First**: Full functionality without internet, syncs when connected

## 📱 Quick Start

1. **Set up Google Sheet**:
   - Create a new Google Sheet
   - Add sheet named `entries` with headers: `id`, `date`, `domain`, `aspect`, `completed`, `streak`, `mood`, `note`, `timestamp`, `synced`

2. **Deploy Apps Script**:
   - Open script editor (Extensions → Apps Script)
   - Paste contents of `apps-script.gs`
   - Replace `SPREADSHEET_ID` and `API_KEY` with your values
   - Deploy as web app, copy the URL

3. **Configure App**:
   - Edit `config.js` and set `APP_CONFIG.SCRIPT_URL` to your Apps Script URL
   - Set `APP_CONFIG.API_KEY` to match your Apps Script API key

4. **Install & Use**:
   - Open `index.html` locally or host on GitHub Pages/Vercel
   - Install as PWA on your Pixel 8
   - Start your daily practice ritual!

## 🗂️ Files

- `index.html` — Main UI with Today/Review/Reflect/Settings screens
- `main.js` — App orchestration and initialization
- `data.js` — IndexedDB operations and data models
- `sync.js` — Background sync and API communication
- `ui.js` — DOM manipulation and rendering
- `config.js` — API endpoints and configuration
- `sw.js` — Service worker for offline caching
- `apps-script.gs` — Google Apps Script for Sheet sync
- `manifest.json` — PWA manifest
- `styles/app.css` — Dark theme styling and animations
- `UX.md` — Comprehensive UX documentation

## 🔧 Technical Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Storage**: IndexedDB for local data, Service Worker outbox
- **Sync**: Google Apps Script → Google Sheets
- **PWA**: Offline-first, installable, background sync
- **Target**: Pixel 8 (Chrome), mobile-optimized

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
  mood?: number,        // 1-4 (😞 😐 🙂 😁)
  note?: string,
  timestamp: number,
  synced: boolean
}
```

## 🎨 Design Philosophy

- **Dark Mode Default**: Matte black with colorful domain accents
- **Identity-Driven**: Practices organized by life domains, not generic habits
- **Joyful Feedback**: Micro-interactions, confetti celebrations, supportive copy
- **Minimal Core Loop**: Fixed 8 practices, no customization in V1
- **Mobile-Native**: Touch-optimized, PWA installable

## 🚀 Development

This is a static PWA with no build tools or Node.js dependencies. Edit the files directly and test in Chrome.

### Key Principles
- Single-user, single-device focus (Pixel 8)
- Offline-first with local-first UX
- Frictionless daily ritual over feature complexity
- Identity-centered framing over generic habit tracking

## 📈 Roadmap

- **V1**: Core daily practice loop with fixed domains
- **Future**: Habit customization, advanced analytics, calendar integration

---

*Drop: Your daily practice journal. Did you live your identity today?*

