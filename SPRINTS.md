SPRINTS

Overview

This document breaks the work to port and parity the web `drop-app` into the native Expo scaffold into focused sprints. Each sprint is written so an LLM or developer can pick it up and complete it with small, deterministic tasks.

Sprint 0 — Repo & environment setup (1 day)
- Goal: reproducible local dev and test harness for native project
- Tasks:
  - Add or update `drop_natively/README.md` with setup and run instructions.
  - Add convenient npm scripts for `start`, `android`, `ios`, `test` in `drop_natively/package.json`.
  - Ensure TypeScript, ESLint and Jest configs exist and are minimally configured.
  - Verify Expo builds locally (`expo start`) and tests run via `npm test`.
- Acceptance:
  - `npm run android` or `expo start` launches the app and `npm test` runs tests.

Sprint 1 — Canonical data model & CONFIG import (2 days)
- Goal: Align native app schema with the web `CONFIG` so both platforms share canonical content
- Tasks:
  - Extract full CONFIG from web into a JSON/TS module inside `drop_natively/data/`.
  - Create TypeScript interfaces for commitments, identities, logs, onboarding flags in `src/types.ts`.
  - Add a migration helper that can read legacy `dropState_v2` and upgrade to the new schema.
- Acceptance:
  - Native project imports CONFIG and type-checks; migration handles `dropState_v2` payloads.

Sprint 2 — Storage adapters & validation (2 days)
- Goal: Implement robust AsyncStorage wrapper mirroring browser `useStorage` behavior
- Tasks:
  - Implement `src/hooks/useStorage.ts` with get/set/remove and validation using JSON schema or ad-hoc checks.
  - Add unit tests to `src/__tests__/storage.spec.ts` covering normal read/write, corrupt payload recovery, and migration.
- Acceptance:
  - Storage wrapper passes tests and recovers gracefully on corrupted data.

Sprint 3 — Onboarding parity (3 days)
- Goal: Port onboarding flows (identity selection, commitments, confirmation)
- Tasks:
  - Implement onboarding screens (`src/screens/Onboarding/*`) for identity selection, commitment capture, and confirmation.
  - Write screens to persist onboardingComplete flag and commitments to storage.
  - Keep UI minimal and accessible (one action per card).
- Acceptance:
  - Completing onboarding sets `onboardingComplete` and writes `commitments`/`weeklyTargets` to storage.

Sprint 4 — Home + DomainCard + Logging sheet (4 days)
- Goal: Implement daily presence loop and domain logging parity
- Tasks:
  - Create `DomainCard` component that renders domain state from CONFIG and commitments.
  - Implement logging bottom-sheet `LoggingSheet` with per-domain inputs (toggle/slider/numeric).
  - Implement logic functions `logPresence`, `logFitness`, `setIdentity` which update storage.
- Acceptance:
  - User can log via the bottom sheet and DomainCard updates to reflect recent logs.

Sprint 5 — Gratitude / Review / Settings / Export (3 days)
- Goal: Build review loop, export/import flows, and settings
- Tasks:
  - Implement `Review` and `Gratitude` screens with adaptive placeholders for visuals.
  - Implement export/import (JSON/Markdown) of state for migration and backups.
  - Implement `Settings` allowing mid-quarter adjustments, reset quarter, and notification preferences.
- Acceptance:
  - User can export state, import it back, and change settings which persist.

Sprint 6 — Polishing, animations, tests, release prep (3-5 days)
- Goal: UX polish and release readiness
- Tasks:
  - Add animations (reanimated) for DomainCard and ocean-fill visuals.
  - Add unit and integration tests for core logic and onboarding→logging flow.
  - Configure `eas.json` and prepare EAS build profiles.
- Acceptance:
  - Smooth UI on device/emulator; tests pass in CI; EAS builds.

How to use these sprints
- Each sprint is intended to be self-contained and small enough for an LLM or developer to implement with 1–3 focused prompts per file.
- Start with Sprint 0 and ensure test and build harnesses are stable before moving to data modeling.

If you'd like, I can now:
- Expand any sprint into exact Codex/LLM prompts (one prompt per file).
- Generate starter files for Sprint 1 (types and CONFIG JSON).
- Create PR-ready branch and commit the `SPRINTS.md` file.

Estimated total: ~2–3 weeks of focused work.
