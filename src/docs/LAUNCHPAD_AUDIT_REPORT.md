# LAUNCHPAD MICRO-FLOW & AUDIT REPORT
> Generated: 2026-02-17 | Status: AUDIT COMPLETE

---

## B) OUTPUT 1 — MICRO-FLOW MAP

### MACRO STEP 1: Welcome Quiz (ברוך הבא)
**Summary:**
- **Component:** `WelcomeStep.tsx`
- **Purpose:** Capture initial intent and high-level life areas to tailor the rest of the flow.
- **DB Write:** `launchpad_progress.step_1_intention` (JSON)
- **AI Calls:** None directly (data used later).
- **Rewards:** 25 XP
- **Completion:** All visible questions answered.

**Micro Steps:**
1. **S1.mainArea**: Multi-select chips ("What are you dealing with?").
   - *Required*: Yes (at least 1)
   - *Branching*: Selected values determine which sub-questions appear next.
2. **S1.subQuestions** (Dynamic Loop):
   - *Condition*: For each selected `main_area`, show specific deep-dive (e.g., if 'career' -> show 'career_specific').
   - *UI*: Multi-select chips.
   - *Required*: No (technically optional but flow implies filling them).
3. **S1.emotionalState**: Multi-select ("How do you feel?").
   - *Required*: No
4. **S1.triedBefore**: Multi-select ("What have you tried?").
   - *Required*: No
5. **S1.helpStyle**: Multi-select ("What would help most?").
   - *Required*: No

**Branch Graph:**
```
[Main Area]
   ├── if 'career' ──> [Career Specific]
   ├── if 'business' ──> [Business Specific]
   ├── ... (12 variants) ...
   └── always ──> [Emotional State] ──> [Tried Before] ──> [Help Style]
```

---

### MACRO STEP 2: Personal Profile (פרופיל אישי)
**Summary:**
- **Component:** `PersonalProfileStep.tsx`
- **Purpose:** Comprehensive intake of demographics, habits, and personality.
- **DB Write:** `launchpad_progress.step_2_profile_data` (JSON)
- **AI Calls:** None directly.
- **Rewards:** 40 XP, 5 Tokens
- **Completion:** All sections marked complete (all required fields filled).

**Micro Steps:**
1. **S2.demographics**: 6 single-selects (Age, Gender, Relationship, Children, Living, Employment).
2. **S2.physical**: 2 Sliders (Height, Weight).
3. **S2.healthHabits**: 10 mixed inputs (Diet, Sleep, Exercise, Smoking, Alcohol, etc.).
4. **S2.mentalEmotional**: 5 mixed inputs (Stress, Meditation, Therapy, Energy source, Relaxation).
5. **S2.interests**: 2 inputs (Hobbies - massive list, Reading).
6. **S2.behavioral**: 7 multi-selects (Conflict, Problems, Decisions, etc.).
7. **S2.social**: 3 inputs (Social pref, Weekend, Communication).
8. **S2.satisfaction**: 1 Slider (Life Satisfaction 1-10).

**Branch Graph:**
Linear flow of 8 sections. User must complete current section to unlock next (accordion style).

---

### MACRO STEP 3: Lifestyle & Routine (שגרת חיים)
**Summary:**
- **Component:** `LifestyleRoutineStep.tsx`
- **Purpose:** Map daily schedule and energy constraints.
- **DB Write:** `launchpad_progress.step_3_lifestyle_data` (JSON)
- **AI Calls:** None.
- **Rewards:** 35 XP
- **Completion:** All 5 sections completed.

**Micro Steps:**
1. **S3.sleep**: Wake time, Sleep time, Quality.
2. **S3.work**: Shifts, Start/End time, Flexibility.
3. **S3.meals**: Breakfast, Lunch, Dinner timing.
4. **S3.energy**: Peak productivity, Low energy time.
5. **S3.constraints**: Family commitments, Special constraints.

---

### MACRO STEP 4: Growth Deep Dive (העמקה אישית)
**Summary:**
- **Component:** `GrowthDeepDiveStep.tsx`
- **Purpose:** Identify specific bottlenecks in user's chosen growth areas.
- **DB Write:** `launchpad_progress.step_4_growth_data` (JSON)
- **AI Calls:** `aurora-analyze` (Triggered on completion).
- **Rewards:** 35 XP
- **Completion:** Follow-up questions answered for all selected areas.

