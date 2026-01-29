
# מערכת Launchpad + Progression + Life OS

## מצב נוכחי - מה כבר קיים

### מערכת הגיימיפיקציה (Libero)
```text
┌─────────────────────────────────────────────────────────┐
│  profiles table                                          │
│  ├── level (1-based, Level = floor(XP/100) + 1)         │
│  ├── experience (XP accumulator)                        │
│  ├── tokens (currency, +5 per level)                    │
│  ├── session_streak (consecutive days)                  │
│  ├── last_session_date                                  │
│  ├── active_ego_state (guardian, rebel, healer...)     │
│  └── ego_state_usage (JSON usage map)                   │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  XP Sources (via award_unified_xp / aurora_award_xp)    │
│  ├── coaching messages: 5 XP                            │
│  ├── extracted insights: 15 XP                          │
│  ├── checklist items: 10 XP                             │
│  ├── daily chat bonus: 25 XP                            │
│  └── hypnosis sessions: variable                        │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  Achievements System                                     │
│  ├── session-based: 1, 10, 50, 100 sessions             │
│  ├── streak-based: 3, 7, 14, 30, 100 days               │
│  ├── ego states: 3, 6, 12 different states used         │
│  ├── duration: 1hr, 10hrs total                         │
│  └── level milestones: 5, 10, 25, 50                    │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  12 Ego States                                           │
│  Guardian, Rebel, Healer, Explorer, Mystic, Warrior,    │
│  Sage, Creator, Lover, Child, Shadow, Transformer       │
│  (each with unique colors & gradient theme)             │
└─────────────────────────────────────────────────────────┘
```

### מערכת Aurora Life Model
```text
┌─────────────────────────────────────────────────────────┐
│  aurora_life_direction                                   │
│  ├── content (הכיוון בחיים)                             │
│  └── clarity_score (0-100)                              │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  aurora_identity_elements                                │
│  ├── value (ערכים)                                      │
│  ├── principle (עקרונות)                                │
│  ├── self_concept (תפיסה עצמית)                        │
│  └── vision_statement (חזון)                            │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  aurora_energy_patterns (sleep, nutrition, movement)    │
│  aurora_behavioral_patterns (focus, avoidance, etc.)    │
│  aurora_focus_plans (active plans with duration)        │
│  aurora_daily_minimums (daily anchors)                  │
│  aurora_commitments (active commitments)                │
│  aurora_life_visions (5yr, 10yr)                        │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  aurora_onboarding_progress                              │
│  ├── direction_clarity: incomplete → emerging → stable  │
│  ├── identity_understanding: shallow → partial → clear  │
│  └── energy_patterns_status: unknown → partial → mapped │
└─────────────────────────────────────────────────────────┘
```

### שאלון קיים
- **מסע התבוננות פנימית** - שאלון חינמי עם ניתוח AI
- גם שאלונים נוספים (מערכת custom_forms)

---

## הארכיטקטורה החדשה

### 1. מבנה Launchpad (7 שלבים)

```text
┌─────────────────────────────────────────────────────────────────┐
│                      LAUNCHPAD STEPS                             │
├─────────────────────────────────────────────────────────────────┤
│  Step 1: ברוך הבא (25 XP)                                       │
│  ├── משתמש כותב 2-3 משפטים: "מה אני רוצה"                      │
│  ├── Aurora שומרת כ-initial_intention                           │
│  └── Unlock: גישה לצ'אט מלא                                      │
├─────────────────────────────────────────────────────────────────┤
│  Step 2: שיחה ראשונה עם AI (50 XP)                              │
│  ├── Aurora שואלת 5 שאלות קצרות                                 │
│  ├── מחזירה "תקציר התחלתי"                                      │
│  └── Unlock: שאלון התבוננות                                      │
├─────────────────────────────────────────────────────────────────┤
│  Step 3: מסע התבוננות פנימית (100 XP)                           │
│  ├── שאלון קיים עם AI Analysis                                  │
│  ├── 3 תובנות + 3 נקודות עיוורון                                │
│  └── Unlock: שאלון תוכנית חיים + 10 tokens                      │
├─────────────────────────────────────────────────────────────────┤
│  Step 4: שאלון תוכנית חיים (100 XP) [חדש]                       │
│  ├── חזון 3 שנים, 12 חודשים, 90 יום                              │
│  ├── AI מייצר Life Blueprint v1                                  │
│  └── Unlock: בחירת תחומי פוקוס + 15 tokens                       │
├─────────────────────────────────────────────────────────────────┤
│  Step 5: בחירת 3 תחומי פוקוס (50 XP)                            │
│  ├── כסף / גוף / תודעה / זוגיות / קריירה / יצירה / חברה         │
│  └── Unlock: הגדרת שבוע ראשון                                    │
├─────────────────────────────────────────────────────────────────┤
│  Step 6: שבוע ראשון (75 XP)                                     │
│  ├── 3 פעולות קטנות                                             │
│  ├── 1 הרגל עוגן                                                 │
│  └── Unlock: הדשבורד המלא                                        │
├─────────────────────────────────────────────────────────────────┤
│  Step 7: הפעלת דשבורד (100 XP + 25 tokens)                      │
│  ├── "Aurora יודעת מספיק לבנות מודל חיים"                        │
│  └── Unlock: Life OS Dashboard + כל היכולות                      │
└─────────────────────────────────────────────────────────────────┘
                    סה"כ Launchpad: 500 XP + 50 tokens
                    = Level 5-6 כשמסיים Launchpad
```

