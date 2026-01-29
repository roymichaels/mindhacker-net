
# Aurora Life Coaching Integration Plan

## Executive Summary

This plan integrates Aurora, a chat-first AI life coaching companion, into MindHacker. Aurora will replace the existing "AI Assistant" in the messaging system (`/messages/ai`) while the Chat Widget remains unchanged. Aurora will silently build a Life Model from conversations and unify with MindHacker's existing gamification system.

---

## Integration Strategy

### What Changes
- **Aurora takes over the pinned AI conversation** in `/messages` (currently labeled "AI Assistant")
- **New database tables** for Life Model data (12 new tables)
- **New edge functions** for AI orchestration and background analysis
- **Enhanced profile** with Aurora-specific preferences (tone, intensity, bio)
- **Life Model Dashboard** accessible from Aurora conversation header
- **Checklists system** integrated with conversations
- **Voice I/O** using existing ElevenLabs integration

### What Stays the Same
- **Chat Widget** (`ChatWidget.tsx`) - remains for guest/quick questions
- **Direct messaging** between users - unchanged
- **Gamification system** - extended to include Aurora interactions
- **Existing navigation** - no new routes, everything modal-based

---

## Phase 1: Database Schema

### New Tables (12 total)

```text
Life Model Core:
├── aurora_life_direction      # Core life orientation
├── aurora_identity_elements   # Values, principles, self-concepts
├── aurora_life_visions        # 5-year, 10-year visions
├── aurora_commitments         # Active life directions
├── aurora_energy_patterns     # Sleep, nutrition, movement
├── aurora_behavioral_patterns # Focus, avoidance, discipline
├── aurora_focus_plans         # Short-term focus periods
├── aurora_daily_minimums      # Non-negotiable daily anchors

Tracking:
├── aurora_onboarding_progress # Life Model completion tracking
├── aurora_checklists          # Task lists (manual or Aurora-created)
└── aurora_checklist_items     # Individual tasks

Extension to profiles:
└── profiles (ADD columns: bio, aurora_preferences JSONB)
```

### Profile Extension

Add to existing `profiles` table:
- `bio` (text) - User's self-description
- `aurora_preferences` (JSONB) - Contains:
  - `tone`: 'warm' | 'direct' | 'playful'
  - `intensity`: 'gentle' | 'balanced' | 'challenging'

### RLS Policies

