# Phase 3.2 — Kill the Room Menu, Let AION Drive State

## Premise

The room sheet/dropdown, the dot pager, and even the swipe-to-cycle gesture are all **route picker** patterns inherited from web-app thinking. They turn rooms into folders. The new contract:

> The user does not choose a room. AION moves the user through states.
> The hallway *is* the indicator of where you are.
> Navigation is conversational, ambient, and reactive — never a menu.

This phase removes the last navigation UI from `PresenceShell` and introduces a minimal **state-transition engine** so AION (and signals) can morph the environment.

No new pages. No new hubs. Removal + one orchestration hook.

---

## Scope

### Remove
- Rooms dropdown / sheet (wherever still mounted)
- Room dot pager in `PresenceShell` (lines 158–170)
- Manual "swipe ←/→ to switch room" gesture (lines 50–84, keyboard arrows lines 93–94)
- Static "Active lens / label / tagline" header treated as a chooser affordance (lines 121–131) — keep only an *ambient* room name that fades, no list implication
- `RoomSwitcher` / room-list components if any survive in the codebase

### Keep
- The 6 room *definitions* in `src/hallway/rooms.ts` — they remain the state vocabulary, just not user-pickable
- Ambient gradient driven by `room.ambience`
- `↑ inner map` (Graph drawer) and `↓ artifacts` (Artifacts dock) — these are *zoom*, not *navigation*
- `Speak to AION` dock — the only deliberate user action

### Add
- `src/presence/useActiveState.ts` — single source of truth for the current room/state. Reads from a lightweight in-memory store + Supabase `presence_state` row. AION writes to it; UI subscribes.
- `src/presence/StateTransition.tsx` — wraps `PresenceShell` content with a soft cross-fade (gradient + label) when the active state changes, so transitions feel cinematic, not route-like.
- `aion-orchestrator` skill: `transition_state(roomId, reason)` — already partially scaffolded; wire it so the model can emit a transition as part of its final answer (sanitized; reason surfaces only as the AION whisper line).
- Signal-driven auto-transitions (low energy → `body`, scattered focus → `focus`, etc.) via a small `presenceSignals` evaluator that runs on app focus + every N minutes. Suggests, never forces — AION says one line, user can ignore.

---

## Files Touched

```text
src/presence/PresenceShell.tsx        edit  — strip dots, swipe-cycle, arrow keys
src/presence/useActiveState.ts        new   — store + Supabase sync hook
src/presence/StateTransition.tsx      new   — ambient cross-fade wrapper
src/presence/presenceSignals.ts       new   — energy/focus/emotion → suggested state
src/hallway/RoomEnvironment.tsx       audit — ensure no room-list UI remains
api/_lib/agent-runtime.ts             edit  — register transition_state skill output
src/hooks/aurora/useAuroraChat.tsx    edit  — handle transition_state directive from response
supabase/migrations/<ts>_presence.sql new   — presence_state table (user_id, room_id, updated_at, source)
```

No route changes. No new pages. `/` still mounts `PresenceShell`.

---

## Data Flow After Phase 3.2

```text
 user signal (energy/focus/time)        user message → AION
        │                                    │
        ▼                                    ▼
 presenceSignals.evaluate()        agent-runtime.transition_state
        │                                    │
        └────────────► useActiveState.set() ◄┘
                              │
                              ▼
                  PresenceShell re-renders
                              │
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
         ambient hue    AION whisper   orb hue (via
         morphs         line updates   AionDecisionContext)
```

User never picks a room. They *find themselves* in one because AION moved them, or because their own signals shifted.

---

## Acceptance

- No visible list of rooms anywhere in the authenticated shell.
- No swipe-to-cycle, no arrow-key cycling, no dot pager.
- Sending a message that implies a state change (e.g. "I'm overwhelmed") causes ambient + whisper + orb to morph within ~1s, with one short AION line explaining the move.
- Manually idling with low energy for >N minutes triggers a single suggested transition (whisper only, no modal).
- `↑` still opens the Graph atlas; `↓` still opens Artifacts. Those are the only gestures.

---

## Out of Scope (later phases)

- Graph clusters glowing / corridors activating (Phase 3.3 — needs `memory-writer`)
- Sound design / ambient audio per state
- Multi-layer graph zoom (surface / mid / deep)
- Sandboxing SaaS routes into "Outer World" portal
