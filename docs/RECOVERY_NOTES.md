Recovery notes — keep this file as a running log for debugging persisted state issues

Date: 2025-09-23

Summary:
- The app intermittently "hides views" after running for a while; opening in incognito doesn't reproduce the issue, which suggests persistent client-side state (localStorage, IndexedDB, service worker caches, cookies) is involved.
- Changes made so far:
  - Added `docs/storage-utils.js` with helpers to clear localStorage, sessionStorage, cookies, caches, and to delete the `drop-tracker` IndexedDB database.
  - Added a "Clear cached data" button in the Developer settings (`index.html` / `ui.js`).
  - Added defensive startup detection in `docs/main.js` that can auto-clear when launching with `?clear_cache=1` or show a banner offering to clear data.
  - Hardened `getAudioNotes` in `docs/data.js` to avoid NotFoundError and added a mock audio note in `seedMockData` so audio notes can be seen after seeding.

Errors observed during testing:
- ui.js:1551 Failed to load audio notes NotFoundError: Failed to execute 'transaction' on 'IDBDatabase': One of the specified object stores was not found.
  - Fixed by making `getAudioNotes` robust to missing stores/indexes and seeding a mock audio note.

Reproduction steps (what I tried):
1. Load app in normal window (not incognito).
2. Enable Developer mode (Settings → Developer).
3. Click "Clear Mock Data" to reset mock sandbox.
4. Click "Seed Mock Data" (previously didn't populate audio notes; now seeds one mock audio note).
5. Navigate to Reflect screen and check audio notes area for seeded audio.

Current status:
- Mock seeding now inserts entries, outbox items, reflections, and one mock audio note.
- `getAudioNotes` no longer throws when a store or index is missing; instead it returns [] and logs a warning.
- The app still appears to stash some state that can later cause views to disappear; root cause not yet identified.

Candidate sources of stale state to inspect next:
- `localStorage` keys used by the app: `dev_mode`, `use_mock_data`, `disabled_aspects`, `drop_client_id`, `last_sync_time`, `visibleAspects`.
- IndexedDB stores: `entries`, `outbox`, `audio_notes`, `mock_entries`, `mock_outbox`, `mock_audio_notes`.
- Service worker caches (cache name `drop-lite-static-v2`) — cached HTML/JS could be mismatched with runtime.
- Any global runtime flags persisted on window or via cookies.

Next steps (pick one or two):
- Add diagnostics UI that shows diffs of localStorage keys and their values (with size warnings) so we can spot overly-large or malformed keys.
- Add logging around any code that hides screens (search for `classList.add('hidden')`, `screen.classList.add('active')` calls and instrument them to log caller stack and state). This will help identify who hides views unexpectedly.
- Add an integration test that reproduces the scenario: run the app, interact for a while, assert screens are still visible. Use Playwright/ Puppeteer to seed storage and reproduce failing state.
- Implement a migration layer that safely normalizes persisted keys on startup instead of clearing everything.

Notes for tomorrow:
- Start by reproducing the "views hidden" bug in dev with console open; watch for exceptions and store writes around the time views disappear.
- If not reproducible, collect localStorage and IndexedDB dumps right after startup and again after the app enters the broken state; compare diffs.

Files changed in this session:
- Added: `docs/storage-utils.js`
- Edited: `docs/ui.js`, `docs/main.js`, `docs/data.js`, `docs/index.html`, `docs/styles/app.css`

Contact:
- If you want me to continue tomorrow, reply with which next step to pick (I recommend "diagnostics UI" + "log hiding calls").
