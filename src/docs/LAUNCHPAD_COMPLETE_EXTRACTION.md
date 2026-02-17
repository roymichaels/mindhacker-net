# LAUNCHPAD COMPLETE EXTRACTION — EVERY QUESTION, EVERY OPTION

> Generated: 2026-02-17 | Source: Direct code extraction from all step components

---

## ARCHITECTURE OVERVIEW

- **11 macro steps** organized in **3 phases**
- **Phase 1** "Who Are You Now?" → Steps 1–3
- **Phase 2** "What's Not Working?" → Steps 4–7
- **Phase 3** "Who Do You Want to Be?" → Steps 8–11
- DB table: `launchpad_progress`
- Completion triggers `generate-launchpad-summary` edge function

---

## STEP 1: WELCOME (ברוך הבא)
**Component:** `WelcomeStep.tsx`
**DB Column:** `step_1_intention` (JSON stringified)
**Input Type:** One question per screen, all multi-select
**Rewards:** 25 XP, 0 Tokens

### Q1.1: main_area — "What are you currently dealing with in life?"
`במה אתה מתעסק כרגע בחיים?`
**Type:** multi_select
| Value | Hebrew | English | Icon |
|-------|--------|---------|------|
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

### Q1.2: career_specific — "What specifically about your career?"
`מה בדיוק בקריירה?`
**Type:** multi_select | **Branching:** Shows only if `main_area` includes `career`
| Value | Hebrew | English | Icon |
|-------|--------|---------|------|
| advance | רוצה להתקדם בתפקיד | Want to advance in my role | 📈 |
| change | רוצה לשנות מקצוע | Want to change profession | 🔄 |
| stuck | מרגיש תקוע ומשועמם | Feeling stuck and bored | 😔 |
| searching | מחפש עבודה | Looking for a job | 🔍 |
| independent | רוצה להפוך לעצמאי | Want to become independent | 🚀 |
| balance | רוצה איזון עבודה-חיים | Want work-life balance | ⚖️ |

### Q1.3: business_specific — "What specifically about business/entrepreneurship?"
`מה בדיוק בעסק/יזמות?`
**Type:** multi_select | **Branching:** Shows only if `main_area` includes `business`
| Value | Hebrew | English | Icon |
|-------|--------|---------|------|
| start | רוצה להקים עסק | Want to start a business | 🚀 |
| grow | רוצה להגדיל את העסק | Want to grow the business | 📈 |
| struggle | העסק מתקשה | Business is struggling | 😟 |
| marketing | צריך עזרה בשיווק | Need help with marketing | 📣 |
| team | ניהול צוות | Team management | 👥 |
| pivot | רוצה לשנות כיוון | Want to pivot | 🔄 |

### Q1.4: relationships_specific — "What specifically about relationships?"
`מה בדיוק במערכות יחסים?`
**Type:** multi_select | **Branching:** Shows only if `main_area` includes `relationships`
| Value | Hebrew | English | Icon |
|-------|--------|---------|------|
| find_partner | רוצה למצוא בן/בת זוג | Want to find a partner | 💕 |
| current_relationship | בעיות בזוגיות הנוכחית | Issues in current relationship | 💔 |
| healing | ריפוי מפרידה | Healing from separation | 🩹 |
| communication | רוצה לשפר תקשורת | Want to improve communication | 💬 |
| intimacy | קרבה ואינטימיות | Closeness and intimacy | 🔥 |
| commitment | פחד מהתחייבות | Fear of commitment | 🔐 |

### Q1.5: family_specific — "What specifically about family?"
`מה בדיוק במשפחה?`
**Type:** multi_select | **Branching:** Shows only if `main_area` includes `family`
| Value | Hebrew | English | Icon |
|-------|--------|---------|------|
| parenting | אתגרי הורות | Parenting challenges | 👶 |
| teenagers | התמודדות עם מתבגרים | Dealing with teenagers | 🧒 |
| parents | יחסים עם הורים | Relationship with parents | 👴 |
| siblings | יחסים עם אחים | Relationship with siblings | 👫 |
| balance | איזון משפחה-עבודה | Family-work balance | ⚖️ |
| conflict | קונפליקטים משפחתיים | Family conflicts | ⚡ |

### Q1.6: health_specific — "What specifically about health?"
`מה בדיוק בבריאות?`
**Type:** multi_select | **Branching:** Shows only if `main_area` includes `health`
| Value | Hebrew | English | Icon |
|-------|--------|---------|------|
| weight | רוצה לרדת במשקל | Want to lose weight | ⚖️ |
| exercise | רוצה להתחיל להתאמן | Want to start exercising | 🏃 |
| nutrition | לשפר תזונה | Improve nutrition | 🥗 |
| pain | כאבים כרוניים | Chronic pain | 🩹 |
| condition | מצב רפואי מתמשך | Ongoing medical condition | 🏥 |
| habits | הרגלים לא בריאים | Unhealthy habits | 🚭 |

