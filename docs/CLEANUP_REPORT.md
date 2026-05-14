
## Phase F · Step 1 — AION Orchestration Wiring (DONE — observe mode only)

## Phase F · Step 3 — Safe Read Capabilities (DONE — read + suggest execute)

### What shipped
1. **Mode model expanded** (`src/orchestration/capabilities/registry.ts`):
   `CapabilityMode = 'observe' | 'read' | 'suggest' | 'mutate' | 'destructive'`.
   `effectiveMode()` now allows ONLY `read | suggest` to execute; `mutate`,
   `destructive`, unknown, and `unsafe` capabilities collapse to `observe`.
   No capability declares `mutate` or `destructive` yet.
2. **Per-capability declared modes** (read unless noted):
   - `brain.query`, `brain.openRoom` → `read` (artifact `brain.room`)
   - `journey.nextAction`, `journey.summarize` → `read`
   - `profile.summarize`, `hypnosis.recommend`, `outerWorld.open` → `read`
   - `plan.suggest`, `task.suggest`, `journal.capture` → `suggest` (preview only)
3. **Safe read executor** (`src/orchestration/executors/safeReadExecutor.ts`)
   — RLS-scoped queries against existing tables, returns
   `{ ok, summary, sources, rowCounts, data, durationMs, error }`.
   Sources per capability:

   | Capability | Tables read |
   |---|---|
   | `brain.query`, `brain.openRoom` | `aurora_memory_graph` (active, top 8), `pillar_confidence` (top 3) |
   | `journey.nextAction`, `task.suggest` | `action_items` where status in (todo, in_progress), prefer `scheduled_date = today` |
   | `journey.summarize`, `plan.suggest` | `life_plans` (latest), `action_items` counts (open/completed) |
   | `profile.summarize` | `profiles`, `aurora_identity_elements` |
   | `hypnosis.recommend` | `hypnosis_audios` (catalog, 3 latest + count) |
   | `journal.capture` (preview) | `journal_entries` (3 latest + count) |
   | `outerWorld.open` | `coach_landing_pages`, `community_posts` (counts only) |

4. **Chat wiring** (`src/hooks/aurora/useAuroraChat.tsx`): after the router
   decision, if `mode ∈ {read, suggest}` and a user is signed in, the chat
   hook awaits `executeReadCapability()` and emits new trace marks
   `capability.executed { sources, row_counts, duration_ms, ok, error }`
   plus `graph.read { sources, row_counts }`. The result is then passed to
   the bridge, which uses `read.summary` as the artifact body (clamped to
   220 chars). Errors → `capability.error`. No DB writes.
5. **Bridge grounding** (`src/orchestration/artifacts/safeBridge.ts`):
   `bridgeDecisionToArtifact(decision, tracer, read?)` now accepts an
   optional read result. When present and `ok`, the artifact body is the
   live summary; trace mark gains `grounded:true` and `read_sources`.
6. **Router rules extended** for the new acceptance prompts:
   `מה אתה יודע עליי?` → `profile.summarize`,
   `מה המצב של המסע שלי?` → `journey.summarize`.
7. **Diagnostics harness** (`AIONRouterAcceptance.tsx`) gains a `Mode`
   column so observe vs read vs suggest is visible at a glance.

### Acceptance — 5 prompts (live wiring)

| Prompt (HE) | Capability | Mode | Sources read | Artifact | Result |
|---|---|---|---|---|---|
| מה אתה יודע עליי? | `profile.summarize` | read | `profiles:self`, `aurora_identity_elements:self` | `note` (profile.summary) | rendered, body grounded in profile |
| מה כדאי לי לעשות היום? | `journey.nextAction` | read | `action_items:open` | `next_action` (journey.next) | rendered, body shows pick title or empty-state |
| תראה לי את המוח שלי | `brain.query` | read | `aurora_memory_graph:active`, `pillar_confidence:top3` | `insight` (brain.room) | rendered, body lists top pillars + node count |
| מה המצב של המסע שלי? | `journey.summarize` | read | `life_plans:latest`, `action_items:counts` | `plan_summary` (journey.summary) | rendered, body shows plan status + open/done counts |
| אני רוצה לישון יותר טוב | `hypnosis.recommend` | read | `hypnosis_audios:catalog` | `capability` (hypnosis.session) | rendered, body shows catalog count + sample title |

Trace stream per turn:
`turn.start → sense.dispatched → capability.candidate → capability.executed → graph.read → artifact.candidate{grounded:true} → stream.start → stream.end → post.memory-writer → turn.end`.

