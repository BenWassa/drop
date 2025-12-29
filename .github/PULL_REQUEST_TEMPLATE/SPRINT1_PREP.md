---
name: Sprint 1 prep
about: Draft PR for Sprint 1 preparatory changes (docs + samples)
---

## Summary

This draft PR contains preparatory work for Sprint 1 (persistence & architecture stabilization). It is intentionally documentation and config-sample only; **no secrets** are included.

## Changes

- `docs/documentation/SPRINTS.md` — marked Sprint 0 completed; added Sprint 1 prep checklist
- `docs/documentation/FIREBASE-SETUP.md` — step-by-step initialization & emulator notes
- `.firebaserc.sample` — sample aliases file (no real IDs)
- `firebase.json.sample` — minimal sample for hosting/emulator

## Next steps

- Review the checklist, confirm `dev`/`prod` project names, and add necessary GitHub Secrets (`FIREBASE_TOKEN` or `GCP_SA_KEY`).
- After approvals, we can implement the Firebase init module and add integration tests on `dev`.

> This PR is intended to be a draft; please do not merge until CI checks are added and pass.