### Q1.7: energy_specific — "What specifically about energy/sleep?"
`מה בדיוק באנרגיה/שינה?`
**Type:** multi_select | **Branching:** Shows only if `main_area` includes `energy`
| Value | Hebrew | English | Icon |
|-------|--------|---------|------|
| tired | עייפות כרונית | Chronic fatigue | 😫 |
| sleep_quality | איכות שינה ירודה | Poor sleep quality | 😴 |
| insomnia | קשיי הירדמות | Difficulty falling asleep | 🌙 |
| morning | קושי להתעורר בבוקר | Difficulty waking up | ⏰ |
| focus | חוסר ריכוז | Lack of focus | 🎯 |
| burnout | שחיקה | Burnout | 🔥 |

### Q1.8: finance_specific — "What specifically about money/finances?"
`מה בדיוק בכסף/פיננסים?`
**Type:** multi_select | **Branching:** Shows only if `main_area` includes `finance`
| Value | Hebrew | English | Icon |
|-------|--------|---------|------|
| save | רוצה לחסוך יותר | Want to save more | 🐷 |
| debt | חובות שמטרידים | Troubling debts | 📉 |
| earn_more | רוצה להרוויח יותר | Want to earn more | 💵 |
| budget | לא יודע לנהל תקציב | Don't know how to budget | 📊 |
| invest | רוצה להשקיע | Want to invest | 📈 |
| anxiety | חרדות כלכליות | Financial anxiety | 😰 |

### Q1.9: purpose_specific — "What specifically about purpose/direction?"
`מה בדיוק במטרה/כיוון?`
**Type:** multi_select | **Branching:** Shows only if `main_area` includes `purpose`
| Value | Hebrew | English | Icon |
|-------|--------|---------|------|
| dont_know | לא יודע מה אני רוצה | Don't know what I want | ❓ |
| lost | מרגיש אבוד | Feeling lost | 🧭 |
| passion | רוצה למצוא תשוקה | Want to find passion | 🔥 |
| meaning | מחפש משמעות | Seeking meaning | ✨ |
| big_change | רוצה לעשות שינוי גדול | Want to make a big change | 🦋 |
| legacy | רוצה להשאיר חותם | Want to leave a legacy | 🏆 |

### Q1.10: emotional_specific — "What specifically about emotions/mental health?"
`מה בדיוק ברגשות/מנטלי?`
**Type:** multi_select | **Branching:** Shows only if `main_area` includes `emotional`
| Value | Hebrew | English | Icon |
|-------|--------|---------|------|
| anxiety | חרדה | Anxiety | 😟 |
| depression | דיכאון | Depression | 😢 |
| confidence | ביטחון עצמי | Self-confidence | 💪 |
| regulation | ויסות רגשי | Emotional regulation | 🎭 |
| anger | ניהול כעסים | Anger management | 😤 |
| trauma | טראומה מהעבר | Past trauma | 🩹 |

### Q1.11: social_specific — "What specifically about social life?"
`מה בדיוק בחברתי?`
**Type:** multi_select | **Branching:** Shows only if `main_area` includes `social`
| Value | Hebrew | English | Icon |
|-------|--------|---------|------|
| lonely | בדידות | Loneliness | 😔 |
| friends | רוצה יותר חברים | Want more friends | 👋 |
| social_anxiety | חרדה חברתית | Social anxiety | 😰 |
| boundaries | הצבת גבולות | Setting boundaries | 🚧 |
| networking | נטוורקינג | Networking | 🤝 |
| community | רוצה קהילה | Want community | 🏘️ |

### Q1.12: learning_specific — "What specifically about learning/growth?"
`מה בדיוק בלימודים/התפתחות?`
**Type:** multi_select | **Branching:** Shows only if `main_area` includes `learning`
| Value | Hebrew | English | Icon |
|-------|--------|---------|------|
| new_skill | רוצה ללמוד מיומנות חדשה | Want to learn a new skill | 🎯 |
| degree | תואר/הסמכה | Degree/certification | 🎓 |
| focus | קושי להתמקד בלימודים | Difficulty focusing on studies | 📚 |
| motivation | חוסר מוטיבציה | Lack of motivation | 🔋 |
| time | אין לי זמן | No time | ⏰ |
| direction | לא יודע מה ללמוד | Don't know what to learn | 🧭 |

### Q1.13: spirituality_specific — "What specifically about spirituality/meaning?"
`מה בדיוק ברוחניות/משמעות?`
**Type:** multi_select | **Branching:** Shows only if `main_area` includes `spirituality`
| Value | Hebrew | English | Icon |
|-------|--------|---------|------|
| connection | רוצה חיבור רוחני | Want spiritual connection | 🙏 |
| meditation | רוצה להתחיל למדיטציה | Want to start meditating | 🧘 |
| faith | שאלות על אמונה | Questions about faith | ✨ |
| purpose | מחפש תכלית | Seeking purpose | 🌟 |
| peace | רוצה שקט פנימי | Want inner peace | ☮️ |
| growth | צמיחה אישית | Personal growth | 🌱 |

