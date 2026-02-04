
# Health Hub Enhancement Plan
## תיקון טקסט + תוכנית בריאות 90 יום

---

## חלק 1: תיקון תצוגת הטקסט (Text Truncation Fix)

### הבעיה הנוכחית
הכרטיסים ב-HealthToolsGrid חותכים את הטקסט עם "..." בגלל:
1. `truncate` על הכותרת (שורה 145)
2. `line-clamp-1` על התיאור (שורה 148)
3. גובה קבוע בפריסת 4 עמודות

### הפתרון
- הסרת `truncate` מהכותרת
- שינוי `line-clamp-1` ל-`line-clamp-2` בתיאור
- הקטנת גודל הפונט לכותרת (`text-xs` במקום `text-sm`)
- הוספת גובה מינימלי קבוע לכל כרטיס

### שינויים ב-HealthToolsGrid.tsx

```typescript
// שורה 145 - הסרת truncate
<h3 className="font-semibold text-xs text-foreground leading-tight">
  {language === 'he' ? tool.titleHe : tool.titleEn}
</h3>

// שורה 148 - שינוי ל-2 שורות
<p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-tight">
  {language === 'he' ? tool.descHe : tool.descEn}
</p>
```

---

## חלק 2: תוכנית 90 יום לבריאות (Health 90-Day Plan)

### ארכיטקטורה

```text
+---------------------+     +----------------------+     +------------------+
|   Health Hub Page   | --> | Health Journey (NEW) | --> | Health 90-Day    |
|   /health           |     | 8-Step Assessment    |     | Plan Generation  |
+---------------------+     +----------------------+     +------------------+
         |                            |                          |
         v                            v                          v
  [Start Health         [Collect Deep Health        [AI Generates 12
   Journey Button]       Profile Data]               Weekly Milestones]
                                                            |
                                                            v
                                                  [Store in life_plans
                                                   + life_plan_milestones
                                                   with category='health']
```

### מסע הבריאות (Health Journey) - 8 שלבים

| שלב | נושא | מה נאסף |
|-----|------|---------|
| 1 | חזון בריאות | איך אתה רוצה להרגיש בעוד 90 יום? |
| 2 | מצב נוכחי | רמת אנרגיה, איכות שינה, כאבים |
| 3 | תזונה | הרגלי אכילה, אלרגיות, מים |
| 4 | פעילות גופנית | סוג תרגול, תדירות, מגבלות |
| 5 | שינה ומנוחה | שעות, איכות, בעיות |
| 6 | מתח ורגש | רמת סטרס, טריגרים, התמודדות |
| 7 | אמונות מגבילות | חסמים תת-מודעים לגבי בריאות |
| 8 | סיכום והפעלה | AI מייצר תוכנית מותאמת |

---

## קבצים חדשים ליצירה

### 1. Edge Function - generate-health-plan
`supabase/functions/generate-health-plan/index.ts`

```typescript
// פונקציה שמקבלת את נתוני מסע הבריאות
// ומחזירה תוכנית 90 יום עם 12 אבני דרך
// התמקדות: שינה, תזונה, תנועה, מנוחה נפשית
```

### 2. Health Journey Component
`src/components/health-hub/journey/HealthJourney.tsx`

```typescript
// דומה ל-BusinessJourney אבל עם 8 שלבים ממוקדי בריאות
// עיצוב: גרדיאנט אדום-ורוד (מתאים ל-Health Hub)
// גיימיפיקציה: XP על כל שלב שהושלם
```

### 3. Health Journey Steps
```text
src/components/health-hub/journey/
├── steps/
│   ├── HealthVisionStep.tsx      // שלב 1
│   ├── CurrentStateStep.tsx      // שלב 2
│   ├── NutritionStep.tsx         // שלב 3
│   ├── ExerciseStep.tsx          // שלב 4
│   ├── SleepStep.tsx             // שלב 5
│   ├── StressStep.tsx            // שלב 6
│   ├── BeliefsStep.tsx           // שלב 7
│   └── ActivationStep.tsx        // שלב 8 (סיכום)
└── useHealthJourney.ts           // Hook לניהול מצב
```

### 4. Route חדש
`/health/journey` - מסע הבריאות

### 5. דף תוכנית 90 יום לבריאות
`src/pages/HealthPlan.tsx`

```typescript
// דומה ל-LifePlan.tsx אבל ממוקד בבריאות
// מציג רק את התוכניות עם focus_area='health'
// או תוכניות שנוצרו מ-Health Journey
```

