# Header Redesign: Identity & Visual Progress

## Overview
Replaced the previous circular score ring header with a streamlined three-row design that prioritizes mobile space efficiency, brand identity, and visual progress tracking.

## Design Structure

### Row 1: Identity (Menu + Title)
- **Left**: Menu icon (drop logo) opens settings sidebar
- **Center**: "drop" app title with distinctive lowercase typography
- **Purpose**: Brand identity and primary navigation access

### Row 2: Quarterly Progress
- **Progress Bar**: Visual representation of 13-week commitment cycle
- **Label**: "Week X of 13" status text
- **Purpose**: Shows user's journey through their quarterly commitment

### Row 3: Compact Scores (4-Up Grid)
- **Layout**: 4 equal-width cards in a single row
- **Content**: Icon + numeric score for each domain (Sleep, Fitness, Mind, Spirit)
- **Purpose**: Real-time domain performance feedback

## Implementation Details

### HTML Changes (`docs/index.html`)
```html
<header class="app-header">
  <!-- Row 1: Menu + Title -->
  <div class="header-row header-row--identity">
    <button class="menu-icon-btn" id="settings-icon-btn">
      <img src="icons/drop_rounded.png" alt="Menu" class="menu-icon">
    </button>
    <h1 class="app-title">drop</h1>
  </div>

  <!-- Row 2: Quarterly Progress -->
  <div class="header-row header-row--progress">
    <div class="quarter-progress">
      <div class="quarter-progress__bar">
        <div class="quarter-progress__fill" id="quarter-progress-fill"></div>
      </div>
      <div class="quarter-progress__label" id="quarter-progress-label">Week 0 of 13</div>
    </div>
  </div>

  <!-- Row 3: Compact Scores -->
  <div class="header-row header-row--scores">
    <div class="compact-scores">
      <!-- 4 domain cards: Sleep, Fitness, Mind, Spirit -->
    </div>
  </div>
</header>
```

### CSS Changes (`docs/styles.css`)
**New Styles Added:**
- `.header-row` - Base row container
- `.header-row--identity` - Menu + title layout
- `.menu-icon-btn` - Menu button styling (replaces settings-icon-btn)
- `.app-title` - Centered app title with distinctive typography
- `.header-row--progress` - Progress bar container
- `.quarter-progress` - Progress bar wrapper
- `.quarter-progress__bar` - Progress track
- `.quarter-progress__fill` - Animated progress fill
- `.quarter-progress__label` - Status text
- `.header-row--scores` - Scores container
- `.compact-scores` - 4-column grid
- `.compact-score` - Individual score card
- `.compact-score__icon` - Domain icons with color filters
- `.compact-score__value` - Numeric score display

**Deprecated Styles:**
- Old `.scores-grid` with circular meters
- `.score-item`, `.score-meter`, `.score-ring` components
- `.settings-icon-btn` (replaced by `.menu-icon-btn`)
- `.app-header__top` layout

### JavaScript Changes (`docs/app.js`)

**New UI Elements:**
```javascript
quarterProgress: {
  fill: document.getElementById('quarter-progress-fill'),
  label: document.getElementById('quarter-progress-label')
}
```

**New Functions:**
```javascript
UI.updateQuarterProgress() {
  // Calculates weeks elapsed in 13-week cycle
  // Updates progress bar width and label
  // Uses localStorage 'quarterStartDate' for tracking
  // Shows completion message when quarter ends
}
```

**Updated Functions:**
- `App.init()` - Added `UI.updateQuarterProgress()` call
- `App.syncDailyUI()` - Added `UI.updateQuarterProgress()` call

## Quarterly Progress Logic

### How It Works
1. **Start Date**: Stored in `localStorage.quarterStartDate`
2. **Auto-Initialize**: If not set, uses current date as start
3. **Calculation**: `(currentWeek / 13) * 100%`
4. **Display**: "Week X of 13" with animated progress bar
5. **Completion**: Shows "Quarter Complete! 🎉" at week 13

