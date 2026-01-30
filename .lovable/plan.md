
# תוכנית: שיפור דף ההיפנוזה והתאמה אישית מלאה

## סטטוס: ✅ הושלם

---

## מה בוצע:

### 1. ✅ איחוד Layout לכל הדפים
- דף ההיפנוזה (`/hypnosis`) - משתמש ב-`DashboardLayout`
- דף Aurora (`/aurora`) - משתמש ב-`DashboardLayout`
- דף הקהילה (`/community`) - משתמש ב-`DashboardLayout`
- כל הדפים משתמשים באותו Sidebar ו-Right Panel

### 2. ✅ הסרת בחירת ארכיטיפ ידנית
- הוסר `EgoStateSelector` מדף ההיפנוזה
- הארכיטיפ נשלף אוטומטית מ-`profiles.active_ego_state` או מ-Launchpad Summary

### 3. ✅ סשן יומי מותאם אישית
- נוסף כרטיס "הסשן היומי שלך" בראש דף ההיפנוזה
- 15 דקות קבועות
- מטרה נקבעת אוטומטית על בסיס:
  - ה-milestone השבועי הנוכחי
  - נתוני Launchpad Summary
  - הארכיטיפ של המשתמש

### 4. ✅ הרחבת Edge Function
- `generate-hypnosis-script` טוען עכשיו:
  - `launchpad_summaries.summary_data` (consciousness analysis, blind spots, strengths)
  - `life_plan_milestones` (יעד שבועי נוכחי)
- System prompt מורחב להתחשב בכל הנתונים האישיים

### 5. ✅ הוק חדש useDailyHypnosis
- טוען ארכיטיפ מ-Launchpad/Profile
- מציע מטרה יומית מבוססת על milestone נוכחי
- מנהל את ההקשר לסשן היומי

### 6. ✅ איחוד Aurora עם Layout
- Aurora משתמש עכשיו ב-`DashboardLayout` כמו שאר הדפים
- נשמרה פונקציונליות הצ'אט והיסטוריית השיחות
- הוסר Sidebar כפול ו-modals מיותרים

---

## קבצים שעודכנו:

| קובץ | סוג שינוי |
|------|-----------|
| `src/pages/HypnosisLibrary.tsx` | עריכה מלאה - DashboardLayout + Daily Session |
| `src/components/aurora/AuroraLayout.tsx` | עריכה מלאה - DashboardLayout |
| `src/components/aurora/AuroraChatArea.tsx` | עריכה קלה |
| `src/components/aurora/index.ts` | ניקוי exports |
| `supabase/functions/generate-hypnosis-script/index.ts` | הרחבה - Launchpad data |
| `src/hooks/useDailyHypnosis.ts` | חדש |
| `src/services/hypnosis.ts` | הרחבה - getDailySessionContext |

## קבצים שנמחקו (כפילות):
- `src/components/aurora/AuroraSidebar.tsx`
- `src/components/aurora/AuroraDashboardModal.tsx`
- `src/components/aurora/AuroraSettingsModal.tsx`
- `src/components/aurora/AuroraChecklistModal.tsx`
