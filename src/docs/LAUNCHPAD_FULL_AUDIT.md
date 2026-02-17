# LAUNCHPAD FULL EXTRACTION AUDIT
> Generated: 2026-02-17 | Status: COMPLETE

See the full audit below. If the file tree doesn't show this, use the Search tab and search for "LAUNCHPAD".

---

## 1. SYSTEM ARCHITECTURE

### Files Involved
| File | Role |
|------|------|
| `src/pages/Launchpad.tsx` | Page wrapper |
| `src/pages/LaunchpadComplete.tsx` | Completion page |
| `src/pages/FreeJourneyComplete.tsx` | Guest completion page |
| `src/components/launchpad/LaunchpadFlow.tsx` | Main orchestrator (383 lines) |
| `src/components/launchpad/steps/WelcomeStep.tsx` | Step 1 (632 lines) |
| `src/components/launchpad/steps/PersonalProfileStep.tsx` | Step 2 (1255 lines) |
| `src/components/launchpad/steps/LifestyleRoutineStep.tsx` | Step 3 (541 lines) |
| `src/components/launchpad/steps/GrowthDeepDiveStep.tsx` | Step 4 (434 lines) |
| `src/components/launchpad/steps/FirstChatStep.tsx` | Step 5 (280 lines) |
| `src/components/launchpad/steps/IntrospectionStep.tsx` | Step 6 (749 lines) |
| `src/components/launchpad/steps/LifePlanStep.tsx` | Step 7 (775 lines) |
| `src/components/launchpad/steps/FocusAreasStep.tsx` | Step 8 (175 lines) |
| `src/components/launchpad/steps/FirstWeekStep.tsx` | Step 9 (603 lines) |
| `src/components/launchpad/steps/FinalNotesStep.tsx` | Step 10 (167 lines) |
| `src/components/launchpad/steps/DashboardActivation.tsx` | Step 11 (244 lines) |
| `src/hooks/useLaunchpadProgress.ts` | Progress tracking (559 lines) |
| `src/hooks/useLaunchpadAutoSave.ts` | Auto-save (auth) |
| `src/hooks/useGuestLaunchpadProgress.ts` | Guest progress (localStorage) |
| `src/hooks/useGuestLaunchpadAutoSave.ts` | Guest auto-save |
| `src/hooks/useGuestDataMigration.ts` | Guest→Auth migration |
| `supabase/functions/generate-launchpad-summary/` | AI summary generation |
| `supabase/functions/analyze-introspection-form/` | Step 6 AI analysis |
| `supabase/functions/analyze-life-plan/` | Step 7 AI analysis |
| `supabase/functions/aurora-analyze/` | Step 4 AI analysis |
| `supabase/functions/aurora-chat/` | Step 5 chat AI |
| `supabase/functions/_shared/launchpad-ai-prompt.ts` | Final AI prompt |

### Database Tables
| Table | Role |
|-------|------|
| `launchpad_progress` | Primary step tracking (35+ columns) |
| `form_submissions` | Steps 6 & 7 responses |
| `form_analyses` | AI analysis results for steps 6 & 7 |
| `life_plans` | Generated 90-day plan |
| `life_plan_milestones` | 12 weekly milestones |
| `aurora_identity_elements` | Identity archetype |
| `aurora_life_direction` | Life direction summary |
| `aurora_onboarding_progress` | Onboarding completion flag |
| `aurora_life_visions` | 3-year vision (from step 7) |

### Phases
| Phase | Name (HE) | Name (EN) | Steps |
|-------|-----------|-----------|-------|
| 1 | מי אתה עכשיו? | Who Are You Now? | 1, 2, 3 |
| 2 | מה לא עובד? | What's Not Working? | 4, 5, 6, 7 |
| 3 | מי אתה רוצה להיות? | Who Do You Want to Be? | 8, 9, 10, 11 |

