# 🌊 drop

A personal, mobile-first dashboard for quarterly goal setting and daily reflection. This app reimagines habit tracking as **identity practice over time**, helping you align your daily actions with your long-term vision.

## Core Vision

*   **Quarterly Commitments:** Commit to a specific identity and resource allocation for a ~13-week quarter.
*   **Frictionless Logging:** Log your daily presence with minimal taps. Automate tracking where possible with API integrations.
*   **Adaptive Reflection:** Review your progress with visuals that adapt to your chosen path (Direct Control, Archetypes, or Growth).

---

## 🚀 Quick Start: No Build Tools Required!

This is a browser-native web app. Simply open `index.html` in any modern web browser to run it.

1.  **Download or Clone:** Get the project files onto your computer.
2.  **Open `index.html`:** Double-click the `index.html` file or drag it into your browser.
3.  **Done!** The application runs entirely in your browser with no installation or build steps.

**Tailwind CSS:** The project uses Tailwind CSS via a CDN script in the HTML. This means you do not need to install or build anything for the styles to work.

---

## How It Works: The Core Flow

### 1. Quarterly Reset (The Vision)
At the start of each quarter, you define your focus by choosing a path:
*   **Direct Control:** Manually set every commitment for granular control.
*   **Archetypes:** Select a pre-defined persona (e.g., "Scholar," "Athlete") as a starting template, then tweak the details.
*   **Growth Mode:** The app analyzes your recent history to suggest an appropriate and sustainable level of effort for the next quarter.

### 2. Daily Presence (The Practice)
This is the main screen where you log your daily actions. Each domain is treated differently:
*   **Sleep (Identity):** Displays your chosen sleep rhythm (e.g., "Early Bird"). Your goal is to embody this identity.
*   **Fitness (Allocation):** Shows your dynamically calculated weekly target (e.g., "5.5 km") based on your recent performance and chosen mode (Maintain, Deload, or Growth).
*   **Mind (Tiered Practice):** Log your reading and writing sessions against your chosen weekly frequency.
*   **Spirit (State Tracking):** Log meditation instances and track your subjective burnout level on a 1-5 scale.

### 3. Reflection (The Gratitude)
*   **Weekly:** The Gratitude screen visualizes your week's progress, including a trendline for your burnout state.
*   **Quarterly:** The Review screen shows your high-level consistency (e.g., "Sleep Embodiment: 85%") and provides a ritual to close out the quarter and prepare for the next.

---

## Project Structure

The project is organized for clarity and maintainability while remaining build-tool-free.

*   `index.html`: The main application UI and structure.
*   `style.css`: Custom CSS rules for the "glassmorphism" theme and animations.
*   `src/`: Contains all modular JavaScript source code.
    *   `config.js`: Defines the available archetypes and commitments (e.g., sleep rhythms, reading tiers).
    *   `state.js`: Manages the application's state, default values, and `localStorage` operations.
    *   `logic.js`: Contains all business logic, date calculations, and API interactions.
    *   `ui.js`: Handles all DOM manipulation, screen rendering, and user feedback.
    *   `main.js`: The main entry point that initializes the application.

---

## For Developers (Optional)

While not required to run the app, this project includes helpers for development and testing.

### Developer Mode
You can enable an in-app debug toolbar by setting `DEV_MODE = true` at the top of the `src/state.js` file. This toolbar provides verbose logging and allows you to easily jump between screens and reset state.

### Unit Tests (Requires Node.js)
The repository contains a suite of unit tests for critical business logic (like quarter and date calculations). To run them:

1.  **Install Dependencies:** `npm install`
2.  **Run Tests:** `npm test`

**Note:** The tests are completely optional and are not needed for the application to function.

## Legal & Privacy

*   **[Privacy Policy](PRIVACY.md)** - Learn how your data is handled and stored locally in your browser.
*   **[Terms of Service](TERMS.md)** - The terms and conditions for using this application.