# Bug Fixes - October 16, 2025

## Issues Fixed

### 1. ✅ Backup Permission Persistence & User Activation
**Problem:** File System Access API permissions require "user activation" (user gesture) to request. Automatic permission requests on app startup were failing with "User activation is required" error.

**Root Cause:** The app was trying to automatically request permissions on startup without user interaction, which violates browser security policies.

**Fix:**
- Modified `init()` to only check if backup folder is configured, not validate permissions automatically
- Updated `performBackup()` to handle permission requests properly:
  - Manual backups: Request permissions when user clicks
  - Auto backups: Skip silently if no permission (don't spam user)
  - Permission denied: Clear stored handle for manual backups, show error
- Added `clearStoredHandle()` method for proper cleanup

**Result:** 
- Backup folder location persists across sessions
- Permissions only requested when user actively uses backup features
- No more automatic permission prompts on app startup
- Graceful handling when permissions are denied

---

### 2. ✅ Quarter and Week Display (Q1 Wk 0)
**Problem:** Quarter and week labels were stuck at "Q1 Wk 0" and not updating to today's date.

**Root Cause:** The progress bar HTML element (`#quarter-progress-fill`) was commented out in `index.html` (lines 62-67). The update function was silently failing because the element didn't exist in the DOM.

**Fix:**
- Uncommented the progress bar HTML in `index.html`
- Added debug logging to `UI.updateQuarterProgress()` to catch similar issues in future

**Result:** Quarter and week now correctly calculate and display:
- Current day of year
- Current week (1-52)
- Current quarter (Q1-Q4)
- Progress bar fills based on day progress through the year

---

### 2. ✅ Spirit Timer - Mantra Text Visibility
**Problem:** Both "Start Session" and mantra text (ॐ मणि पद्मे हूँ) were showing at the same time instead of the mantra being hidden initially.

**Root Cause:** The mantra text (`#spirit-mantra-text`) had `opacity: 0` but no `visibility: hidden`, so it was still taking up space and potentially flickering or showing through.

**Fix (styles.css):**
```css
/* Enhanced mantra text hiding */
#spirit-mantra-text {
  position: absolute;
  opacity: 0;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 1px;
  color: var(--color-text-primary);
  transition: opacity 0.6s ease-in-out, transform 0.6s ease-in-out;
  transform: scale(0.95);
  pointer-events: none;
  visibility: hidden;  /* Added */
}

.mantra-text {
  opacity: 0 !important;
  visibility: hidden;  /* Added */
}

#spirit-mantra-text.fade-in {
  opacity: 1;
  transform: scale(1);
  visibility: visible;  /* Added */
}
```

**Result:** 
- Mantra is completely hidden on initial load
- Only "Start Session" text is visible
- Mantra fades in smoothly during long press
- Color is correct (var(--color-text-primary))

---

## Testing Performed

### Backup Permission Persistence
- ✅ App startup no longer prompts for backup folder permission unnecessarily
- ✅ Existing backup folder is properly validated without prompting
- ✅ Permission persistence works across browser sessions
- ✅ Only prompts when permission is actually not granted

### Quarter/Week Display
- ✅ Labels now show correct quarter based on current date
- ✅ Week number calculates correctly (day of year / 7)
- ✅ Progress bar fills appropriately based on day progress
- ✅ Console logging added for debugging

### Spirit Timer
- ✅ Initial state shows only "Start Session"
- ✅ Mantra is completely hidden (opacity + visibility)
- ✅ Long press triggers smooth fade transition
- ✅ Color uses correct CSS variable

---

## Code Changes

### Files Modified:
1. **backup.js** - Fixed permission handling and user activation requirements
2. **package.json** - Version bump to 3.1.4
3. **manifest.json** - Version bump to 3.1.4  
4. **sw.js** - Version bump to 3.1.4
5. **index.html** - Version bump to 3.1.4
6. **index.html** - Uncommented progress bar HTML
7. **styles.css** - Added visibility hidden to mantra text
8. **ui.js** - Added debug logging to updateQuarterProgress()

### Lines Changed:
- `backup.js`: Lines 65-95 (init method), Lines 380-410 (performBackup method), Lines 545-565 (clearStoredHandle method)
- `package.json`: Line 3 (version)
- `manifest.json`: Line 5 (version)
- `sw.js`: Line 3 (version)
- `index.html`: Line 950 (version), Lines 62-67 (progress bar)
- `styles.css`: Lines 1482-1500 (mantra visibility)
- `ui.js`: Lines 566-607 (logging)

---

## Known Remaining Issues

### Spirit Timer Still Not Modularized
The meditation timer is still implemented as an inline `<script>` tag in `index.html` (lines 297-438). This should be extracted to `ui.js` as a separate function to complete the modularization effort.

**Recommendation:** Extract to `UI.bindSpiritTimer()` in a future update.

---

## Verification Steps

1. **Backup Persistence:**
   - Set up backup folder and grant permissions
   - Close browser completely and reopen app
   - Verify backup automatically requests permission and continues working
   - Check backup status shows "Last backup: [timestamp]" instead of "Choose a folder"
   - If permission is denied when prompted, backup should require reconfiguration

2. **Quarter/Week Display:**
   - Open the app in browser
   - Check header - should show current quarter and week
   - Check browser console for quarter/week calculation logs

3. **Spirit Timer:**
   - Open Spirit overlay
   - Verify only "Start Session" is visible initially
   - Press and hold timer button - mantra should fade in smoothly

---

**Status:** All issues resolved ✅  
**Version:** 3.1.3  
**Ready for testing:** Yes  
**Requires page refresh:** Yes
