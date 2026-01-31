
# תוכנית: הוספת כפתור restart וקאשינג של סקריפטים והקלטות היפנוזה

## סקירה כללית
1. הוספת כפתור "חזור להתחלה" (חץ שמאלה) בממשק הנגן
2. שמירת סקריפטים שנוצרו בטבלה ייעודית כדי לחסוך יצירה חוזרת ב-AI
3. **כן, זה אפשרי!** - שמירת קבצי אודיו ב-Storage כדי לחסוך TTS בפעמים הבאות

## ארכיטקטורת הקאשינג

### לוגיקת הקאשינג:
- **Script Cache**: שמירת הסקריפט המלא ב-DB לאחר יצירה
- **Audio Cache**: שמירת כל סגמנט אודיו ב-Storage לאחר יצירה
- **Cache Key**: `{user_id}_{ego_state}_{goal_hash}_{duration}_{language}`

### זרימה חדשה:
```
משתמש מתחיל סשן
     ↓
בדיקה: האם יש סקריפט+אודיו בקאש?
     ↓
    כן → טען וניגון מיידי (~2 שניות)
    לא → צור סקריפט → צור אודיו → שמור בקאש → נגן
```

---

## שלבי הביצוע

### שלב 1: יצירת טבלת קאש לסקריפטים ואודיו
```sql
CREATE TABLE hypnosis_script_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cache_key TEXT NOT NULL,
  ego_state TEXT NOT NULL,
  goal TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  language TEXT NOT NULL DEFAULT 'he',
  script_data JSONB NOT NULL,
  audio_paths JSONB, -- Array of segment audio file paths in Storage
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  use_count INTEGER DEFAULT 1,
  UNIQUE(user_id, cache_key)
);

-- RLS
ALTER TABLE hypnosis_script_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own cache" ON hypnosis_script_cache 
  FOR ALL USING (auth.uid() = user_id);
```

### שלב 2: יצירת Edge Function לקאשינג אודיו
יצירת `supabase/functions/cache-hypnosis-audio/index.ts`:
- מקבל סגמנטים של סקריפט
- יוצר אודיו לכל סגמנט דרך ElevenLabs
- מעלה לStorage (bucket: `hypnosis-cache`)
- מחזיר נתיבי הקבצים

### שלב 3: עדכון HypnosisSession.tsx

#### 3a: הוספת כפתור Restart
```tsx
// הוספת SkipBack icon לייבוא
import { SkipBack } from 'lucide-react';

// פונקציית restart
const restartSession = () => {
  impact('medium');
  stopBrowserSpeech();
  setCurrentSegmentIndex(0);
  setProgress(0);
  setElapsedTime(0);
  startTimeRef.current = Date.now();
  
  if (scriptRef.current) {
    playSegment(0, scriptRef.current);
  }
};

// כפתור ב-UI (ליד כפתור Play/Pause)
<Button onClick={restartSession}>
  <SkipBack className="w-5 h-5" />
</Button>
```

#### 3b: לוגיקת קאשינג
```tsx
// לפני יצירת סקריפט חדש - בדיקת קאש
const checkCache = async (cacheKey: string) => {
  const { data } = await supabase
    .from('hypnosis_script_cache')
    .select('*')
    .eq('user_id', user.id)
    .eq('cache_key', cacheKey)
    .single();
  return data;
};

// שמירה לקאש לאחר יצירה
const saveToCache = async (cacheKey: string, script: HypnosisScript, audioPaths?: string[]) => {
  await supabase.from('hypnosis_script_cache').upsert({
    user_id: user.id,
    cache_key: cacheKey,
    ego_state: egoStateId,
    goal,
    duration_minutes: duration,
    language,
    script_data: script,
    audio_paths: audioPaths,
    last_used_at: new Date().toISOString(),
  });
};
```

### שלב 4: עדכון לוגיקת playSegment לתמיכה בקאש
```tsx
const playSegment = async (index: number, scriptOverride?: HypnosisScript, cachedAudioPaths?: string[]) => {
  // אם יש אודיו מקאש - נגן אותו ישירות
  if (cachedAudioPaths && cachedAudioPaths[index]) {
    const audioUrl = supabase.storage
      .from('hypnosis-cache')
      .getPublicUrl(cachedAudioPaths[index]).data.publicUrl;
    
    await playAudioUrl(audioUrl, {
      onEnd: () => playSegment(index + 1, scriptOverride, cachedAudioPaths),
    });
    return;
  }
  
  // אחרת - יצירת אודיו חדש (הלוגיקה הקיימת)
  // ...existing TTS code...
};
```

### שלב 5: יצירת Storage Bucket
הוספת bucket חדש `hypnosis-cache` עם RLS מתאים.

---

## עדכון קבצים

| קובץ | שינוי |
|------|-------|
| `src/pages/HypnosisSession.tsx` | כפתור restart, לוגיקת קאשינג |
| `src/services/hypnosis.ts` | פונקציות לבדיקת ושמירת קאש |
| `supabase/functions/cache-hypnosis-audio/index.ts` | Edge function חדש |
| Migration SQL | טבלת קאש + Storage bucket |
| `src/i18n/translations/he.ts` | תרגום "חזור להתחלה" |
| `src/i18n/translations/en.ts` | תרגום "Restart" |

---

## יתרונות

| מצב | זמן טעינה | עלות AI | עלות TTS |
|-----|-----------|---------|----------|
| **ללא קאש** | 30-40 שניות | מלאה | מלאה |
| **עם קאש סקריפט** | 15-20 שניות | 0 | מלאה |
| **עם קאש מלא** | 2-3 שניות | 0 | 0 |

## הערות טכניות

### ניהול קאש:
- סקריפטים נשמרים לפי משתמש + מטרה + ארכיטיפ + משך
- קאש מתעדכן ב-`last_used_at` בכל שימוש
- אפשר להוסיף job לניקוי קאש ישן (מעל 30 יום)

### Storage:
- קבצי אודיו נשמרים בפורמט: `{user_id}/{cache_key}/segment_{index}.mp3`
- גודל משוער: ~1MB לדקה של אודיו
- Storage עם RLS למשתמש עצמו בלבד

### גמישות:
- משתמש יכול לבקש יצירת סקריפט חדש גם אם יש קאש
- כפתור "רענן" אופציונלי למחיקת קאש ויצירה מחדש
