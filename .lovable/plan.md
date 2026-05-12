# Conversation-as-Intake — Architecture Shift

## Principle

The chat itself replaces onboarding, assessments, pillar questionnaires, and wizard flows. Every message:

1. updates the memory graph,
2. updates per-pillar confidence,
3. updates identity elements,
4. updates behavioral / emotional / contradiction signals,
5. potentially triggers a curiosity follow-up.

Pillars remain real internally (15 of them, already used by orchestrator) but disappear from the user-facing surface as "tests".

---

## Data layer

### New: `pillar_confidence` (per user × pillar)

```text
user_id        uuid
pillar_id      text         -- e.g. 'health', 'purpose', 'relationships'
confidence     numeric(5,2) -- 0–100
signal_count   int          -- # of inference events
last_signal_at timestamptz
gaps           jsonb        -- ['no info on sleep', 'unclear values']
last_probed_at timestamptz  -- so curiosity engine doesn't nag
```
RLS: owner only. Seeded with all pillars at confidence 0 on first user activity.

### Extend `aurora_memory_graph.node_type` CHECK

Add: `value`, `desire`, `wound`, `goal`, `habit`, `contradiction`, `avoidance`, `strength`, `loop`. (Keep existing belief/fear/breakthrough/pattern/value_shift/dream/blocker/insight.)

### New: `aurora_contradictions`

```text
user_id, pillar_id, statement_a (uuid → graph node), statement_b (uuid → graph node),
detected_at, status ('open' | 'reconciled' | 'dismissed'), aion_note
```

### Soft-deprecate

`aurora_onboarding_progress` stays for backward read-compat but is no longer the gate. `onboarding_complete` is treated as `true` after the first real conversation.

---

## Inference pipeline (memory-writer v2)

Run after every assistant turn (already invoked). Single LLM call returns:

```json
{
  "graph_nodes": [{ "type": "belief", "content": "...", "pillar": "purpose", "strength": 6 }],
  "pillar_signals": [{ "pillar": "health", "delta": 8, "evidence": "...", "gaps_resolved": [...], "gaps_added": [...] }],
  "contradictions": [{ "pillar": "...", "with_node_id": "...", "explanation": "..." }],
  "behavioral_patterns": [...],
  "emotional_trend": "...",
  "identity_elements": [...]
}
```

Writer applies all of these atomically. Confidence math: `new = clamp(0,100, old + delta * decay_factor)` with diminishing returns above 70 to force depth, not breadth.

---

## Orchestrator changes (aurora-chat)

### Lane additions

Add an **intake lane** (always-on, lightweight) carrying:

- top-3 lowest-confidence pillars + their `gaps`
- 1 open contradiction (if any)
- "depth map" summary: what AION knows / assumes / is unsure about

### Curiosity engine

Before sending the prompt, decide whether to attach a *probe directive*:

- skip if user asked a direct question / has urgent intent
- skip if any pillar was probed in last N turns (cooldown)
- otherwise pick the lowest-confidence pillar with the smallest `last_probed_at` and inject:
  > "Internal: confidence on `relationships` is 23%. Gaps: …. If natural, weave ONE curious question about this — never as a survey."

### Contradiction surfacing

If an open contradiction matches the active pillar lane, inject:
> "Internal: user previously said X, now implies Y. If trust allows, name the tension gently."

### Prompt rules (LANE_RULES additions)

- Never label questions as "assessment", "onboarding", or "intake".
- One probe per response max; never a list of questions.
- Mirror language; lead with reflection before any question.

---

## Frontend changes

### Kill the gates (phase 1)

- Remove the onboarding wizard from the post-signup redirect. Land users directly in AION chat.
- Replace "complete your assessment" CTAs with a soft *understanding meter* widget (avg pillar confidence) inside the profile/identity sheet — informational only, no gating.
- Pillar assessment routes (`/strategy/:pillar/assess`, intake wizards) keep working but are no longer required. They become optional "deep dive" entry points launched from chat suggestions, not navigation.

### New: Understanding panel

Small section in profile/identity sheet:
- ring chart of avg confidence
- per-pillar bar list with `confidence %` and 1-line gap summary
- "AION is currently exploring: <pillar>" chip

### Diagnostics

Add **Section 8: Inference** showing for the last turn:
- graph nodes written (count + types)
- pillar deltas (`relationships +5`, `health +0`)
- contradictions opened/closed
- whether curiosity probe was injected, on which pillar
- whether contradiction surfacing was injected

---

## Migration / rollout phases

```text
Phase 1 — Data + writer
  · pillar_confidence table + RLS + seed trigger
  · extend memory_graph node_type enum
  · aurora_contradictions table
  · memory-writer v2 returns the new structured payload

Phase 2 — Orchestrator
  · intake lane + curiosity engine + contradiction surfacing
  · LANE_RULES updates
  · diagnostics Section 8

Phase 3 — UX dismantle
  · remove onboarding redirect gate
  · replace assessment CTAs with understanding panel
  · keep deep-dive routes accessible from chat suggestions only
```

Each phase is shippable independently.

---

## Out of scope (now)

- Deleting existing intake/wizard pages — they stay as optional deep dives.
- Visible "15 pillars" navigation — already de-emphasized; full removal handled when the new understanding panel is live.
- Voice-mode-specific changes — inherits the same pipeline automatically.

---

## Risks & guards

- **Probe spam**: enforce per-pillar cooldown + global "max 1 probe / 3 turns".
- **False contradictions**: require strength ≥ 5 on both nodes before surfacing.
- **Confidence inflation**: diminishing returns + `signal_count` floor before reporting > 50%.
- **Stale `aurora_onboarding_progress`**: read-only fallback, never written to from new code.

---

## Acceptance signals

- A new user signs up → lands in AION chat → first 3 turns produce ≥ 5 graph nodes and confidence updates across ≥ 2 pillars, with no wizard ever shown.
- Within 10 turns, AION asks a natural follow-up about the lowest-confidence pillar — and diagnostics Section 8 shows the probe was intentional.
- A user who first says "I value freedom above all" and later schedules every hour rigidly triggers a `contradiction` row and a gentle AION mention within 1–2 turns.
