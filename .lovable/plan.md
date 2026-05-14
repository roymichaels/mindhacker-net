
# MindOS Consolidation Plan

A staged, reversible collapse of the codebase into a single AION-orchestrated operating system. No new features. Every step either **merges**, **demotes to artifact**, or **deletes**.

## 1. Diagnosis — what is fragmenting the system today

**Three competing shells still wired:**
- `ShellV2` (canonical, `ProtectedAppShellV2`) — chat-first, layered.
- `app-shell/AppShell` skeleton (`ff_app_shell` flag) — dead scaffold + empty `OverlayHost`/registry.
- Legacy `DashboardLayout` + `MindOSPage` tabbed shell — referenced by `MINDOS_SECTIONS`, `DesktopSideNav`, `osNav`, `LayoutWrapper` files.

**Two navigation sources of truth:**
- `src/navigation/osNav.ts` → `OS_TABS` (FM, Strategy, Hypnosis, Journal, Community, Study) — driving `DesktopSideNav`.
- `src/app-shell/surfaces.ts` → `SURFACES` (Chat, Brain, Hallway, Strategy, OuterWorld, Me, Settings) — aspirational, unused.
- `src/pages/MindOSPage.tsx` → its own NavLink tab strip.

**Page-oriented hubs that contradict the state-oriented vision:**
- `MindOSPage` + `pages/MindOS/*` (Chat, Tactics, Strategy, Work, Journal)
- `PlayHub`, `UserDashboard`, `OuterWorldHub`, `LifeDomainPage`, `ArenaDomainPage`, `ArenaLayoutWrapper`, `WorkPage`, `BusinessJourney`, `CoachingJourney`, `ProjectsJourney`, `AdminJourney`, `CreatorHub`, `FreelancerHub`, `Coaches` listing, `HypnosisPage` (route).
- 60+ pillar assessment pages (`pages/pillars/*`) shaped as standalone screens instead of AION-summoned artifacts.

**Duplicate orchestration / engines:**
- `aurora-chat` ↔ `aion-orchestrator` ↔ `aion-brain` (all interpret intent).
- `useAuroraChat` + `AuroraChatContext` + `AuroraActionsContext` + `AionDecisionContext` + `AIONStateContext` + `useCommandBus` + `useSmartSuggestions`.
- Two orb stacks: legacy `components/orb/*` (v1) vs `components/orb/v2/SharedOrbStage` + `OrbView` (canonical per memory).
- Two overlay systems: `shell/overlay/OverlayController` + `app-shell/overlay/OverlayHost` + ad-hoc `*ModalProvider`s (Auth, Coaches, Profile, Subscriptions, Wallet, Avatar, Story, Welcome, SmartOnboarding, HubModal).
- Two hallway/presence layers: `hallway/HallwayShell` + `presence/PresenceShell` (both quarantined, still imported lazily).

**Single-writer rule violations:**
- `useAuroraChat`, `useDailyHabits`, `useLifeModel` and several pillar assess pages mutate plans/actions/habits directly instead of going through `aion-capabilities`.

**Dead / orphan code:**
- `src/_legacy/onboarding/*`, `src/app-shell/*`, `src/shell/overlay/*`, `src/hallway/*`, `src/presence/*` (PresenceShell), `pages/MindOSPage`, `pages/PlayHub`, `pages/UserDashboard`, all `*Hub`/`*Journey` pages above, `StrategyToMindOSRedirect`, `ArenaToMindOSRedirect`, `MotionLayer` if unused, redundant `AuroraPage` wrapper.

---

## 2. Target architecture (canonical, single source of truth)

```text
                 ┌─────────────────────────────┐
                 │           AION              │  (aion-brain + aion-capabilities)
                 │  intent → capability → fx   │
                 └──────────────┬──────────────┘
                                │ writes
   ┌─────────────┬──────────────┼──────────────┬─────────────┐
   ▼             ▼              ▼              ▼             ▼
 plans        actions         memory         identity      graph
 (capabilities are the ONLY writers; UI is read-only)

 UI layer (ShellV2 only):
   BackgroundLayer → ChatLayer → ComposerLayer → ChromeLayer → OverlayLayer → BlockingLayer
   Surfaces (5):  Chat · Brain · Journey · OuterWorld · Profile
   Everything else = overlay / artifact / room summoned by AION
```

**Five canonical surfaces** (replace both `OS_TABS` and `SURFACES`):

| id          | path           | role                                            |
|-------------|----------------|-------------------------------------------------|
| chat        | `/` (= aurora) | AION conversation + artifact dock               |
| brain       | `/brain`       | semantic graph / atlas / rooms                  |
| journey     | `/journey`     | plans, missions, actions, hypnosis (artifacts)  |
| outer-world | `/outer-world` | economy, community, coaches, FM                 |
| profile     | `/profile`     | identity, DNA, avatar, settings                 |

