
# Phase 5N — Living Universe Transition + Realm Embodiment Pass

Goal: stop feeling like five improved screens. Start feeling like one continuous cognitive universe AION moves through with the user. Plus an urgent bottom-chrome fix so the composer/nav/safe-area stop colliding on mobile.

Hard constraints (re-stated): no backend, no DB, no new routes, no new realms, no second canvas, no new providers unless absolutely required, no resurrected dashboards. CSS-first, event-driven, reuse the existing runtime (`OrbView`, atmosphere, `attentionBus`, `worldResidueBus`, `realmIntentBus`, presence/behavior).

---

## Part A — Atmospheric Route Transitions

**New: `src/shellv2/transitions/realmTransitionBus.ts`** (tiny pub/sub, no RAF)
- State: `idle | departing | arriving`, plus `from`, `to`, `energy`, `startedAt`, `durationMs` (default 520ms; 0 if `prefers-reduced-motion`).
- Subscribes to `realmIntentBus`. On intent: set `departing` → after 220ms `arriving` → after total duration `idle`.

**New: `src/shellv2/layers/RealmTransitionLayer.tsx`** (one DOM node, no canvas, no RAF)
- Full-viewport overlay between content and nav (`z = 25`, new token between `chat:20` and `nav:28`).
- Two stacked radial-gradient veils tinted by `from` / `to` realm mood; opacity driven by transition phase via CSS variables only.
- Mounted once in `ShellV2.tsx`.

**Edit `src/shellv2/zindex.ts`** — add `realmVeil: 25`.

**Edit `src/aion/presence/useOrbPresenceBehaviour.ts`** — when transition is `departing`, set behavior to `guiding`; on `arriving`, briefly `resonating`; on `idle`, hand back to realm-default mood. Pull attention focal toward target anchor's last-known position (cached when nav emitted intent).

Result: no white flash, no hard cut, atmosphere darkens then target color emerges, orb leans then settles. Routes still navigate immediately — only visual scrim transitions.

---

## Part B — Realm Mood Contract (single SSOT)

**New: `src/aion/realms/realmMood.ts`**
```ts
export interface RealmMood {
  id: CanonicalSurfaceId;
  hue: { primary: string; accent: string }; // hsl tokens
  presence: OrbBehaviorState;               // default behavior on arrival
  atmosphereIntensity: number;              // 0..1
  navResonance: number;                     // baseline glyphEnergy floor
  transitionTone: 'cool' | 'warm' | 'deep' | 'soft';
  interaction: 'speak' | 'explore' | 'follow' | 'traverse' | 'resonate';
}
export const REALM_MOOD: Record<CanonicalSurfaceId, RealmMood> = { /* … */ };
```

Defaults:
- **chat** — cyan / deep blue, presence `listening`, soft tone, interaction `speak`
- **brain** — indigo / violet, presence `noticing`, deep tone, interaction `explore`
- **journey** — cyan / gold, presence `guiding`, warm tone, interaction `follow`
- **outer-world** — teal / gold over deep space, presence `resonating`, deep tone, interaction `traverse`
- **profile** (Self) — violet / magenta / soft cyan, presence `evolving`, soft tone, interaction `resonate`

Consumers (read-only):
- `RealmTransitionLayer` (veil colors)
- `useOrbPresenceBehaviour` (default state per realm)
- `WorldAtmosphere` (intensity)
- `AionNavDock` (residual energy floor)

No new providers — pure constant table imported where needed.

---

## Part C — Per-Realm Embodiment (one meaningful change each)

Audit fix only — no rewrites.

1. **Chat (`/`, ChatLayer)** — when conversation is empty, suppress the centered diagnostic/intro slab; let orb + atmosphere be primary; first message slides up from composer. Remove any visible "still learning / planning ontology / confidence" lines via grep sweep across `src/components/aurora/**`, `src/components/chat/**`, `ChatLayer.tsx`.
2. **Brain (`BrainPage.tsx`)** — soften room labels (smaller, lower opacity, no chart chrome); rooms render as breathing blurred masses (CSS radial blobs) instead of cards; primary CTA → "Ask AION about this" routes to `/aurora` with pillar context (reuses 5G.1 strategyContext pattern).
3. **Journey (`JourneyView.tsx`)** — replace empty-state CTA stack with a single trajectory line (SVG path) curving from now → next; remove visible diagnostics (priority-needed badges, kind chips) — gate behind `?debug=1`.
4. **World (`OuterWorldHub.tsx` / `WorldRoute.tsx`)** — convert portal grid into landmark cluster: 3–5 anchored glyphs at uneven coordinates, no card backgrounds, labels appear on focus only. No new portals added.
5. **Self (`ProfilePage.tsx`)** — collapse three disconnected cards into one **Identity Triad** layout: AION orb top, DNA helix and Avatar as orbital companions sharing one frame; removes empty post-simplification feel without restoring stat dashboards. Reuses `CanonicalAionModel` + existing DNA/Avatar components.

---

## Part D — Diagnostic Copy Sweep

