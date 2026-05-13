# AION Orchestration Reset — Architecture Blueprint

Analysis only. No files will be changed until you approve.

---

## 1. Current Orchestration Map (what happens today on a user message)

```text
User types in dock
  │
  ▼
useAuroraChat (client hook)
  ├─ POST /aurora-chat (stream)        → text reply via Lovable AI gateway
  ├─ fire-and-forget memory-writer     → emotion → intent → journal → graph upsert
  └─ fire-and-forget aionSkills.*      → intent.classify / emotion.detect / next.action
                                        (writes rows into aion_signals)

Background (cron + on-demand):
  aion-brain  ── reads aion_signals ── writes aion_decisions (mode/tone/density)
                                        │
                                        ▼
                          AionDecisionContext  →  EnvironmentProvider
                                        │              │
                                        ▼              ▼
                                MotionLayer / ChromeGate / OrbState

Sibling subsystems (today: not connected to chat):
  action-items, life-plans, journal-entries, hypnosis,
  generate-100day-strategy, generate-tactical-schedule,
  generate-daily-actions, pillar-confidence, profile/DNA,
  artifactBus (emitArtifact), AuroraActionsContext, OuterWorld actions
```

**Reality check:** Chat = text + signals + ambient mood. Everything else is reachable but never *triggered* by AION as part of a turn.

---

## 2. Missing Links

| Capability | Today | Gap |
|---|---|---|
| Chat → action-items mutation | none | AION cannot create/check off tasks from a turn |
| Chat → plan/strategy invocation | none | "restart my strategy" routes to nothing |
| Chat → artifact card rendering | `artifactBus` exists, never emitted from chat | no bridge |
| Chat → graph influence on reply | memory-writer writes graph *after*; reply doesn't read it | one-way |
| Decisions → composer/UI actions | only feeds Environment mood | no capability dispatch |
| Capability discovery | hardcoded skill list | no registry the model can pick from |
| Contradiction / gap detection | none | brain never asks follow-ups |
| Profile/DNA writes from chat | none | identity is read-only from chat |
| Proactive engine | aurora-proactive exists, isolated | not part of decision loop |
| Memory dedupe across turns | partial in graph | no per-conversation "said-recently" filter → repetition |
| Reasoning leak guard | sanitizeStream covers chat | no guard for tool/JSON paths |
| Old onboarding/wizard suppression | inconsistent | legacy openings still fire |

---

## 3. Final AION Decision Pipeline

```text
[User message]
   │
   ▼
(1) PRE-TURN SENSE          (client → aion-orchestrator, parallel, <120ms budget)
      • intent.classify
      • emotion.detect
      • route + active-pillar snapshot
   │
   ▼
(2) GRAPH READ              (aurora-chat: pull top-K relevant nodes/patterns
                             + last decision + open action_items + DNA seed)
   │
   ▼
(3) CAPABILITY ROUTER       (LLM tool-choice over Capability Registry §4)
      decides: reply-only | call capability | ask follow-up | summon artifact
   │
   ├──► (3a) Capability execution (idempotent, server-authoritative)
   │         e.g. plans.restart, mission.create, hypnosis.start,
   │              graph.openNode, profile.update
   │
   ├──► (3b) Artifact decision (§5) → emits AionArtifact via stream side-channel
   │
   ▼
(4) RESPONSE COMPOSER       (streaming text, sanitized, niqqud-stripped,
                             repetition-filtered against last 5 assistant msgs)
   │
   ▼
(5) POST-TURN WRITER        (fire-and-forget, after stream end)
      • memory-writer (emotion → graph → patterns → identity)
      • journal.extract (if shouldSave)
      • action_items diffs (if capability touched them)
      • aion_signals append (for brain)
      • aion-brain debounced refresh (decision)
   │
   ▼
(6) PROACTIVE FOLLOW-UP     (aurora-proactive, gated by decision.density and
                             "ask one question max" rule; surfaces nudge artifacts
                             via artifactBus, never extra chat bubbles)
```

Latency budget: 0–250ms sense, 250ms–stream router+compose, post-turn ≤2s.

---

## 4. Capability Registry (single source of truth)

