# drop  Daily Domain Tracker PWA

A minimalist Progressive Web App for tracking daily life domains: Sleep, Fitness, Mind, and Spirit.

##  Quick Start

Visit: **https://benwassa.github.io/drop/**

##  Features

- **Single Page Application** - Seamless navigation without page reloads
- **PWA Support** - Install on mobile/desktop, works offline
- **Accessible** - ARIA attributes, screen reader support, keyboard navigation
- **Mobile-Optimized** - Touch-friendly tap targets, smooth scrolling, full-screen display

##  Project Structure

```
drop/
├── docs/                      # GitHub Pages root (live app)
│   ├── index.html            # Main app entry point
│   ├── app.js                # Application coordination & initialization
│   ├── store.js              # Data persistence & state management
│   ├── ui.js                 # User interface & DOM manipulation
│   ├── scoring.js            # Domain scoring algorithms
│   ├── analytics.js          # Analytics & trend calculations
│   ├── install.js            # PWA install prompt handling
│   ├── styles.css            # Styling & design tokens
│   ├── manifest.json         # PWA manifest
│   ├── sw.js                 # Service worker for offline support
│   ├── icons/                # App icons and domain SVGs
│   ├── tests/                # QUnit test suite
│   ├── documentation/        # Sprint docs & planning
│   ├── SPRINT_SUMMARY.md     # Sprint deliverables
│   └── VERIFICATION_CHECKLIST.md
├── archive/                   # Old versions (V2.2, V3.0, V3.1)
└── README.md                 # This file
```

##  Version Management

### Version Update Checklist
When releasing a new version, update these files in order:

1. **`package.json`** - `"version": "X.Y.Z"`
2. **`manifest.json`** - `"version": "X.Y.Z"`
3. **`sw.js`** - `APP_VERSION = 'X.Y.Z'`
4. **`index.html`** - `<span id="app-version">X.Y.Z</span>`

### Version Locations
- **Package**: `package.json` (npm/package version)
- **PWA Manifest**: `manifest.json` (app store/install version)
- **Service Worker**: `sw.js` (cache versioning for updates)
- **UI Display**: `index.html` (user-visible version in settings)

### Release Process
1. Update all version references above
2. Test the app thoroughly
3. Commit with message: `"Release vX.Y.Z - description"`
4. Push to main branch
5. GitHub Pages will auto-deploy

##  Architecture

### Single Page App (SPA)
- Pages: Home, Vision, Gratitude
- Navigation via footer buttons
- No page reloads - uses classList.toggle('active')
- State persisted in localStorage

### Modular JavaScript Architecture
The app follows a modular architecture with clear separation of concerns:

#### Core Modules
- **`app.js`** - Application coordinator and initialization
  - Manages app lifecycle and page navigation
  - Coordinates between modules
  - Handles developer mode and test hooks

- **`store.js`** - Data persistence and state management
  - localStorage-based data persistence
  - State management with defaults and validation
  - History tracking and data migration
  - Sleep day calculations (handles early morning logging)

- **`ui.js`** - User interface and DOM manipulation
  - DOM element management and updates
  - User interaction handling
  - Visual feedback and animations
  - History view with month/week grouping

- **`scoring.js`** - Domain scoring algorithms
  - Calculates scores for Sleep, Fitness, Mind, Spirit domains
  - Trend-based scoring with 7-day weighted averages
  - Sleep duration from previous day's rest to today's wake
  - Domain-specific scoring logic

#### Supporting Modules
- **`analytics.js`** - Analytics and trend calculations
  - Streak calculations and momentum analysis
  - Week-over-week change detection
  - Insight generation and narrative creation

- **`install.js`** - PWA install prompt handling
  - Manages install prompt lifecycle
  - Install button visibility and user guidance

### Score Calculation
- **Sleep**: Hours between previous day's rest and today's wake time
- **Fitness**: Run distance (45pts) + strength (35pts) + skill practice (20pts)
- **Mind**: Reading (55pts) + writing (45pts) activities
- **Spirit**: Meditation (50pts) + mood quadrant (50pts)

### Data Flow
1. User interactions → `ui.js` event handlers
2. State updates → `store.js` persistence
3. Score calculations → `scoring.js` algorithms
4. UI updates → `ui.js` rendering
5. Analytics → `analytics.js` insights

##  JavaScript Documentation Standards

### Module Structure
Each JavaScript module follows consistent documentation patterns:

#### File Headers
```javascript
/**
 * ===========================
 * MODULE NAME
 * ===========================
 * 
 * Brief description of module purpose and responsibilities.
 * 
 * DEPENDENCIES:
 * - Module: For specific functionality
 * - Module: For other functionality
 */
```

#### Function Documentation
```javascript
/**
 * Function description and purpose.
 * 
 * @param {Type} paramName - Parameter description
 * @returns {Type} Return value description
 */
functionName(param) {
  // Implementation
}
```

#### Key Documentation Areas
- **Module Purpose**: Clear statement of responsibilities
- **Dependencies**: Which other modules are used
- **Data Flow**: How data moves through the module
- **Business Logic**: Domain-specific calculations and rules
- **Edge Cases**: Special handling for unusual scenarios

