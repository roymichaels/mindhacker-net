
# MindOS Strategic Audit & Reset

This is a diagnosis + strategy document. No files will be changed in this pass.

---

## 1. Current architecture map (what actually exists)

**Pages (60+ routes):** `Index, MindOSPage, AuroraPage, PlayHub, ArenaHub, LifeHub, CareerHub, JournalingHub, CoachHub, CreatorHub, FreelancerHub, BusinessDashboard, Community, Courses, HypnosisPage, StrategyPage, ProfilePage, OrbGallery, Onboarding, OnboardingCeremony, Subscriptions, AdminHub, …`

**Shell layers (overlapping):**
- `components/layout/DashboardLayout` (main shell)
- `components/navigation/`: `TopNavBar, BottomTabBar, BottomHudBar, AppNameMenu, AppNameDropdown, AppSideMenu, DesktopSideNav, HeaderActions, HubModalHost`
- `components/shell/`: `OSDrawer, MindOSSheet, AIONPresenceButton` (new, partly wired)
- `components/aurora-ui/`, `components/aurora/`, `components/aion/AIONStateBridge`

**Orb implementations (15+):** `Orb, CSSOrb, CSSGalleryOrb, GalleryMorphOrb, OrganicOrbCanvas, OrganicSphere, PersonalizedOrb, PresetOrb, WebGLOrb, BusinessOrb, SharedOrbCanvas/View, LazyOrbView, AIONFloatingWidget, AIONChatPanel, AIONSignature, OrbFullscreenViewer, OrbParticles, OrbDebugOverlay`.

**AI edge functions (60+):** `aurora-chat, aion-brain, aion-orchestrator, aurora-analyze, aurora-capture-journal, aurora-proactive, aurora-recalibrate, aurora-summarize-conversation, aurora-generate-title, onboarding-chat, plan-chat, work-chat, generate-* (15+), analyze-*, suggest-practices, daily-priority-rebalance, generate-orb-narrative, …`

**Client AI surfaces:** `useAuroraChat`, `aionSkills`, `AionDecisionContext`, `useAionBrain` (new), proactive orchestrator hooks, plus per-feature chat hooks (plan-chat, work-chat, onboarding-chat).

```text
[ User ]
   ↓
[ Routes (60+ pages) ]
   ↓
[ DashboardLayout ] ──┬── TopNavBar / AppNameMenu / HeaderActions
                      ├── OSDrawer (new) + AppSideMenu (old) ← duplicates
                      ├── BottomTabBar + BottomHudBar      ← duplicates
                      ├── HubModalHost (modal stack)
                      └── AIONFloatingWidget / AIONPresenceButton ← duplicates
                                ↓
                  [ aurora-chat | aion-brain | aion-orchestrator | 12 other chats ]
                                ↓
                  OpenRouter (Nemotron) / Gemini / GPT-5 — different per fn
```

---

## 2. Brutally honest diagnosis

The product has the *parts* of a living AI OS but is wired like a portfolio of dashboards. Three structural problems compound each other:

1. **Three parallel shells coexist.** Old (TopNav + BottomTab + AppNameMenu + AppSideMenu + HeaderActions + HubModalHost), mid-era (Aurora dock), and new (OSDrawer + MindOSSheet + AIONPresenceButton). They render simultaneously on different routes → "stacked menus, no hierarchy."
2. **AION is fragmented.** 15 orb components, 4 chat entry points, 2 decision contexts (`AionDecisionContext`, `useAionBrain`), and 12+ edge functions that each own their own prompt/identity. There is no single "AION runtime."
3. **Hubs are pages, not environments.** Every life area is a route with its own layout, header, and chrome. The user navigates a *site*, not an *operating system*.

The leakage bug is a symptom of #2: too many independent prompt surfaces, each re-implementing identity, each with different sanitization.

---

## 3. Top 10 problems (ranked by leverage)

1. **Duplicate shells render simultaneously** — every screen pays a chrome tax.
2. **No single AION runtime** — orb visuals, chat state, and brain decisions live in 3 unrelated trees.
3. **Chain-of-thought leakage** — `aurora-chat` is sanitized, but `plan-chat`, `work-chat`, `onboarding-chat`, `aion-orchestrator`, `aurora-analyze` are not. Any of them can render raw text into the UI.
4. **Hub-as-page model** — 60+ routes where there should be ~6 environments.
5. **Profile/account mixed into app navigation** — identity surfaces compete with workspace surfaces.
6. **Journaling forces structure** — categories, forms, hubs; violates "user expresses, AION structures."
7. **No central orchestrator brain in the loop** — `aion-brain` exists but only `useAionBrain` consumes it; it doesn't drive UI density, environment, or surfacing.
8. **Orb is decorative, not present** — no shared state machine for idle/listening/thinking/speaking/focus/recovery/night.
9. **Web-app density on mobile** — full headers, dropdowns inside dropdowns, modal-on-modal via `HubModalHost`.
10. **Prompt sprawl** — 12+ system prompts re-declare AION's identity, tone, and rules. Drift is guaranteed.

