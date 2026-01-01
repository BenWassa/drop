# 📁 Docs Folder Structure

Reorganized for clarity and deployment readiness.

## Folder Organization

```
docs/
├── public/                    # Static assets & HTML (served as-is)
│   ├── index.html            # Main app entry point
│   ├── manifest.json         # PWA manifest
│   ├── styles.css            # App styles
│   ├── sw.js                 # Service worker
│   ├── sample-data-for-drop.json  # Sample data
│   └── icons/                # App icons & images
│
├── src/                       # Application source code
│   ├── app.js               # Main app module (entry point)
│   ├── store.js             # Data store & persistence
│   ├── firebase.js          # Firebase integration
│   ├── ui.js                # UI components & state
│   ├── scoring.js           # Scoring algorithms
│   ├── analytics.js         # Analytics tracking
│   ├── backup.js            # Backup functionality
│   ├── install.js           # PWA install prompts
│   ├── version.js           # Version management
│   └── update-version.js    # Version update script
│
├── test/                      # Testing suite
│   ├── playwright.config.js  # Playwright configuration
│   ├── README.md             # Testing guide
│   ├── js/                   # Test files
│   │   ├── visual.test.js   # Visual regression tests
│   │   ├── dom.test.js      # DOM unit tests
│   │   ├── generate-sample-data.js
│   │   └── ...
│   ├── pages/                # Test page templates
│   ├── data/                 # Test fixtures & data
│   └── test-results/         # Test results & reports
│
├── .docs/                     # Documentation (hidden)
│   └── documentation/         # Guides and references
│       ├── FIREBASE-SETUP.md
│       ├── SPRINTS.md
│       └── SIDEBAR-DATA-AUDIT.md
│
├── node_modules/             # Dependencies
├── playwright-report/        # Test reports
├── package.json              # Dependencies & scripts
├── package-lock.json
├── .eslintrc.json           # Linting config
├── .prettierrc.json         # Code formatting
└── .prettierignore
```

## Key Changes

### ✅ What Moved
- **JavaScript code** → `src/` (all `.js` files except scripts)
- **Static assets** → `public/` (HTML, CSS, icons, manifest)
- **Tests** → `test/` (visual, unit, e2e tests & config)
- **Documentation** → `.docs/` (keep out of served files)

### 📝 Path Updates Made
1. **HTML imports**: `version.js` → `../src/version.js` (and all others)
2. **SW.js cache list**: Updated to reference `../src/` for scripts
3. **App.js paths**: 
   - `sw.js` → `../public/sw.js`
   - `manifest.json` → `../public/manifest.json`
   - `icons/...` → `../public/icons/...`
4. **UI.js paths**: `icons/...` → `../public/icons/...` (in HTML templates)
5. **Test files**: Updated script imports to point to `../../src/`

## Deployment Notes

**For production deployment:**
- Deploy contents of `public/` as the root web folder
- Include `src/` files in the same directory level (not served directly)
- Exclude `test/`, `.docs/`, and `node_modules/` from deployment

## Development Workflow

```bash
# Run tests
npm test                    # From docs/ root

# Update version
npm run update-version      # Updates manifest.json + package.json

# Development server
npm start                   # Serves from public/ with src/ accessible
```

## File Purpose Reference

| File | Purpose |
|------|---------|
| `public/index.html` | Main app UI & structure |
| `public/styles.css` | All CSS styles |
| `public/sw.js` | Service worker for offline & caching |
| `src/app.js` | App initialization & lifecycle |
| `src/store.js` | Data management & localStorage |
| `src/firebase.js` | Firebase auth & Firestore |
| `src/ui.js` | UI state & DOM manipulation |
| `src/scoring.js` | Score calculation algorithms |
| `test/` | All testing infrastructure |

---

**Last organized:** January 2026
