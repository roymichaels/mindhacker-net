

## תוכנית לתיקון הקראוקי שמתחיל לפני הקול והסשן שמסתיים מהר מדי

### סיכום הבעיות שזוהו

בהתבסס על החקירה, זיהיתי שלוש בעיות נפרדות שגורמות להתנהגות הנוכחית:

---

### בעיה 1: הקראוקי מתחיל לפני שהקול מתחיל

**סיבת השורש:**
ב-`synthesizeAndPlay()`, כש-ElevenLabs נכשל (402 quota exceeded), המערכת עוברת ל-Browser TTS. אבל יש בעיה בסדר הפעולות:

1. `synthesizeSpeech()` מחזיר URL מיוחד: `browser-tts://...`
2. `playAudioUrl()` מזהה את זה וקוראת ל-`speakWithBrowser()`
3. `speakWithBrowser()` טוען קולות (voices) - זה יכול לקחת זמן
4. **אבל** ב-`speakWithBrowser()`, ה-callback `onStart` נקראת רק כש-`utterance.onstart` נורה
5. עד שזה קורה, הקראוקי כבר מתחיל להתקדם כי `voiceStarted` כבר הוגדר כ-`true`

**הבעיה הספציפית:**
ב-`playAudioUrl` עבור browser-tts, אין הבחנה בין "התחלנו לדבר" לבין "התחלנו את התהליך". ה-`onStart` נקראת מ-`speakWithBrowser` רק כשהדיבור עצמו מתחיל, אבל אם יש delay בטעינת הקולות, הקראוקי עדיין יכול להתקדם.

---

### בעיה 2: הקול אומר "voing dash" ונעצר

**סיבת השורש:**
Browser TTS בעברית לא תמיד עובד טוב. הקוד הנוכחי מחפש `hebrewVoice`:

```typescript
const hebrewVoice = voices.find(v => v.lang.startsWith('he'));
```

אם לא נמצא קול עברי (או שהקול לא תומך בעברית טוב), הדפדפן עלול:
- להקריא את התווים בצורה מוזרה
- לקרוס באמצע המשפט הראשון
- לסיים אחרי chunk אחד בלבד

**הבעיה הנוספת:**
גם אם יש שגיאה ב-chunk אחד, הקוד עובר ל-chunk הבא:

```typescript
utterance.onerror = (event) => {
  currentChunk++;
  if (currentChunk < chunks.length) {
    speakChunk();
  } else {
    // מסיים את הסשן!
    options.onEnd?.();
  }
};
```

אם כל ה-chunks נכשלים מהר, הסשן מסתיים תוך שניות.

---

### בעיה 3: הסשן מסתיים אחרי דקה בערך

**סיבת השורש:**
כשיש בעיות עם Browser TTS:
1. ה-chunks נכשלים אחד אחרי השני
2. הקוד עובר מ-chunk ל-chunk במהירות
3. כש-`currentChunk >= chunks.length`, נקרא `onEnd()`
4. זה מפעיל את `handleSessionComplete()`

גם אם רק חלק קטן מהטקסט הוקרא (או בכלל לא), הסשן מסומן כ"הושלם".

---

## התיקונים

### תיקון A: לוודא ש-`voiceStarted` מוגדר רק כשהקול באמת מתחיל

**קובץ:** `src/services/voice.ts`

שינויים ב-`speakWithBrowser()`:
- להוסיף flag `actualSpeechStarted` נפרד מ-`hasStarted`
- לקרוא ל-`onStart` רק כש-utterance באמת מתחיל לדבר (לא רק כשהתהליך התחיל)
- **הכי חשוב:** לא להתחיל את ה-progress interval עד שהדיבור באמת התחיל

**קובץ:** `src/components/dashboard/HypnosisModal.tsx`

שינויים:
- להבטיח שהקראוקי לא מתקדם עד ש-`voiceStarted === true`
- הקראוקי צריך להתקדם רק על בסיס `onTimeUpdate`, לא על בסיס זמן עצמאי

---

### תיקון B: טיפול טוב יותר בכשלון Browser TTS

**קובץ:** `src/services/voice.ts`

שינויים ב-`speakWithBrowser()`:
- להוסיף counter לשגיאות רצופות
- אם יותר מ-3 chunks רצופים נכשלים, לעצור ולקרוא ל-`onError` במקום `onEnd`
- להוסיף timeout: אם עברו 10 שניות ושום דבר לא התחיל לדבר, לדווח על שגיאה

**קובץ:** `src/components/dashboard/HypnosisModal.tsx`

