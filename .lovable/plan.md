
# MindOS — Adaptive Orchestration Layer (AOL)

The goal is not to remove pillars, missions, FM, DNA, Warrior, hypnosis, gamification, memory graph, etc. They stay. We add a thin **state orchestration layer** above them so AION decides which systems surface, when, how loud, and how many at once. The user stops navigating a dashboard and starts inhabiting an environment that reshapes itself.

This plan defines: the state engine, the environment states, the contextual surface rules, AION as conductor, and the migration path that preserves all current backend depth.

---

## 1. Core mental model

Today: `User → Navigation → Page → System`
Target: `User → Intent/Signal → AION Orchestrator → Environment State → Surfaced Systems (as artifacts)`

Three layers:

```text
┌───────────────────────────────────────────────┐
│ ENVIRONMENT LAYER  (what the user feels)      │  Calm / Focus / Execute / Reflect / Recover / Explore / Social / Sleep
├───────────────────────────────────────────────┤
│ ORCHESTRATION LAYER  (AION + state engine)    │  picks state, picks surfaces, picks intensity
├───────────────────────────────────────────────┤
│ SYSTEMS LAYER  (unchanged)                    │  pillars, missions, tactics, FM, DNA, hypnosis, XP, energy, warrior, memory graph, community, study, planner
└───────────────────────────────────────────────┘
```

Nothing is deleted. The Systems Layer keeps every table, RPC, and module. The Environment Layer becomes the only thing the user sees by default.

---

## 2. The State Engine

### 2.1 Inputs (signals)

The engine subscribes to existing signals — no new biology required:

- **Explicit intent**: latest user utterance to AION ("I'm overwhelmed", "let's dominate today", "I need to think").
- **Temporal**: local IANA time, day phase (dawn/morning/work/evening/night), day-of-week, time-since-last-session.
- **Execution state**: open `action_items`, mission progress, streaks, missed days, current campaign tier.
- **Energy / vMOS / XP**: current energy bucket, recent XP velocity, last 24h activity density.
- **Emotional proxies**: sentiment of last N AION turns, response latency, message length trend, abandoned sessions, hypnosis usage frequency.
- **Cognitive load proxy**: number of open loops (incomplete actions + unread artifacts + active campaigns).
- **DNA / Warrior tier**: identity profile, current performance engine focus.
- **Constraints**: biological/willingness flags from the constraint-aware brain.

### 2.2 Output

A single object the entire UI subscribes to:

```ts
type EnvironmentState = {
  mode: 'calm' | 'focus' | 'execute' | 'reflect' | 'recover' | 'explore' | 'social' | 'sleep';
  intensity: 0 | 1 | 2 | 3;            // visual + interaction density
  emotionalTone: 'low' | 'neutral' | 'charged';
  cognitiveBudget: 'minimal' | 'normal' | 'expanded';
  primarySurface: SurfaceId;            // the one artifact that matters now
  secondarySurfaces: SurfaceId[];       // 0–2 supporting artifacts, collapsed
  hidden: SurfaceId[];                  // explicitly suppressed (chrome, gamification, etc.)
  orb: { size, motion, hue, breath };   // AION orb behavior
  reason: string;                        // human-readable AION rationale
  ttl: number;                           // how long this state holds before re-evaluation
};
```

### 2.3 Engine architecture

```text
signals → SignalAggregator (client) ──► state hash
                                       │
                                       ▼
                       ┌───────────────────────────────┐
                       │  Orchestrator (edge function) │  AION reasoning + rules
                       │  google/gemini-3-flash-preview│  structured tool output
                       └───────────────────────────────┘
                                       │
                                       ▼
                       EnvironmentState (cached, realtime)
                                       │
                                       ▼
                  EnvironmentProvider (React context)
                                       │
        ┌──────────────┬───────────────┼───────────────┬──────────────┐
        ▼              ▼               ▼               ▼              ▼
       Orb        Composer       SurfaceHost      ChromeGate      MotionLayer
```