### XP/Token Rewards Per Step
| Step | XP | Tokens | Unlock |
|------|-----|--------|--------|
| 1 | 25 | 0 | personal_profile |
| 2 | 40 | 5 | lifestyle_routine |
| 3 | 35 | 0 | growth_deep_dive |
| 4 | 35 | 0 | aurora_chat_basic |
| 5 | 50 | 0 | introspection_questionnaire |
| 6 | 50 | 5 | introspection_complete |
| 7 | 100 | 10 | life_plan_complete |
| 8 | 50 | 0 | focus_areas_selection |
| 9 | 75 | 0 | first_week_planning |
| 10 | 25 | 0 | final_notes |
| 11 | 100 | 25 | life_os_complete |
| **TOTAL** | **585** | **45** | — |

---

## 2. FULL QUESTIONNAIRE

---

### STEP 1: Welcome Quiz (ברוך הבא)
**Component:** `WelcomeStep.tsx` (632 lines)
**Phase:** 1 — Who Are You Now?
**Input Type:** Multi-select chips with conditional branching
**Cognitive Load:** 🟡 MEDIUM
**DB Field:** `step_1_intention` (JSON stringified)

#### Q1.1: Life Areas (main_area)
> **HE:** במה אתה מתעסק כרגע בחיים?
> **EN:** What are you currently dealing with in life?
**Type:** Multi-select (12 options)

| Value | HE | EN | Icon |
|-------|-----|-----|------|
| career | קריירה/עבודה | Career/Work | 💼 |
| business | עסק/יזמות | Business/Entrepreneurship | 🚀 |
| relationships | זוגיות/מערכות יחסים | Relationships | ❤️ |
| family | משפחה/ילדים | Family/Children | 👨‍👩‍👧 |
| health | בריאות/כושר | Health/Fitness | 💪 |
| energy | אנרגיה/שינה | Energy/Sleep | 🔋 |
| finance | כסף/פיננסים | Money/Finances | 💰 |
| purpose | מטרה/כיוון בחיים | Purpose/Direction | 🎯 |
| emotional | רגשות/בריאות נפשית | Emotions/Mental Health | 🧠 |
| social | חברים/קהילה | Friends/Community | 👥 |
| learning | לימודים/התפתחות | Learning/Growth | 📚 |
| spirituality | רוחניות/משמעות | Spirituality/Meaning | ✨ |

#### Q1.2–Q1.13: Conditional Sub-Questions
Each triggers ONLY if parent area selected in Q1.1.

**Q1.2: Career** (`career_specific`)
| Value | HE | EN |
|-------|-----|-----|
| advance | רוצה להתקדם בתפקיד | Want to advance |
| change | רוצה לשנות מקצוע | Want to change profession |
| stuck | מרגיש תקוע ומשועמם | Feeling stuck |
| searching | מחפש עבודה | Job searching |
| independent | רוצה להפוך לעצמאי | Want independence |
| balance | רוצה איזון עבודה-חיים | Work-life balance |

**Q1.3: Business** (`business_specific`)
| Value | HE | EN |
|-------|-----|-----|
| start | רוצה להקים עסק | Want to start |
| grow | רוצה להגדיל | Want to grow |
| struggle | העסק מתקשה | Struggling |
| marketing | צריך עזרה בשיווק | Need marketing help |
| team | ניהול צוות | Team management |
| pivot | רוצה לשנות כיוון | Want to pivot |

**Q1.4: Relationships** (`relationships_specific`)
| Value | HE | EN |
|-------|-----|-----|
| find_partner | רוצה למצוא בן/בת זוג | Find partner |
| current_relationship | בעיות בזוגיות | Relationship issues |
| healing | ריפוי מפרידה | Healing from breakup |
| communication | שיפור תקשורת | Improve communication |
| intimacy | קרבה ואינטימיות | Intimacy |
| commitment | פחד מהתחייבות | Fear of commitment |

