## Goal

Collapse the authenticated home (`/aurora`) into a single calm, focused surface. Remove ~70% of permanent UI. AION becomes the visual and functional center; everything else emerges contextually from conversation.

## What the home should answer (and only this)

1. What does AION understand right now?
2. What matters most right now?
3. What should happen next?
4. How do I talk to it?

## What's there today (to be removed/collapsed)

`/aurora` empty state currently shows `AuroraWelcome` with:

- 80px orb + greeting
- 2×2 grid of 4 colored "smart suggestion" cards (purple/cyan/amber/emerald)
- Multiple floating elements competing with the composer (header MindOS dropdown, AIONPresenceButton, ArtifactLayer, composer "+", attach menu, voice button, mode pill, etc.)

Combined with header/dock/artifacts, this presents 10+ persistent surfaces at once.

## New home layout (single surface, top → bottom)

```text
┌───────────────────────────────────────────┐
│   minimal header                          │
│   (orb · MindOS · overflow — already slim)│
├───────────────────────────────────────────┤
│                                           │
│             [ AION orb, large ]           │  ← presence, breathing
│                                           │
│            "good evening, Tomer"          │  ← single soft greeting
│                                           │
│   ┌────── ambient context card ──────┐   │  ← ONE adaptive card
│   │ understanding · focus · next     │   │
│   └──────────────────────────────────┘   │
│                                           │
│         · · ·  active worlds  · · ·      │  ← optional thin strip
│                                           │
├───────────────────────────────────────────┤
│        composer dock (chat entry)         │
└───────────────────────────────────────────┘
```

### The single ambient card (replaces the 2×2 grid)

A quiet, multi-line card with three soft slots that AION fills from the brain graph:

- **Understanding** — short sentence: "I sense you've been low on energy this week."
- **Focus** — what matters most: "Your business launch is the live thread."
- **Next step** — one suggested action as a tap-to-send line: "Want to plan tomorrow's first move?"

Tapping any line sends it to AION as a message. No buttons, no colors competing for attention. Empty/loading state shows a single "I'm getting to know you…" line.

### Active worlds strip (optional, suppressed by default)

A single horizontal row of tiny dots/labels (max 3) showing currently in-flight efforts pulled from `action_items` / brain state — e.g. `business launch · sleep reset · daily writing`. Tap = ask AION about that thread. Hidden when there's nothing live.

## What to remove from the home

- `AuroraWelcome` 2×2 grid (suggestion cards, color schemes, icons).
- Local welcome `useSmartSuggestions` UI (data may still feed the ambient card, single suggestion only).
- Any duplicate composer affordance on the home (we already have one floating dock; remove inline composer block if present).
- `AIONPresenceButton` floating overlay **on `/aurora`** — the orb on the page IS the presence; two AI buttons confuse. Keep the button on every other route as the global summon.
- `ArtifactLayer` shows nothing on a fresh home (no auto-emitted starter artifacts) — only emerges after intent.
- Any "category pills / services feed / progress bars / stats cards" if they appear via PresenceShell or hallway rooms behind `/aurora` — confirm none render here; if a `PresenceShell` layer leaks through, hide it on `/aurora`.

## Files to change

- `src/components/aurora/AuroraWelcome.tsx` — rewrite to the calm layout above (orb · greeting · ambient card · optional worlds strip). Drop the 2×2 grid and color schemes.
- `src/components/aurora/AmbientContextCard.tsx` *(new)* — renders the three ambient lines from brain/decision data; tap = send.
- `src/hooks/aurora/useAmbientContext.ts` *(new)* — small hook that derives `{ understanding, focus, nextStep }` from existing sources (brain overview, latest action items, AION decision). Reuses what we already have; no new edge functions.
- `src/components/aurora/ActiveWorldsStrip.tsx` *(new, optional render)* — thin horizontal strip; hidden when empty.
- `src/pages/AuroraPage.tsx` — ensure only one composer (the floating dock) renders; remove any extra inline input.
- `src/components/aion/InteractiveAIONHost.tsx` (or wherever the floating `AIONPresenceButton` is mounted) — suppress the floating button when route is `/aurora`.
- `src/components/aion/artifacts/ArtifactLayer.tsx` — confirm no artifacts auto-emit on home load (verify, no code change expected).

## What stays

- Header (orb · MindOS · overflow) — already slimmed.
- Single floating composer dock on `/aurora`.
- Composer "+" → ComposerActions (already added) is the only capability launcher.
- Brain View, Strategy, Hypnosis, Free Market etc. remain reachable via "More capabilities" in MindOS sheet and via AION conversation — they are **not** surfaced on the home.

## Out of scope (follow-ups)

- Refactoring the rest of `/aurora` chat thread visuals.
- Brain-graph-driven proactive suggestions beyond the simple single-suggestion ambient card.
- Removing the marketing `/` page or other routes.
- Hallway / PresenceShell architecture changes (only ensure they don't bleed into `/aurora`).

## Acceptance signals

- Fresh `/aurora` shows ≤6 visible elements: header, orb, greeting, ambient card (3 lines), optional worlds strip, composer dock. Nothing else.
- No 2×2 grid, no colored suggestion cards, no duplicate composer, no floating AI button on this route.
- Tapping any ambient line sends a chat message; conversation surface takes over.
- All previously available capabilities remain reachable via composer "+" or MindOS "More" — none lost.
- Visual feel: calm, single-focus, RTL-correct, full Hebrew spelling preserved.
