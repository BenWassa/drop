# drop  Daily Domain Tracker PWA

A minimalist Progressive Web App for tracking daily life domains: Sleep, Fitness, Mind, and Spirit. Built with vanilla JavaScript, drop helps you maintain mindful engagement with your personal growth through a philosophically-grounded scoring system that rewards consistency over perfection.

##  Quick Start

Visit: **https://benwassa.github.io/drop/**

Or install as a PWA on your device for offline access.

##  Features

### Core Functionality
- **Daily Tracking** - Log activities across four life domains with nuanced quality levels
- **Trend-Based Scoring** - 7-day weighted averages that reward consistency and momentum
- **Vision Planning** - Set weekly themes and domain-specific focus statements
- **Gratitude Journal** - Reflect on daily wins and learnings
- **Historical View** - Browse and edit past entries organized by month and week

### Technical Features
- **Progressive Web App** - Install on mobile/desktop, works fully offline
- **Single Page Application** - Seamless navigation without page reloads
- **Auto-Backup System** - IndexedDB-based backups that survive cache clears and updates
- **Data Management** - Export, import, and restore functionality
- **Accessible** - ARIA attributes, screen reader support, keyboard navigation
- **Mobile-Optimized** - Touch-friendly tap targets, smooth scrolling, full-screen display

##  Project Structure