### What did NOT change
- No mutating capability is wired (`plan.create`, `plan.update`, `plan.restart`,
  `plan.delete`, `mission.create`, `mission.complete`, `habit.create`,
  `action.create`, `identity.updateProfile`, `landing.generate`,
  `business.createDraft` remain absent from the registry / executor).
- `journal.capture` runs as PREVIEW only (`journal_entries:recent` read).
- No new tables, no migrations, no edge function changes.
- `<<AION_ARTIFACT>>` server pipeline untouched.
- The chat LLM still produces the conversational reply; AION's "I found…"
  claims are now backed by a structured read summary attached to the same
  trace, not invented.

### Known gaps for Step 4+
- The chat reply body itself is not yet seeded with the read summary —
  only the artifact card is. Step 4 should inject the read result as a
  system message into the chat context so the model is forced to ground.
- `task.suggest` and `plan.suggest` reuse the journey reads. Real
  suggestion synthesis (e.g. "smallest next win across pillars") still
  needs its own read query.
- `outerWorld.open` returns availability counts only — no per-surface
  routing yet (Step 5 will expand to coach/market/community subkinds).

## Phase F · Step 2 — Safe Artifact Bridge (DONE — observe + safe render)

### What shipped
1. **Safe bridge module** (`src/orchestration/artifacts/safeBridge.ts`) —
   pure mapping from capability `artifactKind` (registry) → an EXISTING
   renderer kind on the artifact bus (`next_action | journal_capture |
   plan_summary | note | insight | capability | confirm`). One artifact max
   per turn. CTAs are href-only — no `onClick` handlers, no capability
   invokes, no DB writes. `journal.entry` (capability marked `unsafe`) is
   blocked at the bridge with reason `unsafe-capability`.
2. **Chat wiring** (`src/hooks/aurora/useAuroraChat.tsx`) — replaced the
   placeholder `artifact.candidate {would_emit:false}` mark with a single
   call to `bridgeDecisionToArtifact(decision, tracer)`. Errors caught into
   `artifact.skipped {reason:'bridge-error'}`. Existing `<<AION_ARTIFACT>>`
   sentinel pipeline (Phase 3) is untouched and still runs after the stream
   resolves; bridge runs pre-stream so even silent turns get a card.
3. **Acceptance harness updated** (`src/diagnostics/sections/AIONRouterAcceptance.tsx`)
   — adds `Renderer / Bridge / Reason` columns powered by `previewBridge()`.
4. **Trace contract** — every bridged turn emits exactly ONE of:
   - `artifact.candidate {rendered:true, source_kind, renderer_kind, artifact_id, has_cta}`
   - `artifact.skipped {reason: missing_renderer | unsafe-capability | no-artifact-kind | bridge-error}`
   `artifact_id` is `art_<traceId>_<sourceKind>` so the rendered card is
   trivially linkable back to its trace.

### Capability → Renderer mapping

| Capability `artifactKind` | Renderer kind | CTA href | Notes |
|---|---|---|---|
| `brain.room` | `insight` | `/brain` | Brain preview |
| `journey.next` | `next_action` | `/journey` | Next-action card |
| `journey.summary` | `plan_summary` | `/journey` | Journey summary |
| `plan.draft` | `plan_summary` | — | Suggestion only, no save |
| `task.draft` | `next_action` | — | Suggestion only, no save |
| `hypnosis.session` | `capability` | `/hypnosis` | Player preview |
| `outer-world.surface` | `capability` | `/outer-world` | Surface preview |
| `profile.summary` | `note` | `/brain?panel=profile` | Identity card |
| `journal.entry` | — | — | BLOCKED (unsafe) |
| `null` (e.g. `brain.query`) | — | — | `no-artifact-kind` |

### Acceptance — 5 prompts (`previewBridge` + router)

| Prompt (HE) | Capability | Source artifact | Renderer | Result | Reason |
|---|---|---|---|---|---|
| מה כדאי לי לעשות היום? | `journey.nextAction` | `journey.next` | `next_action` | rendered | `keyword:מה כדאי…` |
| אני תקוע | `journey.nextAction` | `journey.next` | `next_action` | rendered | same |
| תראה לי את המוח שלי | `brain.query` | `null` | — | skipped | `no-artifact-kind` |
| תבנה לי עסק | `plan.suggest` | `plan.draft` | `plan_summary` | rendered | `keyword:עסק…` |
| אני רוצה לישון יותר טוב | `hypnosis.recommend` | `hypnosis.session` | `capability` | rendered | `keyword:לישון…` |

