
# תוכנית: הסרת Widgets למשתמשים מחוברים + תפריט תחתון גלובלי עם צ'אט

## סקירת המצב הנוכחי

### בעיות שזוהו:
1. **Widgets (ChatWidget, WhatsAppButton, LiveActivityFeed)** מוצגים לכל המשתמשים - גם למחוברים וגם לאורחים
2. **התפריט התחתון (DashboardBottomNav)** מוצג רק בדף `/dashboard` כי הוא חלק מ-`DashboardLayout`
3. דפים מוגנים אחרים כמו `/community`, `/community/events`, `/courses` לא מציגים את התפריט התחתון

### מה נעשה:
1. נסתיר את ה-Widgets (ChatWidget, WhatsAppButton, LiveActivityFeed, ProgressiveEngagement) ממשתמשים מחוברים
2. ניצור רכיב תפריט תחתון גלובלי חדש שיופיע בכל הדפים למשתמשים מחוברים
3. נפשט את התפריט ל-2 סימניות בלבד: **דאשבורד** ו**צ'אט**

---

## שינויים טכניים

### 1. רכיב GlobalBottomNav חדש

ניצור רכיב חדש `src/components/GlobalBottomNav.tsx` שיופיע למשתמשים מחוברים בלבד:

```typescript
// src/components/GlobalBottomNav.tsx
- מופיע רק כאשר יש user מחובר (useAuth)
- מופיע רק במובייל (useIsMobile)
- 2 סימניות בלבד: Home ו-MessageCircle (צ'אט)
- ה-Tab של צ'אט פותח את ChatPanel (כמו widget אבל בתוך המסך)
```

| Tab | Icon | Label | Action |
|-----|------|-------|--------|
| דאשבורד | `Home` | "בית" | navigate to `/dashboard` |
| צ'אט | `MessageCircle` | "צ'אט" | פתיחת ChatPanel |

### 2. עדכון App.tsx

```typescript
// הסתרה מותנית של widgets
{!user && <ChatWidget />}
{!user && <LiveActivityFeed />}
{!user && <WhatsAppButton />}
{!user && <ProgressiveEngagement />}

// הוספת ה-bottom nav הגלובלי החדש
<GlobalBottomNav />
```

### 3. הסרת DashboardBottomNav מ-DashboardLayout

מכיוון שה-GlobalBottomNav יופיע גלובלית, נסיר את ה-DashboardBottomNav מ-`DashboardLayout.tsx` כדי למנוע כפילות.

### 4. עדכון UserDashboard ודפים מוגנים

- הוספת `pb-16` (padding-bottom) לדפים מוגנים כדי לפנות מקום לתפריט התחתון
- וידוא שה-ChatPanel נפתח כ-overlay ולא כ-popup קטן כשנפתח מהתפריט התחתון

---

## מבנה קבצים לעריכה

| קובץ | שינוי |
|------|-------|
| `src/components/GlobalBottomNav.tsx` | **חדש** - תפריט תחתון גלובלי למחוברים |
| `src/App.tsx` | הוספת GlobalBottomNav + הסתרת widgets למחוברים |
| `src/components/dashboard/DashboardLayout.tsx` | הסרת DashboardBottomNav |
| `src/components/chat/ChatPanel.tsx` | עדכון לתמיכה ב-fullscreen mode |

---

## פירוט הרכיב החדש

```typescript
// GlobalBottomNav.tsx
const GlobalBottomNav = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const location = useLocation();
  const [chatOpen, setChatOpen] = useState(false);

  // לא מציג אם לא מחובר או לא במובייל
  if (!user || !isMobile) return null;

  // לא מציג בדפי admin
  if (location.pathname.startsWith('/admin')) return null;

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t safe-area-inset-bottom">
        <div className="flex items-center justify-around h-14">
          {/* Dashboard Tab */}
          <NavLink to="/dashboard" ... />
          
          {/* Chat Tab */}
          <button onClick={() => setChatOpen(true)} ... />
        </div>
      </nav>
      
      {/* Chat Panel - fullscreen on mobile */}
      <ChatPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} fullscreen />
    </>
  );
};
```

---

## תוצאה צפויה

```text
┌─────────────────────────────────────────┐
│              אפליקציה                  │
│                                        │
│   (תוכן הדף - דאשבורד/קורסים/קהילה)   │
│                                        │
│                                        │
├─────────────────────────────────────────┤
│   🏠 דאשבורד    │    💬 צ'אט          │  ← תפריט תחתון גלובלי
└─────────────────────────────────────────┘

לעומת אורחים:
┌─────────────────────────────────────────┐
│              דף נחיתה                  │
│                                        │
│   [ChatWidget]  [WhatsApp]  [Activity] │  ← widgets לאורחים בלבד
│                                        │
└─────────────────────────────────────────┘
```

התפריט התחתון יופיע בכל הדפים המוגנים: `/dashboard`, `/courses`, `/community/*`, `/success` וכו'.
