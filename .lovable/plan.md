

# Make ExecutionModal Live & Interactive + Improve Mission Completeness

## Part 1: Live Interactive Execution (ExecutionModal Upgrade)

### Current Problems
- Users can freely click ANY step checkbox in any order -- no enforcement
- No per-step countdown timer (each step has `durationSec` but it's only displayed as text)
- Users can close the modal or "Complete" before actually finishing
- The `sets_reps_timer` template has a basic rest timer but no work timer
- `step_by_step` template is just a plain checklist with no time enforcement

### Changes to `ExecutionModal.tsx`

**A. Sequential Round Enforcement (sets_reps_timer)**
- Lock all rounds except the current one -- greyed out, not clickable
- Each round has 3 phases: **Ready -> Working (countdown) -> Rest (countdown) -> Next**
- "Start Round" button begins a countdown timer using the step's `durationSec`
- When work countdown hits 0: haptic buzz, auto-transition to rest period (30-60s configurable)
- When rest countdown hits 0: haptic buzz, auto-advance to next round
- Cannot mark a round complete without the timer finishing
- Cannot close modal while a round timer is active (only Skip with confirmation)

**B. Step Timer for step_by_step**
- Steps with `durationSec` show a mini countdown timer when tapped
- Step auto-checks when its timer completes
- Steps without `durationSec` remain manual checkboxes
- Still sequential -- can't skip ahead

**C. Close Prevention**
- While any timer is running: block Escape key, block outside click, hide X button
- "Skip" button shows a confirmation: "Are you sure? This will lose your progress"
- "Complete" button only enabled when ALL rounds/steps are done (already implemented but will be stricter)

**D. Visual Upgrades for Active Round**
- Active round: pulsing border, large countdown display at top
- Completed rounds: green checkmark, collapsed
- Upcoming rounds: dimmed, locked icon
- Rest period: full-screen overlay with breathing animation and countdown

### New State Machine
```text
IDLE -> ROUND_ACTIVE (countdown running) -> REST (countdown) -> ROUND_ACTIVE -> ... -> ALL_DONE
```

## Part 2: Comprehensive Mission Content (Strategy Prompts)

### Current Problem
The vitality missions mention sun exposure but miss critical daily protocols like:
- **Grounding/Earthing** (30 min barefoot on earth/grass daily)
- **Cold exposure** (cold showers, ice baths)
- **Circadian rhythm** protocols (morning light + evening light blocking)
- **Lymphatic activation** (dry brushing, rebounding)
- **Hydration rituals** (structured water timing)

### Changes to `generate-90day-strategy/index.ts`

Add a `COMPREHENSIVE DAILY HEALTH PROTOCOLS` section to the Layer 1 (Goals) and Layer 3 (Daily Actions) prompts:

```text
## COMPREHENSIVE VITALITY PROTOCOLS (must include in Vitality pillar):
- GROUNDING: 20-30 min barefoot on earth/grass/sand daily (combine with sun exposure when possible)
- SUN EXPOSURE: 10-30 min morning sunlight within first hour of waking (no sunglasses)
- COLD EXPOSURE: Cold shower finish (30s-3min) or ice bath protocol
- BREATHING: Daily breathwork protocol (box breathing, Wim Hof, or power breathing)
- HYDRATION: Structured water intake (500ml upon waking, then every 90 min)
- LYMPHATIC: Dry brushing before shower or rebounding 5 min
- CIRCADIAN: Blue light blocking 2h before sleep, morning bright light
- MOVEMENT: Micro-movement every 60 min (not just training sessions)

For ALL pillars, generate COMPREHENSIVE protocols that cover the FULL spectrum of what science recommends for that domain. Do NOT generate surface-level tasks. Each mission should be a complete daily protocol.
```

### Changes to `generate-phase-actions/index.ts`

Same comprehensive protocol list injected so daily actions include grounding, cold exposure, etc. alongside sun exposure.

## Files Modified

| File | Change |
|------|--------|
| `src/components/dashboard/ExecutionModal.tsx` | Add round state machine with work/rest countdowns, sequential locking, close prevention, visual upgrades for active/rest/done states |
| `supabase/functions/generate-90day-strategy/index.ts` | Add comprehensive vitality protocol list to Layer 1 and Layer 3 prompts |
| `supabase/functions/generate-phase-actions/index.ts` | Add same comprehensive protocol list to daily action generation |

## Impact
- ExecutionModal becomes a true guided workout/protocol timer -- users are walked through each round with countdowns, rest periods, and haptic feedback
- Missions will include grounding, cold exposure, lymphatic activation, and other critical daily protocols instead of surface-level tasks
- User must regenerate their plan after deployment to get updated missions