Grep across `src/` for: `still learning`, `Planning ontology`, `priority-needed`, `confidence:`, `kind:`, `trajectory kind`, debug-style subtitles. For each visible occurrence in user-facing chrome:
- delete entirely, OR
- replace with a short poetic line (≤6 words), OR
- gate behind `import.meta.env.DEV` / `?debug=1`.

No diagnostic text remains visible to normal users.

---

## Part E — URGENT Bottom-Chrome Fix (composer + nav + safe area)

**Z-index fix** (`src/shellv2/zindex.ts`)
```
background: 10
chat:       20
realmVeil:  25   (new)
nav:        32   (was 28 — now ABOVE composer)
composer:   30
chrome:     40
…
```
Nav layer is intentionally above composer because anchors bloom upward over it; closed state has zero anchor footprint, so no obscuring.

**`AionNavDock.tsx`**
- When `visible={false}`: anchors get `display: none` instead of just `opacity:0`, so ghost icons can never bleed through composer underglow. The constellation hint (3-dot) is the only affordance left.
- When `visible={true}`: increase contrast floor — base anchor opacity floor `0.7` (was `0.4`), active gets full glow; labels readable.

**`NavLayer.tsx`**
- Constellation hint sits at `bottom: calc(safe-area + composer-h + 10px)`; when nav opens, hint slides up alongside anchors so they read as one cluster.
- Anchors bottom: `calc(safe-area + composer-h + 32px)` — clearly above composer, never behind.

**`AionComposerDock.tsx`**
- Horizontal margin standardized: `px-4` (was `px-3`); `max-w-[min(640px,100%-32px)]` so it never touches edges on 402px viewport.
- When nav is open, composer gets `data-nav-open="true"` and dims its underglow (opacity 0.25) so anchors above are visually dominant. Composer itself does not move (stability) — anchors lift instead.
- Bottom anchor stays `max(env(safe-area-inset-bottom), 22px)` so it clears browser bottom UI.

**Bottom content fade** (`ChatLayer.tsx`)
- Add a non-interactive gradient mask: bottom 96px fades chat content to background before reaching composer. CSS-only `mask-image: linear-gradient(...)`. Solves "content slammed into composer" feel.

**Acceptance @ 402×716**
- Closed: only composer dock + tiny 3-dot hint. Zero anchor pixels.
- Open: 5 anchors fully visible above composer, labels legible, active anchor glowing, no overlap.
- No icon ghosts behind composer underglow.
- No content text clipped by composer (gradient mask absorbs it).
- Safe-area inset respected; no collision with browser chrome.

---

## Part F — Performance / Canvas Audit

Re-confirm and document in `.lovable/plan.md`:
- Single `SharedOrbStage` canvas (unchanged).
- One atmosphere runtime in `WorldAtmosphere` (unchanged).
- `realmTransitionBus` uses `setTimeout` only — no RAF.
- `RealmTransitionLayer` is one DOM node with CSS variable transitions — no JS animation.
- No new global providers (mood table is a const; bus is a singleton).
- Orb continuity = state changes on existing presence runtime, no new loop.

---

## Files Changed (estimate)

**New (3)**
- `src/shellv2/transitions/realmTransitionBus.ts`
- `src/shellv2/layers/RealmTransitionLayer.tsx`
- `src/aion/realms/realmMood.ts`

**Edited (≈10)**
- `src/shellv2/zindex.ts` (+`realmVeil:25`, `nav:32`)
- `src/shellv2/ShellV2.tsx` (mount `RealmTransitionLayer`)
- `src/components/aion/ui/AionNavDock.tsx` (display:none when hidden, opacity floor)
- `src/shellv2/layers/NavLayer.tsx` (lifted anchor bottom, hint coordination, cache anchor focal for orb continuity)
- `src/components/aion/ui/AionComposerDock.tsx` (margins, nav-open dim, max-width clamp)
- `src/shellv2/layers/ChatLayer.tsx` (bottom gradient mask, suppress empty diagnostic slab)
- `src/aion/presence/useOrbPresenceBehaviour.ts` (transition-aware behavior + realm default)
- `src/pages/BrainPage.tsx` (label softening, blob masses, Ask-AION CTA)
- `src/pages/JourneyView.tsx` (trajectory line, gate diagnostics)
- `src/pages/OuterWorldHub.tsx` (landmark cluster, drop card chrome)
- `src/pages/ProfilePage.tsx` (Identity Triad layout)
- diagnostic-copy sweep across `src/components/aurora/**`, `src/components/chat/**`

---

## Sub-phase order

5N.1 transitions (bus + layer + zindex + mount)
5N.2 realm mood contract
5N.3 orb continuity wiring
5N.4 URGENT bottom-chrome fix (composer + nav + mask + display:none)
5N.5 per-realm embodiment (Chat → Brain → Journey → World → Self)
5N.6 diagnostic copy sweep
5N.7 audit pass + `.lovable/plan.md` update

---

## Recommended next phase

**5O — World Becoming**: convert each realm into a true cognitive world (per-world ontology consumed by atmosphere + orb behavior + landmark layout), now that the transition spine, mood contract, and embodiment cleanup are in place.
