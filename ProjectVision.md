# DISCIPLINE DASHBOARD — Drop

## PURPOSE

Discipline Dashboard is a compact, performance-focused app that tracks daily execution across four life domains: Sleep, Fitness, Mind, Spirit. The product exists to measure and amplify discipline through consistent, measurable actions.

- 8 fixed practices: Wake, Rest, Run, Strength, Skill, Read, Write, Stress, Meditation
- Performance Log: tap-only input for daily recording (no free-form entry during routine logging)
- Offline-first sync to a personal Google Sheet
- Single-user, device-focused (optimized for Pixel 8)

---

## CORE PHILOSOPHY

- Discipline-first: measure performance, remove friction, prioritize consistency
- Minimal loop: fixed 8 practices, no customization in V1
- Single-user optimization: local-first with optional sync
- Competitive clarity: present clear scores and progress, not encouragement

---

## DATA MODEL

Each practice entry contains:

```js
{
  id: string,           // "2025-09-23-sleep-wake"
  date: string,         // "2025-09-23"
  domain: string,       // "sleep"|"fitness"|"mind"|"spirit"
  aspect: string,       // "wake"|"rest"|"run"|"strength"|"skill"|"read"|"write"|"stress"|"meditation"
  completed: boolean,
  streak: number,
  mood?: number,        // 1-4 (1 lowest, 4 highest)
  note?: string,
  timestamp: number,
  synced: boolean
}
```

## FIXED DOMAINS & ASPECTS (V1)

The eight practices are fixed in V1. No aspect customization.

- Sleep → Wake, Rest
- Fitness → Run, Strength, Skill
- Mind → Read, Write
- Spirit → Stress, Meditation

---

## DOMAIN SCORING

- Each domain is scored 0–100, calculated as a 7-day rolling average of daily completion percentage for that domain.
- Example: Fitness has 3 aspects; if across the last 7 days the user completed 12 of 21 possible aspect-days, Fitness score = (12/21) * 100 ≈ 57.
- Crowns: Score ≥ 80 earns a crown for the domain for that quarter or current period.
- Scores are the primary feedback mechanism — clear, numeric, and comparable across domains.

---

## QUARTER/TIME VISUAL

- Show a top-level time/period visualization to orient long-term progress.
- Options to implement: Reservoir (fill-level), Orbital Rings (per-domain ring progress), or Dial (quarterly progress gauge).
- Visual sits in the header: provides at-a-glance sense of current quarter progress and resource (discipline) reservoir.

---

## SHEET SCHEMA

| Timestamp | LocalId | ClientId | Date | Domain | Aspect | Completed | Streak | Type | Mood | Note |

---

## DESIGN SYSTEM

- Tone: factual, direct, competitive — clear metrics and no soft language.
- Visual: bold, uppercase headings, minimal motion, restrained palette.
- Typography:
  - Headline: 28px, bold, uppercase
  - Body: 16px system-ui, medium weight
  - Micro: 12–13px, muted
- Color tokens:
  - Background: #070707
  - Surface: #0f0f12
  - Text: #e6e6e6
  - Muted: #8a8a8a
  - Domain accents (high contrast):
    - Sleep → #1e90ff
    - Fitness → #ff3b30
    - Mind → #7c3aed
    - Spirit → #16a34a
- Motion: minimal transitions (opacity & transform only), no celebratory animations

## SCREEN FLOWS

### Today (Performance Log)

- Header: Quarter/time visual (Reservoir / Orbital Rings / Dial)
- 4 domain cards, each showing fixed aspect toggles (tap-only input)
- No mid-ritual free-form input; quick tap toggles only
- End-of-day capture: optional mood + one-line note (not part of routine logging)

### Review (Weekly Patterns)

- Grid: 7 days × 8 aspects for pattern recognition
- Domain scores displayed alongside each domain (0–100)
- Weekly summary: % complete, longest streak, domain crowns

### Reflect (End-of-Day)

- Mood slider (1–4)
- One-line note
- Save reflection → returns to Today

### Settings

- Sync status ("Last sync at 12:32" / "Local only")
- Export to CSV

---

## TECHNICAL CONSTRAINTS

- Static PWA: HTML/CSS/JS only, no build tools
- Offline-First: IndexedDB + Service Worker outbox
- Sync: Google Apps Script → single Google Sheet
- Target: Pixel 8 (Chrome), PWA installable
- Single-User: One device, one Sheet focus

---

## PRIORITIES (V1)

1. Accurate Domain Scoring (7-day rolling averages + crowns)
2. Fast, frictionless Performance Log (tap-only)
3. Clear Review screen with domain comparisons
4. Reliable sync and export