**Q1.5: Family** (`family_specific`)
| Value | HE | EN |
|-------|-----|-----|
| parenting | אתגרי הורות | Parenting challenges |
| teenagers | התמודדות עם מתבגרים | Dealing with teens |
| parents | יחסים עם הורים | Parents relationship |
| siblings | יחסים עם אחים | Siblings |
| balance | איזון משפחה-עבודה | Family-work balance |
| conflict | קונפליקטים משפחתיים | Family conflicts |

**Q1.6: Health** (`health_specific`)
| Value | HE | EN |
|-------|-----|-----|
| weight | לרדת במשקל | Lose weight |
| exercise | להתחיל להתאמן | Start exercising |
| nutrition | לשפר תזונה | Improve nutrition |
| pain | כאבים כרוניים | Chronic pain |
| condition | מצב רפואי מתמשך | Ongoing condition |
| habits | הרגלים לא בריאים | Unhealthy habits |

**Q1.7: Energy** (`energy_specific`)
| Value | HE | EN |
|-------|-----|-----|
| tired | עייפות כרונית | Chronic fatigue |
| sleep_quality | איכות שינה ירודה | Poor sleep |
| insomnia | קשיי הירדמות | Insomnia |
| morning | קושי להתעורר | Hard to wake up |
| focus | חוסר ריכוז | Lack of focus |
| burnout | שחיקה | Burnout |

**Q1.8: Finance** (`finance_specific`)
| Value | HE | EN |
|-------|-----|-----|
| save | לחסוך יותר | Save more |
| debt | חובות | Debts |
| earn_more | להרוויח יותר | Earn more |
| budget | לנהל תקציב | Budget |
| invest | להשקיע | Invest |
| anxiety | חרדות כלכליות | Financial anxiety |

**Q1.9: Purpose** (`purpose_specific`)
| Value | HE | EN |
|-------|-----|-----|
| dont_know | לא יודע מה אני רוצה | Don't know what I want |
| lost | מרגיש אבוד | Feeling lost |
| passion | למצוא תשוקה | Find passion |
| meaning | מחפש משמעות | Seeking meaning |
| big_change | שינוי גדול | Big change |
| legacy | להשאיר חותם | Leave legacy |

**Q1.10: Emotional** (`emotional_specific`)
| Value | HE | EN |
|-------|-----|-----|
| anxiety | חרדה | Anxiety |
| depression | דיכאון | Depression |
| confidence | ביטחון עצמי | Self-confidence |
| regulation | ויסות רגשי | Emotional regulation |
| anger | ניהול כעסים | Anger management |
| trauma | טראומה מהעבר | Past trauma |

**Q1.11: Social** (`social_specific`)
| Value | HE | EN |
|-------|-----|-----|
| lonely | בדידות | Loneliness |
| friends | יותר חברים | More friends |
| social_anxiety | חרדה חברתית | Social anxiety |
| boundaries | הצבת גבולות | Setting boundaries |
| networking | נטוורקינג | Networking |
| community | רוצה קהילה | Want community |

**Q1.12: Learning** (`learning_specific`)
| Value | HE | EN |
|-------|-----|-----|
| new_skill | מיומנות חדשה | New skill |
| degree | תואר/הסמכה | Degree |
| focus | קושי להתמקד | Difficulty focusing |
| motivation | חוסר מוטיבציה | Lack of motivation |
| time | אין לי זמן | No time |
| direction | לא יודע מה ללמוד | Don't know what to learn |

**Q1.13: Spirituality** (`spirituality_specific`)
| Value | HE | EN |
|-------|-----|-----|
| connection | חיבור רוחני | Spiritual connection |
| meditation | להתחיל למדיטציה | Start meditating |
| faith | שאלות על אמונה | Questions about faith |
| purpose | מחפש תכלית | Seeking purpose |
| peace | שקט פנימי | Inner peace |
| growth | צמיחה אישית | Personal growth |

