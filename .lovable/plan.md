# Cinematic Pass 2 — Remove Dashboard Energy

Pure visual/structural pass. No backend, orchestration, capability, or feature changes. All edits stay in presentation layers.

## 1. Header — compact cinematic top bar
**Files:** `src/shellv2/ShellV2Header.tsx`, `src/shellv2/ShellHeader.tsx`, `src/components/Header.tsx`

- Drop height to ~64px (from ~92px). Safe-area top stays.
- Layout: `[ghost menu 36px] · [centered AION wordmark, 16px, tracking-[0.32em]] · [small living orb 28px with breath halo]`.
- Remove `border-b`, remove `atmo-divider` strip — replace with a 24px downward `bg-gradient-to-b from-background/60 to-transparent` fade only.
- Remove all secondary icons from the bar (search, bell, settings) — relocate into the drawer.
- The ShellHeader title/subtitle block is removed from `BrainPage` floating header (moves to atmospheric overlay text, see §5).

## 2. Composer — single floating cinematic dock
**Files:** `src/shellv2/layers/ComposerLayer.tsx`, `src/components/dashboard/GlobalChatInput.tsx`, `src/components/aurora/composer/*`

- Single pill: `atmo-surface` rounded-full, no nested boxes, no border.
- Visible controls: `[+]` (32px ghost, opens action sheet) · `[ multiline input, placeholder only ]` · `[mic | send]` (one swap based on input).
- Hide attachment chips, mode toggles, model picker, suggestion chips behind the `+` sheet.
- Vertical rhythm: `py-3 px-4`, min-height 52px, max 5 lines auto-grow.
- Focus state: cyan glow ring (`aion-glow-cyan`) replaces border highlight.
- Bottom anchor: `bottom: max(env(safe-area-inset-bottom), 12px)` already in `ComposerLayer`; raise z to stay above sheets/artifacts but defer to modals.
- Remove the wrapper `border border-border/40 px-2 py-2` div in `ComposerLayer` — composer renders its own atmo pill.

## 3. Remove dashboard cards from primary flows
**Targets:** `src/components/dashboard/v2/StatsGrid.tsx`, `src/components/dashboard/*` widgets used in Index/Journey/Profile, `src/pages/UserDashboard.tsx`, `src/pages/PlayHub.tsx`.

- Replace `Card` + `CardContent` chains with `atmo-surface` divs (no border, no shadow).
- Drop the 2×2 stats grid in primary flows; keep only one consolidated breathing strip (level + streak inline, text-only) where stats are essential.
- Remove decorative `bg-*-500/10` blobs and colored icon tiles — replace with monochrome glyphs at `text-foreground/50`.
- Eliminate `Progress` bar chrome → replace with thin `atmo-divider` fill.

## 4. Journey — active mission workspace
**Files:** `src/pages/PlayHub.tsx`, `src/pages/MindOS/StrategyPage.tsx`, `src/pages/MindOS/TacticsPage.tsx`, `src/pages/QuestRunnerPage.tsx`, `src/pages/CoachingJourney.tsx`, `src/pages/BusinessJourney.tsx`, `src/pages/ProjectsJourney.tsx`.

Restructure each Journey surface to a single-focus layout:

```text
┌─────────────────────────────┐
│  (atmospheric backdrop)     │
│                             │
│   Today's mission title     │  <- aion-text-hero, 22px
│   one-line context          │  <- foreground/55
│                             │
│   [ Primary action pill ]   │  <- single CTA, atmo
│                             │
│   ▸ Next step (subtle)      │  <- ghost row
│   ▸ Skip / reschedule       │
└─────────────────────────────┘
```

- Delete the colorful action grid / app-icon row at the top.
- Tab strips collapse into a single contextual segmented control only when ≥2 modes are truly required; otherwise removed.
- Secondary widgets (history, stats, leaderboard) move behind a single "More" drawer trigger.

## 5. Brain — living consciousness landscape
**Files:** `src/features/brain/atlas/ConsciousnessAtlas.tsx`, `src/features/brain/BrainGraphForce.tsx`, `src/features/brain/brainNodeStyle.ts`, `src/pages/BrainPage.tsx`.

