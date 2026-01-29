

# תוכנית: תיקון ספירת מבקרים באנליטיקה

## הבעיה שזוהתה

הבעיה העיקרית היא ש-**כל רענון של הדף יוצר סשן חדש**, כי ה-`session_id` נשמר ב-`sessionStorage` שמתאפס בכל רענון/סגירת טאב. 

הנתונים מראים:
- 132 סשנים ב-7 ימים אחרונים
- כולם עם `is_returning: false`
- כולם מאותו מכשיר/דפדפן (Chrome/Windows/Desktop)

זה אומר שאתה נספר כמבקר חדש **בכל פעם** שהדף נטען מחדש.

## הפתרון המוצע

### 1. שימוש ב-visitor_id כמזהה עיקרי

במקום להסתמך על `session_id` בלבד, נוסיף שדה `visitor_id` לטבלאות ונשתמש בו לספירת מבקרים ייחודיים:

```text
┌─────────────────────────────────────────────────────────┐
│  לפני התיקון                                           │
│  ─────────────────                                      │
│  session_id (sessionStorage) = מתאפס בכל רענון         │
│  ↓                                                      │
│  כל רענון = סשן חדש = "מבקר חדש"                       │
│                                                        │
│  אחרי התיקון                                           │
│  ─────────────────                                      │
│  visitor_id (localStorage) = קבוע לאורך זמן           │
│  ↓                                                      │
│  ספירת מבקרים ייחודיים לפי visitor_id                 │
└─────────────────────────────────────────────────────────┘
```

### 2. שינויים בקוד

**א. עדכון `analytics.ts`:**
- שמירת `visitor_id` בכל טבלה (visitor_sessions, page_views, conversion_events)
- הוספת פונקציית `getVisitorId()` לכל קריאת tracking

**ב. עדכון רכיבי האנליטיקה:**

| רכיב | שינוי |
|------|-------|
| `ConversionMetrics.tsx` | ספירת `COUNT(DISTINCT visitor_id)` במקום `sessions.length` |
| `UserJourney.tsx` | קיבוץ מסעות לפי visitor_id |
| `RealTimeActivity.tsx` | הצגת מבקרים ייחודיים פעילים |
| `EngagementMetrics.tsx` | חישוב ממוצעים לפי מבקר ייחודי |

### 3. עדכון מסד נתונים

הוספת עמודת `visitor_id` לטבלאות:

```sql
ALTER TABLE visitor_sessions ADD COLUMN visitor_id TEXT;
ALTER TABLE page_views ADD COLUMN visitor_id TEXT;
ALTER TABLE conversion_events ADD COLUMN visitor_id TEXT;
```

### 4. שינוי השאילתות באנליטיקה

**לפני:**
```javascript
const totalVisitors = sessions.length;
```

**אחרי:**
```javascript
const uniqueVisitors = new Set(sessions.map(s => s.visitor_id)).size;
```

---

## פרטים טכניים

### שינויים ב-analytics.ts

```typescript
// initSession - הוספת visitor_id
await supabase.from("visitor_sessions").insert({
  session_id: sessionId,
  visitor_id: getVisitorId(), // חדש
  // ...שאר השדות
});

// trackPageView - הוספת visitor_id
await supabase.from("page_views").insert({
  session_id: sessionId,
  visitor_id: getVisitorId(), // חדש
  // ...שאר השדות
});

// trackEvent - הוספת visitor_id
await supabase.from("conversion_events").insert({
  session_id: sessionId,
  visitor_id: getVisitorId(), // חדש
  // ...שאר השדות
});
```

### שינויים ב-ConversionMetrics.tsx

```typescript
// במקום
const totalVisitors = sessions.length;

// נשתמש ב
const uniqueVisitorIds = new Set(
  sessions.map((s: any) => s.visitor_id).filter(Boolean)
);
const totalUniqueVisitors = uniqueVisitorIds.size || sessions.length;
```

### שינויים ב-UserJourney.tsx

```typescript
// קיבוץ מסעות לפי visitor_id במקום session_id
const visitorPaths: Record<string, string[]> = {};
pageViews.forEach((pv: any) => {
  const visitorId = pv.visitor_id || pv.session_id;
  if (!visitorPaths[visitorId]) {
    visitorPaths[visitorId] = [];
  }
  visitorPaths[visitorId].push(pv.page_path);
});
```

---

## יתרונות הפתרון

1. **מדידה מדויקת** - ספירת מבקרים אמיתיים ולא סשנים
2. **תאימות לאחור** - fallback ל-session_id אם אין visitor_id
3. **שיפור הבנת הפאנל** - נתונים שמייצגים משתמשים אמיתיים
4. **זיהוי מבקרים חוזרים** - הבנה טובה יותר של retention

