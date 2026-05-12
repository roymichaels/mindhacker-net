## Goal

Replace the four-shell legacy stack (DashboardLayout + PresenceShell + Hallway + HubModalHost) with a single **ShellV2** where chat is the only persistent surface. Everything else is summoned as an artifact or routed through one overlay controller.

## Architecture target

```
ProtectedAppShellV2  (auth + onboarding gate)
└── ShellV2
    ├── BackgroundLayer   z=10   SharedOrbStage canvas
    ├── ChatLayer         z=20   AuroraChatBubbles + ArtifactLayer
    ├── ComposerLayer     z=30   GlobalChatInput + ComposerActions
    ├── ChromeLayer       z=40   MinimalHeader (drawer trigger, AION pulse, history)
    ├── OverlayLayer      z=55–80 UnifiedOverlayController (Radix dialog/sheet/drawer + AION panel + toasts)
    └── BlockingLayer     z=90   naming gate, theme flash, avatar required, network reconnect
```

Single z-scale lives in `src/shellv2/zindex.ts`. Every Tailwind `z-[…]` class above the scale is rewritten to a token during Phase 7.

## Migration principles

1. Build ShellV2 next to the old shell — never edit both at once.
2. Each phase is shippable on its own and gated by a feature flag (`ff_shell_v2`).
3. Deletions are preferred over additions. No new components unless they replace ≥2 old ones.
4. No more z-index, opacity, or background patches on `dashboard/`, `presence/`, `hallway/`, `HubModal*`. Touch them only to delete.
5. Anything new asks first: route, artifact, tool, inline interaction, or AI suggestion? Default = artifact.

## Phase 0 — Freeze (½ day)

- Add `src/_legacy/README.md` listing frozen folders: `components/dashboard/`, `presence/`, `hallway/`, `contexts/HubModalContext.tsx`, `components/navigation/HubModalHost.tsx`, `pages/AuroraPage.tsx`, `pages/UserDashboard.tsx`, `pages/MindOS/*`, `pages/pillars/*`, `components/aion/artifacts/artifactBus.ts`.
- Add a feature flag `ff_shell_v2` (default off) in `src/lib/clientFlags.ts`.
- Acceptance: PR description template requires "no edits to frozen folders unless deleting".

## Phase 1 — ShellV2 skeleton (1 day)

Files to create:
- `src/shellv2/zindex.ts` — single Z scale.
- `src/shellv2/ShellV2.tsx` — pure layout, no behaviour.
- `src/shellv2/layers/BackgroundLayer.tsx` — re-mounts `SharedOrbStage` at z=10.
- `src/shellv2/layers/ChromeLayer.tsx` — minimal top bar (left: drawer trigger, right: AION pulse + history).
- `src/shellv2/layers/ChatLayer.tsx` — placeholder.
- `src/shellv2/layers/ComposerLayer.tsx` — placeholder.
- `src/shellv2/layers/OverlayLayer.tsx` — wraps `OverlayProvider` + `UnifiedOverlayHost`.
- `src/shellv2/layers/BlockingLayer.tsx` — naming gate slot.
- `src/shellv2/UnifiedOverlayHost.tsx` — renders the active overlay from `OverlayController`.
- `src/shellv2/ProtectedAppShellV2.tsx` — auth + onboarding gate + ShellV2.
- New dev-only route `/__shellv2` rendering ShellV2 with an empty ChatLayer.

Acceptance: `/__shellv2` shows orb + minimal header + empty body + composer placeholder, no other chrome.

## Phase 2 — Chat in ShellV2 (1–2 days)

- ChatLayer mounts `AuroraChatBubbles` + `ArtifactLayer` (the existing `src/lib/aion/artifactBus` SSOT).
- Delete the duplicate `src/components/aion/artifacts/artifactBus.ts` and its `ArtifactLayer.tsx` sibling.
- When `ff_shell_v2` is on, `/` and `/aurora` render ShellV2 instead of `AuroraPage` + DashboardLayout.
- Verify `AuroraChatContext` / `useAuroraChat` provider order at App root.

Quarantine (do not delete yet): `pages/AuroraPage.tsx`, `components/aurora/AuroraChatArea.tsx`, `components/aurora/JourneyChatDock.tsx`, `pages/MindOS/ChatPage.tsx`, `components/aurora/AuroraChatInput.tsx`.

Risk: streaming hook regressions. Mitigation: keep both shells live behind the flag for one release cycle.

Acceptance: with the flag on, `/` is the chat, with no header dropdowns, no MobileHeroGrid, no story surfaces.

## Phase 3 — Composer + artifacts in ShellV2 (1 day)

- ComposerLayer mounts `GlobalChatInput` + `ComposerActions`.
- Add `summon` plus-menu items: assessment, plan, today-list, journey, journal, business-canvas, landing-builder, hypnosis-session, brain-profile.
- Centralise body scroll lock inside `OverlayController` (single `useLockBodyScroll`).
- Confirm `ArtifactFrame` uses `OverlayController` for fullscreen artifacts (no hand-rolled `fixed inset-0`).

