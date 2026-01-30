

# תאריכי תוקף ומעקב משימות ע"י Aurora

## סקירת הבעיה

כרגע המערכת חסרה:
1. **תאריכי יעד** על משימות בצ'קליסטים ו-milestones
2. **מעקב אקטיבי** של Aurora אחרי משימות שלא בוצעו
3. **יכולת לאורורה לשאול** באלגנטיות על משימות שפג תוקפן
4. **הקשר תאריכים** ב-System Prompt של Aurora

---

## הפתרון

### 1. הוספת תאריכי יעד לטבלאות

**aurora_checklist_items** - הוספת:
```sql
due_date DATE                   -- תאריך יעד למשימה
completed_at TIMESTAMP          -- מתי הושלמה (כבר קיים)
```

**life_plan_milestones** - כבר יש `week_number` ו-`completed_at`, נוסיף:
```sql
start_date DATE                 -- תאריך התחלת השבוע
end_date DATE                   -- תאריך סיום השבוע
```

### 2. שיפור System Prompt של Aurora

Aurora תקבל מידע על:
- תאריך נוכחי
- משימות שעברו את תאריך היעד
- משימות שמתקרבות לתאריך היעד
- שבוע נוכחי בתוכנית החיים
- מתי נוצרה התוכנית האחרונה

### 3. תגיות חדשות ל-Aurora

```text
## מעקב משימות (חדש!)
כשמתחילה שיחה, בדוק:
1. האם יש משימות שעבר תאריך היעד שלהן?
2. האם יש milestone שבועי שלא הושלם?

אם כן, שאל באלגנטיות:
- "ראיתי שהמשימה 'X' הייתה אמורה להסתיים עד אתמול. מה קרה?"
- "איך הולך עם האתגר השבועי שלך?"
- "שמתי לב שהשבוע הקודם בתוכנית לא סומן כהושלם - רוצה לעדכן?"

## סימון משימות כבוצעו
- [task:complete:checklist:item] - סמן משימה כהושלמה
- [task:reschedule:checklist:item:new_date] - דחה תאריך יעד
- [milestone:complete:week_number] - סמן milestone כהושלם
```

---

## מבנה הנתונים המעודכן

### 1. עדכון aurora_checklist_items

```sql
ALTER TABLE aurora_checklist_items
ADD COLUMN due_date DATE,
ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
```

### 2. עדכון life_plan_milestones

```sql
ALTER TABLE life_plan_milestones
ADD COLUMN start_date DATE,
ADD COLUMN end_date DATE;
```

### 3. פונקציה לחישוב תאריכי Milestone

בעת יצירת תוכנית חיים, נחשב אוטומטית:
- שבוע 1: start_date = plan.start_date, end_date = start_date + 6 ימים
- שבוע 2: start_date = end_date של שבוע 1 + 1, וכו'

---

## זרימת המידע ל-Aurora

```text
┌────────────────────────────────────────────────────────────────┐
│                    Aurora Chat Request                          │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  buildUserContext() - מורחב:                                    │
│                                                                │
│  ## תאריכים ומעקב (חדש!)                                        │
│  - תאריך נוכחי: 2026-01-30                                      │
│  - תוכנית חיים פעילה מאז: 2026-01-15                            │
│  - שבוע נוכחי: 3/12                                             │
│                                                                │
│  ## משימות באיחור (חדש!)                                        │
│  - "התאמנות בוקר" (due: 2026-01-28) - 2 ימים באיחור            │
│  - "פגישה עם מנטור" (due: 2026-01-29) - יום באיחור              │
│                                                                │
│  ## Milestone שבועי                                             │
│  - שבוע 2: "ביסוס שגרת בוקר" - לא הושלם (הסתיים 2026-01-28)     │
│  - שבוע 3 (נוכחי): "הרחבת הרגלים" - בתהליך                      │
│                                                                │
│  ## משימות להיום                                                │
│  - "מדיטציה 10 דקות" (due: היום)                                │
│  - "קריאה 30 דקות" (due: היום)                                  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## שיפור ה-Edge Function

### עדכון buildUserContext()

```typescript
// Add to aurora-chat/index.ts

// Fetch overdue tasks
const overdueTasksRes = await supabase
  .from('aurora_checklist_items')
  .select('*, aurora_checklists!inner(title)')
  .eq('aurora_checklists.user_id', userId)
  .eq('is_completed', false)
  .lt('due_date', new Date().toISOString().split('T')[0]);

// Fetch today's tasks
const todayTasksRes = await supabase
  .from('aurora_checklist_items')
  .select('*, aurora_checklists!inner(title)')
  .eq('aurora_checklists.user_id', userId)
  .eq('is_completed', false)
  .eq('due_date', new Date().toISOString().split('T')[0]);

// Fetch life plan status
const lifePlanRes = await supabase
  .from('life_plans')
  .select('*, life_plan_milestones(*)')
  .eq('user_id', userId)
  .eq('status', 'active')
  .single();

// Build context with dates
const overdueTasks = overdueTasksRes.data || [];
const todayTasks = todayTasksRes.data || [];
const lifePlan = lifePlanRes.data;

// Add to context string...
```

### עדכון System Prompt

```typescript
// Add to Hebrew system prompt:

## מעקב תאריכים ומשימות
אתה מודע לתאריכים ולמצב המשימות של המשתמש.

