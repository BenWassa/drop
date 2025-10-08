# Data Flow & DEV_MODE Fix - October 8, 2025

## Issues Fixed

### 1. ✅ DEV_MODE Reference Error
**Error:** `ReferenceError: DEV_MODE is not defined at Object.removeDevElements (ui.js:232)`

**Root Cause:** 
- `DEV_MODE` was defined as a local constant inside the `DOMContentLoaded` callback in `app.js`
- `ui.js` tried to access `DEV_MODE` directly, but it wasn't in scope

**Fix:**
1. **app.js**: Made `DEV_MODE` globally accessible by adding `window.DEV_MODE = DEV_MODE;`
2. **ui.js**: Updated `removeDevElements()` to safely check for DEV_MODE:
```javascript
removeDevElements() {
  const devMode = (typeof DEV_MODE !== 'undefined' && DEV_MODE) || 
                  (typeof window.DEV_MODE !== 'undefined' && window.DEV_MODE);
  if (devMode) return;
  // ... rest of function
}
```

**Result:** DEV_MODE now accessible across modules without errors

---

### 2. 🔍 Data Storage & Score Calculation Debugging

**Concern:** Data might not be storing or passing through to scores correctly

**Debugging Added:**

#### Store.js Logging:
```javascript
// In Store.init()
- Logs loaded data from localStorage
- Logs initial state keys
- Logs all daily values (wake, rest, run, etc.)

// In Store.update()
- Logs every update call with key and value
- Logs state after update
- Logs daily key logging with date
- Logs localStorage save confirmation
- Logs when score update is triggered
- Warns if key not found in state
```

#### App.js Logging:
```javascript
// In App.updateScores()
- Logs when function is called
- Logs current state for all daily keys
- Logs calculated scores for all domains
- Confirms scores rendered successfully
```

#### Scoring.js Logging:
```javascript
// In Scoring.calcSleep()
- Logs input state (wake, rest times)
- Warns if missing data
- Logs calculated hours and duration
```

#### UI.js Logging:
```javascript
// In UI.updateQuarterProgress()
- Logs function call
- Logs element availability
- Logs calculated values (day, week, quarter)
- Confirms UI updates
- Errors if elements not found
```

---

## Data Flow Verification

### Expected Flow:
1. **User inputs data** → UI captures event
2. **UI calls Store.update()** → State updated
3. **Store.update() saves** → localStorage persisted
4. **Store.update() calls App.updateScores()** → Scores recalculated
5. **App.updateScores() calls Scoring functions** → Domain scores calculated
6. **Scores passed to UI.renderScores()** → Visual update

### What to Check in Browser Console:

When you input data (e.g., set wake/rest times), you should see:
```
📝 Store.update called: wake = 07:00
✅ State updated: wake = 07:00
📅 Daily key logged for: 2025-10-08
💾 State saved to localStorage
🔄 Triggering score update for key: wake

🎯 App.updateScores called
📊 Current state: { wake: "07:00", rest: "23:00", ... }
😴 calcSleep called with state: { wake: "07:00", rest: "23:00" }
😴 Sleep calculated: { hours: 8, ... }
📈 Calculated scores: { sleep: 85, fitness: 72, ... }
✅ Scores updated and rendered
```

### If Data ISN'T Saving:
Look for these warning messages:
- `⚠️ Key not found in state: [key]` - Key doesn't exist in Store
- `⚠️ Sleep: Missing wake or rest time` - Data not set properly
- `❌ Quarter progress elements not found` - DOM elements missing

---

## Testing Checklist

### ✅ DEV_MODE Fix
- [ ] Open browser console
- [ ] Refresh page
- [ ] No "DEV_MODE is not defined" error
- [ ] Dev pill should be visible (if DEV_MODE = true)
- [ ] Dev pill should be hidden (if DEV_MODE = false)

### 🔍 Data Storage Testing
- [ ] Open browser console
- [ ] Set wake time (e.g., 07:00)
- [ ] Check console for:
  - `📝 Store.update called: wake = 07:00`
  - `💾 State saved to localStorage`
  - `🔄 Triggering score update`
- [ ] Set rest time (e.g., 23:00)
- [ ] Check console for score calculation logs
- [ ] Verify sleep score updates in UI (should show hours and score)

### 🎯 Score Calculation Testing
- [ ] Input complete data:
  - Wake: 07:00, Rest: 23:00 (8 hours sleep)
  - Run: 30 min
  - Read: Yes
  - Write: Yes
  - Meditation: Yes
  - Quadrant: Set mood
- [ ] Check console for all domain calculations
- [ ] Verify all 4 domain scores display correctly
- [ ] Check localStorage in DevTools (Application tab)
- [ ] Refresh page - verify data persists

---

## Files Modified

1. **app.js**
   - Added `window.DEV_MODE = DEV_MODE;`
   - Added extensive logging to `updateScores()`

2. **ui.js**
   - Fixed `removeDevElements()` to safely check DEV_MODE
   - Added logging to `updateQuarterProgress()`

3. **store.js**
   - Added logging to `init()`
   - Added logging to `update()`
   - Added warning for invalid keys

4. **scoring.js**
   - Added logging to `calcSleep()`

---

## Next Steps

1. **Test in Browser:**
   - Open app with console open
   - Input various data points
   - Verify console logs show correct flow
   - Check that scores update properly

2. **Check localStorage:**
   - Open DevTools → Application → Local Storage
   - Verify `lifeTrackerData` key exists
   - Check that data persists after refresh

3. **Remove Debug Logging (Later):**
   - Once data flow is confirmed working
   - Remove console.log statements
   - Keep only essential error logging

---

**Status:** Debugging enabled, ready for testing  
**DEV_MODE Error:** Fixed ✅  
**Data Flow Logging:** Added ✅  
**Ready for Browser Testing:** Yes
