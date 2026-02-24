
# מערכת תבניות ביצוע (Execution Templates)

## הבעיה הנוכחית

כל המשימות מסווגות ב-runtime על ידי regex שמנסה לנחש מה סוג המשימה. זה גורם ל:
- משימות מדיטציה שמופיעות כצ'קליסט רגיל
- משימות עסקיות שמקבלות תבנית חשיפה לקור
- כל דבר שלא מזוהה נופל ל-3 שלבים גנריים ("הכנה / ביצוע / סגירה")

## הפתרון: תבניות קבועות מראש

כל משימה תקבל **סוג תבנית** (`execution_template`) כבר ברגע שהאסטרטגיה נוצרת. כשהמשתמש לוחץ על משימה, המודל יודע מיד איזה חוויה להציג.

### 6 תבניות ביצוע

| תבנית | מתי | מה קורה במודל |
|--------|------|----------------|
| `tts_guided` | מדיטציה, סריקת גוף, נשימות, ויזואליזציה, הרפיה | אורב + עיגול נשימה + סקריפט TTS מונחה (כמו מודל ההיפנוזה) — AI מייצר סקריפט מותאם בזמן אמת |
| `video_embed` | יוגה, טאי צ'י, צ'יגונג, פילאטיס, מתיחות | סרטון YouTube משובץ + צ'קליסט שלבים מתחת |
| `sets_reps_timer` | אימון כוח, לחימה, HIIT, shadowboxing | טיימר סטים/חזרות עם מנוחות — ספירה אוטומטית, רטט בין סטים |
| `step_by_step` | טיפוח, בישול, ניקיון, יומן, קריאה | רשימת שלבים אינטראקטיבית עם הסבר מפורט לכל שלב |
| `timer_focus` | עבודה עמוקה, למידה, פרויקט, עסקים | טיימר Pomodoro + מסך ריכוז מינימלי (אין הסחות) |
| `social_checklist` | יחסים, נטוורקינג, שיחות, נוכחות | צ'קליסט + טיפים חברתיים + תזכורת סגירה |

### איך זה עובד

```text
generate-90day-strategy (Layer 3)
  --> כל daily_action מקבל execution_template + action_type
  --> נשמר ב-plan_data

generate-today-queue
  --> מעביר את execution_template ל-QueueItem
  --> אם חסר (תוכניות ישנות) --> קובע לפי pillar + actionType

ExecutionModal
  --> קורא action.executionTemplate
  --> מפעיל את הקומפוננטה המתאימה:

     tts_guided     --> TTS + Orb + BreathingGuide + AI Script
     video_embed    --> YouTube iframe + steps
     sets_reps_timer --> WorkoutTimer (חדש) עם סטים/מנוחות/רטט
     step_by_step   --> StepWizard (חדש) עם הסברים מפורטים
     timer_focus    --> FocusTimer (חדש) בסגנון Pomodoro
     social_checklist --> צ'קליסט + טיפים
```

## פירוט טכני

### 1. שינוי ב-`generate-90day-strategy` (Layer 3 Prompt)

הוספת שדה `execution_template` ו-`action_type` לכל mini-milestone ב-Layer 3 Prompt:

```text
## RULES:
- Each mini-milestone MUST include:
  - execution_template: one of "tts_guided", "video_embed", 
    "sets_reps_timer", "step_by_step", "timer_focus", "social_checklist"
  - action_type: specific activity identifier (e.g. "body_scan", 
    "shadowboxing_3_rounds", "deep_work_45min")
```

Mapping rules בפרומפט:
- Focus pillar (meditation, breathwork, body scan) --> `tts_guided`
- Focus pillar (tai chi, yoga, qigong) --> `video_embed`  
- Combat/Power pillar (training, sets, reps) --> `sets_reps_timer`
- Vitality (skincare, nutrition, sleep protocol) --> `step_by_step`
- Expansion (reading, learning, courses) --> `timer_focus`
- Wealth/Business/Projects --> `timer_focus`
- Relationships/Influence/Presence --> `social_checklist`
- Consciousness (journaling, reflection) --> `step_by_step`
- Play --> `step_by_step`

### 2. שינוי ב-`generate-today-queue`

- הוספת `executionTemplate` ל-`QueueItem` interface
- העברת השדה מה-strategy data
- Fallback mapping: אם תוכנית ישנה בלי template --> מיפוי לפי pillar

### 3. שינוי ב-`useNowEngine.ts`

הוספת `executionTemplate` ל-`NowQueueItem` interface:
```typescript
executionTemplate?: 'tts_guided' | 'video_embed' | 'sets_reps_timer' | 
                    'step_by_step' | 'timer_focus' | 'social_checklist';
```

### 4. שדרוג `ExecutionModal.tsx`

**מבנה חדש** — במקום 3 מצבים (voice/youtube/workout), 6 תבניות:

**`tts_guided`** (קיים — שדרוג):
- שימוש באורב + BreathingGuide (כמו עכשיו)
- חדש: קריאה ל-AI gateway ליצירת סקריפט TTS מותאם אישית בזמן אמת (כמו במודל ההיפנוזה) במקום סקריפטים סטטיים
- Fallback: סקריפטים מקומיים אם AI לא זמין

**`video_embed`** (קיים — ללא שינוי):
- YouTube iframe + צ'קליסט

**`sets_reps_timer`** (חדש):
- תצוגת "Round X / Y" עם טיימר גדול
- כפתור "סיים סט" שמעביר לסט הבא
- טיימר מנוחה בין סטים (30-90 שניות) עם ספירה לאחור
- רטט (haptics) בסיום מנוחה
- שלבי האימון מגיעים מ-executionSteps

**`step_by_step`** (קיים — שדרוג):
- כמו workout mode אבל ללא באנר מוטיבציוני של לחימה
- כל שלב עם הסבר מפורט
- כפתור "הבא" שמסמן ועובר לשלב הבא

**`timer_focus`** (חדש):
- מסך מינימלי: טיימר גדול + שם המשימה
- כפתור Start/Pause
- ללא הסחות — רקע כהה
- צליל/רטט בסיום

**`social_checklist`** (חדש):
- צ'קליסט שלבים (הכנה, שיחה, סגירה)
- טיפ חברתי רנדומלי בראש ("הקשב יותר ממה שאתה מדבר")

### 5. קבצים שישתנו

| קובץ | שינוי |
|-------|-------|
| `supabase/functions/generate-90day-strategy/index.ts` | Layer 3 prompt: הוספת `execution_template` + `action_type` |
| `supabase/functions/generate-today-queue/index.ts` | העברת template + fallback mapping |
| `src/hooks/useNowEngine.ts` | הוספת `executionTemplate` ל-interface |
| `src/components/dashboard/ExecutionModal.tsx` | 6 rendering modes + WorkoutTimer + FocusTimer |

### 6. תאימות לאחור

- תוכניות קיימות ללא `execution_template` --> הגדרה אוטומטית לפי pillar ו-actionType
- כל הלוגיקה הקיימת נשמרת כ-fallback
- תוכניות חדשות (אחרי כיול מחדש) יכללו את ה-template מובנה