---

## שינויים בקבצים קיימים

### Health.tsx
```typescript
// הוספת כפתור "התחל מסע בריאות" בהדר
// דומה ל-Business Hub

<Button onClick={() => navigate('/health/journey')}>
  <Rocket className="w-4 h-4 me-2" />
  {language === 'he' ? 'התחל מסע בריאות' : 'Start Health Journey'}
</Button>

// הוספת סקשן "תוכנית 90 יום" אם קיימת
<HealthPlanPreview />
```

### HealthToolsGrid.tsx
```typescript
// הוספת כפתור לתוכנית 90 יום
{
  id: 'health-plan',
  icon: Calendar,
  titleHe: 'תוכנית 90 יום',
  titleEn: '90-Day Health Plan',
  descHe: 'מפת דרכים לבריאות מיטבית',
  descEn: 'Roadmap to optimal health',
  onClick: () => navigate('/health/plan'),
}
```

---

## סכמת מסד הנתונים

### שימוש בטבלאות קיימות
נשתמש ב-`life_plans` ו-`life_plan_milestones` הקיימות:

```sql
-- life_plans כבר תומך ב-plan_data כ-JSONB
-- נוסיף שדה category לזיהוי תוכניות בריאות

-- בטבלת life_plan_milestones כבר יש:
-- focus_area TEXT - ישמש לזיהוי (physical/nutrition/sleep/stress)
```

### אפשרות: טבלת health_journeys (אופציונלי)
```sql
CREATE TABLE health_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  journey_data JSONB DEFAULT '{}',
  current_step INTEGER DEFAULT 1,
  is_completed BOOLEAN DEFAULT FALSE,
  plan_id UUID REFERENCES life_plans(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## אינטגרציות

### 1. Aurora Chat
הזרקת מידע מתוכנית הבריאות:
- אבן הדרך הנוכחית בבריאות
- התקדמות כללית בתוכנית
- המלצות היפנוזה ספציפיות לבריאות

### 2. Smart Suggestions (כבר קיים)
כבר הוספנו הצעות ממוקדות בריאות ב-`useSmartSuggestions.tsx`

### 3. Missions Roadmap
סינון משימות לפי `category='health'` כבר עובד

---

## סדר ביצוע

### שלב 1 - מיידי (תיקון טקסט)
1. תיקון HealthToolsGrid.tsx - הסרת truncation
2. הוספת min-height לכרטיסים
3. בדיקה ב-RTL וב-LTR

### שלב 2 - תשתית
4. יצירת edge function: generate-health-plan
5. יצירת hook: useHealthJourney
6. יצירת קומפוננט: HealthJourney (מעטפת)

### שלב 3 - מסע הבריאות
7. יצירת 8 steps לשלבי המסע
8. עיצוב בסגנון אדום/ורוד
9. חיבור לדאטאבייס

### שלב 4 - תצוגת תוכנית
10. יצירת HealthPlan.tsx (דף הצגת תוכנית)
11. הוספת HealthPlanPreview.tsx לדף Health
12. חיבור לניווט

---

## דוגמת אבני דרך לתוכנית בריאות

| שבוע | מיקוד | משימות לדוגמה |
|------|-------|---------------|
| 1 | יסודות שינה | לישון 7 שעות, לכבות מסכים שעה לפני |
| 2 | הידרציה | 8 כוסות מים ביום, להפחית קפאין |
| 3 | תנועה | הליכה 20 דקות ביום |
| 4 | מנוחה נפשית | 5 דקות מדיטציה יומית |
| 5-8 | בנייה | הגברת עצימות ותדירות |
| 9-12 | תנופה | יצירת הרגלים קבועים |

---

## טכני - סיכום

### קבצים חדשים
```text
supabase/functions/generate-health-plan/index.ts
src/pages/HealthPlan.tsx
src/pages/HealthJourney.tsx
src/components/health-hub/journey/
  ├── HealthJourneyContainer.tsx
  ├── steps/*.tsx (8 קבצים)
  └── useHealthJourney.ts
src/components/health-hub/HealthPlanPreview.tsx
```

### קבצים לעדכון
```text
src/components/health-hub/HealthToolsGrid.tsx  // תיקון טקסט + כפתור תוכנית
src/pages/Health.tsx                            // הוספת כפתור מסע + preview
src/App.tsx                                     // routes חדשים
```

### Routes חדשים
- `/health/journey` - מסע הבריאות
- `/health/plan` - תוכנית 90 יום

