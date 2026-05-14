
## Phase D — Brain + Journey Consolidation (DONE)

### Routes changed
- Added `/journey` → `StrategyPage` (canonical Journey surface; same engines as `/strategy`).
- `/strategy` remains mounted only for legacy pillar deep-links (`/strategy/{pillar}/...`).
- Removed redirect `/journey → /strategy`; added catch-all `/journey/* → /journey`.

### Labels changed
- StrategyPage tabs: "Overview/Mission Control" → "Journey/Actions" (HE: "מסע/פעולות").
- ShellV2 mission sheet: "Mission Control / Strategy mission player" → "Actions / Journey action player".
- HeaderActions aria-label: "Open Mission Control" → "Open Journey Actions".
- Drawer already shows the 5 canonical labels (Phase C); no change needed.

### Brain source map (consolidated surface)
`/brain` (BrainPage) now renders, in order:
1. ShellHeader — "Consciousness Map".
2. **SelfPanel** (new) — pulls from `useAION` + `useDNA` → AION name/level, dominant+secondary archetype, ego state, mint status, top-3 confidence anchors from `BrainAtlas.rooms`.
3. ConsciousnessAtlas — rooms grid (`brain_get_atlas` RPC).
4. Legacy full graph (`BrainView`) collapsed inside `<details>`.

Backfill sources already wired through `useBrainFallback` / `aurora_memory_graph`:
- `launchpad_summaries` (onboarding history, identity_profile, clarity scores)
- `aurora_onboarding_progress`
- `domain_assessments` / pillar assessment results
- `journal_entries`, `aurora_conversations`
- `action_items`, `life_plans`
- `aurora_behavioral_patterns`, `aurora_identity_elements`
- `profiles` (ego_state, aion_name) via `useAION`

### Journey source map (consolidated surface)
`/journey` reuses `StrategyPage` engines untouched:
- `LifeHub` (Overview tab) — pillar overview, plan summaries, progress.
- `PlayLayoutWrapper` (Actions tab) — `action_items` execution, mission player, daily checklist.
- Strategy/plan/habit/hypnosis/work engines remain in their existing services and are summoned via deep-routes (`/strategy/{pillar}`, `/hypnosis`, `/journal`) until they migrate to artifacts in a later phase.

### Old pages still reachable
- `/strategy` — kept for the 60+ pillar deep-link routes; not advertised in nav.
- `/hypnosis`, `/journal` — reachable directly; will become Journey artifacts in a later phase.
- `/admin-hub`, `/coaches`, `/creator`, `/freelancer` — still routed (Outer World ecosystem, untouched).
- All Phase C quarantined pages still mounted with `withDeprecationLog`.

### Still feels dashboard-like (queued for later phases)
- StrategyPage Overview tab is dense (`LifeHub`); slated to become a single "Journey briefing" artifact.
- AdminHub, CoachesHub, etc. retain dashboard chrome — Outer World consolidation happens in a later phase.
- Action sheet on ShellV2 still uses sticky header tabs; acceptable for now.

### Remaining for provider collapse (Phase E)
- 25 providers in App tree (CoachesModalContext, ProfileModalContext, SubscriptionsModalContext, WalletModalContext, StoryWorldContext, WelcomeGateContext, SmartOnboardingContext, HubModalProvider, SidebarContext, ChromeVisibilityContext, OverlayProvider, etc.).
- `aion-orchestrator` edge function still active alongside `aion-brain` — consolidate into single writer.
- 60+ `/strategy/{pillar}/...` routes — collapse into a generic pillar route + room artifact.

### Reversibility
No DB, no provider, no orchestration touched. Rollback = `git revert`.
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

## Phase C — surface consolidation (IN PROGRESS)

Goal: user-facing perception collapses to **Chat / Brain / Journey / Outer
World / Profile**. Everything else becomes overlay, artifact, room, or
quarantined legacy route. No source deletions yet — this phase only hides,
redirects, and tags. Reversible.

### Quarantined pages (wrapped with `withDeprecationLog`)

Each emits a console breadcrumb on mount so we can verify zero real traffic
before deletion in a later phase.

- `src/pages/PlayHub.tsx` (still mounted via `PlayLayoutWrapper` inside
  `StrategyPage` Mission Control tab)
