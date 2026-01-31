

# תיקון PDF - סגמנטים חסרים, יישור וסימטריה

## הבעיות שזוהו מהתמונות

### 1. דף השער (Cover Page)
- כותרת "פרופיל הטרנספורמציה שלי" לא מופיעה
- התאריך והשם לא מיושרים כראוי
- יש מלבן סגול ריק במקום הכותרת

### 2. דף הציונים (Scores Page)
- המספרים בתוך העיגולים (55, 68, 90) לא ממורכזים אנכית ואופקית
- צריך לתקן את ה-flexbox alignment

### 3. תוכנית 90 יום חסרה לחלוטין
- הסיבה: שאילתת ה-DB מחפשת שדה `title` בטבלת `life_plans` שלא קיים
- השאילתה נכשלת בשקט וה-milestones ריקים

### 4. כותרות דפים ריקות
- כל דף מציג מלבן צבעוני ריק במקום הכותרת
- הסיבה: `bg-clip-text text-transparent` עם גרדיאנטים לא עובד טוב ב-html2canvas
- הפתרון: להשתמש בצבע טקסט רגיל במקום גרדיאנט

### 5. מספרי היררכיית ערכים לא ממורכזים
- העיגולים עם המספרים 1, 2, 3 לא מיושרים נכון

---

## תיקונים נדרשים

### קובץ 1: `src/hooks/useProfilePDF.ts`
**בעיה:** שאילתת life_plans מחפשת שדה title שלא קיים
**תיקון:**
```typescript
// שינוי מ:
.select('title, life_plan_milestones(*)')
// ל:
.select('id, plan_data, life_plan_milestones(*)')
```
וחילוץ הכותרת מתוך plan_data או שימוש בכותרת ברירת מחדל.

**בנוסף:** צריך להוסיף לוגיקה לקריאת שדה weekly_challenge מהמילסטון - נכון לעכשיו הוא מופיע כ-`challenge` בטבלה אבל הקוד מחפש `weekly_challenge`.

### קובץ 2: `src/components/pdf/PDFCoverPage.tsx`
**בעיה:** bg-clip-text + text-transparent לא נתמך ב-html2canvas
**תיקון:** להחליף את הגרדיאנט לצבע רגיל:
```typescript
// במקום:
className="bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent"
// להשתמש ב:
className="text-violet-300"
```

### קובץ 3: `src/components/pdf/PDFScoresPage.tsx`
**בעיה 1:** כותרת לא מופיעה (gradient text)
**בעיה 2:** מספרים לא ממורכזים בעיגולים
**תיקון:**
- החלפת gradient text לצבע רגיל
- הוספת `items-center justify-center` ו-`text-center` לעיגול המספר
- שימוש ב-line-height מתאים

### קובץ 4: `src/components/pdf/PDFLifeDirectionPage.tsx`
**תיקון:** החלפת gradient text לצבע רגיל

### קובץ 5: `src/components/pdf/PDFConsciousnessPage.tsx`
**תיקון:** החלפת gradient text לצבע רגיל

### קובץ 6: `src/components/pdf/PDFIdentityPage.tsx`
**בעיה 1:** כותרת לא מופיעה
**בעיה 2:** מספרי הערכים (1, 2, 3) לא ממורכזים
**תיקון:**
- החלפת gradient text לצבע רגיל
- הוספת flexbox centering למספרים

### קובץ 7: `src/components/pdf/PDFBehavioralPage.tsx`
**תיקון:** החלפת gradient text לצבע רגיל

### קובץ 8: `src/components/pdf/PDFLifePlanPage.tsx`
**תיקון:** החלפת gradient text לצבע רגיל

---

## סיכום טכני

| בעיה | גורם | תיקון |
|------|------|-------|
| כותרות לא מופיעות | `bg-clip-text text-transparent` לא נתמך ב-html2canvas | צבע טקסט רגיל |
| מספרים לא ממורכזים | חסר flexbox alignment | הוספת `flex items-center justify-center` |
| תוכנית 90 יום חסרה | שאילתה לשדה `title` שלא קיים | תיקון השאילתה ל-`plan_data` |
| `weekly_challenge` ריק | שדה נקרא `challenge` ב-DB | מיפוי נכון של השדה |

---

## קבצים לעדכון

| קובץ | סוג שינוי |
|------|-----------|
| `src/hooks/useProfilePDF.ts` | תיקון שאילתת DB |
| `src/components/pdf/PDFCoverPage.tsx` | תיקון צבע טקסט |
| `src/components/pdf/PDFScoresPage.tsx` | תיקון צבע טקסט + מיקום מספרים |
| `src/components/pdf/PDFLifeDirectionPage.tsx` | תיקון צבע טקסט |
| `src/components/pdf/PDFConsciousnessPage.tsx` | תיקון צבע טקסט |
| `src/components/pdf/PDFIdentityPage.tsx` | תיקון צבע טקסט + מיקום מספרים |
| `src/components/pdf/PDFBehavioralPage.tsx` | תיקון צבע טקסט |
| `src/components/pdf/PDFLifePlanPage.tsx` | תיקון צבע טקסט |

