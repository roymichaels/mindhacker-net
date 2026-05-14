# Why the orb still looks "wrong" in the logged-in app

The homepage uses the **live WebGL AION model** (`SharedOrbView` + `OrganicSphere`, driven by `CANONICAL_AION_PROFILE` — the iridescent cyan→violet liquid orb).

But large parts of the **logged-in shell still render a static PNG** (`src/assets/aion-ring.png`) via the legacy `AionOrb` component. So as soon as you're inside the app, the orb downgrades to a flat ring graphic — not the alive sphere.

Surfaces already canonical (correct):
- `WorldShell`, `OuterWorldHub`, `JourneyView`, `AionPresenceHero`, `InteractiveAION` — all use `CanonicalAionModel`.

Surfaces still on the static PNG (wrong):
- `src/shellv2/ShellV2Header.tsx` → renders `<AionHeader>` whose orb slot is `<AionOrb>` (PNG).
- `src/shellv2/ShellV2Drawer.tsx` (line 136) → `<AionOrb size="md" />`.
- `src/components/aion/ui/AionHeader.tsx` → orb slot hardcoded to `<AionOrb>`.
- `src/components/aion/ui/AionEntityAvatar.tsx` → `<AionOrb size="xs" />` (used in chat/voice chips).
- `src/components/Header.tsx` → imports `aion-ring.png` directly.
- `src/components/panel/AffiliateSidebar.tsx` → imports `aion-ring.png` directly.
- `ShellV2Header` brand sheet header → `<img src={aionOrb} />`.

`AionRingMark` (the literal logo ring glyph) is intentionally a flat mark and stays as-is.

# Plan

## 1. Make `AionOrb` itself canonical
Refactor `src/components/aion/ui/AionOrb.tsx` so the small/medium "chip" orb renders `CanonicalAionModel` at the requested pixel size instead of `<img src={aion-ring.png}>`. Keep the same API (`size`, `onClick`, `ariaLabel`, halo) so every existing call site upgrades automatically.

- xs (24) / sm (32) / md (48) / lg (80) → forward to `CanonicalAionModel size={px}`.
- Preserve breathing + click + halo.
- Drop the `aion-ring.png` import.

This single change fixes: `ShellV2Drawer`, `AionHeader` orb slot (→ `ShellV2Header`), `AionEntityAvatar`, and any other consumer of `AionOrb`.

## 2. Replace remaining direct `aion-ring.png` consumers in the shell
- `src/components/Header.tsx` — swap the `<img src={aionOrb}>` button for a `<CanonicalAionModel size={36} onClick={openInteractiveAION} />`.
- `src/shellv2/ShellV2Header.tsx` brand-sheet header — swap the 32px `<img>` for `<CanonicalAionModel size={32} />`.
- `src/components/panel/AffiliateSidebar.tsx` — swap for `<CanonicalAionModel size={...} />` at the same size.

`AionRingMark` is left alone (it's the flat brand mark, not the presence orb).

## 3. Performance guardrails
The canonical model is WebGL. To avoid spinning up many contexts in chrome:
- Keep the existing `SharedOrbStage` integration (`OrbView` already routes through it), so all chip orbs share one canvas instead of allocating per instance.
- Confirm `CanonicalAionModel` defaults route through `OrbView` (it does — `CanonicalAionModel.tsx` wraps `OrbView`, which uses `CANONICAL_AION_PROFILE` and the shared stage).
- For the very small xs (24px) avatar inside dense lists, allow an opt-out prop `glyph` that falls back to a CSS-only mini glow so we don't pay WebGL cost in feed rows. Default everywhere in the shell = live model.

## 4. Memory
Update `mem/architecture/orb-pure-renderer-standard` (or add a short note in `mem/index.md` Core) saying:
> AION presence in chrome (header, drawer, chips) MUST render `CanonicalAionModel`. `aion-ring.png` is reserved for the flat brand mark (`AionRingMark`) only.

## Files touched
- `src/components/aion/ui/AionOrb.tsx` (rewrite body, keep API)
- `src/components/Header.tsx`
- `src/shellv2/ShellV2Header.tsx`
- `src/components/panel/AffiliateSidebar.tsx`
- `mem/index.md` (one-line core rule)

## Out of scope
- No changes to homepage hero, world scenes, profile triad, or any surface already on `CanonicalAionModel`.
- No new orb profiles or palette changes.
- No backend / data changes.

## Success check
After the change, every AION orb visible in the logged-in shell (top-left header orb, drawer header orb, chat avatar, sidebar) renders the same iridescent cyan→violet living sphere as the homepage hero — not the flat ring PNG.
