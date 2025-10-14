# Drop PWA Data Overhaul Plan

## Overview
- **Goal:** Improve persistence performance, reduce redundancy, and create a future-proof storage layer.
- **Timeline:** Approximately two sprints (7–10 days total).

## Phase 1: Core Refactor (Sprint 1)
### Objective
Optimize the existing `store.js` implementation while continuing to use `localStorage` to avoid breaking changes.

### Key Actions & Expected Outcomes
- **Storage model:** Remove `dailyTimestamps`; derive timestamps from entries (10–15% storage reduction).
- **History:** Compute history on demand with `getHistory(days)` (30–40% storage reduction).
- **Save logic:** Introduce debounced saves (300–500 ms interval) to reduce write operations by 80%.
- **Error handling:** Catch `QuotaExceededError` and archive or warn users to prevent data loss.
- **Export:** Sanitize export payload so it includes only `meta` (settings, schema) and `entries` for cleaner JSON exports.
- **Data schema versioning:** Add `_version` (currently `2`) and `_schemaDate` fields to enable future migrations.

### Deliverables
- Refactored `store.js` incorporating debounce logic and computed history.
- Migration script that removes `dailyTimestamps` and appends version metadata.
- Updated `sample-data.json` aligned to the new structure.
- Test suite covering save, load, and export scenarios.

### Expected Impact
- 40–50% smaller state object.
- 70–90% reduction in write operations.
- Noticeable improvement in UI responsiveness.
- Backward-compatible data experience.

## Phase 2: IndexedDB Migration (Sprint 2)
### Objective
Introduce an asynchronous, scalable persistence layer built on IndexedDB while keeping `localStorage` as a cache.

### Key Actions & Expected Outcomes
- **Database wrapper:** Implement `DropDB.js` as an IndexedDB helper for async persistence.
- **Migration:** Seamlessly import existing `localStorage` data into IndexedDB.
- **Data partitioning:** Cache current-day data in `localStorage`, store historical entries in IndexedDB for faster loads.
- **Archive store:** Move entries older than 365 days into a dedicated archive table.
- **Compression:** Integrate LZ-String for exports, reducing export size by 50–60%.

### Deliverables
- IndexedDB layer covering entries, settings, vision, and archive stores.
- Automatic migration pathway from the legacy store.
- Unified API that exposes `getEntries`, `saveEntry`, and `getHistory`.
- Updated export/import pipeline compatible with IndexedDB.

### Expected Impact
- 10× capacity increase.
- Fully non-blocking saves.
- 3× faster export/import experiences.
- Foundation for future multi-device synchronization.

## Phase 3: Advanced Enhancements (Future Sprint)
Optional forward-looking improvements:
- Automated local backup rotation.
- Additional compression for large export/import payloads.
- Cloud synchronization via Supabase or Firebase.
- Data insights dashboard with storage usage and trend analytics.

## Technical Stack Highlights
- **Persistent storage:** IndexedDB (with `idb` wrapper) for asynchronous, large-capacity storage.
- **Compression:** LZ-String as a lightweight, browser-native solution.
- **Export format:** JSON with optional Base64 compression for interoperability.
- **Versioning:** `_version` and `_schemaDate` fields to track schema evolution.
- **Backup:** Local IndexedDB backups employing a rotational policy.

## Testing Strategy
1. Functional coverage for persistence, export, import, and migration flows.
2. Stress scenarios simulating 2–3 years of entries (~1 MB of data).
3. Quota handling tests that intentionally trigger `localStorage` limits.
4. Cross-device validation to ensure future sync consistency.

