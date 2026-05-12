# Frozen legacy folders

The migration to **ShellV2** (`src/shellv2/`) is in progress. The areas listed
below are **frozen**: do not add features, do not patch z-index, opacity,
background, or layout bugs in them. The only acceptable change is **deletion**
(or a move into `src/_legacy/`) once their replacements in ShellV2 are live.

If a bug lands in one of these surfaces, fix it in ShellV2 instead. Patches to
frozen code are noise: those files are scheduled for removal.

## Frozen

- `src/components/dashboard/` (DashboardLayout, DashboardLayoutWrapper,
  MobileHeroGrid, UserDashboard children, `unified/`, `v2/`, `missions/`,
  DailyPriorities/Roadmap/Execution/Hypnosis/Milestone/PillarSynthesis/
  Skills modals, JobPanel, NowSection, NextStepGuide)
- `src/presence/` — PresenceShell, SmartRoot, GraphCanvas, ArtifactsDock,
  StateTransition, presenceSignals, useActiveState
- `src/hallway/` — HallwayShell, RoomEnvironment, surfaces, pillarMap, rooms
- `src/contexts/HubModalContext.tsx`
- `src/components/navigation/HubModalHost.tsx`
- `src/components/navigation/{AppNameDropdown,AppNameMenu,AppSideMenu,BottomTabBar,BottomHudBar,TopNavBar,DesktopSideNav,HeaderActions}.tsx`
- `src/pages/AuroraPage.tsx`
- `src/pages/UserDashboard.tsx`
- `src/pages/MindOSPage.tsx`, `src/pages/MindOS/*`
- `src/pages/pillars/*`
- `src/pages/ProfilePage.tsx`, `src/contexts/ProfileModalContext.tsx`
- `src/components/aurora/{AuroraChatArea,AuroraChatInput,AuroraDock,JourneyChatDock,AuroraLayout}.tsx`
- `src/components/aion/artifacts/artifactBus.ts` and the sibling
  `ArtifactLayer.tsx` (duplicate of the SSOT in `src/lib/aion/artifactBus.ts`)
- All `*Sidebar.tsx` files (admin, community, fm, coach, projects)
- `src/contexts/SidebarContext.tsx`

## Replacements

- Shell: `src/shellv2/ShellV2.tsx` (+ `layers/`)
- Overlay SSOT: `src/shell/overlay/OverlayController.tsx`
- Artifact SSOT: `src/lib/aion/artifactBus.ts` + `artifactRegistry.ts`
- Brain/profile: new `/brain` route (Phase 4)

See `.lovable/plan.md` for the full migration plan.