A typed registry server-side (`supabase/functions/_shared/capabilityRegistry.ts`) that the router LLM picks via `tool_choice`. Each capability = `{ id, description, paramsSchema, run(userId, params) }`.

Initial set:

```text
plan.create            plan.update            plan.restart        plan.delete
strategy.generate100d  tactical.generateWeek  daily.generate
mission.create         mission.update         mission.complete
habit.create           habit.update           habit.checkin
action.create          action.complete        action.snooze
journal.write          journal.extract
hypnosis.start         hypnosis.recommend
brain.openNode         brain.exploreRoom      brain.queryGraph
identity.updateProfile dna.recompute
business.createDraft   business.generatePlan
landing.generate       landing.preview
outerWorld.open        coach.recommend
progress.summarize     contradiction.detect   gap.detect
followup.ask           nextStep.suggest
```

Every capability emits one `aion_signals` row + (optionally) one artifact spec. Model never writes free SQL.

---

## 5. Artifact System

The composer streams text **and** can attach 0–1 artifact spec per turn (a JSON sentinel block parsed by the client, then forwarded to `artifactBus`).

| Trigger | Artifact kind |
|---|---|
| pure conversation, vent, smalltalk | text only |
| `action.create` / `action.complete` | task card |
| `plan.*` | plan card |
| `mission.*` | mission card |
| `brain.openNode` / contradiction | brain node card |
| `brain.exploreRoom` | room exploration card |
| `hypnosis.start` | hypnosis player |
| `business.*` | business builder |
| `landing.*` | landing page preview |
| destructive op (delete plan, restart strategy) | confirmation sheet (must accept before run) |

Artifact rule: **one per turn**, sticky=false unless a confirmation is required.

---

## 6. State Ownership (single owner per concern)

| Concern | Owner |
|---|---|
| User intent (classified) | `aion_signals` (write) + `AionDecisionContext` (read) |
| Conversation memory (verbatim) | `aurora_conversations` / `aurora_messages` |
| Long-term semantic memory | `aurora_memory_graph` (via memory-writer only) |
| Pillar confidence | `pillar_confidence` table, written by capabilities only |
| Plans (100d / strategic) | `life_plans` (capabilities `plan.*`, `strategy.*`) |
| Tactical / daily | `action_items` (SSOT, capabilities `action.*`, `daily.*`) |
| Habits | `habits` table, `habit.*` capabilities |
| Profile / DNA | `profiles` + DNA derivation (`identity.*`, `dna.*`) |
| Behavioral patterns | `aurora_behavioral_patterns` (memory-writer mirror) |
| Identity elements | `aurora_identity_elements` (memory-writer mirror) |
| Decisions (mode/tone/density) | `aion_decisions` (aion-brain only) |
| Artifacts (ephemeral) | `artifactBus` (client) |
| UI surface/chrome | `EnvironmentProvider` (reads decisions) |
| Proactive nudges | `aurora-proactive` (writes artifacts only, never chat msgs) |

Cardinal rule: **one writer per table.** Chat never touches `action_items` / `life_plans` / `profiles` directly — only via a capability.

---

## 7. Data Flow per Turn (what every conversation must update)

```text
Always:
  aurora_messages (+1 user, +1 assistant)
  aion_signals    (+intent, +emotion)
  aurora_memory_graph nodes/edges (memory-writer)
  pillar_confidence  (delta from intent + emotion)

Conditionally:
  aurora_behavioral_patterns (≥3 refs of same pattern node)
  aurora_identity_elements   (identity-tagged node)
  action_items               (if a capability ran)
  life_plans                 (if plan.* ran)
  journal_entries            (journal.extract.shouldSave)
  contradictions table       (if contradiction.detect fired)
  aion_decisions             (debounced brain refresh)
```

---

## 8. Natural Behavior Rules (enforced in composer + sanitizer)

- Max one question per turn (post-process: keep only the last "?").
- Strip niqqud (`stripNiqqud` already exists — apply on every assistant chunk).
- Block formal/biblical Hebrew vocabulary (deny-list filter).
- Repetition guard: hash last 5 assistant messages → if cosine ≥0.85 → regen with "say it differently".
- Greeting suppression: if last assistant message <30min, no "שלום/בוקר טוב".
- No invented schedule data: composer cannot mention times unless they came from `action_items` context block.
- Onboarding gate: capabilities `onboarding.*` only fire if `profile.onboarding_complete=false`.
- `PRODUCTION_RULES` already enforces no reasoning, no tool deltas, no system echoes — extend to JSON tool paths.