### Q1.14: emotional_state — "How do you feel about the situation?"
`איך אתה מרגיש לגבי המצב?`
**Type:** multi_select | **No branching** (always shown)
| Value | Hebrew | English | Icon |
|-------|--------|---------|------|
| frustrated | מתוסכל | Frustrated | 😤 |
| hopeful | מלא תקווה | Hopeful | 🌟 |
| confused | מבולבל | Confused | 😵‍💫 |
| motivated | מוטיבציה | Motivated | 🚀 |
| anxious | חרד | Anxious | 😰 |
| determined | נחוש | Determined | 💪 |

### Q1.15: tried_before — "What have you already tried?"
`מה כבר ניסית?`
**Type:** multi_select | **No branching**
| Value | Hebrew | English | Icon |
|-------|--------|---------|------|
| reading | ספרים/מאמרים | Books/articles | 📚 |
| courses | קורסים | Courses | 🎓 |
| coaching | אימון/ייעוץ | Coaching/counseling | 👨‍💼 |
| therapy | טיפול | Therapy | 🛋️ |
| apps | אפליקציות | Apps | 📱 |
| nothing | לא הרבה | Not much | 🆕 |

### Q1.16: help_style — "What would help you the most?"
`מה יעזור לך הכי הרבה?`
**Type:** multi_select | **No branching**
| Value | Hebrew | English | Icon |
|-------|--------|---------|------|
| practical | פתרונות מעשיים | Practical solutions | 🔧 |
| listening | הקשבה | Being heard | 👂 |
| plan | תוכנית ברורה | Clear plan | 📋 |
| push | דחיפה לפעולה | Push to action | 🚀 |
| understanding | הבנה עצמית | Self-understanding | 🔮 |
| accountability | אחריותיות | Accountability | ✅ |

**Total Step 1 screens:** 4 always + up to 12 conditional = 4–16 screens

---

## STEP 2: PERSONAL PROFILE (פרופיל אישי)
**Component:** `PersonalProfileStep.tsx`
**DB Column:** `step_2_profile_data` (JSON object)
**Rewards:** 40 XP, 5 Tokens
**Sections:** 7 sections, 37 questions total
**Also includes:** Height (slider, 140–220cm) and Weight (slider, 40–180kg)

### Section: Demographics (פרטים אישיים)

#### Q2.1: age_group — "Age Group" / `קבוצת גיל` 🎂
**Type:** single_select
| Value | Hebrew | English |
|-------|--------|---------|
| 18-24 | 18-24 | 18-24 |
| 25-34 | 25-34 | 25-34 |
| 35-44 | 35-44 | 35-44 |
| 45-54 | 45-54 | 45-54 |
| 55+ | 55+ | 55+ |

#### Q2.2: gender — "Gender" / `מין` 👤
**Type:** single_select
| Value | Hebrew | English |
|-------|--------|---------|
| male | גבר | Male |
| female | אישה | Female |
| other | אחר | Other |

#### Q2.3: relationship_status — "Relationship Status" / `מצב משפחתי` 💑
**Type:** single_select
| Value | Hebrew | English |
|-------|--------|---------|
| single | רווק/ה | Single |
| dating | בזוגיות | Dating |
| married | נשוי/אה | Married |
| divorced | גרוש/ה | Divorced |
| complicated | מסובך | Complicated |

#### Q2.4: children — "Children" / `ילדים` 👶
**Type:** single_select
| Value | Hebrew | English |
|-------|--------|---------|
| none | אין | None |
| 1 | 1 | 1 |
| 2 | 2 | 2 |
| 3+ | 3+ | 3+ |
| expecting | מצפה | Expecting |

#### Q2.5: living_situation — "Living Situation" / `מגורים` 🏠
**Type:** single_select
| Value | Hebrew | English |
|-------|--------|---------|
| alone | לבד | Alone |
| with-partner | עם בן/ת זוג | With partner |
| with-partner-and-child | עם בן/ת זוג וילד | With partner and child |
| with-family | עם משפחה | With family |
| with-roommates | עם שותפים | With roommates |
| with-parents | עם הורים | With parents |

#### Q2.6: employment_status — "Employment" / `תעסוקה` 💼
**Type:** single_select
| Value | Hebrew | English |
|-------|--------|---------|
| employed | שכיר | Employed |
| business-owner | בעל עסק | Business Owner |
| self-employed | עצמאי / פרילנסר | Freelancer |
| entrepreneur | יזם | Entrepreneur |
| manager | מנהל/ת | Manager |
| student | סטודנט/ית | Student |
| military | שירות צבאי / לאומי | Military / National Service |
| unemployed | לא עובד/ת כרגע | Currently Unemployed |
| stay-at-home | עקרת/ן בית | Stay-at-home Parent |
| retired | פנסיונר/ית | Retired |

#### Q2.7: height_cm — Height slider
**Type:** slider (140–220, default 170)

#### Q2.8: weight_kg — Weight slider
**Type:** slider (40–180, default 70)

### Section: Health & Habits (בריאות והרגלים)

