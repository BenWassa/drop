# Bug Fixes & Updates - October 16, 2025

## Major Updates
### dY' FIX: Sleep Duration Handles Cross-Midnight Rest (v3.3.3)

**Problem Solved:**
- Sleep scores and history summaries treated bedtimes logged after midnight as 18+ hour stretches, making cross-midnight entries unusable.

**New Solution:**
- Centralised a helper that calculates rest-to-wake duration with 24-hour wrap-around and wired it into live scoring, history tables, and tooling.
- Updated the history overlay summary so edited entries immediately reflect accurate sleep hours.

**Benefits:**
- Bedtimes entered after midnight no longer inflate sleep to impossible numbers.
- Sleep insights and history cards now align with the 'wake to rest' definition of a day.

**Verification:**
- Logged rest times such as 00:45 with a 06:30 wake and confirmed sleep summaries report about six hours.
- Edited past entries with after-midnight bedtimes and verified history cards and scores remain consistent.

### dY~ FIX: History Editor Respects Signed Mood & Energy (v3.3.2)

**Problem Solved:**
- Editing past entries in the history overlay forced mood/energy back to positive values, which broke quadrant alignment and erased negative reflections.

**New Solution:**
- History form inputs now accept the full -100 to 100 range and clamp values before saving.
- Quadrant recalculation reuses `Scoring.resolveQuadrant`, so saved entries land in the correct circumplex quadrant.
- Retained the updated tuning lab/sample dataset baselines introduced in 3.3.1 so reference data still covers all four quadrants.

**Benefits:**
- Negative or low-energy days survive history edits, keeping the quadrant view and spirit summaries accurate.
- Demo datasets and Monte Carlo runs continue to surface both positive and negative scenarios for tuning.

**Verification:**
- Edited multiple history entries with negative mood/energy values and confirmed they persist alongside the correct quadrant label.
- Reloaded the scoring lab to confirm regenerated sample datasets still include signed values.


### 🎯 NEW: Baseline-Gated Metrics & Guidance (v3.3.0)

**Problem Solved:**
1. New users were shown domain scores before enough data existed, creating noise.
2. Gratitude insights referenced metrics that had not been earned yet, reducing trust.
3. Baseline requirements were unclear and not surfaced in the UI.

**New Solution:** Delay all score displays until seven wake/rest days are captured.
- Home score rings stay hidden until the baseline is complete.
- Gratitude page swaps scorecards for guidance copy and progress reminders.
- Baseline banner tracks remaining days with a progress meter.
- Weekly trajectory heatmap continues to render so users still see logging feedback.

**Benefits:**
- 🔒 Prevents misleading averages before enough data exists.
- 🧭 Offers clear direction on what to log next.
- 🚀 Preserves positive momentum via the heatmap while still onboarding.
- 🙌 Restores full insights automatically on day seven with no extra steps.

**Technical Details:**
- `UI.renderScores()` now counts baseline-ready days and toggles score visibility.
- New gating state passed into `renderGratitude()` to swap copy and hide progress bars.
- Added cached references to score section and gratitude cards for quick DOM updates.
- Screen reader announcements suppressed until the baseline unlocks.

**Verification:**
- Clear storage, log fewer than seven days, confirm score UI stays hidden.
- Add entries to reach seven days, ensure scores, insights, and announcer resume.
- Confirm weekly heatmap renders continuously in both states.

### 🎉 NEW: Reliable Automatic Backup System (v3.2.0)

**Problem Solved:** 
1. Chrome's File System Access API handles expire when tabs close, causing persistent backup failures
2. Auto-downloading files creates clutter with dated filenames
3. **CRITICAL**: localStorage gets cleared on app updates and service worker changes, losing all backup data

**New Solution:** IndexedDB-based rolling backups (survives updates!)
- **No permission prompts** - Uses browser IndexedDB (always available)
- **Survives app updates** - IndexedDB persists through cache clears and service worker updates
- **Automatic backups** - Saves after every change (5 second throttle)
- **Rolling backup strategy:** 
  - Maintains 3 versions: Current, Previous, Oldest
  - Automatically rotates as changes are made
  - All stored in IndexedDB (separate from app cache)
