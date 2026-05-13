
# MindOS Consolidation Blueprint

Snapshot of the current state I audited:
- `src/App.tsx` — 543 lines, ~120 routes, 18 nested providers, 3 modal mounts at the end.
- 67 page files in `src/pages/`, of which `src/pages/pillars/` alone contributes 53 (each pillar has Home/Assess/ChatAssess/ChatResults/Results/History as separate routes).
- Two shell systems coexist: `src/shellv2/*` (ProtectedAppShellV2 + 6 layers) and `src/shell/overlay/*` (OverlayController, BottomSheet), plus `src/hallway/HallwayShell.tsx`, `src/presence/PresenceShell.tsx`, `src/components/dashboard/*`, `src/components/layout/*`.
- 18 contexts, 5 of them are dedicated modal providers (Auth, Coaches, Profile, Subscriptions, Wallet) plus 3 implicit overlays (SoulAvatar, SmartOnboarding, StoryWorld).
- `/hallway*`, `/mindos*`, `/play`, `/now`, `/plan`, `/work`, `/work-hub`, `/play-hub`, `/journal-hub`, `/profile-hub`, `/coach-hub`, `/creator-hub`, `/freelancer-hub`, `/dashboard`, `/life`, `/life-plan`, `/career`, `/arena*`, `/profile` are already redirects — confirms the consolidation direction, but the legacy pages they point away from still exist on disk.

## 1. Final Architecture Map (7 core surfaces)

```text
                    ┌───────────────── AppShell ─────────────────┐
                    │  Header · Nav · Overlays · Safe areas      │
                    └────────────────────┬───────────────────────┘
                                         │
   Chat (/aurora) ── Brain (/brain) ── Hallway (/) ── Strategy (/strategy)
                                         │
                Outer World (/outer-world) ── Profile (/me) ── Settings (/settings)
```

Everything else becomes a module loaded **inside** one of these seven, an overlay, or a backend engine.

| Surface | Route | Owns | Hosts (as inner tabs/rooms) |
|---|---|---|---|
| Chat | `/aurora` | AION conversation, voice, attachments | Pillar continuity threads |
| Brain | `/brain` | Consciousness atlas + room graphs + node sheet | atlas / room views (see §5) |
| Hallway | `/` | Navigable consciousness map (PresenceShell) | Room entry, AION orb |
| Strategy | `/strategy` | Missions, plan, tactics, work, journal | tabs: missions, work, journal, day, week, history |
| Outer World | `/outer-world` | External economy | tabs: market, practitioners, courses, community, messages, business |
| Profile | `/me` | Identity (DNA, AION, Avatar, achievements) | tabs: identity, journey, wallet, subscriptions |
| Settings | `/settings` | Account, language, notifications, privacy | tabs: account, appearance, integrations |

## 2. Shell Unification — `AppShell`

One shell, one mount tree. Delete every other shell.

```text
AppShell (src/app-shell/AppShell.tsx)
 ├─ ChromeLayer    header + bottom nav (old aesthetic preserved)
 ├─ BackgroundLayer  theme background
 ├─ RouteOutlet    <Outlet/> for current surface
 ├─ ChatLayer      pinned AION composer + orb
 ├─ OverlayLayer   single OverlayManager portal (sheets, modals, dialogs)
 └─ BlockingLayer  auth/onboarding/welcome gates
```

Replace: `ProtectedAppShellV2`, `ShellV2`, `ShellHeader`, `ShellV2Header`, `ShellV2Drawer`, `LegacyMountGuard`, `SummonRoute`, `UnifiedOverlayHost`, `HallwayShell` (folded into Hallway page), `PresenceShell` (becomes Hallway implementation), `components/dashboard/DashboardLayout`, `components/layout/*` duplicates.

## 3. Final Route Tree

```text
PUBLIC
  /                       Hallway (auth) | Marketing Index (guest) — via SmartRoot
  /landing                marketing
  /blog, /blog/:slug
  /courses, /courses/:slug, /courses/:slug/watch
  /subscriptions
  /privacy-policy /terms-of-service /unsubscribe /docs
  /audio/:token /video/:token
  /founding /features/:slug /affiliate-signup /install /go
  /coach/:slug (canonical; legacy /practitioner[s]/:slug → 301)

AUTH (inside AppShell)
  /aurora                 Chat
  /brain                  Brain (atlas|room via ?view=&room=)
  /strategy               Strategy (tabs: missions|work|journal|day|week)
    /strategy/:domainId   pillar lens (replaces 53 pillar routes)
  /outer-world            Outer World (tabs: market|practitioners|courses|community|messages|business)
    /outer-world/messages/:id
    /outer-world/community/:postId
    /outer-world/business/:id
  /me                     Profile (tabs: identity|journey|wallet|subscriptions)
  /settings               Settings (tabs)
  /coaches/:slug          Practitioner profile
  /quests/:pillar         Quest runner (modal-friendly)
  /admin/*                Admin surface (role-gated)
  /affiliate/*            Affiliate panel (role-gated)

REDIRECTS (one block, generated from a map)
  /play /now /plan /play-hub /work /work-hub        → /strategy?tab=missions
  /journal /journal-hub                             → /strategy?tab=journal
  /hallway, /hallway/:slug                          → /
  /mindos[/...]                                     → mapped equivalents
  /life /life-plan /life-hub                        → /
  /arena /arena/:domainId/*                         → /strategy[/:domainId]
  /career /career-hub                               → /outer-world?tab=business
  /coach-hub /creator-hub /freelancer-hub           → /outer-world?tab=practitioners
  /profile /profile-hub                             → /me
  /dashboard /home /index                           → /

DELETED (page files removed after redirect bake-in)
  PlayHub, WorkHub, JournalingHub (replaced by Strategy tabs)
  MindOS/* page set, MindOSPage
  ArenaHub, ArenaDomainPage, CareerHub, LifeHub, CoachHub, CreatorHub, FreelancerHub, UserDashboard
  pages/pillars/* (53 files) → consolidated into Strategy domain renderer driven by spec
```