#### Q2.9: diet — "Diet Type" / `סוג תזונה` 🍽️
**Type:** single_select
| Value | Hebrew | English |
|-------|--------|---------|
| regular | רגיל | Regular |
| vegetarian | צמחוני | Vegetarian |
| vegan | טבעוני | Vegan |
| alkaline-vegan | טבעוני אלקלייני | Alkaline Vegan |
| raw-vegan | גלם טבעוני | Raw Vegan |
| keto | קטו | Keto |
| carnivore | קרניבור | Carnivore |
| paleo | פליאו | Paleo |
| mediterranean | ים תיכוני | Mediterranean |
| gluten-free | ללא גלוטן | Gluten-Free |
| sugar-free | ללא סוכר | Sugar-Free |
| intuitive | אינטואיטיבי | Intuitive |
| other | אחר | Other |

#### Q2.10: sleep_hours — "Sleep Hours" / `שעות שינה` 😴
**Type:** single_select
| Value | Hebrew | English |
|-------|--------|---------|
| less-than-5 | פחות מ-5 | Less than 5 |
| 5-6 | 5-6 | 5-6 |
| 6-7 | 6-7 | 6-7 |
| 7-8 | 7-8 | 7-8 |
| more-than-8 | יותר מ-8 | More than 8 |

#### Q2.11: exercise_frequency — "Exercise Frequency" / `תדירות אימונים` 💪
**Type:** single_select
| Value | Hebrew | English |
|-------|--------|---------|
| never | אף פעם | Never |
| 1-2/week | 1-2/שבוע | 1-2/week |
| 3-4/week | 3-4/שבוע | 3-4/week |
| 5-6/week | 5-6/שבוע | 5-6/week |
| daily | כל יום | Daily |

#### Q2.12: exercise_types — "Exercise Types" / `סוגי אימונים` 🏋️
**Type:** multi_select (17 options)
gym, running, swimming, yoga, pilates, calisthenics, crossfit, martial-arts, cycling, hiking, dancing, climbing, tai-chi, power-walking, team-sports, none, other

#### Q2.13: smoking — "Smoking" / `עישון` 🚬
**Type:** multi_select
none, cigarettes, vape, cannabis, hookah

#### Q2.14: alcohol — "Alcohol" / `אלכוהול` 🍷
**Type:** single_select
none, rarely, sometimes, weekends, often

#### Q2.15: caffeine — "Caffeine" / `קפאין` ☕
**Type:** single_select
none, 1-2/day, 3-4/day, 5+/day

#### Q2.16: hydration — "Daily Hydration" / `שתייה יומית` 💧
**Type:** multi_select (7 options)
water, natural-juice, coconut-water, herbal-tea, green-smoothies, electrolytes, other

#### Q2.17: supplements — "Supplements" / `תוספי תזונה` 💊
**Type:** multi_select
none, vitamins, protein, creatine, omega3, probiotics, other

### Section: Mental & Emotional (נפש ורגש)

#### Q2.18: stress_level — "Stress Level" / `רמת סטרס` 😰
**Type:** single_select
very-low, low, medium, high, very-high

#### Q2.19: meditation_practice — "Meditation" / `מדיטציה` 🧘
**Type:** single_select
never, tried, sometimes, regular, daily

#### Q2.20: therapy_experience — "Therapy Experience" / `ניסיון בטיפול` 🛋️
**Type:** single_select
never, past, current, interested

#### Q2.21: energy_source — "What gives you energy?" / `מה נותן לך אנרגיה?` ⚡
**Type:** multi_select (10 options)
people, solitude, nature, creativity, learning, achievement, music, movement, helping-others, other

#### Q2.22: relaxation_methods — "What relaxes you?" / `מה מרגיע אותך?` 🌿
**Type:** multi_select (11 options)
music, nature, exercise, meditation, social, alone, hobbies, sleep, screens, food, other

### Section: Interests & Hobbies (תחומי עניין)

#### Q2.23: hobbies — "Hobbies" / `תחביבים` 🎨
**Type:** multi_select (**~85 options** across categories: Art, Music, Sports, Nature, Food, Gaming/Tech, Learning, Culture, Crafts, Travel, Social)

#### Q2.24: reading_habits — "Book Reading" / `קריאת ספרים` 📚
**Type:** single_select
never, audiobooks, rarely, sometimes, often, daily

### Section: Behavioral Patterns (דפוסי התנהגות)

#### Q2.25: conflict_handling — "When you have a different opinion..." 💬
**Type:** multi_select
direct, diplomatic, thinks-first, avoids, depends

#### Q2.26: problem_approach — "When you encounter an unexpected problem..." 🔧
**Type:** multi_select
solve-immediately, calm-first, stressed, opportunity, seek-help

#### Q2.27: decision_style — "When you have a big decision to make..." 🤔
**Type:** multi_select
gut, pros-cons, consult, wait, procrastinate

#### Q2.28: opportunity_response — "When offered an unexpected new opportunity..." 🚀
**Type:** multi_select
excited, think-first, worried, investigate, consult