#### Q1.14: Emotional State (`emotional_state`)
> **HE:** איך אתה מרגיש לגבי המצב?
**Type:** Multi-select (6)

| Value | HE | EN | Icon |
|-------|-----|-----|------|
| frustrated | מתוסכל | Frustrated | 😤 |
| hopeful | מלא תקווה | Hopeful | 🌟 |
| confused | מבולבל | Confused | 😵‍💫 |
| motivated | מוטיבציה | Motivated | 🚀 |
| anxious | חרד | Anxious | 😰 |
| determined | נחוש | Determined | 💪 |

#### Q1.15: What Have You Tried (`tried_before`)
> **HE:** מה כבר ניסית?
**Type:** Multi-select (6)

| Value | HE | EN | Icon |
|-------|-----|-----|------|
| reading | ספרים/מאמרים | Books/articles | 📚 |
| courses | קורסים | Courses | 🎓 |
| coaching | אימון/ייעוץ | Coaching | 👨‍💼 |
| therapy | טיפול | Therapy | 🛋️ |
| apps | אפליקציות | Apps | 📱 |
| nothing | לא הרבה | Not much | 🆕 |

#### Q1.16: Help Style (`help_style`)
> **HE:** מה יעזור לך הכי הרבה?
**Type:** Multi-select (6)

| Value | HE | EN | Icon |
|-------|-----|-----|------|
| practical | פתרונות מעשיים | Practical solutions | 🔧 |
| listening | הקשבה | Being heard | 👂 |
| plan | תוכנית ברורה | Clear plan | 📋 |
| push | דחיפה לפעולה | Push to action | 🚀 |
| understanding | הבנה עצמית | Self-understanding | 🔮 |
| accountability | אחריותיות | Accountability | ✅ |

**STEP 1 TOTAL: 4 fixed + up to 12 conditional = 4–16 questions, ~90 answer options**

---

### STEP 2: Personal Profile (פרופיל אישי)
**Component:** `PersonalProfileStep.tsx` (1255 lines)
**Phase:** 1
**Cognitive Load:** 🔴 HIGH (37 categories across 8 sections)
**DB Field:** `step_2_profile_data` (JSON)

#### Section: Demographics (6 questions)
| ID | Title HE | Type | Options |
|----|----------|------|---------|
| age_group | קבוצת גיל | Single | 18-24, 25-34, 35-44, 45-54, 55+ |
| gender | מין | Single | גבר, אישה, אחר |
| relationship_status | מצב משפחתי | Single | רווק, בזוגיות, נשוי, גרוש, מסובך |
| children | ילדים | Single | אין, 1, 2, 3+, מצפה |
| living_situation | מגורים | Single | לבד, עם בן זוג, +ילד, משפחה, שותפים, הורים |
| employment_status | תעסוקה | Single | שכיר, בעל עסק, עצמאי, יזם, מנהל, סטודנט, צבאי, לא עובד, עקרת בית, פנסיונר |

#### Section: Physical (2 sliders)
| ID | Title | Range |
|----|-------|-------|
| height_cm | גובה | 140–210 cm |
| weight_kg | משקל | 40–180 kg |

#### Section: Health & Habits (10 questions)
| ID | Title HE | Type | # Options |
|----|----------|------|-----------|
| diet | סוג תזונה | Single | 13 |
| sleep_hours | שעות שינה | Single | 5 |
| exercise_frequency | תדירות אימונים | Single | 5 |
| exercise_types | סוגי אימונים | Multi | 17 |
| smoking | עישון | Multi | 5 |
| alcohol | אלכוהול | Single | 5 |
| caffeine | קפאין | Single | 4 |
| hydration | שתייה יומית | Multi | 7 |
| supplements | תוספי תזונה | Multi | 7 |

