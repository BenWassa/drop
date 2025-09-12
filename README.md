# 🌊 Project drop — Habit App README (Refined with Target Assignment)

> **🚀 No Node.js Required!** This is a browser-native web app. Simply open `index.html` in any modern web browser to run the application. All development and testing can be done without installing Node.js.

## 1. Vision

“You are not a drop in the ocean, but the ocean in a single drop.”
This app reimagines habit tracking as **identity practice over time**.
Users commit to archetypes across **quarters** (≈90 days), reinforcing durable identity through daily logging and layered reflections.

* **Vision:** Commit to archetypes & goal style for a quarter.
* **Presence:** Log with minimal friction (number, vibe, duration).
* **Gratitude:** Reflect with adaptive visuals and see cumulative growth.

---

## 2. UX Principles

* **Low words per screen** (≤15).
* **Quarterly commitments** → resistance to frequent switching, but not locked.
* **Depth/timeframe inversion:**

  * Daily = shallow (fast taps).
  * Weekly = medium (patterns).
  * Monthly = deeper (arcs).
  * Quarterly = deepest (identity).
* **Three user entry paths:**

  1. **Direct control** → manual target assignment.
  2. **Archetypes** → semi-automatic targets based on chosen archetype.
  3. **Growth mode** → automatic target assignment from system using 21-day rolling averages with baseline clamping (trend-driven, stable adjustments).
* **Vibe-first logging** → intuitive, minimal, optional numbers.

---

## 3. Core Flow

### **Quarterly Reset (Vision)**

* Prompt: *“Who do you want to be this quarter?”*
* Choose path: Direct / Archetypes / Growth.
* Targets set based on path:

  * **Direct = Manual.** User inputs targets themselves.
  * **Archetypes = Semi-auto.** System proposes targets aligned to archetype; user can adjust.
  * **Growth = Auto.** System generates targets based on past logging, user focuses on attention not planning.
* Confirmation ritual: *“You are stepping into Earlybird + Perspicacity this quarter.”*

### **Daily (Presence)**

* **Default home screen.**
* Domain cards:

  * Sleep (wake/rest)
  * Fitness (strength toggle, run slider or vibe fill)
  * Mind (reading/writing toggles)
  * Spirit (burnout 1–5, meditation yes/no)
  # 🌊 Ocean in a Drop — Project Overview

  This repository contains a mobile-first prototype (HTML/CSS/JS) for "Ocean in a Drop": a quarterly-focused habit/presence app that treats small daily actions as identity practices.

  Core ideas:
  - Commit to an archetype or control style for a quarter (≈13 weeks).
  - Log daily presence with minimal friction (tap, hold, or slider).
  - Reflect weekly/monthly/quarterly with adaptive visuals (bars, rings, ocean-fill).
  - Store data locally (localStorage), no backend required for the prototype.

  ## Quick start

  **Open `index.html` in a browser (mobile or desktop) for quick prototyping.** No Node.js required!

  **Tailwind CSS Setup: No Building Required!**
  The app uses Tailwind CSS via CDN (Content Delivery Network). This means:
  - ✅ No Node.js installation needed
  - ✅ No build process required
  - ✅ Works offline once initially loaded
  - ✅ All Tailwind classes available immediately

  The line `<script src="https://cdn.tailwindcss.com"></script>` in `index.html` loads Tailwind CSS directly from their servers. Custom styles are in `style.css`.

  **Optional: Local Tailwind Building (requires Node.js)**
  For production builds or custom Tailwind configuration, you can build CSS locally. But this is completely optional - the app works perfectly with the CDN version!

  To build the CSS locally (requires Node.js and npm):

  1. Install dependencies:

  ```powershell
  npm install
  ```

  2. Build styles (one-shot):

  ```powershell
  npm run build:css
  ```

  3. For development with automatic rebuilds while editing:

  ```powershell
  npm run watch:css
  ```

  **Note:** Skip CSS building entirely - the app loads Tailwind from CDN and works immediately!

  Files of interest:
  - `index.html` — UI scaffolding and screens.
  - `style.css` — design tokens and UI styles.
  - `app.js` — application state, onboarding flow, logging, and export/import.
  - `config.json` — domain definitions and fitness modes. (Archetype definitions are intentionally not required in config for the pilot.)

  ## Vision & UX

  The app exposes three entry paths during the Quarterly Reset:

  1. Direct Control — user sets weekly targets manually.
  2. Archetypes — user picks a persona; the system proposes targets which can be adjusted.
  3. Growth Mode — system-driven targets derived from past logs/trends using 21-day rolling averages with 80-120% baseline clamping for stable, realistic adjustments.

  Daily Presence is the default screen. Domains are represented as cards: Sleep (identity), Fitness (allocation & mode), Mind (reading & writing), Spirit (meditation & burnout). Interactions are intentionally simple: tap to log, hold to record duration, and sliders for intensity.

  Weekly/Monthly/Quarterly gratitude and review screens visualize progress using different metaphors depending on the chosen entry path.

  Design rules:
  - ≤15 words per screen.
  - Colors: Sleep = blue, Fitness = red, Mind = yellow, Spirit = green.
  - Graphics-first: rings, waves, fills, bars.
  - One action per card; large targets; dark mode support.

  ## Technical notes

  - **Stack: HTML5, CSS (Tailwind + custom styles), vanilla JS.**
  - **No Node.js required** - runs directly in any modern web browser
  - **Zero build process** - open `index.html` in browser to run
  - Persistence: localStorage key `oceanDropState` stores `state` (targets, logs, commitments, onboarding flag).
  - Configuration: `config.json` includes `sleep`, `fitness`, `mind`, and `spirit`. Archetypes are a UX concept (optionally defined in config) but not required for the single-user pilot.

  ## Development vs Deployment Setup

  **Development Structure:**
  - JavaScript files are organized in `src/` folder for better code organization
  - HTML script tags point to `src/config.js`, `src/state.js`, etc.
  - This allows for modular development and better file management
  - **No build tools needed** - edit files directly and refresh browser

  **GitHub Pages Deployment:**
  - GitHub Pages serves files from the repository root
  - Script tags in `index.html` are configured to load from `src/` paths
  - All necessary files (HTML, CSS, JS) remain in root for deployment
  - Static assets can be served from `assets/` folder

  **Simple Development Workflow:**
  1. Open `index.html` in your web browser
  2. Edit source files in `src/` with any code editor
  3. Refresh browser to see changes
  4. Use browser DevTools for debugging and testing

  This setup allows for clean development organization while maintaining deployment compatibility.

  ## What's been updated

  - Added a minimal `archetypes` section to `config.json` so archetype selection has defaults.
  - `app.js` now ensures `state.targets` and `state.logs` exist after loading, and guards against missing archetype entries.
  - Improved quarter/week calculation logic and defensive UI updates to avoid runtime errors when configuration is missing.

  ## Next steps / Suggested improvements

  1. Improve growth-mode algorithm: average recent logs and compute suggested weekly allocations.
  2. Add unit tests for date/quarter logic and import/export validators.
  3. Add accessibility checks (contrast, focus states) and keyboard navigation.
  4. Wire a small settings screen to change archetype sleep anchors and fitness baseline.
  5. Add an onboarding animation for the confirmation ritual.

