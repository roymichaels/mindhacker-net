# AION Orb Orchestration Redesign

Make AION the orchestrator of the app — one presence, one composer, one state engine that adapts the entire UI. No features removed; the orb decides when they appear.

This is large. Plan is phased so each phase ships a usable state and the next builds on it.

## Current state (what's wrong)

Two parallel AION surfaces compete on every screen:

- **`AIONFloatingWidget`** (`src/components/orb/AIONFloatingWidget.tsx`) — mounted globally in `App.tsx`, opens `AIONChatPanel` (its own modal with its own bubbles, input, naming gate, journal/plan/beliefs modals).
- **`AuroraDock` + `AuroraFloatingOrb`** (`src/components/aurora/`) — separate draggable orb that opens a full-screen dock with `AuroraChatBubbles` + `GlobalChatInput`.

Both render their own orb, both have their own open/close state, both render their own composer. On top of that: `AuroraVoiceMode`, `VoiceModeButton`, `VoiceNoteButton`, `AuroraSearchBar`, dock orb (small), floating orb (large) — AION is fragmented across 5+ entry points.

There is no environment/state engine. `ChromeVisibilityContext` only toggles header/bottom-bar; nothing tracks AION's mode (idle/listening/thinking/etc.) or the active environment (focus/hypnosis/recovery/etc.).

## Target architecture

```text
AIONEnvironmentProvider  ──►  drives every shell decision
   ├── environment: neutral | focus | recovery | planning | hypnosis | execution | study | market | social
   ├── aionState:   idle | listening | thinking | speaking | guiding | immersive
   ├── chromeLevel: full | reduced | minimal | hidden
   ├── density:     calm | normal | tactical
   └── activeArtifact: { type, id } | null   (plan card / mission / hypnosis session / focus timer)

ProtectedAppShell
   ├── Header                       ← visibility from chromeLevel
   ├── <Outlet/> (page content)     ← density + environment classes on root
   ├── BottomTabBar                 ← visibility from chromeLevel
   └── AIONPresence (single mount)  ← THE orb. Owns: idle button, composer, voice, quick-state panel, full presence
        ├── AIONOrb (state-driven aura)
        ├── AIONComposer (orb inside the input)
        ├── AIONQuickStatePanel (tap)
        ├── AIONVoiceLayer (long-press)
        └── AIONImmersiveSurface (hypnosis/focus full-screen takeover)
```

One context. One mount. State-driven.

## Phase 1 — Unify presence + state engine

**Goal:** kill the duplicate orbs/panels and stand up the environment context. After this phase the app looks similar but all AION interaction flows through one component, and other code can read/write AION state.

1. **Create `src/contexts/AIONEnvironmentContext.tsx`**
   - Fields above (`environment`, `aionState`, `chromeLevel`, `density`, `activeArtifact`).
   - Setters: `setEnvironment`, `setAionState`, `setChromeLevel`, `setDensity`, `setArtifact`, plus `enterImmersive(env)` / `exitImmersive()` convenience helpers that combine state+chrome+density transitions per the orchestration rules.
   - Reads location and resets to `neutral / idle / full / normal` on route change unless a page explicitly opts into a non-default environment.
   - Mount inside `ProtectedAppShell` (above existing providers so the whole shell can react).

2. **Create `src/components/aion/AIONPresence.tsx`** (new home for the orb)
   - Replaces both `AIONFloatingWidget` and `AuroraFloatingOrb`.
   - Renders one of three layouts based on `aionState` + `environment`:
     - **Compact (idle/listening/thinking/speaking)** — orb floats bottom-right above the tab bar, identical position the user is used to (z-88), but visual aura is now driven by `aionState` (see Phase 4).
     - **Composer-attached** — when the dock/composer is open, the same orb instance docks into the left of the composer (no second small orb).
     - **Immersive** — when `environment` ∈ {hypnosis, focus, execution} with `enterImmersive()`, the orb centers on screen and the rest of the shell follows `chromeLevel`.
   - Owns interactions: tap → quick-state panel, long-press (≥350 ms) → voice, swipe-up → expand to full presence, drag (existing behavior preserved).

3. **Single composer**
   - `AIONComposer` wraps the existing `GlobalChatInput` and renders the orb on the leading side. Removes the separate `AuroraDockOrb` and the standalone voice/voice-note buttons from inside the composer chrome — those become orb-state interactions.
   - The header inside `AuroraDock` (top bar with name + mini orb) is removed; the orb in the composer is the only AION mark.

4. **Delete / collapse duplicates**
   - Remove `AIONFloatingWidget` mount from `App.tsx`; delete `AIONFloatingWidget.tsx` and `AIONChatPanel.tsx` (their content — naming gate, journal/plan/beliefs modal triggers — moves into `AIONQuickStatePanel`).
   - Remove `AuroraFloatingOrb` and `AuroraDockOrb`; `AuroraDock` keeps only the chat surface and is rendered *by* `AIONPresence` instead of as a sibling.
   - `VoiceModeButton` / `VoiceNoteButton` stay as primitives but are no longer mounted in the chat top bar — they're invoked by `AIONVoiceLayer`.