---

## 4. Top 10 highest-leverage fixes

1. **Kill the duplicate shells.** Pick one: `OSDrawer + MindOSSheet + AIONPresenceButton`. Delete `AppNameMenu/Dropdown`, `AppSideMenu`, `BottomHudBar`, `HeaderActions` from the layout tree (keep files until phase-out complete).
2. **One AION runtime** (`src/aion/runtime/`): single context exposing `{ presence, environment, brain, chat, voice, signals }`. Every orb, chat, and overlay reads from it.
3. **One orb component** (`AIONOrb`) with a state prop. Retire the other 14 to `legacy/`.
4. **Universal sanitizer + identity guard** in `_shared/aiSkill.ts` — every edge function that returns text to the UI must pass through it. Prompts get `FINAL_ONLY_GUARD` from one constant.
5. **Environments replace hubs.** 6 environments (Focus, Flow, Plan, Recover, Reflect, Night). Existing hubs become *artifacts* surfaced inside the active environment.
6. **Composer-first mobile shell.** Bottom = composer + orb. Top = environment chip + drawer trigger. Nothing else.
7. **Implicit journaling.** Every chat turn → `aurora-capture-journal` decides silently if it's journal-worthy. No category UI.
8. **Brain drives surfacing.** `aion-brain` returns `{presence, environment, suggestion, density, artifact}`; layout reads `density` (compact/normal/immersive) and renders accordingly.
9. **Profile/account moved out of nav.** Lives only inside the OSDrawer footer + a dedicated `/me` route. Removed from header entirely.
10. **One chat transport.** `aurora-chat` becomes the only streaming endpoint. `plan-chat`, `work-chat`, `onboarding-chat` become *skills* invoked by `aion-orchestrator`, not separate chats.

---

## 5. Recommended Information Architecture

```text
MindOS (single surface)
├── Environments (replace hubs)
│   ├── Focus       (was Work, Arena)
│   ├── Flow        (was Play, Quests, Missions)
│   ├── Plan        (was Strategy, Career, Business, Projects)
│   ├── Recover     (was Hypnosis, Rituals)
│   ├── Reflect     (was Journaling, Memory)
│   └── Night       (low-stim mode)
├── Artifacts (surfaced contextually inside an environment)
│   ├── Strategy boards, Missions, Courses, DNA, Avatar, Plans, Reports
├── Identity (/me)
│   ├── Profile, DNA, Avatar, Subscription, Settings
└── Social (/community)
    └── Community, Marketplace, Coaches
```

Routes collapse from ~60 to ~10. Existing pages stay as renderable artifacts but stop being primary navigation targets.

---

## 6. Recommended component hierarchy

```text
<MindOSShell>
  <OSDrawer/>                ← left: hubs-as-history, artifacts, profile
  <EnvironmentSurface>       ← center: active environment renders artifacts
     <ArtifactSlot/>
  </EnvironmentSurface>
  <MindOSSheet/>             ← bottom-center: environment switcher
  <Composer/>                ← bottom: text + voice
  <AIONPresenceLayer>        ← right/floating: orb + overlay
     <AIONOrb state={...}/>
     <AIONOverlay/>          ← full-screen scrim when summoned
  </AIONPresenceLayer>
</MindOSShell>
```

Single layout. No per-page chrome. Page components become *artifacts* mounted into `<ArtifactSlot/>`.

---

## 7. Recommended AI / orchestration architecture

```text
            ┌───────────────────────────┐
Signals →   │   aion-brain (decision)   │  ← Nemotron free, cached 10s
            └─────────────┬─────────────┘
                          ▼
              { presence, environment,
                density, suggestion,
                artifact, nudge }
                          ▼
            ┌───────────────────────────┐
User chat → │   aurora-chat (stream)    │  ← single transport, sanitized
            └─────────────┬─────────────┘
                          ▼
            ┌───────────────────────────┐
Tool calls →│   aion-orchestrator       │  ← skills: plan, work, onboarding,
            │   (skill registry)        │     journal-capture, recalibrate, etc.
            └───────────────────────────┘

Shared:
  _shared/aiSkill.ts        — sanitizer, identity guard, model fallback
  _shared/skillRegistry.ts  — single source for all callable tools
  _shared/identity.ts       — FINAL_ONLY_GUARD + AION persona (one file)
```

Three layers, three responsibilities. No more 12-prompt drift.

**Model policy:** Nemotron-free for classification/decision; Gemini-flash-lite for cheap text; GPT-5 / Gemini-2.5-pro only for user-visible polished responses.

---

## 8. Orb strategy

Single `<AIONOrb>` reads `presence` from the runtime. States and triggers:

| State | Trigger | Visual |
|---|---|---|
| idle | default | slow breathe, low intensity |
| listening | voice/text input focused | outer ring pulse |
| thinking | brain or chat in flight | internal swirl, **never** spinner or text |
| speaking | TTS playing | waveform halo synced to audio |
| focus | env=Focus | tight, cool hue |
| recovery | env=Recover | soft, warm, dim |
| night | env=Night or local time | very dim, slow |
| breakthrough | brain emits `nudge.kind=breakthrough` | brief bloom |