`trace_id` per turn is the live `tracer.id` (e.g. `trc_<base36>_<rand>`),
visible in `AIONTracePanel`. Bridge marks share that `traceId` and the
`artifact_id` echoes it.

### What did NOT change
- `effectiveMode()` still hard-pins every capability to `observe`.
- No edge function, RPC, or DB migration touched.
- No mutation to plans / tasks / profile / DNA / actions.
- `<<AION_ARTIFACT>>` server-driven sentinels still flow through unmodified.
- ArtifactLayer renderer untouched (no new kinds added).

### Known gaps for Step 3+
- Bridge runs even when the chat eventually ALSO emits a server sentinel of
  the same `kind`; ArtifactLayer dedupes by `id` but a same-kind card could
  briefly stack. Acceptable for observe mode.
- `brain.query` has `artifactKind: null` → silent skip. If we want a Brain
  preview for plain queries, add `brain.query.artifactKind = 'brain.room'`
  (or a new dedicated kind) in Step 3.
- CTAs are href-only; no capability `execute` from a card yet — by design.

### What shipped
1. **Trace stages extended** (`src/diagnostics/diagnosticsBus.ts`):
   added `intent.detected`, `emotion.detected`, `graph.read`,
   `capability.candidate`, `capability.skipped`, `artifact.candidate`,
   `artifact.skipped`, `router.error` to `AionTraceEvent.stage`.
   Existing `AIONTracePanel` timeline renders them generically.
2. **Capability registry** (`src/orchestration/capabilities/registry.ts`) —
   typed-only, 10 capabilities (`brain.query`, `brain.openRoom`,
   `journey.nextAction`, `journey.summarize`, `plan.suggest`, `task.suggest`,
   `journal.capture`, `hypnosis.recommend`, `outerWorld.open`,
   `profile.summarize`). Each has id, description, Zod input schema, safety,
   artifactKind, declaredMode. `effectiveMode()` hard-overrides every entry
   to `observe` for Phase 1.
3. **Observe-mode router** (`src/orchestration/router/observeRouter.ts`) —
   pure function with bilingual (HE/EN) keyword rules. Returns
   `{ capability, artifactKind, mode, reason, matchedKeywords, skipped, skippedReason }`.
   Never invokes anything.
4. **Wired into chat turn** (`src/hooks/aurora/useAuroraChat.tsx`) — after
   `sense.dispatched`, the router runs and emits up to three trace marks per
   turn (`capability.candidate`, `artifact.candidate`, `capability.skipped`).
   Errors caught into `router.error`. No mutation, no UI change.
5. **Acceptance harness** (`src/diagnostics/sections/AIONRouterAcceptance.tsx`)
   added as section "0b" in DiagnosticsSheet. Runs the 5 prompts through
   `routeObserve()` and prints the decision table inline.

### Acceptance trace (router output for the 5 prompts)

| Prompt (HE) | Capability | Artifact | Mode | Reason | Skipped |
|---|---|---|---|---|---|
| מה כדאי לי לעשות היום? | `journey.nextAction` | `journey.next` | observe | `keyword:מה כדאי\|מה לעשות\|אני תקוע\|הצעד הבא` | phase-1-observe-only |
| אני תקוע | `journey.nextAction` | `journey.next` | observe | same | phase-1-observe-only |
| תראה לי את המוח שלי | `brain.query` | — | observe | `keyword:המוח שלי\|מפת תודעה\|מי אני` | phase-1-observe-only |
| תבנה לי עסק | `plan.suggest` | `plan.draft` | observe | `keyword:תוכנית\|אסטרטגיה\|מסלול\|עסק` | phase-1-observe-only |
| אני רוצה לישון יותר טוב | `hypnosis.recommend` | `hypnosis.session` | observe | `keyword:לישון\|להירדם\|להירגע\|היפנוזה` | phase-1-observe-only |

On every live turn the same decision is now visible in dev:
`turn.start → sense.dispatched → capability.candidate → artifact.candidate → capability.skipped → stream.start → stream.end → post.memory-writer → turn.end`.

### What did NOT change
- `aion-orchestrator` edge function untouched.
- `aion-brain`, memory-writer, planning engines untouched.
- No DB migrations.
- No new UI for end users; the harness lives only inside `DiagnosticsSheet` (dev-only).
- All capabilities locked to `observe` regardless of declared mode.

