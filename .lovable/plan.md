

# Adaptive Feedback Loop Engine -- The Missing 30%

## Overview

Add four interconnected systems that transform MindOS from a "smart once, then static" platform into a continuously adaptive behavioral operating system. These systems create the Collect-Diagnose-Generate-**Track-Adjust-Reinforce-Escalate** loop that's currently missing.

## What Gets Built

### 1. Daily Check-In Micro-Pulse (30-second daily feedback)

A lightweight daily check-in that captures 5 real-time variables every day:

- **Energy rating** (1-5 scale)
- **Sleep compliance** (Did you hit your target sleep time? Yes/Partial/No)
- **Task completion confidence** (How today went, 1-5)
- **Screen discipline** (Stayed within target? Yes/No)
- **Mood signal** (5 emoji options: wired, drained, neutral, focused, flow)

This appears as a bottom-sheet modal triggered by the `NextActionBanner` priority system (inserted between habits and hypnosis priority) or proactively by Aurora at the user's evening recovery window time.

**Storage**: New `daily_pulse_logs` table with one row per user per day. No JSON blobs -- flat columns for fast aggregation.

**Database table:**
```
daily_pulse_logs
- id (uuid, PK)
- user_id (uuid, FK profiles)
- log_date (date, unique per user)
- energy_rating (smallint, 1-5)
- sleep_compliance (text: 'yes'|'partial'|'no')
- task_confidence (smallint, 1-5)
- screen_discipline (boolean)
- mood_signal (text: 'wired'|'drained'|'neutral'|'focused'|'flow')
- created_at (timestamptz)
```

### 2. Weekly Recalibration Algorithm

Every 7 days, a new edge function (`aurora-recalibrate`) runs automatically (triggered by `pg_cron` or the proactive engine's `batch_analyze`). It:

**Computes 3 derived scores from the week's pulse data:**

- **Compliance Score** = weighted average of (sleep compliance + screen discipline + task confidence) over 7 days
- **Cognitive Load Score** = function of (energy variance + mood instability + work hours from intake)
- **Recovery Debt Score** = function of (sleep compliance misses + low energy days + high screen days)

**Then adjusts the active 90-day plan:**

- If compliance < 40%: reduce current week's task count, extend deadlines, add recovery blocks
- If compliance 40-70%: maintain current aggressiveness
- If compliance > 70%: optionally increase intensity (only if user's restructure_willingness >= 7)
- If Recovery Debt > threshold: inject extra recovery tasks, reduce cognitive load tasks

**How it works technically:**
- Reads last 7 days from `daily_pulse_logs`
- Reads current `life_plan_milestones` for the active week
- Computes delta between baseline (from intake) and actual performance
- Updates `life_plan_milestones.tasks` array for upcoming weeks (not past weeks)
- Logs the recalibration event to a new `recalibration_logs` table for audit trail
- Feeds results into Aurora's context builder so the AI coach knows what changed

**Database table:**
```
recalibration_logs
- id (uuid, PK)
- user_id (uuid, FK profiles)
- week_number (smallint)
- compliance_score (numeric)
- cognitive_load_score (numeric)
- recovery_debt_score (numeric)
- adjustments_made (jsonb -- what changed)
- created_at (timestamptz)
```

### 3. Behavioral Risk Prediction Model

Embedded within the recalibration engine, a rule-based prediction system that flags relapse risks:

| Intake Pattern | Live Signal | Risk | Action |
|---|---|---|---|
| start_and_quit + high urgency | Compliance dropping week-over-week | Overtraining | Reduce plan intensity, insert rest day |
| burn_out_quickly + identity_upgrade | 3+ days energy <= 2 | Overcommitment | Pause secondary tasks, push hypnosis |
| avoid_hard_tasks + low commitment | 0 tasks completed 3 days running | Avoidance spiral | Aurora proactive nudge: micro-task |
| intense_but_inconsistent + any | High variance in daily scores | Boom-bust cycle | Stabilize with fixed anchor tasks |
| consistent_but_plateaued + any | All scores flat for 2+ weeks | Stagnation | Inject challenge upgrade, new milestone |

These predictions are stored in the recalibration log and surfaced to Aurora's context builder as `behavioral_risk_alerts`. The AI coach then references them naturally in conversation ("I noticed your energy has been dropping this week...").

### 4. Adaptive Hypnosis Reinforcement Loop

Currently hypnosis uses static week-based themes. This upgrade makes it session-aware:

**Before each session, the `generate-hypnosis-script` edge function checks:**
- Yesterday's pulse data (energy, mood, sleep)
- Current week's compliance score
- Active behavioral risk alerts

**Then dynamically selects:**
- **After a failure day** (low energy + missed tasks): Recovery/self-compassion script
- **After a win streak** (3+ good days): Momentum amplification script
- **After high screen time**: Digital detox reinforcement
- **After sleep miss**: Sleep architecture reset theme
- **Default**: Continue with the weekly theme from the 90-day plan

This is implemented by enriching the context passed to `generate-hypnosis-script` with pulse data, not by changing the script generation logic itself. The AI model already adapts based on context.

## Integration Points

### Context Builder Enhancement

Add to `AuroraContext` in `_shared/contextBuilder.ts`:

```typescript
// New fields
pulse_today: { energy: number; mood: string; sleep: string } | null;
pulse_week: { avg_energy: number; compliance: number; recovery_debt: number } | null;
behavioral_risks: { risk: string; severity: string }[];
last_recalibration: { date: string; adjustments: string } | null;
```

Two new parallel queries added to the existing `Promise.all` block -- no performance regression.

### Proactive Engine Enhancement

Add new trigger types to `aurora-proactive/index.ts`:
- `daily_pulse_reminder`: Triggered at recovery window time if no pulse logged today
- `recalibration_report`: Triggered weekly after recalibration runs
- `risk_alert`: Triggered when behavioral risk prediction fires

### Dashboard Integration

- Daily Pulse card appears in the "Today" section of the dashboard
- Weekly recalibration summary shows as a collapsible card in the Plan page
- Risk alerts surface through the existing `NextActionBanner` priority system (inserted at priority level 3, after consciousness journey and proactive coaching)

## Files Modified

| File | Change |
|---|---|
| `supabase/functions/_shared/contextBuilder.ts` | Add pulse + risk data to AuroraContext |
| `supabase/functions/aurora-proactive/index.ts` | Add pulse_reminder and risk_alert triggers |
| `supabase/functions/aurora-recalibrate/index.ts` | **NEW** -- weekly recalibration engine |
| `supabase/functions/generate-hypnosis-script/index.ts` | Enrich context with pulse data |
| `src/components/dashboard/DailyPulseCard.tsx` | **NEW** -- 30-second check-in UI |
| `src/hooks/useDailyPulse.ts` | **NEW** -- pulse CRUD hook |
| `src/components/dashboard/RecalibrationSummary.tsx` | **NEW** -- weekly adjustment display |

## Database Changes

Two new tables (`daily_pulse_logs`, `recalibration_logs`) with RLS policies restricting access to the owning user. One row per user per day for pulse, one row per user per week for recalibration.

## Execution Order

1. Create database tables with RLS
2. Build `useDailyPulse` hook and `DailyPulseCard` UI component
3. Integrate pulse card into dashboard priority system
4. Enhance context builder with pulse data
5. Build `aurora-recalibrate` edge function with risk prediction
6. Wire recalibration into proactive engine
7. Enrich hypnosis script generation with pulse context
8. Add `RecalibrationSummary` to Plan page

