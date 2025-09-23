# 🌊 drop Vision Document

## 📌 Purpose

drop is a **personal, mobile-first PWA** for **quarterly identity practice**:

* Tracking small daily reps across 4 domains (Sleep, Fitness, Mind, Spirit).
* Building streaks and celebrating progress.
* Logging quick reflections (mood + notes).
* Working entirely **offline**, syncing to a personal Google Sheet for safekeeping.

This is **not** a social platform. It’s for **one user, one device (Pixel)**. Lightweight, joyful, frictionless.

---

## 🎯 UX Goals

* **Frictionless input**: 1 tap to mark an aspect complete.
* **Joyful feedback**: haptics + animations for tiny wins.
* **Identity-centered**: group actions under the 4 domains.
* **Engaging daily ritual**: progress ring + streak flames.
* **Supportive tone**: positive microcopy, no shaming.
* **Offline-first**: app works fully in airplane mode, syncs when online.

---

## 🗂️ Data Model

Each entry (row in Google Sheet) contains:

```js
{
  id: string,
  date: string (ISO),          // "2025-09-23"
  domain: "Sleep"|"Fitness"|"Mind"|"Spirit",
  aspect: string,              // e.g. "Run", "Meditation"
  completed: boolean,
  streak: number,               // consecutive completions
  mood?: number (1–5),
  note?: string,
  synced: boolean
}
```

Domains & aspects tracked:

* Sleep → Wake, Rest
* Fitness → Run, Strength, Skill
* Mind → Read, Write
* Spirit → Stress, Meditation

---

## 📊 Sheet Schema

\| Timestamp | LocalId | Domain | Aspect | Completed | Streak | Mood | Note |

---

## 🎨 Design System

**Theme:** Dark mode default, calm + focused.
**Typography:**

* Headline: 24–28px, bold
* Body: 16px system-ui
* Small/muted: 13px, gray

**Color tokens:**

* Background: `#111`
* Card surface: `#1b1b1f`
* Text: `#fff`
* Muted text: `#aaa`
* Accents by domain:

  * Sleep 🌙 → Blue/Teal (#3b82f6)
  * Fitness 🏃 → Red/Orange (#ef4444)
  * Mind 📚 → Purple (#8b5cf6)
  * Spirit 🧘 → Green (#22c55e)

**Components:**

* **Domain card**: rounded 16px, domain color header.
* **Aspect toggle**: chip/checkbox with ✓ animation.
* **Progress ring**: SVG circle animates as aspects complete.
* **Streak indicator**: 🔥 + count.
* **Mood slider**: row of 4 emojis.

**Animations:**

* Button press: scale(0.95), 150ms ease-out.
* Aspect completion: fade + ✓ pop, subtle haptic.
* Day complete: confetti burst.

---

## 📱 Screen Flows

### Today

* Progress ring + “Day X of 90”
* Four domain cards (expand/collapse) → aspect toggles inside
* FAB → quick note/reflection

### Review

* Weekly grid (7 × 8 aspects) with ✓ history
* Streak highlights
* Weekly completion %

### Reflection

* Mood slider
* Short text input
* Save → celebratory micro-animation

### Settings

* Manage aspects (toggle off unused)
* Sync status (“Last sync at 12:32”)
* Export/backup

---

## 🛠️ Technical Constraints

* **Static only**: `index.html`, `styles.css`, `main.js`, `sw.js`, `config.js`, `manifest.json`
* **No Node.js, no build tools**
* **Offline-first**: Service Worker caches static files + IndexedDB outbox
* **Sync**: Google Apps Script Web App (append rows to Sheet)
* **Device target**: Pixel 8, Chrome, PWA installable

---

## ✅ Priorities

1. Daily **Today screen** is the core loop → fast, fun, positive.
2. Visualize **streaks** and **progress** to build momentum.
3. Keep reflection lightweight → don’t block logging.
4. Data durability via **Google Sheets sync**.
5. Must always work offline.