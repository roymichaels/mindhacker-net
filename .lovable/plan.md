
## ממצאים (מה קורה בפועל ולמה זה “לא נשמר”)
בדקתי את הבקשות לרשת והדאטאבייס:

- בזמן השיחה — כן נשמר transcript מלא. ראיתי PATCHים שמכילים את כל ההודעות, השאלות והתשובות.
- אבל אחרי שסיימת / כשחזרת אחורה — נשלח PATCH נוסף שמחזיר את `step_2_summary` למצב התחלתי (רק greeting + שאלה ראשונה), והוא **דורס** את מה שנשמר קודם.

הגורם המרכזי:
- כשאתה חוזר לצעד 4, `getSavedData(4)` מחזיר `null` בזמן שהדאטה עדיין בטעינה (`isLoading === true`).
- בגלל זה `FirstChatStep` עולה בלי `savedData`, מפעיל “greeting” חדש, ואז `onAutoSave` שומר לדאטאבייס את ההתחלה החדשה — וזה בדיוק ה-PATCH שראיתי שדורס את השיחה הקודמת.

בנוסף (תיקון קטן אבל חשוב):
- ראיתי פעם אחת שנשמרה הודעה בצורה לא תקינה `{ role: "assistant" }` בלי `content`. זה יכול לקרות כשיש state רגעי/תחרות בין עדכונים. נרצה לסנן הודעות לא תקינות לפני שמירת JSON.

---

## מטרת התיקון
1. למנוע מצב שבו חזרה לצעד 4 בזמן טעינת דאטה “מאתחלת” שיחה ושומרת אותה על הדאטאבייס.
2. להבטיח שתמיד נטען משהו יציב (לפחות localStorage) במקום `null` בזמן loading.
3. לוודא שלא נשמרות הודעות שבורות (ללא `content`).

---

## מה נשנה (ברמת קוד)

### 1) `useLaunchpadAutoSave.ts` — לא מחזירים `null` בזמן טעינה + לא שומרים ל-DB בזמן טעינה
**שינוי A: getSavedData**
במקום:
- אם `isLoading` → `return null`

נעשה:
- אם `isLoading` → נחזיר **localStorage** (fallback) כדי שהקומפוננטה לא תאתחל שיחה חדשה בטעות.

כלומר:
- `if (isLoading) return loadFromLocalStorage(step);`

**שינוי B: autoSave**
במקום:
- כל `autoSave` תמיד מתזמן שמירה לדאטאבייס

נעשה:
- בזמן `isLoading` נשמור **רק ל-localStorage** ולא נתזמן DB update.
זה מונע לחלוטין את ה-overwrite שהתרחש לך (ה-PATCH שמחזיר את השיחה להתחלה).

### 2) `useLaunchpadAutoSave.ts` — invalidate/refetch אחרי שמירה ל-DB
כדי שכשחוזרים לצעד נקבל את מה שנשמר (ולא נתונים ישנים), נוסיף `queryClient.invalidateQueries` אחרי update מוצלח:
- `invalidateQueries({ queryKey: ['launchpad-data', user.id] })`

זה גם ימנע מצבים שבהם ה-UI נשאר עם cache ישן אחרי שמירה.

### 3) `FirstChatStep.tsx` — סניטציה לפני auto-save
ב-`useEffect` שמפעיל `onAutoSave`, נוסיף סינון:
- נשמור רק הודעות עם `role` תקין ו-`content` שהוא string לא ריק.
זה מונע שמירת JSON פגום (כמו `{role:'assistant'}` בלי content).

דוגמה לוגית:
- `const safeMessages = messages.filter(m => m && (m.role==='user'||m.role==='assistant') && typeof m.content==='string' && m.content.trim().length>0);`
- ואז נשלח `safeMessages` ל-`onAutoSave`.

### 4) `LaunchpadFlow.tsx` — אופציונלי אך מומלץ: לא להציג Step בזמן ש-data-loading
כרגע יש `isLoadingData` אבל לא משתמשים בו.
נוסיף guard:
- אם `isLoadingData` → נציג loader במקום להריץ Step שמאותחל בלי savedData.
זה עוד שכבת הגנה שמקטינה סיכוי ל-regressions.

---

## איך נאמת שזה תוקן (בדיקה מדויקת)
1. להיכנס לצעד 4, לענות לפחות 2 שאלות.
2. לצאת לצעד אחר ולחזור לצעד 4.
3. לוודא שהשיחה חוזרת בדיוק (כולל ההודעות של המשתמש).
4. לבדוק ברשת שאין PATCH שמחזיר את `step_2_summary` למצב התחלתי בעת חזרה לצעד 4.
5. לבדוק שגם refresh לדף לא מוחק את השיחה.

---

## קבצים שנעדכן
- `src/hooks/useLaunchpadAutoSave.ts` (העיקר: loading behavior + invalidate)
- `src/components/launchpad/steps/FirstChatStep.tsx` (סינון הודעות לפני שמירה)
- `src/components/launchpad/LaunchpadFlow.tsx` (loader בזמן isLoadingData – מומלץ)

---

## למה זה יפתור את זה בוודאות
הבעיה אצלך היא לא “לא נשמר” אלא “נשמר ואז נדרס”.
הדריסה קרתה בדיוק בגלל `null` בזמן loading שגרם ל-init מחדש ול-autoSave לדאטאבייס.
ברגע שנמנע שמירה ל-DB בזמן loading + נשתמש ב-localStorage בזמן הזה, אין יותר אפשרות טכנית לדריסה הזו להתרחש.