Two-tier evaluation to stay cheap:
- **Fast tier (client, deterministic rules)**: time-of-day, energy level, open-loop count, last intent keyword. Recomputes on every signal change. Handles 90% of transitions.
- **Slow tier (AION via edge function)**: invoked only on (a) explicit emotional utterance, (b) state ambiguity, (c) every N minutes for drift correction. Returns structured `EnvironmentState` via tool calling.

State is persisted to a new `environment_states` table for history, replay, and adaptive learning — but is never the source of truth on reload (we recompute on session start).

---

## 3. The eight Environment States

Each state is a *psychological room*, not a page. Same Systems Layer, different curation.

| State | Trigger examples | Primary surface | Secondary | Hidden | Orb |
|---|---|---|---|---|---|
| **Calm** | "overwhelmed", high cognitive load, low energy | Hypnosis/audio artifact | One breathing protocol | XP, streaks, FM, warrior, tactics | Large, slow breath, cool hue |
| **Focus** | "deep work", calendar block, focus session start | Single tactic timer | Optional ambient audio | All chrome, all nav, notifications | Small, steady, dim |
| **Execute** | "let's dominate", morning + open actions | Today action stack | Tactical schedule | Reflection, study, community | Medium, kinetic, warm |
| **Reflect** | Evening, post-mission completion, "how did I do" | Conversation w/ memory graph artifact | DNA delta, journal | Execution chrome, FM | Medium, gentle pulse |
| **Recover** | Streak break, missed days, low energy + low sentiment | AION compassionate brief | Light recovery protocol | Tiers, leaderboards, XP loss | Large, soft, slow |
| **Explore** | Idle browsing, "show me what's new" | Discovery feed | FM, community threads | Today, missions | Curious motion |
| **Social** | Community ping, leaderboard event, peer message | Feed/threads | Leaderboard widget | Tactics, planner | Medium, social hue |
| **Sleep** | Late night local time | Wind-down audio | Tomorrow preview | Everything else | Minimal, fading |

Rule: **at most one primary + two secondary surfaces visible.** Everything else is one tap away via the AION composer ("show me my warrior status") or the persistent menu, but nothing else paints pixels.

---

## 4. Surfaces, not pages

Every existing hub becomes a **Surface**: a self-contained component that renders inside chat (artifact mode) or full-screen (immersion mode), but never as a permanent tab.

```ts
interface Surface {
  id: SurfaceId;            // 'hypnosis', 'today', 'tactics', 'fm', 'dna', 'warrior', 'memory', ...
  modes: ('artifact'|'immersive'|'mini')[];
  resolve(state, context): SurfaceProps | null;
  cognitiveWeight: 1 | 2 | 3;   // engine respects cognitive budget
}
```

Routing rules:
- AION decides → `SurfaceHost` mounts the chosen surface in the chosen mode.
- A user invocation ("open my pillars") → still goes through orchestrator so state stays coherent (orchestrator may answer "yes, but in mini mode — you're in Calm").
- Deep links from notifications carry an *intended surface*, not a route. Orchestrator may honor or defer ("let's do this after your wind-down").

---

## 5. AION as conductor

AION moves from peripheral widget → central nervous system. It does three jobs:

1. **Converse** (existing).
2. **Orchestrate** — emit `EnvironmentState` updates via the edge function.
3. **Compose interfaces** — decide which Surface to render inside its own message ("Here's tonight's wind-down →" + Hypnosis surface inline).

Implementation notes:
- Orchestrator function: `supabase/functions/aion-orchestrate/` — takes signals + last 6 messages + structured tools (`set_environment_state`, `surface_artifact`, `dim_chrome`, `defer_notification`).
- Uses tool calling for structured `EnvironmentState`. Streaming chat continues to use the existing `chat` function; orchestration is a separate fire-and-forget call.
- Continuity chat per-pillar logic is preserved; orchestrator reads it but does not duplicate it.

