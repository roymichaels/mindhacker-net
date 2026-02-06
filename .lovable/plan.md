
## תיקון באגים קריטיים במערכת ההיפנוזה

### הבעיות שזיהיתי

**1. 10 קולות מנגנים במקביל**
הלוגים מראים ש-`[TTS] Script first 200 chars:` הודפס 4 פעמים - מה שאומר ש-`synthesizeAndPlay` נקרא מספר פעמים. כל לחיצה על pause/start יוצרת instance חדש של TTS בלי לעצור את הקודמים.

**2. התחלה איטית**
ElevenLabs לוקח זמן לסנתז טקסטים ארוכים בעברית. אין אינדיקציה ויזואלית שמחכים ל-TTS, אז המשתמש לוחץ שוב ושוב.

**3. חוסר נעילה (mutex)**
אין מנגנון שמונע קריאות מקבילות ל-synthesis.

---

### הפתרון

#### שלב 1: נעילת סינתזה (Synthesis Lock)

הוספת ref שמונע קריאות מקבילות:

```typescript
const isSynthesizingRef = useRef(false);

const synthesizeAndPlay = async (...) => {
  // Block duplicate calls
  if (isSynthesizingRef.current) {
    console.log('[TTS] Synthesis already in progress, ignoring duplicate call');
    return;
  }
  isSynthesizingRef.current = true;
  
  try {
    // ... existing synthesis logic
  } finally {
    isSynthesizingRef.current = false;
  }
};
```

#### שלב 2: עצירה מלאה לפני הפעלה מחדש

ב-`togglePlayPause`, נוסיף עצירה מלאה לפני שמתחילים מחדש:

```typescript
const togglePlayPause = () => {
  if (state === 'playing') {
    // Pause - stop everything
    setState('paused');
    playingRef.current = false;
    stopCurrentAudio();
    stopBrowserSpeech();
  } else if (state === 'paused') {
    // Resume - FIRST cleanup any lingering audio, THEN restart
    stopCurrentAudio();
    stopBrowserSpeech();
    
    setState('playing');
    playingRef.current = true;
    if (script) {
      playScript(script, cachedAudioUrl || undefined);
    }
  }
};
```

#### שלב 3: אינדיקציית "מכין קול" (Synthesizing State)

הוספת מצב חדש שמראה למשתמש שמחכים ל-TTS:

```typescript
type SessionState = 'generating' | 'synthesizing' | 'playing' | 'paused' | 'complete';

// In synthesizeAndPlay, before calling ElevenLabs:
setState('synthesizing');

// UI shows "מכין את הקול..." with spinner
```

#### שלב 4: שיפור ה-Karaoke Scroll

וידוא שה-scroll container מוגדר נכון עם `data-scroll-container`:

```typescript
<ScrollArea data-scroll-container className="flex-1 px-4 sm:px-6">
  <KaraokeText 
    text={sanitizeScriptForTTS(script.fullScript)}
    progress={audioProgress}
    isRTL={isRTL}
  />
</ScrollArea>
```

#### שלב 5: ניקוי מלא ב-fullCleanup

הוספת reset של ה-synthesis lock:

```typescript
const fullCleanup = useCallback(() => {
  playingRef.current = false;
  isSynthesizingRef.current = false; // Reset synthesis lock
  clearAllTimeouts();
  stopCurrentAudio();
  stopBrowserSpeech();
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
    abortControllerRef.current = null;
  }
}, [clearAllTimeouts]);
```

---

### קבצים לשינוי

| קובץ | שינוי |
|------|-------|
| `src/components/dashboard/HypnosisModal.tsx` | הוספת synthesis lock, מצב synthesizing, תיקון togglePlayPause, שיפור scroll |

---

### פרטים טכניים

**בעיית השורש:** ב-`togglePlayPause` (שורה 643-657), כשחוזרים מ-pause ל-play, נקראת `playScript()` שמפעילה TTS חדש. אם המשתמש לחץ 4 פעמים על pause/start בזמן שה-TTS עדיין לא הספיק להתחיל, נוצרו 4 instances במקביל.

**הפתרון המרכזי:**
1. `isSynthesizingRef` - מונע קריאות כפולות
2. `stopCurrentAudio()` לפני כל השמעה חדשה
3. מצב `synthesizing` עם spinner - מונע לחיצות כפולות כי הכפתור יושבת

**זמן השינוי:** קצר - שינויים ממוקדים בקובץ אחד

---

### סיכום

התיקון יבטיח ש:
1. רק instance אחד של TTS פעיל בכל רגע
2. המשתמש רואה "מכין קול" במקום להרגיש שזה תקוע
3. לחיצות כפולות על pause/start לא יוצרות קולות מרובים
4. הטקסט גולל אוטומטית עם הקול (hands-free karaoke)
