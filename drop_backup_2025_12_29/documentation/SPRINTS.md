# Drop PWA — Technical Sprint Commissions (AI LLM)

These commissions are written as **execution-grade instructions** for an AI LLM working directly in the Drop codebase.  
Assume **single-user**, **production-focused**, **no speculative features**, and **minimal surface change unless explicitly stated**.

---

## Sprint 0 — Alignment Lock (Context Injection)
**Type:** Context-only (no code changes)

**Status:** ✅ **Completed** — alignment and constraints have been agreed and Sprint 0 is closed.

### Objective
Ensure all future code changes reflect the intended system behavior and philosophy.

### Instructions
- Treat Drop as a **reflective daily orientation system**, not a performance optimizer.
- Optimize for:
  - clarity of “today”
  - balance across domains
  - acknowledgment of effort
- Avoid:
  - enforcement logic
  - punitive language
  - score-first UX decisions

### Constraints
- Do not introduce logic that assumes multiple users.
- Do not introduce social, competitive, or streak-based mechanics.

---

## Sprint 1 — Persistence & Architecture Stabilization
**Type:** Structural backend integration

### Objective
Replace browser-only persistence with durable remote persistence while preserving offline usability.

### Scope of Work
- Integrate Firebase into the existing Store layer.
- Implement anonymous Firebase Authentication.
- Mirror state writes from `Store.update()` to Firestore.
- On app initialization:
  - hydrate local Store from Firestore if available
  - fall back to local cache if offline
- Preserve existing localStorage behavior as a cache layer only.

### Required Code Touchpoints
- `docs/store.js`
- `docs/app.js`
- new Firebase config/init module

### Explicit Constraints
- Do not refactor UI or scoring logic.
- Do not change state schema unless necessary for Firebase compatibility.
- Do not introduce async dependencies into UI rendering paths without guarding.

### Success Criteria
- State persists across sessions, devices, and refreshes.
- App functions offline with cached data.
- Firebase failures do not break core functionality.

### Sprint 1 — Prep Checklist
Before starting Sprint 1, complete the following preparatory items on the `dev` branch:

- [ ] Confirm development happens on `dev` branch and protect `main` (PR-only merges).
- [ ] Create Firebase projects (dev / staging / prod) and add aliases via `.firebaserc`.
- [ ] Add `.firebaserc.sample` and `firebase.json.sample` to the repo (no secrets committed).
- [ ] Create `docs/documentation/FIREBASE-SETUP.md` with step-by-step initialization + emulator usage.
- [ ] Configure GitHub Actions for preview channel deploys from `dev` (store tokens/secrets in GitHub Secrets).
- [ ] Add minimal emulator & integration tests for persistence layer; require passing CI before merging to `main`.
- [ ] Plan the data migration / compatibility checks (if any) and write a short data-backup checklist.

> **Note:** Sprint 1 work should be implemented on `dev` and opened as a PR for review; maintain small, reversible commits.

---

## Sprint 2 — UX Clarity & Interaction Feedback
**Type:** UI clarity and affordance improvements

### Objective
Reduce ambiguity in interactions and make the “today” state obvious.

### Scope of Work
- Add explicit affordance to splash/entry screen (e.g., instruction text).
- Add labels or tooltips to bottom navigation icons.
- Add immediate feedback for actions that currently appear inert:
  - mindfulness “Start Session”
  - expandable row interactions
- Simplify or annotate cognitively heavy labels where confusion is likely.
- Clarify which elements represent:
  - logging
  - guidance
  - reflection

### Required Code Touchpoints
- `docs/ui.js`
- `docs/index.html`
- `docs/styles.css` (minimal)

### Explicit Constraints
- No visual redesign.
- No new features or flows.
- No onboarding walkthroughs.

### Success Criteria
- All interactive elements provide clear feedback.
- No action feels “uncertain” or “silent”.
- Users can immediately tell what day they are interacting with.

---

## Sprint 3 — Daily Guidance & Scoring De-Prioritization
**Type:** Semantic and presentation-level logic changes

### Objective
Shift the system from score-centric output to daily guidance without judgment.

### Scope of Work
- Reduce visibility of numeric scores in primary UI views.
- Convert daily feedback to domain-level signals or descriptors.
- Preserve scoring internally for trend analysis only.
- Remove or hide cross-domain ranking language (e.g., strongest/weakest).
- Elevate gratitude and acknowledgment outputs to first-class UI elements.

### Required Code Touchpoints
- `docs/ui.js`
- `docs/analytics.js`
- `docs/scoring.js` (presentation only, not core math)

### Explicit Constraints
- Do not change scoring formulas unless required for display logic.
- Do not introduce thresholds, penalties, or enforcement rules.
- Do not surface daily numeric comparisons.

### Success Criteria
- Daily UI emphasizes attention and care, not evaluation.
- Users cannot “optimize” their day by chasing numbers.
- Feedback remains calm, supportive, and reflective.

---

## Sprint 4 — Vision ↔ Day ↔ Reflection Integration (Optional)
**Type:** Light data linkage and narrative surfacing

### Objective
Link short-term vision with daily guidance and longitudinal reflection.

### Scope of Work
- Store near-term vision or focus statements.
- Surface relevant vision context during daily guidance.
- Provide lightweight narrative summaries over time (weekly or monthly).

### Required Code Touchpoints
- `docs/store.js`
- `docs/analytics.js`
- `docs/ui.js`

### Explicit Constraints
- No long-term planning engine.
- No goal enforcement or reminders.
- No predictive logic.

### Success Criteria
- Vision gently informs daily focus.
- Reflection feels cohesive across time.
- System remains non-prescriptive.

---

## Global Constraints (All Sprints)
- Assume a single trusted user.
- Avoid premature abstraction or optimization.
- Prioritize clarity, durability, and philosophical alignment.
- Prefer small, reversible changes.
- Never introduce gamification mechanics.

---

## Guiding Principle for All Code Changes
Build a **quiet, durable, personal instrument** that helps orient daily attention, acknowledge effort, and support balance over time — without pressure, punishment, or comparison.
