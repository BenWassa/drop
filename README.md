# 🌊 Project drop — Habit App README (Refined with Target Assignment)

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
  3. **Growth mode** → automatic target assignment from system (trend-driven).
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
* Logging modes:

  1. Number (km, pages).
  2. Vibe (color intensity, slider fill).
  3. Duration (press & hold to fill bar).
* Daily feedback: “4/6 habits today” + subtle animation.

### **Weekly & Monthly (Gratitude)**

* Visuals adapt by style:

  * Direct → charts, streak lines.
  * Archetypes → identity resonance rings.
  * Growth → cumulative “ocean fill.”
* Reflection prompt (optional, offline): “What deepened this week/month?”

### **Quarterly Review**

* Ritual: show archetype summary, adherence, reflections.
* Prompt to reaffirm or adjust commitments.

---

## 4. Design Rules

* **Words:** ≤15 per screen.
* **Colors:** Sleep = blue, Fitness = red, Mind = yellow, Spirit = green.
* **Interactions:** one tap/swipe logs; no heavy typing.
* **Graphics-first:** waves, rings, streak bars, fills.

---

## 5. Development Priorities

1. Prototype HTML/CSS/JS (mobile-first, local storage).
2. Build core loop: Quarterly → Daily → Weekly → Quarterly.
3. Add adaptive visuals by entry path (Direct/Archetypes/Growth).
4. Stretch: OCEAN personality-based UX.

---

## 6. Next Steps

* Draft **UI flow diagrams** for quarter → day → week/month → quarter loop.
* Write **commissioning doc** for Claude with colors, components, interactions.
* Prototype and test for friction + adherence.

---

⚖️ With this structure, each entry path is tightly linked to a target assignment rule:

* Direct = Manual
* Archetypes = Semi-auto
* Growth = Auto