#### Q2.29: failure_response — "After a failure or disappointment..." 💔
**Type:** multi_select
bounce-back, process, self-blame, learn, stuck

#### Q2.30: time_management — "When you have many tasks..." ⏰
**Type:** multi_select
organized, easy-first, overwhelmed, last-minute, pressure-works

#### Q2.31: relationship_style — "In relationships with close people..." ❤️
**Type:** multi_select
giver, needs-space, deep-connection, cautious, initiator

### Section: Social & Lifestyle (חברתי ואורח חיים)

#### Q2.32: social_preference — "Social Preference" 👥
**Type:** single_select
introvert, ambivert, extrovert

#### Q2.33: morning_evening — "Morning or Evening" 🌅
**Type:** single_select
early-bird, flexible, night-owl

#### Q2.34: learning_style — "Learning Style" 📖
**Type:** single_select
visual, auditory, reading, kinesthetic

### Section: Values & Goals (ערכים ומטרות)

#### Q2.35: life_priorities — "Life Priorities" 🎯
**Type:** multi_select (**20 options**)
career, family, health, wealth, relationships, personal-growth, freedom, creativity, adventure, spirituality, contribution, peace, recognition, intimacy, independence, legacy, learning, leadership, pleasure, other

#### Q2.36: spiritual_practice — "Spiritual Practice" 🙏
**Type:** single_select
none, secular, traditional, religious, spiritual

#### Q2.37: growth_focus — "Where do you want to grow?" 🌱
**Type:** multi_select (**~55 options** across: Career, Money, Health, Mental, Relationships, Spirituality, Skills, Lifestyle)
*(Full list: career-purpose, career-advancement, entrepreneurship, work-leadership, work-life-balance, job-situation, increase-income, money-management, savings-investments, financial-blocks, business, weight-loss, muscle-building, energy-vitality, quality-sleep, nutrition, chronic-pain, quit-habits, confidence, emotional-regulation, anxiety, depression, trauma-healing, anger-release, self-awareness, resilience, find-partner, improve-relationship, communication-partner, parents-relationship, children-relationship, friendships, boundaries, forgiveness, find-meaning, self-connection, meditation-practice, spiritual-practice, values-ethics, life-purpose, discipline, time-management, communication, assertiveness, creativity, decision-making, problem-solving, fast-learning, focus, patience, home-organization, minimalism, find-hobbies, community-connection, quality-of-life, relocation, other)*

#### Q2.38: obstacles — "What stops you most from progressing?" 🚧
**Type:** multi_select (12 options)
fear-of-failure, low-confidence, no-time, dont-know-how, external, fear-of-change, fatigue, procrastination, perfectionism, self-doubt, fear-of-success, other

**Total Step 2 mini-steps: 38 questions (presented by section)**

---

## STEP 3: LIFESTYLE & ROUTINE (שגרת חיים)
**Component:** `LifestyleRoutineStep.tsx`
**DB Column:** `step_2_profile_data` (merged into profile JSON)
**Rewards:** 35 XP, 0 Tokens
**Sections:** 5 sections (Sleep, Work, Meals, Energy, Constraints)

### Section: Sleep

#### Q3.1: wake_time — "What time do you usually wake up?" 🌅
**Type:** time_picker (3:00–12:00)

#### Q3.2: sleep_time — "What time do you go to sleep?" 🌙
**Type:** time_picker (18:00–3:00)

#### Q3.3: sleep_quality — "How is your sleep quality?" 😴
**Type:** single_select
excellent, good, fair, poor, very-poor

### Section: Work

#### Q3.4: shift_work — "Do you work shifts?" 🔄
**Type:** single_select
no, fixed-shifts, rotating-shifts, night-shifts, flexible, not-working

#### Q3.5: work_start_time — "When do you start work?" 🌅
**Type:** time_picker (0:00–23:00)

#### Q3.6: work_end_time — "When do you finish work?" 🌆
**Type:** time_picker (0:00–23:00)

#### Q3.7: work_flexibility — "How flexible is your work?" 🏠
**Type:** single_select
very-flexible, somewhat-flexible, hybrid, fixed, demanding, not-applicable

### Section: Meals

#### Q3.8: breakfast_time — "When do you eat breakfast?" 🍳
**Type:** single_select
very-early, early, regular, late, skip, intermittent-fasting

#### Q3.9: lunch_time — "When do you eat lunch?" 🥗
**Type:** single_select
early, regular, late, skip, varies

#### Q3.10: dinner_time — "When do you eat dinner?" 🍽️
**Type:** single_select
early, regular, late, very-late, skip, varies

### Section: Energy

#### Q3.11: peak_productivity — "When are you most productive?" ⚡
**Type:** single_select
very-early-morning, early-morning, morning, midday, afternoon, evening, late-night

#### Q3.12: low_energy_time — "When do you feel most tired?" 🔋
**Type:** single_select
morning, mid-morning, after-lunch, late-afternoon, evening, consistent

### Section: Constraints

#### Q3.13: family_commitments — "Family Commitments" 👨‍👩‍👧‍👦
**Type:** multi_select
none, young-children, school-age-children, elderly-care, shared-custody, partner-needs, pet-care