### 2. מערכת רמות מבוססת יכולת

```text
┌─────────────────────────────────────────────────────────────────┐
│  TIER 1: CLARITY (Levels 1-3)                                   │
│  ├── Launchpad Steps 1-4                                        │
│  ├── שאלוני בסיס                                                │
│  └── Features Unlocked:                                         │
│      ├── Aurora Chat (basic)                                    │
│      ├── Daily Check-in                                         │
│      └── Initial Life Model                                     │
├─────────────────────────────────────────────────────────────────┤
│  TIER 2: STRUCTURE (Levels 4-6)                                 │
│  ├── Launchpad Complete                                         │
│  ├── דשבורד פעיל                                                │
│  └── Features Unlocked:                                         │
│      ├── Weekly Planning                                        │
│      ├── Focus Plans                                            │
│      ├── Daily Anchors                                          │
│      └── Basic Hypnosis Sessions                                │
├─────────────────────────────────────────────────────────────────┤
│  TIER 3: CONSISTENCY (Levels 7-9)                               │
│  ├── 7+ day streak achieved                                     │
│  ├── הרגלים פעילים                                              │
│  └── Features Unlocked:                                         │
│      ├── Advanced Hypnosis (all ego states)                     │
│      ├── Metrics & Analytics                                    │
│      ├── Pattern Analysis                                       │
│      └── Community Access (if exists)                           │
├─────────────────────────────────────────────────────────────────┤
│  TIER 4: MASTERY (Levels 10+)                                   │
│  ├── Long-term engagement                                       │
│  ├── פרויקטים ורפלקציה                                         │
│  └── Features Unlocked:                                         │
│      ├── Life Review Sessions                                   │
│      ├── Advanced AI Coaching                                   │
│      ├── Export & Reports                                       │
│      └── Premium Content                                        │
└─────────────────────────────────────────────────────────────────┘
```

### 3. מערכת 5 שאלונים

```text
┌─────────────────────────────────────────────────────────────────┐
│  QUESTIONNAIRE SYSTEM                                            │
├─────────────────────────────────────────────────────────────────┤
│  Q1: התבוננות פנימית (קיים) ✅                                  │
│  ├── מודעות עצמית                                               │
│  ├── דפוסי חשיבה                                                │
│  └── Output: consciousness_state, patterns, blindspots          │
├─────────────────────────────────────────────────────────────────┤
│  Q2: תוכנית חיים / חזון (חדש)                                   │
│  ├── חזון 3 שנים                                                 │
│  ├── 12 חודשים                                                   │
│  ├── 90 ימים                                                     │
│  ├── זהות נדרשת                                                  │
│  ├── מערכות חיים                                                 │
│  └── Output: life_blueprint, goals_90d, anchor_habit            │
├─────────────────────────────────────────────────────────────────┤
│  Q3: ערכים וכללים פנימיים (חדש)                                 │
│  ├── מה חשוב לי                                                  │
│  ├── על מה לא מתפשרים                                           │
│  ├── חוקי חיים                                                   │
│  └── Output: values[], principles[], non_negotiables[]          │
├─────────────────────────────────────────────────────────────────┤
│  Q4: מיפוי הרגלים והתנהגות (חדש)                                │
│  ├── שינה, תזונה, תנועה                                          │
│  ├── עבודה ופרודוקטיביות                                        │
│  ├── הסחות והתמכרויות דיגיטליות                                 │
│  └── Output: energy_patterns[], habits[], distractions[]        │
├─────────────────────────────────────────────────────────────────┤
│  Q5: חסמים ודפוסים (חדש)                                        │
│  ├── פחדים                                                       │
│  ├── דחיינות וטריגרים                                           │
│  ├── מנגנוני בריחה                                              │
│  ├── אמונות מגבילות                                             │
│  └── Output: fears[], triggers[], beliefs[], patterns[]         │
└─────────────────────────────────────────────────────────────────┘
```

