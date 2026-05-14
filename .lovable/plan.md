# Phase 5C — "Enter, don't open"

The shift you're describing is concrete: stop framing worlds inside chrome. Let them **be the screen**. The orb stops floating *in* a layout — it becomes the only persistent reality across morphing environments.

This plan is the first executable wave toward that. No new features. We **remove interface** and **promote atmosphere**.

## What's blocking the feeling today

Reading `WorldShell.tsx`, every world today is structured as:

```text
[ back btn | "WORLD" label | spacer ]   ← page chrome
[      AION orb (140px, centered)   ]   ← embedded component
[      WorldStage (card box)        ]   ← framed scene
[      WorldComposer (verb pills)   ]   ← bottom action bar
        max-w-md, px-4, py-4            ← phone-app gutters
```

Symptoms this produces:
- The world is a **card inside a layout**, not the layout itself.
- The orb is **a widget on the page**, not the constant anchor.
- Atmosphere is a **background**, not the substance.
- Verbs read as **buttons**, not as gestures into the world.
- Every world inherits the same skeleton → they all feel like the same screen wearing different paint.

## The architectural inversion

```text
BEFORE                          AFTER
─────────                       ─────────
Page > Atmosphere               Atmosphere = Page
Orb in page                     Page in orb's gravity
Scene in card                   Scene = full bleed
Verbs as buttons                Verbs as drift / approach
"Open Habits"                   "Drift toward ritual"
Back button                     Pull-down to surface
World label header              World *is* the label
```

The orb is the only constant. Everything else dissolves and re-forms per world.

## Wave 1 — concrete moves (this is what to build now)

Scope: structural only. No new visuals authored yet — we let the existing `WorldAtmosphere` finally *be* the screen.

### 1. Full-bleed `WorldShell`
- Remove `max-w-md px-4 py-4 space-y-5` container. Shell becomes `fixed inset-0`.
- `WorldAtmosphere` always `fullBleed`, behind everything, owning 100vh/100vw.
- Delete the top chrome row (back button + "WORLD" label + spacer).
- Add a **silent edge-gesture**: pull-down from the top edge to "surface" (return to hallway). No visible button. The atmosphere is the boundary.

### 2. Orb becomes the sky, not a card
- Orb sits in a calm, off-center position per world (each world's atmosphere preset declares an `orbAnchor: { x, y, scale }` so the orb lives differently in each world — high in Higher Self, low in Memory, central in SelfWorld, eccentric in Creative).
- Orb is rendered through the existing shared stage (`CanonicalAionModel`) so it's still the same entity — but it **persists across world transitions** instead of being mounted per shell. This requires hoisting the orb mount above `WorldRoute` (into the app shell) and letting each world pass an `orbAnchor` that the orb animates toward.
- Result: when you move between worlds, the orb glides to a new resting place. *It* doesn't change — the world around it does.

### 3. Scene = atmosphere, not a stage
- Delete the `<WorldStage>` card wrapper around scenes (`RitualOrbitsScene`, `BandStackScene`, `ScaffoldScene`). Scenes render directly into the atmosphere layer at full viewport.
- Existing scenes get a `mode: 'environmental'` prop and switch from "fit inside a box" to "occupy the full canvas with depth bands."

### 4. Verbs become drift, not buttons
- `WorldComposer` retired in its current form. Replace with a single ambient affordance per world:
  - A faint glyph at the bottom edge that **breathes** in the world's accent color.
  - Tap-and-hold = the world "responds" (the existing mutation pipeline still fires under the hood — we keep `useGraphMutator` exactly as is). Release = the response settles into the atmosphere.
  - Optional: long-press shows the verb name briefly; otherwise it stays unnamed. Verbs become **gestures**, not menu items.
- This preserves the entire living-systems engine; only the UI surface changes.

### 5. World identity carried by atmosphere, not labels
- Remove the visible world title from the shell.
- Each world's name only appears in **the AION whisper line** ("AION is walking inward with you"), once, on entry. Then it dissolves.
- Identification = palette + motion + orb position + ambient sound (deferred). No chrome label.

### 6. Transitions = **enter**, not navigate
- `/worlds/:id` route changes are wrapped in a long crossfade (1.2s) where:
  - Old atmosphere palette dissolves into new atmosphere palette.
  - Orb glides from old `orbAnchor` to new `orbAnchor` along a curved path.
  - Scene particles re-form, never wipe.
- No router page transition. The orb is the through-line.

## What we explicitly do NOT do in Wave 1

- No new scenes, no new 3D, no Three.js work, no audio.
- No new worlds, no new mutations, no AI changes.
- No changes to graph mutation bus, world state store, evolution ticker, AION continuity. Those stay exactly as built in 5B.7.
- No homepage changes. The marketing shell keeps its hero.

## File map (Wave 1)

```text
src/worlds/scene/WorldShell.tsx         rewrite — full-bleed, no chrome
src/worlds/scene/WorldStage.tsx         deleted (or kept as no-op for back-compat)
src/worlds/scene/WorldComposer.tsx      replaced by AmbientGesture.tsx
src/worlds/scene/AmbientGesture.tsx     NEW — single breathing glyph, gesture handler
src/worlds/scene/scenes/*.tsx           pass `mode='environmental'`, render full-bleed
src/worlds/atmosphere/atmospherePresets.ts  add `orbAnchor` per world
src/worlds/orb/PersistentOrbAnchor.tsx  NEW — single mount, animates between anchors
src/App.tsx                             mount PersistentOrbAnchor above WorldRoute
src/pages/WorldRoute.tsx                strip route chrome; pass world id only
mem/architecture/cognitive-worlds-system.md   add "Enter, don't open" addendum
```

## Success check (no metrics, sensory)

After Wave 1:
- Loading `/worlds/habits` should feel like the screen *became* the habits world, not like a new page opened.
- Switching to `/worlds/emotions` should feel like the same orb is still here, but the weather changed.
- There should be no visible back button, no visible world title, no visible verb bar.
- A new user, shown the screen for 2 seconds, should not be able to describe it as "an app." They should describe it as "a place."

## After Wave 1 (preview, not in scope)

- **Wave 2** — emotional reactivity: atmosphere reads `presenceState` (valence/arousal/hour) live, so the world breathes with the user.
- **Wave 3** — continuity bridges: residue from the previous world bleeds into the next (a habit ritual carried into Memory shows up as a faint orbiting echo).
- **Wave 4** — silence as feature: long idle = the world goes quiet, orb dims, no notifications. The OS *rests* with you.
- **Wave 5** — remove last app surfaces: the hallway becomes a single drift between worlds, not a menu.

This plan is the first irreversible step. Once chrome is gone and the orb persists across worlds, the rest of the app starts feeling wrong by comparison — and that pressure naturally pulls the remaining surfaces into the same language.