```
drop/
├── docs/                      # GitHub Pages root (live app)
│   ├── index.html            # Main app entry point (966 lines)
│   ├── app.js                # Application coordination & initialization
│   ├── store.js              # Data persistence & state management
│   ├── ui.js                 # User interface & DOM manipulation
│   ├── scoring.js            # Domain scoring algorithms
│   ├── analytics.js          # Analytics & trend calculations
│   ├── auto-backup.js        # Automatic backup system (IndexedDB)
│   ├── backup.js             # Manual backup utilities
│   ├── install.js            # PWA install prompt handling
│   ├── styles.css            # Styling & design tokens
│   ├── manifest.json         # PWA manifest (v3.2.0)
│   ├── sw.js                 # Service worker for offline support
│   ├── package.json          # NPM configuration & test scripts
│   ├── playwright.config.js  # E2E test configuration
│   ├── icons/                # App icons and domain SVGs
│   ├── tests/                # QUnit test suite
│   │   ├── dom.test.js      # DOM manipulation tests
│   │   ├── visual.test.js   # Playwright visual tests
│   │   └── index.html       # QUnit test runner
│   └── documentation/        # Technical documentation
│       ├── SCORING_GUIDE.md # Scoring philosophy & mechanics
│       ├── CONTEXT.md       # Project context
│       └── [other docs]     # Sprint docs & planning
├── archive/                   # Old versions (V2.2, V3.0, V3.1)
├── scripts/                   # Development utilities
│   ├── start-dev-server.bat # Windows batch server script
│   └── start-dev-server.ps1 # PowerShell server script
├── generate-realistic-sample-data.js  # Sample data generator
├── scoring-validator.js      # Monte Carlo scoring validation
├── scoring-validator.py      # Python scoring validator
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
- **Pages**: Home (daily tracking), Vision (weekly planning), Gratitude (reflection)
- **Navigation**: Footer buttons with smooth transitions
- **State Management**: Persisted in localStorage with IndexedDB backups
- **No page reloads**: Uses CSS classes to toggle page visibility

### Modular JavaScript Architecture
The app follows a modular architecture with clear separation of concerns:

#### Core Modules
- **`app.js`** (652 lines) - Application coordinator and initialization
  - Manages app lifecycle and page navigation (Home, Vision, Gratitude)
  - Coordinates between modules
  - Handles developer mode and test hooks
  - Service worker registration
  - Loading screen orchestration

- **`store.js`** - Data persistence and state management
  - localStorage-based data persistence
  - State management with defaults and validation
  - History tracking and data migration
  - Sleep day calculations (handles early morning logging)
  - Import/export functionality with validation

- **`ui.js`** - User interface and DOM manipulation
  - DOM element management and updates
  - User interaction handling (clicks, form submissions)
  - Visual feedback and animations
  - History view with month/week grouping and editing
  - Mood quadrant visualization
  - Score circle animations with SVG arcs
  - Settings menu and modals

- **`scoring.js`** - Domain scoring algorithms
  - Calculates scores for Sleep, Fitness, Mind, Spirit domains
  - Trend-based scoring with 7-day weighted averages
  - Sleep duration from previous day's rest to today's wake
  - Domain-specific scoring logic with normal distribution curve
  - Hard 99 cap to prevent unrealistic perfection

#### Supporting Modules
- **`analytics.js`** - Analytics and trend calculations
  - Streak calculations and momentum analysis
  - Week-over-week change detection
  - Insight generation and narrative creation

- **`auto-backup.js`** - Automatic backup system
  - IndexedDB-based backup storage
  - Maintains 3 rolling backup versions
  - Survives cache clears and app updates
  - Restore and download capabilities

- **`backup.js`** - Manual backup utilities
  - Export data to JSON file
  - Import data from JSON file with validation
  - Merge functionality for data imports

- **`install.js`** - PWA install prompt handling
  - Manages install prompt lifecycle
  - Install button visibility and user guidance

### Score Calculation Philosophy

The scoring system is designed to encourage **mindful engagement** over gamification. See `docs/documentation/SCORING_GUIDE.md` for full details.

#### Core Principles
1. **Realism Over Perfection** - Scores are capped and curved. Most good days fall in the 75-85 range. Perfect 100 is unattainable by design.
2. **Qualitative Depth** - Tiered levels (1-3) encourage self-assessment of quality and depth, not just binary completion.
3. **Consistency Rewards** - 7-day weighted historical average blends with daily score. Recent efforts have greater impact.
4. **Mindful Practice** - Some activities (meditation) are tracked but worth 0 points to preserve intrinsic value.

#### Domain Scoring Details

**Sleep** (Recovery & Rhythm)
- Calculated from previous day's rest time to today's wake time
- Optimal range: 7-9 hours
- Raw score mapped through normal distribution curve
- Trend-adjusted with 3-day minimum history

**Fitness** (Discipline & Consistency)
- **Running** (up to 30pts): Logarithmic scoring rewards starting over distance
- **Strength** (up to 30pts): 3 tiers - Movement (10pts), Session (20pts), Training (30pts)
- **Skill Practice** (up to 40pts): Highest-value component, emphasizes deliberate practice
- Total capped at 99, mapped through normal distribution

**Mind** (Perception & Articulation)
- **Reading** (up to 50pts): Leisure (25pts), Perspicacity (35pts), Erudition (50pts)
- **Writing** (up to 50pts): Journal (25pts), Editorial (35pts), Treatise (50pts)
- Rewards depth and quality of intellectual engagement

**Spirit** (Presence & Connection)
- **Mood Log** (70pts base + up to 30pts bonus): Base for checking in, bonus for energy/mood levels
- **Meditation** (0pts): Tracked but not scored to preserve intrinsic value

All domains use trend-based scoring with 7-day weighted averages (except Sleep uses 3-day minimum).

### Data Flow
1. User interactions → `ui.js` event handlers
2. State updates → `store.js` persistence (localStorage + auto-backup to IndexedDB)
3. Score calculations → `scoring.js` algorithms
4. UI updates → `ui.js` rendering with animations
5. Analytics → `analytics.js` insights
6. Auto-backup → `auto-backup.js` (maintains 3 rolling versions)

### Key User Features

#### Daily Tracking (Home Page)
- Four domain score circles with animated SVG arcs
- Tiered input controls for nuanced quality assessment
- Mood quadrant visualization (2D energy/mood grid)
- Real-time score updates with screen reader announcements
- Quarterly progress tracking (Q1-Q4, week counter)

#### Vision Planning
- Weekly theme/mantra setting
- Domain-specific focus statements (Sleep, Fitness, Mind, Spirit)
- Contextual prompts to guide intentional planning

#### Gratitude Journal
- Daily reflection prompts
- "One Thing" and "Learning" entries
- Persistent storage with history

#### History & Editing
- Browse past entries organized by month and week
- Edit any historical entry with full domain controls
- Visual indicators for edited entries
- Maintains data integrity across edits

#### Settings & Data Management
- Toggle automatic backups (IndexedDB)
- Restore from backup versions
- Download backup file (JSON export)
- Import data from file with validation
- Clear all data option
- App version and about information

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

##  Accessibility & Mobile Optimization

### Accessibility Features
- **ARIA meter roles** on score circles with live values
- **aria-live announcements** for score updates
- **Keyboard navigation** - Full support with Tab, Enter, Esc
- **Focus-visible indicators** - Clear focus states
- **Screen reader compatible** - Semantic HTML and ARIA labels
- **Color contrast** - WCAG AA compliant
- **Reduced motion support** - Respects `prefers-reduced-motion`

### Mobile Optimization
- **Touch-action: manipulation** - Prevents double-tap zoom delays
- **Minimum tap targets**: 44px × 44px for all interactive elements
- **-webkit-tap-highlight-color** - Visual feedback on touch
- **Smooth scrolling** with `-webkit-overflow-scrolling`
- **Safe area insets** - Respects notched devices (iPhone X+)
- **Viewport lock** - `maximum-scale=1.0, user-scalable=no`
- **Full-screen capable** - `mobile-web-app-capable`, standalone display
- **Status bar styling** - `black-translucent` for iOS

### Performance
- **Preload critical images** - Domain icons and logo
- **Preconnect to Google Fonts** - Faster font loading
- **Service Worker caching** - Instant offline access
- **Minimal JavaScript** - No frameworks, ~2000 lines total
- **CSS-only animations** - Hardware-accelerated transforms

##  Design System

### Colors
Defined in `docs/styles.css` as CSS custom properties:
- **--sleep**: `#1e90ff` (Blue) - Recovery & Rhythm
- **--fitness**: `#ff3b30` (Red) - Discipline & Consistency
- **--mind**: `#7c3aed` (Purple) - Perception & Articulation
- **--spirit**: `#16a34a` (Green) - Presence & Connection