### 4. AI Output אחיד לכל שאלון

```typescript
interface QuestionnaireAnalysis {
  summary: string;           // 5-7 שורות
  key_insights: string[];    // 3 תובנות
  blindspots: string[];      // 3 נקודות עיוורון
  goals_suggested: Goal[];   // עד 5 מטרות
  habits_suggested: Habit[]; // עד 5 הרגלים
  next_actions: Action[];    // 3 פעולות לשבוע
  tags: string[];            // תחומים: health, money, mind...
  
  // Updates to Life Model
  life_model_updates: {
    life_direction?: { content: string; clarity_score: number };
    identity_elements?: IdentityElement[];
    energy_patterns?: EnergyPattern[];
    behavioral_patterns?: BehavioralPattern[];
  };
}
```

---

## שינויים טכניים נדרשים

### Phase 1: Database Schema

```sql
-- Launchpad Progress Table
CREATE TABLE launchpad_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  
  -- Steps (1-7)
  step_1_welcome BOOLEAN DEFAULT FALSE,
  step_1_completed_at TIMESTAMPTZ,
  
  step_2_first_chat BOOLEAN DEFAULT FALSE,
  step_2_completed_at TIMESTAMPTZ,
  
  step_3_introspection BOOLEAN DEFAULT FALSE,
  step_3_completed_at TIMESTAMPTZ,
  
  step_4_life_plan BOOLEAN DEFAULT FALSE,
  step_4_completed_at TIMESTAMPTZ,
  
  step_5_focus_areas BOOLEAN DEFAULT FALSE,
  step_5_focus_areas_selected JSONB, -- ["health", "money", "mind"]
  step_5_completed_at TIMESTAMPTZ,
  
  step_6_first_week BOOLEAN DEFAULT FALSE,
  step_6_completed_at TIMESTAMPTZ,
  
  step_7_dashboard_activated BOOLEAN DEFAULT FALSE,
  step_7_completed_at TIMESTAMPTZ,
  
  launchpad_complete BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Tier/Feature Unlocks
CREATE TABLE user_feature_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  unlock_reason TEXT,
  UNIQUE(user_id, feature_key)
);

-- Questionnaire Completions
CREATE TABLE questionnaire_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  questionnaire_type TEXT NOT NULL, -- introspection, life_plan, values, habits, blockers
  form_submission_id UUID,
  analysis JSONB,
  xp_awarded INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Phase 2: New Components

```text
src/components/launchpad/
├── LaunchpadFlow.tsx           # Main flow controller
├── LaunchpadStep.tsx           # Single step component
├── LaunchpadProgress.tsx       # Progress indicator
├── steps/
│   ├── WelcomeStep.tsx         # Step 1
│   ├── FirstChatStep.tsx       # Step 2
│   ├── IntrospectionStep.tsx   # Step 3
│   ├── LifePlanStep.tsx        # Step 4
│   ├── FocusAreasStep.tsx      # Step 5
│   ├── FirstWeekStep.tsx       # Step 6
│   └── DashboardActivation.tsx # Step 7
└── hooks/
    └── useLaunchpadProgress.ts
