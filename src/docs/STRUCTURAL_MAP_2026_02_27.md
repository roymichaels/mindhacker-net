# MindOS STRUCTURAL MAP — Dashboard / Arena / Core
## Generated: 2026-02-27 | Exhaustive, No Redesign

---

# 1️⃣ ROUTES & ENTRY POINTS

## Global Shell

All three areas share ONE root layout:

```
<ProtectedAppShell>                        // src/components/layout/ProtectedAppShell.tsx
  └─ <ProtectedRoute>                      // src/components/ProtectedRoute.tsx
       └─ <SidebarProvider>                // src/contexts/SidebarContext.tsx
            └─ <DashboardLayout>           // src/components/dashboard/DashboardLayout.tsx
                 └─ <Outlet />             // React Router child
```

**Guards (all three hubs)**:
- `ProtectedRoute`: Checks `supabase.auth.getUser()`. If unauthenticated → shows `AuthModal`. On dismiss → redirects to `/`.
- No role-based gate at the shell level (role gating is per-hub-wrapper).

**Navigation Config**: `src/navigation/osNav.ts`
- 4 visible tabs: Dashboard (`/dashboard`), Core (`/life`), Arena (`/arena`), Community (`/community`)
- Admin tab appended when `hasRole('admin')`

---

## A. DASHBOARD

| Property | Value |
|---|---|
| **Route** | `/dashboard` |
| **Layout Wrapper** | `DashboardLayoutWrapper` → `src/components/dashboard/DashboardLayoutWrapper.tsx` |
| **Page Component** | `UserDashboard` → `src/pages/UserDashboard.tsx` |
| **Guards** | `ProtectedRoute` (auth only). No role gate. No subscription gate. |
| **Conditional Redirects** | None. |
| **Pre-onboarding** | Sidebars set to `null` when `isLaunchpadComplete === false`. Body still renders `UserDashboard`. |
| **Post-onboarding** | `HudSidebar` (left) + `RoadmapSidebar` (right) injected via `useSidebars()`. |
| **Feature Flags** | `shouldTriggerSynthesis` → auto-opens `PillarSynthesisModal` when all 14 domains complete & no prior synthesis. |
| **Sidebar Injection** | `useSidebars(isLaunchpadComplete ? <HudSidebar /> : null, isLaunchpadComplete ? <RoadmapSidebar /> : null)` |

---

## B. CORE (Life / ליבה)

| Property | Value |
|---|---|
| **Route** | `/life` |
| **Layout Wrapper** | `LifeLayoutWrapper` → `src/components/life/LifeLayoutWrapper.tsx` |
| **Page Component** | `LifeHub` → `src/pages/LifeHub.tsx` |
| **Guards** | `ProtectedRoute` (auth only). No subscription gate on hub entry. |
| **Conditional Redirects** | None. |
| **Pre-onboarding** | Sidebars set to `null` when `isLaunchpadComplete === false`. Body still renders `LifeHub`. |
| **Post-onboarding** | `LifeHudSidebar` (left) + `LifeActivitySidebar` (right). |
| **Feature Flags** | None. |
| **Sub-routes** | `/life/:domainId` → `LifeDomainPage`, `/life/{domain}/assess` → chat assess, `/life/{domain}/results`, `/life/{domain}/history` |
| **Domains** | 7 CORE_DOMAINS: consciousness, presence, power, vitality, focus, combat, expansion |

---

## C. ARENA (זירה)

| Property | Value |
|---|---|
| **Route** | `/arena` |
| **Layout Wrapper** | `ArenaLayoutWrapper` → `src/components/arena/ArenaLayoutWrapper.tsx` |
| **Page Component** | `ArenaHub` → `src/pages/ArenaHub.tsx` |
| **Guards** | `ProtectedRoute` (auth) + `useSubscriptionGate().canAccessArenaFull` (Plus+ required). |
| **Conditional Redirects** | If `!canAccessArenaFull` → renders `ProGateOverlay` with `feature="arena" targetTier="plus"` instead of hub. |
| **Pre-onboarding** | Sidebars visible only when `isLaunchpadComplete && canAccessArenaFull`. |
| **Post-onboarding** | `ArenaHudSidebar` (left) + `ArenaActivitySidebar` (right). |
| **Feature Flags** | `canAccessArenaFull` from `useSubscriptionGate`. |
| **Sub-routes** | `/arena/:domainId` → `ArenaDomainPage`, `/arena/{domain}/assess`, `/arena/{domain}/results` |
| **Domains** | 7 ARENA_DOMAINS: wealth, influence, relationships, business, projects, play, order |

