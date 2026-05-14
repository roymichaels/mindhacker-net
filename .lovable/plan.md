## Phase 3A — Copy + Legacy UX Leak Sweep

Pure copy pass. No layout, no logic, no routes, no DB.

### 1. Expand the copy SSOT (`src/copy/aionPresence.ts`)

Add new bilingual keys so all replacements pull from one file:

- `aionLearning` — "AION is learning this" / "AION עדיין לומד"
- `feelsClear` — "This feels clear" / "זה מרגיש ברור"
- `whatShapedThis` — "What shaped this" / "מה עיצב את זה"
- `memory`, `pattern`, `connection` (for Node/Graph/Edge)
- `space`, `realm` (for Hub/Dashboard)
- `reflection` (for Assessment)
- `continueJourney` already exists — reuse for "Generate plan" / "Create 100‑Day Plan"
- `askAion` already exists — reuse for "Generate" / "Create with AI"

### 2. Surfaces to sweep (visible legacy copy → AION voice)

| File | Current legacy string | Replacement |
|---|---|---|
| `src/pages/LifeHub.tsx` | `"100-Day Plan"` button + title | `continueJourney` |
| `src/pages/ArenaHub.tsx` | `"Generate AI Schedule"`, `"Click Generate AI Schedule…"` empty state | `askAion` + "AION will compose your rhythm" |
| `src/pages/WorkHub.tsx` | `"🔧 Work Hub"`, `"AI Work Wizard"` headers, tab `"Stats"` | "Work" / "Ask AION about work" / "Rhythm" |
| `src/pages/CareerHub.tsx` | `"Career Hub"` heading, "Wizard" | "Career" / "Path" |
| `src/pages/JournalingHub.tsx` | header / placeholder copy | "Journal" / "Speak freely" |
| `src/pages/HypnosisPage.tsx` | "Generate session" CTA | `askAion` |
| `src/pages/ProfilePage.tsx` + `src/components/self/*` | any remaining "Dashboard"/"Stats" labels | "Self" / "What AION knows" |
| `src/features/brain/BrainNodeSheet.tsx` | `"Confidence"`, `"Strength"`, `"Evidence"`, `"Node"`, `"Graph"` UI labels | `feelsClear`, `aionLearning`, `whatShapedThis`, `memory`, `connection` |
| `src/features/brain/atlas/RoomView.tsx` | `"{n}% confidence"` chip | "AION feels this strongly" / softened tier label |
| `src/components/journey/NextStepCard.tsx` + `JourneyView` empty | any "Generate plan" CTAs | `continueJourney` / `askAion` |
| `src/components/outer/AlignedRealities.tsx` | row labels saying "Hub" | drop the word, just the realm name |
| `src/pages/OuterWorldHub.tsx` | header copy if it says "Hub" | "Outer World" |
| `src/components/missions/PillarModal.tsx` | `"Generate 100-Day Plan"` | `continueJourney` |
| `src/components/missions/MiniMilestoneModal.tsx` | `"Generate Daily Actions"` | `askAion` |
| `src/components/profile/OrbNarrativeCard.tsx` | `"Generate new story"` | `askAion` |
| `src/components/play/StrategyPillarWizard.tsx`, `DailyMilestones.tsx` | `"Assessments completed"` | "Reflections so far" |
| `src/components/pillars/LifeActivitySidebar.tsx`, `ArenaActivitySidebar.tsx` | `"100-Day Plan"` chips | `continueJourney` |
| `src/components/career/*`, `src/components/careers/business/BusinessCard.tsx`, `BusinessDashboardModals.tsx`, `CoachDashboardOverview.tsx`, `ClientProfilePanel.tsx`, `AutoPlanEngineModal.tsx` | "Dashboard", "Generate Plan", "Generate AI Plan", "Generate Analysis" | "Space" / `askAion` / `continueJourney` |
| `src/pages/NotFound.tsx` | `"Dashboard"` link | "Open AION" |
| `src/pages/BusinessDashboard.tsx` | `"Generate Plan"` button | `continueJourney` |
| `src/components/aion/manifestation/moods.ts` (if any "Dashboard" copy) | revisit | AION voice |

### 3. XP / Level / Streak / NFT — hide by default

These already live behind the "Advanced" toggle in `SelfPanel` (Phase 2). Sweep:

- `src/components/gamification/AchievementGallery.tsx` — keep, it's only shown under Advanced. No copy change needed.
- `src/components/energy/EnergyHistory.tsx` `"Streak Bonus"` — keep, advanced surface.
- `src/components/hypnosis/SessionStats.tsx` `"XP"` chip — replace label with `"Energy"` (already our user-facing currency).
- `src/components/modals/UserDocsModal.tsx` — left as-is (docs/help surface, technical by nature).
- `src/components/founding/FoundingPlatformDeep.tsx`, `src/components/home/*` (Pricing, Plan cinematic, Guild, Gamification) — **public marketing pages, not the in-app OS**. Leave untouched per scope ("user-facing app", not landing).

### 4. Intentionally NOT touched

- `src/pages/admin/*`, `src/pages/AdminHub.tsx`, `src/pages/AdminJourney.tsx`, `src/pages/panel/*` — admin/affiliate.
- `src/diagnostics/*` — dev trace.
- `src/features/brain/data/*`, `useBrainFallback.ts`, `inferSoftEdges.ts`, `types.ts` — internal data shapes (`confidence`, `strength`, `score` are field names, not UI).
- `src/components/web3/SoulAvatarMintWizard.tsx` description — wallet flow, technical.
- `src/components/launchpad/*` — internal launchpad name kept until a separate rename pass.
- `src/components/home/*`, `src/pages/FoundingLanding.tsx`, `src/pages/Index.tsx` marketing — outside the OS shell.
- `src/_legacy/*` — already legacy-fenced.

### 5. Mechanics

- One pull request, copy-only diffs.
- Every replacement reads from `aionPresence` (or its t() equivalent) so a future tone tweak is single-file.
- Hebrew strict full spelling preserved; LTR isolation kept where numbers appear.
- No file deletions, no prop renames, no component splits.

### 6. Acceptance / report

After the sweep the deliverable returns:

- files changed (expected ~25)
- forbidden terms found (table by file)
- replacements made (count per term)
- terms intentionally left (admin/dev/marketing — listed above)
- remaining visible UX leaks (any dynamic copy from edge functions / DB strings — flagged for Phase 3B)
- next recommended phase: **3B — Profile-stats artifact bridge**, then **3C — hub pages as artifact-only visual shells** (the structural follow-up to this copy pass)

### 7. Out of scope (deferred)

- Renaming exported symbols (`LifeHub`, `ArenaHub`, `WorkHub`) — internal identifiers, not visible.
- Replacing `Wizard` component class names — same reason.
- Marketing/landing pages.
- Help/docs modal.
