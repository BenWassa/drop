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

`
drop/
 docs/                      # GitHub Pages root (live app)
    index.html            # Main app entry point
    app.js                # App logic & state management
    styles.css            # Styling & design tokens
    manifest.json         # PWA manifest
    sw.js                 # Service worker for offline support
    icons/                # App icons and domain SVGs
    SPRINT_SUMMARY.md     # Sprint deliverables
    VERIFICATION_CHECKLIST.md
 archive/                   # Old versions (V2.2, V3.0, V3.1)
 README.md                 # This file
`

##  Architecture

### Single Page App (SPA)
- Pages: Home, Vision, Gratitude
- Navigation via footer buttons
- No page reloads - uses classList.toggle('active')
- State persisted in localStorage

### Score Calculation
- **Sleep**: Hours between rest and wake time
- **Fitness**: Run distance + strength + skill practice
- **Mind**: Reading + writing activities
- **Spirit**: Meditation + mood quadrant

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

`ash
# Work on dev branch
git checkout dev

# Make changes in docs/ folder

# Commit and push
git add .
git commit -m "feat: add new feature"
git push origin dev

# When ready, merge to main
git checkout main
git merge dev
git push origin main

# GitHub Pages auto-deploys from docs/
`

##  Dependencies

- None! Vanilla HTML/CSS/JS

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

##  Links

- **Live App**: https://benwassa.github.io/drop/
- **Repository**: https://github.com/BenWassa/drop

---

Built by Benjamin Haddon
