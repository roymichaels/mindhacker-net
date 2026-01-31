
# תוכנית: אפשר צפייה וניווט במסע טרנספורמציה שהושלם

## הבעיה הנוכחית

כרגע, כשמשתמש שסיים את מסע הטרנספורמציה לוחץ על "ערוך מסע טרנספורמציה":
1. הוא מועבר לדף `/launchpad/complete` - דף סיכום נפרד
2. אם מנסים לגשת ל-`/launchpad` - קורה redirect לדשבורד
3. **הנתונים לא נטענים** כי יש שגיאה בשם עמודה (`created_at` לא קיימת)

## הפתרון

לאפשר למשתמש שסיים **לצפות במסע עצמו** עם כל הצעדים מסומנים כמושלמים, ואפשרות לנווט ביניהם כרגיל.

## השינויים הנדרשים

### 1. תיקון שגיאת ה-Build (`LaunchpadComplete.tsx`)
- שינוי `created_at` ל-`generated_at` בשליפות מ-`launchpad_summaries`
- שינוי `created_at` ל-`updated_at` בשליפות מ-`life_plans`

### 2. הסרת ה-Redirect ב-`Launchpad.tsx`
- הסרת ה-`useEffect` שמעביר לדשבורד כשהמסע הושלם
- המשתמש יוכל לגשת ל-`/launchpad` גם אחרי סיום

### 3. הסרת ה-Return Null ב-`LaunchpadFlow.tsx`
- הסרת הבדיקה בשורות 145-147 שמחזירה `null` אם המסע הושלם
- עדכון הלוגיקה כך שמשתמש שסיים יכול לנווט בין כל הצעדים (1-9)
- כל הצעדים יהיו נגישים בסדר מלא עם חיווי שהם הושלמו

### 4. עדכון לוגיקת הניווט ב-`ProfileDrawer.tsx`
- שינוי הכפתור כך שתמיד יוביל ל-`/launchpad` (לא ל-`/launchpad/complete`)
- הטקסט ישתנה לפי הסטטוס: "ערוך" אם הושלם, "התחל" אם לא

### 5. עדכון הניווט בסיום המסע
- ב-`LaunchpadFlow.tsx` שורה 72 - לשנות את ה-`onComplete` כך שינווט ל-`/launchpad/complete` במקום לדשבורד
- ב-`Launchpad.tsx` - לשנות את `handleComplete` להוביל ל-`/launchpad/complete`

## התנהגות צפויה לאחר התיקון

**משתמש חדש:**
1. לוחץ "התחל מסע טרנספורמציה" → נכנס ל-LaunchpadFlow
2. עובר את כל 9 הצעדים בסדר
3. בסיום → מועבר ל-`/launchpad/complete` לראות את הסיכום המלא והציונים

**משתמש שסיים:**
1. לוחץ "ערוך מסע טרנספורמציה" → נכנס ל-LaunchpadFlow
2. רואה את כל 9 הצעדים מסומנים כמושלמים
3. יכול לנווט בחופשיות בין הצעדים עם חיצי הניווט
4. יכול לצפות/לערוך תשובות קודמות
5. יכול גם לגשת ל-`/launchpad/complete` ישירות לראות סיכום

## פרטים טכניים

### קבצים לעדכון:
1. `src/pages/LaunchpadComplete.tsx` - תיקון שמות עמודות
2. `src/pages/Launchpad.tsx` - הסרת redirect + שינוי onComplete
3. `src/components/launchpad/LaunchpadFlow.tsx` - הסרת return null
4. `src/components/dashboard/ProfileDrawer.tsx` - עדכון ניווט לתמיד `/launchpad`

### שינויים בקוד:

```typescript
// LaunchpadComplete.tsx - שורה 76
.order('generated_at', { ascending: false }) // במקום created_at

// LaunchpadComplete.tsx - שורה 87
.order('updated_at', { ascending: false }) // במקום created_at

// Launchpad.tsx - הסרת שורות 10-15 (ה-useEffect)
// ושינוי handleComplete:
const handleComplete = () => {
  navigate('/launchpad/complete');
};

// LaunchpadFlow.tsx - הסרת שורות 145-147
// שינוי canGoNext (שורה 107):
const canGoNext = viewingStep !== null ? displayedStep < 9 : displayedStep < currentStep;

// ProfileDrawer.tsx - שורה 130
navigate('/launchpad'); // תמיד לlaunchpad
```

### לוגיקת ניווט משופרת ב-LaunchpadFlow:

```
אם המסע הושלם:
  - currentStep = 9 (או יותר)
  - כל הצעדים (1-9) נגישים לניווט
  - משתמש מתחיל בצעד 1 (כניסה טרייה) או בצעד שהיה בו
  - יכול לנווט קדימה/אחורה ללא הגבלה
  
אם המסע לא הושלם:
  - יכול לנווט אחורה לצעדים שהשלים
  - לא יכול לנווט קדימה מעבר לצעד הנוכחי
```