---

## 6. Component behavior by state

A small contract every chrome/component implements:

```ts
useEnvironment() → { mode, intensity, hidden, ... }

// Example: bottom tab bar / side menu
if (intensity <= 1 || hidden.includes('nav')) return null;
if (mode === 'focus' || mode === 'sleep') return null;
return <Menu compact={intensity === 2} />;
```

Concrete bindings:
- **Gamification chrome (XP, streak, energy ring)**: visible only in `execute`, `explore`, `social`. Hidden in `calm`, `focus`, `reflect`, `recover`, `sleep`.
- **AuroraDock / quick actions**: 4 chips → 2 AI-chosen verbs that match `mode`.
- **Hub accent colors**: replaced by a single `--accent` driven by `mode` (warm in execute, cool in calm, neutral in reflect).
- **Motion**: `MotionLayer` reads `intensity` → animation duration multiplier (calm = 1.6x, focus = 0.4x).
- **Notifications**: gated through `defer_notification` — Calm/Focus/Sleep silently queue; Execute/Social pass through.
- **Composer placeholder**: rotates by mode ("What's heavy right now?" / "What are we attacking first?" / "How did today land?").

---

## 7. Transitions (the "magic")

Transitions are first-class. The user should *feel* the room change.

- Single shared `MotionLayer` (Framer Motion) wraps SurfaceHost + Orb + Chrome.
- Each state change triggers a choreographed sequence: orb morph → chrome fade/scale → surface crossfade → composer placeholder retype.
- Duration scales with `intensity` delta. Calm↔Focus is slow (900ms), Execute↔Social is snappy (250ms).
- AION narrates the transition in one short line ("Dimming the room. Just us and your breath."). Optional voice via existing TTS cache.

---

## 8. Orb behavior system

The orb becomes the always-on signal of state. One renderer, four parameters:

```ts
type OrbState = {
  size: 0.4 | 0.7 | 1.0 | 1.4;   // viewport-relative
  motion: 'still' | 'breath' | 'pulse' | 'kinetic';
  hue: number;                    // shifts with mode
  glow: 0 | 1 | 2;                // ambient bloom
};
```

Bindings: Calm → 1.4 / breath / cool / 2. Focus → 0.4 / still / dim / 0. Execute → 1.0 / kinetic / warm / 1. Recover → 1.4 / breath / soft / 1. Sleep → 0.4 / breath / cool / 0 fading.

Orb is also the universal *invocation target*: tap → composer; long-press → "what should I be doing right now?" (orchestrator returns a state + one sentence).

---

## 9. Cognitive load math (no capability removed)

We never delete a system; we gate it by `cognitiveBudget`.

- `minimal`: 1 surface, no chrome, no badges, no counters.
- `normal`: 1 primary + up to 2 secondary, compact chrome, single accent.
- `expanded`: full menu, all hubs accessible from menu, gamification chrome on.

Anything not surfaced is still reachable via:
1. Composer ("open FM", "show my warrior").
2. The hamburger / side menu (already built) — full system index lives there, always.
3. Notifications (subject to `defer_notification`).

This is the key promise: **complexity is hidden, never removed**.

---

## 10. Focus Mode — the first fully adaptive state to ship

Focus is the smallest, highest-leverage proof of the framework.

What it does:
- Triggered by: explicit ("focus"), tactic timer start, calendar focus block, or AION suggestion when an open tactical action is due.
- Hides: header, side menu, AuroraDock, gamification chrome, all notifications.
- Surfaces: one tactic card (title + timer + single "done" affordance), optional ambient audio toggle, orb (small, still).
- Composer collapses to a tiny pill ("tap to talk to AION").
- Exit: timer end, explicit "exit focus", or AION detection of disengagement (>N minutes idle).
- Transition: 700ms dim-and-collapse; reverse on exit with a one-line debrief from AION ("That was 25 clean minutes. Logged to Warrior.").

