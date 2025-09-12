# AI Agent Instructions for drop

## Creative Direction & Recent Implementation Notes

Before making changes, also read **[Creative_Direction.md](Creative_Direction.md)** which captures the design and product rationale for recent structural changes (modular screens, ScreenRegistry autoload, per-aspect fitness model, and onboarding paths). Key points for AI agents and contributors:

- Keep changes aligned with the identity-first philosophy and quarterly commitments model.
- New screen modules register with the ScreenRegistry; the registry autoloads known `window`-exposed setup functions to avoid timing issues.
- Fitness is now modeled per-aspect (cardio/strength/skills). When modifying calculations, update `src/config.js` and `src/logic.js` and preserve legacy fallback for migration.

Refer to `docs/Creative_Direction.md` for the short rationale; use the rest of these AI instructions for code-level guidelines.

---

## 📖 Original Vision & Philosophy

**Before making any changes, read the [Original Vision & Thoughts](Original_Vision.md)** document to understand the foundational principles that guide all development decisions.

**drop** reimagines habit tracking as **identity practice over time**. The core insight: users should focus on *who they want to become* rather than *what they want to achieve*. This fundamental philosophy must guide all technical and design decisions.

### Key Principles to Remember
- **Identity over achievement** → Small actions compound into meaningful personal change
- **Quarterly commitments** → 90-day cycles create resistance to frequent switching
- **Resource allocation model** → Smart distribution of time/energy across domains
- **Minimal friction logging** → Daily actions should take seconds, not minutes
- **Mobile-first design** → Touch-optimized, responsive, offline-capable

---

## Project Overview

**drop** is a mobile-first web application that reimagines habit tracking as "identity practice over time." Users commit to quarterly archetypes (≈90 days) and log daily presence with minimal friction, creating durable identity through consistent small actions.

### Core Philosophy
- **Quarterly commitments** → Resistance to frequent switching, focus on identity
- **Minimal friction logging** → Fast, intuitive interactions (tap, slider, vibe)
- **Identity over achievement** → Small actions compound into meaningful change
- **Mobile-first design** → Touch-optimized, responsive, offline-capable

## Codebase Architecture

### Modular JavaScript Structure
The application uses a clean separation of concerns across five main modules:

#### `src/config.js` - Application Configuration
- **Purpose**: Central configuration for domains, archetypes, and constants
- **Key exports**: `CONFIG` object, `ARCHETYPES` object
- **Update pattern**: Modify constants here when adding new domains or archetypes
- **Dependencies**: None (pure configuration)

#### `src/state.js` - State Management
- **Purpose**: Application state, persistence, and developer controls
- **Key features**: localStorage integration, DEV_MODE toggle, state object
- **Update pattern**: Add new state properties here, update save/load functions
- **Dependencies**: None (pure state management)

#### `src/logic.js` - Business Logic
- **Purpose**: Calculations, date utilities, archetype application
- **Key functions**: `getQuarterInfo()`, `applyArchetype()`, `calculateWeeklyFitnessTarget()`
- **Update pattern**: Add calculation logic here, keep UI logic separate
- **Dependencies**: `CONFIG` from config.js, `state` from state.js

#### `src/ui.js` - User Interface
- **Purpose**: DOM manipulation, screen rendering, event handling
- **Key functions**: `showScreen()`, `renderAllDomainCards()`, developer toolbar
- **Update pattern**: Add new UI components here, keep business logic in logic.js
- **Dependencies**: `state` from state.js, functions from logic.js

#### `src/main.js` - Application Orchestration
- **Purpose**: Initialization, event listeners, high-level routing
- **Key functions**: `initializeApp()`, DOM event setup
- **Update pattern**: Add new screens/routes here, keep implementation in ui.js
- **Dependencies**: All other modules

### File Loading Order
```html
<script src="src/config.js"></script>
<script src="src/state.js"></script>
<script src="src/logic.js"></script>
<script src="src/ui.js"></script>
<script src="src/main.js"></script>
```

## Development Workflow

### Adding New Features

#### 1. Domain Expansion
```javascript
// In config.js - Add new domain
CONFIG.newDomain = {
  option1: { name: "Option 1", icon: "🎯", target: 5 },
  option2: { name: "Option 2", icon: "⭐", target: 3 }
}

// In state.js - Add to commitments
commitments: {
  // ... existing
  newDomain: 'option1'
}

// In ui.js - Add rendering function
function renderNewDomainCard() {
  // Implementation
}
```

#### 2. Screen Addition
```javascript
// In main.js - Add route
if (state.onboardingComplete) {
  showScreen('new-screen');
}

// In ui.js - Add screen function
function setupNewScreen() {
  // Implementation
}
```