#### Section: Mental & Emotional (5 questions)
| ID | Title HE | Type | # Options |
|----|----------|------|-----------|
| stress_level | רמת סטרס | Single | 5 |
| meditation_practice | מדיטציה | Single | 5 |
| therapy_experience | ניסיון בטיפול | Single | 4 |
| energy_source | מה נותן לך אנרגיה? | Multi | 10 |
| relaxation_methods | מה מרגיע אותך? | Multi | 11 |

#### Section: Interests & Hobbies (2 questions)
| ID | Title HE | Type | # Options |
|----|----------|------|-----------|
| hobbies | תחביבים | Multi | ~80 across 9 categories |
| reading_habits | קריאת ספרים | Single | 6 |

#### Section: Behavioral (7 questions)
| ID | Title HE | Type | # Options |
|----|----------|------|-----------|
| conflict_handling | כשיש לך דעה שונה... | Multi | 5 |
| problem_approach | כשנתקל בבעיה... | Multi | 5 |
| decision_style | החלטה גדולה... | Multi | 5 |
| opportunity_response | הזדמנות חדשה... | Multi | 5 |
| failure_response | אחרי כישלון... | Multi | 5 |
| time_management | הרבה משימות... | Multi | 5 |
| relationship_style | ביחסים קרובים... | Multi | 5 |

#### Section: Social & Lifestyle (3 questions)
| ID | Title HE | Type | # Options |
|----|----------|------|-----------|
| social_preference | העדפה חברתית | Single | 5 |
| weekend_activities | פעילות סופ"ש | Multi | 10 |
| communication_style | סגנון תקשורת | Single | 5 |

#### Section: Life Satisfaction (1 question)
| ID | Title HE | Type |
|----|----------|------|
| life_satisfaction | שביעות רצון מהחיים | Scale 1-10 |

**STEP 2 TOTAL: ~37 questions, ~250+ answer options**

---

### STEP 3: Lifestyle & Routine (שגרת חיים)
**Component:** `LifestyleRoutineStep.tsx` (541 lines)
**Phase:** 1
**Cognitive Load:** 🟡 MEDIUM
**DB Field:** `step_3_routine_data` (JSON)

| ID | Title HE | Type | # Options |
|----|----------|------|-----------|
| wake_time | שעת קימה | Single | 6 (Before 5, 5-6, 6-7, 7-8, 8-9, After 9) |
| sleep_time | שעת שינה | Single | 6 (Before 21, 21-22, 22-23, 23-00, 00-01, After 01) |
| morning_routine | שגרת בוקר | Multi | 10 |
| evening_routine | שגרת ערב | Multi | 10 |
| work_schedule | לוח עבודה | Single | 5 |
| breaks_during_day | הפסקות | Single | 5 |
| meals_per_day | ארוחות ביום | Single | 5 |
| screen_time | זמן מסך | Single | 5 |
| nature_time | זמן בטבע | Single | 5 |
| social_time | זמן חברתי | Single | 5 |
| creative_time | זמן יצירתי | Single | 5 |
| exercise_time | זמן פעילות גופנית | Single | 5 |
| learning_time | זמן למידה | Single | 5 |
| spiritual_practice | תרגול רוחני | Multi | 8 |
| biggest_time_waster | מה גוזל הכי הרבה זמן? | Multi | 8 |
| ideal_day | תאר יום אידיאלי | Textarea | Free text |

**STEP 3 TOTAL: ~16 questions, ~100 options + 1 free text**

---

### STEP 4: Growth Deep Dive (צלילה לעומק)
**Component:** `GrowthDeepDiveStep.tsx` (434 lines)
**Phase:** 2 — What's Not Working?
**Cognitive Load:** 🟡 MEDIUM
**DB Field:** `step_4_growth_data` (JSON)
**AI Trigger:** `aurora-analyze` edge function

