# drop — Daily Domain Tracker PWA# drop## 🚀 Quick Start Devel## 🚀 Quick Start Development Server



A minimalist Progressive Web App for tracking daily life domains: Sleep, Fitness, Mind, and Spirit.**Test on your mobile device:**



**Live App:** https://benwassa.github.io/drop/**Easiest method:** Double-click `start-server.bat` (Windows batch file)



## 🚀 Quick Start Development ServerThis will:

- Start a local server on port 8080

**Test on your mobile device:**- Display your local IP address for mobile access

- Disable caching for development (`-c-1`)

**Easiest method:** Double-click `start-server.bat` (Windows batch file)

**Manual command:**

This will:```bash

- Start a local server on port 8080cd docs

- Display your local IP address for mobile accessnpx http-server -p 8080 -c-1

- Disable caching for development (`-c-1`)```



**Manual command:****For mobile testing:**

```bash1. Ensure your PC and mobile device are on the same Wi-Fi network

cd docs2. Run the server (double-click `start-server.bat`)

npx http-server -p 8080 -c-13. Note the "Mobile:" URL shown (e.g., `http://192.168.1.100:8080`)

```4. Open that URL on your mobile browser



**For mobile testing:****Alternative scripts:** See `scripts/` folder for PowerShell-based options.

1. Ensure your PC and mobile device are on the same Wi-Fi network

2. Run the server (double-click `start-server.bat`)## 📱 Features

3. Note the "Mobile:" URL shown (e.g., `http://192.168.1.100:8080`)**Test on your mobile device:**

4. Open that URL on your mobile browser

**Easiest method:** Double-click `start-server.bat` (Windows batch file)

**Alternative scripts:** See `scripts/` folder for PowerShell-based options.

This will:

## 📱 Features- Start a local server on port 8080

- **Single Page Application** - Seamless navigation without page reloads- Display your local IP address for mobile access

- **PWA Support** - Install on mobile/desktop, works offline- Disable caching for development (`-c-1`)

- **Accessible** - ARIA attributes, screen reader support, keyboard navigation

- **Mobile-Optimized** - Touch-friendly tap targets, smooth scrolling, full-screen display**Manual command:**

- **Test Suite** - DOM tests (QUnit) and visual regression tests (Playwright)```bash

cd docs

## 🏗️ Project Structurenpx http-server -p 8080 -c-1

```

```

drop/**For mobile testing:**

├── start-server.bat          # Quick-start dev server (double-click)1. Ensure your PC and mobile device are on the same Wi-Fi network

├── scripts/                   # Server scripts and alternatives2. Run the server (double-click `start-server.bat`)

│   ├── start-dev-server.bat  # Alternative (runs PowerShell script)3. Note the "Mobile:" URL shown (e.g., `http://192.168.1.100:8080`)

│   └── start-dev-server.ps1  # PowerShell dev server script4. Open that URL on your mobile browser

├── docs/                      # GitHub Pages root (live app)

│   ├── index.html            # Main app entry point**Alternative scripts:** See `scripts/` folder for PowerShell-based options.in Tracker PWA

│   ├── app.js                # App logic & state management

│   ├── styles.css            # Styling & design tokensA minimalist Progressive Web App for tracking daily life domains: Sleep, Fitness, Mind, and Spirit.

│   ├── manifest.json         # PWA manifest

│   ├── sw.js                 # Service worker for offline support**Live App:** https://benwassa.github.io/drop/

│   ├── icons/                # App icons and domain SVGs

│   ├── tests/                # Test suite## � Quick Start Development Server

│   │   ├── index.html        # QUnit test runner

│   │   ├── dom.test.js       # DOM tests**Test on your mobile device:**

│   │   ├── visual.test.js    # Playwright visual tests```bash

│   │   └── README.md         # Test documentation# Just double-click this file (Windows):

│   ├── package.json          # Dependencies & scriptsstart-server.bat

│   ├── playwright.config.js  # Playwright configuration

