
# תיקון מערכת הביצוע: משימות ברורות עם הוראות מותאמות אישית

## הבעיה

כרגע, כשמשתמש לוחץ על משימה, המודל (ExecutionModal) מייצר את השלבים לפי **התאמת מילות מפתח** בלבד:
- אם הכותרת מכילה "קר" → מראה תבנית חשיפה לקור (גם אם המשימה לא קשורה)
- אם לא נמצאה התאמה → מראה 3 שלבים גנריים: "הכנה / ביצוע / סגירה" שלא אומרים למשתמש מה באמת לעשות
- "סריקת גוף יומית לתחושות תקיעות" — המשתמש לא יודע מה זה בכלל ומה לעשות

הסיבה: המודל מקבל רק את **הכותרת** של המשימה ומנסה להתאים תבנית. הוא לא מקבל את ההקשר של האסטרטגיה, האבחון, או ההוראות המפורטות.

## הפתרון

### שלב 1: הוספת הוראות ביצוע ברמת האסטרטגיה

ב-`generate-90day-strategy` (הפונקציה שמייצרת את תוכנית 100 הימים), נוסיף ל-AI Prompt דרישה שכל `daily_action` יכלול שדה חדש: `execution_steps` — מערך של 3-5 שלבים ספציפיים עם הסבר ברור מה לעשות, כולל זמנים.

דוגמה: במקום "סריקת גוף יומית" עם שלבים גנריים, האסטרטגיה תייצר:
```text
1. שכב על הגב, עצום עיניים (1 דק')
2. סרוק מהראש: מצח, לסת, צוואר — חפש נקודות מתח (3 דק')
3. המשך לכתפיים, חזה, בטן — שים לב איפה יש "תקיעות" (3 דק')
4. רגליים: ירכיים, ברכיים, כפות רגליים (2 דק')
5. נשימה עמוקה, פתח עיניים, רשום 2 תובנות (2 דק')
```

### שלב 2: שינוי generate-today-queue

כשה-queue builder שולף פעולות מהאסטרטגיה, הוא יעביר את ה-`execution_steps` כחלק מה-QueueItem כך שהמודל יקבל אותם ישירות.

שדה חדש ב-QueueItem:
```
executionSteps?: { label: string; detail?: string; durationSec: number }[]
```

### שלב 3: שינוי ExecutionModal

- אם ה-action מגיע עם `executionSteps` מוכנים → **השתמש בהם ישירות** (ללא keyword matching)
- אם אין → fallback ל-AI gateway שמייצר שלבים ספציפיים בזמן אמת (עם timeout של 5 שניות)
- רק אם גם ה-AI נכשל → השתמש בתבניות הנוכחיות כ-fallback אחרון

### שלב 4: תיקון keyword matching

גם ב-fallback הנוכחי, נתקן את הבעיות:
- הורדת regex רחב מדי (למשל `/cold|קר/` שתופס כל דבר עם "קר")
- שימוש ב-`actionType` (שמגיע מהאסטרטגיה) כמפתח ראשי במקום חיפוש בכותרת

---

## פירוט טכני

### קבצים שישתנו

1. **`supabase/functions/generate-90day-strategy/index.ts`**
   - עדכון ה-AI prompt ב-Layer 2/3 לדרוש `execution_steps` לכל daily action
   - כל שלב חייב להיות ספציפי, ברור, עם תיאור של מה בדיוק לעשות

2. **`supabase/functions/generate-today-queue/index.ts`**
   - העברת `execution_steps` מה-strategy data ל-queue item
   - הוספת השדה לממשק QueueItem

3. **`src/hooks/useNowEngine.ts`**
   - הוספת `executionSteps` ל-interface `NowQueueItem`

4. **`src/components/dashboard/ExecutionModal.tsx`**
   - שינוי `useEffect` שבונה steps: אם `action.executionSteps` קיים → השתמש בהם
   - הוספת AI fallback (קריאה ל-generate-today-queue עם mode=execution_steps) שמקבל את הכותרת + הפילאר ומייצר שלבים מותאמים
   - תיקון regex patterns ב-`getSpecificSteps` שמחזירים תוצאות שגויות
   - הוספת הסברים ויזואליים ברורים יותר לכל שלב

5. **`src/hooks/useTodayExecution.ts`**
   - עדכון הטיפוסים בהתאם לשדה החדש

### זרימת הנתונים החדשה

```text
generate-90day-strategy
  --> כל daily_action כולל execution_steps[]
  --> נשמר ב-life_plans.plan_data.strategy.weeks[].daily_actions[]

generate-today-queue
  --> שולף daily_actions עם execution_steps
  --> מעביר כ-QueueItem.executionSteps

ExecutionModal
  --> action.executionSteps קיים? --> הצג ישירות
  --> לא קיים? --> קרא ל-AI gateway לייצר בזמן אמת
  --> AI נכשל? --> fallback לתבניות keyword (מתוקנות)
```

### חשוב

- תוכניות קיימות ללא execution_steps ימשיכו לעבוד (fallback)
- תוכניות חדשות (אחרי כיול מחדש) יכללו את השלבים המפורטים
- ה-AI fallback ישתמש בנתוני האבחון + הפילאר לייצר הוראות ספציפיות ולא גנריות