## Repo structure & best-practices (pilot-first)

This project will grow. For now, keep things simple and single-user focused. Suggested structure and practices as you iterate:

- Keep UI and logic separate: `index.html` + `style.css` + `app.js` is fine for the prototype. When adding complexity, split `app.js` into `state.js`, `ui.js`, `storage.js`.
- Add a `src/` folder and migrate JS there when you introduce build tooling.
- Add `tests/` and a tiny test runner (Node + Jest or Vitest) for date/quarter logic and import/export validation. *(Optional - app works without Node.js)*
- Use a minimal `package.json` to record dev tools (linters, test runner). This helps later CI integration. *(Optional - not required for development)*
- Keep data model stable: `state` shape is central (targets, logs, commitments, onboardingComplete). Prefer migration helpers when evolving the model.
- Maintain a simple changelog (CHANGELOG.md) for commissions and versioned experiments.

If you'd like, I can scaffold a `package.json`, move JS into `src/`, and add a couple tests for the quarter-week calculation as a next step. *(Note: Node.js is not required - the app runs directly in browser)*

  If you'd like, I can implement any of the next steps (recommend starting with the growth-mode algorithm and a basic unit test for quarter calculation).

  ## Running quick tests locally (no Node required)

  **The main application runs directly in your browser** - no Node.js installation needed! Simply open `index.html` in any modern web browser.

  If you want to run the included unit tests locally, you'll need Node.js installed. The test suite validates:
  - Quarter calculation logic
  - Date formatting
  - Week numbering
  - Year transitions

  To run tests (requires Node.js):
  ```bash
  npm install
  npm test
  ```

  **Note:** Tests are completely optional. The app functions perfectly without them.

  1. Create and activate a Python virtual environment (optional but recommended):

  ```powershell
  python -m venv .venv; .\.venv\Scripts\Activate
  ```

  2. Install test dependencies:

  ```powershell
  pip install -r requirements.txt
  ```

  3. Run the tests:

  ```powershell
  pytest -q
  ```

  The tests cover the `getQuarterInfo` logic (start of quarter, week calculation) so you can be confident the date math aligns with the UI.

# Updated Project Structure

This project now follows a better folder architecture:

- **src/**: Contains all source code.
- **assets/**: Contains static files like images and styles.
- **docs/**: Contains documentation files.
  - **docs/archive/**: Contains dated, completed markdown files (see `docs/archive/README.md` for details).
  - **docs/NextSteps.md**: Current development roadmap and priorities.
- **tests/**: Contains test files.
- **config/**: Contains configuration files.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## AI Agent Instructions

- Follow the coding conventions outlined in the `README.md`.
- Refer to the `docs/TechStack.md` for understanding the technologies and development setup.
- Refer to the `docs/AI_Instructions.md` for project-specific guidelines and workflow.
- Check `docs/NextSteps.md` for current development priorities and roadmap.
- Ensure to document any new features or changes in the respective markdown files.