│   ├── SPRINT_SUMMARY.md     # Sprint deliverables# Or run manually:

│   └── VERIFICATION_CHECKLIST.mdcd docs

├── archive/                   # Old versions (V2.2, V3.0, V3.1)npx http-server -p 8080 -c-1

└── README.md                 # This file```

```

See [START_SERVER.md](START_SERVER.md) for detailed instructions.

## 🏃‍♂️ Quick Start

## �📱 Features

### View Live App- **Single Page Application** - Seamless navigation without page reloads

Visit: **https://benwassa.github.io/drop/**- **PWA Support** - Install on mobile/desktop, works offline

- **Accessible** - ARIA attributes, screen reader support, keyboard navigation

### Run Locally- **Mobile-Optimized** - Touch-friendly tap targets, smooth scrolling, full-screen display

```bash- **Test Suite** - DOM tests (QUnit) and visual regression tests (Playwright)

# Serve from docs folder

cd docs## 🏗️ Project Structure

npx serve -p 3000

```

# Or use Pythondrop/

python -m http.server 3000├── start-server.bat          # Quick-start dev server (double-click)

├── scripts/                   # Server scripts and alternatives

# Then open http://localhost:3000│   ├── start-dev-server.bat  # Alternative (runs PowerShell script)

```│   └── start-dev-server.ps1  # PowerShell dev server script

├── docs/                      # GitHub Pages root (live app)

### Install as PWA│   ├── index.html            # Main app entry point

1. Open the app in Chrome/Edge/Safari│   ├── app.js                # App logic & state management

2. Look for "Install" prompt or menu option│   ├── styles.css            # Styling & design tokens

3. Add to home screen (mobile) or desktop│   ├── manifest.json         # PWA manifest

│   ├── sw.js                 # Service worker for offline support

## 🧪 Development│   ├── icons/                # App icons and domain SVGs

│   ├── tests/                # Test suite

### Run Tests│   │   ├── index.html        # QUnit test runner

```bash│   │   ├── dom.test.js       # DOM tests

cd docs│   │   ├── visual.test.js    # Playwright visual tests

│   │   └── README.md         # Test documentation

# DOM Tests (QUnit)│   ├── package.json          # Dependencies & scripts

# Open tests/index.html in browser│   ├── playwright.config.js  # Playwright configuration

# Or: http://localhost:3000/tests/│   ├── SPRINT_SUMMARY.md     # Sprint deliverables

│   └── VERIFICATION_CHECKLIST.md

# Visual Tests (Playwright)├── archive/                   # Old versions (V2.2, V3.0, V3.1)

npm install└── README.md                 # This file

npx playwright install```

npm run test:visual

## 🚀 Quick Start

# Update visual baselines

npm run test:visual:update### View Live App

```Visit: **https://benwassa.github.io/drop/**



### Enable Dev Mode### Run Locally

```javascript```bash

// In docs/app.js, line 5:# Serve from docs folder

const DEV_MODE = true;cd docs

```npx serve -p 3000

- Shows dev pill in UI

- Click pill to open test suite# Or use Python

- Loading overlay doesn't auto-hidepython -m http.server 3000



## 📐 Architecture# Then open http://localhost:3000

```

### Single Page App (SPA)

- Pages: Home, Vision, Gratitude### Install as PWA

- Navigation via footer buttons1. Open the app in Chrome/Edge/Safari

- No page reloads - uses `classList.toggle('active')`2. Look for "Install" prompt or menu option

- State persisted in `localStorage`3. Add to home screen (mobile) or desktop



### Score Calculation## 🧪 Development

- **Sleep**: Hours between rest and wake time

- **Fitness**: Run distance + strength + skill practice### Run Tests

- **Mind**: Reading + writing activities```bash

- **Spirit**: Meditation + mood quadrantcd docs



### Accessibility# DOM Tests (QUnit)

- ARIA meter roles on score circles# Open tests/index.html in browser