#### Q3.14: special_constraints — "Special Constraints" ⚠️
**Type:** multi_select
none, health-condition, disability, mental-health, limited-mobility, chronic-fatigue, irregular-schedule, financial-constraints, living-situation

**Total Step 3 mini-steps: 14 questions**

---

## STEP 4: GROWTH DEEP DIVE (העמקה אישית)
**Component:** `GrowthDeepDiveStep.tsx`
**DB Column:** `step_2_profile_data.deep_dive` (nested in profile JSON)
**Rewards:** 35 XP, 0 Tokens
**Dynamic:** Shows follow-up questions for each area selected in Q2.37 (growth_focus), max 5 areas

### Follow-up questions per growth area (all multi_select):

#### confidence — "In which situations do you struggle most with self-confidence?"
new-people, at-work, in-relationship, decisions, criticism, public-speaking

#### find-partner — "What do you think prevents you from finding a partner?"
not-meeting-people, low-confidence, fear-rejection, past-trauma, dont-know-what-want, trust-issues

#### improve-relationship — "What affects your relationship the most?"
communication, intimacy, trust, conflicts, routine, different-goals

#### anxiety — "What triggers your anxiety the most?"
future, social, health, work, relationships, uncertainty

#### weight-loss — "What makes it hardest for you to lose weight?"
emotional-eating, no-time, motivation, cravings, consistency, knowledge

#### discipline — "What disrupts your consistency the most?"
distractions, motivation-dips, perfectionism, overwhelm, no-structure, giving-up

#### career-purpose — "What prevents you from finding your professional purpose?"
dont-know, fear-change, financial, too-many-options, lack-skills, self-doubt

#### increase-income — "What do you think limits your income?"
job-type, skills, fear-ask, mindset, no-opportunities, time-limits

#### parents-relationship — "What affects your relationship with your parents the most?"
old-patterns, expectations, communication, boundaries, past-hurt, distance

#### default (fallback for all other areas) — "What's most important for you to achieve in this area?"
quick-wins, deep-change, understanding, tools, support, accountability

**Total Step 4 mini-steps: 1–5 screens (depends on growth_focus selections)**

---

## STEP 5: FIRST CHAT WITH AURORA (שיחה ראשונה)
**Component:** `FirstChatStep.tsx`
**DB Column:** `step_2_summary` (JSON with messages, answers, questionIndex)
**Rewards:** 50 XP, 0 Tokens
**Type:** CUSTOM — Chat interface, 5 sequential open-ended questions

### Questions (free text, sequential):
1. **HE:** מה הדבר הכי חשוב לך בחיים כרגע? | **EN:** What is the most important thing to you in life right now?
2. **HE:** מה המכשול הגדול ביותר שאתה מרגיש שעוצר אותך? | **EN:** What is the biggest obstacle you feel is holding you back?
3. **HE:** איך נראה יום מושלם בשבילך? | **EN:** What does a perfect day look like for you?
4. **HE:** מה אתה מוכן לעשות כדי להשיג את השינוי הזה? | **EN:** What are you willing to do to achieve this change?
5. **HE:** מתי בפעם האחרונה הרגשת באמת מחובר לעצמך? | **EN:** When was the last time you felt truly connected to yourself?

After all 5 answers → AI generates summary via `aurora-chat` edge function.

---

## STEP 6: INTROSPECTION (התבוננות פנימית)
**Component:** `IntrospectionStep.tsx`
**DB Column:** `step_3_form_submission_id` → saves to `form_submissions` table
**Form ID:** `45dfc6a5-6f98-444b-a3dd-2c0dd1ca3308`
**Rewards:** 50 XP, 5 Tokens
**Type:** CUSTOM — 5 open-ended textarea questions (min 30 chars each, need ≥3 answered)
**AI Analysis:** Calls `analyze-introspection-form` edge function

### Questions (free text, collapsible sections):
1. **life_end** — "Life Endpoint" / `נקודת הסוף`
   - HE: דמיין שזה סוף החיים שלך. מי היית האדם שחי את החיים האלה? האם חיית באמת או שרדת?
   - EN: Imagine this is the end of your life. Who was the person who lived this life? Did you truly live or just survive?

2. **ideal_self** — "Ideal Self" / `האני האידיאלי`
   - HE: מי היית רוצה להיות כשאתה מסתכל אחורה? אדם שעמד מאחורי עצמו או אדם שוויתר?
   - EN: Who would you want to be looking back? Someone who stood by themselves or someone who gave up?

3. **inner_traits** — "Inner Traits" / `תכונות פנימיות`
   - HE: איך האדם שאתה רוצה להיות מתמודד עם פחד? איך הוא מגיב כשלא מבינים אותו?
   - EN: How does the person you want to be handle fear? How do they react when misunderstood?

4. **current_reality** — "Current Reality" / `המציאות הנוכחית`
   - HE: איפה אתה עכשיו בחיים? מה עובד ומה לא עובד? מה מרגיש תקוע?
   - EN: Where are you now in life? What works and what doesn't? What feels stuck?

