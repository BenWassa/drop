# 🌊 drop

A personal, mobile-first dashboard for quarterly goal setting and daily reflection. This app reimagines habit tracking as **identity practice over time**, helping you align your daily actions with your long-term vision.

## 📖 Original Vision & Philosophy

**drop** was born from a fundamental insight: habit tracking should focus on *identity formation* rather than achievement optimization. Instead of chasing arbitrary goals, users commit to quarterly archetypes and practice daily presence with minimal friction.

### Core Principles
- **Quarterly Identity Practice**: 90-day commitments create resistance to frequent switching
- **Resource Allocation Model**: Smart distribution of time/energy across life domains
- **Minimal Friction Logging**: Daily actions take seconds, not minutes
- **Identity Over Achievement**: Focus on who you become, not what you accomplish
- **Mobile-First Design**: Touch-optimized, responsive, offline-capable

### The Resource Model
- **Sleep** = Identity (wake/sleep rhythm embodiment)
- **Fitness** = Allocation (time/energy resource management)
- **Reading/Writing** = Tiered Practice (flexible frequency targets)
- **Meditation** = Tracked Practice (instance logging, no pressure)
- **Burnout** = State Awareness (1-5 scale, pure awareness tool)

📖 **[Read the complete Original Vision & Thoughts →](docs/Original_Vision.md)**

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