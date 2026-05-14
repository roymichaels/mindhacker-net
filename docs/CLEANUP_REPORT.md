# MindOS Cleanup Report

Tracking the System Consolidation Plan (`.lovable/plan.md`). Items here are
scheduled for deletion / merge once `LegacyMountGuard` confirms zero hits.

## Phase A — frozen (this commit)

- `src/navigation/canonicalSurfaces.ts` is now the **only** source of truth
  for top-level navigation. Five surfaces: Chat, Brain, Journey, Outer World,
  Profile.
- `src/navigation/osNav.ts` — marked `@deprecated`, kept for compat.
- `src/app-shell/surfaces.ts` — re-exports `CANONICAL_SURFACES`. Marked `@deprecated`.
- `src/app-shell/AppShell.tsx` — marked `@deprecated` (dead skeleton).

## Phase B — shell collapse (DONE)

Verified state:
- `App.tsx` mounts only `ProtectedAppShellV2` → `ShellV2` for every protected
  route. No `ProtectedAppShell` / `DashboardLayout` / `HubModalProvider` /
  `HubModalHost` / `MindOSSheet` symbols are imported anywhere in `src/`.
- `/`, `/aurora`, `/brain`, `/outer-world` mount inside `ShellV2`. `/profile`
  redirects to `/aurora` (still ShellV2-owned); a dedicated `/profile`
  surface route lands in Phase C.
- `OnboardingGate` is the existing no-op passthrough — no legacy onboarding
  redirects fire.

Deleted:
- `src/app-shell/**` (AppShell skeleton, surfaces re-export, featureFlag,
  empty OverlayHost / overlayStore / registry).

Inlined:
- `isAionTraceEnabled` moved from `src/app-shell/featureFlag.ts` into
  `src/diagnostics/aionTrace.ts` (only consumer).

Added:
- `ShellSentinel` tripwire inside `ProtectedAppShellV2`. Sets
  `window.__MINDOS_SHELL__ = 'ShellV2'`; logs `console.error` if any other
  shell ever sets that key in the same session. Dev-only `console.info`
  confirms ShellV2 is live.
- `withDeprecationLog(name, Component)` in `LegacyMountGuard` for Phase C
  page wrapping.

Reversibility:
- Phase B touches no DB, no edge functions, no providers, no pillar routes,
  no orchestration. Restoring `app-shell/` from git history is the only
  rollback step.

Still queued for later phases (NOT done in B):

- `src/shell/overlay/**` — used by `OverlayProvider` in App.tsx; collapses
  in Phase E together with the modal contexts.
- Modal contexts (Coaches, Profile, Subscriptions, Wallet, Story, Welcome,
  SmartOnboarding, HubModal, Sidebar, ChromeVisibility) — collapse into
  `shellv2/UnifiedOverlayHost`.

## Phase C — route collapse (queued)

Pages to delete (replaced by 5 surfaces + artifact intents):
- `src/pages/MindOSPage.tsx`, `src/pages/MindOS/**`
- `src/pages/PlayHub.tsx`, `src/pages/UserDashboard.tsx`, `src/pages/OuterWorldHub.tsx`
- `src/pages/LifeDomainPage.tsx`, `src/pages/ArenaDomainPage.tsx`
- `src/pages/CoachingJourney.tsx`, `src/pages/AdminJourney.tsx`,
  `src/pages/ProjectsJourney.tsx`, `src/pages/BusinessJourney.tsx`
- `src/pages/CreatorHub.tsx`, `src/pages/FreelancerHub.tsx`
- `src/components/pillars/ArenaLayoutWrapper.tsx`
- `src/hallway/**`, `src/presence/PresenceShell.tsx` + neighbors
- `src/_legacy/**`

## Phase D — single-writer enforcement (queued)

Audit `supabase.from('<owned-table>').{insert|update|upsert|delete}` outside
`supabase/functions/aion-capabilities/**`; route every writer through a
capability. Add ESLint `no-restricted-syntax` rule.

## Phase E — orchestration consolidation (queued)

- Delete `supabase/functions/aion-orchestrator/**`.
- `aurora-chat` becomes a thin SSE streamer over `aion-brain` decisions.
- Collapse `AuroraChatContext + AuroraActionsContext + AionDecisionContext +
  AIONStateContext` into a single `AIONContext`.

## Phase F — visual layer (queued)

- Delete legacy orb (`src/components/orb/` v1); keep only `v2/SharedOrbStage`.
- Brain graph: enforce Obsidian-style atlas via design tokens.

## Phase G — verification (queued)

- `LegacyMountGuard` zero hits for 48 h before any source delete.
- `knip` + `ts-prune` must report 0 unused files in `src/`.
- Update `docs/APP_MAP.md` and memory index to the 5-surface model.
