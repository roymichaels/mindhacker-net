

## Problem

The Overview tab keeps getting rebuilt with task lists, progress bars, numbered task items, domain breakdowns, and statistics — the exact opposite of what you've asked for. You want a **pure CIA-style motivational field briefing**: narrative text, no data grids, no task lists, no progress bars.

## What Gets Removed (lines 328-460)

- **Today's Agenda task list** (numbered items with emojis, durations, checkmarks)
- **Domain breakdown pills** (vitality 2/3, focus 1/2, etc.)
- **Progress bar** with percentage
- **"Remaining tasks" stats line**
- **CTA "Switch to Mission Control"**

## What Stays

- Phase roadmap (top — interactive milestones, already approved)
- Classification badge (ACTIVE OPERATION / FINAL WINDOW)
- Directive quote (rotating motivational line)
- Current Mission hero card (title + pillar only, no stats)

## What Gets Added (replacing removed sections)

All narrative, zero data:

1. **"Field Assessment"** — 2-3 sentences of tactical prose about today's strategic context. Dynamic based on current pillar/focus area. Written like a CIA morning brief, not a to-do list. E.g.: *"Today's theater centers on Vitality. Your body is the vehicle for every mission that follows. Neglect it and all other operations degrade."*

2. **"Operational Doctrine"** — A short, punchy rule of engagement tied to the current focus. E.g.: *"No negotiation with comfort. Execute before the mind builds its case."*

3. **"Intelligence Note"** — A rotating deep insight/quote relevant to the pillar. Not generic motivational poster quotes — sharp, strategic, agent-style.

4. **"Commander's Directive"** — A closing 1-liner. Authoritative, final. Like a handler signing off.

All content will be pillar-aware (using the `FOCUS_INTEL` / `PILLAR_VIS` mapping) so the briefing feels personalized to whatever domain the current task belongs to.

## Technical Details

- **File**: `src/components/play/TodayOverviewTab.tsx`
- Strip out `todayActions.map(...)`, `domainSummary`, progress bar, CTA sections
- Add new content blocks as styled `<div>` elements with icons (`Shield`, `Eye`, `Lock`, `Crosshair`)
- All text arrays (field assessments, doctrines, intelligence notes) keyed by pillar with HE/EN variants
- No numbered lists, no `x/y` counters, no percentage displays

