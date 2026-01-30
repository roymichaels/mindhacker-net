
# Aurora כמסך בית עם ניווט תמידי

## הבעיה הנוכחית

1. **AuroraLayout משתמש ב-`fixed inset-0`** - מסתיר את כל הניווט
2. **GlobalBottomNav מסתיר את עצמו ב-`/aurora`** - קוד מפורש שמונע את הניווט
3. **אין דרך לצאת מ-Aurora** - חוץ מכפתור "חזור" שעושה `navigate(-1)`

## הפתרון

### שינוי 1: GlobalBottomNav - להציג גם ב-Aurora
**קובץ:** `src/components/GlobalBottomNav.tsx`

הסרת התנאי שמסתיר את הניווט ב-Aurora:
```typescript
// לפני (שורות 18-19):
if (location.pathname.startsWith('/admin')) return null;
if (location.pathname === '/aurora' || location.pathname.startsWith('/aurora/')) return null;

// אחרי:
if (location.pathname.startsWith('/admin')) return null;
// Aurora now shows bottom nav like all other screens
```

### שינוי 2: AuroraLayout - להפוך ללייאאוט רגיל
**קובץ:** `src/components/aurora/AuroraLayout.tsx`

שינויים עיקריים:
1. **הסרת `fixed inset-0`** - במקום זה להשתמש בגובה מחושב
2. **הוספת padding-bottom למובייל** - למניעת חפיפה עם הניווט
3. **הסרת כפתור ה-Back** - הניווט התחתון מחליף אותו

**מבנה חדש:**
```tsx
// Mobile: h-screen with bottom padding for nav
// Desktop: h-screen with sidebar visible

<SidebarProvider defaultOpen={!isMobile}>
  <div 
    className={cn(
      "flex w-full bg-background",
      isMobile ? "h-[100dvh] pb-14" : "h-screen" // pb-14 for bottom nav
    )}
    dir={isRTL ? 'rtl' : 'ltr'}
  >
    {/* Desktop: Aurora sidebar for chat history */}
    {!isMobile && (
      <AuroraSidebar ... />
    )}
    
    <main className="flex-1 flex flex-col min-h-0">
      {/* Simplified header - no back button needed */}
      <AuroraHeader />
      <AuroraChatArea conversationId={activeConversationId} />
    </main>
  </div>
</SidebarProvider>
```

### שינוי 3: AuroraHeader - הפשטה
**בתוך:** `src/components/aurora/AuroraLayout.tsx`

Header פשוט יותר:
- ✅ כותרת Aurora עם אייקון
- ✅ כפתור toggle לסיידבר (בדסקטופ)
- ❌ הסרת כפתור "חזור" - כי יש ניווט תחתון

**Header חדש:**
```tsx
const AuroraHeader = () => {
  const { t, isRTL } = useTranslation();
  const { toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();

  return (
    <header className="h-14 border-b border-border bg-background/95 backdrop-blur flex items-center justify-between px-4 shrink-0">
      {/* Title */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <span className="font-semibold">{t('aurora.name')}</span>
      </div>

      {/* Desktop sidebar toggle */}
      {!isMobile && (
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
      )}
    </header>
  );
};
```

### שינוי 4 (אופציונלי): Mobile sidebar access
במובייל, אם רוצים גישה להיסטוריית שיחות:
- הוספת כפתור hamburger בצד ימין של ה-header
- או: גישה דרך הדשבורד

---

## תוצאה סופית

```text
┌─────────────────────────────────────────────────────────────────────┐
│ MOBILE VIEW                                                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ [≡]  ✨ Aurora                                        [⋮]  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│                                                                     │
│                     [CHAT AREA]                                     │
│                                                                     │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  💬 Input...                                     [🎤] [➤] │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ╔═════════════════════════════════════════════════════════════╗   │
│  ║ 🏠 Dashboard │ 💬 Messages │ ✨ Aurora │ 🛒 Catalog │ 👥   ║   │
│  ╚═════════════════════════════════════════════════════════════╝   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

```text
┌─────────────────────────────────────────────────────────────────────┐
│ DESKTOP VIEW                                                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────┐┌──────────────────────────────────────────┐  │
│  │  Aurora Sidebar  ││                                          │  │
│  │  ──────────────  ││  [✨ Aurora]                      [☰]    │  │
│  │                  ││  ────────────────────────────────────── │  │
│  │  [+ New Chat]    ││                                          │  │
│  │                  ││              [CHAT AREA]                 │  │
│  │  Recent:         ││                                          │  │
│  │  • Chat 1        ││                                          │  │
│  │  • Chat 2        ││                                          │  │
│  │  • Chat 3        ││                                          │  │
│  │                  ││  ┌──────────────────────────────────┐    │  │
│  │                  ││  │  💬 Input...           [🎤] [➤] │    │  │
│  │  ──────────────  ││  └──────────────────────────────────┘    │  │
│  │  [👤 Profile ▼]  ││                                          │  │
│  └──────────────────┘└──────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## סיכום שינויים

| קובץ | שינוי |
|------|-------|
| `src/components/GlobalBottomNav.tsx` | הסרת תנאי הסתרה ב-Aurora |
| `src/components/aurora/AuroraLayout.tsx` | שינוי מ-fixed ל-layout רגיל עם pb-14 במובייל |

---

## יתרונות

1. **ניווט תמידי** - תמיד רואים איך לעבור בין מסכים
2. **Aurora כמסך הבית** - כי זה ה-tab המרכזי
3. **UX עקבי** - אותו פטרן כמו כל שאר האפליקציה
4. **גישה להיסטוריה בדסקטופ** - סיידבר עם רשימת שיחות
