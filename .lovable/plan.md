
# תיקון שגיאת ה-Publishing

## הבעיה שזוהתה
הבילד עובר בהצלחה (4646 modules transformed), אבל ה-publish נכשל. הבעיה העיקרית:

**תיקייה חסרה:** `public/icons/` לא קיימת, אבל הקוד מפנה אליה:
- `vite.config.ts` שורה 22: `includeAssets: ["icons/*", ...]`
- `custom-sw.js` שורות 92-93: `/icons/icon-192x192.png` ו-`/icons/icon-96x96.png`

כאשר workbox מנסה לאסוף את קבצי ה-PWA, הוא נכשל כי התיקייה לא קיימת.

## הפתרון

### שלב 1: עדכון vite.config.ts
הסרת הפניה ל-`icons/*` ושימוש בקבצים הקיימים בלבד:

```typescript
// שורה 22
includeAssets: ["robots.txt", "sitemap.xml", "*.png"],
```

### שלב 2: עדכון custom-sw.js
החלפת הפניות לאייקונים חסרים בקבצים שקיימים:

```javascript
// שורות 92-93
icon: '/pwa-192x192.png',
badge: '/favicon.png',
```

### שלב 3: עדכון push-notifications edge function
אותו שינוי לאייקונים:

```typescript
// כל הפניות ל-/icons/icon-*.png יוחלפו ב-/pwa-192x192.png
```

## פרטים טכניים

### קבצים לעריכה:
1. `vite.config.ts` - שורה 22
2. `public/custom-sw.js` - שורות 92-93
3. `supabase/functions/push-notifications/index.ts` - שורות 258-259, 492

### קבצים קיימים ב-public/:
- `logo.png` - הלוגו הראשי
- `pwa-192x192.png` - אייקון PWA
- `pwa-512x512.png` - אייקון PWA גדול
- `favicon.png` - אייקון קטן
- `apple-touch-icon.png` - אייקון iOS

## תוצאה צפויה
לאחר התיקון, workbox יוכל לאסוף את כל הקבצים הנדרשים והפרסום יעבור בהצלחה.