- aria-live announcements for score updates# Or: http://localhost:3000/tests/

- Keyboard navigation (Tab, Esc)

- Focus-visible indicators# Visual Tests (Playwright)

- Screen reader compatiblenpm install

npx playwright install

### Mobile Optimizationnpm run test:visual

- Touch-action: manipulation (prevents double-tap zoom)

- Min tap targets: 44px × 44px# Update visual baselines

- -webkit-tap-highlight-color for visual feedbacknpm run test:visual:update

- Smooth scrolling with -webkit-overflow-scrolling```

- Safe area insets for notched devices

### Enable Dev Mode

## 🎨 Design System```javascript

// In docs/app.js, line 5:

Colors defined in `docs/styles.css`:const DEV_MODE = true;

- `--sleep`: #1e90ff (Blue)```

- `--fitness`: #ff3b30 (Red)- Shows dev pill in UI

- `--mind`: #7c3aed (Purple)- Click pill to open test suite

- `--spirit`: #16a34a (Green)- Loading overlay doesn't auto-hide



Fonts:## 📐 Architecture

- UI Text: Ubuntu (Google Fonts)

- Scores: Wix Madefor Display (Google Fonts)### Single Page App (SPA)

- Pages: Home, Vision, Gratitude

## 📚 Documentation- Navigation via footer buttons

- No page reloads - uses `classList.toggle('active')`

- **Sprint Summary**: `docs/SPRINT_SUMMARY.md`- State persisted in `localStorage`

- **Verification Checklist**: `docs/VERIFICATION_CHECKLIST.md`

- **Test Documentation**: `docs/tests/README.md`### Score Calculation

- **Sprint Backlog**: `docs/documentation/Sprints.md`- **Sleep**: Hours between rest and wake time

- **Fitness**: Run distance + strength + skill practice

## 🌐 GitHub Pages Deployment- **Mind**: Reading + writing activities

- **Spirit**: Meditation + mood quadrant

The `docs/` folder is configured as the GitHub Pages source:

### Accessibility

1. Go to repo Settings → Pages- ARIA meter roles on score circles

2. Source: Deploy from branch- aria-live announcements for score updates

3. Branch: `main` (or `dev`) → `/docs` folder- Keyboard navigation (Tab, Esc)

4. Save- Focus-visible indicators

- Screen reader compatible

Changes pushed to the selected branch automatically deploy.

### Mobile Optimization

## 🔄 Development Workflow- Touch-action: manipulation (prevents double-tap zoom)

- Min tap targets: 44px × 44px

```bash- -webkit-tap-highlight-color for visual feedback

# Work on dev branch- Smooth scrolling with -webkit-overflow-scrolling

git checkout dev- Safe area insets for notched devices



# Make changes in docs/ folder## 🎨 Design System

# Test locally

Colors defined in `docs/styles.css`:

# Commit and push- `--sleep`: #1e90ff (Blue)

git add .- `--fitness`: #ff3b30 (Red)

git commit -m "feat: add new feature"- `--mind`: #7c3aed (Purple)

git push origin dev- `--spirit`: #16a34a (Green)



# When ready, merge to mainFonts:

git checkout main- UI Text: Ubuntu (Google Fonts)

git merge dev- Scores: Wix Madefor Display (Google Fonts)

git push origin main

## 📚 Documentation

# GitHub Pages auto-deploys from docs/

```- **Sprint Summary**: `docs/SPRINT_SUMMARY.md`

- **Verification Checklist**: `docs/VERIFICATION_CHECKLIST.md`

## 📦 Dependencies- **Test Documentation**: `docs/tests/README.md`

- **Sprint Backlog**: `docs/documentation/Sprints.md`

### Production

- None! Vanilla HTML/CSS/JS## 🌐 GitHub Pages Deployment



### DevelopmentThe `docs/` folder is configured as the GitHub Pages source:

- `@playwright/test` - Visual regression testing