- **Auto-restore:** Detects corrupted main state and auto-restores from backup on startup
- **User control:** 
  - Toggle automatic backups on/off in settings
  - "Download Backup File" creates timestamped JSON for external storage
  - "Restore from Backup" lets you choose which backup version to restore
- **Simplified UI:** Removed redundant Export button (use Download instead)

**Benefits:**
- ✅ **Survives app updates and cache clears** (critical!)
- ✅ Works reliably across all sessions
- ✅ No file clutter or handle expiration issues
- ✅ Instant automatic backups after changes
- ✅ 3 versions of history for safety
- ✅ Auto-recovery from corruption
- ✅ Manual download when you want external backup
- ✅ No file system permissions needed

**Technical Details:**
- Uses IndexedDB database 'drop-auto-backup-db' with objectStore 'backups'
- Stores 3 backup versions with keys: 'current', 'previous', 'oldest'
- SHA-256 hashing prevents redundant backups
- Throttles to 5 seconds after last change
- Backup metadata tracks dates and hash in IndexedDB
- Auto-restore checks on initialization
- IndexedDB survives service worker updates and cache clears

**Migration:** Old File System Access API and localStorage backup systems removed. Backups now stored in IndexedDB for persistence across updates.

---

## Previous Issues Fixed

### 1. ✅ Automatic Stale Handle Detection & Cleanup (v3.1.8 - DEPRECATED)
**Problem:** File System Access API handles become stale between sessions or during use, causing persistent backup failures.

**Root Cause:** Stale handles were detected but not automatically cleaned up from storage, causing the same stale handle to be loaded repeatedly.

**Fix:**
- Modified `loadHandle()` to clear stale handles from IndexedDB when validation fails
- Enhanced `performBackup()` error handling to clear handles when write operations fail
- Improved `ensurePermission()` to handle `queryPermission` failures on stale handles
- Automatic cleanup prevents users from getting stuck with unusable backup configurations

**Result:**
- Stale handles are automatically detected and removed
- Users are prompted to re-select backup folders when handles become invalid
- No more persistent backup failures due to stale handles
- Seamless recovery from handle expiration

---
**Enhancement:** App now checks for latest version immediately on startup, not just every 5 minutes.

**Implementation:**
- Added `registration.update()` call right after service worker registration
- Maintains existing 5-minute interval checks for ongoing updates
- Ensures users get latest version as early as possible

**Result:** Faster version updates and better user experience with immediate update detection.

---

### 2. ✅ Loading Screen PNG Protection
**Enhancement:** Loading screen logo is now unclickable and non-downloadable.

**Implementation:**
- Added `pointer-events: none` to prevent clicks and interactions
- Added `user-select: none` to prevent text selection
- Maintains visual appearance while preventing user downloads/saves

**Result:** Loading screen image cannot be downloaded or saved by users.

---
**Problem:** Even after fixing user activation issues, backup was still failing with "User activation is required" error when FileSystemDirectoryHandle became stale after browser sessions.

**Root Cause:** File System Access API handles can become invalid/stale after browser restarts or permission expiration. Calling `requestPermission()` on stale handles fails even with user gestures.

**Fix:**
- Modified `validateExistingBackup()` to check directory accessibility without requesting permissions during initialization
- Enhanced `ensurePermission()` with specific error handling for stale handles:
  - Catch `SecurityError` with "User activation is required" message
  - Return `false` for stale handles instead of throwing
- Improved error flow: When permissions fail due to stale handles, clear the stored handle and prompt user to reconfigure

**Result:**
- Robust handling of stale backup folder handles
- Automatic detection and recovery from permission/handle expiration
- User gets clear feedback to reconfigure backup when needed
- No more crashes from stale handle operations

---

### 2. ✅ Backup Permission Persistence & User Activation
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
2. **package.json** - Version bump to 3.1.5
3. **manifest.json** - Version bump to 3.1.5  
4. **sw.js** - Version bump to 3.1.5
5. **index.html** - Version bump to 3.1.5
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
**Version:** 3.3.3  
**Ready for testing:** Yes  
**Requires page refresh:** Yes  
**Breaking Change:** Domain metrics stay hidden until a seven-day baseline is logged
