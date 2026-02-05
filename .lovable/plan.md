
# אפקט קריוקי לטקסט ההיפנוזה

## הרעיון
במקום להציג את כל הטקסט בבת אחת, הטקסט יתגלה בהדרגה בזמן שהאודיו מתנגן - בדיוק כמו קריוקי. המילים יהפכו "מאפורות" (מעומעמות) ל"מוארות" (בהירות) בהתאם לזמן הנוכחי של האודיו.

## איך זה יעבוד
- חישוב אחוז ההתקדמות באודיו לפי `currentTime / duration`
- פיצול הטקסט למילים
- הצגת כל המילים, כאשר מילים "שכבר נקראו" מוארות ומילים עתידיות מעומעמות
- אנימציה חלקה של המעבר בין המצבים

```text
┌─────────────────────────────────────────┐
│  ████████████████ ░░░░░░░░░░░░░░░░░░░░  │
│  ▲ טקסט שכבר נקרא    ▲ טקסט שעדיין לא  │
│    (מואר - 100%)        (מעומעם - 40%)  │
└─────────────────────────────────────────┘
```

---

## פרטים טכניים

### 1. State חדש ב-HypnosisModal
```typescript
const [audioProgress, setAudioProgress] = useState(0); // 0-1
```

### 2. עדכון קריאות ל-playAudioUrl
הוספת callback של `onTimeUpdate` לכל הקריאות:
```typescript
await playAudioUrl(audioUrl, {
  onTimeUpdate: (currentTime, duration) => {
    setAudioProgress(duration > 0 ? currentTime / duration : 0);
  },
  onStart: markVoiceStarted,
  onEnd: onComplete,
});
```

### 3. קומפוננטת KaraokeText חדשה
קומפוננטה שמקבלת טקסט + אחוז התקדמות ומציגה אפקט קריוקי:

```typescript
interface KaraokeTextProps {
  text: string;
  progress: number; // 0-1
  isRTL?: boolean;
}

function KaraokeText({ text, progress, isRTL }: KaraokeTextProps) {
  const words = text.split(/\s+/);
  const highlightedWordCount = Math.floor(words.length * progress);
  
  return (
    <p className="text-lg leading-loose whitespace-pre-wrap">
      {words.map((word, index) => (
        <span
          key={index}
          className={cn(
            "transition-colors duration-300",
            index < highlightedWordCount 
              ? "text-foreground" // מואר
              : "text-foreground/40" // מעומעם
          )}
        >
          {word}{' '}
        </span>
      ))}
    </p>
  );
}
```

### 4. אוטו-סקרול חכם
הוספת מנגנון שגולל את התצוגה אוטומטית למקום הנוכחי בטקסט:
```typescript
// גלילה אוטומטית למילה הנוכחית
useEffect(() => {
  if (state !== 'playing' || !scrollContainerRef.current) return;
  
  const container = scrollContainerRef.current;
  const scrollPosition = (audioProgress * container.scrollHeight) - (container.clientHeight / 2);
  container.scrollTo({ top: Math.max(0, scrollPosition), behavior: 'smooth' });
}, [audioProgress, state]);
```

### 5. איפוס בעת השהיה/חידוש
כאשר המשתמש משהה ומחדש, נשמור את ה-progress האחרון ונמשיך ממנו.

---

## קבצים שישתנו

| קובץ | שינוי |
|------|-------|
| `src/components/dashboard/HypnosisModal.tsx` | הוספת state, עדכון playAudioUrl, הוספת KaraokeText ואוטו-סקרול |

---

## התנהגות צפויה

1. **מצב Generating** - ללא שינוי
2. **מצב Playing** - הטקסט מתגלה בהדרגה בסנכרון עם האודיו
3. **מצב Paused** - הטקסט נשאר במצב הנוכחי
4. **מצב Complete** - כל הטקסט מואר
5. **מצב Muted** - האפקט עדיין עובד לפי הזמן החזוי (לפי מספר מילים)
