
Goal: prevent any pillar plan (especially Combat) from being generated unless required assessment data is truly complete, and force a missing-data modal flow that asks the user the missing questions before generation continues.

What I found in the current codebase
1) Plan generation is not hard-gated by assessment completeness
- In `supabase/functions/generate-90day-strategy/index.ts`, when assessment is missing/weak, `resolveAssessmentBlock()` falls back to “best practices” and still generates a plan.
- This is why a combat plan can be created before required conditioning metrics are captured.

2) Frontend “Generate Plan” actions do not pre-check missing assessment fields
- `generateStrategy.mutate(...)` is called directly from:
  - `src/components/hubs/DailyMilestones.tsx`
  - `src/components/execution/TodayExecutionSection.tsx`
  - `src/components/missions/PillarModal.tsx`
  - auto-add path in `src/hooks/useDomainAssessment.ts`
- There is no mandatory “collect missing answers first” gate in these entry points.

3) Legacy config shape causes false “completed” signals
- I verified in DB that at least one pillar (`power`) has `domain_config.latest` (legacy) but not `domain_config.latest_assessment`.
- Some UI still checks legacy fields (e.g. `src/pages/power/PowerHome.tsx` uses `config.latest`), so the user can appear “assessed” while strategy engine receives incomplete/legacy data.

4) Assessment extraction loses important planning constraints
- `supabase/functions/domain-assess/index.ts` tool schema requires `willingness`, but `src/components/domain-assess/DomainAssessChat.tsx` currently saves only a subset (subscores/findings/mirror/next_step/confidence) and drops willingness and richer completeness metadata.
- This weakens downstream personalization and hard-rule filtering.

5) Combat assessment is not enforcing mandatory hard metrics
- Combat system prompt is conversational and broad, but not strictly enforcing must-have fields like max sets / round capacity before allowing completion.

Implementation plan

Phase 1 — Introduce a strict “Assessment Quality Contract” per pillar
Files:
- `supabase/functions/_shared/assessment-quality.ts` (new shared helper)
- `supabase/functions/generate-90day-strategy/index.ts`
- `supabase/functions/generate-phase-actions/index.ts` (same gate for on-demand minis)

Actions:
1. Define deterministic required fields per pillar.
- Global minimum:
  - `latest_assessment` exists
  - `assessed_at` exists
  - all subsystem scores present
- Combat-specific mandatory metrics:
  - e.g. `max_pushups`, `max_pullups`, `max_air_squats`, `round_length`, `rounds_capacity`, `rest_between_rounds`, `sparring_frequency` (names finalized to match stored schema)
- Vitality/Power mandatory sets similarly based on their domain contracts.

2. Add a validator that returns:
- `isReady: boolean`
- `missingFields: string[]`
- `missingQuestions: { field, question_he, question_en }[]`
- `reasonCode` (e.g. `MISSING_REQUIRED_ASSESSMENT_DATA`)

3. In strategy generation, hard-fail when required inputs are missing.
- Return structured 400 response containing missing pillars and required questions.
- Do not silently fallback to generic goals when data is insufficient.

4. In phase-action generation, apply same validation.
- Prevent mini generation from running on low-quality pillar assessment state.

Result:
- No plan generation if required assessment data isn’t truly present.

Phase 2 — Enforce required-question completion in Domain Assessment flow
Files:
- `supabase/functions/domain-assess/index.ts`
- `src/components/domain-assess/DomainAssessChat.tsx`
- `src/hooks/useDomainAssessment.ts` (if needed for metadata shape)

Actions:
1. Extend extraction tool schema with required assessment metadata:
- `coverage.required_fields_answered`
- `coverage.missing_fields`
- domain-specific `metrics` object (especially for Combat performance numbers)
- keep `willingness` mandatory.

2. Server-side completion guard:
- If tool call arrives without required fields, instruct model to continue questioning instead of finalizing.
- Ensure “extract_domain_profile” only accepted when required fields are populated.

