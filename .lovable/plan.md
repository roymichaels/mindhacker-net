# Brain page — native mobile UX pass

UX-only. No architecture, no data changes, no new shell.

## What's wrong now

- ChromeLayer (Menu · "MindOS" · History) overlaps the in-view "Brain View" header → two title rows fighting at the top.
- BrainView header crams: title + counts + "Build my brain" + "Show weak" pills on one row at 402px.
- Layer filter chips sit right under the header → busy desktop strip.
- Empty state is a generic boxed card, no premium feel.
- Graph canvas is wrapped as a bordered web card (`rounded-2xl border bg-background/40`).

## Fix

### 1. `BrainPage.tsx`
- Bump top padding to clear ChromeLayer cleanly: `pt-16` → use safe-area aware spacing, no overlap with the 12-tall fixed header.
- Drop horizontal `px-1`, use `px-4` for native feel.

### 2. `BrainView.tsx` — restructure header
Replace the cramped row with a vertical iOS-style block:

```text
┌────────────────────────────┐
│ Brain                      │ ← text-2xl font-semibold
│ AION is building your map  │ ← text-xs text-muted-foreground
│                            │
│ ⟳ Build / Refresh brain    │ ← single full-width primary button
└────────────────────────────┘
```

- One primary action button only. Label flips to "Refresh brain" once nodes > 0; "Building…" while pending.
- Remove "Show weak" + the "All / Surface / Pattern / Deep" desktop filter strip from the top.
- Move filters into a compact horizontal pill row placed **below the graph**, scrollable, with snap. "Show weak" becomes a small toggle chip in that same row.
- Counts ("Understanding 42% · 28 nodes") move to a tiny line under the subtitle, muted, no chip styling.

### 3. Empty state
- Replace the boxed empty card with a centered column:
  - Soft circular brain glyph (use `lucide-react` `Brain` icon at 64px inside a 96px circle with `bg-primary/10`, `backdrop-blur`, `ring-1 ring-primary/20`). No animation library — a simple Tailwind `animate-pulse` on the ring is enough for "premium feel".
  - H2: "Your brain is still forming"
  - Subtitle: "AION will build it from your conversations, journals, goals and history."
  - Button: "Build my brain" (rounded-2xl, primary fill).
- Vertically centered in the available viewport (`min-h-[60vh] flex items-center justify-center`).

### 4. Graph container
- Drop the bordered card framing on `BrainGraphCanvas` outer div: change to `bg-transparent`, no border. Keep only the inner SVG. This makes it feel full-bleed.
- Reduce padding around it; let it breathe edge-to-edge.

### 5. Sections (`BrainSections.tsx`)
- Keep, but soften containers: `border-0 bg-white/[0.03]` instead of `border-border/40 bg-background/40`. Consistent native-card look.

### 6. Chrome
- ChromeLayer already exposes the ShellV2 menu via `overlay.toggle('drawer')`. No changes there — it's the canonical hamburger. Remove **only** the `MindOS` center label so the brain page title doesn't compete with chrome text.

## Files

- **edit** `src/shellv2/layers/ChromeLayer.tsx` — drop the center "MindOS" text (keeps menu + history icons).
- **edit** `src/pages/BrainPage.tsx` — `px-4 pt-16 pb-40`, remove horizontal cramp.
- **edit** `src/features/brain/BrainView.tsx` — vertical iOS header block, single primary button, premium empty state, filters moved below graph.
- **edit** `src/features/brain/BrainGraphCanvas.tsx` — remove outer border/card; transparent container.
- **edit** `src/features/brain/BrainSections.tsx` — soften card chrome to match.

## Out of scope

- No data/RPC/edge function changes.
- No new routes.
- No animation libs.
- No design-system color changes.

## Acceptance

- No two header rows competing at the top.
- One clear "Build / Refresh" CTA.
- Filters live below the graph, not in the header.
- Empty state is centered, calm, branded.
- Graph reads as full-width, not as a card on a page.
- All existing data and click behavior intact.
