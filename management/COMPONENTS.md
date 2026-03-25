# Component Inventory

Last updated: 2026-03-25

## Summary

The component layer is broad and feature-rich, but unevenly organized. Most major product surfaces have a dedicated directory, while shared shell logic and domain logic are split across multiple places.

## Directory Inventory

### `src/components/aurora`

Purpose:

- core MindOS chat UI, voice mode, message rendering, dock/modals, and Aurora persona components

Key components:

- `AuroraChatInput`
- `AuroraChatMessage`
- `AuroraChatArea`
- `AuroraDock`
- `AuroraVoiceMode`
- `AuroraHoloOrb`
- `AuroraFloatingOrb`
- `AuroraPlanModal`
- `AuroraJournalModal`
- `AIONNamingGate`

Status:

- active but legacy-named
- strategic area under ongoing migration because backend calls are changing fastest here

Depends on:

- `hooks/aurora`
- contexts
- Supabase client
- voice services

Alignment note:

- this folder is the current implementation of the MindOS conversational layer
- chat entry is now primarily the floating AION orb, with `/mindos/chat` as the route fallback

### `src/components/pillars`

Purpose:

- strategy/domain assessment shell, layout wrappers, modals, domain chat and results

Key components:

- `DomainAssessChat`
- `DomainAssessModal`
- `DomainAssessResults`
- `DomainIntakeFlow`
- `LifeLayoutWrapper`
- `ArenaLayoutWrapper`
- `LifeHudSidebar`
- `LifeActivitySidebar`

Status:

- active
- one of the most important product directories

Depends on:

- `hooks/useDomainAssessment`
- `navigation/lifeDomains`
- `lib/domain-assess`
- Aurora UI components

### `src/components/play`

Purpose:

- daily execution and tactics widgets that currently power the MindOS default surface

Key components:

- `TodayOverviewTab`
- `TodayExecutionSection`
- `MissionControlTab`
- `MissionControlBar`
- `StrategyPillarWizard`
- `FocusQueueModal`
- `MilestoneJourneyModal`
- `PlayStatsStrip`

Status:

- active but legacy-named
- stable enough for iteration, but some strategy logic still overlaps with `plan` and `dashboard`

Alignment note:

- this directory is still the real implementation behind `/mindos/tactics`
- rename/move later only after route and import cleanup is complete

### `src/components/dashboard`

Purpose:

- protected home/dashboard widgets and shared execution panels

Key components:

- `DashboardLayout`
- `DashboardLayoutWrapper`
- `GlobalChatInput`
- `DailyRoadmap`
- `ExecutionModal`
- `HypnosisModal`
- `NextStepGuide`
- `missions/*`
- `unified/*`

Status:

- active
- partially merged conceptually into Play

### `src/components/community`

Purpose:

- social feed, threads, stories, community identity widgets

Key components:

- `CommunityLayoutWrapper`
- `CommunityHeader`
- `CommunityForumBoard`
- `ThreadCard`
- `ThreadList`
- `CreateThreadModal`
- `CreateStoryModal`
- `CommunityLeaderboard`
- `PlayerAvatar`

Status:

- active

### `src/components/fm`

Purpose:

- FM shell, wallet, market, mining, publish flow, economy widgets

Key components:

- `FMAppShell`
- `FMMarketLayoutWrapper`
- `FMBalanceBar`
- `FMWalletModal`
- `MiningDashboard`
- `FMPublishWizard`
- `DataMarketplaceDashboard`
- `FMQuickActions`

Status:

- active

### `src/components/learn`

Purpose:

- course and lesson sidebars, viewing, focus sessions

Key components:

- `LearnLayoutWrapper`
- `LearnCoursesSidebar`
- `LearnCurriculumSidebar`
- `LessonViewer`
- `LessonFocusSession`

Status:

- active

### `src/components/admin`

Purpose:

- admin hub views, newsletters, recordings, forms, landing builder, notifications

Key components:

- `NotificationPanel`
- `MultiFileUpload`
- `TemplateCoveragePanel`
- `landing/*`
- `newsletter/*`
- `recordings/*`
- `forms/*`

Status:

- active
- large and sprawling

### `src/components/careers`

Purpose:

- business, coach, creator, freelancer, therapist, and coach marketplace experiences

Key components:

- `coach/CoachesLayoutWrapper`
- `coach/CoachDashboardOverview`
- `business/BusinessLayoutWrapper`
- `creator/CreatorLayoutWrapper`
- `freelancer/FreelancerLayoutWrapper`
- `coaches/CoachCard`
- `coaches/CoachBookingView`

Status:

- active
- structurally fragmented across role-specific folders

### `src/components/avatar`

Purpose:

- 3D avatar configurator and rendering

Key components:

- `AvatarConfigurator`
- `AvatarConfiguratorUI`
- `AvatarModel`
- `AvatarMiniPreview`
- `Asset`
- `AssetTilePreview`
- `AvatarRequiredModal`

Status:

- active
- one of the few clear Zustand islands

### `src/components/orb`

Purpose:

- orb rendering, canvas layers, presets, gallery, AION visual system

Key components:

- `Orb`
- `PersonalizedOrb`
- `AIONFloatingWidget`
- `AIONChatPanel`
- `SharedOrbCanvas`
- `OrbFullscreenViewer`
- `PresetOrb`

Status:

- active

### `src/components/navigation`

Purpose:

- global chrome

Key components:

- `TopNavBar`
- `BottomTabBar`
- `DesktopSideNav`
- `BottomHudBar`
- `AppNameDropdown`
- `HeaderActions`

Status:

- active

### `src/components/layout`

Purpose:

- shell and route gating

Key components:

- `ProtectedAppShell`
- `OnboardingGate`

Status:

- active

### `src/components/ui`

Purpose:

- generic reusable UI primitives

Status:

- stable
- low business ownership, high reuse

## Ownership and Stability Notes

- Most volatile: `aurora`, `pillars`, `play`, backend-coupled dialog flows
- Most stable: `ui`, `navigation`, `layout`, many `learn` primitives
- Largest maintenance burden: `admin`, `careers`, `dashboard`
- Legacy naming burden: `aurora`, `play`, `SoulAvatar`, some old route assumptions, duplicate coach hooks

## Cross-Directory Dependencies

```text
navigation/layout
  -> all route surfaces

aurora
  -> hooks/aurora, services/unifiedContext, lib/tools, auth/language contexts

pillars
  -> navigation/lifeDomains, hooks/useDomainAssessment, aurora, lib/domain-assess

play/dashboard
  -> action items, planning hooks, game state, Aurora widgets

community
  -> auth, profile/avatar, notifications, community hooks

careers/fm/admin
  -> role checks, payments, content, AI generation functions
```

## Main Structural Problem

The repo is organized by both:

- product surface
- technical concern

That gives flexibility, but it also means a single feature often spans:

- `pages`
- `components`
- `hooks`
- `lib`
- `services`
- `supabase/functions`

This is the main reason architecture understanding currently requires multiple docs.
