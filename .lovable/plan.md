# AION North-Star Gap Closure Pass

This pass stops touching one screen at a time. We codify the cinematic system as **tokens + primitives**, then sweep the high-impact surfaces onto them. No backend, route, orchestration, or capability changes.

## 1. Token layer (`src/index.css` + `tailwind.config.ts`)

Audit existing `aion-*` / `atmo-*` tokens and fill gaps so every surface uses tokens, never raw colors.

Add / verify in `:root` and `.dark`:

- Background: `--aion-bg`, `--aion-bg-deep`, `--aion-bg-fade` (radial nebula stops).
- Surfaces: `--aion-surface`, `--aion-surface-strong`, `--aion-surface-translucent`, `--aion-border-hairline`.
- Glow: `--aion-glow-cyan`, `--aion-glow-violet`, `--aion-glow-gold`, `--aion-glow-soft`, `--aion-glow-danger`.
- Text: `--aion-text`, `--aion-text-soft` (foreground/70), `--aion-text-mute` (foreground/45), `--aion-text-faint` (foreground/25).
- Semantic: `--aion-success`, `--aion-warn`, `--aion-danger`, `--aion-action` (cyan).
- Radius scale: `--aion-r-sm 12px`, `--aion-r 18px`, `--aion-r-lg 26px`, `--aion-r-pill 9999px`.
- Spacing scale (CSS vars consumed by primitives): `--aion-s-1..6` on a 4/8/12/16/24/40 grid.
- Motion: `--ease-cinema`, `--ease-soft`, `--dur-fast 180ms`, `--dur 320ms`, `--dur-slow 540ms`.
- Shadow/glow scale: `--aion-shadow-1..3` mapped to existing glow utilities.

Remove ad-hoc `bg-*-500/10`, `border-border/40`, `shadow-[0_…]` from migrated screens — replace with tokens.

## 2. Core primitives (`src/components/aion/ui/`)

Create the shared kit. Each is a thin presentation component, no business logic:

```text
src/components/aion/ui/
  AionScreen.tsx        // safe-area, vertical rhythm, max-w container
  AionHeader.tsx        // 56px compact header: ghost menu / centered AION / orb status
  AionComposerDock.tsx  // floating pill wrapper; wraps GlobalChatInput
  AionSurface.tsx       // borderless atmo-surface card w/ kind tint + breathing prop
  AionOrb.tsx           // shared orb glyph (xs/sm/md/lg) — reuses SharedOrbStage handle
  AionEntityAvatar.tsx  // mini AION presence chip (orb + name/status)
  AionBottomSheet.tsx   // cinematic sheet (atmo-surface, drag handle, emerge anim)
  AionModal.tsx         // dialog variant of AionBottomSheet for desktop
  AionButton.tsx        // primary / ghost / pill variants on tokens
  AionPill.tsx          // status / filter chip
  AionArtifactCard.tsx  // re-exports AtmoArtifact w/ enforced kind + source slot
  AionNavDock.tsx       // 5-tab bottom dock (Chat · Brain · Journey · Outer · Profile)
```

`AionArtifactCard` is the single artifact shell — `AtmoArtifact` becomes its implementation.

## 3. Mobile shell

- `ShellV2Header` → re-implement on top of `AionHeader`. Confirms 56px height, `pt-[env(safe-area-inset-top)]`, no border, fade-down mask only.
- `ChromeLayer` mounts `AionHeader`; `ComposerLayer` wraps `GlobalChatInput` with `AionComposerDock`.
- Add `AionNavDock` (replacing whatever bottom chrome currently double-stacks). Composer sits **above** dock; both share one safe-area calc.
- Z-index: confirm `Z` scale in `src/shellv2/zindex.ts` covers nav dock (insert `nav: 35` between composer and chrome).
- Sheet stacking: route all bottom sheets through `AionBottomSheet` so backdrop, scrim, and exit anim are uniform.

## 4. Brain north star (`src/features/brain/`)

Pure presentation refactor on top of existing data hooks.

- `BrainGraphForce`: keep current radial-orb work, add **room nebula clusters** — each room renders a soft radial gradient field (40% alpha) behind its nodes; nodes drift inside.
- Replace straight edges with curved Bézier energy lines, gradient cyan→violet, 0.08–0.18 alpha based on relation strength (no numeric label).
- Selected node opens `AionBottomSheet` (replace current `BrainNodeSheet` shell) with: name, one-line human description, "Explore deeper" / "Correct this" / "Ask AION" actions.
- Strip user-facing copy: "confidence", "strength", "node", "edges", counters → human phrases ("AION is still learning this", "This feels strong", "Quiet for now").
- Move dev counters/toggles behind `useDiagnosticsFlag`.

