# Cleanup Report — Full Audit Pass

## Date: 2026-03-10

## Rename: /plan → /play

All references to `/plan` route renamed to `/play` across 20+ files:

| File | Change |
|------|--------|
| `src/navigation/osNav.ts` | Tab id `plan` → `play`, path `/plan` → `/play` |
| `src/pages/PlanHub.tsx` → `src/pages/PlayHub.tsx` | Renamed file + export |
| `src/components/plan/PlanLayoutWrapper.tsx` → `src/components/plan/PlayLayoutWrapper.tsx` | Renamed file + import |
| `src/App.tsx` | Updated lazy import, route, all legacy redirects → `/play` |
| `src/pages/Index.tsx` | Redirect target → `/play` |
| `src/hooks/aurora/useAuroraCommands.tsx` | `life_plan` nav → `/play` |
| `src/hooks/aurora/useCommandBus.tsx` | Route map → `/play` |
| `src/hooks/useSwipeNavigation.ts` | Tab order → `/play` |
| `src/lib/guards.ts` | Protected routes list |
| `src/components/navigation/BottomTabBar.tsx` | Active check → `/play` |
| `src/components/navigation/DesktopSideNav.tsx` | Active check → `/play` |
| `src/components/dashboard/v2/NextActionBanner.tsx` | Nav target → `/play` |
| `src/components/dashboard/MobileHeroGrid.tsx` | Nav target → `/play` |
| `src/components/business-hub/BusinessToolsGrid.tsx` | Nav target → `/play` |
| `src/components/fm/EarnLaunchpadModal.tsx` | Nav targets → `/play` |
| `src/pages/Onboarding.tsx` | Redirect → `/play` |
| `src/pages/ProjectsJourney.tsx` | onComplete/onClose → `/play` |
| `src/pages/presence/PresenceHome.tsx` | Back nav → `/play` |
| `src/pages/power/PowerHome.tsx` | Back nav → `/play` |
| `src/pages/vitality/VitalityHome.tsx` | Back nav → `/play` |
| `src/pages/focus/FocusHome.tsx` | Back nav → `/play` |
| `src/pages/combat/CombatHome.tsx` | Back nav → `/play` |
| `src/pages/expansion/ExpansionHome.tsx` | Back nav → `/play` |
| `src/pages/consciousness/ConsciousnessHome.tsx` | Back nav → `/play` |
| `src/pages/ArenaDomainPage.tsx` | Back nav → `/play` |
| `src/pages/LifeDomainPage.tsx` | Back nav → `/play` |

## Files DELETED

| File | Reason |
|------|--------|
| `src/pages/FormView.tsx` | Unused form viewer, route redirected to `/` |
| `src/pages/PersonalHypnosisLanding.tsx` | Legacy product page |
| `src/pages/PersonalHypnosisSuccess.tsx` | Legacy product page |
| `src/pages/PersonalHypnosisPending.tsx` | Legacy product page |
| `src/pages/ConsciousnessLeapLanding.tsx` | Legacy product page |
| `src/pages/ConsciousnessLeapApply.tsx` | Legacy product page |
| `src/pages/DynamicLandingPage.tsx` | Unused dynamic landing system |

## Legacy Imports Cleaned from App.tsx

Removed lazy imports for:
- `FormView`
- `PersonalHypnosisLanding`, `PersonalHypnosisSuccess`, `PersonalHypnosisPending`
- `ConsciousnessLeapLanding`, `ConsciousnessLeapApply`
- `DynamicLandingPage`

Routes replaced with `<Navigate>` redirects.

## Files KEPT (still actively used)

| Category | Files | Reason |
|----------|-------|--------|
| Pillar pages | `presence/*`, `power/*`, `vitality/*`, `focus/*`, `combat/*`, `expansion/*`, `consciousness/*` | Active under `/strategy/*` routes |
| `AudioPlayer.tsx` | Still routed at `/audio/:token` |
| `VideoPlayer.tsx` | Still routed at `/video/:token` |
| `Go.tsx` | Ad landing page at `/go` |

## Documents Updated

| Document | Changes |
|----------|---------|
| `PRODUCT_SPEC.md` | Complete rewrite: 5-tab structure, Play hub, Aurora journal tabs, current gating, strategy routes, deleted pages |
| `docs/APP_MAP.md` | Complete rewrite: current route map, redirect table, rename log, nav config |
| `.lovable/plan.md` | Updated: nav architecture, route changes, Aurora UI, deleted pages |
| `docs/CLEANUP_REPORT.md` | This file — full changelog |

## Total: 7 files deleted, 26 files modified, 3 docs rewritten
