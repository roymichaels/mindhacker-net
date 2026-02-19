

# Enhance Neural Intake for Better Plan Results

## Problem Analysis

The current intake collects wake/sleep times and active work hours, but is missing **critical scheduling anchors** that the AI needs to build a realistic 8-8-8 daily structure. Specifically:

- No question about **when work/obligations start** (the single most important time anchor)
- No question about **when work ends** (needed to place training, personal dev, wind-down)
- No **desired wake time** vs current (to know what to calibrate toward)
- No **relationship status** (affects evening time architecture heavily)
- No **stress coping mechanism** (what they default to under pressure -- key for replacing bad habits)
- No **previous system attempts** (helps calibrate plan aggressiveness and avoid repeating what failed)
- No **ideal day vision** (gives the AI a north star for structuring)

## Proposed New Questions

All additions go into existing steps in `onboardingFlowSpec.ts` -- no new steps needed, just new mini-steps inserted at logical places.

### 1. Work/Obligation Start Time (Step 9 - Work Reality)
**"באיזו שעה אתה חייב להתחיל לעבוד / להיות זמין?"**
Options: 06:00 / 07:00 / 08:00 / 09:00 / 10:00 / 11:00+ / Flexible / Not working

This is the **#1 missing variable** -- it determines the morning routine window and therefore the ideal wake time, bedtime, and entire daily arc.

### 2. Work/Obligation End Time (Step 9 - Work Reality)
**"באיזו שעה אתה בדרך כלל מסיים לעבוד?"**
Options: 14:00 / 16:00 / 17:00 / 18:00 / 19:00 / 20:00+ / Varies / Not working

This determines the evening block: training, family, personal development, wind-down.

### 3. Desired Wake Time (Step 5 - Sleep Architecture)
**"באיזו שעה היית רוצה לקום אם היית יכול לבחור?"**
Same options as current wake_time.

The gap between current vs desired wake time tells the AI how much sleep restructuring is needed.

### 4. Relationship Status (Step 10 - Life Load)
**"מה מצב הזוגיות שלך?"**
Options: Single / In a relationship / Married / Divorced-Separated / Complicated

This affects evening time allocation, emotional load, and accountability structure.

### 5. Stress Default Behavior (Step 12 - Friction Trigger, as second mini-step)
**"כשאתה בלחץ, מה הדבר הראשון שאתה עושה?"**
Options: Eat / Scroll phone / Smoke / Sleep / Isolate / Argue / Work more / Exercise

Critical for knowing which **replacement habits** to prescribe in the plan.

### 6. Previous Attempts (Step 11 - Execution Pattern, as second mini-step)
**"כמה פעמים ניסית לשנות הרגלים ב-12 חודשים האחרונים?"**
Options: Never tried / 1-2 times / 3-5 times / 6+ times / Lost count

Helps calibrate plan aggressiveness and identify "system hopper" patterns.

### 7. Morning Routine Desire (Step 5 - Sleep Architecture, new mini-step)
**"כמה זמן בוקר אישי אתה רוצה לפני שמתחיל יום העבודה?"**
Options: None needed / 15-30 min / 30-60 min / 60-90 min / 90+ min

Directly determines the wake time recommendation relative to work start.

## Changes Summary

### File: `src/flows/onboardingFlowSpec.ts`
- Add `work_start_time` and `work_end_time` mini-steps to Step 9 (Work Reality)
- Add `desired_wake_time` and `morning_routine_desire` mini-steps to Step 5 (Sleep Architecture)
- Add `relationship_status` mini-step to Step 10 (Life Load)
- Add `stress_default_behavior` mini-step to Step 12 (Friction Trigger)
- Add `previous_change_attempts` mini-step to Step 11 (Execution Pattern)

### File: `supabase/functions/_shared/launchpad-ai-prompt.ts`
- Update the INPUT DATA STRUCTURE section to list the 7 new variables
- Add explicit instruction: "Use work_start_time and work_end_time as the primary anchors for the 8-8-8 structure"
- Add instruction: "Compare desired_wake_time vs current wake_time to determine sleep restructuring priority"
- Add instruction: "Use morning_routine_desire to calculate recommended wake time = work_start_time - commute - morning_routine_desire"

### File: `src/components/dashboard/RecalibrateModal.tsx`
- The recalibrate modal dynamically reads from the flow spec, so the new questions will appear automatically as long as they use the same dbPath pattern

### No DB migration needed
All new variables store into existing JSON columns (`step_1_intention` / `step_2_profile_data`) via `jsonPath`.