### Risks queued for Step 2
- Router heuristics are keyword-based; needs reconciliation with real
  `intent.classify` results (currently fire-and-forget).
- Capability execution paths still live in the chat hook + plan engine
  rather than behind the registry — Step 2 will move them.
- `aion-orchestrator` and `aion-brain` overlap; Step 2 will pick a single
  writer.

### Reversibility
Two new files + 3 patches. Rollback = `git revert`.

## Phase E — Provider + Overlay Consolidation (DONE — non-destructive audit + targeted removals)

### Provider table

| Provider | Before | After | Disposition |
|---|---|---|---|
| AuthProvider | root | root | KEEP root |
| AuroraChatProvider | root | root | KEEP root |
| LanguageProvider | root | root | KEEP root |
| AuthModalProvider | root | root | KEEP root (auth gate) |
| GameStateProvider | root | root | KEEP root |
| AionDecisionProvider | root | root | KEEP root (must stay above EnvironmentProvider) |
| EnvironmentProvider | root | root | KEEP root (always-on) |
| MotionLayer | root | root | KEEP root |
| AIONStateProvider + bridges | root | root | KEEP root |
| TooltipProvider | root | root | KEEP root |
| SoulAvatarProvider | root | root | KEEP root (identity-wide) |
| FlowAuditProvider | root | root | KEEP root |
| AnalyticsProvider | root | root | KEEP root |
| ThemeProvider | root | root | KEEP root |
| OverlayProvider (`src/shell/overlay`) | root | root, deprecated | KEEP — still wired by ShellV2Header/Drawer/InteractiveAION + UnifiedOverlayHost. Sole allowed overlay manager. Phase F will absorb its 3 non-shellv2 callers. |
| SubscriptionsModalProvider | root | root, deprecated | KEEP — too many call sites. Phase F replaces with overlay action. |
| CoachesModalProvider | root | root, deprecated | KEEP — same. |
| WalletModalProvider | root | root, deprecated | KEEP — same. |
| ProfileModalProvider | root | root, deprecated | KEEP — now driven by `/brain?panel=profile` route (no auto-mount). Phase F replaces with overlay action. |
| StoryWorldProvider | root | root | KEEP root for now — `useSwipeNavigation` consumes it widely. Will move into `/story` route in Phase F. |
| SmartOnboardingProvider | root | root | KEEP root — exposes `smartNavigate()` helper used by 9 surfaces (NextStepGuide, LaunchpadProgress, IdentityProfileCard, useAuroraCommands, etc.). Not an auto-gate; just nav routing. Rename queued for Phase F. |
| WelcomeGateContext | (file exists, never mounted) | unchanged | DEAD — context defined but never wrapped at root. No action needed. |
| ChromeVisibilityContext | mounted via ProtectedAppShellV2 | mounted via ProtectedAppShellV2 | KEEP — feature-local to shell. |
| SidebarContext | mounted via ProtectedAppShellV2 | mounted via ProtectedAppShellV2 | KEEP — shell-local. |

### Global modals removed (auto-mount gates)
- **`<AvatarRequiredModal />`** — was unconditionally mounted at App root and force-opened a fullscreen avatar configurator for any user without an avatar. **REMOVED.** Avatar requirement now enforced inline at the avatar feature surfaces. Lazy import also dropped.

### Global modals retained (open-on-demand, not auto-mount)
- `<SubscriptionsModal />` — opens via `useSubscriptionsModal().open()`.
- `<WalletModal />` — opens via `useWalletModal().open()`.
- `<ProfilePage />` — opens via `useProfileModal().openProfile()`. Now also opened by `/brain?panel=profile`.
- `<SoulAvatarMintWizardGlobal />` — wallet-mint wizard, gated by internal state, not auto.
- `<CloudAuthModal />` — auth gate (allowed).
- `<InteractiveAIONHost />`, `<SharedOrbStage />`, `<DiagnosticsHost />`, `<PWAUpdatePrompt />`, `<NotificationPermissionPrompt />`, `<CookieConsent />` — system surfaces (allowed).

