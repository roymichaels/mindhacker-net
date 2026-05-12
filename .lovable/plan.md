## Goal

Make MindOS feel like one living OS surface — not a stack of floating menus. Single header, single drawer, single environment switcher, single AION presence.

## Phase 1 — Shell collapse (UX skeleton)

Touch only `DashboardLayout.tsx`, `AppNameMenu.tsx`, `HeaderActions.tsx`, plus two new components.

**Header (mobile + desktop, 56px, no border-shadow stack):**

```
[ ☰ ]            [ MindOS ⌄ ]            [ ◉ AION ]
hamburger        environment sheet       presence button
```

- **Left — Hamburger** → opens new `OSDrawer` (left sheet, 320px, Lovable-style).
- **Center — `MindOSSheet`** → bottom sheet (NOT popover/dropdown) with environments: Home / Focus / Recovery / Night / Work / Custom. Slides up like Lovable's project switcher.
- **Right — `AIONPresenceButton`** → orb-mini that:
  - pulses on listening / speaking / thinking
  - tap = summon AION overlay (chat + voice)
  - long-press = interrupt
  - color = current emotional/environment state

**Removed from header:**
- Profile avatar & dropdown (`AuroraAccountDropdown` out of header)
- `Play` button (move into drawer)
- `Wallet` button (keep only inside FM hub, not global header)
- `AppNameDropdown` nested popover (replaced by MindOSSheet)

**OSDrawer contents (single source of nav):**

```
Home
Journal
Focus
Hypnosis
Learning
Community
Shop
Labs
─────────────
[avatar] Dean
Profile · Settings · Account · Logout
```

Large spacing, icon + label, active route highlighted, no nested groups. Profile pinned to bottom.

**Deletes / consolidations:**
- `AppNameMenu` Popover → replaced (keep file, gut internals).
- `HubModalHost` keeps working (drawer items still call `openHub`).
- `AuroraDock` stays for now but visibility flipped: hidden whenever `AIONPresenceButton` overlay is open (avoid double-orb).

## Phase 2 — Orchestrator Brain (priority dependency)

Everything below depends on this. Build it first.

**New edge function `aion-brain`** (separate from `aion-orchestrator` skills dispatcher):

- Input: `{ user_id, trigger: 'message'|'route_change'|'idle'|'signal', payload }`
- Reads recent `aion_signals` (intent, emotion, mode, route, time-of-day)
- Produces a single `BrainDecision`:
  ```ts
  {
    presence: { state: 'idle'|'listening'|'thinking'|'speaking'|'focus'|'recovery', intensity: 0..1, hue: number },
    environment: 'home'|'focus'|'recovery'|'night'|'work',
    suggestion?: { kind: 'reflect'|'reset'|'plan'|'breathe'|'log', label, action },
    nudge?: { text, urgency }
  }
  ```
- Cached per user for 10s, fires on every signal (debounced).
- Uses `nvidia/nemotron-nano-9b-v2:free` with Gemini-flash-lite fallback (matches existing skill stack).

**Client side:**
- New `useAionBrain()` hook subscribed to `aion_signals` realtime + local route/typing events.
- Decision broadcast via existing `AionDecisionContext` — extended with `presence`, `environment`, `suggestion` slots.

## Phase 3 — Presence Layer (orb becomes the OS)

`AIONPresenceButton` + global `AIONPresenceOverlay`:

- Orb shader reads `presence.state/intensity/hue` from brain decision.
- States:
  - idle: slow breathe
  - listening: outer ring pulse
  - thinking: internal swirl (NEVER show text/spinner with reasoning)
  - speaking: waveform halo synced to TTS amplitude
  - focus: tight, bright
  - recovery: soft, warm
  - night: dim, cool
- Overlay is full-screen scrim with chat + voice. Replaces today's separate dock + chat-area pattern when summoned.
- Reuses `useAuroraChat` (already streaming + sanitized).

## Phase 4 — Adaptive UI / Environment Layer

Drive theme + density from `environment` field:

- Map environments to existing `useRouteTheme` tokens (extend `routeThemes.ts`).
- Body data-attr `data-env="focus"` etc. → CSS vars adjust spacing, glow, background.
- No layout shifts, no modal popups — purely token-level.

## Phase 5 — Implicit Intent (kill the mode picker)

- Remove visible mode-picker in journal/reflection entry points (`JournalTab`, `JourneyChatDock` mode tabs).
- All input goes through chat. Brain calls existing `aion-orchestrator` skills (`intent.classify`, `emotion.detect`, `journal.extract`, `mode.select`) — already built last turn.
- Skills' results trigger silent side-effects: journal row insert, emotional-timeline write, suggestion surface inside AION overlay (not as a form).

## Phase 6 — Anti-leak production rules (hard guardrail)

Add `src/config/productionRules.ts`:

```ts
export const PRODUCTION_RULES = {
  hideReasoning: true,
  hideSystemThinking: true,
  hidePromptParsing: true,
  hideMemoryInspection: true,
  streamOnlyFinalAnswer: true,
};
```

- Server: keep existing `sanitizeStream.ts` (already deployed). Add a final-text guard that drops any chunk before the first non-meta token if `streamOnlyFinalAnswer`.
- Client: `useAuroraChat` checks the flag and refuses to render any field other than `delta.content`. No `reasoning`, no `tool_call`, no `analysis` ever reaches `<ChatMessage/>`.
- AION presence "thinking" state shows orb animation only — no text spinner with system messages.

## Technical notes

- New files:
  - `src/components/shell/OSDrawer.tsx`
  - `src/components/shell/MindOSSheet.tsx`
  - `src/components/shell/AIONPresenceButton.tsx`
  - `src/components/shell/AIONPresenceOverlay.tsx`
  - `src/hooks/aion/useAionBrain.ts`
  - `src/config/productionRules.ts`
  - `supabase/functions/aion-brain/index.ts`
- Modified: `DashboardLayout.tsx`, `AppNameMenu.tsx` (replaced by sheet trigger), `HeaderActions.tsx` (slim to AION button), `AionDecisionContext.tsx`, `routeThemes.ts`, `useAuroraChat.tsx`, `aurora-chat/index.ts` + `sanitizeStream.ts`.
- Removed from header tree: `AuroraAccountDropdown`, header Play/Wallet, nested `AppNameDropdown` popover, duplicate hub menus.
- Migration: extend `aion_signals` with optional `decision_id` column for brain audit (no RLS change — same user-owned policy).

## Order of execution

1. Phase 6 guardrails (small, prevents new leaks while we refactor).
2. Phase 2 Orchestrator Brain + decision context.
3. Phase 1 shell collapse (drawer + sheet + presence button).
4. Phase 3 presence orb wired to brain.
5. Phase 4 environment theming.
6. Phase 5 implicit-intent cleanup of mode pickers.

## Out of scope (this plan)

- Memory graph rewrite, hypnosis content, learning OS curriculum, marketing landing.
- Voice TTS engine changes (already cached + sanitized).
- Profile editor redesign — only its location moves.

Approve to start with Phase 6 + Phase 2 in the first build pass.