5. **gap** — "The Gap" / `הפער`
   - HE: מה הפער בין מי שאתה היום למי שאתה רוצה להיות? מה מונע ממך לסגור אותו?
   - EN: What's the gap between who you are today and who you want to be? What's stopping you from closing it?

**Validation:** ≥3 questions answered, each ≥30 characters. Can skip entirely.

---

## STEP 7: LIFE PLAN / VISION & DIRECTION (חזון וכיוון)
**Component:** `LifePlanStep.tsx`
**DB Column:** `step_4_form_submission_id` → saves to `form_submissions` table
**Form ID:** `f2b4e2c6-40a8-4b8b-9a35-6a1e5c54a6f3`
**Rewards:** 100 XP, 10 Tokens
**Type:** CUSTOM — 6 open-ended textarea questions (min 20 chars each, need ≥3 answered)
**AI Analysis:** Calls `analyze-life-plan` edge function
**Also writes to:** `aurora_life_visions` table

### Questions (free text, collapsible sections):
1. **vision_3y** — "3-Year Vision" / `חזון 3 שנים`
   - HE: איך נראים החיים שלך בעוד 3 שנים?
   - EN: What does your life look like in 3 years?

2. **goals_12m** — "12 Months" / `12 חודשים`
   - HE: מה חייב לקרות השנה כדי שתרגיש שהתקדמת?
   - EN: What must happen this year for you to feel you've progressed?

3. **goals_90d** — "90 Days" / `90 ימים`
   - HE: מה היעדים המדידים שלך ל-90 הימים הקרובים?
   - EN: What are your measurable goals for the next 90 days?

4. **identity** — "Required Identity" / `זהות נדרשת`
   - HE: מי אתה צריך להיות כדי שזה יקרה?
   - EN: Who do you need to be for this to happen?

5. **systems** — "Life Systems" / `מערכות חיים`
   - HE: איך נראים השינה, התזונה, התנועה, והעבודה שלך?
   - EN: What does your sleep, nutrition, movement, and work look like?

6. **risks** — "Constraints & Risks" / `אילוצים וסיכונים`
   - HE: מה עלול להפיל אותך ומה תעשה כשזה יקרה?
   - EN: What might derail you and what will you do when it happens?

**Validation:** ≥3 sections filled, each ≥20 characters. Can skip entirely.

---

## STEP 8: FOCUS AREAS (תחומי פוקוס)
**Component:** `FocusAreasStep.tsx`
**DB Column:** `step_5_focus_areas_selected` (string array)
**Rewards:** 50 XP, 0 Tokens
**Type:** multi_select, MUST select exactly 3

| Value | Hebrew | English | Icon |
|-------|--------|---------|------|
| health | בריאות וגוף | Health & Body | 💪 |
| money | כסף ושפע | Money & Abundance | 💰 |
| mind | תודעה ומיינד | Mind & Consciousness | 🧠 |
| relationships | זוגיות ומערכות יחסים | Relationships | ❤️ |
| career | קריירה ועבודה | Career & Work | 💼 |
| creativity | יצירה והבעה | Creativity & Expression | 🎨 |
| social | חברה וקהילה | Social & Community | 👥 |
| spirituality | רוחניות ומשמעות | Spirituality & Meaning | ✨ |

**Validation:** Exactly 3 selected. Oldest replaced if 4th selected.

---

## STEP 9: FIRST WEEK (שבוע ראשון)
**Component:** `FirstWeekStep.tsx`
**DB Column:** `step_6_actions` (JSON object)
**Rewards:** 75 XP, 0 Tokens
**4 sections, presented sequentially**

### Section 1: Habits to Quit (multi_select, ≥1 required)
**38 options** across categories:

**Substances & Addictions:**
alcohol, drugs, cannabis, smoking, caffeine, sugar, gambling, porn, gaming

**Harmful Behaviors:**
scrolling, procrastination, binge_watching, emotional_eating, junk_food, late_nights, wasted_time, compulsive_shopping

**Mental Patterns:**
negative_self_talk, complaining, comparison, excessive_worry, perfectionism, overthinking

**Relationships:**
toxic_relationships, conflict_avoidance, not_listening, gossip, self_isolation, codependency

**Financial:**
reckless_spending, living_beyond_means, financial_avoidance

**Other:**
chronic_lateness, small_lies, anger_outbursts, saying_yes_always

### Section 2: Habits to Build (multi_select, ≥1 required)
**35 options** across categories:

**Routines & Structure:**
morning_routine, weekly_planning, daily_goals, task_completion, saying_no, daily_review

**Body & Health:**
daily_exercise, drinking_water, healthy_eating, quality_sleep, cold_exposure, medical_checkups

**Learning & Development:**
daily_learning, reading, podcasts, new_language, courses

**Business & Career:**
work_on_business, skill_practice, networking, client_outreach, documenting_ideas

**Mental & Emotional:**
meditation, journaling, gratitude, mental_blocks, stress_management

