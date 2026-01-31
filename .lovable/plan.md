
# תוכנית: שמירה אוטומטית וטעינת נתונים מהדאטאבייס בכל שלבי מסע הטרנספורמציה

## הבעיה שזוהתה

כרגע במערכת יש 3 בעיות:

1. **נתונים לא נטענים מהדאטאבייס** - כשחוזרים לצעד שהושלם, הקומפוננטות טוענות רק מ-localStorage (שנמחק בסיום הצעד)
2. **אין שמירה אוטומטית** - נתונים נשמרים רק בלחיצה על "הבא", לא בזמן בחירה
3. **LaunchpadFlow לא מעביר נתונים** - הצעדים לא מקבלים את הנתונים השמורים כ-prop

## הפתרון

### שלב 1: הוספת הוק מרכזי לניהול נתונים עם שמירה אוטומטית

יצירת הוק `useLaunchpadAutoSave` שיספק:
- **טעינה מהדאטאבייס** לכל צעד
- **שמירה אוטומטית** (debounced) בכל שינוי
- **Fallback ל-localStorage** למקרה של בעיות רשת

### שלב 2: עדכון LaunchpadFlow

- שימוש ב-`useLaunchpadData` לטעינת כל הנתונים השמורים
- העברת הנתונים הרלוונטיים לכל צעד כ-prop
- הוספת prop `savedData` לכל צעד

### שלב 3: עדכון כל צעד בנפרד

כל צעד יקבל:
```typescript
interface StepProps {
  onComplete: (data?: Record<string, unknown>) => void;
  isCompleting: boolean;
  rewards: { xp: number; tokens: number; unlock: string };
  savedData?: SavedProgress; // נתונים שמורים מהדאטאבייס
  onAutoSave?: (data: SavedProgress) => void; // פונקציית שמירה אוטומטית
}
```

### שלב 4: שמירה אוטומטית בכל שינוי

בכל צעד:
1. **אתחול** - קודם מהדאטאבייס (savedData), אם אין - מ-localStorage
2. **בכל בחירה** - שמירה אוטומטית לדאטאבייס (debounced 500ms) + localStorage
3. **בסיום הצעד** - סימון הצעד כהושלם בנוסף לנתונים שכבר נשמרו

---

## קבצים חדשים

### 1. `src/hooks/useLaunchpadAutoSave.ts`

הוק חדש שמנהל שמירה אוטומטית:
- Debounced save (500ms) לדאטאבייס
- Sync עם localStorage כ-backup
- מחזיר פונקציית `saveData` לכל צעד

---

## קבצים לעדכון

### 1. `src/components/launchpad/LaunchpadFlow.tsx`
- הוספת `useLaunchpadData` לטעינת נתונים
- העברת `savedData` ו-`onAutoSave` לכל צעד

### 2. `src/components/launchpad/steps/FirstWeekStep.tsx`
- קבלת `savedData` כ-prop
- אתחול ראשוני מ-savedData (DB) במקום רק localStorage
- קריאה ל-`onAutoSave` בכל שינוי בבחירות

### 3. `src/components/launchpad/steps/FocusAreasStep.tsx`
- אותו דבר - טעינה מ-savedData + שמירה אוטומטית

### 4. `src/components/launchpad/steps/PersonalProfileStep.tsx`
- אותו דבר - טעינה מ-savedData + שמירה אוטומטית

### 5. `src/components/launchpad/steps/WelcomeStep.tsx`
- אותו דבר - טעינה מ-savedData + שמירה אוטומטית

### 6. `src/hooks/useLaunchpadData.ts`
- הוספת פונקציית `updateStepData` לשמירה חלקית (לא רק בסיום צעד)

---

## לוגיקת הזרימה החדשה

```
                     ┌─────────────────────────────────────────┐
                     │          משתמש נכנס לצעד 8              │
                     └───────────────┬─────────────────────────┘
                                     │
                    ┌────────────────▼────────────────┐
                    │   LaunchpadFlow טוען נתונים      │
                    │   מ-useLaunchpadData             │
                    └────────────────┬────────────────┘
                                     │
                    ┌────────────────▼────────────────┐
                    │   מעביר savedData={firstWeek}   │
                    │   ל-FirstWeekStep              │
                    └────────────────┬────────────────┘
                                     │
                    ┌────────────────▼────────────────┐
                    │   FirstWeekStep מאתחל state:    │
                    │   1. savedData (מ-DB)?         │
                    │   2. localStorage?              │
                    │   3. ברירת מחדל                 │
                    └────────────────┬────────────────┘
                                     │
                    ┌────────────────▼────────────────┐
                    │   משתמש בוחר אופציה            │
                    └────────────────┬────────────────┘
                                     │
         ┌───────────────────────────┴───────────────────────────┐
         │                                                        │
         ▼                                                        ▼
┌──────────────────────┐                           ┌──────────────────────┐
│  שמירה ל-localStorage│                           │   onAutoSave(data)   │
│  (מיידית)            │                           │   (debounced 500ms)  │
└──────────────────────┘                           └───────────┬──────────┘
                                                               │
                                                   ┌───────────▼──────────┐
                                                   │   שמירה לדאטאבייס    │
                                                   │   step_6_actions     │
                                                   └──────────────────────┘
```

---

## תוצאה צפויה

לאחר היישום:

1. ✅ **נתונים נשמרים מיד** - כל בחירה נשמרת אוטומטית
2. ✅ **נתונים נטענים נכון** - כשחוזרים לצעד, הבחירות הקודמות מופיעות
3. ✅ **עמידות בפני נפילות** - localStorage משמש כ-backup מקומי
4. ✅ **UX חלק** - אין צורך בכפתור "שמור", הכל קורה ברקע
5. ✅ **עריכה אפשרית** - אפשר לשנות בחירות קודמות ולראות אותן נשמרות

---

## סדר היישום

1. יצירת `useLaunchpadAutoSave.ts`
2. עדכון `useLaunchpadData.ts` עם פונקציית עדכון חלקי
3. עדכון `LaunchpadFlow.tsx` - טעינה והעברת נתונים
4. עדכון `FirstWeekStep.tsx` - קבלת נתונים + שמירה אוטומטית
5. עדכון `FocusAreasStep.tsx` - אותו דבר
6. עדכון `PersonalProfileStep.tsx` - אותו דבר
7. עדכון `WelcomeStep.tsx` - אותו דבר
