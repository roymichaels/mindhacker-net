# LAUNCHPAD FLOWSPEC AUDIT — Full Extraction

> Generated: 2026-02-17 | Source: Complete code review of all 11 step components

---

## A) LaunchpadMap — Macro Steps 1..11

### Orchestration

- **Router**: `src/pages/Launchpad.tsx` → renders `<LaunchpadFlow />`
- **Flow Controller**: `src/components/launchpad/LaunchpadFlow.tsx`
- **Progress Hook (Auth)**: `src/hooks/useLaunchpadProgress.ts` — RPC `complete_launchpad_step`
- **Progress Hook (Guest)**: `src/hooks/useGuestLaunchpadProgress.ts` — localStorage
- **AutoSave (Auth)**: `src/hooks/useLaunchpadAutoSave.ts`
- **AutoSave (Guest)**: `src/hooks/useGuestLaunchpadAutoSave.ts`
- **DB Table**: `launchpad_progress`

### Phases

| Phase | Key | Title HE | Title EN | Steps |
|-------|-----|----------|----------|-------|
| 1 | who_you_are | מי אתה עכשיו? | Who Are You Now? | 1, 2, 3 |
| 2 | whats_not_working | מה לא עובד? | What's Not Working? | 4, 5, 6, 7 |
| 3 | who_you_want_to_be | מי אתה רוצה להיות? | Who Do You Want to Be? | 8, 9, 10, 11 |

### Rewards per Step

| Step | XP | Tokens | Unlock |
|------|----|--------|--------|
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

---

## B) MiniStep Extraction — Per Macro Step

---

### STEP 1: Welcome Quiz (`WelcomeStep.tsx`)
**Component**: `src/components/launchpad/steps/WelcomeStep.tsx` (632 lines)
**InputType**: One-question-per-screen internally (already micro-flow!)
**Storage**: `{ table: "launchpad_progress", column: "step_1_intention", jsonPath: "JSON.stringify(quizAnswers)" }`

#### MiniSteps (Questions):

| # | id | title_he | title_en | inputType | options_count | multiSelect | branching |
|---|---|----|----|----|----|----|-----|
| 1.1 | main_area | במה אתה מתעסק כרגע בחיים? | What are you currently dealing with in life? | multi_select | 12 | ✅ | None |
| 1.2 | career_specific | מה בדיוק בקריירה? | What specifically about your career? | multi_select | 6 | ✅ | showIf: main_area includes 'career' |
| 1.3 | business_specific | מה בדיוק בעסק/יזמות? | What specifically about business? | multi_select | 6 | ✅ | showIf: main_area includes 'business' |
| 1.4 | relationships_specific | מה בדיוק במערכות יחסים? | What specifically about relationships? | multi_select | 6 | ✅ | showIf: main_area includes 'relationships' |
| 1.5 | family_specific | מה בדיוק במשפחה? | What specifically about family? | multi_select | 6 | ✅ | showIf: main_area includes 'family' |
| 1.6 | health_specific | מה בדיוק בבריאות? | What specifically about health? | multi_select | 6 | ✅ | showIf: main_area includes 'health' |
| 1.7 | energy_specific | מה בדיוק באנרגיה/שינה? | What specifically about energy/sleep? | multi_select | 6 | ✅ | showIf: main_area includes 'energy' |
| 1.8 | finance_specific | מה בדיוק בכסף/פיננסים? | What specifically about money? | multi_select | 6 | ✅ | showIf: main_area includes 'finance' |
| 1.9 | purpose_specific | מה בדיוק במטרה/כיוון? | What specifically about purpose? | multi_select | 6 | ✅ | showIf: main_area includes 'purpose' |
| 1.10 | emotional_specific | מה בדיוק ברגשות/מנטלי? | What specifically about emotions? | multi_select | 6 | ✅ | showIf: main_area includes 'emotional' |
| 1.11 | social_specific | מה בדיוק בחברתי? | What specifically about social life? | multi_select | 6 | ✅ | showIf: main_area includes 'social' |
| 1.12 | learning_specific | מה בדיוק בלימודים/התפתחות? | What specifically about learning? | multi_select | 6 | ✅ | showIf: main_area includes 'learning' |
| 1.13 | spirituality_specific | מה בדיוק ברוחניות/משמעות? | What specifically about spirituality? | multi_select | 6 | ✅ | showIf: main_area includes 'spirituality' |
| 1.14 | emotional_state | איך אתה מרגיש לגבי המצב? | How do you feel about the situation? | multi_select | 6 | ✅ | None (always shown) |
| 1.15 | tried_before | מה כבר ניסית? | What have you already tried? | multi_select | 6 | ✅ | None (always shown) |
| 1.16 | help_style | מה יעזור לך הכי הרבה? | What would help you the most? | multi_select | 6 | ✅ | None (always shown) |