- Replace the floating header chrome on `BrainPage` with a top-anchored ambient label (`aion-text-hero` 14px, tracking, `text-foreground/60`, no card, no backdrop). Subtitle drops.
- Nodes:
  - Render as radial-gradient orbs (`hsl(var(--aion-cyan)) → transparent`), inner 2px solid core, outer halo blur 16px tinted by pillar.
  - Hierarchy by node radius + halo opacity: primary 28px / secondary 18px / tertiary 12px.
  - Hover/active: scale 1.08 + halo to 0.85 alpha, cubic-bezier(0.22,1,0.36,1) 220ms.
- Edges: 1px lines at `hsl(var(--aion-cyan)/0.10)` with subtle gradient toward stronger end. Drop dashed/grey debug edges.
- Background: keep the BrainView neural halo; add 6 CSS-only drift particles (`aion-drift`, opacity ≤0.12) inside the atlas container — no canvas, no Three.js.
- Remove any "X nodes / Y edges" counter strips, debug toggles, and analytics widgets from the visible surface (DiagnosticsHost remains gated).

## 6. AtmoArtifact adoption
Wrap each artifact's outer container with `<AtmoArtifact kind=…>`, drop internal `Card`/`border`/`shadow` chrome. `kind` mapping:

| Component | File | kind |
|---|---|---|
| Confirmation | `src/components/aurora/AuroraActionConfirmation.tsx` | `confirm` (breathing) |
| Strategy approval | `src/components/aurora/StrategyApprovalCard.tsx` | `plan` |
| Plan modal body | `src/components/aurora/AuroraPlanModal.tsx` | `plan` |
| Journal preview | `src/components/aurora/JournalTab.tsx` + `AuroraJournalModal.tsx` | `read` |
| Hypnosis player | `src/hallway/surfaces/BodyHypnosisSurface.tsx`, `src/pages/HypnosisPage.tsx` player card | `default` |
| Business canvas | `src/pages/Business.tsx` / `BusinessDashboard.tsx` canvas tile | `plan` |
| Coach recommendation | `src/pages/Coaches.tsx` recommendation card, `src/pages/PractitionerProfile.tsx` summary | `default` |
| Wallet/payment | wallet modal contents (via `WalletModalContext` consumer), `Subscriptions.tsx` tier cards | `confirm` |
| Work session | `src/pages/MindOS/WorkPage.tsx` active session card | `default` |
| Today list / Plan / JobMode artifacts | `src/components/artifacts/kinds/*` | `default`/`plan` |

For each: remove `Card`, `border-*`, `shadow-*`, `bg-card`. Padding handled by AtmoArtifact.

## 7. Navigation — 5 primary surfaces
**Files:** `src/navigation/osNav.ts`, `src/navigation/canonicalSurfaces.ts`, `src/shellv2/ShellV2Drawer.tsx`, any tab-bar consumer.

- Primary tabs: **Chat · Brain · Journey · Outer World · Profile**. Everything else becomes summoned (artifacts) or drawer entries.
- Tab bar: transparent over atmosphere, `atmo-divider` top hairline, active state = under-glow cyan dot, no pill background, no labels under icons on small screens (only active tab labelled).
- Drawer (`ShellV2Drawer`) absorbs: Coaches, Wallet, Subscriptions, Settings, Admin, Affiliate, Blog, etc. Render as plain text rows on `atmo-surface` — no colored icon tiles.
- Remove any feature grid / hub launcher rendered on Index, PlayHub, BrainPage, etc.

## 8. Visual density reduction (~30–40%)
Cross-cutting cleanup applied while touching the files above:

- Remove redundant section headings where context is obvious.
- Increase vertical rhythm: section gap 16→24, card inner padding 16→20.
- Drop secondary metadata rows (e.g., "Updated 2m ago" sub-labels) unless functionally required.
- Replace dividers `<Separator />` with `atmo-divider` (1px, fading).
- Strip duplicate icon+label combos to icon-only or label-only.

## Out of scope
- Backend, edge functions, RPCs, capability registry, AI prompts.
- Onboarding, marketing landing copy.
- Light-mode theming changes (atmosphere stays dark-first; light mode unchanged).
- New features, new routes, new artifact kinds.

## Acceptance signals
- Header ≤64px content, no border, single orb glyph.
- Composer is one floating pill, no border, no nested boxes.
- Journey shows a single mission focus per route, no app-icon grid.
- Brain renders glowing radial nodes with halos and atmosphere particles, no counter strip.
- All listed artifacts wrap in AtmoArtifact, no `Card`/`border` chrome inside.
- Tab bar shows exactly 5 primary entries; everything else moved to drawer or summon.
- Mobile (375×812 / 402×716) renders without clipping or scroll-locked chrome.
