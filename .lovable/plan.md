# Minimal Home — Hard Reset

## Goal

Stop redecorating. Subtract. The authenticated home (`/aurora`) must render at most **6 elements**, never the current stacked dashboard (capability icons, greeting card, metric cards, category pills, services feed, workflow row, multiple AI cards).

Capabilities don't disappear from the app — they only disappear from the *default* home. They reappear contextually when AION detects intent.

## Final homepage composition (in vertical order)

```
┌─────────────────────────────────────┐
│  ·  identity dot · phase            │  ← top: tiny presence row
│                                     │
│                                     │
│            (   ORB   )              │  ← ambient AION, large, centered
│                                     │
│         optional 1-line             │  ← state line, ≤80 chars, no CTA
│                                     │
│   ┌───────────────────────────┐     │
│   │  ONE focus card           │     │  ← single adaptive card, tap=send
│   └───────────────────────────┘     │
│                                     │
│   • business  • fitness  • content  │  ← active-worlds strip (only if any)
│                                     │
│   78% understood · 12d · ↑ calm     │  ← micro indicators row (one line)
│                                     │
│                                     │
│   ┌─────────────────────────────┐   │
│   │  voice  📎  ░ message…   ▶  │   │  ← single composer dock
│   └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

Hard rules:
- Nothing else mounts on `/aurora` by default.
- No grids, no tabs, no lists, no metric cards, no service feed, no capability launcher, no duplicate composer, no floating AION button on this route.
- Empty states collapse fully (no placeholder boxes, no "no items in this category" rows).

## What to remove from the home render path

These must NOT mount on `/aurora` anymore (they remain reachable elsewhere — MindOS sheet "More", direct routes, or summoned by AION):

- Top capability icon row (the 5 colored tiles in the screenshot)
- Big greeting card with "פתח" button
- 4-up metrics cards (`1%`, `יום 1`, `42`, `15/15`)
- "שירותים / מבצע שיא" services header + "פרסם עם Aurora" creation row
- Category pills (הכל / עיצוב / כתיבה / תרגום / פיתוח / …)
- Workflow row (גאות הפלדה / 7 מסלולים / + הוסף)
- "דבר עם התוכנית שלך" secondary composer
- Services feed list (היפנוזה יומית, בסיס, חיוניות rows)
- Floating `AIONPresenceButton` (already a duplicate when home IS AION)
- Auto-emitted artifacts on mount (artifact layer stays, but starts empty)

## What stays / what's new

| Surface | Component | Notes |
|---|---|---|
| Orb | existing `PersonalizedOrb` | larger (≈220–280px), centered, no chrome |
| State line | reuse `useAmbientContext().understanding` | 1 line, muted, no tap action |
| Focus card | new `FocusCard` (1 file) | renders the single highest-priority signal from `useAmbientContext().nextStep` (or focus). Tap = send prompt |
| Active worlds strip | new `ActiveWorldsStrip` | reads only currently-active contexts (business/fitness/etc. that the user has already engaged); hidden entirely when empty. Tap = open that world |
| Micro indicators | new `PresenceIndicators` | one row: understanding %, streak, emotional trend, current phase. Plain text, no cards, no progress bars |
| Composer dock | existing `GlobalChatInput` wrapper from `AuroraPage` | unchanged, single instance |

Top header stays as the global slim header (already minimized). MindOS sheet stays as the only launcher, behind the menu icon.

## File-level changes

1. **`src/pages/AuroraPage.tsx`** — replace the body with a new `<MinimalHome />` for the non-assessment, non-interactive path. Keep the `AIONNamingGate` wrap, the assessment branch, the `interactive` flag branch, and the existing fixed-bottom composer dock untouched.

2. **`src/components/aurora/home/MinimalHome.tsx`** *(new)* — composes: `PresenceTopRow` · `PersonalizedOrb` · state line · `FocusCard` · `ActiveWorldsStrip` · `PresenceIndicators`. Pure layout; no data fetching beyond the hooks below.

3. **`src/components/aurora/home/FocusCard.tsx`** *(new)* — single rounded card, glass surface, ≤2 lines text + chevron. Source: `useAmbientContext().nextStep` (already exists). Tap → `sendMessageRef.current?.(prompt)`.

4. **`src/components/aurora/home/ActiveWorldsStrip.tsx`** *(new)* — horizontal scroll row of dot+label chips. Source: a new selector `useActiveWorlds()` that reads only worlds with recent activity (last conversation/artifact/mission within N days). Returns `[]` → component renders `null`.

5. **`src/hooks/aurora/useActiveWorlds.ts`** *(new)* — thin hook over existing world/domain registry; filters by recent activity. No new tables.

6. **`src/components/aurora/home/PresenceIndicators.tsx`** *(new)* — one-line muted text row built from existing signals (understanding %, streak, emotional trend, current phase). No icons larger than 12px, no bars.

7. **`src/components/aurora/home/PresenceTopRow.tsx`** *(new)* — tiny identity dot + current phase label, top-left/top-right depending on `isRTL`.

8. **`src/components/aion/InteractiveAIONHost.tsx`** — confirm it already suppresses the floating AION button on `/aurora`; if not, add the route check.

9. **Audit pass (no edits unless found mounting on `/aurora`):** `AuroraWelcome.tsx`, `AmbientContextCard.tsx`, any home dashboard widgets, services-feed components, capability-launcher grids, "פרסם עם Aurora" creation row, secondary "דבר עם התוכנית שלך" composer. Anything still rendered on `/aurora` gets removed from that route only (kept as a component for other routes if used elsewhere).

No backend, schema, RLS, or edge-function work. No new dependencies.

## Acceptance criteria

- Fresh `/aurora` (no assessment, no `?ff_interactive_mode=1`) shows: orb, ≤1 state line, exactly one focus card, optional worlds strip, one micro-indicators line, one composer dock. Nothing else.
- DOM check: no element from the removal list is mounted on `/aurora`.
- Worlds strip is absent (not empty-bordered) when no active worlds.
- Focus card never shows more than one entry; tapping sends a chat message.
- All capabilities removed from the home are still reachable via MindOS sheet → "More capabilities" or by asking AION in chat.
- No floating AION button overlaps the orb on `/aurora`.
- Other routes (`/journal`, `/free-market`, `/learn`, business/fitness workspaces, etc.) are visually unchanged.

## Out of scope

- Redesigning the composer itself.
- Building new "intent → workspace" auto-summoning logic (the strip already reflects whatever is active; deeper auto-generation is the next phase).
- Touching the public marketing `/` page.
