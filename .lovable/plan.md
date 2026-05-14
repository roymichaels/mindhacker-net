# Phase 5B — AION Presence State Wiring

Connect the existing `aionPresenceBus` (`src/aion/presenceState.ts`) into the surfaces already in the app so AION reads as one organism. **Zero new components, zero backend, zero route changes.** Only existing visuals subscribe; existing lifecycles emit.

## State mapping (single source of truth)

| Trigger | State |
|---|---|
| Composer focus / voice capture start | `listening` |
| `sendMessage` invoked (user dispatched) | `noticing` (≤500ms, then transitions) |
| Streaming start / TTS speaking start | `forming` |
| `artifactBus.summon` fires | `manifesting` |
| Stream end + idle ≥1.2s, error, dismiss | `resting` |
| Profile/DNA/Avatar/Self route active | `evolving` |

Default ambient = `listening`. All transitions debounce at 250ms to avoid flicker; `prefers-reduced-motion` short-circuits visual amplitude (state still updates, motion stays calm).

## 1. Emitters (lifecycle → bus)

### 1a. Chat — `src/hooks/aurora/useAuroraChat.tsx`
At existing `setIsStreaming` sites:
- start of `sendMessage` (line ~225): `aionPresenceBus.set('noticing')`
- right before/after `setIsStreaming(true)` (line ~228): schedule `set('forming')` after 400ms
- on stream end (lines ~262, ~1046): clear timer, `set('resting')` after 1200ms idle
- on error path (1046 catch): immediate `set('resting')`

### 1b. Composer — locate the active composer used by `ShellV2/ComposerLayer`
Wrap textarea `onFocus` → `set('listening')`, `onBlur` (no streaming) → `set('resting')` after 2s. Voice mic button `onPress` → `set('listening')`.
File: `src/shellv2/layers/ComposerLayer.tsx` (and whichever Composer it renders — confirm during implementation; do not duplicate handlers if `useAuroraVoice` already has them).

### 1c. Voice — `src/hooks/aurora/useAuroraVoice.tsx` + `useAuroraVoiceMode.tsx`
- start recording → `set('listening')`
- stop recording / transcribing → `set('forming')`
- TTS `onStart` callback (line ~161 in voice mode) → `set('forming')` (speaking is part of "forming the moment"; matches existing TTS lifecycle without inventing a 7th state)
- TTS `onEnd` → if not streaming, `set('resting')` after 800ms

Also bridge legacy window events in one place (extend `AIONStateBridge`): `aurora:tts:start → forming`, `aurora:tts:end → resting`, `aurora:voice:listen:start → listening`, `aurora:voice:listen:end → forming`. Keeps fallback if the hook path is bypassed.

### 1d. Artifacts — `src/lib/aion/artifactBus.ts`
Inside `emit()` (line 50), after computing snapshot: if `stack.length > prevLen` → `aionPresenceBus.set('manifesting')`; if `stack.length === 0` → `set('resting')` after 600ms. Track `prevLen` in module scope. Pure additive; no API change.

### 1e. Evolving — route-driven
Add a tiny `PresenceRouteBridge` mounted once in `ShellV2` (or `App.tsx` next to `AIONStateBridge`) that reads `useLocation()` and sets `'evolving'` while pathname matches `/profile`, `/dna`, `/avatar`, `/self`. Pops back to `'resting'` on leave (unless chat/voice override).

## 2. Consumers (bus → visuals)

### 2a. Orb — `src/components/orb/v2/OrbView.tsx`
Add internal `useAionPresence()`. If parent didn't pass `state`, derive `OrbViewState`:
- `listening → 'listening'`
- `noticing → 'focus'`
- `forming → 'thinking'`
- `manifesting → 'responding'`
- `resting → 'idle'`
- `evolving → 'focus'` (with `tintHue` shifted toward violet via existing `tintHue` prop)

This restores the moving organic AION wherever a static `AionOrb` is used in a "live" context. Static `AionOrb` (chips/sheet handles) stays unchanged — it's intentionally static. Audit list in §4.

### 2b. Atmosphere — `src/shellv2/layers/AtmosphereLayer.tsx` and `src/components/atmosphere/AtmosphereLayer.tsx`
Add `const presence = useAionPresence()`. Multiply existing blob opacities and shift the cyan/violet mix by a small lookup table:

```text
listening    cyan 1.00  violet 0.85
noticing     cyan 1.10  violet 0.90
forming      cyan 1.05  violet 1.20
manifesting  cyan 1.30  violet 1.30  (slow pulse via existing animate-aion-drift)
resting      cyan 0.70  violet 0.60
evolving     cyan 0.85  violet 1.40  + magenta 1.30
```

Implementation: drive a single CSS variable on the layer root (`--presence-intensity`, `--presence-violet`, `--presence-cyan`) and reference it from the existing inline `style` blocks. No new DOM. Reduced-motion → pin to `listening` row.

### 2c. Composer idle
Composer container reads presence and applies a subtle `opacity` / outline-glow when `listening`. One className swap; no layout change.

## 3. Files changed (final list)

Created:
- `src/aion/presenceWiring/PresenceRouteBridge.tsx` (route → evolving)

Edited:
- `src/hooks/aurora/useAuroraChat.tsx` — emit noticing/forming/resting around `sendMessage` + stream lifecycle
- `src/hooks/aurora/useAuroraVoice.tsx` — emit listening/forming around capture & TTS
- `src/hooks/aurora/useAuroraVoiceMode.tsx` — emit forming/resting around TTS handle
- `src/components/aion/AIONStateBridge.tsx` — also push to `aionPresenceBus` from existing window events (fallback path)
- `src/lib/aion/artifactBus.ts` — emit manifesting/resting on stack delta
- `src/components/orb/v2/OrbView.tsx` — derive `state` from presence when uncontrolled
- `src/shellv2/layers/AtmosphereLayer.tsx` — presence-driven CSS variables
- `src/components/atmosphere/AtmosphereLayer.tsx` — same
- `src/shellv2/layers/ComposerLayer.tsx` — focus/blur emitters + idle outline
- `src/shellv2/ShellV2.tsx` (or `App.tsx`) — mount `PresenceRouteBridge` once

## 4. Remaining static AION visuals (intentionally not migrated)

- `AionOrb` (PNG glyph) inside chips, sheet handles, list rows, header avatar — stays static for performance/legibility
- `AionRingMark`, `AionEntityAvatar` — identity glyphs, not live presence
- `OrbCollectionSection`, `OrbGallery`, `GameHeroSection` — marketing surfaces with their own narrative state
- `SidebarOrbWidget` — already has its own animation contract; opt-in later

These can be promoted to live `OrbView` in a follow-up sweep if desired.

## 5. Acceptance checks

- Send a chat message → orb transitions noticing → forming → resting; atmosphere violet rises during forming
- Open voice mode → atmosphere settles into cyan listening tone
- Trigger any artifact (e.g. summon profile) → manifesting pulse, then resting after dismiss
- Visit `/profile` → atmosphere shifts to violet/magenta evolving aura
- `prefers-reduced-motion: reduce` → states still log, visual deltas are minimal
- Remove `aion/presenceState.ts` import temporarily → app still renders (fallback paths intact)

## Next recommended phase

**5C — Realm Collapse**: merge `*Journey` and hub pages behind `TrajectoryView` / `InnerView` / `OuterView` shells now that presence is centralized and orb/atmosphere react globally.
