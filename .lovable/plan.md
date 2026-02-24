

# Fix: Enforce "Treatment Not Diagnosis" Policy Across All Plan Engines

## The Problem

The 100-day plan is generating **diagnostic/testing missions** instead of **treatment/action missions**:
- "Perform daily posture stability checks" (Image pillar) -- should be **mewing exercises, face yoga routines, jawline sculpting**
- "Identify 3 cases where self-worth is tied to external achievement" (Consciousness) -- should be a **concrete protocol or ritual**, not self-analysis

The assessments already happened. The plan IS the cure. Every mission must be a **treatment protocol**, not another test.

Additionally, `generate-phase-actions` (which creates daily actions on-demand) has **zero integration** with the user's brain -- no diet, no willingness, no biological profile, no context.

---

## Changes

### 1. `generate-90day-strategy/index.ts` -- Add "Treatment Not Diagnosis" Rules to All 3 Layers

**Layer 1 (Goals)** -- Add these rules:
- "The assessment already happened. You have the results above. The plan is the TREATMENT/CURE, never another diagnostic or test."
- "NEVER generate goals like 'identify', 'assess', 'check', 'evaluate', 'test', 'measure', 'track'. Instead generate PROTOCOLS: 'Practice mewing 10min daily', 'Execute face yoga sculpting routine', 'Perform shadow work release ritual'."
- "For Image pillar: mewing, face yoga, jawline exercises, posture correction drills (wall angels, chin tucks), skincare protocols -- NOT posture tests."
- "For Consciousness: identity anchoring rituals, mask-release protocols, frequency calibration sessions -- NOT introspection exercises."

**Layer 2 (Milestones)** -- Same enforcement:
- "Milestones must be progressive TREATMENT stages, not diagnostic checkpoints."
- "NEVER use words: 'identify', 'recognize', 'notice', 'become aware', 'check if', 'test whether'."
- "USE instead: 'execute', 'perform', 'practice', 'complete', 'drill', 'run protocol'."

**Layer 3 (Mini-milestones / Daily Actions)** -- Same enforcement:
- "Every daily action is a PHYSICAL PROTOCOL the user executes."
- "Convert any abstract concept into a concrete body-based ritual."
- No "journal about feelings" -- instead "Open app, rate 6 subsystems 1-10, tap submit."

### 2. `generate-phase-actions/index.ts` -- Full Brain Integration

Currently this function generates daily actions with ZERO user context. Fix:

- Import and use `buildContext` from `_shared/contextBuilder.ts` to get biological profile, willingness, diet, etc.
- Add a constraints block (same pattern as `generate-execution-steps`)
- Add user profile context (name, projects, values, energy)
- Add the "No Introspection / Treatment Only" rules to the prompt
- Add `execution_template` and `action_type` fields to generated minis (currently missing -- these are needed by the ExecutionModal)

The prompt will include:
```
## CRITICAL USER CONSTRAINTS (NEVER VIOLATE):
- DIET: ALKALINE + VEGAN -- NO dairy, eggs, meat, fish...
- USER REFUSES: [willingness.not_willing items]
- SLEEP: 22:00-03:00

## TREATMENT-ONLY RULES:
- The assessment already happened. These are TREATMENT actions.
- NEVER: "identify", "check", "test", "evaluate", "journal about"
- ALWAYS: "perform", "execute", "practice", "drill", "complete"
```

---

## Files Modified

| File | Change |
|------|--------|
| `supabase/functions/generate-90day-strategy/index.ts` | Add "Treatment Not Diagnosis" rules to `buildLayer1Prompt`, `buildLayer2Prompt`, `buildLayer3Prompt`. Enforce action verbs, ban diagnostic verbs. |
| `supabase/functions/generate-phase-actions/index.ts` | Integrate with `contextBuilder` for biological profile + willingness + constraints. Add Treatment-Only rules. Add `execution_template` and `action_type` to generated minis. |

---

## Impact

After this fix:
- Image pillar will generate missions like "Mewing protocol 10 min" and "Face yoga jawline sculpting" instead of "posture stability checks"
- Consciousness pillar will generate "Identity anchoring ritual" and "Mask release protocol" instead of "identify 3 cases of self-worth"
- All daily actions from `generate-phase-actions` will respect diet (no feta cheese for vegans), willingness, and biological constraints
- Every generated action will have an `execution_template` so the ExecutionModal knows how to render it

**Note**: Existing missions in the database will NOT change. After deploying, the user should regenerate their plan (force regenerate) to get the corrected missions.