| ID | Title HE | Type | # Options |
|----|----------|------|-----------|
| growth_areas | תחומי צמיחה | Multi | 8 |
| self_awareness | מודעות עצמית | Scale 1-10 | — |
| change_readiness | מוכנות לשינוי | Scale 1-10 | — |
| obstacles | מה מעכב אותך? | Multi | 10 |
| strengths | חוזקות | Multi | 12 |
| values | ערכים | Multi | 15 |
| biggest_fear | הפחד הגדול ביותר | Multi | 8 |
| biggest_dream | החלום הגדול ביותר | Textarea | Free text |

**STEP 4 TOTAL: ~8 questions, ~53 options + 2 scales + 1 free text**
**AI Call:** Sends all answers to `aurora-analyze` for pattern detection

---

### STEP 5: First Chat with Aurora (שיחה ראשונה)
**Component:** `FirstChatStep.tsx` (280 lines)
**Phase:** 2
**Cognitive Load:** 🟡 MEDIUM
**DB Field:** `step_5_chat_data` (JSON)
**AI Trigger:** `aurora-chat` edge function (continuous)

This is a **live conversational step**. Aurora asks 3-5 follow-up questions based on previous answers. The user types free-form responses.

- ~3-5 AI-generated questions
- User types responses
- Entire conversation stored

**STEP 5 TOTAL: ~3-5 dynamic questions, all free text**

---

### STEP 6: Introspection Form (טופס אינטרוספקציה)
**Component:** `IntrospectionStep.tsx` (749 lines)
**Phase:** 2
**Cognitive Load:** 🔴 HIGH
**DB Table:** `form_submissions` (type = 'introspection')
**AI Trigger:** `analyze-introspection-form` edge function

| ID | Title HE | Type | Validation |
|----|----------|------|------------|
| what_drains_you | מה שואב ממך אנרגיה? | Textarea | min 30 chars |
| what_energizes_you | מה נותן לך אנרגיה? | Textarea | min 30 chars |
| recurring_pattern | דפוס חוזר שמפריע לך | Textarea | min 30 chars |
| what_you_avoid | מה אתה נמנע ממנו? | Textarea | min 30 chars |
| inner_critic | מה הקול הביקורתי אומר? | Textarea | min 30 chars |
| unmet_need | צורך שלא מקבל מענה | Textarea | min 30 chars |
| turning_point | נקודת מפנה שעברת | Textarea | min 30 chars |
| if_no_fear | מה היית עושה בלי פחד? | Textarea | min 30 chars |

**STEP 6 TOTAL: 8 questions, all deep reflective text (min 30 chars each)**
**AI Call:** Full form → `analyze-introspection-form` → stored in `form_analyses`

---

### STEP 7: Life Plan Form (תוכנית חיים)
**Component:** `LifePlanStep.tsx` (775 lines)
**Phase:** 2
**Cognitive Load:** 🔴 HIGH
**DB Table:** `form_submissions` (type = 'life_plan')
**AI Trigger:** `analyze-life-plan` edge function

| ID | Title HE | Type | Validation |
|----|----------|------|------------|
| three_year_vision | חזון ל-3 שנים | Textarea | min 30 chars |
| one_year_goals | יעדים לשנה | Textarea | min 30 chars |
| ninety_day_focus | מיקוד ל-90 יום | Textarea | min 30 chars |
| biggest_obstacle | המכשול הגדול ביותר | Textarea | min 30 chars |
| support_needed | תמיכה שאתה צריך | Textarea | min 30 chars |
| daily_commitment | מחויבות יומית | Textarea | min 30 chars |
| success_metric | איך תדע שהצלחת? | Textarea | min 30 chars |
| non_negotiables | דברים שלא מוותר עליהם | Textarea | min 30 chars |

**STEP 7 TOTAL: 8 questions, all deep planning text (min 30 chars each)**
**AI Call:** Full form → `analyze-life-plan` → stored in `form_analyses`

---

