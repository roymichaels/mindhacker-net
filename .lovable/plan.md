
# תוכנית: שינוי הדאשבורד למראה כמו Skool/Major Apps

## סקירה כללית

נשנה את דף `/dashboard` למסך ראשי בסגנון אפליקציה חברתית מודרנית שמשלב את הקהילה במרכז, עם גישה מהירה לכל תכני המשתמש.

---

## מבנה חדש של הדאשבורד

```text
┌────────────────────────────────────────────────────────────────────┐
│                          HEADER (קיים)                              │
├─────────────┬───────────────────────────────────┬──────────────────┤
│             │                                   │                  │
│   SIDEBAR   │         MAIN CONTENT              │  RIGHT SIDEBAR   │
│   (שמאל)    │           (מרכז)                  │    (ימין)        │
│             │                                   │                  │
│  ┌────────┐ │  ┌───────────────────────────┐   │  ┌────────────┐  │
│  │ Profile│ │  │     Quick Access Bar      │   │  │ My Courses │  │
│  │  Card  │ │  │  (כפתורים מהירים)         │   │  │   Preview  │  │
│  └────────┘ │  └───────────────────────────┘   │  └────────────┘  │
│             │                                   │                  │
│  ┌────────┐ │  ┌───────────────────────────┐   │  ┌────────────┐  │
│  │  Nav   │ │  │                           │   │  │ Recordings │  │
│  │ Items  │ │  │    COMMUNITY FEED         │   │  │   List     │  │
│  │        │ │  │   (פוסטים מהקהילה)        │   │  └────────────┘  │
│  │ - Feed │ │  │                           │   │                  │
│  │ - Events│ │ │                           │   │  ┌────────────┐  │
│  │ - Members│ │                           │   │  │  Sessions  │  │
│  │ - Leaders│ │                           │   │  │    Info    │  │
│  └────────┘ │  │                           │   │  └────────────┘  │
│             │  └───────────────────────────┘   │                  │
│  ┌────────┐ │                                   │  ┌────────────┐  │
│  │ Online │ │                                   │  │ Affiliate  │  │
│  │ Members│ │                                   │  │   Stats    │  │
│  └────────┘ │                                   │  └────────────┘  │
│             │                                   │                  │
└─────────────┴───────────────────────────────────┴──────────────────┘
```

---

## שינויים עיקריים

### 1. יצירת Layout חדש לדאשבורד
**קובץ חדש:** `src/components/dashboard/DashboardLayout.tsx`

- **Sidebar שמאלי** (כמו CommunityLayout):
  - כרטיס פרופיל עם אווטאר, שם, רמה ונקודות
  - פס התקדמות לרמה הבאה
  - ניווט: פיד, אירועים, חברים, לידרבורד
  - חברים מחוברים (realtime)

- **תוכן מרכזי**:
  - Quick Actions Bar (כפתורים מהירים)
  - Community Feed משולב

- **Sidebar ימני** (מוסתר במובייל):
  - הקורסים שלי (קומפקטי)
  - ההקלטות שלי (קומפקטי)
  - פגישות מתוכננות
  - מנויים פעילים
  - שותפים (affiliate)

### 2. עדכון UserDashboard.tsx
- שימוש ב-DashboardLayout במקום Layout הקיים
- הקהילה במרכז במקום Tabs
- תכנים אחרים בסייד בר ימני

### 3. קומפוננטות קומפקטיות חדשות
**קבצים חדשים:**
- `src/components/dashboard/CompactCourses.tsx` - רשימת קורסים קומפקטית
- `src/components/dashboard/CompactRecordings.tsx` - רשימת הקלטות קומפקטית
- `src/components/dashboard/CompactSessions.tsx` - פגישות קומפקטי
- `src/components/dashboard/QuickActions.tsx` - כפתורי פעולה מהירים

### 4. מובייל - עיצוב מותאם
- סייד בר שמאלי: מוסתר במובייל, נגיש דרך hamburger
- סייד בר ימני: מוסתר במובייל, נגיש דרך tabs
- תפריט תחתון (Bottom Navigation) למובייל

---

## מבנה הקבצים

```text
src/components/dashboard/
├── DashboardLayout.tsx       # NEW - Layout ראשי
├── DashboardSidebar.tsx      # NEW - Sidebar שמאלי
├── DashboardRightPanel.tsx   # NEW - Panel ימני
├── QuickActions.tsx          # NEW - פעולות מהירות
├── CompactCourses.tsx        # NEW - קורסים קומפקטי
├── CompactRecordings.tsx     # NEW - הקלטות קומפקטי
├── CompactSessions.tsx       # NEW - פגישות קומפקטי
├── MyCourses.tsx             # KEEP - לדף מלא
├── MyRecordings.tsx          # KEEP - לדף מלא
├── MySubscriptions.tsx       # KEEP - לדף מלא
└── MyAffiliatePanel.tsx      # KEEP - לדף מלא
```

---

## תרגומים חדשים

```typescript
// he.ts - נוסיף ל-dashboard
dashboard: {
  // ... קיים
  quickActions: "פעולות מהירות",
  viewAllCourses: "כל הקורסים",
  viewAllRecordings: "כל ההקלטות", 
  scheduledSessions: "פגישות מתוכננות",
  noScheduledSessions: "אין פגישות מתוכננות",
  continueWhereYouLeft: "המשך מאיפה שהפסקת",
  yourContent: "התוכן שלך",
  communityActivity: "פעילות בקהילה",
}
```

---

## רספונסיביות

| מסך | Layout |
|-----|--------|
| Desktop (xl) | 3 עמודות: Sidebar + Content + Right Panel |
| Tablet (lg) | 2 עמודות: Sidebar + Content |
| Mobile | עמודה אחת + Bottom Nav + Sheets |

---

## סדר ביצוע

| שלב | משימה |
|-----|--------|
| 1 | יצירת DashboardLayout.tsx עם 3-column layout |
| 2 | יצירת DashboardSidebar.tsx (פרופיל + ניווט) |
| 3 | יצירת קומפוננטות קומפקטיות לסייד בר ימני |
| 4 | יצירת QuickActions.tsx |
| 5 | עדכון UserDashboard.tsx לשימוש ב-Layout החדש |
| 6 | הוספת Bottom Navigation למובייל |
| 7 | הוספת תרגומים חדשים |

---

## סיכום טכני

- **6 קומפוננטות חדשות** בתיקיית dashboard
- **עדכון 1 דף** (UserDashboard.tsx)
- **תרגומים חדשים** ל-he.ts ו-en.ts
- **שילוב CommunityFeed** כתוכן מרכזי
- **שימוש ב-Supabase Presence** לחברים מחוברים
- **RTL תואם** מלא