---

# 2️⃣ PAGE STRUCTURE (VISUAL TREE)

## A. Dashboard (`/dashboard`)

```
DashboardLayoutWrapper                     // src/components/dashboard/DashboardLayoutWrapper.tsx
├─ useSidebars(HudSidebar | null, RoadmapSidebar | null)
├─ <UserDashboard>                         // src/pages/UserDashboard.tsx
│   └─ <MobileHeroGrid planData={...}>     // src/components/dashboard/MobileHeroGrid.tsx
│       ├─ [HIDDEN div] Mobile HUD (class="hidden")
│       │   ├─ PersonalizedOrb
│       │   ├─ Identity Title badge
│       │   ├─ Level/Energy/Streak badges
│       │   ├─ Stats 3×2 grid (Awareness, Clarity, Readiness, Sessions, Minutes, Energy)
│       │   ├─ Start Session button
│       │   └─ Identity / Direction / Insights buttons → open modals
│       │
│       ├─ <DailyMilestonesSection hub="both">   // src/components/hubs/DailyMilestones.tsx
│       │   ├─ [if no plans] Generate 100-Day Plan CTA + pillar assessment grid
│       │   ├─ [if healing/generating] Syncing loader
│       │   └─ [if plans exist] Vertical roadmap timeline
│       │       ├─ Consciousness Hypnosis card (injected)
│       │       └─ Per-pillar milestone cards (14 pillars)
│       │           ├─ Execute button → ExecutionModal (if assessed) OR startAssessment()
│       │           └─ Completion checkmark
│       │
│       └─ <RecalibrationSummary>                 // src/components/dashboard/RecalibrationSummary.tsx
│
├─ <PillarSynthesisModal>                  // auto-opens when all 14 domains complete
│
└─ [Modals via MobileHeroGrid]
    ├─ MergedIdentityModal
    ├─ MergedDirectionModal
    ├─ MergedInsightsModal
    ├─ OrbDNAModal
    ├─ UpgradePromptModal
    └─ ExecutionModal
```

### Left Sidebar: HudSidebar (`src/components/dashboard/HudSidebar.tsx`)

```
<aside> (collapsed: w-16 | expanded: w-[280px])
├─ Collapse/Expand toggle
├─ [COLLAPSED]
│   ├─ PersonalizedOrb (60px)
│   ├─ Level badge
│   ├─ MapleStory-style EXP bar
│   ├─ Stats column (Energy, Streak, Awareness, Clarity, Readiness)
│   └─ Modal trigger buttons (Identity, Direction, Insights)
│
├─ [EXPANDED]
│   ├─ PersonalizedOrb (150px) → click opens OrbDNAModal
│   ├─ Identity title
│   ├─ Level / Energy / Streak badges
│   ├─ MapleStory-style EXP bar (wider)
│   ├─ Stats 3×2 grid (Readiness, Clarity, Awareness, Sessions, Minutes, Energy)
│   ├─ Identity / Direction / Insights buttons → open modals
│   ├─ Next Action button (if hasPlan && nextAction) OR Recalibrate button
│   └─ [Modals]
│       ├─ OrbDNAModal
│       ├─ MergedIdentityModal
│       ├─ MergedDirectionModal
│       └─ MergedInsightsModal
```

### Right Sidebar: RoadmapSidebar (`src/components/dashboard/RoadmapSidebar.tsx`)

```
<aside> (collapsed: w-14 | expanded: w-[260px])
├─ Collapse/Expand toggle
├─ [COLLAPSED]
│   ├─ Stats mini column
│   ├─ Phase dots (10 phases A-J)
│   ├─ Progress %
│   └─ Recalibrate button
│
├─ [EXPANDED]
│   ├─ Statistics label + 2×2 stats grid (Active Domains, Streak, Energy, Sessions)
│   ├─ Plan header (Trophy icon, "100-Day Plan", Phase X/10)
│   ├─ Progress bar + milestone count
│   ├─ [LOADING] Spinner
│   ├─ [NO PLAN] Empty state (Calendar icon + "No active plan" text)
│   ├─ [HAS PLAN] Phase timeline (10 phases)
│   │   └─ Per phase: header (done/current/future), focus area tags, progress bar
│   │       └─ [EXPANDED] Individual milestones with checkmarks
│   ├─ Recalibrate button (fixed at bottom)
│   └─ MilestoneDetailModal (on milestone click)
```