כשמתחילה שיחה חדשה ויש משימות באיחור:
1. שאל בעדינות מה קרה - לא בתוקפנות
2. הצע לעדכן את התאריך אם צריך
3. עזור למשתמש להבין את החסם

דוגמאות:
- "הי! שמתי לב שהמשימה 'פגישה עם מנטור' הייתה אמורה לקרות אתמול. איך הלך?"
- "רציתי לשאול על השבוע הקודם בתוכנית - הצלחת להשלים את היעדים?"

## סימון משימות
כשמשתמש אומר שביצע משימה:
- [task:complete:שם_רשימה:שם_משימה] - סמן כהושלם
- אם לא ברור איזו משימה - שאל
- תמיד חגוג הצלחה!

כשמשתמש מבקש לדחות:
- [task:reschedule:שם_רשימה:שם_משימה:YYYY-MM-DD]
- אל תשפוט, פשוט עזור

כשמשתמש השלים שבוע בתוכנית:
- [milestone:complete:מספר_שבוע]
```

---

## עדכון processActionTags()

```typescript
// In useAuroraChat.tsx

// Task completion with date tracking
const taskCompleteMatches = [...content.matchAll(/\[task:complete:(.+?):(.+?)\]/g)];
for (const match of taskCompleteMatches) {
  const checklistTitle = match[1].trim();
  const itemContent = match[2].trim();
  await completeChecklistItem(checklistTitle, itemContent);
}

// Task reschedule
const taskRescheduleMatches = [...content.matchAll(/\[task:reschedule:(.+?):(.+?):(\d{4}-\d{2}-\d{2})\]/g)];
for (const match of taskRescheduleMatches) {
  const checklistTitle = match[1].trim();
  const itemContent = match[2].trim();
  const newDate = match[3];
  await rescheduleChecklistItem(checklistTitle, itemContent, newDate);
}

// Milestone completion
const milestoneCompleteMatches = [...content.matchAll(/\[milestone:complete:(\d+)\]/g)];
for (const match of milestoneCompleteMatches) {
  const weekNumber = parseInt(match[1]);
  await completeMilestone(weekNumber);
}
```

---

## קבצים לשינוי

| קובץ | שינוי |
|------|-------|
| **Migration חדש** | הוספת due_date, completed_at, start_date, end_date |
| `supabase/functions/aurora-chat/index.ts` | שליפת משימות באיחור + הוספה ל-context |
| `supabase/functions/generate-launchpad-summary/index.ts` | חישוב תאריכי milestone בעת יצירה |
| `src/hooks/aurora/useAuroraChat.tsx` | עיבוד תגיות חדשות + פונקציות reschedule/complete |
| `src/hooks/aurora/useChecklistsData.tsx` | הוספת rescheduleItem, completeMilestone |
| `src/components/dashboard/unified/ChecklistsCard.tsx` | הצגת תאריכי יעד |
| `src/components/dashboard/unified/LifePlanCard.tsx` | הצגת תאריכי milestone |

---

## UI - הצגת תאריכים

### בצ'קליסט

```text
┌─────────────────────────────────────────┐
│ 🏗️ הרגלים לבנות                         │
├─────────────────────────────────────────┤
│ ☐ התאמנות בוקר      📅 היום            │
│ ☐ מדיטציה 10 דק'    📅 מחר             │
│ ⚠️ פגישה עם מנטור   📅 אתמול (באיחור!) │
│ ☑ קריאה 30 דקות    ✓ הושלם 28/01       │
└─────────────────────────────────────────┘
```

### ב-Milestone

```text
┌─────────────────────────────────────────┐
│ 📅 שבוע 3: הרחבת הרגלים                  │
│ 23/01 - 29/01                           │
├─────────────────────────────────────────┤
│ ⏰ נותרו 2 ימים                          │
│ ☐ משימה 1                               │
│ ☐ משימה 2                               │
│ ☑ משימה 3                               │
└─────────────────────────────────────────┘
```

---

## דוגמת שיחה עם Aurora

```text
[Aurora מזהה משימות באיחור ושבוע שלא הושלם]

Aurora: "הי! 👋 איך היום שלך?

אגב, שמתי לב שהמשימה 'פגישה עם מנטור' הייתה מתוכננת לאתמול. 
הצלחת לקיים אותה, או שנדחה?"

User: "כן, דיברנו בטלפון"

Aurora: "מעולה! 🎉 סימנתי את זה כהושלם.
[task:complete:צעדים לקריירה:פגישה עם מנטור]

איך היה? למדת משהו חדש?"

---

User: "לא הספקתי להתאמן השבוע"

Aurora: "קורה. מה הכי הפריע - זמן, מוטיבציה, או משהו אחר?
אם רוצה, נוכל לקבוע תאריך חדש ריאלי יותר. 
מתי תרצה לנסות שוב?"

User: "נגיד יום שישי"

Aurora: "מסודר 📅
[task:reschedule:הרגלים לבנות:התאמנות בוקר:2026-01-31]

יום שישי בבוקר מתאים? אני אזכיר לך 😊"
```

---

## סיכום טכני

| פריט | כמות |
|------|------|
| Migration חדש | 1 |
| שינויים ב-Edge functions | 2 |
| שינויים ב-Hooks | 2 |
| שינויים ב-Components | 2 |
| תגיות חדשות ל-Aurora | 3 |