### Module Responsibilities

- **`app.js`**: Application lifecycle, module coordination
- **`store.js`**: Data persistence, state validation, migrations
- **`ui.js`**: DOM manipulation, user interactions, visual feedback
- **`scoring.js`**: Domain algorithms, trend calculations
- **`analytics.js`**: Insights, streaks, momentum analysis
- **`install.js`**: PWA install UX, prompt management

### Accessibility
- ARIA meter roles on score circles
- aria-live announcements for score updates
- Keyboard navigation (Tab, Esc)
- Focus-visible indicators
- Screen reader compatible

### Mobile Optimization
- Touch-action: manipulation (prevents double-tap zoom)
- Min tap targets: 44px  44px
- -webkit-tap-highlight-color for visual feedback
- Smooth scrolling with -webkit-overflow-scrolling
- Safe area insets for notched devices

##  Design System

**Colors** (defined in docs/styles.css):
- --sleep: #1e90ff (Blue)
- --fitness: #ff3b30 (Red)
- --mind: #7c3aed (Purple)
- --spirit: #16a34a (Green)

**Fonts:**
- UI Text: Ubuntu (Google Fonts)
- Scores: Wix Madefor Display (Google Fonts)

##  Documentation

- **Sprint Summary**: docs/SPRINT_SUMMARY.md
- **Verification Checklist**: docs/VERIFICATION_CHECKLIST.md
- **Sprint Backlog**: docs/documentation/Sprints.md

##  GitHub Pages Deployment

The docs/ folder is configured as the GitHub Pages source:

1. Go to repo Settings  Pages
2. Source: Deploy from branch
3. Branch: main (or dev)  /docs folder
4. Save

Changes pushed to the selected branch automatically deploy.

##  Development Workflow

```bash
# Work on dev branch
git checkout dev

# Make changes in docs/ folder

# Run tests
npm test                    # Unit tests (QUnit)
npx playwright test         # E2E tests (Playwright)

# Commit and push
git add .
git commit -m "feat: add new feature"
git push origin dev

# When ready, merge to main
git checkout main
git merge dev
git push origin main

# GitHub Pages auto-deploys from docs/
```

##  Dependencies

- **Runtime**: None! Vanilla HTML/CSS/JS
- **Testing**: QUnit, Playwright (for E2E testing)
- **Build**: None required (direct deployment from docs/)

##  Testing

### Unit Tests (QUnit)
Located in `docs/tests/`:
- `dom.test.js` - DOM manipulation and UI logic tests
- `index.html` - QUnit test runner
- Run with: `npm test` or open `docs/tests/index.html`

### E2E Tests (Playwright)
- `playwright.config.js` - Test configuration
- Run with: `npx playwright test`
- Visual regression testing and user flow validation

### Test Data
- `docs/sample-data-1month.json` - Comprehensive test data
- `docs/sample-data-for-drop.json` - Additional test scenarios

##  Contributing

1. Fork the repository
2. Create feature branch (git checkout -b feature/amazing-feature)
3. Make changes in docs/ folder
4. Commit changes (git commit -m 'feat: add amazing feature')
5. Push to branch (git push origin feature/amazing-feature')
6. Open Pull Request

##  License

MIT License - See LICENSE file for details

##  Author

Benjamin Haddon

##  Archive

Older versions preserved in rchive/:
- V2.2/ - Early prototype
- V3.0/ - Multiple AI variants (ChatGPT, Claude, Gemini)
- V3.1/ - Pre-docs iteration

Current live version is in docs/ folder.

##  Technical Notes

### Service Worker
The sw.js caches the app shell for offline use. When updating cached files, bump the CACHE_NAME constant to force a cache refresh.

### Icons
All icons are in docs/icons/ as SVG files:
- Domain icons: sleep.svg, itness.svg, mind.svg, spirit.svg
- Navigation: ision.svg, gratitude.svg
- App icon: drop_icon.svg, drop_rounded.png

### Browser DevTools
- Use Application tab to inspect service worker status
- Check manifest and PWA installation
- Clear site data when testing major changes

##  Scoring Validation Tool

The `scoring-validator.js` script provides Monte Carlo testing for the scoring algorithms, ensuring realism and adherence to the SCORING_GUIDE.md philosophy.

### Usage

```bash
# Run with default 5 random test cases
node scoring-validator.js

# Run with custom number of test cases
node scoring-validator.js 10

# Run with 3 test cases
node scoring-validator.js 3
```

### Output

- **Deterministic Tests**: Validates key examples from SCORING_GUIDE.md with daily scores (trend requires history)
- **Random Tests**: Generates realistic activity permutations and assesses scoring outcomes
- **Realism Score**: 90-100 highly realistic, <50 likely unrealistic
- **Issues**: Flags unrealistic combinations (e.g., too many activities)

### Philosophy

- Scores cluster around 75-85 via normal-CDF mapping
- Hard 99 cap prevents unrealistic perfection
- Trend-adjusted scores require minimum history (3 days sleep, 7 days others)
- Soft dampening for overloaded days

##  Links

- **Live App**: https://benwassa.github.io/drop/
- **Repository**: https://github.com/BenWassa/drop

---

Built by Benjamin Haddon