### Typography
- **UI Text**: Ubuntu (300, 400, 500, 700) - Clean, modern sans-serif
- **Scores**: Wix Madefor Display (400, 500, 600, 700) - Distinctive number display
- Both loaded from Google Fonts with preconnect optimization

### Icons
All icons are SVG files in `docs/icons/`:
- **Domain icons**: `sleep.svg`, `fitness.svg`, `mind.svg`, `spirit.svg`
- **Navigation**: `vision.svg`, `gratitude.svg`
- **App icons**: `drop_icon.svg`, `drop_rounded.png`, `drop_rounded_app_icon.png`

### Visual Design
- **Dark theme** - Background: `#0B0B0F`, UI surface: `#1C1C21`
- **Gradient backgrounds** - Subtle domain-colored gradients
- **Frosted glass effects** - Backdrop blur on modals and overlays
- **Smooth animations** - CSS transitions for state changes
- **Score rings** - Animated SVG arcs with domain colors

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

### Local Development

```bash
# Clone the repository
git clone https://github.com/BenWassa/drop.git
cd drop

# Install dev dependencies (Playwright for E2E tests)
npm install

# Start local dev server
npm run serve
# Or use the convenience scripts:
# Windows: scripts/start-dev-server.bat
# PowerShell: scripts/start-dev-server.ps1

# Open browser to http://localhost:3000
```

### Git Workflow

```bash
# Work on dev branch
git checkout dev

# Make changes in docs/ folder

# Run tests
npm test                    # Unit tests (QUnit)
npm run test:visual         # E2E tests (Playwright)

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

### Developer Mode

The app includes a developer mode for testing and debugging:

- **DEV_MODE constant** in `app.js` - Set to `true` to enable dev features
- **Dev pill** - Toggle developer mode in the UI
- **Dev loader toggle** - Skip loading screen during development
- **Clear app data button** - Wipe localStorage, caches, service workers, cookies
- **Dev toast** - Visual feedback for developer actions

### Adding Features

1. **UI Changes**: Edit `docs/index.html` and `docs/styles.css`
2. **Functionality**: Add to appropriate module (`ui.js`, `store.js`, `scoring.js`, etc.)
3. **State Management**: Update `Store.state` defaults in `store.js` if needed
4. **Tests**: Add tests to `docs/tests/dom.test.js` or `docs/tests/visual.test.js`
5. **Documentation**: Update this README and relevant docs in `docs/documentation/`

##  Dependencies

### Runtime
- **None!** Vanilla HTML/CSS/JS
- No frameworks, no build process, no bundlers
- Direct deployment from `docs/` folder

### Development
- **Playwright** - E2E testing and visual regression
- **QUnit** - Unit testing framework (loaded via CDN in test files)
- **serve** - Local development server (`npx serve`)

### External Resources (CDN)
- **Google Fonts**: Ubuntu (UI text) and Wix Madefor Display (scores)
- All loaded asynchronously with preconnect hints

##  Testing

### Unit Tests (QUnit)
Located in `docs/tests/`:
- **`dom.test.js`** - DOM manipulation and UI logic tests
- **`index.html`** - QUnit test runner
- **Run with**: `npm test` or open `docs/tests/index.html` in browser

### E2E Tests (Playwright)
- **`visual.test.js`** - Visual regression testing and user flow validation
- **`playwright.config.js`** - Test configuration
- **Run with**: 
  - `npm run test:visual` - Run visual tests
  - `npm run test:visual:update` - Update snapshots
  - `npm run test:visual:ui` - Run with Playwright UI

### Test Data
- **`sample-data-for-drop.json`** - Comprehensive test data scenarios
- **`tests/sample-data-1month.json`** - 30 days of realistic test data
- **`generate-realistic-sample-data.js`** - Node.js script to generate realistic test data
  - Usage: `node generate-realistic-sample-data.js [days]`
  - Creates varied activity patterns (rest days, light days, active days, intensive days)

### Scoring Validation
The **`scoring-validator.js`** script provides Monte Carlo testing for scoring algorithms:

```bash
# Run with default 5 random test cases
node scoring-validator.js