Acceptance: typing works, voice works, summoning any artifact opens it inline; only one composer in the DOM at any time.

## Phase 4 — Brain route replaces Profile (1 day)

- New `/brain` page: `BrainGraphCanvas` + identity panel (DNA + AION) + recent decisions + memory list.
- `OSDrawer` and `MindOSSheet` callers of `openProfile()` → `navigate('/brain')`.
- Redirects: `/profile` → `/brain`.
- Quarantine (don't delete yet): `src/pages/ProfilePage.tsx`, `src/contexts/ProfileModalContext.tsx`.

Acceptance: tapping the user chip in the drawer lands on `/brain` with the existing graph view.

## Phase 5 — Route map collapse (1–2 days)

- Replace HubModal pattern with route-level summoning. Each "hub" route becomes a thin page that renders ShellV2 and summons the appropriate artifact via `artifactBus.summon(kind, params, { replaceKind: true })` on mount.
  - `/strategy` → summon `plan` + `today-list`
  - `/strategy/:pillar` → summon `assessment` (replaces all `pages/pillars/*`)
  - `/journal` → summon `journal` artifact
  - `/hypnosis` → summon `hypnosis-session` artifact
  - `/fm`, `/community`, `/messages` → keep as full routes (large surfaces)
- Add redirects in `src/routes/redirects.tsx`:
  - `/aurora`, `/dashboard`, `/play`, `/plan`, `/now`, `/mindos`, `/mindos/*`, `/hallway`, `/hallway/:slug` → `/`
  - All current pillar wizard sub-routes → `/strategy/:pillar`
- Replace `HubModalContext.openHub(...)` callers with `navigate(...)`.

Acceptance: any legacy URL lands inside ShellV2 with the right artifact summoned. `useHubModal` has zero callers outside its own files.

## Phase 6 — Delete legacy shells (1 day)

Move to `src/_legacy/` then delete after one green release:
- `src/components/dashboard/{DashboardLayout,DashboardLayoutWrapper,MobileHeroGrid,UserDashboard children,unified/,v2/,missions/,DailyPrioritiesModal,DailyRoadmap,ExecutionModal,HypnosisModal,JobPanel,MilestoneDetailModal,NextStepGuide,NowSection,PillarSynthesisModal,SkillsPanel,SkillDetailModal}`
- `src/pages/UserDashboard.tsx`, `src/pages/AuroraPage.tsx`, `src/pages/MindOSPage.tsx`, `src/pages/MindOS/*`, `src/pages/pillars/*` (after artifact replacements verified), `src/pages/ProfilePage.tsx`
- `src/presence/*`, `src/hallway/*`
- `src/contexts/{HubModalContext,ProfileModalContext}.tsx`
- `src/components/navigation/{HubModalHost,AppNameDropdown,AppNameMenu,AppSideMenu,BottomTabBar,BottomHudBar,TopNavBar,DesktopSideNav,HeaderActions}.tsx`
- `src/components/aurora/{AuroraChatArea,AuroraChatInput,AuroraDock,JourneyChatDock,AuroraLayout}.tsx`
- `src/components/aion/{InteractiveAIONHost,InteractiveAION}.tsx` after merging into ChromeLayer
- All `*Sidebar.tsx` files (admin, community, projects, fm, coach) — sidebar concept retired
- `src/contexts/SidebarContext.tsx`, `src/components/dashboard/DashboardLayoutWrapper.tsx`

Risk: hidden imports. Mitigation: quarantine first, run typecheck (auto), delete only after CI green for 24h.

Acceptance: `rg -l "from .*dashboard/DashboardLayout|HubModalContext|presence/PresenceShell|hallway/Hallway"` returns zero hits in non-`_legacy` paths.

## Phase 7 — Polish + overlay cleanup (1–2 days)

- Normalise every overlay through `OverlayController`. Convert `AvatarRequiredModal`, `CreateStoryModal`, `NFTDetailCard`, `AIONNamingGate`, ThemeProvider flash to Radix Dialog or `BottomSheet`. Delete every hand-rolled `fixed inset-0 z-[9999+]`.
- Fix `alert-dialog` content z (currently 50, below its overlay 70).
- Replace dual toaster (Sonner + shadcn Toaster) with one (Sonner).
- Move `ff_shell_v2` to default-on; remove old shell mount path from `App.tsx`.
- Replace 100% of `z-[…]` arbitrary classes with the `Z` token map.
- Edge-swipe drawer open, safe-area paddings audited, theme flash priced into BlockingLayer at z=90.

Acceptance: zero `z-[9000+]` remaining. Manual QA matrix passes on iOS Safari + Android Chrome (drawer ↔ dialog ↔ artifact ↔ AION panel ↔ toast in every order).

## Per-file disposition (master table)

| Item | Action |
|---|---|
| `src/App.tsx` | KEEP, prune providers, remove old shell branch in Phase 7 |
| `components/layout/ProtectedAppShell.tsx` | MERGE → `shellv2/ProtectedAppShellV2.tsx` |
| `components/dashboard/DashboardLayout.tsx` + Wrapper + UserDashboard + MobileHeroGrid + sub-modals | REMOVE (Phase 6) |
| `presence/*`, `hallway/*` | REMOVE (Phase 6) |
| `contexts/HubModalContext.tsx`, `components/navigation/HubModalHost.tsx` | REMOVE (Phase 5/6) |
| `shell/overlay/OverlayController.tsx` + `BottomSheet.tsx` | KEEP — promoted to overlay SSOT |
| `components/shell/OSDrawer.tsx` | KEEP — single nav drawer |
| `components/shell/MindOSSheet.tsx` | MERGE into OSDrawer |
| `components/shell/AIONPresenceButton.tsx` | KEEP |
| `components/orb/v2/SharedOrbStage.tsx` | KEEP — z lowered to 10 inside Background layer |
| `components/aion/InteractiveAIONHost.tsx` + `InteractiveAION.tsx` | MERGE into ChromeLayer (Phase 6) |
| `pages/AuroraPage.tsx` | REMOVE — Shell IS the chat |
| `components/aurora/AuroraChatBubbles`, `useAuroraChat`, `AuroraChatContext`, `AuroraChatMessage`, `AuroraTypingIndicator`, `AuroraWelcome`, `AuroraActionConfirmation` | KEEP |
| `components/aurora/{AuroraChatArea,AuroraChatInput,AuroraDock,JourneyChatDock,AuroraLayout}` | REMOVE |
| `components/dashboard/GlobalChatInput.tsx` + `aurora/composer/ComposerActions.tsx` | KEEP |
| `components/artifacts/*`, `lib/aion/artifactBus.ts`, `lib/aion/artifactRegistry.ts` | KEEP — already on-spec |
| `components/aion/artifacts/artifactBus.ts` + sibling ArtifactLayer | REMOVE — duplicate bus |
| `components/story/StorySurfaceHost.tsx` | CONTEXTUAL — convert to `story-scene` artifact or delete |
| `pages/pillars/*` | REMOVE — replaced by `assessment` artifact |
| `pages/ProfilePage.tsx`, `contexts/ProfileModalContext.tsx` | REMOVE — replaced by `/brain` |
| `features/brain/*` | KEEP — used by `/brain` |
| `components/ui/{dialog,sheet,drawer,alert-dialog}.tsx` | KEEP — normalise z, fix alert-dialog content z |
| `AvatarRequiredModal`, `CreateStoryModal`, `NFTDetailCard`, `AIONNamingGate` | MERGE into Radix Dialog (Phase 7) |
| `ThemeProvider` flash overlay | KEEP — re-priced into BlockingLayer |
| Sonner + shadcn Toaster | MERGE — keep Sonner only |
| `contexts/SidebarContext.tsx`, all `*Sidebar.tsx` (admin, community, fm, coach, projects) | REMOVE — sidebar concept retired |
| `navigation/{AppNameDropdown,AppNameMenu,AppSideMenu,BottomTabBar,BottomHudBar,TopNavBar,DesktopSideNav,HeaderActions}.tsx` | REMOVE |
| Public `Header.tsx` | KEEP for marketing routes only |
| Career hubs (Business/Freelancer/Creator/Coach) | CONTEXTUAL — keep as routes; revisit after ShellV2 lands |

## Z-index scale (single source)

```ts
// src/shellv2/zindex.ts
export const Z = {
  base: 0, background: 10, chat: 20, composer: 30,
  chrome: 40, scrim: 55, overlay: 60, aionPanel: 70,
  toast: 80, blocking: 90,
} as const;
```

## What we will NOT do
- No new CSS patches on `dashboard/` / `presence/` / `hallway/`.
- No "lower this z by 5" attempts on overlays we plan to delete.
- No new feature work on `MobileHeroGrid` or any dashboard child.
- No big-bang rewrite — every phase ships behind `ff_shell_v2` until Phase 7.

## Definition of done (whole migration)
1. `/` renders ShellV2: orb + chat + composer + minimal header. Nothing else.
2. Every old route resolves inside ShellV2 with the right artifact summoned.
3. `rg "z-\[9"` returns zero hits.
4. `rg -l "DashboardLayout|HubModalContext|PresenceShell|HallwayShell"` returns only `_legacy/` (or nothing).
5. One overlay manager (`OverlayController`), one toaster (Sonner), one orb stage, one chat surface, one composer, one nav drawer.
6. The brain graph (`aurora_memory_graph` + neighbours) is the only durable user model — Profile modal removed, `/brain` is the only identity surface.

Ready to start with Phase 0 + Phase 1 on approval.