---

## B. Core (`/life`)

```
LifeLayoutWrapper                          // src/components/life/LifeLayoutWrapper.tsx
├─ useSidebars(LifeHudSidebar | null, LifeActivitySidebar | null)
└─ <LifeHub>                               // src/pages/LifeHub.tsx
    ├─ Section header: "⚡ Core Missions Today"
    ├─ Add button → opens AddItemWizard (hub="core")
    ├─ <DailyMilestones hub="core" hideHeader>
    │   └─ Same component as Dashboard but filtered to CORE_DOMAINS only
    └─ <AddItemWizard>                     // src/components/plate/AddItemWizard.tsx
```

### Left Sidebar: LifeHudSidebar (`src/components/life/LifeHudSidebar.tsx`)

```
<aside> (collapsed: w-16 | expanded: w-[280px]) — Rose/pink theme
├─ Collapse/Expand toggle
├─ [COLLAPSED]
│   ├─ SidebarOrbWidget (collapsed)
│   ├─ Domain icon buttons (7 CORE_DOMAINS) → navigate to /life/{id}/results
│   └─ Status badges (active/configured colors)
│
├─ [EXPANDED]
│   ├─ SidebarOrbWidget
│   ├─ Header badge: "ליבה / Core" + domain count
│   └─ Domain nav items (7 buttons)
│       ├─ Domain icon + label
│       ├─ Progress bar (if has missions)
│       └─ Status badge (Active/Set/Needs Update)
```

### Right Sidebar: LifeActivitySidebar (`src/components/life/LifeActivitySidebar.tsx`)

```
<aside> (collapsed: w-[54px] | expanded: w-[280px]) — Rose/pink theme
├─ [COLLAPSED] Stats mini + phase dots + recalibrate
├─ [EXPANDED]
│   ├─ Stats 2×2 grid (Active Pillars, Goals, Habits Today, Sessions)
│   ├─ 100-Day Plan header + progress bar
│   ├─ Phase timeline (A-J) — identical structure to RoadmapSidebar but rose colors
│   ├─ Recalibrate button
│   └─ MilestoneDetailModal
│   └─ DomainAssessModal (opened on recalib failure with missing pillars)
```

---

## C. Arena (`/arena`)

```
ArenaLayoutWrapper                         // src/components/arena/ArenaLayoutWrapper.tsx
├─ useSubscriptionGate().canAccessArenaFull
├─ [if !canAccessArenaFull] → <ProGateOverlay feature="arena" targetTier="plus">
├─ useSidebars(ArenaHudSidebar | null, ArenaActivitySidebar | null)
└─ <ArenaHub>                              // src/pages/ArenaHub.tsx
    ├─ Section header: "🎯 Arena Missions Today"
    ├─ Add button → opens AddItemWizard (hub="arena")
    ├─ <DailyMilestones hub="arena" hideHeader>
    └─ <AddItemWizard>
```

### Left Sidebar: ArenaHudSidebar (`src/components/arena/ArenaHudSidebar.tsx`)

```
<aside> (collapsed: w-16 | expanded: w-[280px]) — Amber/orange theme
├─ [COLLAPSED]
│   ├─ SidebarOrbWidget (collapsed)
│   ├─ Domain icon buttons (7 ARENA_DOMAINS) → navigate to /arena/{id}/results
│   └─ New Project button (Plus icon)
│
├─ [EXPANDED]
│   ├─ SidebarOrbWidget
│   ├─ Header badge: "זירה / Arena" + description
│   ├─ "Domains" label
│   ├─ Domain nav items (7 buttons)
│   │   ├─ Domain icon + label
│   │   ├─ Progress bar (if has missions)
│   │   └─ Status badge (Active/Set)
│   └─ [Projects/Business sections removed from sidebar — accessed via domain nav]
```

### Right Sidebar: ArenaActivitySidebar (`src/components/arena/ArenaActivitySidebar.tsx`)