# Run with custom number of test cases
node scoring-validator.js 10
```

**Output**:
- **Deterministic Tests**: Validates key examples from SCORING_GUIDE.md
- **Random Tests**: Generates realistic activity permutations
- **Realism Score**: 90-100 highly realistic, <50 likely unrealistic
- **Issues**: Flags unrealistic combinations (e.g., too many activities)

**Philosophy**:
- Scores cluster around 75-85 via normal-CDF mapping
- Hard 99 cap prevents unrealistic perfection
- Trend-adjusted scores require minimum history (3 days sleep, 7 days others)
- Soft dampening for overloaded days

##  Contributing

Contributions are welcome! This is an open-source project built with vanilla JavaScript to remain accessible and maintainable.

### How to Contribute

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/drop.git
   ```

2. **Create feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make changes in `docs/` folder**
   - Keep changes modular and well-documented
   - Follow existing code style and patterns
   - Update tests if needed

4. **Test your changes**
   ```bash
   npm test                 # Unit tests
   npm run test:visual      # Visual tests
   npm run serve            # Manual testing
   ```

5. **Commit with clear messages**
   ```bash
   git commit -m 'feat: add amazing feature'
   # Use conventional commits: feat, fix, docs, style, refactor, test, chore
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Open Pull Request**
   - Describe what changes you made and why
   - Reference any related issues
   - Ensure all tests pass

### Contribution Guidelines
- **Vanilla JS only** - No frameworks or build tools
- **Accessible** - Maintain ARIA labels and keyboard navigation
- **Mobile-first** - Test on mobile devices
- **Document your code** - Clear comments and JSDoc where helpful
- **Test coverage** - Add tests for new features
- **Performance-conscious** - Keep the app fast and lightweight

### Areas for Contribution
- 🐛 Bug fixes and issue resolution
- ✨ New features (check issues for ideas)
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- ♿ Accessibility improvements
- 🌍 Internationalization (i18n)
- 🧪 Test coverage expansion

##  License

This project uses a dual license:

### Code - MIT License
The source code is licensed under the **MIT License**. See `LICENSE` file for details.

**TL;DR**: You can use, modify, and distribute the code freely, even for commercial purposes, as long as you include the original copyright notice.

### Content - CC BY-NC-ND 4.0
Text, documentation, designs, and other creative content are licensed under **Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International**.

**You can**:
- ✅ Share and redistribute the content

**You cannot**:
- ❌ Use for commercial purposes
- ❌ Distribute modified versions

**Attribution**: Benjamin Haddon (GitHub: BenWassa)

See `LICENSE` file for full legal text.

##  Author

Benjamin Haddon

##  Archive

Older versions are preserved in `archive/` for reference:

- **V2.2/** - Early prototype with basic functionality
- **V3.0/** - Multiple AI-assisted variants:
  - `ChatGPT/` - ChatGPT-assisted development version
  - `Claude/` - Claude-assisted development version  
  - `Gemini/` - Gemini-assisted development version
  - `Gemini_AILab/` - Alternative Gemini variant
- **V3.1/** - Pre-docs iteration before current architecture

**Current live version** is in the `docs/` folder (v3.2.0).

### Version History
- **v3.2.0** (Current) - Auto-backup system, history editing, refined scoring
- **v3.1.x** - Modular architecture, comprehensive testing
- **v3.0.x** - AI-assisted development experiments
- **v2.2.x** - Initial prototype

See git history for detailed changelog.

##  Technical Notes

### Service Worker
- **Version-based caching**: `CACHE_NAME` includes app version (e.g., `drop-cache-v3-2-0`)
- **Cache-first strategy** with network fallback for reliability
- **Auto-cleanup**: Deletes old caches on activation
- **Offline support**: Caches all essential resources during install
- **Smart navigation**: Fresh network requests for page navigations when possible
- **Origin filtering**: Only caches same-origin requests to avoid extension conflicts

### Auto-Backup System
- **IndexedDB storage**: Uses `drop-backup` database
- **Rolling backups**: Maintains 3 most recent versions
- **Survives updates**: Not affected by cache clears or service worker updates
- **Auto-save on change**: Backup created whenever state is updated
- **Restore UI**: Settings menu provides backup selection and restore
- **Manual download**: Export any backup version to JSON file

### Data Storage
- **Primary**: localStorage (`dropState` key)
- **Backup**: IndexedDB (`drop-backup` database, `backups` object store)
- **Export format**: JSON with metadata (version, timestamp, source)
- **Import validation**: Schema validation before merging data
- **Migration support**: Handles legacy data formats

### Icons
All icons are optimized SVGs in `docs/icons/`:
- **Domain icons**: `sleep.svg`, `fitness.svg`, `mind.svg`, `spirit.svg`
- **Navigation**: `vision.svg`, `gratitude.svg`
- **App icons**: 
  - `drop_icon.svg` - Vector logo
  - `drop_rounded.png` - 192×192, 512×512 raster icon
  - `drop_rounded_app_icon.png` - Maskable icon for PWA
  
### Browser DevTools Tips
- **Application tab** → Service Workers: Check SW status and force update
- **Application tab** → Manifest: Verify PWA configuration
- **Application tab** → Storage: Inspect localStorage and IndexedDB
- **Application tab** → Clear storage: Reset app for testing
- **Console**: Use `window.DropApp.testHooks` for state debugging

##  Project Philosophy

### Design Principles
1. **Mindful over Mechanical** - Encourage reflection, not robotic checkbox completion
2. **Quality over Quantity** - Tiered levels assess depth and engagement
3. **Consistency over Streaks** - Recent weighted averages reward sustained effort
4. **Intrinsic over Extrinsic** - Some practices (meditation) tracked but not scored
5. **Realistic over Ideal** - Scores capped at 99, most good days fall in 75-85 range

### Why These Domains?
- **Sleep** - Foundation of physical and cognitive recovery
- **Fitness** - Physical discipline that builds mental resilience
- **Mind** - Intellectual growth through reading and articulation
- **Spirit** - Emotional presence and self-awareness

### Anti-Patterns Avoided
- ❌ Gamification with points and badges
- ❌ Streak anxiety and loss aversion
- ❌ Binary "did it / didn't do it" toggles
- ❌ Perfect scores that encourage unhealthy behavior
- ❌ Social comparison and leaderboards

### What Drop Is NOT
- Not a habit tracker (it's a quality tracker)
- Not a productivity tool (it's a wellness tracker)
- Not a social network (it's personal and private)
- Not a game (it's a reflective practice)

##  Links & Resources

### Live Application
- 🌐 **Live App**: https://benwassa.github.io/drop/
- 📱 **Install as PWA**: Visit the live app and click "Add to Home Screen"

### Repository
- 📦 **GitHub**: https://github.com/BenWassa/drop
- 🐛 **Issues**: https://github.com/BenWassa/drop/issues
- 🔀 **Pull Requests**: https://github.com/BenWassa/drop/pulls

### Documentation
- 📖 **Scoring Guide**: `docs/documentation/SCORING_GUIDE.md`
- 📝 **Context**: `docs/documentation/CONTEXT.md`
- 🧪 **Test README**: `docs/tests/README.md`

### Author
- 👤 **Benjamin Haddon**
- 🐙 **GitHub**: [@BenWassa](https://github.com/BenWassa)

---

**Built with ❤️ by Benjamin Haddon** | No frameworks, just clean vanilla JavaScript

*Track your growth, not your perfection.*
