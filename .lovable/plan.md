
# תוכנית יישום מפורטת: שילוב Libero ב-MindHacker

## סקירה כללית

שילוב מערכת ההיפנוזה של Libero ב-MindHacker — כולל ה-Sphere האלייני, מנוע ה-AI להיפנוזה, מערכת הגיימיפיקציה, ו-TTS.

```
+─────────────────────────────────────────────────────────────────────────+
│                        MindHacker + Libero Integration                  │
├─────────────────┬─────────────────┬─────────────────┬──────────────────┤
│   Phase 1       │   Phase 2       │   Phase 3       │   Phase 4        │
│   Visual        │   Gamification  │   AI Brain      │   Immersive      │
│   Identity      │   System        │   & TTS         │   Sessions       │
├─────────────────┼─────────────────┼─────────────────┼──────────────────┤
│ • Orb Component │ • XP/Level      │ • ai-hypnosis   │ • Session World  │
│ • Theme System  │ • Streaks       │ • generate-script│ • Audio Reactive │
│ • Glass CSS     │ • Achievements  │ • TTS Functions │ • Wormhole Viz   │
│ • Ego States    │ • Tokens        │ • Personalization│ • Breathing      │
└─────────────────┴─────────────────┴─────────────────┴──────────────────┘
```

---

## Phase 1: Visual Identity (שבוע 1)

### 1.1 Orb Component System

**קבצים חדשים:**
```
src/components/orb/
├── Orb.tsx                 # Main wrapper (WebGL/CSS detection)
├── WebGLOrb.tsx            # Three.js wireframe sphere
├── CSSOrb.tsx              # Lightweight CSS fallback
├── OrbBackgroundLayer.tsx  # Context provider
└── index.ts                # Exports
```

**לוגיקה עיקרית:**
- זיהוי תמיכת WebGL בטעינה (`supportsWebGL()`)
- 12 צורות מורפינג פרוצדורליות ב-WebGL
- Tunnel Mode לסשנים אקטיביים
- Audio-reactive scaling/opacity
- Imperative API: `setSpeaking()`, `setListening()`, `updateState()`

**תלויות:**
```bash
npm install three @types/three
```

### 1.2 Theme System Extensions

**עדכון קובץ:** `src/lib/theme.ts`

```typescript
// Ego States Colors Map
export const EGO_STATES = {
  guardian: { bg: 'from-blue-600 to-blue-800', accent: '#5AB6FF' },
  rebel: { bg: 'from-red-600 to-red-800', accent: '#FF5D5D' },
  healer: { bg: 'from-green-600 to-green-800', accent: '#2ED573' },
  explorer: { bg: 'from-yellow-500 to-yellow-700', accent: '#FFC960' },
  mystic: { bg: 'from-purple-600 to-purple-800', accent: '#7C5CFF' },
  // ... 15 total archetypes
} as const;

export function getEgoColor(egoStateId: string) {
  return EGO_STATES[egoStateId] || EGO_STATES.guardian;
}
```

### 1.3 Glass Morphism CSS

**עדכון:** `src/index.css`

הוספת CSS utilities מ-Libero:
- `.glass-card`, `.glass-card-premium`
- `.glass-button`, `.glass-input`
- `.glass-progress`, `.glass-progress-fill`
- State-based ring effects
- Animation keyframes: `shimmer`, `breathe-glow`, `spin-slow`

### 1.4 Hook: useOrbSize

**קובץ חדש:** `src/hooks/useOrbSize.ts`

```typescript
export function getResponsiveOrbSize(options: { fallbackSize: number }): number {
  if (typeof window === 'undefined') return options.fallbackSize;
  
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const minDimension = Math.min(vw, vh);
  
  // Scale orb to 60-80% of smallest viewport dimension
  return Math.min(Math.max(minDimension * 0.7, 280), 560);
}
```

---

## Phase 2: Gamification System (שבוע 2)

### 2.1 Database Extensions

**Migration SQL:**

```sql
-- Extend profiles table for gamification
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS level integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS experience integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS tokens integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS session_streak integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_session_date date,
ADD COLUMN IF NOT EXISTS active_ego_state text DEFAULT 'guardian',
ADD COLUMN IF NOT EXISTS ego_state_usage jsonb DEFAULT '{}';

-- Sessions table for history
CREATE TABLE IF NOT EXISTS hypnosis_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  ego_state text NOT NULL,
  action text,
  duration integer NOT NULL,
  experience_gained integer DEFAULT 0,
  completed_at timestamptz DEFAULT now(),
  script_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- User achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id text NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Custom protocols
CREATE TABLE IF NOT EXISTS custom_protocols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  goals text[],
  induction text,
  duration integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS Policies
ALTER TABLE hypnosis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_protocols ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON hypnosis_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON hypnosis_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Similar policies for other tables...

-- Streak bonus function
CREATE OR REPLACE FUNCTION check_streak_bonus(p_user_id uuid)
RETURNS integer AS $$
DECLARE
  v_streak integer;
  v_bonus integer := 0;
BEGIN
  SELECT session_streak INTO v_streak FROM profiles WHERE id = p_user_id;
  
  IF v_streak = 7 THEN v_bonus := 10;   -- Weekly bonus
  ELSIF v_streak = 30 THEN v_bonus := 50; -- Monthly bonus
  END IF;
  
  IF v_bonus > 0 THEN
    UPDATE profiles SET tokens = tokens + v_bonus WHERE id = p_user_id;
  END IF;
  
  RETURN v_bonus;
END;
$$ LANGUAGE plpgsql;
```