```
<aside> (collapsed: w-[54px] | expanded: w-[280px]) — Amber/orange theme
├─ [COLLAPSED] Stats mini + phase dots + recalibrate
├─ [EXPANDED]
│   ├─ Stats 2×2 grid (Active Pillars, Goals, Active Projects, Completed Projects)
│   ├─ 100-Day Plan header + progress bar
│   ├─ Phase timeline (A-J) — amber color variant
│   ├─ Recalibrate button
│   └─ MilestoneDetailModal
│   └─ DomainAssessModal
```

---

# 3️⃣ STATE & DATA FLOW

## A. Dashboard

### Hooks Used

| Hook | File | Purpose |
|---|---|---|
| `useLaunchpadProgress` | `src/hooks/useLaunchpadProgress.ts` | Onboarding state, controls sidebar visibility |
| `useAllDomainsComplete` | `src/hooks/useAllDomainsComplete.ts` | Triggers PillarSynthesisModal |
| `useSidebars` | `src/hooks/useSidebars.ts` | Injects sidebars into SidebarContext |
| `useLifePlanWithMilestones` | `src/hooks/useLifePlan.ts` | Plan + milestones for UserDashboard |
| `useUnifiedDashboard` | `src/hooks/useUnifiedDashboard.ts` | Aggregated identity/vision/gamification data |
| `useXpProgress` | `src/hooks/useGameState.ts` | XP bar data |
| `useStreak` | `src/hooks/useGameState.ts` | Streak count |
| `useEnergy` | `src/hooks/useGameState.ts` | Token/energy balance |
| `useGameState` (context) | `src/contexts/GameStateContext.tsx` | Session stats |
| `useTodayExecution` | `src/hooks/useTodayExecution.ts` | Next action, movement score, schedule |
| `useNowEngine` | `src/hooks/useNowEngine.ts` | Today's action queue from edge function |
| `useStrategyPlans` | `src/hooks/useStrategyPlans.ts` | Core/Arena plan objects, generate/recalibrate |
| `useLifeDomains` | `src/hooks/useLifeDomains.ts` | Domain status map |
| `useDailyHypnosis` | `src/hooks/useDailyHypnosis.ts` | Suggested goal for hypnosis |
| `useSubscriptionGate` | `src/hooks/useSubscriptionGate.ts` | Tier gating for hypnosis access |

### React Query Keys

| Key | Source |
|---|---|
| `['launchpad-progress', userId]` | `useLaunchpadProgress` |
| `['life-plan']` | `useLifePlanWithMilestones` |
| `['milestones']` | `useLifePlanWithMilestones` |
| `['life-plan-milestones']` | HudSidebar recalibrate invalidation |
| `['unified-dashboard']` | `useUnifiedDashboard` (not explicit, derived from sub-hooks) |
| `['game-state', userId]` | `GameStateContext` |
| `['now-engine', userId, language]` | `useNowEngine` |
| `['schedule-prefs', userId]` | `useTodayExecution` |
| `['completed-today', userId, date]` | `useTodayExecution` |
| `['strategy-plans', userId]` | `useStrategyPlans` |
| `['life-domains', userId]` | `useLifeDomains` |
| `['pillar-synthesis-done', userId]` | `useAllDomainsComplete` |
| `['daily-missions', planIds]` | `DailyMilestones` |
| `['daily-milestones', planIds]` | `DailyMilestones` |
| `['recalibration-latest', userId]` | `RecalibrationSummary` |
| `['daily-roadmap']` | Invalidated by recalibrate |
| `['action-items']` | Invalidated by recalibrate |

### Supabase Tables Queried

| Table | Component/Hook | Filters |
|---|---|---|
| `launchpad_progress` | `useLaunchpadProgress` | `user_id = userId` |
| `life_plans` | `useStrategyPlans` | `user_id, status='active'` |
| `plan_missions` | `DailyMilestones` | `plan_id IN [...]` |
| `life_plan_milestones` | `DailyMilestones`, `RoadmapSidebar` | `plan_id IN [...]` |
| `profiles` | `useTodayExecution` | `id = userId` (wake_time, sleep_time) |
| `action_items` | `useTodayExecution` | `user_id, status='done', completed_at today` |
| `aurora_identity_elements` | `useAllDomainsComplete` | `metadata->source = 'pillar_synthesis'` |
| `life_domains` | `useLifeDomains` | `user_id = userId` |
| `recalibration_logs` | `RecalibrationSummary` | `user_id, order by created_at desc, limit 1` |

