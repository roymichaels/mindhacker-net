## Phase 2 — Legacy Surface Collapse

Goal: Outside the 5 permanent realms (Chat, Brain, Journey, Outer World, Self), nothing should be reachable as a "page" with its own dashboard chrome. Capabilities stay; surfaces collapse into Chat, redirects, or AION-summoned artifacts.

No backend, DB, or capability changes. No deleted routes — only redirect, summon-wrap, or quiet.

---

### 1. Legacy route audit & disposition

| Route(s) | Today | Phase 2 disposition |
|---|---|---|
| `/life`, `/life-plan` | already redirect to `/`, `/strategy` | keep |
| `/work`, `/work-hub` | redirect `/` | keep |
| `/play`, `/play-hub`, `/tactics`, `/now`, `/plan`, `/today` | redirect to `/strategy?tab=missions` | rewrite all to `/journey` (single canonical) |
| `/arena`, `/arena/:domain/*` | redirect / `ArenaToAIONRedirect` | keep, point to `/aurora` |
| `/journal`, `/journal-hub` | renders `JournalingHub` page | wrap with `SummonRoute kind="journal"` (fallback = old page); nav entries removed |
| `/hypnosis` | renders `HypnosisPage` | wrap with `SummonRoute kind="hypnosis"`; remove visible entry points |
| `/business`, `/business/:id`, `/business/journey/*` | full BusinessDashboard | keep route, wrap each with `SummonRoute kind="business-*"`; redirect bare `/business` → `/outer-world` when not summoned via deep-link |
| `/freelancer` | FreelancerHub | `SummonRoute kind="freelancer"`; nav removed |
| `/creator` | CreatorHub | `SummonRoute kind="creator"`; nav removed |
| `/therapist` | TherapistHub | `SummonRoute kind="therapist"`; nav removed |
| `/career`, `/career-hub` | redirect `/outer-world` | keep |
| `/strategy/:pillar/*` (assess/results/history × 12 pillars) | full pillar pages | keep route IDs, wrap with `SummonRoute kind="pillar-assess" params={{pillar}}` so deep-links open them as Brain artifacts, not dashboard pages |
| `/quests/:pillar` | QuestRunnerPage | `SummonRoute kind="quest" params={{pillar}}` |
| `/launchpad/complete` | onboarding completion | keep, but stop linking from anywhere user-facing |
| `/ceremony` | OnboardingCeremony | keep route; remove from any visible flow; only invoked by AION when needed |
| `/learn` | LearnLayoutWrapper | keep (Outer World portal already points here as artifact target) |
| `/coaches`, `/community`, `/messages` | already inside realms | keep |
| `/admin-hub`, `/affiliate`, `/dev/*`, `/orbs` | admin/dev | keep, role-gated as today |
| `PlayLayoutWrapper` / `LifeHub` / `ArenaHub` | rendered inside `/strategy?tab=…` | already replaced by `JourneyView`; PlayLayoutWrapper becomes summon-only target for `kind="missions"` artifact |
| `/profile` (Brain `?panel=profile` overlay) | currently renders stat-heavy ProfilePage modal | replace overlay body with new `SelfPanel` (identity model, corrections, what AION knows, settings). Old stats screens become summonable `kind="profile-stats"` for power users |

### 2. Visible entry-point removal sweep

Remove or replace links that point at any of the legacy hubs above. Search targets:

- `to="/life"`, `/work`, `/journal`, `/hypnosis`, `/business`, `/freelancer`, `/creator`, `/therapist`, `/strategy/<pillar>` outside of artifact code, `/quests/`, `/launchpad/complete`, `/ceremony`, `/play`, `/today`, `/now`, `/tactics`, `/arena`, `/plan`.
- All "Open dashboard / Hub / Generate / Assess / Create plan / Start onboarding" buttons.

Replacement copy library (single source `src/copy/aionPresence.ts` — new):

| Old | New |
|---|---|
| "Create 100-Day Plan" | "Continue your journey" → `/aurora` |
| "Choose pillars" | "AION is still learning this" (no CTA) |
| "Take assessment" | "Ask AION" → `/aurora?intent=assess&pillar=…` |
| "Generate …" | "Ask AION" |
| "Open Dashboard" / "Open Hub" | "Open as artifact" (calls `artifactBus.summon`) |
| "Start onboarding" | (removed; AION nudges in chat) |

### 3. Realm-level UX changes

**Chat (`/aurora`)** — unchanged from Phase 1.5. Already the home.

**Brain (`/brain`)** — every room/node sheet gains a single primary affordance:
```
[ Ask AION about this ]   (default action)
```
Implementation: extend `BrainNodeSheet` (or equivalent room sheet) footer with a primary button that calls `aurora.send({intent:'explain', nodeId, label})` and routes to `/aurora`. Secondary "Open as artifact" link replaces any "Open page" button.

**Journey (`/journey` → `JourneyView`)** — already simplified. Phase 2 additions:
- Remove any remaining direct links to `/strategy/:pillar/assess` from JourneyView; replace with summon (`artifactBus.summon('pillar-assess', {pillar})`).
- Add a quiet `Summon plan history` ghost link → opens `kind="missions"` artifact (PlayLayoutWrapper inside artifact frame). No "Generate" buttons anywhere.

**Outer World (`/outer-world`)** — already collapsed to `AlignedRealities`. Verify portals route to: Coaches (`/coaches`), Learning (`/learn`), Community (`/community`), Marketplace (`/fm`). No further change.