`/aurora`, `/strategy`, `/hypnosis`, `/journal`, `/community`, `/learn`, `/coaches`, `/fm`, `/messages` all become **redirects into a surface + overlay/artifact intent** (e.g. `/strategy` → `/journey?artifact=plan`).

---

## 3. Migration phases

### Phase A — Freeze & inventory (no behavior change)
1. Mark dead modules with `@deprecated` JSDoc + add to `docs/CLEANUP_REPORT.md`.
2. Lock `osNav.OS_TABS` and `app-shell/surfaces.SURFACES` to a single new `src/navigation/canonicalSurfaces.ts` (5 entries above). Both old files re-export from it during transition.
3. Add a `LegacyMountGuard` warning log on every legacy shell/page render so we can verify zero hits before deletion.

### Phase B — Collapse the shell
1. Delete `src/app-shell/*` (unused skeleton, empty registry, feature flag).
2. Delete legacy `components/layout/ProtectedAppShell.tsx` and `DashboardLayout` (and all its drawer/header children) once `LegacyMountGuard` shows zero hits.
3. Delete `src/shell/overlay/*`; collapse all `*ModalProvider` contexts (Auth, Coaches, Profile, Subscriptions, Wallet, HubModal, Welcome, Story, SmartOnboarding) into a single `OverlayLayer` registry inside `shellv2/UnifiedOverlayHost`.
4. Remove `MotionLayer`, `EnvironmentProvider`, `OnboardingGate` (no-op), and `SmartOnboardingProvider` if AION owns onboarding.
5. `App.tsx` provider stack drops from ~25 nested providers to: `Auth → Language → Query → ShellV2Providers (Aion + Overlay + Sidebar + Theme) → Routes`.

### Phase C — Collapse navigation & routes
1. Replace `App.tsx` route table with the 5 canonical surfaces + dynamic artifact routes:
   - `/` → ChatSurface (currently `AuroraPage`)
   - `/brain` → BrainPage (already ShellV2)
   - `/journey` → JourneySurface (merges Strategy + Tactics + Work + Hypnosis + Journal as artifacts toggled by query string)
   - `/outer-world` → OuterWorldSurface (merges FM + Community + Coaches + Messages as inner panels)
   - `/profile` → ProfileSurface (merges Profile + Avatar + Subscriptions overlays)
2. Move every legacy path (`/strategy*`, `/mindos/*`, `/hypnosis`, `/journal`, `/play*`, `/now`, `/plan`, `/work*`, `/dashboard`, `/life*`, `/career`, `/me`, `/coaches`, `/fm`, `/community`, `/messages`, `/learn`, `/business*`, `/freelancer`, `/creator`, `/therapist`, `/arena*`, `/quests/*`, all `*Hub`/`*Journey`) into `PROTECTED_REDIRECTS` pointing at one of the 5 surfaces with the right artifact intent.
3. Pillar assessments (`pages/pillars/*`, ~60 files) become **artifacts mounted inside `/brain?artifact=pillar:<id>`**, not standalone routes. Existing components are reused as artifact bodies; routes deleted.
4. Delete: `MindOSPage`, `pages/MindOS/*`, `PlayHub`, `UserDashboard`, `OuterWorldHub` (replace with new surface), `LifeDomainPage`, `ArenaDomainPage`, `ArenaLayoutWrapper`, `*Journey` (Coaching/Admin/Projects/Business), `CreatorHub`, `FreelancerHub`, redirect-only redirector components.
5. Delete `src/hallway/*` and `src/presence/PresenceShell` + `StateTransition` + `presenceSignals` (PresenceShell is documented as quarantined; SmartRoot already routes around it).
6. Delete `src/_legacy/onboarding/*`.

### Phase D — Single-writer enforcement
1. Audit every `supabase.from('plans'|'action_items'|'habits'|'identity'|'profiles'|'journal_entries'|'missions'|'graph_*').upsert/insert/update/delete` call in `src/`. Each one must move behind an `aion-capabilities` capability.
2. Hooks `useAuroraChat`, `useDailyHabits`, `useLifeModel`, `useChecklistsData` become read-only + `invokeCapability(name, args)` callers. The chat can never mutate; only capability handlers can.
3. Add an ESLint rule (`no-restricted-syntax`) forbidding `.from('<owned-table>')` writes outside `supabase/functions/aion-capabilities/**` and `supabase/functions/_shared/capabilityRegistry.ts`.

### Phase E — Orchestration consolidation
1. `aion-brain` becomes the only intent interpreter. `aurora-chat` becomes a thin SSE streamer that calls `aion-brain` for tool selection, then renders.
2. Delete `aion-orchestrator` (functionality already in brain + capabilities). Keep `memory-writer` as a capability.
3. Collapse contexts: `AuroraChatContext` + `AuroraActionsContext` + `AionDecisionContext` + `AIONStateContext` → single `AIONContext` exposing `{ state, send(intent), invoke(capability), subscribe(events) }`.
4. `useCommandBus` + `useSmartSuggestions` merge into `AIONContext.suggestions` derived from brain output.