### 2.2 Game State Context

**קובץ חדש:** `src/contexts/GameStateContext.tsx`

```typescript
interface GameState {
  user: {
    level: number;
    experience: number;
    tokens: number;
    sessionStreak: number;
    activeEgoState: string;
    egoStateUsage: Record<string, number>;
  } | null;
  loading: boolean;
}

// Provider with:
// - loadUserProfile()
// - addExperience(amount)
// - updateStreak()
// - awardAchievement(id)
// - spendTokens(amount)
```

### 2.3 Achievement Definitions

**קובץ חדש:** `src/lib/achievements.ts`

```typescript
export const ACHIEVEMENTS = {
  first_session: {
    id: 'first_session',
    name: 'First Journey',
    description: 'Complete your first hypnosis session',
    icon: '🌟',
    xp: 50
  },
  streak_7: {
    id: 'streak_7',
    name: 'Week Warrior',
    description: '7 day streak',
    icon: '🔥',
    xp: 100,
    tokens: 10
  },
  // ... more achievements
};
```

### 2.4 UI Components

**קבצים חדשים:**
```
src/components/gamification/
├── LevelProgress.tsx      # XP bar with level display
├── StreakCounter.tsx      # Daily streak visualization
├── AchievementToast.tsx   # Unlock notifications
├── TokenBalance.tsx       # Token display
└── EgoStateSelector.tsx   # Archetype picker
```

---

## Phase 3: AI Brain & TTS (שבוע 3)

### 3.1 Edge Functions

**Secrets נדרשים:**
- `OPENAI_API_KEY` — יש להוסיף!
- `ELEVENLABS_API_KEY` (אופציונלי) — יש להוסיף!

**קבצי Edge Functions חדשים:**

```
supabase/functions/
├── ai-hypnosis/index.ts        # Main hypnosis AI
├── generate-script/index.ts    # Script generator
├── tts/index.ts                # OpenAI TTS
└── elevenlabs-tts-proxy/index.ts  # ElevenLabs (optional)
```

**config.toml עדכונים:**
```toml
[functions.ai-hypnosis]
verify_jwt = true

[functions.generate-script]
verify_jwt = true

[functions.tts]
verify_jwt = false

[functions.elevenlabs-tts-proxy]
verify_jwt = false
```

### 3.2 Script Generation Logic

**מבנה סקריפט:**
```typescript
interface HypnosisScript {
  title: string;
  segments: Array<{
    id: string;           // welcome, induction, deepening, core_work, integration, emergence
    text: string;         // Full hypnotic script text
    mood: string;         // calming, deepening, transformative, energizing
    voice: string;        // female
    sfx: string;          // ambient, gentle, energy
  }>;
  metadata: {
    durationSec: number;
    style: string;
    wordsPerMinute: number;  // 150 default
    totalWords: number;
  };
}
```

**Segment Timing:**
| Segment | Time % | Purpose |
|---------|--------|---------|
| Welcome | 8% | Introduce session and goal |
| Induction | 25% | Guide into hypnotic state |
| Deepening | 20% | Deepen the trance |
| Core Work | 30% | Main transformation |
| Integration | 12% | Lock in changes |
| Emergence | 5% | Return to awareness |

### 3.3 Personalization Engine

**קבצים חדשים:**
```
src/services/
├── userMemory.ts       # Load/save user preferences & session history
├── sessionContext.ts   # Map session options to context object
└── hypnosis.ts         # API client for Edge Functions
```

**UserMemory Interface:**
```typescript
interface UserMemory {
  preferences: {
    level: number;
    activeEgoState: string;
    egoStateUsage: Record<string, number>;
    sessionStreak: number;
    lastSessionDate: string | null;
  } | null;
  recentSessions: SessionSummary[];
  outcomeSummary: {
    totalSessions: number;
    totalExperience: number;
    favoriteEgoState: string | null;
    averageDurationMinutes: number | null;
  };
}
```

### 3.4 TTS Client

**קובץ חדש:** `src/services/voice.ts`

```typescript
export async function synthesizeSpeech(
  text: string,
  options: {
    voice?: string;      // default: 'ash'
    speed?: number;      // default: 1.0
    model?: string;      // default: 'tts-1'
  }
): Promise<AudioBuffer | null> {
  // 1. Try OpenAI TTS Edge Function
  // 2. Fallback to browser SpeechSynthesis
  // 3. Return null if both fail
}
```

