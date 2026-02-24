
Goal: make “Create 100 Day Plan” behave as a guided flow (open assessment chat) instead of triggering runtime/non‑2xx errors.

What I found
1. The request is reaching the backend function successfully, and the backend returns a structured missing-data payload.
   - Network snapshot shows `POST .../generate-90day-strategy` with status `400` and body:
     - `error: "MISSING_ASSESSMENT_DATA"`
     - `missing_pillars: [...]`
2. The function currently returns HTTP 400 for an expected business-state (“assessment incomplete”), not a true server failure.
   - In `supabase/functions/generate-90day-strategy/index.ts` around the assessment quality gate, it explicitly returns `status: 400`.
3. The platform/runtime treats non-2xx from backend functions as app/runtime errors (the exact red toast and blank-screen error container user is seeing), so even with frontend parsing attempts, UX still breaks.
4. There is a second latent issue: `consciousness` is missing from `DOMAIN_ASSESS_META` in `src/lib/domain-assess/types.ts`.
   - If the missing pillar opened is `consciousness` (which is first in your payload), assessment chat logic can break when tool-call completion computes weighted subsystem score using `meta.subsystems`.

Implementation plan
1. Reclassify “missing assessment” from transport error to domain response in backend function
   - File: `supabase/functions/generate-90day-strategy/index.ts`
   - Change the quality-gate response for `!qualityCheck.ready` from HTTP 400 to HTTP 200.
   - Keep payload shape the same (`error`, `message`, `missing_pillars`) so existing UI logic still works.
   - Why: avoids runtime “non-2xx” crash handling while preserving structured missing-field guidance.

2. Harden frontend strategy generation parsing to treat missing-assessment from either data or error path identically
   - File: `src/hooks/useStrategyPlans.ts`
   - Keep current `data?.error === 'MISSING_ASSESSMENT_DATA'` handling as primary path (this becomes reliable after step 1).
   - Keep defensive error parsing for backward compatibility (in case any old deployments or alternate callers still return non-2xx).
   - Normalize output to one custom error shape:
     - `code: 'MISSING_ASSESSMENT_DATA'`
     - `missingPillars: [...]`
   - Ensure global mutation `onError` continues suppressing destructive toast for this code.

3. Add robust UI fallback when missing pillar list is empty/partial
   - Files:
     - `src/components/hubs/DailyMilestones.tsx`
     - `src/components/life/LifeActivitySidebar.tsx`
     - `src/components/arena/ArenaActivitySidebar.tsx`
     - `src/components/execution/TodayExecutionSection.tsx`
     - `src/components/missions/PillarModal.tsx` (if still used for plan generation CTA)
   - Current behavior opens modal only if `err.missingPillars?.length > 0`.
   - Add fallback resolution:
     - First try backend-provided first pillar (`pillarId` or `pillar`).
     - If unavailable, derive first unconfigured/needs_reassessment domain from `useLifeDomains().statusMap`.
   - This guarantees “something opens” instead of “nothing happens”.

4. Fix consciousness assessment meta gap (prevents next crash after modal opens)
   - File: `src/lib/domain-assess/types.ts`
   - Add `CONSCIOUSNESS_SUBSYSTEMS` and include `consciousness` in `DOMAIN_ASSESS_META`.
   - Keep IDs aligned with existing consciousness assessment/tool schema.
   - Why: when missing pillar is consciousness, chat completion/save flow won’t fail on `meta.subsystems`.

5. Verify routing/modal behavior remains consistent on /life and /arena
   - File checks:
     - `src/pages/LifeHub.tsx` uses `DailyMilestones hub="core"`
     - `src/pages/ArenaHub.tsx` uses `DailyMilestones hub="arena"`
   - Confirm modal opens from both route-specific CTA and sidebar recalibrate actions.

Validation plan (end-to-end)
1. On `/life`, click “צור תוכנית 100 יום” with incomplete assessments.
   - Expected: no runtime error container, no red non-2xx toast.
   - Expected: assessment modal opens for first missing pillar.
2. Complete one missing pillar assessment (especially consciousness first).
   - Expected: save succeeds, modal closes cleanly, no crash.
3. Trigger generation again.
   - Expected: opens next missing pillar until all required metrics are completed.
4. After all required fields are filled, trigger generation again.
   - Expected: strategy generation succeeds and plan UI appears.
5. Repeat smoke test on `/arena` and recalibrate buttons in both sidebars.

Technical notes
- This is not primarily a parsing bug anymore; it is an HTTP semantics/UX contract mismatch:
  - Missing user input is an expected state -> should be 2xx with structured domain error payload.
  - True failures (unexpected exceptions) should remain 5xx.
- Keeping both backend and frontend hardening ensures resilience even if one side regresses.
- No database migration required.

Risks and mitigations
- Risk: changing 400->200 could affect other callers expecting thrown errors.
  - Mitigation: keep response payload unchanged with explicit `error: 'MISSING_ASSESSMENT_DATA'`; frontend already supports this.
- Risk: subsystem IDs mismatch for consciousness meta.
  - Mitigation: align with existing consciousness assessment schema before wiring.

Result after implementation
- Clicking generate will no longer surface runtime/non‑2xx failure UI for missing assessments.
- Users will be routed into the required assessment flow as requested.
- Consciousness-first missing flows won’t crash during chat completion.
