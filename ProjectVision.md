# 🌊 Drop - Daily Practice Journal Vision

## 📌 Purpose

Drop is your **personal daily practice journal** - a mobile-first PWA that helps you answer one question every day: **"Did I live today according to my Sleep, Fitness, Mind, Spirit practices?"**

* **8 Fixed Practices**: Wake, Rest, Run, Strength, Skill, Read, Write, Stress, Meditation
* **Daily Ritual**: Quick toggles with joyful feedback and celebrations
* **Identity-Centered**: Practices organized by life domains, not generic habits
* **Offline-First**: Full functionality without internet, syncs to personal Google Sheet
* **Single-User Focus**: Optimized for you (Pixel 8), not hypothetical users

This is **not** a social platform or generic habit tracker. It's your private daily practice journal - lightweight, joyful, and frictionless.

---

## 🎯 Core Philosophy

* **Daily Practice Journal**: Frame is "did I live my identity today?" not "did I check a box?"
* **Minimal Core Loop**: Fixed 8 practices, no customization in V1 - keeps ritual tight
* **Single-User Optimization**: Pixel 8 focus, offline-first, one Google Sheet
* **Joyful Feedback**: Celebrations, streaks, supportive microcopy
* **Identity-Driven**: Life domains over generic task management

---

## � Data Model

Each practice entry contains:

```js
{
  id: string,           // "2025-09-23-sleep-wake"
  date: string,         // "2025-09-23"
  domain: string,       // "sleep"|"fitness"|"mind"|"spirit"
  aspect: string,       // "wake"|"rest"|"run"|"strength"|"skill"|"read"|"write"|"stress"|"meditation"
  completed: boolean,
  streak: number,
  mood?: number,        // 1-4 (😞 😐 🙂 😁)
  note?: string,
  timestamp: number,
  synced: boolean
}
```

## 🌱 Fixed Domains & Aspects (V1)

Keep these 8 daily practices fixed — no customization in V1. This keeps the ritual tight and the app minimal.

* **Sleep** 🌙 → Wake, Rest
* **Fitness** 🏃 → Run, Strength, Skill
* **Mind** 📚 → Read, Write
* **Spirit** 🧘 → Stress, Meditation

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

### Today (Daily Ritual)

* Open app → "Day X of 90" + progress ring
* 4 Domain cards with fixed aspect toggles
* Tapping toggle = ✓ + animation + haptic feedback
* End of day: quick mood slider + optional note
* **Engagement hook**: All 8 complete = confetti + "Tiny wins compound" message

### Review (Weekly Patterns)

* Grid: 7 days × 8 aspects → see completion patterns
* Streak indicators under each aspect 🔥
* Weekly summary: % complete + longest streak

### Reflect (End-of-Day)

* Mood slider (😞 😐 🙂 😁)
* One-line note field
* "Save reflection" → subtle animation, returns to Today

### Settings (Minimal)

* Sync status ("Last sync at 12:32" / "Local only")
* Export to CSV
* No aspect management (fixed in V1)

---

## 🛠️ Technical Constraints

* **Static PWA**: HTML/CSS/JS only, no build tools
* **Offline-First**: IndexedDB + Service Worker outbox
* **Sync**: Google Apps Script → single Google Sheet
* **Target**: Pixel 8 (Chrome), PWA installable
* **Single-User**: One device, one Sheet focus

---

## ✅ Priorities (V1)

1. **Engaging Today screen** → frictionless toggles + joyful feedback
2. **Streak visibility** → daily motivation through progress
3. **Reflection ritual** → lightweight but meaningful end-of-day practice
4. **Sync clarity** → show when entries are "local" vs "synced"