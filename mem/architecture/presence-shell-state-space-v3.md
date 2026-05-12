---
name: Presence Shell — State Space (v3.2)
description: PresenceShell at / has no room menu. Active state is mutated only by AION, presenceSignals, or the global window.__mindosTransitionState bridge. Vertical gestures only.
type: architecture
---
- `src/presence/useActiveState.ts` is SSOT for the active room/state. UI subscribes via `useActiveRoom`/`useActiveState`. Mutations go through `setActiveState(roomId, source, reason)` only.
- Sources: `'aion' | 'signal' | 'boot' | 'manual'`. Never wire a menu/list to `setActiveState`.
- `PresenceShell` exposes vertical gestures only: ↑ Graph, ↓ Artifacts. Horizontal swipes and arrow ←/→ are intentionally ignored.
- The AION whisper line is the only "you just moved" indicator. No toasts, no breadcrumbs, no dots, no sheet.
- `presenceSignals.evaluateSignals()` runs on mount, on focus, and every 5 min — proposes a transition; never forces a modal.
- `window.__mindosTransitionState(roomId, reason, source)` is the global bridge for non-React surfaces (chat handlers, AION runtime). Installed by PresenceShell on mount.