**Total possible screens**: 4 fixed + up to 12 conditional = 4–16 screens
**Validation**: At least main_area must be selected. No min count enforced per sub-question.
**Branching**: Sub-questions 1.2–1.13 appear ONLY if user selected the corresponding main_area value.

---

### STEP 2: Personal Profile (`PersonalProfileStep.tsx`)
**Component**: `src/components/launchpad/steps/PersonalProfileStep.tsx` (1255 lines)
**Storage**: `{ table: "launchpad_progress", column: "step_2_profile_data", jsonPath: "{...profileData}" }`

#### MiniSteps — 7 Sections, 34 categories:

**Section: Demographics (6 questions)**

| # | id | title_he | title_en | inputType | options | multiSelect |
|---|---|---|---|---|---|---|
| 2.1 | age_group | קבוצת גיל | Age Group | single_select | 5 | ❌ |
| 2.2 | gender | מין | Gender | single_select | 3 | ❌ |
| 2.3 | relationship_status | מצב משפחתי | Relationship Status | single_select | 5 | ❌ |
| 2.4 | children | ילדים | Children | single_select | 5 | ❌ |
| 2.5 | living_situation | מגורים | Living Situation | single_select | 6 | ❌ |
| 2.6 | employment_status | תעסוקה | Employment | single_select | 10 | ❌ |

**Section: Health & Habits (9 questions)**

| # | id | title_he | title_en | inputType | options | multiSelect |
|---|---|---|---|---|---|---|
| 2.7 | diet | סוג תזונה | Diet Type | single_select | 13 | ❌ |
| 2.8 | sleep_hours | שעות שינה | Sleep Hours | single_select | 5 | ❌ |
| 2.9 | exercise_frequency | תדירות אימונים | Exercise Frequency | single_select | 5 | ❌ |
| 2.10 | exercise_types | סוגי אימונים | Exercise Types | multi_select | 17 | ✅ |
| 2.11 | smoking | עישון | Smoking | multi_select | 5 | ✅ |
| 2.12 | alcohol | אלכוהול | Alcohol | single_select | 5 | ❌ |
| 2.13 | caffeine | קפאין | Caffeine | single_select | 4 | ❌ |
| 2.14 | hydration | שתייה יומית | Daily Hydration | multi_select | 7 | ✅ |
| 2.15 | supplements | תוספי תזונה | Supplements | multi_select | 7 | ✅ |

**Section: Mental & Emotional (5 questions)**

| # | id | title_he | title_en | inputType | options | multiSelect |
|---|---|---|---|---|---|---|
| 2.16 | stress_level | רמת סטרס | Stress Level | single_select | 5 | ❌ |
| 2.17 | meditation_practice | מדיטציה | Meditation | single_select | 5 | ❌ |
| 2.18 | therapy_experience | ניסיון בטיפול | Therapy Experience | single_select | 4 | ❌ |
| 2.19 | energy_source | מה נותן לך אנרגיה? | What gives you energy? | multi_select | 10 | ✅ |
| 2.20 | relaxation_methods | מה מרגיע אותך? | What relaxes you? | multi_select | 11 | ✅ |

**Section: Interests & Hobbies (2 questions)**

