# 💡 Key Insights & Design Decisions

## Original Vision Summary

### Core Innovation
**drop** was conceived as a fundamental reimagining of habit tracking:
- **Identity Practice**: Focus on *who you become* vs. *what you achieve*
- **Quarterly Rhythm**: 90-day commitments resist frequent changes
- **Resource Allocation**: Smart distribution of limited time/energy
- **Minimal Friction**: Daily logging in seconds, not minutes

### Resource Model Breakthrough
The insight that different life domains need different tracking approaches:
- **Sleep** = Identity embodiment (wake/sleep rhythm)
- **Fitness** = Resource allocation (time/energy management)
- **Reading/Writing** = Tiered practice (flexible frequency)
- **Meditation** = Instance tracking (presence over perfection)
- **Burnout** = State awareness (1-5 scale, no targets)

### Design Philosophy
- **≤15 words per screen** — every word costs attention
- **Graphics-first UI** — bars, waves, rings over text
- **One action per card** — clear, focused interactions
- **Domain colors** — Sleep=blue, Fitness=red, Mind=yellow, Spirit=green

### Technical Vision
- **Browser-native** — no build tools, open HTML directly
- **Vanilla JavaScript** — modular, maintainable architecture
- **LocalStorage** — privacy-first, offline-capable
- **Mobile-first** — Pixel 8 baseline, touch-optimized

### User Experience Insights
- **Quarterly reset ritual** — meaningful transition ceremonies
- **Daily presence logging** — minimal friction, maximum consistency
- **Adaptive reflection** — visuals that match user style
- **Burnout awareness** — trend tracking, not optimization

### Success Metrics
- **Daily engagement** through frictionless design
- **Quarterly completion** through sustainable commitments
- **Identity formation** through consistent practice
- **Reflection depth** through adaptive visuals

---

## Implementation Notes

### Current Status (September 2025)
- ✅ **Core prototype** with full quarterly cycle
- ✅ **Resource model** implementation
- ✅ **Mobile-first** responsive design
- ✅ **Browser-native** architecture
- 🔄 **Enhanced onboarding** with button-based selections
- 🔄 **UX polish** and visual feedback improvements

### Key Technical Decisions
- **Modular JS architecture** (config, state, logic, ui, main)
- **Tailwind CSS via CDN** (no build process)
- **LocalStorage persistence** (privacy, offline-first)
- **Touch-optimized interactions** (tap, swipe, hold)
- **Semantic HTML** (accessibility, maintainability)

### Future Considerations
- **Over-allocation warnings** (prevent burnout)
- **Personality-driven onboarding** (adaptive onboarding; formerly explored as OCEAN integration)
- **Reflection export** (Markdown, sharing)
- **Advanced analytics** (trends, insights)

---

*This document captures the key insights that shaped drop's development. Refer to [Original_Vision.md](Original_Vision.md) for the complete foundational philosophy.*