## 4. Modal Consolidation — `OverlayManager`

Single imperative API replacing 5 modal contexts + ad-hoc Suspense modals at end of `App.tsx`.

```text
overlay.open({ id, kind, props })
  kinds: sheet | dialog | drawer | fullscreen | toast
```

| Today | Tomorrow |
|---|---|
| AuthModalContext + CloudAuthModal | overlay.open('auth') |
| SubscriptionsModalContext + SubscriptionsModal | overlay.open('subscriptions') |
| WalletModalContext + WalletModal | overlay.open('wallet') |
| ProfileModalContext + global `<ProfilePage/>` | route `/me` (no modal) |
| CoachesModalContext | overlay.open('coach-detail', {slug}) |
| SoulAvatarMintWizardGlobal + AvatarRequiredModal | overlay.open('avatar-mint') |
| BottomSheet, OverlayController, UnifiedOverlayHost | one `<OverlayHost/>` rendered by AppShell |

Rules: no modal opens a modal; deep-linkable overlays use `?overlay=id`.

## 5. Hallway / Brain Architecture

```text
Hallway (/) ─── ConsciousnessAtlas (radial map of 8+ rooms)
                  │  tap room → /brain?view=room&room=:id
                  ▼
              RoomView (force graph: nodes/edges/gaps/contradictions)
                  │  tap node → BrainNodeSheet (overlay)
                  ▼
              "Talk to AION about this" → /aurora with focus payload
```

Data model already in place (kept): `aurora_memory_graph` + `brain_edges` + `brain_get_atlas` / `brain_get_room` / `brain_get_node` RPCs + `fn_derive_brain_room` trigger. Memory-writer keeps writing from chat/journal/missions/hypnosis. Decorative graphs (`presence/GraphCanvas`, hallway pillar circles) are removed in favor of the atlas + room force layouts already shipped.

## 6. Provider & State Ownership

Consolidate 18 → ~9 providers, in this order inside AppShell:

```text
ErrorBoundary → QueryClient → Theme → Router
  AppProviders {
    Auth, Language, Subscription, Identity (DNA+AION+Avatar+Game),
    AuroraChat, AION (state+decision+actions),
    Overlay, Onboarding/Welcome, Analytics+Tracking
  }
```

Merges:
- `AIONStateContext` + `AionDecisionContext` + `AuroraActionsContext` → `AIONContext`.
- `SoulAvatarContext` + `GameStateContext` + DNA/AION hooks → `IdentityContext`.
- `AuthModal` + `Coaches` + `Profile` + `Subscriptions` + `Wallet` modal contexts → `OverlayContext`.
- `SidebarContext` + `ChromeVisibilityContext` → `ChromeContext`.
- `StoryWorldContext` stays only if used by Strategy; otherwise delete.

State ownership: route owns its data; overlays own only ephemeral UI state; AION + Identity are global; everything else is React Query.

## 7. Files: Delete / Merge / Rename

Delete (after redirects verified — 1 release cycle):
- `src/pages/MindOS/*`, `MindOSPage.tsx`, `PlayHub.tsx`, `WorkHub.tsx`, `JournalingHub.tsx`, `ArenaHub.tsx`, `ArenaDomainPage.tsx`, `CareerHub.tsx`, `LifeHub.tsx`, `CoachHub.tsx`, `CreatorHub.tsx`, `FreelancerHub.tsx`, `UserDashboard.tsx`, `OuterWorldHub.tsx` (folded into `OuterWorld.tsx`).
- `src/pages/pillars/*` → replaced by single `StrategyDomainPage` driven by `flows/pillarSpecs/*` (already exists).
- `src/shellv2/*` (after AppShell ships), `src/shell/overlay/*`, `src/hallway/HallwayShell.tsx`, `src/presence/PresenceShell.tsx` (logic merged into `pages/Hallway.tsx`).
- `src/_legacy/*`, `LegacyMountGuard`, `SummonRoute`.
- Modal contexts listed in §4.

