# Phase 4 — Trajectory Collapse & Living Chamber Transformation

Transform AION from a feature-grid app into a single living chamber. No new features, no new hubs. Only collapse, abstract, and manifest. Work proceeds in 7 sequential sub-phases, each independently shippable and reversible.

---

## Guardrails (apply to every sub-phase)

- No backend / DB / route / capability changes.
- No new components, no deletions. Hide via flags + wrappers; mark legacy with `@deprecated` JSDoc only.
- Frontend / presentation only. No business-logic rewrites.
- All copy via `aionPresence.ts` (extend, don't fork). Hebrew + English parity.
- Every sub-phase ends with: files changed, terms replaced, leaks remaining, next phase.

---

## 4A — Chamber Centering (Main Surface Polish)

Goal: the root authenticated surface feels like one breathing chamber, not a routed app.

- Audit `ShellV2` layer stack. Confirm `BackgroundLayer` + `AtmosphereLayer` carry ambient gradient + breathing motion; raise opacity/contrast of orb glow, soften chrome to `bg-transparent` with backdrop-blur only on scroll.
- `ChromeLayer` / `ShellV2Header`: collapse to a single ambient strip — orb-state indicator + minimal nav affordance. Remove visible "page title" text on chamber routes.
- `NavLayer`: convert tab-bar into a 3-dot summon trigger that opens an ambient drawer (existing `ShellV2Drawer`). Default state = hidden; appears on idle-break gesture (already wired via `useChamberIdle`).
- `AionScreen` wrapper: deprecate `withHeader`/`withDock` defaults that reserve large padding on chamber routes; make padding driven by presence state, not by layout constant.
- Remove residual `min-h-screen bg-background` page roots that bypass ShellV2 (sweep `src/pages/*` — flag, don't delete).

Acceptance: navigating between `/`, `/chat`, `/strategy` shows no visible route transition — only orb state shifts.

---

## 4B — Artifact Behavior Unification

Goal: every "page-like" surface (Hub, Dashboard, Modal, Wizard) routes through `artifactBus` with consistent summon/dismiss choreography.

- Audit `artifactRegistry` vs. surfaces still rendered as routed pages: `LifeHub`, `WorkHub`, `ArenaHub`, `BusinessDashboard`, `Community`, `ProfilePage`, brain `RoomView`, hypnosis surfaces.
- For each, add an artifact-kind entry (already partially present: `business-dashboard`, `journal`, `hypnosis`, `pillar-*`, `quest`, `missions`, `profile-stats`). Wrap the existing page component as the artifact body — no rewrite.
- Standardize `ArtifactFrame` chrome: remove title bar text on chamber-mode artifacts, replace with a soft top-fade close affordance. Fullscreen artifacts breathe (subtle scale-in 1.02 → 1.0, 600ms, ease-out).
- Add `artifactBus.summonFromIntent(intent)` — pure mapping function, no new surface. Used by Aurora chat tool-calls + deep links.
- Legacy routes remain reachable but `redirects.tsx` rewrites them to chat with an auto-summon param, so `/work` becomes "AION manifests Work artifact in chat".

Acceptance: clicking a legacy route URL produces an artifact summon inside chat, not a route swap.

---

## 4C — Trajectory-Based UX (collapse the 7 next-step hooks)

Goal: one `useNextStep()` service replaces `useFocusQueue`, `useDailyPriorities`, `useNextMission`, `useUpcomingMilestones`, `useTodayActions`, plus 2 more identified in Ontology Map.

- Create `src/services/trajectory/useNextStep.ts` — pure aggregator over `action_items` SSOT. No new tables, no new RPCs. Returns `{ kind, item, reason, confidence, suggestedManifestation }`.
- Each existing hook becomes a thin re-export from `useNextStep` filtered by `kind`. Old call sites untouched.
- Replace top-of-chamber "What's next" copy with AION-voiced inferences from `aionPresence.ts`: "I noticed X" / "This keeps returning" / "Now feels right for Y" — never "Do task N".
- Remove visible counters (overdue badges, streak counts) from chamber surface; relocate to `profile-stats` artifact only.

Acceptance: chamber surface shows zero numeric badges; next-step text reads as observation, not instruction.

---

## 4D — Brain Room Conversationalization

Goal: `BrainView` / `RoomView` / `BrainNodeSheet` stop feeling like a graph inspector; become an AION-narrated memory walk.

- `RoomView`: hide node labels by default; reveal on hover/tap. Replace sidebar metadata panel with an AION speech bubble that narrates the node's role in the user's trajectory.
- `BrainNodeSheet`: collapse multi-tab inspector into a single scrolling "AION's notes on this" surface. Existing tab content becomes inline sections with soft dividers, no tab bar.
- Convert "Add edge" / "Backfill" / debug controls to a hidden diagnostics-only path (gate behind `useDiagnosticsFlag`).
- Copy: replace "node", "edge", "graph", "room" in user-facing strings with "memory", "connection", "field", "chamber".

Acceptance: a non-technical user opening Brain sees a narrated memory space, not a data viz.

---

## 4E — Journey Collapse

Goal: `Journey`, `100-day mission`, `Milestones`, `PillarQuests`, `LifeHub` strategy view all read as one continuous trajectory, surfaced via artifacts.

- Single `journey` artifact becomes the canonical view — already in registry. Other journey-flavored artifacts (`pillar-history`, `missions`, `quest`) re-route to filtered views of the same artifact via params.
- Remove pillar-grid landing in `LifeHub`; replace with a single AION manifestation card that summons the relevant journey slice based on `useNextStep`.
- Milestone/mission language softened: "Day N of 100" → "Phase {n}", "Mission" → "Path", "Quest" → "Thread". Keep DB enum values untouched.
- `StoryWorldContext` integration: journey artifact uses story scene generator (already wired via `api/story/generate-scene.ts`) for ambient narration headers.

Acceptance: opening any journey-related surface lands inside one artifact with a narrated header, not a feature page.

---

## 4F — Self / DNA Evolution Presentation

Goal: Self panel becomes identity contemplation, not a profile dashboard.

- `SelfPanel`: default view = orb + DNA helix + one AION sentence about current identity phase. No stats, no buttons besides "Ask AION about me" and "Open advanced" (the existing `profile-stats` artifact bridge from Phase 3B).
- DNA viewer: surface 4 archetype/cognition/rhythm/transformation facets as floating glyphs around the helix; each tap opens an AION narration sheet (reuses `BrainNodeSheet` shell, no new component).
- Avatar: hide modular-parts editor behind a long-press on the avatar; default tap = avatar speaks an aionPresence line. NFT/Collectible cards demoted to artifact-only.
- Copy purge: remove remaining "stats", "score", "rank", "level", "XP" in Self surfaces (Ontology Map flagged `LootItemCard`, `practice.skill_level` "Lv." prefix, achievement category metadata — handle now).

Acceptance: Self surface contains zero numeric metrics by default; advanced data only via summon.

---

## 4G — Hidden Infrastructure & Final SaaS Sweep

Goal: every remaining "tool" / "generator" / "module" surface either disappears or becomes an AION manifestation.

- Sweep visible strings across `src/pages`, `src/components`, `src/copy`: "module", "tool", "generator", "engine", "system", "wizard", "settings" (where user-facing) → AION-voiced equivalents or removed.
- Move developer/admin surfaces under `/diagnostics/*` and `/admin/*` only — remove links from any user nav.
- `aionPresence.ts`: add `manifestationLines` namespace covering all 7 sub-phase contexts so Aurora chat + artifact headers + empty states pull from one SSOT.
- Final scan: run `rg` for forbidden terms list (`dashboard|hub|generator|assessment|module|onboarding funnel|feature`) across user-facing src; produce delta report.
- Update `mem://index.md` Core rules with the new vocabulary contract.

Acceptance: forbidden-term scan returns zero hits in user-facing files; all hits documented as admin/dev/internal-only.

---

## Technical Notes

**Files in scope (high-touch):**
- `src/shellv2/**` — chamber polish (4A)
- `src/components/artifacts/**`, `src/lib/aion/artifactBus.ts`, `src/lib/aion/artifactRegistry.ts` — unification (4B)
- `src/services/trajectory/useNextStep.ts` (new), thin re-exports in `src/hooks/useFocusQueue.ts` etc. (4C)
- `src/features/brain/**` — conversationalization (4D)
- `src/pages/LifeHub.tsx`, `src/components/play/**`, `src/components/missions/**` — journey collapse (4E)
- `src/components/self/**`, `src/features/brain/SelfPanel.tsx`, DNA + avatar components (4F)
- `src/copy/aionPresence.ts`, `src/routes/redirects.tsx`, sweeping rg pass (4G)

**Non-goals reaffirmed:** no new tables, no new edge functions, no new routes, no new features, no component deletions, no DB migrations, no capability changes. EvolvVerse stays separate (no merge).

**Risk controls:** each sub-phase behind a feature flag (extend `ff_shell_v2` pattern). Legacy components kept; only call sites swapped. Rollback = flip flag.

**Order rationale:** 4A first establishes chamber feel so 4B artifacts have a host. 4C unifies data so 4D–4F have one trajectory source. 4G is the final purity sweep.

**Per-phase deliverable:** files changed, copy terms replaced, intentionally-left internal terms, remaining leaks, next phase recommendation — same format as Phases 3A/3B/3B.1.