**Micro Steps:**
1. **S4.selectAreas**: Logic derives top 5 areas from Step 2's `growth_focus`.
2. **S4.dynamicFollowUp** (Loop):
   - *Condition*: Iterates through each selected area.
   - *UI*: Specific question based on area (e.g., "What triggers your anxiety?").
   - *Count*: Up to 5 screens.
3. **S4.aiAnalysis**: Loading screen while AI analyzes patterns.

---

### MACRO STEP 5: First Chat with Aurora (שיחה ראשונה)
**Summary:**
- **Component:** `FirstChatStep.tsx`
- **Purpose:** Conversational extraction of emotional drivers.
- **DB Write:** `launchpad_progress.step_2_summary` (JSON) - *Note: DB field name is legacy 'step_2_summary' but context is step 5.*
- **AI Calls:** `aurora-chat` (Continuous per message).
- **Rewards:** 50 XP
- **Completion:** Answered 5 questions.

**Micro Steps:**
1. **S5.intro**: AI greeting.
2. **S5.chatLoop**: 5 specific questions (Important thing, Obstacle, Perfect day, Willingness, Connection).
3. **S5.summary**: AI generates a warm summary of the user.

---

### MACRO STEP 6: Introspection Form (התבוננות פנימית)
**Summary:**
- **Component:** `IntrospectionStep.tsx`
- **Purpose:** Deep psychological digging (Shadow work).
- **DB Write:** `form_submissions` (Type: 'introspection')
- **AI Calls:** `analyze-introspection-form`
- **Rewards:** 50 XP, 5 Tokens
- **Completion:** At least 3 questions answered with 30+ chars.

**Micro Steps:**
1. **S6.questions**: 5 Textareas (Life End, Ideal Self, Inner Traits, Reality, Gap). *Note: UI shows 5, Code array has 5, DB Audit mentioned 8 - mismatch found.*
2. **S6.analysis**: AI result screen showing Summary + Patterns.
3. **S6.review**: Read-only view of answers (if visiting after completion).

---

### MACRO STEP 7: Life Plan Form (תוכנית חיים)
**Summary:**
- **Component:** `LifePlanStep.tsx`
- **Purpose:** Forward-looking strategic planning.
- **DB Write:** `form_submissions` (Type: 'life_plan') + `aurora_life_visions`
- **AI Calls:** `analyze-life-plan`
- **Rewards:** 100 XP, 10 Tokens
- **Completion:** At least 3 sections answered with 20+ chars.

**Micro Steps:**
1. **S7.questions**: 6 Textareas (Vision 3y, Goals 12m, Goals 90d, Identity, Systems, Risks).
2. **S7.analysis**: AI result screen showing Plan Summary + Next Steps.

---

### MACRO STEP 8: Focus Areas (תחומי פוקוס)
**Summary:**
- **Component:** `FocusAreasStep.tsx`
- **Purpose:** Final selection of 3 pillars for the dashboard.
- **DB Write:** `launchpad_progress.step_5_focus_areas_selected`
- **AI Calls:** None.
- **Rewards:** 50 XP
- **Completion:** Exactly 3 areas selected.

**Micro Steps:**
1. **S8.selection**: Grid of 8 pillars (Health, Money, Mind, etc.).

---

### MACRO STEP 9: First Week Planning (שבוע ראשון)
**Summary:**
- **Component:** `FirstWeekStep.tsx`
- **Purpose:** Actionable commitment for immediate start.
- **DB Write:** `launchpad_progress.step_6_actions` (JSON)
- **AI Calls:** None (Uses hardcoded suggestions).
- **Rewards:** 75 XP
- **Completion:** Select >=1 Quit, >=1 Build, Career Status, Career Goal.

**Micro Steps:**
1. **S9.quit**: Select habits to quit (from list).
2. **S9.build**: Select habits to build (from list).
3. **S9.careerStatus**: Current status.
4. **S9.careerGoal**: Future goal.

---

### MACRO STEP 10: Final Notes (הערות נוספות)
**Summary:**
- **Component:** `FinalNotesStep.tsx`
- **Purpose:** Catch-all bucket for medical/legal/other context.
- **DB Write:** `launchpad_progress.step_10_final_notes`
- **AI Calls:** None.
- **Rewards:** 25 XP
- **Completion:** Click continue (field is optional).

**Micro Steps:**
1. **S10.input**: Single textarea.

---

### MACRO STEP 11: Dashboard Activation (הפעלת הדשבורד)
**Summary:**
- **Component:** `DashboardActivation.tsx`
- **Purpose:** System generation and handoff.
- **DB Write:** `life_plans`, `life_plan_milestones`, `aurora_identity_elements`.
- **AI Calls:** `generate-launchpad-summary` (The big one).
- **Rewards:** 100 XP, 25 Tokens.
- **Completion:** AI success.