Behavior rules:
- Tap orb → summon overlay (chat + voice + active suggestion).
- Long-press → mute AION for the session.
- Orb is *always* mounted (one instance, top-level), never duplicated per page.

---

## 9. Mobile-native UX direction

Adopt these mobile rules globally:

- **No horizontal headers with >2 elements.** Left = drawer trigger. Right = orb. Center = environment chip.
- **Bottom-sheets, not modals.** `HubModalHost` retires. Use a single `<Sheet>` primitive.
- **Composer always visible.** Like ChatGPT/Lovable mobile.
- **Safe-area + 44px touch targets** enforced via tokens, not per-component.
- **Transitions:** environment switch = fade + hue shift (200ms). Overlay = spring sheet. No route slides.
- **Density tokens** driven by `brain.density`: `compact | normal | immersive`. CSS vars on `<body>`.

---

## 10. Journaling strategy

- Remove category pickers from UI.
- Every assistant turn fires (debounced) `aurora-capture-journal` skill: returns `{ journalWorthy, summary, tags, links }`.
- If `journalWorthy`, write silently to `journal_entries`; surface a tiny "saved to reflect" toast only on first occurrence per session.
- Reflect environment renders the timeline + AION-generated weekly synthesis.

User principle: *Users express. AION structures.*

---

## 11. AI-leak production rules (universal)

Apply to **every** edge function returning text to UI:

1. Pass system prompt through `withFinalOnlyGuard()`.
2. Set `reasoning: { exclude: true }`, `include_reasoning: false` on OpenRouter.
3. Pipe response through `sanitizeStream()` (already exists for `aurora-chat`).
4. Drop any field other than `delta.content` client-side (`productionRules.streamOnlyFinalAnswer`).
5. Reject any output containing `<tool_call>`, `<reasoning>`, `[Internal]`, `As AION`, `Now, for my response`, timestamp dumps — replace with terse fallback.

This is the single most important production hardening step.

---

## 12. Recommended implementation order

**Phase A — Stop the bleeding (1 pass):**
1. Apply universal sanitizer + identity guard to all chat-returning edge functions.
2. Remove duplicate shell layers from `DashboardLayout` (keep files, just unmount old ones).

**Phase B — Unify AION (1–2 passes):**
3. Build `src/aion/runtime/` (single context).
4. Replace orb usages with single `<AIONOrb>` reading runtime.
5. Wire `aion-brain` output into shell density + environment + presence.

**Phase C — Environments (2–3 passes):**
6. Create 6 environments. Map existing hubs → artifacts inside them.
7. Convert `HubModalHost` → single bottom `<Sheet>`.
8. Move profile/account into drawer footer + `/me`.

**Phase D — Implicit journaling + proactive (1 pass):**
9. Wire `aurora-capture-journal` after every assistant turn.
10. Activate proactive orchestrator nudges via brain.

**Phase E — Cleanup (1 pass):**
11. Move legacy components to `src/legacy/`. Remove dead routes from router (keep files for now).

---

## 13. What NOT to touch yet

- **Database schema** beyond the already-planned `decision_id` column. No migrations for environments — they're a frontend concept.
- **Auth, payments, Stripe, Web3Auth** — orthogonal, working.
- **DNA, Avatar, NFT triad** — preserved as artifacts, no redesign.
- **Memory graph, hypnosis engine, marketplace logic, gamification RPCs** — backend stays.
- **`src/integrations/supabase/*`, `.env`, `supabase/config.toml`** — never edit.

---

## 14. Risks & anti-patterns to avoid

- **Big-bang rewrite.** Don't. Phase A→E, ship between phases.
- **Deleting features to "simplify."** Hide via environments/artifacts; never remove depth.
- **Per-page AI prompts.** Always go through `_shared/identity.ts`.
- **Multiple orbs mounted at once.** One instance, top-level.
- **Pages owning their chrome.** Pages render *content only*; shell owns chrome.
- **Bottom sheets that feel like modals.** Use spring physics + drag-to-dismiss.
- **Brain decisions driving destructive UI changes** (auto-closing user's work). Brain suggests, never seizes.
- **Treating Nemotron-free as a polished-output model.** Use it for classification/decision only.

---

## 15. First concrete next step (when you approve build)

Phase A only:
- Add `_shared/identity.ts` (`FINAL_ONLY_GUARD`, AION persona) and apply to all UI-returning edge functions.
- Reuse `sanitizeStream` across them.
- In `DashboardLayout`, unmount: `AppNameMenu`, `AppSideMenu`, `BottomHudBar`, `HeaderActions`, `AIONFloatingWidget`. Keep: `OSDrawer`, `MindOSSheet`, `AIONPresenceButton`, `BottomTabBar` (until environments land).

That alone removes the leakage class of bug *and* the "stacked menus" feel — without touching features.