3. Save full extraction payload in `domain_config.latest_assessment`.
- Include willingness + coverage + required metrics.
- Avoid dropping fields currently discarded in `DomainAssessChat.handleToolCall`.

Result:
- Assessment cannot close early with missing mandatory metrics.

Phase 3 — Add “Missing Questions” popup gate before any plan generation trigger
Files:
- `src/hooks/useStrategyPlans.ts`
- `src/components/hubs/DailyMilestones.tsx`
- `src/components/execution/TodayExecutionSection.tsx`
- `src/components/missions/PillarModal.tsx`
- `src/components/domain-assess/DomainAssessModal.tsx` (optional prop extension)

Actions:
1. In `useStrategyPlans.generateStrategy`, call a backend preflight (same validator logic) before invoke.
2. If backend returns missing requirements:
- return structured error object with missing pillars/questions.
3. In UI callers, catch this specific error and:
- open `DomainAssessModal` for first missing pillar automatically,
- show concise mandatory-message (“Missing required answers before plan generation”),
- optionally queue remaining pillars for sequential completion.

Result:
- User is always prompted for missing answers instead of receiving incomplete plans.

Phase 4 — Legacy data normalization (critical for current users)
Files:
- `src/hooks/useLifeDomains.ts` (read normalization)
- `supabase/functions/_shared/assessment-normalize.ts` (shared)
- optional one-time backend utility function for migration

Actions:
1. Normalize legacy domain_config shapes at read time:
- map `latest` -> `latest_assessment` when safely possible.
- mark `completed=false` if required quality contract still fails.
2. For impossible legacy mappings, require reassessment via modal.
3. Ensure no screen uses legacy-only field checks for gating readiness.

Result:
- Existing users with old data are correctly forced through missing questions, not silently treated as complete.

Phase 5 — Combat-specific hard requirements + UX messaging
Files:
- `supabase/functions/domain-assess/index.ts` (combat prompt/tool schema)
- `src/components/domain-assess/DomainAssessChat.tsx` (UX helper chips)

Actions:
1. Add explicit combat required capture order:
- training mode + discipline
- max set capacity block
- round performance block
- live pressure/sparring block
2. If user skips numeric answer, assistant must re-ask directly.
3. Show “required remaining” indicator in assessment modal (e.g., 2/7 pending) so user sees why it cannot finalize.

Result:
- Combat plan cannot be created without maximum-set/round capacity data.

Acceptance criteria
1) Plan generation is blocked with structured missing-data response if any required assessment field is missing.
2) Clicking Generate always opens missing assessment modal flow when needed (instead of generating).
3) Domain assessment cannot finalize until required questions are answered for that pillar.
4) Combat requires max sets + rounds + pressure metrics before completion.
5) Legacy pillars with old schema are either normalized or explicitly forced to reassess.
6) Stored `latest_assessment` includes willingness + coverage + required metrics for downstream plan engines.

Technical risks and mitigations
- Risk: strict gating may block users with old data.
  - Mitigation: normalization layer + clear reassessment prompts + per-pillar migration fallback.
- Risk: too-rigid required fields for edge users (injury/no gym/no sparring).
  - Mitigation: required fields can accept constrained values (`"not possible"`) but must be explicitly captured.
- Risk: multiple generate entry points drift.
  - Mitigation: centralize preflight in `useStrategyPlans` and backend validator shared helper.

Rollout order
1) Backend validator + strategy hard gate
2) Frontend generate preflight + modal trigger
3) Domain-assess completion guard + full payload persistence
4) Legacy normalization
5) Combat hard-metric enforcement polish + UI progress indicator

Validation plan
- Case A: user with missing combat max sets -> Generate should fail, combat modal opens, asks required questions.
- Case B: user with legacy `latest` only (power) -> marked incomplete until reassessed/normalized.
- Case C: fully completed user -> Generate succeeds, no gating interruption.
- Case D: on-demand mini generation for incomplete milestone pillar -> blocked until assessment quality passes.
- Case E: willingness constraints present in saved assessment and visible in generated protocol outputs.