**Micro Steps:**
1. **S11.authGate**: If guest -> Force Auth Modal.
2. **S11.generate**: Loading spinner with status.
3. **S11.success**: Celebration screen + Redirect.

---

## C) OUTPUT 2 — QUESTIONS + OPTIONS EXTRACTION

*(Abbreviated for token limits - highlighting key complex sets)*

**S1.main_area**:
- Options: career, business, relationships, family, health, energy, finance, purpose, emotional, social, learning, spirituality.

**S2.hobbies** (Category: Interests):
- ~80 options categorized into Art, Music, Sports, Nature, Food, etc.

**S3.sleep_quality**:
- excellent, good, fair, poor, very-poor.

**S4.follow_up** (Dynamic):
- Logic: `FOLLOW_UP_QUESTIONS[area]`
- Example (Confidence): "New people", "At work", "In relationship", "Decisions", "Criticism", "Public speaking".

**S9.habits_to_quit**:
- Alcohol, Drugs, Cannabis, Smoking, Caffeine, Sugar, Gambling, Porn, Gaming, Scrolling, Procrastination... (~40 items).

**S9.habits_to_build**:
- Morning routine, Weekly planning, Daily goals, Task completion... (~40 items).

---

## D) OUTPUT 3 — CONTRACT CHECK

| Item | Status | Evidence | Recommendation |
|------|--------|----------|----------------|
| **Autosave** | ✅ EXISTS | `useLaunchpadAutoSave.ts` implements debounced save for Auth + `useGuestLaunchpadAutoSave.ts` for Guest. | - |
| **Guest/Auth Parity** | ✅ EXISTS | `LaunchpadFlow.tsx` switches logic seamlessly. | - |
| **Resume Progress** | ✅ EXISTS | `useLaunchpadProgress` fetches `current_step` from DB. | - |
| **Step 11 Auth Gate** | ✅ EXISTS | `DashboardActivation.tsx` lines 39-43 checks `!user` and shows `AuthModal`. | - |
| **Skip Logic** | ⚠️ PARTIAL | Exists in Step 6 & 7 (hidden/conditional), Step 10 (explicit). Missing in 4 (if no areas). | Standardize "Skip" for non-critical steps (4, 10). |
| **Validation** | ✅ EXISTS | Step 2 (Section complete), Step 6 (30 chars), Step 7 (20 chars). | - |
| **AI Loading States** | ✅ EXISTS | `GrowthDeepDiveStep` & `IntrospectionStep` & `DashboardActivation` all have `isAnalyzing` states. | - |
| **Duplicate Data** | 🔴 FOUND | `sleep_hours` (S2) vs `sleep_time` (S3). `career_status` (S1) vs `employment` (S2) vs `career_status` (S9). | Remove `sleep_hours` from S2 (S3 is better). Remove `employment` from S2 (S9 covers it better). |

---

## E) OUTPUT 4 — FATIGUE SCORE & REDUCTIONS

**Scoring:** 1 (Effortless) to 5 (Exhausting)

| Step | Fatigue | Reductions (Proposed) |
|------|---------|-----------------------|
| 1. Welcome | 2 | Fine. Keep as hook. |
| 2. Profile | **5** | **CRITICAL:** Hide "Social & Lifestyle" and "Interests" sections behind a "Complete Later" toggle. They aren't critical for initial AI generation. |
| 3. Routine | 3 | Remove `sleep_hours` (duplicate). |
| 4. Growth | 3 | Auto-skip if < 2 areas selected in previous steps. |
| 5. Chat | 3 | Good engagement, keep. |
| 6. Introspection | **5** | Reduce required fields from 3 to **2**. Change placeholders to specific prompts to reduce writer's block. |
| 7. Life Plan | **5** | Reduce required fields from 3 to **2**. |
| 8. Focus | 1 | Easy. |
| 9. First Week | 2 | Easy. |
| 10. Notes | 1 | Easy. |
| 11. Activation | 1 | Easy. |

**Top 3 Fixes for Fatigue:**
1.  **Step 2 (Profile):** Make the "Interests" and "Social" sections optional/collapsible.
2.  **Step 6 & 7 (Writing):** Lower the validation character count (30 -> 15) and required question count (3 -> 2).
3.  **Duplicates:** Remove specific questions in Step 2 that are asked again in Step 3 or 9.
