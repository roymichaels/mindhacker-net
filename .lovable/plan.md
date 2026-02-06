
## תיקון מערכת ה-TTS לסשן ההיפנוזה

### מה מצאתי

בדקתי ומצאתי שהבעיה היא **לא ב-ElevenLabs עצמו** - ה-API עובד (הרצתי בדיקה ישירה וקיבלתי 56KB אודיו). הבעיה היא ב**מערכת ה-caching**:

1. מפתח ה-cache מכיל תווים עבריים ונקודותיים (`שבוע_1:_ניקוי_רעלים...`)
2. זה גורם לשגיאת Storage: `Invalid key` - הקובץ לא נשמר בכלל
3. המערכת מנסה לנגן מ-cache שלא קיים או פגום
4. התוצאה: "השמעה שקטה" - ה-UI מראה שמנגן אבל אין קול

### הפתרון

#### שלב 1: תיקון מפתח ה-cache (hypnosis.ts)
נקי את מפתח ה-cache מתווים בעייתיים:
- הסרת נקודותיים (:) 
- המרת תווים עבריים ל-hash קצר (Base64 של UTF8)
- שמירה על מבנה קריא אך בטוח לאחסון

```text
לפני: personalized_שבוע_1:_ניקוי_רעלים_0_he_2026-02-06_morning
אחרי: personalized_YzljZjA4_0_he_2026-02-06_morning
```

#### שלב 2: שיפור זיהוי cache פגום (HypnosisModal.tsx)
אם ה-cache לא עובד:
- לא לנסות לשמוע ממנו
- לעבור ישר לסינתזה חיה
- לוג ברור מה קרה

#### שלב 3: הוספת fallback חכם יותר (voice.ts)
אם ה-audio נטען אבל "שקט" (0 bytes או לא מתנגן):
- לזהות את זה בזמן
- לעבור לסינתזה חדשה במקום להמשיך בשקט

---

### קבצים לשינוי

| קובץ | שינוי |
|------|-------|
| `src/services/hypnosis.ts` | ניקוי `generateCacheKey()` מתווים בעייתיים |
| `supabase/functions/cache-hypnosis-audio/index.ts` | ניקוי נתיב הקובץ מתווים בעייתיים |
| `src/components/dashboard/HypnosisModal.tsx` | שיפור זיהוי cache פגום + fallback ישיר |
| `src/services/voice.ts` | בדיקת audio size לפני ניסיון השמעה |

---

### פרטים טכניים

#### generateCacheKey - לפני
```typescript
const goalHash = options.goal
  .toLowerCase()
  .replace(/\s+/g, '_')
  .substring(0, 30);
```

#### generateCacheKey - אחרי
```typescript
// Create a safe hash using only ASCII characters
const goalBytes = new TextEncoder().encode(options.goal);
const goalHash = btoa(String.fromCharCode(...goalBytes.slice(0, 12)))
  .replace(/[^a-zA-Z0-9]/g, '')
  .substring(0, 16);
```

#### cache-hypnosis-audio - ניקוי נתיב
```typescript
// Sanitize the cache key for storage path
const safeCacheKey = cacheKey
  .replace(/[^a-zA-Z0-9_-]/g, '_')
  .substring(0, 100);

const audioPath = `${userId}/${safeCacheKey}/full_session.mp3`;
```

#### HypnosisModal - בדיקת cache
```typescript
// When trying cached audio
if (cachedUrl && !badCachedAudioRef.current) {
  const signedUrl = await getCachedAudioUrl(cachedUrl);
  
  // Quick HEAD request to verify audio exists and has content
  try {
    const headCheck = await fetch(signedUrl, { method: 'HEAD' });
    const contentLength = headCheck.headers.get('content-length');
    if (!headCheck.ok || !contentLength || parseInt(contentLength) < 1000) {
      console.warn('Cached audio invalid or empty, falling back to synthesis');
      badCachedAudioRef.current = true;
      // Continue to synthesize below
    }
  } catch {
    badCachedAudioRef.current = true;
  }
}
```

---

### סיכום

השינויים האלה יבטיחו ש:
1. מפתחות cache יהיו תמיד בטוחים לאחסון (ללא תווים מיוחדים)
2. אם ה-cache פגום או ריק - המערכת תזהה ותעבור לסינתזה חיה
3. אודיו ElevenLabs v3 ינוגן כמצופה עם הקול "Sarah"
