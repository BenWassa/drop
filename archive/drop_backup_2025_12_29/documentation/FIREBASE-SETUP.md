# Firebase Setup & Local Emulator — Prep Notes

This document lists safe steps and example commands for initializing Firebase for Drop. **Do not commit service account JSON or CI tokens** — store them in GitHub Secrets or GCP Secret Manager.

## Quick checklist

- Create separate Firebase projects for `dev`, `staging` (optional), and `prod`.
- Add aliases with `firebase use --add` and keep a sample `.firebaserc.sample` checked in.
- Use the Firebase Emulator Suite for local testing (`firebase emulators:start`).
- Use preview channels for PR previews (`firebase hosting:channel:deploy`).

## Example commands

Install Firebase CLI:

```
npm i -g firebase-tools
firebase login
```

Create or link projects and add aliases:

```
firebase projects:create my-drop-dev   # or create in console
firebase projects:create my-drop-prod
firebase use --add   # choose project and give alias (e.g., dev, prod)
```

Initialize Hosting / Firestore / Functions (in `dev` branch only):

```
firebase init hosting firestore functions emulators
```

Emulator usage for local dev & tests:

```
firebase emulators:start --only firestore,hosting
```

Preview deploys (safe for PRs):

```
firebase hosting:channel:deploy pr-123 --project=dev
```

CI / GitHub Actions notes:

- Use `firebase login:ci` to generate a CI token (or better, authenticate with a GCP Service Account using `gcloud` in CI).
- Add tokens/secrets to GitHub (e.g., `FIREBASE_TOKEN`, or `GCP_SA_KEY`).

Security:

- Never commit service account JSON or tokens.
- Limit SA scopes to only what's required (Hosting/Firestore write as needed).

Migration & Backup:

- Before making schema changes, export current data or create a read-only backup snapshot.

Further steps (Sprint 1):

- Implement a lightweight Firebase init module that exposes init/auth/hydration functions.
- Mirror `Store.update()` writes to Firestore with optimistic local cache fallbacks.