### Manual Reset (Optional)
To reset the quarter, open browser console and run:
```javascript
localStorage.setItem('quarterStartDate', '2025-01-01'); // Your new start date
UI.updateQuarterProgress();
```

## Visual Design Features

### Typography
- **App Title**: 24px, 400 weight, 4px letter-spacing, lowercase
- **Progress Label**: 11px, mono font, uppercase, 0.5px letter-spacing
- **Scores**: 20px, mono font, 600 weight

### Spacing & Layout
- **Row Gaps**: 8px (identity), 12px (progress), 16px (scores)
- **Score Grid**: 12px gap between cards
- **Icons**: 24px × 24px with domain-specific color filters

### Interactions
- **Menu Button**: Scale transform on hover/active
- **Score Cards**: Subtle lift on hover (translateY -2px)
- **Progress Bar**: Smooth 600ms animation

### Accessibility
- ARIA labels on all interactive elements
- Role="meter" on score displays
- Progressbar with aria-valuenow, aria-valuemin, aria-valuemax
- Screen reader announcements preserved

## Benefits

### Space Efficiency
- **Before**: ~180px header height (circular meters + spacing)
- **After**: ~120px header height (compact rows)
- **Saved**: ~60px for content area on mobile

### Visual Hierarchy
1. **Primary**: Quarterly progress (most prominent visual element)
2. **Secondary**: Domain scores (quick reference)
3. **Tertiary**: Menu access (tucked left)

### User Experience
- Continuous feedback on quarterly commitment
- Scores always visible without scrolling
- Clean, modern aesthetic aligned with brand
- Reduced cognitive load (smaller, focused data display)

## Migration Notes

### Old Element IDs Still Used
- `#sleep-score`, `#fitness-score`, `#mind-score`, `#spirit-score`
- These now target `.compact-score__value` elements instead of circular meters
- Existing score update logic in `UI.renderScores()` still works

### Settings Menu Still Functional
- `#settings-icon-btn` ID preserved for backward compatibility
- Button class changed to `.menu-icon-btn` for styling
- Settings sidebar opens/closes as before

### No Breaking Changes
- All existing app functionality maintained
- Score calculation logic unchanged
- Data persistence unchanged
- Service worker and PWA features unchanged

## Future Enhancements (Optional)

### Quarterly Progress
- [ ] Add "Reset Quarter" button in settings
- [ ] Track quarter completion history
- [ ] Show quarterly statistics/review at completion
- [ ] Animate confetti effect when quarter completes

### Score Display
- [ ] Add mini sparklines showing 7-day trends
- [ ] Tap score card to jump to domain page
- [ ] Show streak indicators on cards
- [ ] Add color-coded progress rings around scores

### Visual Polish
- [ ] Smooth transition between progress weeks
- [ ] Pulsing animation on new weekly milestone
- [ ] Dark/light mode variants
- [ ] Custom progress bar colors per user

## Testing Checklist

- [x] Header displays correctly on mobile (320px-480px)
- [x] Menu button opens settings sidebar
- [x] App title centered properly
- [x] Progress bar initializes with week 1
- [x] Progress label shows correct format
- [x] All 4 score cards render
- [x] Score values update correctly
- [x] Domain icons show correct colors
- [x] Hover effects work on desktop
- [x] Touch interactions work on mobile
- [x] Accessibility attributes present
- [x] No console errors on load

## Rollback Instructions

If you need to revert to the old header design:

1. **HTML**: Replace header content with old circular meter structure
2. **CSS**: Re-enable `.scores-grid` and related styles (remove `display: none`)
3. **JS**: Remove `UI.updateQuarterProgress()` calls from init and syncDailyUI
4. **localStorage**: Optionally clear `quarterStartDate` key

The old CSS is preserved but hidden with `display: none` for easy rollback.