**Self (Brain `?panel=profile`)** — new `SelfPanel` component replaces the current stats-heavy `ProfilePage` modal body. Sections, in order:
1. **Identity** — name, AION avatar, archetype line, current phase. Read-only, no badges.
2. **What AION knows** — bullet list of inferred traits/preferences pulled from `aion_user_facts` (existing). Empty state: "AION is still learning."
3. **Corrections** — single textarea + send → records a correction note (existing endpoint or local for now; UI only this phase).
4. **Privacy & settings** — collapsed accordion ("Account", "Notifications", "Data"). Old Profile tabs (XP, levels, achievements, NFT, etc.) remain reachable via "Advanced" link → opens `kind="profile-stats"` artifact.

### 4. Files to add

- `src/copy/aionPresence.ts` — copy constants used everywhere old empty states lived.
- `src/components/self/SelfPanel.tsx` — new identity-first Self surface.
- `src/components/self/sections/IdentitySection.tsx`
- `src/components/self/sections/WhatAionKnowsSection.tsx`
- `src/components/self/sections/CorrectionsSection.tsx`
- `src/components/self/sections/PrivacySettingsSection.tsx`
- `src/lib/aion/artifactKinds.ts` — extend with `journal`, `hypnosis`, `business-dashboard`, `business-journey`, `freelancer`, `creator`, `therapist`, `pillar-assess`, `pillar-results`, `pillar-history`, `quest`, `missions`, `profile-stats`. (Just kind constants; renderers reuse existing components.)
- `src/lib/aion/artifactRegistry.tsx` — map new kinds → existing page components rendered inside artifact frame.

### 5. Files to edit

- `src/App.tsx` — wrap legacy page routes with `<SummonRoute kind=…> fallback={<LegacyPage/>}` so when ShellV2 is on, route opens as artifact above chat. Keep `fallback` so deep-linked, flag-off users still see content.
  - `/journal`, `/hypnosis`, `/freelancer`, `/creator`, `/therapist`, `/business`, `/business/journey`, `/business/journey/:id`, `/business/:id`, `/quests/:pillar`, all `/strategy/:pillar/*` pillar routes.
- `src/routes/redirects.tsx` — collapse `?tab=missions` aliases to `/journey`; add `/profile` overlay alias if missing.
- `src/components/aion/ui/AionNavDock.tsx` — confirm only 5 realms surfaced; nothing else.
- `src/pages/BrainPage.tsx` — node/room sheet: add primary "Ask AION about this" CTA, demote any "Open page" buttons.
- `src/pages/BrainPage.tsx` (or wherever `?panel=profile` is handled) — render `<SelfPanel/>` instead of legacy `ProfilePage` body.
- `src/pages/JourneyView.tsx` — replace any direct links into `/strategy/:pillar/...` with `artifactBus.summon` calls; add ghost "Plan history" summon link.
- Any nav/menu/CTA component still pointing at legacy hubs (sweep listed in §2). Specifically check: `src/components/dashboard/*`, `src/components/profile/*`, `src/pages/LifeHub.tsx`, `src/pages/ArenaHub.tsx`, `src/pages/CareerHub.tsx`, `src/components/career/*`, `src/components/work/*`, any onboarding banners.

### 6. Wireframe — Self panel (mobile 402px)

```text
┌──────────────────────────────────┐
│   ◯  AION orb  ·  Lior            │  identity row
│   "Architect · Phase 2 of 4"      │
├──────────────────────────────────┤
│ What AION knows                   │
│  · prefers evening deep work      │
│  · reading 30 min/day             │
│  · …                              │
├──────────────────────────────────┤
│ Corrections                       │
│  ┌────────────────────────────┐   │
│  │ tell AION something…       │   │
│  └────────────────────────────┘   │
├──────────────────────────────────┤
│ ▾ Privacy & settings              │
│ ▾ Advanced (stats, NFT, XP)       │  → summon profile-stats artifact
└──────────────────────────────────┘
```

### 7. Acceptance / "still feels like app" checks

- [ ] No nav item, drawer item, or button outside the 5 realms is reachable in 1 tap from the chamber.
- [ ] Direct typing of `/journal`, `/hypnosis`, `/business`, `/freelancer`, `/creator`, `/therapist`, `/strategy/<pillar>/assess`, `/quests/<pillar>` mounts ShellV2 with the page as a summoned artifact above chat (not as a standalone page).
- [ ] Empty states across the app no longer contain the words: Generate, Create plan, Choose, Assessment, Dashboard, Hub.
- [ ] Brain sheets show "Ask AION about this" as the primary CTA.
- [ ] Self panel does not render XP/level/streak/NFT cards by default.

### 8. Out of scope (Phase 3)

- Removing legacy components from disk.
- Changing onboarding logic (still runs first-time; just no longer linked from product surfaces).
- Marketing site (`/landing`, `/blog`, `/founding`).
- Admin / affiliate panels.
- Backend, capability, or DB work.

### 9. Risks

- `SummonRoute` requires `ff_shell_v2`; users with the flag off will still see legacy pages as full pages. Mitigation: copy/empty-state cleanup applies to both modes since it's edited inside the legacy components themselves.
- Some pillar pages are deep-linked from emails / push. Wrapping with `SummonRoute` keeps them reachable but reframes them — verify by hand that artifact frame renders the legacy page body without layout collisions.
- `BusinessDashboardWrapper` etc. assume their own shell; rendering inside the artifact frame may need a `compact` prop. If conflicts arise, allow `fullscreen={true}` on `SummonRoute` for those kinds as a safety valve.

### 10. Phase 2 deliverable — single PR

One commit per group: (a) routes + SummonRoute wraps, (b) copy sweep + `aionPresence.ts`, (c) `SelfPanel`, (d) Brain sheet "Ask AION", (e) JourneyView pillar de-linking. End with a manual sweep using `rg` for the forbidden copy strings and the legacy `to="/…"` patterns.