### Edge Functions Called

| Function | Caller | Purpose |
|---|---|---|
| `generate-today-queue` | `useNowEngine` | Builds today's action queue |
| `generate-90day-strategy` | `useStrategyPlans.generateStrategy` | Creates Core/Arena 100-day plans |
| `generate-pillar-synthesis` | `HudSidebar.handleRecalibrate` | Recalibrates plan |
| `add-plate-item` | `AddItemWizard` | Aurora-powered item creation |

### Mutations & Invalidations

| Mutation | Tables Written | Invalidates |
|---|---|---|
| HudSidebar Recalibrate | (via edge fn) | `life-plan`, `milestones`, `life-plan-milestones`, `unified-dashboard`, `daily-roadmap`, `action-items` |
| RoadmapSidebar Recalibrate | (via generateStrategy) | `life-plan`, `milestones`, `strategy-plans`, `launchpad-summary`, `current-week-milestone`, `daily-roadmap`, `action-items` |
| Complete launchpad step | `launchpad_progress` (RPC) | `game-state`, `feature-unlocks` |
| Execute milestone | `action_items` (via toggleActionStatus) | `action-items`, `now-engine` |

---

## B. Core (`/life`)

### Hooks Used (LifeLayoutWrapper + LifeHub)

| Hook | Purpose |
|---|---|
| `useLaunchpadProgress` | Controls sidebar visibility |
| `useSidebars` | Injects LifeHudSidebar / LifeActivitySidebar |
| `useTranslation` | Language + RTL |
| `useStrategyPlans` | corePlan, coreStrategy, generateStrategy |
| `useLifeDomains` | statusMap for all domains |

### Additional Hooks in Sidebars

| Hook | Sidebar | Purpose |
|---|---|---|
| `useQuery(['plan-missions', corePlan.id])` | LifeHudSidebar | Fetch missions for progress bars |
| `useQuery(['mission-milestones', corePlan.id])` | LifeHudSidebar | Fetch milestones per mission |
| `useHabits` | LifeActivitySidebar | Habits today count |
| `useSessionsToday` | LifeActivitySidebar | Session count today |
| `useMilestones(corePlan.id)` | LifeActivitySidebar | All milestones for phase timeline |

### Supabase Tables Queried (Core-specific)

| Table | Component | Filters |
|---|---|---|
| `plan_missions` | LifeHudSidebar, DailyMilestones | `plan_id = corePlan.id` |
| `life_plan_milestones` | LifeHudSidebar, LifeActivitySidebar | `plan_id = corePlan.id, mission_id not null` |

---

## C. Arena (`/arena`)

### Hooks Used (ArenaLayoutWrapper + ArenaHub)

| Hook | Purpose |
|---|---|
| `useLaunchpadProgress` | Controls sidebar visibility |
| `useSubscriptionGate` | Plus+ gate for arena access |
| `useSidebars` | Injects ArenaHudSidebar / ArenaActivitySidebar |
| `useTranslation` | Language + RTL |
| `useStrategyPlans` | arenaPlan, arenaStrategy |
| `useLifeDomains` | statusMap |

### Additional Hooks in Sidebars

| Hook | Sidebar | Purpose |
|---|---|---|
| `useQuery(['plan-missions', arenaPlan.id])` | ArenaHudSidebar | Mission progress bars |
| `useQuery(['mission-milestones', arenaPlan.id])` | ArenaHudSidebar | Milestones per mission |
| `useProjects` | ArenaHudSidebar, ArenaActivitySidebar | Active/completed project counts |
| `useBusinessJourneys` | ArenaHudSidebar | Business journey data |
| `useMilestones(arenaPlan.id)` | ArenaActivitySidebar | Phase timeline milestones |

---

# 4️⃣ FUNCTIONALITY MATRIX

## Dashboard Interactive Elements