All Aurora tables will have:
- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id`
- UPDATE: `auth.uid() = user_id`
- DELETE: `auth.uid() = user_id`

### Realtime Enablement

Enable realtime for:
- All aurora_* tables
- `messages` (already enabled)

---

## Phase 2: Edge Functions

### New Functions (3)

1. **`aurora-chat`** (replaces `chat-assistant` for AI conversations)
   - Complete Aurora persona with Life Model context injection
   - Streaming response
   - Processes action tags: `[action:*]`, `[cta:*]`, `[checklist:*]`
   - Model: `google/gemini-2.5-flash`

2. **`aurora-analyze`** (background analysis)
   - Triggered every 4 messages via client
   - Extracts stable insights using structured output
   - Updates Life Model tables
   - Model: `google/gemini-2.5-flash` with JSON mode

3. **`aurora-generate-title`** (conversation titles)
   - Auto-generates 3-6 word titles after first exchange
   - Model: `google/gemini-2.5-flash-lite` (fast/cheap)

### Existing Functions Updated

- **`elevenlabs-tts`** - Add Aurora voice (Jessica: `cgSgspJ2msm6clMCkdW9`)

---

## Phase 3: React Hooks

### New Hooks (7)

```text
src/hooks/aurora/
├── useAuroraChat.tsx          # Core chat orchestration (659+ lines)
├── useAuroraConversations.tsx # Conversation CRUD + realtime
├── useLifeModel.tsx           # Life direction, energy, focus
├── useDashboard.tsx           # Identity, visions, commitments
├── useOnboardingProgress.tsx  # Life Model completion tracking
├── useChecklists.tsx          # Checklist UI management
├── useChecklistsData.tsx      # Data-only (for useAuroraChat)
└── useAuroraVoice.tsx         # Voice input/output via ElevenLabs
```

### Key Hook: `useAuroraChat`

This is the brain of Aurora. It:
1. Manages message history with streaming
2. Calls `aurora-chat` edge function
3. Processes action tags from responses
4. Triggers background analysis every 4 messages
5. Builds complete Life Model context for AI
6. Handles checklist operations inline

---

## Phase 4: UI Components

### New Components (13)

```text
src/components/aurora/
├── AuroraMessageThread.tsx    # Enhanced MessageThread for Aurora
├── AuroraChatMessage.tsx      # Message with CTAs, actions, TTS
├── AuroraChatInput.tsx        # Input with voice recording
├── AuroraDashboardModal.tsx   # Life Model viewer modal
├── AuroraDashboardView.tsx    # Full Life Model display
├── AuroraSettingsModal.tsx    # Aurora preferences editor
├── AuroraProfileSettings.tsx  # Bio, tone, intensity settings
├── AuroraChecklistModal.tsx   # Checklist manager modal
├── AuroraChecklistCard.tsx    # Collapsible checklist
├── AuroraChecklistItem.tsx    # Individual todo item
├── AuroraCTAButton.tsx        # Interactive CTA buttons
├── AuroraTypingIndicator.tsx  # "Aurora is thinking..."
└── AuroraVoiceButton.tsx      # Microphone button with states
```

### Modified Components

- **`MessageThread.tsx`** - Detect Aurora conversation and render `AuroraMessageThread`
- **`ConversationItem.tsx`** - Update Aurora branding/subtitle
- **`MessageBubble.tsx`** - Add markdown rendering, TTS hover button

---

## Phase 5: Gamification Integration

### Aurora XP Events

- **Message sent to Aurora**: +5 XP
- **Insight extracted (Life Model update)**: +15 XP
- **Checklist item completed**: +10 XP
- **Daily conversation with Aurora**: +25 XP (streak bonus applies)

### Profile Unification

Aurora's Life Model data enriches the existing profile:
- Display Life Direction on user dashboard
- Show active commitments as achievements
- Track "Aurora streak" alongside hypnosis streak

### Database Function

```sql
CREATE FUNCTION aurora_award_xp(
  p_user_id UUID,
  p_amount INT,
  p_reason TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET experience = experience + p_amount,
      updated_at = now()
  WHERE id = p_user_id;
  -- Trigger level-up check
END;
$$ LANGUAGE plpgsql;
```

---

## Phase 6: Voice Integration

### Voice Input (Speech-to-Text)

Create `aurora-transcribe` edge function:
- Uses ElevenLabs Scribe v1
- Returns transcribed text
- Input: FormData with audio blob

### Voice Output (Text-to-Speech)

Update `elevenlabs-tts`:
- Add voice option parameter
- Aurora uses Jessica voice (`cgSgspJ2msm6clMCkdW9`)
- Model: `eleven_multilingual_v2` (Hebrew support)

### Client Integration

New hook `useAuroraVoice.tsx`:
- `startRecording()` - MediaRecorder API
- `stopRecording()` - Send to transcribe function
- `playMessage(messageId)` - Fetch TTS, play audio
- State: `isRecording`, `isPlaying`, `activeMessageId`

---

## Phase 7: Translations

### New i18n Keys (~100)

Add to `src/i18n/translations/he.ts` and `en.ts`:

```typescript
aurora: {
  name: "אורורה",
  subtitle: "מלווה אישית לעיצוב חיים",
  welcomeTitle: "היי, אני אורורה 💜",
  welcomeSubtitle: "בואי נתחיל לחקור מה באמת חשוב לך...",
  suggestions: {
    direction: "אני רוצה לדבר על הכיוון שלי",
    values: "מה הערכים שמנחים אותי?",
    energy: "איפה האנרגיה שלי הולכת?",
    identity: "מי אני באמת?"
  },
  dashboard: {
    title: "מודל החיים שלי",
    emptyState: "אנחנו עדיין בונים את התמונה שלך...",
    lifeDirection: "כיוון החיים",
    identity: "פרופיל זהות",
    visions: "חזון לעתיד",
    // ... 40+ more keys
  },
  settings: {
    tone: "סגנון תקשורת",
    intensity: "עוצמת האתגר",
    // ... 20+ more keys
  },
  checklists: {
    title: "רשימות המשימות שלי",
    // ... 15+ more keys
  },
  cta: {
    lifeDirection: "בואי נחקור את הכיוון שלך",
    exploreValues: "בואי נגלה מה באמת חשוב לך",
    // ... 10+ more keys
  }
}
```

---

## Implementation Order

### Week 1: Foundation
1. Database migrations (all 12 tables + profile columns)
2. RLS policies and realtime setup
3. Basic `aurora-chat` edge function

### Week 2: Core Chat
4. `useAuroraChat` hook (core logic)
5. `AuroraMessageThread` component
6. Replace AI conversation in `/messages/ai`

### Week 3: Life Model
7. `aurora-analyze` edge function
8. Life Model hooks (useDashboard, useLifeModel)
9. `AuroraDashboardModal` + `AuroraDashboardView`

### Week 4: Features
10. Checklists system (tables, hooks, components)
11. Voice integration (TTS buttons, STT recording)
12. Settings modal and preferences

### Week 5: Polish
13. Gamification integration (XP events)
14. Translations (all keys)
15. Testing and refinement

---

## Technical Specifications

### Aurora Chat System Prompt (Hebrew)

```
אני אורורה - מלווה AI לעיצוב חיים.
אני עוזרת לך לעצב את החיים שלך, להבהיר את הזהות שלך, ולתכנן את העתיד שלך.

## עקרונות הליווי
- אני מקשיבה קודם, שואלת שאלות מחודדות
- אני מותאמת לקצב שלך ולסגנון שלך
- אני מזהה דפוסים ומשקפת אותם לאט
- אני לא דוחפת, לא שופטת, לא ממהרת

## תגיות פעולה
- [action:analyze] - ניתוח רקע
- [cta:life_direction] - כפתור לחקירת כיוון
- [checklist:create:כותרת] - יצירת רשימה חדשה
- [checklist:add:כותרת:פריט] - הוספת פריט

## הקשר המשתמש
{USER_CONTEXT_INJECTED_HERE}
```

### Action Tag Processing

Client-side parsing in `useAuroraChat`:

```typescript
const processResponse = (content: string) => {
  // Extract and remove silent actions
  const actionMatches = content.matchAll(/\[action:(\w+)\]/g);
  for (const match of actionMatches) {
    if (match[1] === 'analyze') triggerBackgroundAnalysis();
  }
  
  // Keep CTAs for rendering
  // [cta:life_direction] -> <AuroraCTAButton type="life_direction" />
  
  // Process checklists
  const checklistCreate = /\[checklist:create:(.+?)\]/g;
  const checklistAdd = /\[checklist:add:(.+?):(.+?)\]/g;
  // ... handle each
};
```

---

## File Structure Summary

```text
New files:
├── supabase/
│   ├── functions/
│   │   ├── aurora-chat/index.ts
│   │   ├── aurora-analyze/index.ts
│   │   └── aurora-generate-title/index.ts
│   └── migrations/
│       └── YYYYMMDD_aurora_schema.sql
├── src/
│   ├── hooks/aurora/
│   │   ├── useAuroraChat.tsx
│   │   ├── useAuroraConversations.tsx
│   │   ├── useLifeModel.tsx
│   │   ├── useDashboard.tsx
│   │   ├── useOnboardingProgress.tsx
│   │   ├── useChecklists.tsx
│   │   ├── useChecklistsData.tsx
│   │   └── useAuroraVoice.tsx
│   └── components/aurora/
│       ├── AuroraMessageThread.tsx
│       ├── AuroraChatMessage.tsx
│       ├── AuroraChatInput.tsx
│       ├── AuroraDashboardModal.tsx
│       ├── AuroraDashboardView.tsx
│       ├── AuroraSettingsModal.tsx
│       ├── AuroraProfileSettings.tsx
│       ├── AuroraChecklistModal.tsx
│       ├── AuroraChecklistCard.tsx
│       ├── AuroraChecklistItem.tsx
│       ├── AuroraCTAButton.tsx
│       ├── AuroraTypingIndicator.tsx
│       └── AuroraVoiceButton.tsx

Modified files:
├── src/pages/MessageThread.tsx
├── src/components/messages/ConversationItem.tsx
├── src/components/messages/MessageBubble.tsx
├── src/i18n/translations/he.ts
├── src/i18n/translations/en.ts
├── supabase/functions/elevenlabs-tts/index.ts
└── supabase/config.toml
```

---

## Database Tables Detail

### aurora_life_direction
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to profiles |
| content | text | Life direction statement |
| clarity_score | int | 0-100 confidence score |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### aurora_identity_elements
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to profiles |
| element_type | text | 'value' / 'principle' / 'self_concept' / 'vision_statement' |
| content | text | The element text |
| metadata | jsonb | Additional context |
| created_at | timestamptz | |

### aurora_life_visions
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to profiles |
| timeframe | text | '5_year' / '10_year' |
| title | text | Vision title |
| description | text | Detailed description |
| focus_areas | text[] | Array of focus areas |
| created_at | timestamptz | |

### aurora_commitments
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to profiles |
| title | text | Commitment title |
| description | text | |
| status | text | 'active' / 'completed' / 'paused' |
| created_at | timestamptz | |

### aurora_energy_patterns
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to profiles |
| pattern_type | text | 'sleep' / 'nutrition' / 'movement' / 'stress' |
| description | text | Pattern description |
| created_at | timestamptz | |

### aurora_behavioral_patterns
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to profiles |
| pattern_type | text | 'focus' / 'avoidance' / 'discipline' / 'resistance' / 'strength' |
| description | text | Pattern description |
| created_at | timestamptz | |

### aurora_focus_plans
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to profiles |
| title | text | Focus plan title |
| description | text | |
| duration_days | int | Plan duration |
| start_date | date | |
| end_date | date | |
| status | text | 'active' / 'completed' / 'abandoned' |
| created_at | timestamptz | |

### aurora_daily_minimums
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to profiles |
| title | text | Minimum title |
| category | text | Category label |
| is_active | boolean | |
| created_at | timestamptz | |

### aurora_onboarding_progress
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to profiles (unique) |
| direction_clarity | text | 'incomplete' / 'emerging' / 'stable' |
| identity_understanding | text | 'shallow' / 'partial' / 'clear' |
| energy_patterns_status | text | 'unknown' / 'partial' / 'mapped' |
| onboarding_complete | boolean | |
| updated_at | timestamptz | |

### aurora_checklists
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to profiles |
| title | text | Checklist title |
| origin | text | 'manual' / 'aurora' |
| context | text | Conversation context |
| status | text | 'active' / 'archived' |
| created_at | timestamptz | |

### aurora_checklist_items
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| checklist_id | uuid | FK to aurora_checklists |
| content | text | Item text |
| is_completed | boolean | |
| order_index | int | Sort order |
| created_at | timestamptz | |

---

## Success Criteria

1. Aurora conversation is pinned and distinct in `/messages`
2. Life Model data populates after 5-10 meaningful exchanges
3. Dashboard shows extracted insights with empty states handled
4. Checklists can be created via conversation or manually
5. Voice input/output works seamlessly
6. XP is awarded for Aurora interactions
7. All UI is fully RTL-compatible
8. No breaking changes to existing Chat Widget or direct messages