---

## 9. Implementation Phases (safe rollout)

**Phase 1 — Observe + diagnostics (no behavior change)**
- Add `DiagnosticsHost` panel: live trace of every turn (sense → router → capability → artifact → post-turn).
- Log decision + intent + emotion + chosen capability into `aion_signals` with `trace_id`.
- Verify pipeline fires end-to-end; no UI changes.

**Phase 2 — Capability registry**
- New `_shared/capabilityRegistry.ts` + `aion-capabilities` edge function.
- Migrate existing edge endpoints to thin capability wrappers (`plan.restart` → calls `generate-100day-strategy`, etc.). No new behavior, just unified dispatch.

**Phase 3 — Artifact router**
- Composer emits `<<ARTIFACT …>>` sentinel; client parses and forwards to `artifactBus`. Wire kinds to existing `ArtifactLayer`.
- Add confirmation-sheet kind for destructive caps.

**Phase 4 — Graph-informed responses**
- aurora-chat `contextBuilder` pulls top-K graph nodes by intent + active pillar; injects compact "what AION knows" block.
- Repetition guard + greeting suppression turned on.

_Status: shipped behind env flag `AION_PHASE4=1`._
- Compact "What I know about you" block (top 5 strongest `aurora_memory_graph` nodes) injected into `full` and `lite` prompts regardless of memory lane.
- Anti-repetition rule injected with the last 3 assistant message openings (≤80 chars each) extracted from `modelMessages`.
- Off by default; zero behavior change until `AION_PHASE4=1` is set.

**Phase 5 — Proactive engine**
- aurora-proactive becomes consumer of `aion_decisions` + open `action_items`; emits artifact-only nudges. Hard cap: 1 nudge / 90min / user.

**Phase 6 — Cleanup**
- Remove legacy openings (`SmartOnboardingContext` auto-fire on `/index`, stale "wizard" routes).
- Delete duplicated next-step logic (`useSmartSuggestions` legacy path).
- Mark `_legacy/onboarding/*` deletable.

Each phase is independently reversible behind a flag (`featureFlag.ts`).

---

## 10. Acceptance Tests (and expected behavior)

| Prompt (he/en) | Expected |
|---|---|
| "אני רוצה לאפס את האסטרטגיה שלי" | Router → `plan.restart` → confirmation-sheet artifact → on accept calls `strategy.generate100d`, replies one short line + plan card. |
| "מה כדאי לי לעשות היום?" | Router → `daily.generate` if empty, else `nextStep.suggest` → one task card + 1-line text. No question. |
| "אני תקוע" | Router → `vent` intent → text-only, 1 empathic line + 1 follow-up question; emotion.detect bumps decision toward `recovery`. No tasks pushed. |
| "תבנה לי עסק" | Router → `business.createDraft` → business builder artifact + 1 line. No long monologue. |
| "תראה לי את המוח שלי" | Router → `brain.openNode` (most-active node) → brain node card; navigates Hallway brain room only if user taps. |
| "אני רוצה לישון יותר טוב" | Router → `hypnosis.recommend` → hypnosis player artifact for sleep script + 1 line. |
| "תמחק את התכנית הנוכחית" | Confirmation-sheet (destructive) → on confirm `plan.delete` → 1-line confirmation, no card. |
| "מה אתה יודע עליי?" | Router → `progress.summarize` → text summary built from `aurora_identity_elements` + top patterns; no fabrication; ends with one question. |

---

## Risk Notes Before Build

- **Single-writer invariant** must land before Phase 2 or capabilities will race with legacy hooks.
- Capability registry is a public attack surface — schemas must be Zod-validated server-side, JWT-bound.
- Sentinel-based artifact transport must survive `sanitizeStream`; reserve a token that sanitizer skips.
- Repetition guard needs a small embedding cache (cheap model) to avoid latency hit.
- Brain decisions remain mood-only; never let them silently change data.

Awaiting your approval to start Phase 1.