| # | id | title_he | title_en | inputType | options | multiSelect |
|---|---|---|---|---|---|---|
| 2.21 | hobbies | תחביבים | Hobbies | multi_select | ~80 | ✅ |
| 2.22 | reading_habits | קריאת ספרים | Book Reading | single_select | 6 | ❌ |

**Section: Behavioral Patterns (7 questions)**

| # | id | title_he | title_en | inputType | options | multiSelect |
|---|---|---|---|---|---|---|
| 2.23 | conflict_handling | כשיש לך דעה שונה מאחרים... | When you have a different opinion... | multi_select | 5 | ✅ |
| 2.24 | problem_approach | כשאתה נתקל בבעיה בלתי צפויה... | When you encounter an unexpected problem... | multi_select | 5 | ✅ |
| 2.25 | decision_style | כשיש לך החלטה גדולה לקבל... | When you have a big decision... | multi_select | 5 | ✅ |
| 2.26 | opportunity_response | כשמציעים לך הזדמנות חדשה... | When offered an unexpected opportunity... | multi_select | 5 | ✅ |
| 2.27 | failure_response | אחרי כישלון או אכזבה... | After a failure or disappointment... | multi_select | 5 | ✅ |
| 2.28 | time_management | כשיש לך הרבה משימות... | When you have many tasks... | multi_select | 5 | ✅ |
| 2.29 | relationship_style | ביחסים עם אנשים קרובים... | In relationships with close people... | multi_select | 5 | ✅ |

**Section: Social & Lifestyle (3 questions)**

| # | id | title_he | title_en | inputType | options | multiSelect |
|---|---|---|---|---|---|---|
| 2.30 | social_preference | העדפה חברתית | Social Preference | single_select | 3 | ❌ |
| 2.31 | morning_evening | בוקר או ערב | Morning or Evening | single_select | 3 | ❌ |
| 2.32 | learning_style | סגנון למידה | Learning Style | single_select | 4 | ❌ |

**Section: Values & Goals (4 questions)**

| # | id | title_he | title_en | inputType | options | multiSelect |
|---|---|---|---|---|---|---|
| 2.33 | life_priorities | עדיפויות בחיים | Life Priorities | multi_select | 20 | ✅ |
| 2.34 | spiritual_practice | פרקטיקה רוחנית | Spiritual Practice | single_select | 5 | ❌ |
| 2.35 | growth_focus | במה אתה רוצה לצמוח? | Where do you want to grow? | multi_select | ~55 | ✅ |
| 2.36 | obstacles | מה הכי עוצר אותך? | What stops you most? | multi_select | 12 | ✅ |

**ALSO includes 2 sliders** (not in CATEGORIES):

