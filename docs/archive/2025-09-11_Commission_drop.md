```markdown
# 🌊 Ocean in a Drop — Commissioning Document (Upgraded)

## 1. Project Goal

Build a **mobile-first web app** (HTML/CSS/JS, no backend required at prototype stage) that allows users to:

* Commit to **quarterly archetypes** (identity + resource allocations).
* Log **daily presence** with minimal taps (number, vibe, or duration).
* Reflect via **weekly/monthly/quarterly visuals**, adapted to user style (Direct, Archetypes, Growth).
* Encode the new **resource model** (Sleep = identity, Fitness = growth allocation, Reading/Writing = tiered, Meditation = tracked practice, Burnout = state).
* Store data locally (localStorage).

---

## 2. Archetype & Resource Model

### **1. Sleep**

* Always set to **one archetype (identity)**.
* Defined by wake/sleep anchors:

  * 5:30 wake / 9:30 sleep
  * 6:30 wake / 10:30 sleep
  * 7:30 wake / 11:30 sleep
    ➡️ Daily identity practice, no “times per week.”
    ➡️ Commitment lasts a quarter.

---

### **2. Fitness**

* Framed as **resource allocation of time/energy**.
* Calculated from **last week’s performance**.
* Core modes:

  * **Maintain** (hold steady).
  * **Deload** (reduce).
  * **Growth** (+10% baseline, adjustable).
    ➡️ Example: last week 5 km → this week 5.5 km (growth).

---

### **3. Reading & Writing**

* Archetypes still valid:

  * Reading: Leisure (light), Perspicacity (medium), Erudition (heavy).
  * Writing: Journal (light), Editorial (medium), Treatise (heavy).
* Tiered as **times per week** (e.g. 2, 5, 8 sessions).
* Flexible allocations, not rigid quotas.

---

### **4. Meditation**

* Archetypes valid: Awareness, Introspection, Transcendence.
* **Tracked as instances only** (no enforced frequency).
* Treated as **resource allocation choice**, not performance metric.

---

### **5. Burnout**

* **State tracker only.**
* Scale: 1 (low stress) → 5 (high strain).
* No targets; used for awareness.
* Visualized in Gratitude section (trend line or heatmap).
* Important nuance: sometimes high burnout is necessary (hard training, deadlines).

---

## 3. User Flow

### **Quarterly Reset (Vision)**

1. User chooses entry path:

   * Direct (manual).
   * Archetypes (semi-auto).
   * Growth (auto).
2. App sets archetypes & allocations according to resource model.
3. Confirmation ritual: *“You are stepping into Earlybird + Perspicacity this quarter.”*

---

### **Daily Presence**

* **Sleep:** display chosen rhythm (identity archetype).
* **Fitness:** show current allocation (km or time) + mode (Maintain, Deload, Growth).
* **Reading/Writing:** show chosen archetypes + sessions tracked.
* **Meditation:** track instances, no pressure.
* **Burnout:** slider (1–5).
* **Footer:** daily summary (visual fill, not text-heavy).

---

### **Weekly / Monthly / Quarterly Gratitude**

* Adaptive visuals per style (Direct, Archetype, Growth).
* Burnout shown as **trend/heatmap**, not a goal.
* Reflection prompts remain offline-first: *“What deepened this week?”*

---

## 4. Design Rules

* **≤15 words per screen.**
* **Colors per domain:** Sleep = blue, Fitness = red, Mind = yellow, Spirit = green.
* **Graphics-first UI:** bars, waves, rings, fills.
* **One action per card:** tap, swipe, or hold.
* **Feedback:** subtle glow, ripple, streak, wave animations.

---

## 5. Technical Requirements

* **Stack:** HTML5, CSS (Tailwind), vanilla JS.
* **Persistence:** localStorage (archetypes, allocations, logs, burnout states).
* **Responsive:** mobile-first, Pixel 8 baseline.
* **Accessibility:** large tap targets, dark mode.

---

## 6. Deliverables

1. Prototype with full loop (Quarterly → Daily → Weekly → Quarterly).
2. Archetype screens reflect new resource model.
3. Presence screen shows allocations/states clearly.
4. Adaptive visuals for Gratitude (bars, rings, ocean fill, burnout heatmap).

---

## 7. Stretch Goals

* Warnings for **over-allocation** (e.g. too many heavy commitments).
* OCEAN-based onboarding.
* Export of reflections (Markdown).
```