**Relationships:**
family_time, relationship_investment, active_listening, honest_communication, volunteering

**Financial:**
expense_tracking, regular_saving, learning_investing, additional_income

### Section 3: Career Status (single_select, required)
| Value | Hebrew | English | Icon |
|-------|--------|---------|------|
| employee_happy | שכיר מרוצה | Happy employee | 😊 |
| employee_unhappy | שכיר לא מרוצה | Unhappy employee | 😔 |
| freelancer | עצמאי / פרילנסר | Freelancer | 💼 |
| early_entrepreneur | יזם בתחילת הדרך | Early-stage entrepreneur | 🌱 |
| small_business | בעל עסק קטן | Small business owner | 🏪 |
| growing_business | בעל עסק בצמיחה | Growing business owner | 📈 |
| job_seeker | מחפש עבודה | Job seeker | 🔍 |
| student | סטודנט | Student | 🎓 |

### Section 4: Career Goal (single_select, required)
| Value | Hebrew | English | Icon |
|-------|--------|---------|------|
| start_business | לפתוח עסק עצמאי | Start my own business | 🚀 |
| grow_business | לצמוח בעסק הקיים | Grow my existing business | 📊 |
| change_career | להחליף מקצוע/קריירה | Change career | 🔄 |
| get_promoted | להתקדם בארגון | Get promoted | ⬆️ |
| earn_more | להרוויח יותר | Earn more money | 💰 |
| freedom | חופש וגמישות | Freedom & flexibility | 🦅 |
| leadership | השפעה ומנהיגות | Influence & leadership | 👑 |
| passive_income | הכנסה פסיבית | Passive income | 💎 |

**Total Step 9 mini-steps: 4 sections**

---

## STEP 10: FINAL NOTES (הערות נוספות)
**Component:** `FinalNotesStep.tsx`
**DB Column:** stored via auto-save
**Rewards:** 25 XP, 0 Tokens
**Type:** Free text textarea (optional, can skip)

**Prompt suggestions shown:**
- 💡 Health limitations we should know about
- 🏠 Special life situations (moving, birth, divorce...)
- ⏰ Time constraints or special schedule
- 🎯 Things Aurora should know about you
- 💬 Any other notes or requests

**Validation:** None. Can submit empty or skip entirely.

---

## STEP 11: DASHBOARD ACTIVATION (הפעלת הדשבורד)
**Component:** `DashboardActivation.tsx`
**Rewards:** 100 XP, 25 Tokens
**Type:** CUSTOM — No questions. CTA button only.
**Auth Gate:** If not logged in, shows AuthModal (signup). If logged in, calls `generate-launchpad-summary` edge function.

**Unlocks displayed:**
- 🧭 Life OS Dashboard
- 📊 Weekly Planning
- 🎯 Focus Plans
- ⚓ Daily Anchors
- 🧘 Hypnosis
- 🤖 Aurora Coaching

---

## SUMMARY COUNTS

| Step | Component | Questions | Input Types | DB Column |
|------|-----------|-----------|-------------|-----------|
| 1 | WelcomeStep | 16 (4 always + 12 conditional) | multi_select | step_1_intention |
| 2 | PersonalProfileStep | 38 (incl. 2 sliders) | single/multi_select, slider | step_2_profile_data |
| 3 | LifestyleRoutineStep | 14 | single_select, time_picker | step_2_profile_data (merged) |
| 4 | GrowthDeepDiveStep | 1–5 (dynamic) | multi_select | step_2_profile_data.deep_dive |
| 5 | FirstChatStep | 5 | free_text (chat) | step_2_summary |
| 6 | IntrospectionStep | 5 | free_text (textarea) | step_3_form_submission_id |
| 7 | LifePlanStep | 6 | free_text (textarea) | step_4_form_submission_id |
| 8 | FocusAreasStep | 1 | multi_select (pick 3) | step_5_focus_areas_selected |
| 9 | FirstWeekStep | 4 sections | multi/single_select | step_6_actions |
| 10 | FinalNotesStep | 1 | free_text (optional) | auto-save |
| 11 | DashboardActivation | 0 (CTA only) | button | step_7_dashboard_activated |
| **TOTAL** | | **~91–107 screens** | | |

---

## DB COLUMN MAPPING (UI Step → DB Column)

| UI Step | DB Boolean Column | DB Data Column |
|---------|-------------------|----------------|
| 1 | step_1_welcome | step_1_intention |
| 2 | step_2_profile | step_2_profile_data |
| 3 | (merged into step 2) | step_2_profile_data |
| 4 | (merged into step 2) | step_2_profile_data.deep_dive |
| 5 | step_2_first_chat | step_2_summary |
| 6 | step_3_introspection | step_3_form_submission_id |
| 7 | step_4_life_plan | step_4_form_submission_id |
| 8 | step_5_focus_areas | step_5_focus_areas_selected |
| 9 | step_6_first_week | step_6_actions |
| 10 | (no dedicated column) | auto-save |
| 11 | step_7_dashboard_activated | step_7_completed_at |
