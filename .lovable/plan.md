# AION Manifestation Engine — Phase 1

Add a thin visual lifecycle around artifacts so they feel summoned rather than rendered. Pure presentation; no changes to backend, orchestration, capabilities, or DB.

## 1. New primitives (under `src/components/aion/manifestation/`)

- **`ManifestationProvider.tsx`** — React context provider, mounted once at the app shell root (inside `ProtectedAppShell`). Subscribes to **both** existing buses:
  - `onArtifact` from `src/components/aion/artifacts/artifactBus.ts` (AionArtifact / floating cards)
  - `artifactBus.subscribe` from `src/lib/aion/artifactBus.ts` (summoned ArtifactInstance)
  
  Maintains a small state machine per artifact id:
  ```
  pending → manifesting (≈260ms) → stable → dissolving (≈220ms) → gone
  ```
  Exposes context: `{ phase, kind, mood, primaryId, registerLifecycle(id, kind) }` and emits dev events (`manifestation.started/stable/dismissed` via `console.debug` when `import.meta.env.DEV`).
  
  Behavior rules:
  - Only **one primary** manifestation at a time (most recent wins; older ones move to "stable" silently without re-pulse).
  - Confirm artifacts (`kind: 'confirm'`, `checkout_confirmation`, or AtmoArtifact `kind: 'confirm'/'warn'`) are **sticky** (no auto-dissolve).
  - Read artifacts keep their existing `ttl` auto-dismiss → triggers `dissolving` instead of instant unmount.
  - Respects `prefers-reduced-motion` → collapses lifecycle to a 1-frame fade with no scale/blur.

- **`ManifestationLayer.tsx`** — Single absolutely-positioned overlay placed inside the ShellV2 chrome (above composer, below header). Renders:
  - **`ManifestationPulse`** — one-shot ring expanding from a "summon point" near the orb (top-center on mobile). CSS keyframes only.
  - **`ManifestationAura`** — full-screen radial gradient (very low alpha, 6–10%) tinted by the active artifact's mood color. Cross-fades when mood changes; fades out when no primary artifact.
  - Both are `pointer-events-none` and z-indexed below the artifact cards.

- **`ManifestedArtifactShell.tsx`** — Wrapper component that any artifact card opts into. Reads its phase from context (by `artifactId`) and applies:
  - `manifesting`: `opacity-0 scale-[0.92] blur-md` → animate to `opacity-100 scale-100 blur-0` (motion easing token `--aion-ease`).
  - `stable`: identity.
  - `dissolving`: reverse, then unmount via `onDissolved` callback.
  - Reduced-motion: pure opacity 0→1 / 1→0 in ~120ms.

- **`useAionManifestation(artifactId, kind)`** hook — registers the artifact on mount, returns `{ phase, mood, dissolve() }`. Used by cards that don't want the shell wrapper.

## 2. Artifact-kind → mood color mapping

Single map exported from `manifestation/moods.ts`. Values are token names already defined in `index.css` (cyan/violet/gold/soft glows).

| Kind family | Mood token |
|---|---|
| `next_action`, `plan_summary`, `journey_workspace`, `schedule_block_preview`, `work_session`, `today-list`, `plan`, `journey` | `cyan` |
| `hypnosis_player` | `violet` |
| `journal_capture`, `journal_preview`, `identity_summary`, `profile_triad`, `avatar_configurator` | `indigo` (alias of violet-soft) |
| `business_canvas`, `landing_preview`, `marketplace_card`, `wallet_sheet`, `subscription_card`, `checkout_confirmation`, `coach_recommendation`, `course_card`, `curriculum_preview`, `business-canvas`, `landing-builder`, `job-mode` | `gold` |
| `insight`, `note`, `capability`, `community_preview`, `message_preview`, `assessment` | `blue/violet` (soft) |
| `confirm` | `cyan` (danger reserved for later) |

`AtmoArtifactKind` (`read/plan/confirm/warn/default`) maps in the same file so legacy callers work.

## 3. Wiring (files edited)

- **`src/shellv2/ShellV2.tsx`** (or current shell root): wrap children with `<ManifestationProvider>` and mount `<ManifestationLayer />` once.
- **`src/components/aion/artifacts/ArtifactLayer.tsx`**: keep current content, just wrap each card in `<ManifestedArtifactShell artifactId={art.id} kind={art.kind}>`. Replace the current `animate-in fade-in slide-in-from-bottom-4` classes (the shell now owns the entrance). Auto-dismiss `setTimeout` calls `shell.dissolve()` instead of `dismiss()` directly; actual removal happens after dissolve completes.
- **`src/components/aion/artifacts/AtmoArtifact.tsx`**: accept optional `artifactId` and `manifest` props. When provided, replaces `animate-aion-emerge` with the lifecycle classes from `useAionManifestation`.
- **`src/components/aion/ui/AionArtifactCard.tsx`**: same opt-in `artifactId`/`manifest` pass-through (re-exports `AtmoArtifact`).
- **`src/components/aurora/StrategyApprovalCard.tsx`**: pass a stable `artifactId` (existing strategy id) and `kind="confirm"` → sticky breathing aura.
- **`src/components/aurora/AuroraActionConfirmation.tsx`**: same — sticky confirm.
- **`src/components/artifacts/ArtifactLayer.tsx`** (legacy/summon stack from `lib/aion/artifactBus`): wrap each `ArtifactInstance` render in `ManifestedArtifactShell` keyed by `inst.id`, kind translated via mood map.

No changes to:
- `artifactBus.ts` (either copy)
- capability registry, sentinels parser, confirmation bridge, safe bridge
- any DB / edge function

## 4. Tokens

All new motion uses existing tokens (`--aion-ease`, `aion-glow-*`, surface tokens). No new CSS variables required. Two new `@keyframes` added to `src/index.css`:
- `aion-manifest-in` (scale 0.92 → 1, blur 8px → 0, opacity 0 → 1, 260ms)
- `aion-manifest-out` (reverse, 220ms)
- `aion-aura-pulse` (ring scale 0.6 → 2.4, opacity 0.35 → 0, 700ms one-shot)

## 5. Behavior summary

- Single primary at a time; secondary artifacts in `ArtifactLayer`'s stack render in `stable` immediately (no re-pulse, no aura change).
- Confirm/warn are sticky; ttl ignored.
- Read artifacts dissolve gracefully on ttl expiry.
- Composer/chat input is **not blocked** unless the primary artifact is `confirm`/`warn` (existing behavior in StrategyApprovalCard / AuroraActionConfirmation already handles modal blocking — we don't change it).
- No layout jump: shell uses `transform`/`opacity`/`filter` only; reserves space via existing card sizing.
- `prefers-reduced-motion`: aura still cross-fades (slow), pulse skipped, shell collapses to opacity fade.

## 6. Dev tracing

Inside `ManifestationProvider`, when `import.meta.env.DEV`:
```ts
console.debug('[manifestation] started', { id, kind, mood });
console.debug('[manifestation] stable', { id });
console.debug('[manifestation] dismissed', { id });
```
No user-visible UI.

## 7. Acceptance / deliverable on implementation

Final report will list: files changed, primitives created, lifecycle phases wired, kind→mood map, reduced-motion behavior, confirm stickiness verification, mobile (402×716) preview notes, and any artifact surfaces still rendering raw (not yet wrapped).

## Out of scope (future phases)

- Redesigning card internals
- Danger/red mood for destructive confirms
- Per-artifact bespoke entrance choreography
- Sound / haptics