## 5. Journey north star (`src/pages/PlayHub.tsx` + Mind OS pages)

- Wrap in `AionScreen`. Hero block: AION guidance line (one sentence), today's single mission title, next-step CTA.
- Below: optional `AionArtifactCard kind="plan"` for the generated plan, then a soft vertical timeline (no card chrome — just dots + text on `atmo-divider`).
- Remove tabs, action grids, "Modes" launcher chips → fold into a single "More" entry that opens an `AionBottomSheet`.
- StrategyPage / TacticsPage / WorkPage / JournalPage: convert their root container to `AionScreen` and their primary panels to `AionSurface` / `AionArtifactCard`.

## 6. Outer World north star (`src/pages/OuterWorldHub.tsx` + market pages)

- Replace grid of generic cards with **portal cards**: large `AionArtifactCard` per world (Marketplace, Coaches, Learning, Wallet/Economy), each with an orb-tinted glow, one-line invite, and chevron.
- Max 4 portals on screen; secondary entries summoned from each portal.
- `Coaches.tsx`, `PractitionerProfile.tsx`, `Subscriptions.tsx`, wallet modal: re-skin headers/cards with `AionSurface` and `AionArtifactCard`.

## 7. Artifact sweep

Wrap with `AionArtifactCard` (kind in parens):

- Journal: `JournalTab.tsx`, `AuroraJournalModal.tsx` (`read`).
- Hypnosis: `HypnosisPage.tsx`, `BodyHypnosisSurface.tsx` (`default`).
- Wallet: wallet modal contents (`confirm`).
- Marketplace / Coach: `Coaches.tsx` cards, `PractitionerProfile.tsx` (`default`).
- Business: `BusinessJourney.tsx`, business plan generators (`plan`).
- Work: `WorkPage.tsx` block panels (`default`).
- Plan / Confirmation: already done — verify `AuroraPlanModal.tsx` and `AuroraActionConfirmation.tsx` use the shared shell.
- Profile: `ProfilePage.tsx` triad cards (`default`, breathing).

`ArtifactLayer` keeps emitting through registry; the registry components migrate one by one to `AionArtifactCard`.

## 8. Copy cleanup

Project-wide string sweep (UI files only) to replace technical terms with human phrasing:

| Old | New |
|---|---|
| confidence / strength | "feels strong" / "still learning" |
| node / edge / graph | "room" / "thread" / "map" |
| status unknown | "quiet for now" |
| onboarding | "first steps" |
| evidence / source | hidden unless `useDiagnosticsFlag()` |
| profileVisual / material metal | removed from user copy |

Touch points: Brain views, Journey rows, Outer World portals, artifact source slots. Dev labels gated behind diagnostics.

## 9. Density reduction (~30%)

For each migrated screen, remove: secondary action buttons, helper subtitles, duplicate tabs, decorative chips, redundant dividers, permanent "feature access" rails. Move them into the relevant `AionBottomSheet`.

## 10. Out of scope

Backend, edge functions, RPCs, routes, capability registry, AI prompts, onboarding flows, marketing/landing copy, light-mode rebrand, new artifact kinds.

## Acceptance / report

Final reply will list:

1. Tokens added (with names).
2. Primitives created (file list).
3. Screens migrated to primitives.
4. SaaS/card patterns removed.
5. Copy replacements (table).
6. Mobile shell fixes (header height, dock, safe-area).
7. Brain changes (visuals + copy).
8. Journey changes.
9. Outer World changes.
10. Artifact adoption coverage (which kinds wrapped).
11. Remaining gap vs reference images.
12. Mobile preview screenshot notes (402×716).

## Technical notes

- All new primitives live under `src/components/aion/ui/` and re-export from an `index.ts` barrel for clean imports.
- `AionOrb` consumes the existing `SharedOrbStage` (per memory `unified-orb-stage-v4`) — no new WebGL contexts.
- RTL: every primitive uses Tailwind logical props (`ps-`, `pe-`, `ms-`, `me-`) and respects `useTranslation().isRTL` per Hebrew standards memory.
- Z-index strictly via `src/shellv2/zindex.ts`; no new arbitrary `z-[…]` classes.
- No edits to `src/integrations/supabase/*`, `supabase/config.toml`, or migration files.