### STEP 8: Focus Areas (תחומי מיקוד)
**Component:** `FocusAreasStep.tsx` (175 lines)
**Phase:** 3 — Who Do You Want to Be?
**Cognitive Load:** 🟢 LOW
**DB Field:** `step_8_focus_areas` (JSON)

User selects 1-3 priority areas from their Step 1 selections. Simple re-prioritization.

**STEP 8 TOTAL: 1 question, select from previous answers**

---

### STEP 9: First Week Planning (שבוע ראשון)
**Component:** `FirstWeekStep.tsx` (603 lines)
**Phase:** 3
**Cognitive Load:** 🟡 MEDIUM
**DB Field:** `step_9_first_week` (JSON)

Presents pre-generated habit suggestions based on focus areas. User selects which habits to adopt.

| Section | Content |
|---------|---------|
| Morning habits | 5-8 suggested habits (checkboxes) |
| Daily habits | 5-8 suggested habits (checkboxes) |
| Evening habits | 5-8 suggested habits (checkboxes) |
| Custom habit | Free text input |
| Wake time commitment | Time picker |
| Sleep time commitment | Time picker |

**STEP 9 TOTAL: ~3-4 multi-select sections + 1 text + 2 time pickers**

---

### STEP 10: Final Notes (הערות אחרונות)
**Component:** `FinalNotesStep.tsx` (167 lines)
**Phase:** 3
**Cognitive Load:** 🟢 LOW
**DB Field:** `step_10_final_notes` (JSON)

| ID | Title HE | Type |
|----|----------|------|
| anything_else | משהו נוסף שחשוב לך? | Textarea (optional) |
| communication_preference | איך תרצה שאורורה תתקשר איתך? | Single select |

**STEP 10 TOTAL: 2 questions (1 optional)**

---

### STEP 11: Dashboard Activation (הפעלת דשבורד)
**Component:** `DashboardActivation.tsx` (244 lines)
**Phase:** 3
**Cognitive Load:** 🟢 LOW
**DB Updates:** Multiple tables
**AI Trigger:** `generate-launchpad-summary` (MAIN AI CALL)

No user input. This step:
1. Triggers the main AI summary generation
2. Creates the 90-day life plan with 12 weekly milestones
3. Generates identity archetype
4. Creates aurora checklists from selected habits
5. Sets `aurora_onboarding_progress.onboarding_complete = true`
6. Awards final XP + tokens
7. Shows confetti animation
8. Redirects to dashboard

---

## 3. EMOTIONAL LOAD ANALYSIS

| Step | Name | Cognitive Load | Est. Time | # Inputs | Text-Heavy |
|------|------|---------------|-----------|----------|------------|
| 1 | Welcome Quiz | 🟡 MEDIUM | 5-8 min | 4-16 | 0 |
| 2 | Personal Profile | 🔴 HIGH | 15-25 min | ~37 | 0 |
| 3 | Lifestyle Routine | 🟡 MEDIUM | 8-12 min | ~16 | 1 |
| 4 | Growth Deep Dive | 🟡 MEDIUM | 5-8 min | ~8 | 1 |
| 5 | First Chat | 🟡 MEDIUM | 5-10 min | ~3-5 | 3-5 |
| 6 | Introspection | 🔴 HIGH | 10-20 min | 8 | 8 |
| 7 | Life Plan | 🔴 HIGH | 10-20 min | 8 | 8 |
| 8 | Focus Areas | 🟢 LOW | 1-2 min | 1 | 0 |
| 9 | First Week | 🟡 MEDIUM | 5-8 min | ~6 | 1 |
| 10 | Final Notes | 🟢 LOW | 1-2 min | 2 | 1 |
| 11 | Activation | 🟢 LOW | 1-2 min | 0 | 0 |
| **TOTAL** | — | — | **67-117 min** | **~93-107** | **~23-24** |

### High Friction Points
1. **Step 2** (37 questions) — longest single step
2. **Steps 5→6→7** — consecutive HIGH load block, all requiring deep writing
3. **Steps 6 & 7** — each requires 8 × 30+ character reflective responses