---

## Phase 4: Immersive Sessions (שבוע 4)

### 4.1 Session Manager

**קובץ חדש:** `src/services/session.ts`

```typescript
interface SessionHandle {
  start(): Promise<void>;
  pause(): void;
  resume(): void;
  stop(): void;
  skip(): void;
  
  // State
  currentSegment: Segment | null;
  playState: 'idle' | 'loading' | 'playing' | 'paused' | 'complete';
  progress: number;  // 0-1
  
  // Events
  onSegmentChange: (segment: Segment) => void;
  onAudioLevel: (level: number) => void;
  onComplete: () => void;
}
```

### 4.2 Audio Analysis

**קובץ חדש:** `src/hooks/useAudioAnalysis.ts`

```typescript
export function useAudioAnalysis(audioElement: HTMLAudioElement | null) {
  const [audioLevel, setAudioLevel] = useState(0);
  const [audioFrequency, setAudioFrequency] = useState(0);
  
  // Uses Web Audio API:
  // - AudioContext
  // - AnalyserNode
  // - getByteFrequencyData()
  
  return { audioLevel, audioFrequency };
}
```

### 4.3 Session Page

**קובץ חדש:** `src/pages/HypnosisSession.tsx`

```typescript
// Layout:
// ┌─────────────────────────────────────┐
// │           [Header/Back]             │
// ├─────────────────────────────────────┤
// │                                     │
// │          [WebGL/CSS Orb]            │
// │       (Audio-reactive, centered)    │
// │                                     │
// ├─────────────────────────────────────┤
// │    [Segment Progress Indicator]     │
// ├─────────────────────────────────────┤
// │  [Play/Pause]  [Skip]  [Settings]   │
// └─────────────────────────────────────┘
```

### 4.4 Zustand Stores

**קבצים חדשים:**
```
src/stores/
├── appStore.ts          # UI state (modals, toasts, tabs)
├── sessionStore.ts      # Session lifecycle
└── chatSessionStore.ts  # Chat threads (if implementing chat)
```

### 4.5 Route Addition

**עדכון:** `src/App.tsx`

```tsx
const HypnosisSession = lazy(() => import("./pages/HypnosisSession"));
const HypnosisLibrary = lazy(() => import("./pages/HypnosisLibrary"));

// Add routes:
<Route
  path="/hypnosis"
  element={
    <ProtectedRoute>
      <HypnosisLibrary />
    </ProtectedRoute>
  }
/>
<Route
  path="/hypnosis/session"
  element={
    <ProtectedRoute>
      <HypnosisSession />
    </ProtectedRoute>
  }
/>
```

---

## סיכום טכני

### קבצים חדשים (סה"כ ~25)

| Category | Files |
|----------|-------|
| Components | 12 (orb/, gamification/) |
| Hooks | 3 (useOrbSize, useAudioAnalysis, useGameState) |
| Services | 4 (userMemory, sessionContext, voice, hypnosis) |
| Stores | 3 (appStore, sessionStore, chatSessionStore) |
| Edge Functions | 4 (ai-hypnosis, generate-script, tts, elevenlabs) |
| Pages | 2 (HypnosisSession, HypnosisLibrary) |
| Lib | 2 (theme extensions, achievements) |

### תלויות חדשות

```json
{
  "dependencies": {
    "three": "^0.160.0",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@types/three": "^0.160.0"
  }
}
```

### Secrets נדרשים

| Secret | Purpose | Status |
|--------|---------|--------|
| LOVABLE_API_KEY | AI Gateway | ✅ קיים |
| OPENAI_API_KEY | TTS + Script Gen | ❌ יש להוסיף |
| ELEVENLABS_API_KEY | Premium TTS | ❌ אופציונלי |

### Database Changes

- 3 טבלאות חדשות: `hypnosis_sessions`, `user_achievements`, `custom_protocols`
- 6 עמודות חדשות ב-`profiles`
- 1 DB function: `check_streak_bonus`
- RLS policies לכל הטבלאות החדשות

---

## סדר יישום מומלץ

```
Week 1: Phase 1 (Visual Identity)
  └── Day 1-2: Orb components + Three.js
  └── Day 3-4: Theme extensions + Glass CSS
  └── Day 5: Integration testing

Week 2: Phase 2 (Gamification)
  └── Day 1: Database migrations
  └── Day 2-3: GameStateContext
  └── Day 4-5: UI components

Week 3: Phase 3 (AI Brain)
  └── Day 1: Add OPENAI_API_KEY secret
  └── Day 2-3: Edge Functions deployment
  └── Day 4-5: Client services

Week 4: Phase 4 (Sessions)
  └── Day 1-2: Session manager + audio
  └── Day 3-4: Session page UI
  └── Day 5: End-to-end testing
```