### Overlay roots
- **Before:** two overlay systems live in parallel — `OverlayProvider` (`src/shell/overlay/OverlayController`) and `UnifiedOverlayHost` (`src/shellv2/UnifiedOverlayHost`). 6 modal contexts (Profile/Coaches/Wallet/Subscriptions/StoryWorld/SmartOnboarding) bypass both with portal-based mounts at App root.
- **After:** `UnifiedOverlayHost` is the canonical overlay manager (mounted by `ProtectedAppShellV2`). `OverlayProvider` retained as the underlying store but only `UnifiedOverlayHost`, `ShellV2Header`, `ShellV2Drawer`, and `InteractiveAION` may write to it. 5 portal modals (Subs/Wallet/Profile/Avatar-mint/CloudAuth) remain at root pending Phase F migration.

### Routes verified
- `/profile` → `/brain?panel=profile` (was `/aurora`). BrainPage opens the profile overlay once, then strips `?panel`.
- `/profile-hub` → `/brain?panel=profile` (was `/aurora`).
- All other ShellV2 routes (`/`, `/aurora`, `/brain`, `/journey`, `/outer-world`) unchanged.
- `/strategy` and 60+ pillar deep-routes unchanged.

### Allowed overlay categories (UnifiedOverlayHost contract)
menu · history · settings · account/profile · wallet · subscription · confirmation · artifact-fullscreen · debug/diagnostics

### Anything still globally mounted
5 portal modals at App root (listed above) + 6 modal-provider contexts wrapping the tree. Acceptable for Phase E (no behavior change); Phase F will migrate each to overlay actions.

### Risks left for Phase F
- Replacing `useProfileModal().openProfile()` / `useCoachesModal()` / `useWalletModal()` / `useSubscriptionsModal()` call sites with `overlay.open({ kind: 'profile' | 'coaches' | ... })` is a wide refactor (~40 call sites).
- `OverlayProvider` ↔ `UnifiedOverlayHost` are coupled; collapsing them needs the dual-store reconciliation in Phase F.
- `StoryWorldProvider` is read by `useSwipeNavigation` globally — moving it into `/story` requires either inlining the swipe logic or defaulting to a no-op outside Story.
- `SmartOnboardingProvider` rename to `SmartNavProvider` is cosmetic but touches 9 files.
- AvatarRequiredModal removal: users without avatars no longer get a forced gate; verify avatar-dependent features (mint flow, profile triad) handle the empty state.

### Reversibility
No DB, no orchestration, no engines touched. Two file-level deletions (AvatarRequiredModal global mount + lazy import). Rollback = `git revert`.

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

## Phase F · Step 4 — Confirmation Flow (executed)

Added confirm-required capabilities and the confirmation bridge.

### New capabilities (registry.ts)

| id | mode | safety | confirm-required | mutation endpoint |
|---|---|---|---|---|
| action.complete | mutate | safe | yes | `completeAction()` → `action_items` |
| hypnosis.start  | mutate | safe | yes | preview-only (no endpoint) |
| journal.capture | suggest | safe | yes | `createJournalEntry()` → `journal_entries` |

`effectiveMode()` now demotes any `mutate` capability to `observe`. Mutations
flow exclusively through the confirm artifact.

### Files

- `src/orchestration/capabilities/registry.ts` — `CONFIRM_REQUIRED_CAPABILITIES`
- `src/orchestration/router/observeRouter.ts` — keyword rules for
  `action.complete`, `hypnosis.start`, refined `journal.capture`,
  tightened `brain.openRoom`
- `src/orchestration/executors/safeMutationExecutor.ts` (new)
- `src/orchestration/artifacts/confirmationBridge.ts` (new)
- `src/components/aion/artifacts/artifactBus.ts` — `secondaryCta`, `meta`
- `src/components/aion/artifacts/ArtifactLayer.tsx` — render confirm/cancel pair
- `src/diagnostics/diagnosticsBus.ts` — new stages
  (`suggestion.generated`, `confirmation.shown/accepted/cancelled`,
  `mutation.executed/skipped`)
- `src/hooks/aurora/useAuroraChat.tsx` — confirmation bridge wiring
- `src/diagnostics/sections/AIONRouterAcceptance.tsx` — new acceptance prompts

### Acceptance prompts (router preview)

| Prompt | Capability | Mode | Flow |
|---|---|---|---|
| תשמור את זה ביומן | journal.capture | observe (mutate-gated) | confirm |
| סמן שסיימתי את זה | action.complete | observe (mutate-gated) | confirm |
| אני רוצה לישון יותר טוב | hypnosis.recommend | read | rendered (capability) |
| מה כדאי לי לעשות עכשיו? | journey.nextAction | read | rendered (next_action) |
| פתח לי את החדר של האמונות | brain.openRoom | read | rendered (insight) |