### Phase F — Visual layer cleanup
1. Delete legacy `components/orb/*` v1; keep only `components/orb/v2/SharedOrbStage` + `OrbView` (per memory rule).
2. Brain graph: replace decorative `BrainGraphForce` defaults with the documented Obsidian-style atlas (`atlas/ConsciousnessAtlas` + `RoomView`); enforce the look via design tokens, not color literals.
3. Remove duplicated background effect chooser noise — keep `BackgroundLayer` as the single owner.

### Phase G — Verification & deletion
1. `LegacyMountGuard` must show zero hits for 48 h of preview/published usage before any source delete.
2. Run `knip` + `ts-prune`; delete every file flagged that's not in the keep-list.
3. Update `docs/APP_MAP.md` + memory `mem://architecture/...` entries to reflect the 5-surface model and unified orchestration. Retire stale memory entries (Hallway World-First, Play Hub variants, AION Persistent Widget, Standardized Shell V3, Pillar Continuity if redundant).

---

## 4. Deletion candidates (concrete list)

Folders / files to remove at end of phases B–G:

- `src/app-shell/**`
- `src/shell/overlay/**`
- `src/_legacy/**`
- `src/hallway/**`
- `src/presence/PresenceShell.tsx`, `presence/StateTransition.tsx`, `presence/presenceSignals.ts`, `presence/useActiveState.ts`
- `src/pages/MindOSPage.tsx`, `src/pages/MindOS/**`
- `src/pages/PlayHub.tsx`, `src/pages/UserDashboard.tsx`, `src/pages/OuterWorldHub.tsx` (replaced)
- `src/pages/LifeDomainPage.tsx`, `src/pages/ArenaDomainPage.tsx`, `src/components/pillars/ArenaLayoutWrapper.tsx`
- `src/pages/CoachingJourney.tsx`, `src/pages/AdminJourney.tsx`, `src/pages/ProjectsJourney.tsx`, `src/pages/BusinessJourney.tsx`
- `src/pages/CreatorHub.tsx`, `src/pages/FreelancerHub.tsx`
- `src/components/layout/DashboardLayout.tsx` and legacy `ProtectedAppShell.tsx` (after guard zeroes)
- `src/components/orb/` v1 renderers (keep only `v2/`)
- `src/contexts/{Auth,Coaches,Profile,Subscriptions,Wallet,Story,Welcome,SmartOnboarding,Sidebar,ChromeVisibility}ModalContext.tsx` after merge into unified overlay registry (Auth stays; the rest collapse)
- `src/navigation/osNav.ts`, `src/app-shell/surfaces.ts` (replaced by `canonicalSurfaces.ts`)
- `supabase/functions/aion-orchestrator/**` (after brain absorbs it)

Estimated reduction: ~120 source files, ~25 providers → 6, ~70 routes → 5 surfaces + redirects.

---

## 5. Risks & mitigations

- **External deep-links / SEO** → keep redirects forever; never 404 a legacy path.
- **Capability gaps** → before deleting a writer, confirm a capability exists (`plan.create`, `plan.delete`, `plan.restart`, `action.toggle`, `habit.upsert`, `journal.write`, `identity.update`, `mission.generate`, `hypnosis.start`).
- **Hebrew RTL regressions** → snapshot every surface in `he` before/after the merge; enforce logical Tailwind props, no hardcoded `left/right`.
- **Mobile chrome** → ShellV2 already targets `100dvh`; verify `BackgroundLayer` z-stack on iOS Safari after provider stack collapse.

---

## 6. Acceptance criteria

1. Exactly one shell component renders for any authed route (`ShellV2`).
2. Exactly one navigation file (`canonicalSurfaces.ts`) with exactly 5 entries.
3. `App.tsx` `<Routes>` declares ≤ 10 protected routes (5 surfaces + auth/legal/dev) plus the redirect map.
4. `grep -R "supabase.from(" src/ | grep -E "(insert|update|delete|upsert)"` returns **zero** results outside read-only data access hooks.
5. `aion-brain` is the only edge function that calls the LLM for intent; `aurora-chat` only streams its decisions.
6. `knip` reports 0 unused files in `src/` after Phase G.
7. APP_MAP.md and memory index reflect the 5-surface model; no references to MindOSPage / PlayHub / Hallway remain.

---

## 7. Out of scope (explicitly)

- New features, new visuals, new copy.
- Backend schema changes beyond capability routing.
- Stripe/economy logic, FM tokenomics, ElevenLabs TTS.
- Auth provider swap.

The plan is a **demolition + re-wiring** project, not a build. Awaiting approval to begin Phase A.
