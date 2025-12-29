# Scoring Tuning Lab (Concept)

## Why build this?
- Quickly iterate on domain scoring weights without editing production code.
- Visualise how changes influence a 7-day rolling average across Sleep, Fitness, Mind, and Spirit.
- Generate synthetic data to stress-test scenarios (baseline, streaks, edge cases).
- Prepare for future Monte Carlo simulations (50–1000 runs) that summarise domain outcomes.

## Core goals
1. **Interactive controls**  
   - Slider for every scoring coefficient or modifier in the current scoring module.  
   - Live numeric readout beside each slider for precise adjustments.  
   - Optional multiplier inputs if any weights need compound effects.
2. **Rolling-average visual**  
   - Display an easy-to-read graph showing the last seven days for each domain.  
   - Update instantly when sliders move or new mock data is generated.
3. **Mock data generator**  
   - Button to regenerate a 7-day dataset using current slider settings.  
   - Future hook to run N Monte Carlo simulations (start with single-run refresh).
4. **Result summary**  
   - Compact table/list showing simulated domain scores.  
   - Colour scale: green (≥80), yellow (~60), red (≤40) to flag weak domains quickly.

## Proposed location
- New HTML tool under `docs/tests/` (e.g., `scoring-lab.html`) so it ships with the test suite.

## Implementation constraints
- Reuse existing scoring logic from `docs/scoring.js` to avoid drift.  
- Keep dependencies light (vanilla JS + lightweight charting, e.g., Chart.js or D3 if already bundled).  
- Ensure the tool can run offline from the repo (no external CDN dependencies unless already whitelisted).

## Open questions
- Which scoring parameters are in scope for iteration? (Need definitive list from `Scoring` module.)
- Do we need presets for common scenarios (e.g., “Baseline Athlete”, “Burnout Risk”)?  
- How should Monte Carlo outputs aggregate—mean per domain, percentile bands, or both?

## Next steps
1. Confirm parameter list and charting preference.  
2. Approve the implementation vision (UI layout, data flow).  
3. Build the HTML tool with modular JS so it can evolve into a simulation runner.  
4. Extend generator to support multiple-run simulations once the single-run workflow feels right.

---

## Required project context
To commission this tool (human or LLM), provide the following repository files or excerpts:

| Area | File(s) | Why it matters |
| --- | --- | --- |
| Scoring logic | `docs/scoring.js` | Source of weights, multipliers, and current scoring pipeline to mirror or wrap |
| Store/data model | `docs/store.js` (entries structure), `docs/tests/sample-data-*.json` | Defines the shape of historical entries and default state used for mock data |
| UI styling | `docs/styles.css`, `docs/tests/README.md` (UI patterns) | Ensures the lab matches existing typography, colours, and layout conventions |
| Utility helpers | `docs/app.js`, `docs/ui.js`, `docs/analytics.js` | References for date formatting, rolling averages, and domain naming |
| Existing charts/tests | `docs/tests/index.html`, `docs/tests/dom.test.js` | Shows how test tools are scaffolded in `docs/tests/` and how assets are loaded |
| Versioning notes | `docs/documentation/BUG_FIXES.md`, `docs/README.md` | Provides release context and documentation standards |

If external libraries (e.g., Chart.js) are already vendored, include their path; otherwise note that a new local copy will be required.

### Additional data points to collect
- Complete list of parameters exposed by `Scoring.calculateDomainScores`, including any derived helpers or constants.
- Default weight values and acceptable ranges.
- Colour tokens (HEX/RGB/HSL) for green/amber/red states from the design system.
- Desired graph dimensions and responsive breakpoints.
- Any preferred seeding strategy for mock data reproducibility.

---

## Commission brief template
When requesting an AI agent or contributor to build the lab, share the following:

1. **Objective:**  
   “Create `docs/tests/scoring-lab.html` to interactively tune scoring parameters with live previews and synthetic data.”

2. **Scope:**  
   - Load `scoring.js` and reuse logic without duplicating implementations.  
   - Sliders + numeric inputs for every exposed parameter (list attached).  
   - 7-day mock dataset with refresh button; later extensible to N-run simulations.  
   - Rolling-average line chart + summary table with colour-coded scores.

3. **Assets/References:**  
   - Provide files listed in “Required project context.”  
   - Include screenshots or sketches if available.

4. **Constraints:**  
   - No external CDNs; bundle libraries locally.  
   - Keep tooling in vanilla JS (ES modules allowed).  
   - Must run offline via `npm run serve`.

5. **Acceptance criteria:**  
   - Configuration changes instantly update chart + table.  
   - Mock data respects entry schema and can be exported as JSON.  
   - Code linted/formatted consistent with repo standards.  
   - README entry describing how to use the lab.

6. **Future work hooks:**  
   - Placeholder UI for Monte Carlo run count.  
   - Extensible data pipeline so multiple datasets can be compared later.

Share this document alongside the repository snapshot to ensure the agent has a comprehensive blueprint.