| # | id | title_he | title_en | inputType | range |
|---|---|---|---|---|---|
| 2.S1 | height_cm | גובה (ס"מ) | Height (cm) | slider | 140–220 |
| 2.S2 | weight_kg | משקל (ק"ג) | Weight (kg) | slider | 30–200 |

**Validation**: ≥10 categories must be filled. No per-category requirements.
**Total mini-steps**: 36 questions + 2 sliders = **38 screens** in micro-flow mode.

---

### STEP 3: Lifestyle & Routine (`LifestyleRoutineStep.tsx`)
**Component**: `src/components/launchpad/steps/LifestyleRoutineStep.tsx` (541 lines)
**Storage**: `{ table: "launchpad_progress", column: "step_2_profile_data", jsonPath: "via autoSave step 3" }`

#### MiniSteps — 5 Sections, 14 categories:

**Section: Sleep (3 questions)**

| # | id | title_he | title_en | inputType | options |
|---|---|---|---|---|---|
| 3.1 | wake_time | באיזו שעה אתה קם? | What time do you wake up? | time_picker | range 3:00–12:00 |
| 3.2 | sleep_time | באיזו שעה אתה הולך לישון? | What time do you go to sleep? | time_picker | range 18:00–3:00 |
| 3.3 | sleep_quality | איך איכות השינה שלך? | How is your sleep quality? | single_select | 5 |

**Section: Work (4 questions)**

| # | id | title_he | title_en | inputType | options |
|---|---|---|---|---|---|
| 3.4 | shift_work | האם אתה עובד במשמרות? | Do you work shifts? | single_select | 6 |
| 3.5 | work_start_time | מתי אתה מתחיל לעבוד? | When do you start work? | time_picker | 0–23 |
| 3.6 | work_end_time | מתי אתה מסיים לעבוד? | When do you finish work? | time_picker | 0–23 |
| 3.7 | work_flexibility | כמה גמישות יש לך בעבודה? | How flexible is your work? | single_select | 6 |

**Section: Meals (3 questions)**

| # | id | title_he | title_en | inputType | options |
|---|---|---|---|---|---|
| 3.8 | breakfast_time | מתי אתה אוכל בוקר? | When do you eat breakfast? | single_select | 6 |
| 3.9 | lunch_time | מתי אתה אוכל צהריים? | When do you eat lunch? | single_select | 5 |
| 3.10 | dinner_time | מתי אתה אוכל ערב? | When do you eat dinner? | single_select | 6 |

**Section: Energy (2 questions)**

| # | id | title_he | title_en | inputType | options |
|---|---|---|---|---|---|
| 3.11 | peak_productivity | מתי אתה הכי פרודוקטיבי? | When are you most productive? | single_select | 7 |
| 3.12 | low_energy_time | מתי אתה הכי עייף? | When do you feel most tired? | single_select | 6 |

**Section: Constraints (2 questions)**

| # | id | title_he | title_en | inputType | options | multiSelect |
|---|---|---|---|---|---|---|
| 3.13 | family_commitments | מחויבויות משפחתיות | Family Commitments | multi_select | 7 | ✅ |
| 3.14 | special_constraints | הגבלות מיוחדות | Special Constraints | multi_select | 9 | ✅ |

**Total mini-steps**: **14 screens**

---

### STEP 4: Growth Deep Dive (`GrowthDeepDiveStep.tsx`)
**Component**: `src/components/launchpad/steps/GrowthDeepDiveStep.tsx` (434 lines)
**Storage**: `{ table: "launchpad_progress", column: "step_2_profile_data", jsonPath: "deep_dive.answers" }`
**Dependency**: Uses `growth_focus` from Step 2 (PersonalProfile)

#### MiniSteps: Dynamic — 1 question per selected growth area (max 5)

Each area gets a follow-up question with 6 multi-select options.
**Known specific follow-ups**: confidence, find-partner, improve-relationship, anxiety, weight-loss, discipline, career-purpose, increase-income, parents-relationship
**Default fallback**: "What's most important for you to achieve in this area?" (6 options)

| # | id | inputType | options | multiSelect | branching |
|---|---|---|---|---|---|
| 4.N | {area_id}_deep_dive | multi_select | 6 | ✅ | showIf: area was in growth_focus (Step 2.35) |

**AI Trigger**: Calls `aurora-analyze` edge function with `type: 'growth_deep_dive'` on last area.
**Total mini-steps**: **1–5 screens** (depending on selected growth areas)

---

### STEP 5: First Chat with Aurora (`FirstChatStep.tsx`)
**Component**: `src/components/launchpad/steps/FirstChatStep.tsx` (280 lines)
**Storage**: `{ table: "launchpad_progress", column: "step_2_summary", jsonPath: "JSON.stringify({messages, questionIndex, answers})" }`
**Type**: CUSTOM — Chat interface, NOT convertible to card flow.

#### MiniSteps: 5 sequential chat questions

| # | id | prompt_he | prompt_en | inputType |
|---|---|---|---|---|
| 5.1 | chat_q1 | מה הדבר הכי חשוב לך בחיים כרגע? | What is the most important thing to you in life right now? | text (free-form) |
| 5.2 | chat_q2 | מה המכשול הגדול ביותר שאתה מרגיש שעוצר אותך? | What is the biggest obstacle you feel is holding you back? | text |
| 5.3 | chat_q3 | איך נראה יום מושלם בשבילך? | What does a perfect day look like for you? | text |
| 5.4 | chat_q4 | מה אתה מוכן לעשות כדי להשיג את השינוי הזה? | What are you willing to do to achieve this change? | text |
| 5.5 | chat_q5 | מתי בפעם האחרונה הרגשת באמת מחובר לעצמך? | When was the last time you felt truly connected to yourself? | text |

**AI Trigger**: Calls `aurora-chat` to generate summary after Q5.
**Total mini-steps**: **5 screens** (kept as chat UI)

---

### STEP 6: Introspection (`IntrospectionStep.tsx`)
**Component**: `src/components/launchpad/steps/IntrospectionStep.tsx` (749 lines)
**Storage**: `{ table: "form_submissions", column: "responses", jsonPath: "[{question, answer}]" }` + `launchpad_progress.step_3_form_submission_id`
**Form ID**: `45dfc6a5-6f98-444b-a3dd-2c0dd1ca3308`

#### MiniSteps: 5 deep introspection questions (free text)

| # | id | title_he | title_en | prompt_he | prompt_en | inputType | validation |
|---|---|---|---|---|---|---|---|
| 6.1 | life_end | נקודת הסוף | Life Endpoint | דמיין שזה סוף החיים שלך... | Imagine this is the end of your life... | text | min 30 chars |
| 6.2 | ideal_self | האני האידיאלי | Ideal Self | מי היית רוצה להיות כשאתה מסתכל אחורה? | Who would you want to be looking back? | text | min 30 chars |
| 6.3 | inner_traits | תכונות פנימיות | Inner Traits | איך האדם שאתה רוצה להיות מתמודד עם פחד? | How does the person you want to be handle fear? | text | min 30 chars |
| 6.4 | current_reality | המציאות הנוכחית | Current Reality | איפה אתה עכשיו בחיים? | Where are you now in life? | text | min 30 chars |
| 6.5 | gap | הפער | The Gap | מה הפער בין מי שאתה היום למי שאתה רוצה להיות? | What's the gap between who you are today and who you want to be? | text | min 30 chars |

**Validation**: ≥3 questions answered with ≥30 chars each.
**AI Trigger**: Calls `analyze-introspection-form` edge function.
**Skip**: Allowed (writes empty `{}`).
**Auth Gate**: Requires login for DB save (guests skip to next).
**Total mini-steps**: **5 screens**

---

### STEP 7: Life Plan / Vision & Direction (`LifePlanStep.tsx`)
**Component**: `src/components/launchpad/steps/LifePlanStep.tsx` (775 lines)
**Storage**: `{ table: "form_submissions", column: "responses" }` + `launchpad_progress.step_4_form_submission_id` + `aurora_life_visions`
**Form ID**: `f2b4e2c6-40a8-4b8b-9a35-6a1e5c54a6f3`

#### MiniSteps: 6 vision/planning questions (free text)

| # | id | title_he | title_en | prompt_he | prompt_en | inputType | validation |
|---|---|---|---|---|---|---|---|
| 7.1 | vision_3y | חזון 3 שנים | 3-Year Vision | איך נראים החיים שלך בעוד 3 שנים? | What does your life look like in 3 years? | text | min 20 chars |
| 7.2 | goals_12m | 12 חודשים | 12 Months | מה חייב לקרות השנה? | What must happen this year? | text | min 20 chars |
| 7.3 | goals_90d | 90 ימים | 90 Days | מה היעדים המדידים שלך ל-90 ימים? | What are your measurable 90-day goals? | text | min 20 chars |
| 7.4 | identity | זהות נדרשת | Required Identity | מי אתה צריך להיות כדי שזה יקרה? | Who do you need to be for this to happen? | text | min 20 chars |
| 7.5 | systems | מערכות חיים | Life Systems | איך נראים השינה, התזונה, התנועה והעבודה שלך? | What does your sleep, nutrition, movement, and work look like? | text | min 20 chars |
| 7.6 | risks | אילוצים וסיכונים | Constraints & Risks | מה עלול להפיל אותך ומה תעשה כשזה יקרה? | What might derail you and what will you do? | text | min 20 chars |

**Validation**: ≥3 sections filled with ≥20 chars.
**AI Trigger**: Calls `analyze-life-plan` edge function.
**Skip**: Allowed.
**Auth Gate**: Requires login for DB save.
**Total mini-steps**: **6 screens**

---

### STEP 8: Focus Areas (`FocusAreasStep.tsx`)
**Component**: `src/components/launchpad/steps/FocusAreasStep.tsx` (175 lines)
**Storage**: `{ table: "launchpad_progress", column: "step_5_focus_areas_selected", jsonPath: "string[]" }`

#### MiniSteps: 1 screen

| # | id | title_he | title_en | inputType | options | validation |
|---|---|---|---|---|---|---|
| 8.1 | focus_areas | בחר 3 תחומי פוקוס | Choose 3 Focus Areas | multi_select (exact 3) | 8 | Exactly 3 selected |

**Options**:
- health (💪 בריאות וגוף)
- money (💰 כסף ושפע)
- mind (🧠 תודעה ומיינד)
- relationships (❤️ זוגיות ומערכות יחסים)
- career (💼 קריירה ועבודה)
- creativity (🎨 יצירה והבעה)
- social (👥 חברה וקהילה)
- spirituality (✨ רוחניות ומשמעות)

**Total mini-steps**: **1 screen**

---

### STEP 9: First Week Planning (`FirstWeekStep.tsx`)
**Component**: `src/components/launchpad/steps/FirstWeekStep.tsx` (603 lines)
**Storage**: `{ table: "launchpad_progress", column: "step_6_actions", jsonPath: "{habits_to_quit, habits_to_build, career_status, career_goal}" }`

#### MiniSteps: 4 sections (navigated by Next/Prev)

| # | id | title_he | title_en | inputType | options | multiSelect | validation |
|---|---|---|---|---|---|---|---|
| 9.1 | habits_to_quit | הרגלים לעזוב | Habits to Quit | multi_select | 35 | ✅ | ≥1 selected |
| 9.2 | habits_to_build | הרגלים לבנות | Habits to Build | multi_select | 34 | ✅ | ≥1 selected |
| 9.3 | career_status | מצב קריירה נוכחי | Current Career Status | single_select | 8 | ❌ | Required |
| 9.4 | career_goal | יעד קריירה | Career Goal | single_select | 8 | ❌ | Required |

**Total mini-steps**: **4 screens**

---

### STEP 10: Final Notes (`FinalNotesStep.tsx`)
**Component**: `src/components/launchpad/steps/FinalNotesStep.tsx` (167 lines)
**Storage**: `{ table: "launchpad_progress", column: "step_6_actions", jsonPath: "via autoSave step 10 → {notes}" }`

#### MiniSteps: 1 screen

| # | id | title_he | title_en | inputType | validation | canSkip |
|---|---|---|---|---|---|---|
| 10.1 | final_notes | הערות נוספות | Final Notes | text (textarea) | None | ✅ |

**Prompts shown**: Health limitations, special life situations, time constraints, things Aurora should know, other notes.
**Total mini-steps**: **1 screen**

---

### STEP 11: Dashboard Activation (`DashboardActivation.tsx`)
**Component**: `src/components/launchpad/steps/DashboardActivation.tsx` (244 lines)
**Storage**: `{ table: "launchpad_progress", column: "step_7_dashboard_activated" }`
**Type**: CUSTOM — Activation screen with auth gate, NOT a question.

#### MiniSteps: 1 screen (activation CTA)

| # | id | title_he | title_en | inputType | authGate |
|---|---|---|---|---|---|
| 11.1 | activate | 🚀 הפעל את הדשבורד | 🚀 Activate Dashboard | button | ✅ (shows signup modal for guests) |

**AI Trigger**: Calls `generate-launchpad-summary` edge function.
**Total mini-steps**: **1 screen**

---

## C) Summary Statistics

| Metric | Count |
|--------|-------|
| Macro Steps | 11 |
| Total Mini-Steps (max) | ~95 screens |
| Total Mini-Steps (min, no branching) | ~79 screens |
| Multi-select questions | ~40 |
| Single-select questions | ~25 |
| Free-text questions | ~16 |
| Time picker questions | 4 |
| Slider questions | 2 |
| AI triggers (edge functions) | 5 |
| Custom (non-card) screens | 2 (Step 5 chat, Step 11 activation) |

---

## D) Mismatch Report

### 1. DB Column Naming vs Step Numbering
The DB columns use a **legacy numbering** that does NOT match the current 11-step flow:

| UI Step | DB Column Prefix | Comment |
|---------|-----------------|---------|
| Step 1 (Welcome) | step_1_* | ✅ Matches |
| Step 2 (Profile) | step_2_profile* | ✅ Matches |
| Step 3 (Lifestyle) | No dedicated column | ⚠️ Data saved via autoSave to generic location |
| Step 4 (Deep Dive) | No dedicated column | ⚠️ Saved into step_2_profile_data.deep_dive |
| Step 5 (First Chat) | step_2_summary, step_2_first_chat | ⚠️ Uses "step_2" prefix for UI Step 5 |
| Step 6 (Introspection) | step_3_* | ⚠️ Uses "step_3" prefix for UI Step 6 |
| Step 7 (Life Plan) | step_4_* | ⚠️ Uses "step_4" prefix for UI Step 7 |
| Step 8 (Focus Areas) | step_5_* | ⚠️ Uses "step_5" prefix for UI Step 8 |
| Step 9 (First Week) | step_6_* | ⚠️ Uses "step_6" prefix for UI Step 9 |
| Step 10 (Final Notes) | No dedicated column | ⚠️ Saved via autoSave step 10 |
| Step 11 (Activation) | step_7_* | ⚠️ Uses "step_7" prefix for UI Step 11 |

### 2. Step 3 (Lifestyle) and Step 4 (Deep Dive) — No Dedicated DB Columns
These steps piggyback on `step_2_profile_data` via autoSave. There's no explicit `step_3_lifestyle_data` column.

### 3. Step 10 (Final Notes) — Storage Unclear
Final notes are auto-saved but completion data may overlap with `step_6_actions`.

### 4. Guest Mode Gaps
Steps 5 (First Chat), 6 (Introspection), 7 (Life Plan) are auth-gated. Guest mode skips AI analysis and form submission saving.

### 5. Hobbies Options Count
Step 2.21 (hobbies) has ~80 options — extremely long for a single card screen. Needs grouping or search in micro-flow.

---

## E) Refactor Plan — Config-Driven vs Custom

### Config-Driven (via `<QuestionCard />` renderer):
- **Step 1** (Welcome Quiz) — 16 questions, already one-per-screen ✅
- **Step 2** (Personal Profile) — 38 questions, convert sections to cards
- **Step 3** (Lifestyle) — 14 questions, convert sections to cards
- **Step 4** (Deep Dive) — 1–5 dynamic questions, config-driven with area dependency
- **Step 8** (Focus Areas) — 1 multi-select card
- **Step 9** (First Week) — 4 cards (2 multi, 2 single)
- **Step 10** (Final Notes) — 1 text card with skip

### Keep Custom:
- **Step 5** (First Chat) — Chat UI, cannot be a card
- **Step 6** (Introspection) — Deep text with collapsible sections + AI analysis view
- **Step 7** (Life Plan) — Deep text with collapsible sections + AI analysis view
- **Step 11** (Dashboard Activation) — Auth gate + AI generation + navigation

### New Files Needed:
1. `src/config/launchpadFlowSpec.ts` — JSON flow specification
2. `src/components/launchpad/QuestionCard.tsx` — Generic card renderer
3. `src/components/launchpad/MicroFlowEngine.tsx` — One-question-per-screen engine

### Preserved:
- All edge functions unchanged
- All DB schema unchanged
- Guest/auth autosave behavior preserved
- Bilingual support (HE/EN) preserved
- RTL support preserved