5. **Wire existing chat context**
   - `AuroraChatContext` keeps `isDockVisible` / `isChatExpanded` for now (renamed conceptually but not breaking) — `AIONPresence` reads these and reflects them.
   - `AIONEnvironmentContext.aionState` is set to `thinking` while `isStreaming === true`, `speaking` while TTS is playing, `listening` while voice capture is active.

**Done when:** every screen shows exactly one orb; the composer has the orb embedded; tap/long-press/swipe behaviors work; nothing visual is "removed" — the journal/plan/beliefs/voice/chat all still reachable, just through the orb.

## Phase 2 — Quick State Panel + orchestration rules

**Goal:** the orb becomes the command center.

1. **`AIONQuickStatePanel`** (premium compact sheet, opens on tap)
   - Header: `AION` + current state line ("Guiding • Focus" / "Recovering" / "Planning with you").
   - Suggested next action (computed from `environment` + Next-Step Guidance hook): one primary action + 3 secondary chips: `Focus me` / `Calm me` / `Plan with me` / `Review today`.
   - Each action calls `enterImmersive(env)` and dispatches an existing command via `AuroraChatContext.executeCommand` — no new business logic, just routing.
   - Footer: small affordances for Dreams / Gratitude / Plan / Beliefs (today's `AIONChatPanel` quick actions, preserved).

2. **Orchestration rules engine** (`src/lib/aion/environmentRules.ts`)
   - Pure function: `(environment) => { chromeLevel, density, dockMode, suppressedSurfaces[] }`.
   - Implements every rule from the spec:
     - hypnosis → `chromeLevel: hidden`, immersive orb centered, single play surface, dim background, slow animations.
     - focus → `chromeLevel: minimal`, today action surfaced, gamification suppressed.
     - planning → `chromeLevel: reduced`, strategy artifact visible, chat visible.
     - recovery → softened palette token (`data-tone="calm"`), reduced actions.
     - execution → today action card dominant, AION guidance concise.
   - Provider applies the result: `<body data-environment data-tone data-density>` plus a `useChromeVisibility` integration so `chromeLevel: hidden|minimal` hides header/bottom bar.

3. **Inline artifact rendering**
   - `AIONArtifactSlot` component reads `activeArtifact`. When set, it renders the matching existing surface (plan card, hypnosis session, focus timer, mission card, FM card, study card) inside the dock chat thread instead of forcing navigation.
   - No new artifact types created in Phase 2 — only wiring existing components into the slot via a small registry.

## Phase 3 — Composer + voice unification

**Goal:** "talking into the orb" feeling.

1. Composer visual: orb sits on the leading edge inside the rounded input, breathing aura matches `aionState`. Send button collapses into the orb when idle (the orb itself becomes the send target while text is present).
2. Voice: long-press orb starts capture; orb pulses with mic level via existing `useAuroraVoiceMode` hook; release sends. Tap-during-voice cancels.
3. Remove the separate voice button and voice-note button from chat chrome (they were Phase 1 hidden from chrome but still mounted — Phase 3 deletes them).

## Phase 4 — Visual upgrade

**Goal:** higher fidelity without "cheap neon."

1. `AIONOrb` reads `aionState` and applies one of these aura presets (single shader, parameter swap — reuses `OrganicOrbCanvas`):
   - idle: slow breath, soft primary halo.
   - listening: cooler hue, mic-level reactive radius.
   - thinking: subtle inner swirl, no color shift.
   - speaking: outer ring pulses on TTS amplitude.
   - guiding: warm rim light.
   - immersive: larger size, slower animation, deeper depth.
2. Background dim layer for `aionState: thinking|immersive` (single full-screen `<div>` with `pointer-events-none` and a tween — does not block interaction in non-immersive states).
3. Audit and remove any leftover ad-hoc orb usages on screens that should now read from `AIONPresence` (keep static orbs in DNA viewer, profile triad, NFT cards — those are identity art, not AION).

## Phase 5 — Personality + copy

Single source of truth for AION's tone in `src/lib/aion/voice.ts`:
- Calm, direct, emotionally aware, strategic — not cute, not robotic, not gamified.
- Short helper `aionLine(template, vars)` used by Quick State Panel suggestions, immersive intro lines, and proactive nudges.

System prompts already exist in edge functions; this phase only governs UI-side copy and the proactive orchestrator's surface lines.

## Out of scope (explicitly preserved)

- All edge functions, AI orchestration (AION Brain), pillar continuity chat, gamification, hypnosis/focus/planning/recovery business logic — untouched.
- DNA viewer / Profile NFT triad / OrbNFTCard — those are identity art surfaces, not AION presence; left alone.
- Backend, RPC, schema — none touched.
- Onboarding gate (`/onboarding`, `/founding`, `/avatar`, `/ceremony`, `/docs`, `/go`) and any current `HIDDEN_ROUTES` continue to suppress the orb.

## Risk + rollout

- Phase 1 is the riskiest — it deletes two visible components. Mitigation: implement `AIONPresence` behind a feature flag (`localStorage.aion_v2 === '1'` → render new presence, else legacy), ship, flip on once verified. Flag removed at end of Phase 2.
- Each phase is independently shippable and reversible.

## Recommended next step

Approve Phase 1 only. I'll implement `AIONEnvironmentContext`, `AIONPresence`, `AIONComposer`, and remove the duplicate widget — then we review the live result before Phase 2.