שינויים ב-`synthesizeAndPlay()`:
- כשיש `onError` מ-Browser TTS, להציג הודעה למשתמש שהקול לא עובד
- לא לסיים את הסשן אוטומטית - לתת למשתמש אפשרות להמשיך עם מצב מושתק

---

### תיקון C: להוסיף מצב "Muted Fallback" אוטומטי

אם Browser TTS נכשל, במקום לסגור את הסשן, המערכת תעבור אוטומטית למצב מושתק עם:
- הודעת toast שמסבירה שהקול לא זמין
- הקראוקי ממשיך להתקדם בקצב היפנוזה (85 WPM)
- המשתמש יכול לקרוא את הטקסט בעצמו

---

## פרטים טכניים של השינויים

### 1. `src/services/voice.ts` - שיפור `speakWithBrowser()`

```typescript
// הוספת משתנים חדשים
let consecutiveErrors = 0;
const MAX_CONSECUTIVE_ERRORS = 3;
let speechActuallyStarted = false;
let speechStartTimeout: ReturnType<typeof setTimeout> | null = null;

// Timeout לגילוי אם הדיבור לא התחיל
speechStartTimeout = setTimeout(() => {
  if (!speechActuallyStarted && !cancelled) {
    console.warn('Browser TTS failed to start within timeout');
    options.onError?.(new Error('Speech synthesis failed to start'));
  }
}, 10000);

// בתוך speakChunk()
utterance.onstart = () => {
  if (!speechActuallyStarted) {
    speechActuallyStarted = true;
    if (speechStartTimeout) clearTimeout(speechStartTimeout);
    // רק עכשיו קוראים ל-onStart
    options.onStart?.();
  }
  consecutiveErrors = 0; // Reset on success
};

utterance.onerror = (event) => {
  consecutiveErrors++;
  if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
    // יותר מדי שגיאות רצופות - Browser TTS לא עובד
    options.onError?.(new Error('Too many consecutive speech errors'));
    return;
  }
  // המשך לנסות את ה-chunk הבא
  currentChunk++;
  speakChunk();
};
```

### 2. `src/components/dashboard/HypnosisModal.tsx` - טיפול בכשלון TTS

```typescript
// בתוך synthesizeAndPlay(), ב-onError:
onError: (err) => {
  // ...existing code...
  
  // במקום לסגור, לעבור למצב מושתק
  console.warn('Voice playback failed, switching to muted mode');
  setIsMuted(true);
  
  // להציג הודעה
  toast({
    title: language === 'he' ? 'הקול לא זמין' : 'Voice unavailable',
    description: language === 'he' 
      ? 'ממשיכים במצב קריאה. עקוב אחרי הטקסט.' 
      : 'Continuing in reading mode. Follow the text.',
  });
  
  // להתחיל מצב מושתק מאותה נקודה
  startMutedMode(text, onStart, onTimeUpdate, onEnd, currentSessionId);
}
```

### 3. הוספת פונקציה `startMutedMode`

```typescript
const startMutedMode = (
  text: string,
  onStart: () => void,
  onTimeUpdate: (currentTime: number, audioDuration: number) => void,
  onEnd: () => void,
  currentSessionId: number
) => {
  onStart(); // התחל מיד
  
  const wordsPerMinute = 85;
  const words = text.split(/\s+/).length;
  const readingTime = Math.max((words / wordsPerMinute) * 60 * 1000, 60000);
  
  const startTime = Date.now();
  const progressInterval = setInterval(() => {
    if (sessionIdRef.current !== currentSessionId) {
      clearInterval(progressInterval);
      return;
    }
    
    const elapsed = Date.now() - startTime;
    onTimeUpdate(elapsed / 1000, readingTime / 1000);
    
    if (elapsed >= readingTime) {
      clearInterval(progressInterval);
      onEnd();
    }
  }, 100);
};
```

---

## סיכום השינויים

| קובץ | שינוי |
|------|-------|
| `src/services/voice.ts` | הוספת timeout לגילוי כשלון, ספירת שגיאות רצופות, `onStart` רק כשדיבור באמת התחיל |
| `src/components/dashboard/HypnosisModal.tsx` | fallback אוטומטי למצב מושתק, הודעות טובות יותר למשתמש |

---

## התוצאה הצפויה

1. הקראוקי לא יתחיל עד שהקול באמת מתחיל לדבר
2. אם Browser TTS נכשל, המשתמש יקבל הודעה והסשן ימשיך במצב קריאה
3. הסשן לא יסתיים פתאום אחרי דקה - הוא ימשיך לפי משך הזמן המחושב

