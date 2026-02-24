

# שדרוג תוכן משימות עם AI בזמן אמת

## הבעיה

התבניות (templates) עובדות — המודל מציג את ה-UI הנכון (טיימר, סטים, TTS). אבל **התוכן בתוך כל תבנית עדיין גנרי**: "הכנה / ביצוע / סגירה". 

```text
למשל: "השגת רמת בסיס של הידרציה (2 ליטר מים ביום)"
מקבל: הכנה → ביצוע 12 דקות → סגירה

צריך לקבל:
  1. מלא בקבוק 750מ"ל ושים ליד העבודה (60 שניות)
  2. שתה כוס מלאה עכשיו — 250מ"ל (30 שניות)
  3. הגדר תזכורת כל 90 דקות (60 שניות)
  4. עקוב: כמה שתית עד עכשיו? רשום. (60 שניות)
  5. יעד ערב: לפחות 1.5 ליטר עד 18:00 (30 שניות)
```

הסיבה: הפונקציה `generateExecutionSteps` ב-`generate-today-queue` משתמשת ב-regex + תבניות סטטיות קבועות מראש.

## הפתרון: AI Content Generation עם Timeout + Fallback

כשמשתמש לוחץ על משימה, המערכת:
1. מציגה מיד את ה-UI הנכון (תבנית) עם שלבים סטטיים (מה שיש עכשיו)
2. ברקע, שולחת קריאת AI ליצירת שלבים מפורטים ומותאמים
3. אם AI מגיב תוך 8 שניות — מחליפה את השלבים בתוכן המפורט
4. אם לא — נשארת עם ה-fallback הסטטי (מה שיש היום)

```text
המשתמש לוחץ "התחל משימה"
        |
        v
  [מציג UI מיידי עם שלבים סטטיים]
        |
        +---> [קריאת AI ברקע — 8 שניות timeout]
        |         |
        |     מצליח? → מחליף שלבים בתוכן AI מפורט
        |         |
        |     נכשל/timeout? → נשאר עם fallback סטטי
        v
  [המשתמש מתחיל לעבוד]
```

## מה ישתנה

### 1. Edge Function חדשה: `generate-execution-steps`
פונקציה קלה שמקבלת: `title`, `pillar`, `execution_template`, `action_type`, `duration_min`, `language`

ומחזירה שלבי ביצוע מפורטים שנוצרו על ידי AI:
- לכל תבנית, הפרומפט שונה (סטים+חזרות לאימון, שלבים מפורטים לרוטינה, וכו')
- כולל `label`, `detail`, `durationSec` לכל שלב
- ל-`sets_reps_timer`: כולל `sets`, `reps`, `restSec` לכל תרגיל
- ל-`tts_guided`: מייצר סקריפט TTS מותאם אישית במקום סקריפטים סטטיים

### 2. שדרוג `ExecutionModal.tsx`
- כשנפתח, מציג מיד את השלבים הסטטיים (כמו עכשיו)
- שולח קריאה ל-`generate-execution-steps` ברקע
- אם מגיע תוך 8 שניות — מחליף את השלבים בצורה חלקה (אנימציה)
- מראה אינדיקטור "מייצר תוכן מותאם..." בזמן שממתין
- ל-`tts_guided`: מחליף את הסקריפטים הסטטיים בסקריפט AI מותאם

### 3. שיפור השלבים הסטטיים ב-`generate-today-queue`
- שדרוג ה-fallback templates שיהיו יותר ספציפיים (עדיין סטטיים, אבל טובים יותר)
- הוספת שלבים ספציפיים לתבניות חסרות (הידרציה, שינה, וכו')

## פירוט טכני

### Edge Function: `generate-execution-steps`

```text
Input:
{
  title: "השגת רמת בסיס של הידרציה (2 ליטר מים ביום)",
  pillar: "vitality",
  execution_template: "step_by_step",
  action_type: "hydration_baseline",
  duration_min: 15,
  language: "he"
}

Output:
{
  steps: [
    { label: "מלא בקבוק 750מ\"ל", detail: "שים ליד שולחן העבודה...", durationSec: 60 },
    { label: "שתה כוס מלאה עכשיו", detail: "250מ\"ל — לאט...", durationSec: 30 },
    ...
  ],
  tts_script?: ["שורה 1...", "שורה 2..."]  // רק עבור tts_guided
}
```

הפרומפט ל-AI:
- מקבל את סוג התבנית ומתאים את הפורמט
- `sets_reps_timer` → תרגילים עם סטים, חזרות, מנוחות
- `tts_guided` → סקריפט מונחה מותאם (למשל סריקת גוף ספציפית למתח בכתפיים)
- `step_by_step` → שלבים מפורטים עם הסברים
- `timer_focus` → כוונה + בלוק עבודה + סיכום מותאמים
- `social_checklist` → טיפים ושלבים ספציפיים לסוג האינטראקציה

### שינויים ב-ExecutionModal

```text
useEffect (כש-action משתנה):
  1. הצג שלבים סטטיים מיידית
  2. setIsEnhancing(true)
  3. קריאה ל-generate-execution-steps עם AbortController (8 שניות)
  4. אם הצליח → setSteps(aiSteps), setIsEnhancing(false)
  5. אם נכשל → setIsEnhancing(false), נשאר עם סטטי
```

### קבצים

| קובץ | שינוי |
|-------|-------|
| `supabase/functions/generate-execution-steps/index.ts` | **חדש** — Edge function ליצירת שלבים עם AI |
| `src/components/dashboard/ExecutionModal.tsx` | הוספת קריאת AI ברקע + אינדיקטור טעינה + החלפת שלבים חלקה |
| `supabase/functions/generate-today-queue/index.ts` | שיפור fallback templates סטטיים (יותר ספציפיים) |

### ביצועים ו-UX

- **אפס עיכוב**: המודל נפתח מיידית עם תוכן סטטי
- **שדרוג חלק**: אם AI מגיב — השלבים מתחלפים באנימציה
- **Timeout 8 שניות**: אם AI איטי — המשתמש לא מחכה
- **אינדיקטור**: "Sparkles" icon + "מותאם אישית..." כשממתין ל-AI
- **Cache**: תוצאות AI נשמרות ב-state כדי למנוע קריאות כפולות באותו session