| Label | Component File | Function | DB Table | Side Effects |
|---|---|---|---|---|
| Orb click | HudSidebar | `setOrbDNAOpen(true)` | — | Opens OrbDNAModal |
| Identity button | HudSidebar | `setActiveModal('identity')` | — | Opens MergedIdentityModal |
| Direction button | HudSidebar | `setActiveModal('direction')` | — | Opens MergedDirectionModal |
| Insights button | HudSidebar | `setActiveModal('insights')` | — | Opens MergedInsightsModal |
| Next Action | HudSidebar | Links to action | — | — |
| Recalibrate (HUD) | HudSidebar | `handleRecalibrate` → edge fn `generate-pillar-synthesis` | `life_plans`, `life_plan_milestones` | Invalidates 6 query keys |
| Recalibrate (Roadmap) | RoadmapSidebar | `generateStrategy.mutateAsync({hub:'both',forceRegenerate:true})` | `life_plans` | Invalidates 8 query keys |
| Phase expand | RoadmapSidebar | `setExpandedPhase(phase)` | — | Shows milestones |
| Milestone click | RoadmapSidebar | `setSelectedMilestone(m)` | — | Opens MilestoneDetailModal |
| Execute milestone | DailyMilestones | `handleExecute(dm)` | `action_items` | Opens ExecutionModal or startAssessment |
| Daily Hypnosis | DailyMilestones | `openHypnosis()` | — | Opens hypnosis session |
| Generate Plan | DailyMilestones | `generateStrategy.mutate({hub:'both'})` | `life_plans` | Creates 100-day plan via edge fn |
| Assessment card | DailyMilestones | `startAssessment(domainId)` | — | Opens domain assessment chat |
| Start Session | MobileHeroGrid (hidden) | `openHypnosis()` | `hypnosis_sessions` | XP via trigger, streak update |
| Add item | ArenaHub/LifeHub | `setWizardOpen(true)` | — | Opens AddItemWizard |

## Arena Interactive Elements

| Label | Component File | Function | DB Table | Side Effects |
|---|---|---|---|---|
| Domain button | ArenaHudSidebar | `navigate('/arena/{id}/results')` | — | Navigation |
| New Project | ArenaHudSidebar | `onNewProject()` | — | Opens wizard |
| Recalibrate | ArenaActivitySidebar | `generateStrategy.mutateAsync({hub:'arena'})` | `life_plans` | Invalidates `life-plan`, `milestones`, `strategy-plans` |
| Milestone click | ArenaActivitySidebar | `setSelectedMilestone(m)` | — | Opens MilestoneDetailModal |
| Add button | ArenaHub | `setWizardOpen(true)` | — | Opens AddItemWizard |

## Core Interactive Elements

| Label | Component File | Function | DB Table | Side Effects |
|---|---|---|---|---|
| Domain button | LifeHudSidebar | `navigate('/life/{id}/results')` | — | Navigation |
| Recalibrate | LifeActivitySidebar | `generateStrategy.mutateAsync({hub:'core'})` | `life_plans` | Invalidates `life-plan`, `milestones`, `strategy-plans` |
| Milestone click | LifeActivitySidebar | `setSelectedMilestone(m)` | — | Opens MilestoneDetailModal |
| Add button | LifeHub | `setWizardOpen(true)` | — | Opens AddItemWizard |

---

# 5️⃣ INTEGRATIONS

## Shared Across All 3 Hubs

| System | Tables | RPCs | Edge Functions | Triggers |
|---|---|---|---|---|
| **XP System** | `xp_events`, `profiles.experience` | `award_unified_xp` | — | `guard_xp_direct_update` (BEFORE UPDATE on profiles) |
| **Energy System** | `energy_events`, `profiles.tokens` | `award_energy`, `spend_energy` | — | — |
| **Streak System** | `profiles.session_streak`, `profiles.last_session_date` | — | — | `handle_hypnosis_session_complete` |
| **Template Enforcement** | `action_items.metadata.execution_template` | — | — | `trg_enforce_execution_template` (BEFORE INSERT) |
| **Loot System** | `loot_events`, `user_inventory`, `loot_catalog` | — | — | `trg_maple_loot_drop` (AFTER UPDATE on action_items, source='maple') |
| **Build System** | `user_builds` | — | `generate-weekly-build`, `generate-daily-quests` | — |
| **Action Items SSOT** | `action_items` | — | `generate-today-queue`, `add-plate-item` | `handle_action_item_completion` |
| **Strategy Plans** | `life_plans`, `plan_missions`, `life_plan_milestones` | — | `generate-90day-strategy` | `check_mission_completion`, `check_milestone_from_minis`, `update_life_plan_progress` |
| **Skill XP** | `skill_xp_events`, `user_skill_progress` | `award_skill_xp` | — | — |

