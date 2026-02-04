
# שינוי מערכת הצ'אט של אורורה - מהתוכנית ליישום

## סקירה כללית
1. **הסרת כפתור אורורה** מתפריט הניווט בסייד בר
2. **הסתרת בלונים של הודעות כברירת מחדל** - יופיעו רק כשלוחצים על שדה הטקסט למטה
3. **שיחה אחת ארוכה ורציפה** - במקום הרבה שיחות נפרדות, שיחה אחת שלא נגמרת (אלא אם המשתמש בוחר לפתוח חדשה)

## שינויים טכניים

### 1. הסרת כפתור אורורה מהסייד בר
**קובץ:** `src/components/dashboard/DashboardSidebar.tsx`

הסרת האייטם של אורורה מרשימת הניווט:
```typescript
// לפני:
const navItems = [
  { id: 'dashboard', ... },
  { id: 'aurora', ... },  // <- יוסר
  { id: 'business', ... },
];

// אחרי:
const navItems = [
  { id: 'dashboard', ... },
  { id: 'business', ... },
];
```

### 2. הוספת מצב "צ'אט פתוח/סגור" לממשק
**קבצים:**
- `src/contexts/AuroraChatContext.tsx`
- `src/components/dashboard/GlobalChatInput.tsx`
- `src/components/dashboard/DashboardLayout.tsx`

הוספת state חדש `isChatExpanded` ל-context:

| State | תיאור |
|-------|--------|
| `isChatExpanded` | האם הצ'אט מורחב ומציג הודעות |
| `toggleChatExpanded` | פונקציה להחלפת מצב |

### 3. תצוגת ההודעות - בלונים שמופיעים מעל שדה הקלט
**קובץ חדש:** `src/components/aurora/AuroraChatBubbles.tsx`

קומפוננטה שמציגה את ההודעות כבלונים מעל שדה הקלט:
- מופיעה רק כש-`isChatExpanded === true`
- אנימציית fade-in חלקה
- גלילה אוטומטית להודעה האחרונה
- כפתור X לסגירה

### 4. שינוי GlobalChatInput לתמוך בפתיחת הצ'אט
**קובץ:** `src/components/dashboard/GlobalChatInput.tsx`

- הוספת `onFocus` handler שמרחיב את הצ'אט
- כשלוחצים על שדה הטקסט → מציג הודעות קודמות
- שמירה על הפונקציונליות הקיימת

### 5. שינוי לוגיקת השיחות - שיחה אחת רציפה
**קבצים:**
- `src/contexts/AuroraChatContext.tsx`
- `src/components/dashboard/DashboardSidebar.tsx`

שינויים:
- הסרת רשימת השיחות האחרונות מהסייד בר (או הסתרתן)
- שמירה על כפתור "שיחה חדשה" רק כאופציה (לא כברירת מחדל)
- המשתמש תמיד עובד על השיחה האחרונה/הדיפולטית

### 6. עדכון DashboardLayout
**קובץ:** `src/components/dashboard/DashboardLayout.tsx`

- הוספת `AuroraChatBubbles` מעל ה-`GlobalChatInput`
- ניהול המצב של הצ'אט המורחב
- סגירה אוטומטית בלחיצה מחוץ לאזור הצ'אט

## זרימת המשתמש החדשה

```text
1. משתמש נמצא בכל דף באפליקציה (דאשבורד/עסקים)
2. רואה שדה טקסט למטה (GlobalChatInput)
3. לוחץ על שדה הטקסט
4. → בלונים של ההודעות הקודמות מופיעים מעל
5. כותב הודעה ושולח
6. → התשובה מופיעה בבלון חדש
7. לוחץ מחוץ לאזור הצ'אט → הבלונים נעלמים
8. השיחה נשמרת ומתמשכת לפגישה הבאה
```

## קבצים שיש לערוך

| קובץ | פעולה |
|------|--------|
| `src/components/dashboard/DashboardSidebar.tsx` | הסרת אורורה מהניווט, הסתרת רשימת שיחות |
| `src/contexts/AuroraChatContext.tsx` | הוספת `isChatExpanded` state |
| `src/components/dashboard/GlobalChatInput.tsx` | הוספת `onFocus` לפתיחת הצ'אט |
| `src/components/dashboard/DashboardLayout.tsx` | הוספת בלוני הודעות מעל הקלט |
| `src/components/aurora/AuroraChatBubbles.tsx` | **חדש** - קומפוננטת הבלונים |

## שיקולי UX

- **אנימציות חלקות**: fade-in/out לבלונים
- **נגישות**: סגירה בלחיצת ESC או לחיצה מחוץ
- **ביצועים**: lazy loading של הודעות ישנות
- **RTL**: תמיכה מלאה בעברית ואנגלית
