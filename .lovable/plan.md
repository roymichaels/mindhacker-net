
# תוכנית: שיפור דף ההיפנוזה והתאמה אישית מלאה

## סקירה
המטרה היא להפוך את חוויית ההיפנוזה לאישית לחלוטין, קשורה לפרופיל המשתמש מה-Launchpad, עם תפריט ניווט אחיד לכל המערכת.

---

## 1. הוספת תפריט הסיידבר לדף ההיפנוזה

**בעיה נוכחית:** דף `/hypnosis` (HypnosisLibrary.tsx) לא משתמש ב-DashboardLayout ולכן חסר בו תפריט הניווט.

**פתרון:**
- לעטוף את תוכן הדף ברכיב `DashboardLayout` (בדיוק כמו בדפים Messages ו-Community)
- הסרת ה-header הנפרד שקיים בדף והחלפתו בעיצוב המותאם ל-Layout החדש

---

## 2. הסרת בחירת ארכיטיפ ידנית

**בעיה נוכחית:** המשתמש יכול לבחור את הארכיטיפ שלו בדף ההיפנוזה דרך `EgoStateSelector`.

**מה המערכת עושה היום:**
- הארכיטיפ נקבע אוטומטית ב-Launchpad Summarization (שדה `suggested_ego_state` ב-`summary_data.identity_profile`)
- אבל בדף ההיפנוזה, המשתמש יכול לדרוס את הבחירה

**פתרון:**
- הסרת רכיב `EgoStateSelector` מדף ההיפנוזה
- שליפת הארכיטיפ ישירות מ-`profiles.active_ego_state` או מ-`launchpad_summaries.summary_data.identity_profile.suggested_ego_state`
- הצגת הארכיטיפ של המשתמש כמידע בלבד (לא ניתן לשינוי)

---

## 3. התאמה אישית של סקריפט ההיפנוזה על בסיס Launchpad

**מה קיים היום:**
- הפונקציה `generate-hypnosis-script` כבר טוענת נתונים מ-Aurora Life Model (direction, values, energy patterns, focus)

**מה חסר:**
- אין שילוב של נתוני ה-Launchpad Summary (consciousness analysis, behavioral insights, blind spots, strengths)
- אין יצירת סקריפט יומי אוטומטי

**פתרון:**
- הרחבת Edge Function `generate-hypnosis-script` לטעון גם:
  - `launchpad_summaries.summary_data` - ניתוח התודעה, דפוסים, נקודות עיוורות, חוזקות
  - `life_plans` / `life_plan_milestones` - היעדים השבועיים הנוכחיים
- הוספת הנתונים ל-system prompt כדי ליצור סקריפט מותאם אישית

---

## 4. יצירת "סשן יומי" אוטומטי

**פתרון:**
- הוספת כרטיס "הסשן היומי שלך" בראש דף ההיפנוזה
- הסשן היומי נוצר על בסיס:
  - הארכיטיפ מה-Launchpad
  - ה-milestone השבועי הנוכחי מתוכנית ה-90 יום
  - דפוסי אנרגיה ונקודות עיוורות מהניתוח
- משך קבוע של 15 דקות
- המטרה נקבעת אוטומטית על ידי AI על בסיס ההקשר האישי

---

## פירוט טכני

### קבצים לעריכה:

**1. `src/pages/HypnosisLibrary.tsx`**
- עטיפה ב-DashboardLayout
- הסרת EgoStateSelector
- הסרת ה-header הנפרד
- הוספת שליפת נתוני Launchpad (suggested_ego_state)
- הוספת כרטיס "הסשן היומי שלך" עם מטרה אוטומטית
- הצגת הארכיטיפ כמידע בלבד

**2. `supabase/functions/generate-hypnosis-script/index.ts`**
- הוספת שליפת `launchpad_summaries` (consciousness_analysis, behavioral_insights)
- הוספת שליפת `life_plan_milestones` (ה-milestone הנוכחי)
- הרחבת ה-personalizationContext עם כל המידע הנוסף
- שיפור ה-system prompt להתחשב בכל הנתונים

**3. `src/services/hypnosis.ts`**
- הוספת פונקציה `getDailySessionContext` שמחזירה את המטרה המותאמת ליום
- אפשרות לקרוא ל-Edge Function עם `autoGenerateGoal: true`

**4. יצירת הוק חדש `src/hooks/useDailyHypnosis.ts`**
- טעינת הארכיטיפ מ-Launchpad Summary
- יצירת מטרה יומית אוטומטית בהתבסס על milestones ודפוסים
- ניהול מצב הסשן היומי

---

## זרימת המשתמש החדשה

```text
                      ┌────────────────────────────────────────┐
                      │           דף ההיפנוזה                  │
                      │        (עם Sidebar ו-Layout)           │
                      └────────────────────────────────────────┘
                                        │
                 ┌──────────────────────┼──────────────────────┐
                 │                      │                      │
                 ▼                      ▼                      ▼
    ┌─────────────────────┐  ┌──────────────────┐  ┌──────────────────┐
    │   הסשן היומי שלך    │  │   סשנים מהירים   │  │   סשנים אחרונים  │
    │   15 דק׳ - אוטומטי  │  │  (5-15 דקות)     │  │                  │
    │  מטרה: מ-AI + Plan  │  │                  │  │                  │
    └─────────────────────┘  └──────────────────┘  └──────────────────┘
             │
             ▼
    ┌─────────────────────────────────────────────────────────────────┐
    │                    יצירת סקריפט מותאם                          │
    │                                                                 │
    │  • Launchpad Summary (consciousness, patterns, blind spots)    │
    │  • Life Plan Milestone (יעד שבועי נוכחי)                       │
    │  • Aurora Life Model (values, direction, energy)               │
    │  • Archetype (מ-suggested_ego_state - לא ניתן לשינוי)          │
    └─────────────────────────────────────────────────────────────────┘
```

---

## צבע האווטאר/Orb

**מצב נוכחי:** הארכיטיפ קובע את צבעי ה-Orb (מוגדר ב-`egoStates.ts`)

**פתרון:**
- לוודא שה-`active_ego_state` בטבלת profiles מתעדכן מה-`suggested_ego_state` בסיום ה-Launchpad
- זה כבר צריך לקרות ב-`generate-launchpad-summary` Edge Function
- אם לא - להוסיף עדכון אוטומטי של profiles.active_ego_state

---

## סיכום שינויים

| קובץ | סוג שינוי |
|------|-----------|
| `src/pages/HypnosisLibrary.tsx` | עריכה משמעותית |
| `supabase/functions/generate-hypnosis-script/index.ts` | הרחבה |
| `src/services/hypnosis.ts` | הוספת פונקציות |
| `src/hooks/useDailyHypnosis.ts` | חדש |