---

# 6️⃣ CONDITIONAL LOGIC MAP

## Dashboard

```
IF isLaunchpadComplete === false:
  → Left sidebar = null (no HudSidebar)
  → Right sidebar = null (no RoadmapSidebar)
  → Body: MobileHeroGrid still renders, DailyMilestones shows "Generate Plan" CTA

IF isLaunchpadComplete === true:
  → Left sidebar = HudSidebar
  → Right sidebar = RoadmapSidebar

IF shouldTriggerSynthesis (all 14 domains complete + no prior synthesis):
  → PillarSynthesisModal auto-opens

IF no active life_plan for Core OR Arena:
  → DailyMilestones shows empty state with "Generate 100-Day Plan" button
  → Pillar assessment grid shown with completion status

IF isHealing OR isGenerating:
  → DailyMilestones shows "Syncing 100-day plan..." loader instead of CTA

IF hasPlan && nextAction (HudSidebar):
  → Shows "Next Action" button with action title
ELSE:
  → Shows "Recalibrate" button

IF !hasLifePlan (RoadmapSidebar):
  → Shows empty state: "No active plan. Generate a 100-day strategy."

IF !canAccessHypnosis (subscription gate):
  → Daily Hypnosis card triggers showUpgradePrompt('hypnosis')

IF domain assessment not ready (per-pillar in DailyMilestones):
  → Execute button opens startAssessment() instead of ExecutionModal
```

## Core

```
IF isLaunchpadComplete === false:
  → Left sidebar = null
  → Right sidebar = null
  → Body: LifeHub still renders with DailyMilestones hub="core"

IF isLaunchpadComplete === true:
  → Left = LifeHudSidebar, Right = LifeActivitySidebar

IF no corePlan:
  → LifeActivitySidebar shows: "No Core plan active. Generate from dashboard."
  → DailyMilestones shows generate CTA

IF recalibration fails with missingPillars:
  → Opens DomainAssessModal for first missing pillar

IF domain status === 'needs_reassessment':
  → Pillar button shows "Needs Update" badge (amber)

IF domain status === 'active':
  → Pillar button shows "Active" badge + active color
```

## Arena

```
IF !canAccessArenaFull (useSubscriptionGate):
  → Entire hub replaced with ProGateOverlay (no sidebars, no content)

IF canAccessArenaFull BUT !isLaunchpadComplete:
  → Sidebars hidden, body still renders

IF canAccessArenaFull AND isLaunchpadComplete:
  → Full layout with ArenaHudSidebar + ArenaActivitySidebar

IF no arenaPlan:
  → ArenaActivitySidebar shows: "No Arena plan active."
  → DailyMilestones shows generate CTA

IF recalibration fails with missingPillars:
  → Opens DomainAssessModal for first missing pillar
```

---

# 7️⃣ REDUNDANCIES & DUPLICATIONS

## Duplicate Data Reads

| Pattern | Location 1 | Location 2 | Notes |
|---|---|---|---|
| `useStrategyPlans()` | DashboardLayoutWrapper (indirect via DailyMilestones) | HudSidebar (via useTodayExecution → useNowEngine) | Both read the same `life_plans` query |
| `useLifeDomains()` | LifeHudSidebar | LifeActivitySidebar | Both call same query; React Query deduplicates but both hold refs |
| `useLifeDomains()` | ArenaHudSidebar | ArenaActivitySidebar | Same pattern |
| `useXpProgress() + useStreak() + useEnergy()` | HudSidebar | RoadmapSidebar | Both sidebars read identical game state; HudSidebar shows all 3, RoadmapSidebar shows streak + energy |
| `plan_missions` query | LifeHudSidebar | DailyMilestones | Both query `plan_missions` for the same plan_id but with different query keys (`['plan-missions', planId]` vs `['daily-missions', planIds]`) |
| `life_plan_milestones` query | LifeHudSidebar | LifeActivitySidebar | Both query milestones for corePlan.id but with different keys (`['mission-milestones', planId]` vs `['milestones', planId]`) |

## Dual Sources of Truth