### Still disabled (forced to observe)

`plan.create`, `plan.restart`, `plan.delete`, `action.create`,
`mission.create`, `habit.create`, `identity.updateProfile`,
`landing.generate`, `business.createDraft`. None appear in registry; no
router rule maps to them; bridge has no renderer.

## Phase F · Step 5 — Contextual Intelligence + Curiosity Engine (executed)

AION now builds a token-budgeted context packet before every routed turn,
emits a single curiosity probe or contradiction mirror under strict cooldowns,
and tracks repetition / artifact-cooldown state in `sessionStorage`.

### New modules

- `src/orchestration/context/contextBuilder.ts` — `buildContextPacket()`,
  `summarizeContext()`. Reads top nodes, lowest pillars, open contradictions,
  active plan, open actions, behavioral patterns, emotion drift. Compact
  output only — no raw rows leave the function.
- `src/orchestration/graph/graphDepth.ts` — `computeGraphDepth()`. Sparsity
  score, top + neglected rooms, average confidence.
- `src/orchestration/curiosity/probeEngine.ts` — `chooseProbe()`. One probe
  max; templates are HE/EN; FORBIDDEN regex blocks "assessment / pillar /
  confidence / intake / analysis" in either language; single-question rule
  enforced.
- `src/orchestration/contradictions/contradictionEngine.ts` —
  `chooseContradiction()`. Both source nodes must have strength ≥ 5 and
  graph average confidence ≥ 35; mirroring tone only.
- `src/orchestration/memory/repetitionGuard.ts` — turn-based probe gap (3),
  6h contradiction cooldown per pair, 5min artifact-kind cooldown,
  assistant-text + probe-text hash caches.

### Wiring (`src/hooks/aurora/useAuroraChat.tsx`)

Per turn, before the router fires:
1. `bumpTurn()` + `buildContextPacket()` → `graph_context_loaded`,
   `sparsity_score`, `contradiction_candidates` (when present), `memory_hits`.
2. Router runs as before. After bridge:
   - `chooseContradiction()` first (priority); on success →
     `contradiction.injected` + sticky `insight` artifact; otherwise
     `contradiction.skipped` with reason.
   - Otherwise `chooseProbe()` → `probe.candidate`, then either
     `probe.injected` (sticky `insight` artifact) or `probe.skipped` with
     reason (`urgent-intent`, `cooldown:turn-gap`, `repeat-probe`,
     `cooldown:insight`, …). `artifact.cooldown_hit` emitted on kind clash.
3. Confirmation flow from Step 4 still runs first for mutation capabilities.

### New trace stages (`src/diagnostics/diagnosticsBus.ts`)

`graph_context_loaded`, `sparsity_score`, `contradiction_candidates`,
`contradiction.injected`, `contradiction.skipped`, `probe.candidate`,
`probe.injected`, `probe.skipped`, `repetition.detected`,
`response.regenerated`, `memory_hits`, `artifact.cooldown_hit`.

### Constraints honored

- No new UI surfaces — all output reuses the existing artifact bus
  (`insight` kind) and trace bus.
- No new mutations — context builder is read-only; probe + contradiction
  emit artifacts only.
- Probe never asks more than one question, never uses forbidden vocabulary,
  and is suppressed on directive turns + during 3-turn cooldown.
- Contradictions blocked when graph is too thin (`avg_confidence < 35`).
- Repetition guard suppresses identical probes and same-kind artifacts in
  short windows (sessionStorage scoped, no DB writes).

### Acceptance prompts

Designed to be re-run live (the harness still focuses on Step 4 router
preview; probe + contradiction need a real ContextPacket):

| Prompt | Expected behavior |
|---|---|
| אני מרגיש אבוד | reflective mode → probe candidate (`reflective-open` or `sparsity`); no urgent capability |
| אני לא יודע מה לעשות | directive mode → router routes `journey.nextAction`; probe suppressed (`urgent-intent`) |
| הכל מרגיש תקוע | reflective mode → probe eligible; contradiction surfaces if open + trust ≥ 35 |
| מה אתה יודע עליי? | curious mode → `profile.summarize` artifact; probe suppressed first turn after artifact |
| אני רוצה להשתנות | reflective mode → probe candidate, room-aware copy when neglected room exists |

Still disabled this phase: response regeneration on repetition (only the
detection event is emitted), autonomous probe injection into the streamed
assistant text (probes ride the artifact bus instead).
