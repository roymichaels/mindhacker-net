# LAUNCHPAD FULL EXTRACTION AUDIT
> Generated: 2026-02-17 | Status: COMPLETE

---

## TABLE OF CONTENTS
1. [System Architecture](#1-system-architecture)
2. [Full Step-by-Step Questionnaire](#2-full-questionnaire)
3. [Emotional Load Analysis](#3-emotional-load-analysis)
4. [Data Flow Map](#4-data-flow-map)
5. [Redundancy Check](#5-redundancy-check)
6. [Output Summary](#6-output-summary)

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
| `src/components/launchpad/GamifiedJourneyHeader.tsx` | Header with orb |
| `src/components/launchpad/PhaseTransition.tsx` | Phase transition screen |
| `src/components/launchpad/PhaseIndicator.tsx` | Phase indicator |
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
**Validation:** Must answer all visible questions
**Auto-save:** Yes (localStorage + DB)

#### Q1.1: Life Areas (main_area)
> **HE:** במה אתה מתעסק כרגע בחיים?
> **EN:** What are you currently dealing with in life?
**Type:** Multi-select
**Options (12):**
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
**Each triggers ONLY if parent area selected in Q1.1**

**Q1.2: Career Specific** (`career_specific`) — depends on `career`
| Value | HE | EN |
|-------|-----|-----|
| advance | רוצה להתקדם בתפקיד | Want to advance in my role |
| change | רוצה לשנות מקצוע | Want to change profession |
| stuck | מרגיש תקוע ומשועמם | Feeling stuck and bored |
| searching | מחפש עבודה | Looking for a job |
| independent | רוצה להפוך לעצמאי | Want to become independent |
| balance | רוצה איזון עבודה-חיים | Want work-life balance |

**Q1.3: Business Specific** (`business_specific`) — depends on `business`
| Value | HE | EN |
|-------|-----|-----|
| start | רוצה להקים עסק | Want to start a business |
| grow | רוצה להגדיל את העסק | Want to grow the business |
| struggle | העסק מתקשה | Business is struggling |
| marketing | צריך עזרה בשיווק | Need help with marketing |
| team | ניהול צוות | Team management |
| pivot | רוצה לשנות כיוון | Want to pivot |

**Q1.4: Relationships Specific** (`relationships_specific`) — depends on `relationships`
| Value | HE | EN |
|-------|-----|-----|
| find_partner | רוצה למצוא בן/בת זוג | Want to find a partner |
| current_relationship | בעיות בזוגיות הנוכחית | Issues in current relationship |
| healing | ריפוי מפרידה | Healing from separation |
| communication | רוצה לשפר תקשורת | Want to improve communication |
| intimacy | קרבה ואינטימיות | Closeness and intimacy |
| commitment | פחד מהתחייבות | Fear of commitment |

**Q1.5: Family Specific** (`family_specific`) — depends on `family`
| Value | HE | EN |
|-------|-----|-----|
| parenting | אתגרי הורות | Parenting challenges |
| teenagers | התמודדות עם מתבגרים | Dealing with teenagers |
| parents | יחסים עם הורים | Relationship with parents |
| siblings | יחסים עם אחים | Relationship with siblings |
| balance | איזון משפחה-עבודה | Family-work balance |
| conflict | קונפליקטים משפחתיים | Family conflicts |

**Q1.6: Health Specific** (`health_specific`) — depends on `health`
| Value | HE | EN |
|-------|-----|-----|
| weight | רוצה לרדת במשקל | Want to lose weight |
| exercise | רוצה להתחיל להתאמן | Want to start exercising |
| nutrition | לשפר תזונה | Improve nutrition |
| pain | כאבים כרוניים | Chronic pain |
| condition | מצב רפואי מתמשך | Ongoing medical condition |
| habits | הרגלים לא בריאים | Unhealthy habits |

**Q1.7: Energy Specific** (`energy_specific`) — depends on `energy`
| Value | HE | EN |
|-------|-----|-----|
| tired | עייפות כרונית | Chronic fatigue |
| sleep_quality | איכות שינה ירודה | Poor sleep quality |
| insomnia | קשיי הירדמות | Difficulty falling asleep |
| morning | קושי להתעורר בבוקר | Difficulty waking up |
| focus | חוסר ריכוז | Lack of focus |
| burnout | שחיקה | Burnout |

**Q1.8: Finance Specific** (`finance_specific`) — depends on `finance`
| Value | HE | EN |
|-------|-----|-----|
| save | רוצה לחסוך יותר | Want to save more |
| debt | חובות שמטרידים | Troubling debts |
| earn_more | רוצה להרוויח יותר | Want to earn more |
| budget | לא יודע לנהל תקציב | Don't know how to budget |
| invest | רוצה להשקיע | Want to invest |
| anxiety | חרדות כלכליות | Financial anxiety |

**Q1.9: Purpose Specific** (`purpose_specific`) — depends on `purpose`
| Value | HE | EN |
|-------|-----|-----|
| dont_know | לא יודע מה אני רוצה | Don't know what I want |
| lost | מרגיש אבוד | Feeling lost |
| passion | רוצה למצוא תשוקה | Want to find passion |
| meaning | מחפש משמעות | Seeking meaning |
| big_change | רוצה לעשות שינוי גדול | Want to make a big change |
| legacy | רוצה להשאיר חותם | Want to leave a legacy |

**Q1.10: Emotional Specific** (`emotional_specific`) — depends on `emotional`
| Value | HE | EN |
|-------|-----|-----|
| anxiety | חרדה | Anxiety |
| depression | דיכאון | Depression |
| confidence | ביטחון עצמי | Self-confidence |
| regulation | ויסות רגשי | Emotional regulation |
| anger | ניהול כעסים | Anger management |
| trauma | טראומה מהעבר | Past trauma |

**Q1.11: Social Specific** (`social_specific`) — depends on `social`
| Value | HE | EN |
|-------|-----|-----|
| lonely | בדידות | Loneliness |
| friends | רוצה יותר חברים | Want more friends |
| social_anxiety | חרדה חברתית | Social anxiety |
| boundaries | הצבת גבולות | Setting boundaries |
| networking | נטוורקינג | Networking |
| community | רוצה קהילה | Want community |

**Q1.12: Learning Specific** (`learning_specific`) — depends on `learning`
| Value | HE | EN |
|-------|-----|-----|
| new_skill | רוצה ללמוד מיומנות חדשה | Want to learn a new skill |
| degree | תואר/הסמכה | Degree/certification |
| focus | קושי להתמקד בלימודים | Difficulty focusing on studies |
| motivation | חוסר מוטיבציה | Lack of motivation |
| time | אין לי זמן | No time |
| direction | לא יודע מה ללמוד | Don't know what to learn |

**Q1.13: Spirituality Specific** (`spirituality_specific`) — depends on `spirituality`
| Value | HE | EN |
|-------|-----|-----|
| connection | רוצה חיבור רוחני | Want spiritual connection |
| meditation | רוצה להתחיל למדיטציה | Want to start meditating |
| faith | שאלות על אמונה | Questions about faith |
| purpose | מחפש תכלית | Seeking purpose |
| peace | רוצה שקט פנימי | Want inner peace |
| growth | צמיחה אישית | Personal growth |

#### Q1.14: Emotional State (`emotional_state`)
> **HE:** איך אתה מרגיש לגבי המצב?
> **EN:** How do you feel about the situation?
**Type:** Multi-select (6 options)
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
> **EN:** What have you already tried?
**Type:** Multi-select (6 options)
| Value | HE | EN | Icon |
|-------|-----|-----|------|
| reading | ספרים/מאמרים | Books/articles | 📚 |
| courses | קורסים | Courses | 🎓 |
| coaching | אימון/ייעוץ | Coaching/counseling | 👨‍💼 |
| therapy | טיפול | Therapy | 🛋️ |
| apps | אפליקציות | Apps | 📱 |
| nothing | לא הרבה | Not much | 🆕 |

#### Q1.16: Help Style (`help_style`)
> **HE:** מה יעזור לך הכי הרבה?
> **EN:** What would help you the most?
**Type:** Multi-select (6 options)
| Value | HE | EN | Icon |
|-------|-----|-----|------|
| practical | פתרונות מעשיים | Practical solutions | 🔧 |
| listening | הקשבה | Being heard | 👂 |
| plan | תוכנית ברורה | Clear plan | 📋 |
| push | דחיפה לפעולה | Push to action | 🚀 |
| understanding | הבנה עצמית | Self-understanding | 🔮 |
| accountability | אחריותיות | Accountability | ✅ |

**STEP 1 TOTAL: 4 fixed questions + up to 12 conditional = 4–16 questions, ~90 answer options**

---

### STEP 2: Personal Profile (פרופיל אישי)
**Component:** `PersonalProfileStep.tsx` (1255 lines)
**Phase:** 1 — Who Are You Now?
**Input Type:** Single-select chips, multi-select chips, sliders (height/weight)
**Cognitive Load:** 🔴 HIGH (37 categories across 8 sections)
**DB Field:** `step_2_profile_data` (JSON)
**Validation:** Section-by-section, must complete current section
**Auto-save:** Yes

#### Sections & Questions:

**SECTION: Demographics (6 questions)**

| ID | Title HE | Title EN | Type | Options |
|----|----------|----------|------|---------|
| age_group | קבוצת גיל | Age Group | Single | 18-24, 25-34, 35-44, 45-54, 55+ |
| gender | מין | Gender | Single | גבר/Male, אישה/Female, אחר/Other |
| relationship_status | מצב משפחתי | Relationship Status | Single | רווק/Single, בזוגיות/Dating, נשוי/Married, גרוש/Divorced, מסובך/Complicated |
| children | ילדים | Children | Single | אין/None, 1, 2, 3+, מצפה/Expecting |
| living_situation | מגורים | Living Situation | Single | לבד/Alone, עם בן זוג/With partner, +ילד, משפחה/Family, שותפים/Roommates, הורים/Parents |
| employment_status | תעסוקה | Employment | Single | שכיר/Employed, בעל עסק/Business Owner, עצמאי/Freelancer, יזם/Entrepreneur, מנהל/Manager, סטודנט/Student, צבאי/Military, לא עובד/Unemployed, עקרת בית/Stay-at-home, פנסיונר/Retired |

**SECTION: Physical (2 inputs — sliders)**
| ID | Title | Type | Range |
|----|-------|------|-------|
| height_cm | גובה | Slider | 140–210 cm |
| weight_kg | משקל | Slider | 40–180 kg |

**SECTION: Health & Habits (10 questions)**
| ID | Title HE | Type | # Options |
|----|----------|------|-----------|
| diet | סוג תזונה | Single | 13 (Regular, Vegetarian, Vegan, Alkaline Vegan, Raw Vegan, Keto, Carnivore, Paleo, Mediterranean, Gluten-Free, Sugar-Free, Intuitive, Other) |
| sleep_hours | שעות שינה | Single | 5 (<5, 5-6, 6-7, 7-8, >8) |
| exercise_frequency | תדירות אימונים | Single | 5 (Never, 1-2/week, 3-4/week, 5-6/week, Daily) |
| exercise_types | סוגי אימונים | Multi | 17 (Gym, Running, Swimming, Yoga, Pilates, Calisthenics, CrossFit, Martial Arts, Cycling, Hiking, Dancing, Climbing, Tai Chi, Power Walking, Team Sports, None, Other) |
| smoking | עישון | Multi | 5 (None, Cigarettes, Vape, Cannabis, Hookah) |
| alcohol | אלכוהול | Single | 5 (None, Rarely, Sometimes, Weekends, Often) |
| caffeine | קפאין | Single | 4 (None, 1-2/day, 3-4/day, 5+/day) |
| hydration | שתייה יומית | Multi | 7 (Water, Natural Juices, Coconut Water, Herbal Tea, Green Smoothies, Electrolytes, Other) |
| supplements | תוספי תזונה | Multi | 7 (None, Vitamins, Protein, Creatine, Omega 3, Probiotics, Other) |

**SECTION: Mental & Emotional (5 questions)**
| ID | Title HE | Type | # Options |
|----|----------|------|-----------|
| stress_level | רמת סטרס | Single | 5 (Very Low → Very High) |
| meditation_practice | מדיטציה | Single | 5 (Never, Tried, Sometimes, Regularly, Daily) |
| therapy_experience | ניסיון בטיפול | Single | 4 (Never, Past, Currently, Interested) |
| energy_source | מה נותן לך אנרגיה? | Multi | 10 (People, Solitude, Nature, Creativity, Learning, Achievement, Music, Movement, Helping Others, Other) |
| relaxation_methods | מה מרגיע אותך? | Multi | 11 (Music, Nature, Exercise, Meditation, Friends/Family, Alone time, Hobbies, Sleep, Screens, Food, Other) |

**SECTION: Interests & Hobbies (2 questions)**
| ID | Title HE | Type | # Options |
|----|----------|------|-----------|
| hobbies | תחביבים | Multi | **~80 options** across 9 categories (Art, Music, Sports, Nature, Food, Gaming/Tech, Learning, Culture, Crafts, Travel, Social, Other) |
| reading_habits | קריאת ספרים | Single | 6 (Never, Audiobooks only, Rarely, Sometimes, Often, Daily) |

**SECTION: Behavioral (7 questions — all multi-select)**
| ID | Title HE | Type | # Options |
|----|----------|------|-----------|
| conflict_handling | כשיש לך דעה שונה מאחרים... | Multi | 5 |
| problem_approach | כשאתה נתקל בבעיה בלתי צפויה... | Multi | 5 |
| decision_style | כשיש לך החלטה גדולה לקבל... | Multi | 5 |
| opportunity_response | כשמציעים לך הזדמנות חדשה... | Multi | 5 |
| failure_response | אחרי כישלון או אכזבה... | Multi | 5 |
| time_management | כשיש לך הרבה משימות... | Multi | 5 |
| relationship_style | ביחסים עם אנשים קרובים... | Multi | 5 |

**SECTION: Social & Lifestyle (3 questions)**
| ID | Title HE | Type | # Options |
|----|----------|------|-----------|
| social_preference | העדפה חברתית | Single | 3 (Introvert, Ambivert, Extrovert) |
| morning_evening | בוקר או ערב | Single | 3 (Early Bird, Flexible, Night Owl) |
| learning_style | סגנון למידה | Single | 4 (Visual, Auditory, Reading, Kinesthetic) |

**SECTION: Goals & Values (4 questions)**
| ID | Title HE | Type | # Options |
|----|----------|------|-----------|
| life_priorities | עדיפויות בחיים | Multi | 20 (Career, Family, Health, Wealth, Relationships, Personal Growth, Freedom, Creativity, Adventure, Spirituality, Contribution, Peace, Recognition, Intimacy, Independence, Legacy, Learning, Leadership, Pleasure, Other) |
| spiritual_practice | פרקטיקה רוחנית | Single | 5 (None, Secular, Traditional, Religious, Spiritual) |
| growth_focus | במה אתה רוצה לצמוח? | Multi | ~25 options (Confidence, Emotional Regulation, Anxiety, etc.) |
| obstacles | מה מעכב אותך? | Multi | ~15 options (Procrastination, Fear, Laziness, etc.) |

**STEP 2 TOTAL: ~37 questions, ~300+ answer options**

---

### STEP 3: Lifestyle & Routine (שגרת חיים)
**Component:** `LifestyleRoutineStep.tsx` (541 lines)
**Phase:** 1 — Who Are You Now?
**Input Type:** Time pickers + single/multi-select
**Cognitive Load:** 🟡 MEDIUM
**DB Field:** `step_2_profile_data` (merged with step 2 data via auto-save)
**Validation:** Section-by-section completion required
**Auto-save:** Yes

#### Sections (5):

**SECTION: Sleep (3 questions)**
| ID | Title HE | Type | Options |
|----|----------|------|---------|
| wake_time | באיזו שעה אתה קם? | Time Picker | 03:00–12:00 |
| sleep_time | באיזו שעה אתה הולך לישון? | Time Picker | 18:00–03:00 |
| sleep_quality | איך איכות השינה שלך? | Single | Excellent, Good, Fair, Poor, Very Poor |

**SECTION: Work (4 questions)**
| ID | Title HE | Type | Options |
|----|----------|------|---------|
| shift_work | האם אתה עובד במשמרות? | Single | 6 (No-fixed, Fixed shifts, Rotating, Night, Flexible, Not working) |
| work_start_time | מתי אתה מתחיל לעבוד? | Time Picker | 00:00–23:00 |
| work_end_time | מתי אתה מסיים לעבוד? | Time Picker | 00:00–23:00 |
| work_flexibility | כמה גמישות יש לך? | Single | 6 (Very flexible, Somewhat, Hybrid, Fixed, Demanding, N/A) |

**SECTION: Meals (3 questions)**
| ID | Title HE | Type | Options |
|----|----------|------|---------|
| breakfast_time | מתי ארוחת בוקר? | Single | 6 (Very early, Early, Regular, Late, Skip, Intermittent fasting) |
| lunch_time | מתי ארוחת צהריים? | Single | 5 (Early, Regular, Late, Skip, Varies) |
| dinner_time | מתי ארוחת ערב? | Single | 6 (Early, Regular, Late, Very late, Skip, Varies) |

**SECTION: Energy (2 questions)**
| ID | Title HE | Type | Options |
|----|----------|------|---------|
| peak_productivity | מתי אתה הכי פרודוקטיבי? | Single | 7 (Very early morning through Late night) |
| low_energy_time | מתי אתה הכי עייף? | Single | 6 (Morning, Mid-morning, After lunch, Late afternoon, Evening, Consistent) |

**SECTION: Commitments (2 questions)**
| ID | Title HE | Type | Options |
|----|----------|------|---------|
| family_commitments | מחויבויות משפחתיות | Multi | 7 (None, Young children, School-age, Elderly care, Shared custody, Partner needs, Pet care) |
| special_constraints | הגבלות מיוחדות | Multi | 9 (None, Health condition, Disability, Mental health, Limited mobility, Chronic fatigue, Irregular schedule, Financial, Challenging living) |

**STEP 3 TOTAL: 14 questions, ~60 answer options**

---

### STEP 4: Growth Deep Dive (העמקה אישית)
**Component:** `GrowthDeepDiveStep.tsx` (434 lines)
**Phase:** 2 — What's Not Working?
**Input Type:** Multi-select per growth area (dynamic based on Step 2 answers)
**Cognitive Load:** 🟡 MEDIUM
**DB Field:** Via `completeStep` data
**Validation:** Must answer at least 1 option per area
**Auto-save:** Yes
**AI:** Calls `aurora-analyze` edge function with `type: 'growth_deep_dive'`

**How it works:** Takes `growth_focus` selections from Step 2 (max 5 areas) and asks a targeted follow-up question for each.

**Available follow-up question sets (9 + 1 default):**

| Area Key | Question HE | # Options |
|----------|-------------|-----------|
| confidence | באיזה מצבים הכי קשה לך עם ביטחון עצמי? | 6 |
| find-partner | מה מונע ממך למצוא זוגיות? | 6 |
| improve-relationship | מה הכי משפיע על הזוגיות שלך? | 6 |
| anxiety | מה מעורר אצלך הכי הרבה חרדה? | 6 |
| weight-loss | מה הכי מקשה עליך לרדת במשקל? | 6 |
| discipline | מה הכי מפריע לך לשמור על עקביות? | 6 |
| career-purpose | מה מונע ממך למצוא את הייעוד המקצועי? | 6 |
| increase-income | מה מגביל את ההכנסה שלך? | 6 |
| parents-relationship | מה הכי משפיע על היחסים עם ההורים? | 6 |
| **default** (fallback) | מה הכי חשוב לך להשיג בתחום הזה? | 6 |

**38 growth area labels available** (confidence, emotional-regulation, anxiety, depression, trauma-healing, self-awareness, resilience, find-partner, improve-relationship, communication-partner, parents-relationship, children-relationship, friendships, boundaries, forgiveness, career-purpose, career-advancement, entrepreneurship, work-leadership, work-life-balance, increase-income, money-management, financial-blocks, weight-loss, muscle-building, energy-vitality, quality-sleep, find-meaning, self-connection, life-purpose, discipline, time-management, communication, assertiveness, creativity, focus, patience)

**STEP 4 TOTAL: 1–5 questions (dynamic), 6 options each**

---

### STEP 5: First Chat with Aurora (שיחה ראשונה)
**Component:** `FirstChatStep.tsx` (280 lines)
**Phase:** 2 — What's Not Working?
**Input Type:** Sequential chat (text input)
**Cognitive Load:** 🔴 HIGH (reflective open-ended)
**DB Field:** `step_2_summary` (JSON with messages, questionIndex, answers)
**Validation:** Must answer all 5 questions
**Auto-save:** Yes (messages array)
**AI:** Calls `aurora-chat` for summary generation after Q5

**Chat Flow:**
1. Aurora greeting → then sequential questions:

| # | Question HE | Question EN |
|---|-------------|-------------|
| Q1 | מה הדבר הכי חשוב לך בחיים כרגע? | What is the most important thing to you in life right now? |
| Q2 | מה המכשול הגדול ביותר שאתה מרגיש שעוצר אותך? | What is the biggest obstacle you feel is holding you back? |
| Q3 | איך נראה יום מושלם בשבילך? | What does a perfect day look like for you? |
| Q4 | מה אתה מוכן לעשות כדי להשיג את השינוי הזה? | What are you willing to do to achieve this change? |
| Q5 | מתי בפעם האחרונה הרגשת באמת מחובר לעצמך? | When was the last time you felt truly connected to yourself? |

**AI Prompt (summary generation):**
```
You are Aurora, a life coach AI. Based on these 5 answers from a new user, 
create a brief, warm summary (3-4 sentences) of what you learned about them. 
Be encouraging and mention 1-2 key themes you noticed. Respond in [Hebrew/English].
```

**STEP 5 TOTAL: 5 open-ended text questions**

---

### STEP 6: Introspection (התבוננות פנימית)
**Component:** `IntrospectionStep.tsx` (749 lines)
**Phase:** 2 — What's Not Working?
**Input Type:** Long-form textarea (30+ chars minimum per question)
**Cognitive Load:** 🔴 HIGH (deep identity reflection)
**DB Table:** `form_submissions` (form_id: `45dfc6a5-6f98-444b-a3dd-2c0dd1ca3308`)
**Validation:** At least 3 of 5 questions answered (30+ characters each)
**Auto-save:** localStorage
**AI:** Calls `analyze-introspection-form` edge function
**Skippable:** Yes (skip button appears after delay)

| # | ID | Title HE | Title EN | Question HE | Question EN |
|---|-----|----------|----------|-------------|-------------|
| Q1 | life_end | נקודת הסוף | Life Endpoint | דמיין שזה סוף החיים שלך. מי היית האדם שחי את החיים האלה? האם חיית באמת או שרדת? | Imagine this is the end of your life. Who was the person who lived this life? Did you truly live or just survive? |
| Q2 | ideal_self | האני האידיאלי | Ideal Self | מי היית רוצה להיות כשאתה מסתכל אחורה? אדם שעמד מאחורי עצמו או אדם שוויתר? | Who would you want to be looking back? Someone who stood by themselves or someone who gave up? |
| Q3 | inner_traits | תכונות פנימיות | Inner Traits | איך האדם שאתה רוצה להיות מתמודד עם פחד? איך הוא מגיב כשלא מבינים אותו? | How does the person you want to be handle fear? How do they react when misunderstood? |
| Q4 | current_reality | המציאות הנוכחית | Current Reality | איפה אתה עכשיו בחיים? מה עובד ומה לא עובד? מה מרגיש תקוע? | Where are you now in life? What works and what doesn't? What feels stuck? |
| Q5 | gap | הפער | The Gap | מה הפער בין מי שאתה היום למי שאתה רוצה להיות? מה מונע ממך לסגור אותו? | What's the gap between who you are today and who you want to be? What's stopping you from closing it? |

**AI Output Schema (from `analyze-introspection-form`):**
```json
{
  "summary": "string",
  "patterns": ["string"],
  "transformation_potential": "string",
  "recommendation": "string"
}
```

**STEP 6 TOTAL: 5 long-form text questions (30+ chars each)**

---

### STEP 7: Life Plan / Vision & Direction (חזון וכיוון)
**Component:** `LifePlanStep.tsx` (775 lines)
**Phase:** 2 — What's Not Working?
**Input Type:** Long-form textarea (20+ chars minimum per section)
**Cognitive Load:** 🔴 HIGH (strategic planning)
**DB Table:** `form_submissions` (form_id: `f2b4e2c6-40a8-4b8b-9a35-6a1e5c54a6f3`)
**Also writes to:** `aurora_life_visions` (3-year vision)
**Validation:** At least 3 of 6 sections filled (20+ characters each)
**Auto-save:** localStorage
**AI:** Calls `analyze-life-plan` edge function
**Skippable:** Yes

| # | ID | Title HE | Title EN | Question HE | Question EN |
|---|-----|----------|----------|-------------|-------------|
| Q1 | vision_3y | חזון 3 שנים | 3-Year Vision | איך נראים החיים שלך בעוד 3 שנים? | What does your life look like in 3 years? |
| Q2 | goals_12m | 12 חודשים | 12 Months | מה חייב לקרות השנה כדי שתרגיש שהתקדמת? | What must happen this year for you to feel you've progressed? |
| Q3 | goals_90d | 90 ימים | 90 Days | מה היעדים המדידים שלך ל-90 הימים הקרובים? | What are your measurable goals for the next 90 days? |
| Q4 | identity | זהות נדרשת | Required Identity | מי אתה צריך להיות כדי שזה יקרה? | Who do you need to be for this to happen? |
| Q5 | systems | מערכות חיים | Life Systems | איך נראים השינה, התזונה, התנועה, והעבודה שלך? | What does your sleep, nutrition, movement, and work look like? |
| Q6 | risks | אילוצים וסיכונים | Constraints & Risks | מה עלול להפיל אותך ומה תעשה כשזה יקרה? | What might derail you and what will you do when it happens? |

**AI Output Schema (from `analyze-life-plan`):**
```json
{
  "summary": "string",
  "vision_clarity": "string",
  "action_readiness": "string",
  "key_goals": ["string"],
  "potential_blockers": ["string"],
  "next_steps": ["string"]
}
```

**STEP 7 TOTAL: 6 long-form text questions (20+ chars each)**

---

### STEP 8: Focus Areas (תחומי פוקוס)
**Component:** `FocusAreasStep.tsx` (175 lines)
**Phase:** 3 — Who Do You Want to Be?
**Input Type:** Multi-select (exactly 3)
**Cognitive Load:** 🟢 LOW
**DB Field:** `step_5_focus_areas_selected`
**Validation:** Exactly 3 must be selected
**Auto-save:** Yes

| Value | HE | EN | Icon |
|-------|-----|-----|------|
| health | בריאות וגוף | Health & Body | 💪 |
| money | כסף ושפע | Money & Abundance | 💰 |
| mind | תודעה ומיינד | Mind & Consciousness | 🧠 |
| relationships | זוגיות ומערכות יחסים | Relationships | ❤️ |
| career | קריירה ועבודה | Career & Work | 💼 |
| creativity | יצירה והבעה | Creativity & Expression | 🎨 |
| social | חברה וקהילה | Social & Community | 👥 |
| spirituality | רוחניות ומשמעות | Spirituality & Meaning | ✨ |

**STEP 8 TOTAL: 1 question, 8 options, pick 3**

---

### STEP 9: First Week / Transformation Plan (שבוע ראשון)
**Component:** `FirstWeekStep.tsx` (603 lines)
**Phase:** 3 — Who Do You Want to Be?
**Input Type:** Multi-select (habits) + single-select (career)
**Cognitive Load:** 🟡 MEDIUM
**DB Field:** `step_6_actions`, `step_6_anchor_habit`
**Validation:** ≥1 quit habit, ≥1 build habit, career status selected, career goal selected
**Auto-save:** Yes
**4 sections navigated sequentially**

**Section 1: Habits to Quit** (multi-select, 36 options)
Categories: Substances & Addictions (9), Harmful Behaviors (8), Mental Patterns (6), Relationships (6), Financial (3), Other (4)

Full list:
- alcohol, drugs, cannabis, smoking, caffeine, sugar, gambling, porn, gaming
- scrolling, procrastination, binge_watching, emotional_eating, junk_food, late_nights, wasted_time, compulsive_shopping
- negative_self_talk, complaining, comparison, excessive_worry, perfectionism, overthinking
- toxic_relationships, conflict_avoidance, not_listening, gossip, self_isolation, codependency
- reckless_spending, living_beyond_means, financial_avoidance
- chronic_lateness, small_lies, anger_outbursts, saying_yes_always

**Section 2: Habits to Build** (multi-select, 34 options)
Categories: Routines (6), Body & Health (6), Learning (5), Business & Career (5), Mental & Emotional (5), Relationships (5), Financial (4)

Full list:
- morning_routine, weekly_planning, daily_goals, task_completion, saying_no, daily_review
- daily_exercise, drinking_water, healthy_eating, quality_sleep, cold_exposure, medical_checkups
- daily_learning, reading, podcasts, new_language, courses
- work_on_business, skill_practice, networking, client_outreach, documenting_ideas
- meditation, journaling, gratitude, mental_blocks, stress_management
- family_time, relationship_investment, active_listening, honest_communication, volunteering
- expense_tracking, regular_saving, learning_investing, additional_income

**Section 3: Career Status** (single-select, 8 options)
| Value | HE | EN |
|-------|-----|-----|
| employee_happy | שכיר מרוצה | Happy employee |
| employee_unhappy | שכיר לא מרוצה | Unhappy employee |
| freelancer | עצמאי / פרילנסר | Freelancer |
| early_entrepreneur | יזם בתחילת הדרך | Early-stage entrepreneur |
| small_business | בעל עסק קטן | Small business owner |
| growing_business | בעל עסק בצמיחה | Growing business owner |
| job_seeker | מחפש עבודה | Job seeker |
| student | סטודנט | Student |

**Section 4: Career Goal** (single-select, 8 options)
| Value | HE | EN |
|-------|-----|-----|
| start_business | לפתוח עסק עצמאי | Start my own business |
| grow_business | לצמוח בעסק הקיים | Grow my existing business |
| change_career | להחליף מקצוע/קריירה | Change career |
| get_promoted | להתקדם בארגון | Get promoted |
| earn_more | להרוויח יותר | Earn more money |
| freedom | חופש וגמישות | Freedom & flexibility |
| leadership | השפעה ומנהיגות | Influence & leadership |
| passive_income | הכנסה פסיבית | Passive income |

**STEP 9 TOTAL: 4 questions, 86 total answer options**

---

### STEP 10: Final Notes (הערות נוספות)
**Component:** `FinalNotesStep.tsx` (167 lines)
**Phase:** 3 — Who Do You Want to Be?
**Input Type:** Textarea (optional)
**Cognitive Load:** 🟢 LOW
**DB Field:** Via `completeStep` data
**Validation:** None (fully optional)
**Skippable:** Yes (dedicated skip button)
**Auto-save:** Yes

**Prompts displayed:**
- 💡 מגבלות בריאותיות שחשוב לנו לדעת / Health limitations
- 🏠 מצבים מיוחדים בחיים (מעבר דירה, לידה, גירושין...) / Special life situations
- ⏰ הגבלות זמן או לוח זמנים מיוחד / Time constraints
- 🎯 דברים שחשוב ש-Aurora תדע עליך / Things Aurora should know
- 💬 כל הערה או בקשה נוספת / Any other notes

**Buttons:** "Continue to Summary" + "Skip"

**STEP 10 TOTAL: 1 optional textarea**

---

### STEP 11: Dashboard Activation (הפעלת הדשבורד)
**Component:** `DashboardActivation.tsx` (244 lines)
**Phase:** 3 — Who Do You Want to Be?
**Input Type:** Single CTA button
**Cognitive Load:** 🟢 LOW
**DB Field:** `step_7_dashboard_activated`
**Auth Gate:** Yes — shows AuthModal (signup/login) if not authenticated
**AI:** Triggers `generate-launchpad-summary` edge function

**Unlocks displayed:**
| Icon | EN | HE |
|------|-----|-----|
| 🧭 | Life OS Dashboard | דשבורד חיים |
| 📊 | Weekly Planning | תכנון שבועי |
| 🎯 | Focus Plans | תוכניות פוקוס |
| ⚓ | Daily Anchors | עוגנים יומיים |
| 🧘 | Hypnosis | היפנוזה |
| 🤖 | Aurora Coaching | אימון אורורה |

**Button text:**
- Not logged in: "🚀 הירשם והפעל את הדשבורד" / "🚀 Sign Up & Activate Dashboard"
- Logged in: "🚀 הפעל את הדשבורד" / "🚀 Activate Dashboard"
- Generating: "יוצר סיכום..." / "Creating..."

**AI: `generate-launchpad-summary` — uses `LAUNCHPAD_SYSTEM_PROMPT`**

See `supabase/functions/_shared/launchpad-ai-prompt.ts` for full prompt. Output:
```json
{
  "summary": {
    "consciousness_analysis": { "current_state", "dominant_patterns", "blind_spots", "strengths", "growth_edges" },
    "life_direction": { "core_aspiration", "clarity_score", "vision_summary" },
    "identity_profile": { "dominant_traits", "suggested_ego_state", "values_hierarchy", "identity_title" },
    "behavioral_insights": { "habits_to_transform", "habits_to_cultivate", "resistance_patterns" },
    "career_path": { "current_status", "aspiration", "key_steps" },
    "transformation_potential": { "readiness_score", "primary_focus", "secondary_focus" }
  },
  "plan": { "months": [{ "number", "title", "title_he", "focus", "milestone", "weeks": [{ ... }] }] },
  "scores": { "consciousness", "readiness", "clarity" }
}
```

**STEP 11 TOTAL: 0 questions, 1 CTA button**

---

## 3. EMOTIONAL LOAD ANALYSIS

### Per-Step Load
| Step | Name | Load | Est. Time | # Inputs | Text-heavy? | Reflective? |
|------|------|------|-----------|----------|-------------|-------------|
| 1 | Welcome Quiz | 🟡 MEDIUM | 3-5 min | 4-16 | No | No |
| 2 | Personal Profile | 🔴 HIGH | 15-25 min | ~37 | No | Partially (behavioral) |
| 3 | Lifestyle & Routine | 🟡 MEDIUM | 5-8 min | 14 | No | No |
| 4 | Growth Deep Dive | 🟡 MEDIUM | 3-5 min | 1-5 | No | No |
| 5 | First Chat | 🔴 HIGH | 8-15 min | 5 | Yes (all open-ended) | Yes |
| 6 | Introspection | 🔴 HIGH | 15-25 min | 5 | Yes (30+ chars each) | **Very High** |
| 7 | Life Plan | 🔴 HIGH | 10-20 min | 6 | Yes (20+ chars each) | **Very High** |
| 8 | Focus Areas | 🟢 LOW | 1-2 min | 1 | No | No |
| 9 | First Week | 🟡 MEDIUM | 5-8 min | 4 | No | No |
| 10 | Final Notes | 🟢 LOW | 1-3 min | 1 | Optional | No |
| 11 | Dashboard Activation | 🟢 LOW | 1 min | 0 | No | No |

### Aggregate Metrics
| Metric | Value |
|--------|-------|
| **Total steps** | 11 |
| **Total inputs** | ~93–140 (depending on branching) |
| **Text-heavy inputs** | 16 (Steps 5, 6, 7) |
| **Deep reflective prompts** | 11 (Steps 5, 6, 7) |
| **HIGH cognitive load steps** | 4 (Steps 2, 5, 6, 7) |
| **Estimated total time** | **67–117 minutes** |
| **Consecutive HIGH-load block** | Steps 5→6→7 (33–60 min) |

### Friction Points
1. **Step 2** alone has ~37 fields including ~80 hobby options — massive
2. **Steps 5→6→7** form a consecutive block of intense reflection with no "breather"
3. **Step 6** asks existential questions ("imagine the end of your life") — emotionally heavy
4. **Step 7** requires strategic thinking across 4 time horizons — cognitively demanding
5. **Step 9** has 70 habit options to browse through

---

## 4. DATA FLOW MAP

```
STEP 1 (Welcome Quiz)
  └─→ launchpad_progress.step_1_intention (JSON)
  └─→ Used by AI in final summary

STEP 2 (Personal Profile)
  └─→ launchpad_progress.step_2_profile_data (JSON)
  └─→ growth_focus feeds into STEP 4 (dynamic questions)
  └─→ Used by AI in final summary
  └─→ height_cm, weight_kg stored but NOT used anywhere in UI

STEP 3 (Lifestyle Routine)
  └─→ launchpad_progress (via auto-save, merged with step 2 data)
  └─→ wake_time/sleep_time → AI uses for schedule planning
  └─→ Used by AI in final summary

STEP 4 (Growth Deep Dive)
  └─→ launchpad_progress (via completeStep)
  └─→ aurora-analyze edge function → returns insight (displayed inline)
  └─→ Used by AI in final summary

STEP 5 (First Chat)
  └─→ launchpad_progress.step_2_summary (JSON with messages)
  └─→ aurora-chat edge function → generates chat summary
  └─→ Used by AI in final summary

STEP 6 (Introspection)
  └─→ form_submissions table (form_id: 45dfc6a5...)
  └─→ analyze-introspection-form edge function
    └─→ form_analyses table (summary, patterns, recommendation)
  └─→ launchpad_progress.step_3_form_submission_id

STEP 7 (Life Plan)
  └─→ form_submissions table (form_id: f2b4e2c6...)
  └─→ aurora_life_visions table (3-year vision)
  └─→ analyze-life-plan edge function
    └─→ form_analyses table
  └─→ launchpad_progress.step_4_form_submission_id

STEP 8 (Focus Areas)
  └─→ launchpad_progress.step_5_focus_areas_selected

STEP 9 (First Week)
  └─→ launchpad_progress.step_6_actions, step_6_anchor_habit

STEP 10 (Final Notes)
  └─→ launchpad_progress (via completeStep)

STEP 11 (Dashboard Activation)
  └─→ AUTH GATE (if not logged in → AuthModal)
  └─→ generate-launchpad-summary edge function
    └─→ READS: All launchpad_progress data
    └─→ WRITES:
      ├─→ life_plans (90-day plan)
      ├─→ life_plan_milestones (12 weekly milestones)
      ├─→ aurora_identity_elements (identity archetype)
      ├─→ aurora_life_direction (core aspiration)
      ├─→ aurora_onboarding_progress (onboarding_complete = true)
      └─→ launchpad_progress.launchpad_complete = true
  └─→ Redirects to /launchpad/complete

POST-COMPLETION:
  └─→ Unlocks: Dashboard, Weekly Planning, Focus Plans, Daily Anchors, Hypnosis, Aurora Coaching
  └─→ Gamification: 585 XP + 45 Tokens total
```

### AI Calls Summary
| Step | Edge Function | Model | Purpose |
|------|---------------|-------|---------|
| 4 | `aurora-analyze` | Gemini Flash | Growth area insight |
| 5 | `aurora-chat` | Gemini Flash | Chat summary |
| 6 | `analyze-introspection-form` | Gemini Flash | Consciousness analysis |
| 7 | `analyze-life-plan` | Gemini Flash | Life plan analysis |
| 11 | `generate-launchpad-summary` | Gemini Flash | Final 90-day plan + identity |

**Total AI calls: 5**

---

## 5. REDUNDANCY CHECK

### Duplicate/Overlapping Questions
| Data Point | Collected In | Redundancy |
|------------|-------------|------------|
| Sleep data | Step 2 (`sleep_hours`), Step 3 (`wake_time`, `sleep_time`, `sleep_quality`), Step 1 (`energy` sub-q) | **Triple collection** |
| Career/Employment status | Step 2 (`employment_status`), Step 9 (`career_status`) | **Duplicate** |
| Exercise habits | Step 2 (`exercise_frequency`, `exercise_types`), Step 1 (`health` sub-q) | **Overlap** |
| Life priorities | Step 2 (`life_priorities`), Step 8 (`focus_areas`) | **Very similar** — both ask "what matters" |
| Growth areas | Step 2 (`growth_focus`), Step 8 (`focus_areas`) | **Redundant** — slightly different framing |
| Relationship issues | Step 1 (`relationships_specific`), Step 2 (`relationship_style`), Step 4 (dynamic) | **Triple-touched** |
| Anxiety/Stress | Step 1 (`emotional_specific`), Step 2 (`stress_level`), Step 4 (dynamic) | **Triple-touched** |
| What you've tried | Step 1 (`tried_before`), Step 2 (`therapy_experience`, `meditation_practice`) | **Overlap** |
| Spiritual practice | Step 2 (`spiritual_practice`), Step 1 (`spirituality_specific`) | **Overlap** |
| Work flexibility/schedule | Step 2 (`employment_status`), Step 3 (work section) | **Extended but overlap** |

### Data Stored but Never Surfaced
| Field | Step | Status |
|-------|------|--------|
| `height_cm` | 2 | ❌ Not used in UI or AI |
| `weight_kg` | 2 | ❌ Not used in UI or AI |
| `hobbies` (80 options) | 2 | ⚠️ Sent to AI but not displayed anywhere |
| `reading_habits` | 2 | ⚠️ Sent to AI, not displayed |
| `hydration` | 2 | ⚠️ Sent to AI, not displayed |
| `supplements` | 2 | ⚠️ Sent to AI, not displayed |
| `smoking` | 2 | ⚠️ Sent to AI, not displayed |
| `alcohol` | 2 | ⚠️ Sent to AI, not displayed |
| `caffeine` | 2 | ⚠️ Sent to AI, not displayed |
| `breakfast_time` | 3 | ⚠️ Sent to AI, not displayed |
| `lunch_time` | 3 | ⚠️ Sent to AI, not displayed |
| `dinner_time` | 3 | ⚠️ Sent to AI, not displayed |

### Steps That Could Be Merged
| Merge Candidate | Rationale |
|-----------------|-----------|
| Step 2 + Step 3 | Both collect "who you are now" data |
| Step 8 + Step 2 (`growth_focus`) | Both ask what to focus on |
| Step 9 career questions + Step 2 employment | Redundant career data |

### Steps That Could Be Made Optional
| Step | Rationale |
|------|-----------|
| Step 4 (Growth Deep Dive) | Derivative of Step 2; could skip if growth_focus is empty |
| Step 10 (Final Notes) | Already optional |
| Step 6 OR Step 7 | Both are heavy text — one could suffice |

---

## 6. OUTPUT SUMMARY

### Flattened Question Count
| Category | Count |
|----------|-------|
| Fixed multi-select questions | ~50 |
| Conditional sub-questions | up to 12 |
| Time picker inputs | 4 |
| Slider inputs | 2 |
| Open-ended text (chat) | 5 |
| Long-form textarea | 11 |
| CTA/Button-only steps | 1 |
| **TOTAL INPUTS** | **~85–93 fixed + up to 12 conditional = ~97–105** |

### Total Answer Options Available
| Step | # Options |
|------|-----------|
| Step 1 | ~90 |
| Step 2 | ~300+ |
| Step 3 | ~60 |
| Step 4 | ~30 (dynamic) |
| Step 5 | N/A (free text) |
| Step 6 | N/A (free text) |
| Step 7 | N/A (free text) |
| Step 8 | 8 |
| Step 9 | 86 |
| Step 10 | N/A (free text) |
| Step 11 | 0 |
| **TOTAL** | **~575+ predefined options** |

### Fields Saved
| Destination | # Fields |
|-------------|----------|
| `launchpad_progress` | ~35 columns |
| `form_submissions` | 2 rows (Steps 6, 7) |
| `form_analyses` | 2 rows |
| `aurora_life_visions` | 1 row |
| **Total saved fields** | **~40+** |

### AI Calls
| Total AI edge function calls | 5 |
|------------------------------|---|
| During flow (Steps 4, 5, 6, 7) | 4 |
| On completion (Step 11) | 1 |

---

### 🔴 FINAL ASSESSMENT: "Is This Too Heavy?"

**YES.** This is exceptionally heavy for an onboarding flow.

- **67–117 minutes** estimated completion time
- **4 consecutive HIGH-load steps** in Phase 2
- **575+ predefined answer options** to browse
- **11 open-ended reflective questions** requiring deep thought
- **Step 2 alone** has 1,255 lines of code and ~37 categories
- **Hobbies question** has ~80 options (the most of any single question)

This functions as a comprehensive **clinical intake assessment**, not a standard product onboarding. The data collected far exceeds what's currently used in the product UI.

---
*End of audit. No changes made. Extraction only.*