- `src/pages/MindOSPage.tsx` (orphan; no active route)
- `src/pages/LifeHub.tsx` (mounted via `LifeLayoutWrapper` inside
  `StrategyPage` Overview tab)
- `src/pages/UserDashboard.tsx` (orphan)
- `src/pages/ArenaDomainPage.tsx` (orphan; import only)
- `src/pages/LifeDomainPage.tsx` (mounted at `/strategy/:domainId`)
- `src/pages/CreatorHub.tsx`, `src/pages/FreelancerHub.tsx` (orphans)
- `src/pages/CoachingJourney.tsx`, `src/pages/AdminJourney.tsx`,
  `src/pages/ProjectsJourney.tsx` (mounted under `/coaching/journey`,
  `/admin/journey`, `/projects/journey`)

### Navigation collapsed to 5 surfaces

- `src/shellv2/ShellV2Drawer.tsx` — single section now renders the 5
  `CANONICAL_SURFACES` (Chat, Brain, Journey, Outer World, Profile). Old
  Practice / World / Core sections removed; FM / Strategy / Hypnosis /
  Journal / Community / Learn / History entries deleted from the drawer.
  Account footer keeps Settings + Sign-out (and Admin for admins).
- `src/components/navigation/DesktopSideNav.tsx` — switched from
  `getVisibleTabs(osNav)` (6 tabs incl. FM, Strategy, Hypnosis, Journal,
  Community, Study) to `CANONICAL_SURFACES`. No more per-tab color brand
  scheme; uses a single `primary` accent for the active surface.

### Redirects added

- `/journey`, `/journey/*` → `/strategy` (Journey surface alias until
  dedicated route exists).
- `/profile`, `/me`, `/dashboard`, `/hallway`, `/play*`, `/work*`, `/life`,
  `/career`, `/*-hub`, `/mindos*` redirects already in
  `PROTECTED_REDIRECTS` from Phase B remain.

### Hallway status

Still loaded (`HallwayShell`, `RoomEnvironment`) only because they are
imported at the top of `App.tsx`; **no public route mounts them**. They are
now reachable only via Brain exploration / AION actions, per spec. Kept
for the brain-room subsystem; do NOT delete in Phase C.

### Remaining leaks (NOT addressed in C — tracked for later phases)

1. **Legacy terminology in copy**: hundreds of UI strings still say
   "Hub", "Dashboard", "Launchpad", "Onboarding", "Wizard", "Arena",
   "Mission Control", "Workspace". A repo-wide rg shows >150 component
   files. A copy pass is its own phase — does not affect orchestration.
2. **Pillar route surface area**: ~45 `/strategy/<pillar>/...` routes
   remain in `App.tsx`. They live under the Journey surface conceptually
   but visually still feel like a SaaS pillar grid. Phase F (visual layer)
   will consolidate these into in-Journey artifacts.
3. **`osNav.ts`** — still imported by `ShellV2Drawer` *removed* and by
   `_legacy/README.md` (doc only). Safe to delete in Phase G after the
   `getVisibleTabs` callsite confirmation period.
4. **Career layout wrappers** (`Creator`, `Freelancer`, `Therapist`) still
   mount under `/creator`, `/freelancer`, `/therapist`. They are now
   reachable only via the Outer World surface (Coaches/Career rooms);
   `DesktopSideNav` and `ShellV2Drawer` no longer link to them.
5. **`ProfilePage`** is a portal-rendered modal opened via
   `ProfileModalContext`. The drawer Profile entry calls `openProfile()`;
   `/profile` URL still redirects to `/aurora`. A dedicated `/profile`
   route lands in Phase E together with the modal-context collapse.
6. Pages alive only because of orphan imports in `App.tsx`:
   `ArenaDomainPage`, `MindOSPage`. Imports kept until Phase D / E so
   tree-shaking & deprecation telemetry can confirm zero hits.

### Phase C did NOT touch (per scope):

- providers / context tree
- `aion-orchestrator` and friends
- `aion-capabilities` (single-writer enforcement is Phase D)
- DB schema or RPCs
- pillar route deletion
- hallway internals

## Phase C — route collapse (original draft, superseded above)

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