#### 3. Archetype Creation
```javascript
// In config.js
ARCHETYPES.newArchetype = {
  name: "New Archetype",
  commitments: {
    sleep: "Dawnchaser",
    fitnessMode: "growth",
    // ... other commitments
  }
}
```

### Code Style Guidelines

#### JavaScript Conventions
- **ES6+ features**: Use `const`/`let`, arrow functions, template literals
- **Function naming**: camelCase for regular functions, PascalCase for constructors
- **Variable naming**: descriptive names, avoid single letters except in loops
- **Comments**: JSDoc for public functions, inline comments for complex logic
- **Error handling**: Use try/catch for localStorage operations

#### HTML/CSS Conventions
- **Semantic HTML**: Use proper heading hierarchy, ARIA labels where needed
- **Tailwind classes**: Group related classes, use responsive prefixes consistently
- **CSS variables**: Use for colors, spacing, and reusable values
- **Mobile-first**: Start with small screens, add larger breakpoints

### Testing & Validation

#### Manual Testing Checklist
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on multiple devices (desktop, tablet, mobile)
- [ ] Test offline functionality (localStorage persistence)
- [ ] Test with DEV_MODE on/off
- [ ] Test all user flows (onboarding, daily logging, quarterly review)

#### Code Quality Checks
- [ ] Console errors in browser DevTools
- [ ] localStorage data integrity
- [ ] State persistence across sessions
- [ ] UI responsiveness on different screen sizes
- [ ] Touch interactions on mobile devices

## Common Patterns & Solutions

### State Management
```javascript
// Reading state
const { commitments, logs } = state;

// Updating state
state.commitments.fitnessBaseline = 10;
saveState(); // Always call after state changes

// Reactive UI updates
renderAllDomainCards();
```

### Event Handling
```javascript
// Direct event listener
document.getElementById('button').addEventListener('click', handleClick);

// Dynamic event delegation
document.addEventListener('click', (e) => {
  if (e.target.matches('.dynamic-button')) {
    handleDynamicClick(e);
  }
});
```

### Date Calculations
```javascript
// Current quarter info
const quarter = getQuarterInfo(); // { quarter, year, week, startDate, endDate }

// Today's date string for logging
const today = getTodaysDateString(); // "2025-09-11"

// Week date range
const weekDates = getWeekDates(); // ["2025-09-08", "2025-09-09", ...]
```

### Debug Logging
```javascript
// Conditional logging (only in DEV_MODE)
debugLog('Function called with:', param1, param2);

// Console logging (always visible)
console.log('Debug info:', data);
```

## Deployment Considerations

### GitHub Pages Setup
- **Root files**: `index.html`, `style.css` must remain in repository root
- **Script paths**: Use `src/` prefix for JavaScript files
- **Asset paths**: Use relative paths for images and static files
- **No build step**: Direct deployment of source files

### Performance Optimization
- **Bundle size**: Keep JavaScript modules focused and lightweight
- **Image optimization**: Use appropriate formats and sizes
- **CDN usage**: Leverage CDNs for external resources
- **Caching**: Utilize browser caching for static assets

## Troubleshooting Guide

### Common Issues

#### State Not Persisting
```javascript
// Check localStorage key
console.log(localStorage.getItem('dropState_v2'));

// Reset state if corrupted
localStorage.removeItem('dropState_v2');
location.reload();
```

#### UI Not Updating
```javascript
// Force re-render
renderAllDomainCards();

// Check for JavaScript errors
console.error('Check browser console for errors');
```

#### Date Calculations Wrong
```javascript
// Verify quarter calculation
const testDate = new Date('2025-09-11');
const quarter = getQuarterInfo(testDate);
console.log('Quarter:', quarter);
```

### Debug Tools
- **Browser DevTools**: Network, Console, Application (localStorage)
- **Developer Toolbar**: Enable DEV_MODE in state.js for in-app debugging
- **Mobile Testing**: Use browser device emulation or real devices

## Future Development Guidelines

### Feature Addition Process
1. **Plan**: Document feature requirements and user impact
2. **Design**: Sketch UI/UX changes and data flow
3. **Implement**: Follow modular architecture (config → state → logic → ui → main)
4. **Test**: Manual testing across devices and browsers
5. **Document**: Update relevant documentation files

### Architecture Decisions
- **Keep it simple**: Prefer vanilla JavaScript over frameworks
- **Mobile-first**: Design for touch, enhance for desktop
- **Progressive enhancement**: Core functionality works without JavaScript
- **Data persistence**: localStorage for client-side storage
- **Performance**: Lightweight, fast-loading, offline-capable

This document provides the foundation for AI agents to understand and contribute effectively to the drop project. Follow these guidelines to maintain code quality, consistency, and the project's core philosophy of simplicity and intentionality.