---

## 4. DATA FLOW MAP

```
User Answers (Steps 1-10)
    ↓
launchpad_progress table (35+ columns, JSON per step)
    ↓
form_submissions table (Steps 6 & 7 text responses)
    ↓
AI Edge Functions:
  ├── aurora-analyze (Step 4) → behavioral patterns
  ├── aurora-chat (Step 5) → conversation memory
  ├── analyze-introspection-form (Step 6) → form_analyses
  ├── analyze-life-plan (Step 7) → form_analyses
  └── generate-launchpad-summary (Step 11) → MAIN OUTPUT
        ↓
    Creates:
    ├── life_plans (90-day plan)
    ├── life_plan_milestones (12 weekly milestones)
    ├── aurora_identity_elements (archetype)
    ├── aurora_life_direction (direction summary)
    ├── aurora_checklists + aurora_checklist_items (habits)
    ├── aurora_onboarding_progress (completion flag)
    └── xp_events + token awards
        ↓
    Unlocks:
    ├── Dashboard access
    ├── Aurora AI chat (full mode)
    ├── Life Plan view
    ├── Habit tracker
    └── Weekly milestone system
```

---

## 5. REDUNDANCY CHECK

### Duplicate Data Points
| Data Point | Collected In | Notes |
|-----------|-------------|-------|
| Sleep hours | Step 2 (sleep_hours) + Step 3 (sleep_time) + Step 9 (sleep commitment) | Triple collected |
| Exercise | Step 2 (exercise_frequency, exercise_types) + Step 3 (exercise_time) | Double collected |
| Career status | Step 1 (career_specific) + Step 2 (employment_status) | Double collected |
| Stress/energy | Step 2 (stress_level, energy_source) + Step 4 (self_awareness) | Overlapping |
| Values | Step 4 (values) + Step 7 (non_negotiables) | Conceptual overlap |

### Stored But Never Used in UI
| Field | Table | Status |
|-------|-------|--------|
| height_cm | launchpad_progress (step_2) | Stored, never displayed |
| weight_kg | launchpad_progress (step_2) | Stored, never displayed |
| hobbies | launchpad_progress (step_2) | Stored, sent to AI only |
| reading_habits | launchpad_progress (step_2) | Stored, minimal use |
| smoking | launchpad_progress (step_2) | Stored, never displayed |
| caffeine | launchpad_progress (step_2) | Stored, never displayed |

### Merge Candidates
| Merge | Steps | Rationale |
|-------|-------|-----------|
| Demographics + Lifestyle | 2 + 3 | Both are factual, low-emotion data |
| Steps 6 + 7 | 6 + 7 | Both are 8-question reflective forms |
| Steps 8 + 10 | 8 + 10 | Both are very short (1-2 questions) |

---

## 6. OUTPUT SUMMARY

| Metric | Value |
|--------|-------|
| Total steps | 11 |
| Total questions (min) | ~85 |
| Total questions (max) | ~107 |
| Total predefined answer options | ~575 |
| Total free text inputs | ~23-24 |
| Total AI calls triggered | 5 |
| Total DB tables written | 9+ |
| Total XP awarded | 585 |
| Total tokens awarded | 45 |
| Estimated completion time | 67-117 minutes |
| HIGH cognitive load steps | 3 (Steps 2, 6, 7) |
| Consecutive high-load block | Steps 5-6-7 |
| Duplicate data points | 5 identified |
| Unused stored fields | 6 identified |

### Final Assessment: IS THIS TOO HEAVY?

**YES — Exceptionally Heavy.**

This is closer to a clinical intake assessment than a product onboarding. The 67-117 minute estimated time, combined with 3 consecutive high-cognitive-load steps requiring deep reflective writing, creates significant abandonment risk. The system collects comprehensive data but several fields are stored without being surfaced in the UI.