Focus Mode validates: state engine, ChromeGate, SurfaceHost immersive mode, orb binding, transition choreography, AION debrief. Everything else inherits the same pattern.

---

## 11. Migration path (non-destructive)

Phase 0 — scaffolding (no UX change):
- Add `EnvironmentProvider`, `useEnvironment()`, `SignalAggregator`, `ChromeGate` wrapper, `MotionLayer`. All default to current behavior (`mode: 'execute'`, `intensity: 3`, nothing hidden). Zero visual diff.

Phase 1 — orchestrator:
- New edge function `aion-orchestrate`. Returns structured `EnvironmentState` via tool calling. Wire to fast-tier rules client-side; slow-tier on explicit emotional utterances only.
- New `environment_states` table (history + replay).

Phase 2 — Focus Mode:
- Implement the single state end-to-end as the proof. Ship behind a feature flag.

Phase 3 — Calm + Recover:
- Highest emotional value, lowest risk (mostly subtractive UI). Bind hypnosis/audio surfaces to artifact mode inside AION chat.

Phase 4 — Execute + Reflect + Sleep:
- Bind Today, tactics, memory graph, wind-down to the engine. Replace per-hub accent colors with `mode`-driven `--accent`.

Phase 5 — Explore + Social:
- Bind FM, community, leaderboard. Notifications gated by `defer_notification`.

Phase 6 — Adaptive learning:
- Use `environment_states` history + outcomes (action completion, session length, sentiment delta) to tune the rules and orchestrator prompts. No model retraining needed; just prompt-side few-shot from the user's own history.

At every phase: the Systems Layer is untouched. A user who wants the old experience opens the side menu and everything is still there.

---

## 12. What stays exactly as it is

- All Supabase tables, RPCs (`award_unified_xp`, etc.), planning pipeline, action_items SSOT, DNA logic, Warrior evolution, Aurora context engine, TTS cache, mission guide generation, structured practice, FM tokenomics, community architecture, Web3Auth, subscription tiers, edge function auth, planning aggregation.
- Side menu (`AppSideMenu`) as the always-available full system index.
- Existing AION chat, continuity per pillar, memory graph.
- Hebrew linguistic standards, RTL, BiDi rules.

---

## 13. Technical surface (for implementation)

New:
- `src/orchestration/EnvironmentProvider.tsx`
- `src/orchestration/useEnvironment.ts`
- `src/orchestration/SignalAggregator.ts`
- `src/orchestration/rules/fastTier.ts`
- `src/orchestration/SurfaceHost.tsx` + `surfaces/*` registry
- `src/orchestration/ChromeGate.tsx`
- `src/orchestration/MotionLayer.tsx`
- `src/orchestration/orb/useOrbState.ts` (binds existing renderer)
- `supabase/functions/aion-orchestrate/index.ts`
- Migration: `environment_states` table (user_id, mode, intensity, reason, signals jsonb, created_at) with RLS.

Modified (gated, no behavior change until flagged):
- `DashboardLayout` wraps children in `EnvironmentProvider` + `MotionLayer`; existing chrome wrapped in `<ChromeGate id="header"/>`, `<ChromeGate id="nav"/>`, `<ChromeGate id="gamification"/>`.
- `HubModalHost` registers each hub as a Surface.
- AION composer reads `mode` for placeholder + accent.

---

## 14. Success criteria

- A user saying "I'm overwhelmed" sees the room change in <1s: chrome dims, orb grows, hypnosis appears inline. No deletion of features.
- Focus Mode produces measurable session length increase and zero visible chrome.
- Cognitive surfaces visible at any moment ≤ 3.
- 100% of existing systems remain reachable in ≤2 taps via menu or composer.
- Orchestrator cost stays bounded: slow-tier invocations ≤ ~6/user/day on average.