Merge:
- `Coaches.tsx` + `PractitionerProfile.tsx` + `CoachHub.tsx` → `outer-world/practitioners/*` module.
- `Business.tsx` + `BusinessDashboard.tsx` + `BusinessJourney.tsx` → `outer-world/business/*`.
- `Creator.tsx` + `CreatorHub.tsx`, `Freelancer.tsx` + `FreelancerHub.tsx`, similarly.
- `ProfilePage.tsx` (currently rendered globally as a modal) + identity widgets → `pages/Me.tsx`.

Rename to domain language:
- `BrainPage` → `Brain`, `AuroraPage` → `Chat`, `StrategyPage` → `Strategy`, `OuterWorldHub` → `OuterWorld`, `ProtectedAppShellV2` → `AppShell`, `UnifiedOverlayHost` → `OverlayHost`, `presence/SmartRoot` → `app-shell/RootRoute`. Drop suffixes: `Hub`, `V2`, `Wizard`, `Wrapper`, `Modal*Modal`, `PagePage`.

## 8. Performance Plan

- Lazy-load every route (already partial); add lazy boundaries per overlay kind.
- One Suspense boundary per surface, not per provider.
- Replace per-page background components with single `BackgroundLayer`.
- Drop `MatrixRain`/`ConsciousnessField` from default render path; load only when theme demands it.
- Tree-shake `pages/pillars/*` by deleting them.
- Convert globally-mounted `<ProfilePage/>`, `<SubscriptionsModal/>`, `<WalletModal/>`, `<AvatarRequiredModal/>` to overlay registry (mounted on demand).

## 9. Native Mobile UI Cleanup

- Single header (legacy aesthetic) inside ChromeLayer; remove floating ghost headers from `components/layout/*` and any per-page `<Header/>` usage.
- One bottom tab bar (Chat · Brain · Hallway · Strategy · Outer · Me).
- All sheets `rounded-2xl`, `backdrop-blur`, no gradients/shadows (per design memory).
- Enforce Tailwind logical props (`ps-*`, `pe-*`, `text-start`) repo-wide; lint rule for `pl-/pr-` in JSX.
- BiDi: every numeric span wrapped in `<span dir="ltr">`; verify in Hebrew preview.
- One safe-area provider; remove duplicate `env(safe-area-inset-*)` declarations.
- Single icon set (lucide); audit and remove stray emoji or PNG icons.

## 10. Incremental Migration Phases

```text
P0  Inventory + freeze: lint rule blocks new pages outside the 7 surfaces; redirect map test.
P1  AppShell scaffold (parallel to ShellV2, behind ff_app_shell). Move /me + /settings.
P2  OverlayManager + migrate Auth/Subs/Wallet/Coaches/Profile/Avatar modals.
P3  Strategy consolidation: tabs replace /play /now /plan /work /journal; redirect bake-in.
P4  Pillar collapse: pages/pillars/* → StrategyDomainPage; delete 53 files.
P5  Outer World module split (market/practitioners/courses/community/messages/business).
P6  Hallway as default `/`: PresenceShell logic moves into pages/Hallway.tsx; delete shells.
P7  Provider merge (§6) + Brain naming (§7) + final delete sweep + dead-code audit.
P8  Performance pass: lazy boundaries, background unification, bundle budget gate in CI.
```

Each phase is independently shippable behind `ff_app_shell` until P6.

## 11. Risk Analysis Before Deletion

| Risk | Mitigation |
|---|---|
| Deep links break (especially `/play`, `/work`, `/profile`) | Keep redirects for 2 release cycles; add 404 telemetry to catch missed paths. |
| Service worker caches old routes (PWA) | Bump cache version, force `skipWaiting`, ship `PWAUpdatePrompt`. |
| Modal-driven flows lose state on overlay refactor | OverlayManager preserves stack in `?overlay=` so deep links + back-button keep working. |
| Pillar UX regressions (53 routes → 1 spec) | Snapshot test each pillar via `flows/pillarSpecs/*` before delete. |
| Provider merges cause hook-order changes | Land merges one provider at a time; each PR carries a smoke test for AION + Identity. |
| Hebrew/RTL regressions during shell rewrite | Add Playwright RTL snapshot per surface before P1 ship. |
| Brain data write path breaks during overlay rewrite | Memory-writer is server-side and unaffected; only UI surfaces change. |

## 12. Technical Notes

- `App.tsx` shrinks to ≈80 lines: providers + `<Routes>` referencing a generated `routes.ts` and `redirects.ts`.
- New folders: `src/app-shell/`, `src/overlays/`, `src/surfaces/{chat,brain,hallway,strategy,outer-world,me,settings}/`.
- Existing infra kept as-is: Brain RPCs, memory-writer, AION orchestrator, planning pipeline, action_items SSOT, energy/XP RPCs.
- Feature flag: `ff_app_shell` (off by default until P6); `ff_overlay_manager`; `ff_strategy_tabs`.