```

### Phase 3: New Questionnaires

Create 4 new forms via admin interface with AI analysis:
1. **שאלון תוכנית חיים** - 6 sections, ~25 questions
2. **שאלון ערכים וכללים** - 4 sections, ~15 questions
3. **שאלון מיפוי הרגלים** - 5 sections, ~20 questions
4. **שאלון חסמים ודפוסים** - 5 sections, ~20 questions

### Phase 4: Edge Function for Questionnaire Analysis

```typescript
// supabase/functions/analyze-questionnaire/index.ts
// Generic function that handles all questionnaire types
// Uses tool calling for structured output
// Updates life model based on questionnaire type
```

### Phase 5: Feature Gating

```typescript
// src/hooks/useFeatureAccess.ts
export function useFeatureAccess() {
  const { user } = useAuth();
  const { gameState } = useGameState();
  const { data: unlocks } = useQuery(...);
  const { data: launchpad } = useLaunchpadProgress();
  
  const canAccess = (feature: string) => {
    // Check level requirements
    // Check launchpad requirements
    // Check explicit unlocks
  };
  
  return { canAccess, tier, unlockedFeatures };
}
```

### Phase 6: Updated Dashboard

The UnifiedDashboardView will show:
- Launchpad progress (if not complete)
- Current tier badge
- Next unlock preview
- Full Life Model when activated

---

## XP Distribution Summary

| פעולה | XP | Tokens |
|-------|-----|--------|
| Launchpad Step 1 | 25 | - |
| Launchpad Step 2 | 50 | - |
| Launchpad Step 3 | 100 | 10 |
| Launchpad Step 4 | 100 | 15 |
| Launchpad Step 5 | 50 | - |
| Launchpad Step 6 | 75 | - |
| Launchpad Step 7 | 100 | 25 |
| Daily Chat | 25 | - |
| Coaching Message | 5 | - |
| Insight Extracted | 15 | - |
| Checklist Item | 10 | - |
| Hypnosis Session | Variable | - |
| Weekly Plan Complete | 50 | 5 |
| Streak 7 days | 100 | 10 |
| Streak 30 days | 500 | 50 |

---

## Data Flow

```text
┌──────────────────────────────────────────────────────────────────┐
│                     USER JOURNEY                                  │
├──────────────────────────────────────────────────────────────────┤
│  NEW USER                                                         │
│      │                                                            │
│      ▼                                                            │
│  ┌──────────────────────┐                                        │
│  │   LAUNCHPAD (7 steps) │ ──► XP + Tokens + Feature Unlocks     │
│  └──────────────────────┘                                        │
│      │                                                            │
│      ▼                                                            │
│  ┌──────────────────────┐                                        │
│  │    QUESTIONNAIRES    │ ──► AI Analysis ──► Life Model Updates │
│  │    (5 core forms)    │                                        │
│  └──────────────────────┘                                        │
│      │                                                            │
│      ▼                                                            │
│  ┌──────────────────────┐                                        │
│  │   LIFE OS DASHBOARD  │                                        │
│  │   ├── Focus Plans    │                                        │
│  │   ├── Daily Anchors  │                                        │
│  │   ├── Weekly Tasks   │                                        │
│  │   ├── Metrics        │                                        │
│  │   └── AI Coaching    │                                        │
│  └──────────────────────┘                                        │
│      │                                                            │
│      ▼                                                            │
│  ┌──────────────────────┐                                        │
│  │   ONGOING ENGAGEMENT │                                        │
│  │   ├── Daily Check-in │ ──► Streak + XP                        │
│  │   ├── Aurora Chat    │ ──► Insights ──► Life Model            │
│  │   ├── Hypnosis       │ ──► XP + Ego State Usage              │
│  │   └── Weekly Review  │ ──► Plan Adjustments                   │
│  └──────────────────────┘                                        │
└──────────────────────────────────────────────────────────────────┘
```

---

## Implementation Priority

1. **Database: Launchpad tables** - שעה
2. **useLaunchpadProgress hook** - שעה
3. **LaunchpadFlow + 7 step components** - 3-4 שעות
4. **Feature gating system** - 2 שעות
5. **שאלון תוכנית חיים (Q2)** - 2 שעות (form + AI analysis)
6. **Integration with Aurora welcome flow** - שעה
7. **Dashboard updates for Launchpad** - שעה

סה"כ: ~12 שעות עבודה למימוש מלא

---

## Notes

- ה-Launchpad משתלב עם Aurora כ"שיחה ראשונה מודרכת"
- כל שלב ב-Launchpad נותן Unlock מוחשי שמרגיש כמו משחק
- השאלונים נבנים דרך מערכת ה-Forms הקיימת עם AI analysis חדש
- ה-Dashboard המאוחד (UnifiedDashboardView) כבר קיים - רק צריך להוסיף Launchpad section