- QUnit (CDN) - DOM testing1. Go to repo Settings → Pages

2. Source: Deploy from branch

## 🤝 Contributing3. Branch: `main` (or `dev`) → `/docs` folder

4. Save

1. Fork the repository

2. Create feature branch (`git checkout -b feature/amazing-feature`)Changes pushed to the selected branch automatically deploy.

3. Work in `docs/` folder

4. Add tests for new features## 🔄 Development Workflow

5. Commit changes (`git commit -m 'feat: add amazing feature'`)

6. Push to branch (`git push origin feature/amazing-feature`)```bash

7. Open Pull Request# Work on dev branch

git checkout dev

## 📝 License

# Make changes in docs/ folder

MIT License - see LICENSE file for details# Test locally



## 👤 Author# Commit and push

git add .

Benjamin Haddongit commit -m "feat: add new feature"

git push origin dev

## 🗂️ Archive

# When ready, merge to main

Older versions preserved in `archive/`:git checkout main

- `V2.2/` - Early prototypegit merge dev

- `V3.0/` - Multiple AI variants (ChatGPT, Claude, Gemini)git push origin main

- `V3.1/` - Pre-docs iteration

# GitHub Pages auto-deploys from docs/

Current live version is in `docs/` folder.```



## 🛠️ Technical Notes## 📦 Dependencies



### Service Worker### Production

The `sw.js` caches the app shell for offline use. When updating cached files, bump the `CACHE_NAME` constant to force a cache refresh.- None! Vanilla HTML/CSS/JS



### Icons### Development

All icons are in `docs/icons/` as SVG files:- `@playwright/test` - Visual regression testing

- Domain icons: `sleep.svg`, `fitness.svg`, `mind.svg`, `spirit.svg`- QUnit (CDN) - DOM testing

- Navigation: `vision.svg`, `gratitude.svg`

- App icon: `drop_icon.svg`, `drop_rounded.png`## 🤝 Contributing



### Browser DevTools1. Fork the repository

- Use Application tab to inspect service worker status2. Create feature branch (`git checkout -b feature/amazing-feature`)

- Check manifest and PWA installation3. Work in `docs/` folder

- Clear site data when testing major changes4. Add tests for new features

5. Commit changes (`git commit -m 'feat: add amazing feature'`)

## 📄 License6. Push to branch (`git push origin feature/amazing-feature`)

7. Open Pull Request

MIT License - See LICENSE file for details

## 📝 License

## 🔗 Links

MIT License - see LICENSE file for details

- **Live App**: https://benwassa.github.io/drop/

- **Repository**: https://github.com/BenWassa/drop## 👤 Author

- **Test Suite**: https://benwassa.github.io/drop/tests/

Benjamin Haddon

---

## 🗂️ Archive

Built with ❤️ by Benjamin Haddon
Older versions preserved in `archive/`:
- `V2.2/` - Early prototype
- `V3.0/` - Multiple AI variants (ChatGPT, Claude, Gemini)
- `V3.1/` - Pre-docs iteration

Current live version is in `docs/` folder.

## 🛠️ Technical Notes

### Service Worker
The `sw.js` caches the app shell for offline use. When updating cached files, bump the `CACHE_NAME` constant to force a cache refresh.

### Icons
All icons are in `docs/icons/` as SVG files:
- Domain icons: `sleep.svg`, `fitness.svg`, `mind.svg`, `spirit.svg`
- Navigation: `vision.svg`, `gratitude.svg`
- App icon: `drop_icon.svg`, `drop_rounded.png`

### Browser DevTools
- Use Application tab to inspect service worker status
- Check manifest and PWA installation
- Clear site data when testing major changes

## 📄 License

MIT License - See LICENSE file for details

## 🔗 Links

- **Live App**: https://benwassa.github.io/drop/
- **Repository**: https://github.com/BenWassa/drop
- **Test Suite**: https://benwassa.github.io/drop/tests/

---

Built with ❤️ by Benjamin Haddon