| Data | Source 1 | Source 2 | Risk |
|---|---|---|---|
| Plan milestones | `useLifePlanWithMilestones` (UserDashboard) | `useMilestones(planId)` (sidebars) | Different hooks querying same table; `useLifePlanWithMilestones` uses old `life_plans` join pattern, sidebars use direct `life_plan_milestones` |
| Recalibration | HudSidebar calls `generate-pillar-synthesis` | RoadmapSidebar calls `generateStrategy.mutateAsync` | Two different edge functions for "recalibrate" from same page |

## UI Duplication

| Element | Location 1 | Location 2 | Notes |
|---|---|---|---|
| Phase timeline (A-J) | RoadmapSidebar | LifeActivitySidebar | Nearly identical code, different color scheme (primary vs rose) |
| Phase timeline (A-J) | RoadmapSidebar | ArenaActivitySidebar | Nearly identical code, different color scheme (primary vs amber) |
| Stats grid | HudSidebar | RoadmapSidebar | Both show overlapping stats (Energy, Streak) |
| Identity/Direction/Insights modals | HudSidebar | MobileHeroGrid (hidden) | MobileHeroGrid has modal triggers but entire mobile HUD div is `class="hidden"` |
| Recalibrate button | HudSidebar | RoadmapSidebar | Both on dashboard, call different functions |
| Domain nav buttons | LifeHudSidebar | ArenaHudSidebar | Identical structure, different domain arrays and colors |
| `DailyMilestones` | MobileHeroGrid (hub="both") | LifeHub (hub="core") / ArenaHub (hub="arena") | Same component, filtered by hub prop |

## Legacy / Dead UI

| Element | File | Status |
|---|---|---|
| Mobile HUD section | MobileHeroGrid.tsx (line 102) | `class="hidden"` — entire block never rendered |
| `NowSection` import comment | MobileHeroGrid.tsx (line 14) | Comment says "removed" but import line present as comment |
| `CurrentWeekPlanCard` import comment | MobileHeroGrid.tsx (line 23) | Comment says "removed" |

---

# 8️⃣ CROSS-PAGE DEPENDENCIES

## Dashboard → Arena / Core

- **Strategy Plans**: Dashboard's `DailyMilestones` component renders BOTH Core + Arena missions when `hub="both"`. It reads `corePlan` AND `arenaPlan` from `useStrategyPlans()`.
- **"Generate 100-Day Plan" button** on Dashboard generates for `hub="both"`, creating both Core AND Arena plans simultaneously.
- **Recalibrate (RoadmapSidebar)** calls `generateStrategy.mutateAsync({hub:'both'})`, affecting both hubs.
- **XP/Streak/Energy** displayed on Dashboard are global — updated by actions in any hub.

## Arena → Dashboard

- Arena milestone completions write to `action_items`, which triggers `handle_action_item_completion` → awards XP → updates `profiles.experience` → reflected on Dashboard's HudSidebar.
- Arena recalibration invalidates `strategy-plans` which Dashboard also reads.

## Core → Dashboard

- Same as Arena: milestone completions propagate via XP triggers.
- Core recalibration invalidates `strategy-plans`.

## Core ↔ Arena

- Both share `useLifeDomains()` status map — domain assessments in one hub affect the other's status badges.
- Both share `useStrategyPlans()` — generating a plan in one hub can trigger self-healing for the other.
- `DailyMilestones` on Dashboard merges both; completing a Core milestone changes progress displayed alongside Arena milestones.

## Shared Global Systems

| System | Written By | Read By | SSOT |
|---|---|---|---|
| XP | `award_unified_xp` RPC (from any hub) | HudSidebar, GameStateContext | `xp_events` table |
| Energy | `award_energy` / `spend_energy` RPCs | HudSidebar, all sidebars | `energy_events` table |
| Streak | `handle_hypnosis_session_complete` trigger | HudSidebar, RoadmapSidebar | `profiles.session_streak` |
| Skills | `award_skill_xp` RPC | TalentBoard (MapleStory) | `skill_xp_events` + `user_skill_progress` |
| Action Items | Direct inserts + edge functions | `useTodayExecution`, `DailyMilestones` | `action_items` table |
| Loot | `trg_maple_loot_drop` trigger | MapleStory LootPanel | `loot_events` + `user_inventory` |
| Builds | `generate-weekly-build` edge fn | MapleStory header | `user_builds` table |
| Subscriptions | Stripe webhook | `useSubscriptionGate` (all hubs) | `user_subscriptions` + `subscription_tiers` |

---

*END OF STRUCTURAL MAP*
