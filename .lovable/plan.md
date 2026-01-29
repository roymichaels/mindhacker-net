

# Deep Integration Plan: Unifying MindHacker's Major Systems

## Executive Summary

This plan addresses redundancy removal and deep integration across MindHacker's three core modules:
1. **Aurora** - AI Life Coaching (newly added)
2. **Libero** - AI Hypnotherapy (existing)
3. **Gamification** - XP/Achievements System (existing)

The goal is to create a unified, seamless experience where these systems inform and enhance each other.

---

## Current State Analysis

### Identified Redundancies

| Area | Duplicate Systems | Issue |
|------|-------------------|-------|
| AI Chat | `chat-assistant` (widget) + `aurora-chat` (Aurora) | Two separate AI brains with different personas |
| User Memory | `userMemory.ts` (Hypnosis) + Aurora Life Model tables | Parallel data sources for personalization |
| Edge Functions | `chat-assistant` + `aurora-chat` + `ai-hypnosis` | 3 functions doing similar AI orchestration |
| Voice Services | `useAuroraVoice` + `services/voice.ts` + `elevenlabs-tts` | Fragmented TTS/STT implementations |
| Profile Data | `profiles` table + `aurora_*` tables | Life Model data separate from core profile |
| Session Tracking | `hypnosis_sessions` + game state | Session data not flowing to Aurora insights |

### Integration Opportunities

```text
Current Architecture (Siloed):
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│     Aurora      │  │     Libero      │  │   Gamification  │
│   (Life Coach)  │  │   (Hypnosis)    │  │   (XP/Tokens)   │
│                 │  │                 │  │                 │
│ aurora_* tables │  │ hypnosis_sessions│  │  profiles       │
│ aurora-chat fn  │  │ voice.ts        │  │  achievements   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                   │                    │
         └───────────────────┴────────────────────┘
                    No Data Flow
```

```text
Target Architecture (Unified):
┌───────────────────────────────────────────────────────────┐
│                    Unified Profile Hub                    │
│  (bio, preferences, Life Model, energy, achievements)    │
└───────────────────────────────────────────────────────────┘
                           │
     ┌─────────────────────┼─────────────────────┐
     ▼                     ▼                     ▼
┌─────────────┐    ┌─────────────┐    ┌──────────────┐
│   Aurora    │◄──►│   Libero    │◄──►│ Gamification │
│ Life Coach  │    │  Hypnosis   │    │  XP/Tokens   │
└─────────────┘    └─────────────┘    └──────────────┘
     │                    │                   │
     └─────── Shared Context Layer ───────────┘
         (userContext, voice, memory)
```

---

## Phase 1: Consolidate AI Edge Functions

### Problem
Three separate AI functions with overlapping logic:
- `chat-assistant` - Widget chatbot (guest-facing)
- `aurora-chat` - Life coaching (authenticated)
- `ai-hypnosis` - Hypnosis script generation

### Solution
Create a unified AI orchestration layer:

#### New Function: `unified-ai/index.ts`
Replaces `chat-assistant` and shares context with Aurora.

```text
Request:
{
  mode: 'widget' | 'aurora' | 'hypnosis',
  messages: [...],
  userId?: string,
  context?: { egoState, goal, ... }
}

Response:
Streaming SSE (same interface)
```

#### Changes

1. **Deprecate `chat-assistant`**
   - Migrate widget to use `aurora-chat` with `mode: 'widget'`
   - Widget gets simplified Aurora persona for guests
   - Authenticated users get full Aurora experience

2. **Update `aurora-chat`**
   - Add `mode` parameter (full, lite, widget)
   - Add hypnosis context injection when mode is hypnosis
   - Share the knowledge base with widget mode

3. **Update `ai-hypnosis`**
   - Import Life Model data from Aurora tables
   - Use Aurora insights to personalize hypnosis scripts
   - Feed session outcomes back to Aurora for analysis

---

## Phase 2: Unified Voice Services

### Problem
Voice functionality is fragmented across:
- `src/services/voice.ts` - Hypnosis TTS/STT
- `src/hooks/aurora/useAuroraVoice.tsx` - Aurora voice
- `supabase/functions/elevenlabs-tts/` - Edge function

### Solution
Consolidate into single voice service:

#### New File: `src/services/unifiedVoice.ts`

```typescript
// Unified interface for all voice operations
export const VoiceService = {
  // Text-to-Speech
  speak: async (text: string, options: {
    voice?: 'aurora' | 'hypnosis' | 'default',
    speed?: number,
    language?: 'he' | 'en',
  }) => AudioBlob,
  
  // Speech-to-Text
  transcribe: async (audio: Blob) => string,
  
  // Playback control
  play: (audio: AudioBlob) => void,
  stop: () => void,
  isPlaying: boolean,
  
  // Voice settings
  getVoiceForContext: (context: 'aurora' | 'hypnosis' | 'chat') => VoiceConfig,
};
```

#### Voice Profiles

| Context | Voice | Speed | Model |
|---------|-------|-------|-------|
| Aurora | Jessica | 1.0 | eleven_multilingual_v2 |
| Hypnosis | Sarah | 0.9 | eleven_multilingual_v2 |
| Widget | Default | 1.0 | Browser TTS |

#### Hook Consolidation

Delete `useAuroraVoice.tsx` and update to use:

```typescript
// New unified hook
export function useVoice(context: 'aurora' | 'hypnosis' | 'chat') {
  const voiceConfig = VoiceService.getVoiceForContext(context);
  // ... shared implementation
}
```

---

## Phase 3: Unified User Context

### Problem
User data is scattered:
- `profiles` - basic info + gamification
- `aurora_*` tables - Life Model data
- `hypnosis_sessions` - session history
- `userMemory.ts` - context builder

### Solution
Create unified context service:

#### New File: `src/services/unifiedContext.ts`

```typescript
export interface UnifiedUserContext {
  // Identity
  profile: Profile;
  lifeModel: {
    direction: LifeDirection | null;
    values: string[];
    principles: string[];
    visions: Vision[];
    commitments: Commitment[];
    energyPatterns: EnergyPattern[];
  };
  
  // Activity
  gamification: {
    level: number;
    xp: number;
    streak: number;
    tokens: number;
    achievements: string[];
  };
  
  // Sessions
  hypnosis: {
    totalSessions: number;
    favoriteEgoState: string;
    recentGoals: string[];
    averageDuration: number;
  };
  
  // Preferences
  preferences: {
    tone: 'warm' | 'direct' | 'playful';
    intensity: 'gentle' | 'balanced' | 'challenging';
    activeEgoState: string;
    language: 'he' | 'en';
  };
}

export async function loadUnifiedContext(userId: string): Promise<UnifiedUserContext>;
export function getAIContextString(context: UnifiedUserContext, mode: 'aurora' | 'hypnosis'): string;
```

#### Database View (Optional)
Create a database view for efficient context loading:

```sql
CREATE VIEW unified_user_context AS
SELECT 
  p.id,
  p.full_name,
  p.bio,
  p.level,
  p.experience,
  p.tokens,
  p.session_streak,
  p.aurora_preferences,
  p.active_ego_state,
  ald.content as life_direction,
  ald.clarity_score,
  -- ... aggregate Life Model data
FROM profiles p
LEFT JOIN aurora_life_direction ald ON ald.user_id = p.id
-- ... more joins
;
```

---

## Phase 4: Cross-Module Data Flow

### Aurora ← Hypnosis Integration

When a hypnosis session completes, feed insights to Aurora:

```typescript
// In HypnosisSession.tsx, handleSessionComplete()
const handleSessionComplete = async () => {
  // ... existing code ...
  
  // NEW: Feed session insights to Aurora Life Model
  await supabase.from('aurora_energy_patterns').upsert({
    user_id: user.id,
    pattern_type: 'session_energy',
    description: `Completed ${duration}min ${egoStateId} session focusing on "${goal}"`,
    metadata: { egoState: egoStateId, goal, duration }
  }, { onConflict: 'user_id,pattern_type' });
  
  // Trigger Aurora background analysis if significant
  if (duration >= 10) {
    await triggerAuroraAnalysis(user.id, 'hypnosis_completion', {
      goal,
      egoState: egoStateId,
      duration
    });
  }
};
```

### Hypnosis ← Aurora Integration

Use Life Model data to personalize hypnosis:

```typescript
// In generateHypnosisScript edge function
const { lifeDirection, values, energyPatterns } = await loadLifeModel(userId);

// Inject into script generation prompt
const contextualGoal = enhanceGoalWithLifeModel(goal, {
  lifeDirection,
  values,
  energyPatterns
});
// "I want to focus better" + values["growth", "clarity"] + direction["building a business"]
// => "Focus on building your business with clarity and growth"
```

### Gamification ← Aurora Integration

Award XP for Aurora milestones:

```typescript
// In useAuroraChat.tsx, after insight extraction
const onInsightExtracted = async (insightType: string) => {
  const xpAmounts = {
    'life_direction': 25,
    'value': 15,
    'commitment': 20,
    'daily_minimum': 10,
    'vision': 30,
  };
  
  await supabase.rpc('aurora_award_xp', {
    p_user_id: user.id,
    p_amount: xpAmounts[insightType] || 10,
    p_reason: `Aurora insight: ${insightType}`
  });
};
```

### Community ← Aurora Integration

Share Life Model achievements in community:

```typescript
// Auto-post when Life Model milestones hit
if (progressPercentage >= 50 && previousProgress < 50) {
  await supabase.from('community_posts').insert({
    user_id: user.id,
    content: '🎯 השלמתי 50% ממודל החיים שלי עם אורורה!',
    category: 'achievement',
    is_auto_generated: true
  });
}
```

---

## Phase 5: Unified Dashboard

### Problem
User dashboard shows disconnected modules:
- Courses, Recordings, Sessions, Affiliate (current)
- Aurora Life Model is hidden in Messages

### Solution
Create integrated dashboard showing holistic progress:

#### New Dashboard Layout

```text
┌─────────────────────────────────────────────────────────┐
│  👤 Profile Card (with Level, Streak, Tokens)           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────┐  ┌────────────────────────────┐ │
│  │ 🧭 Life Direction │  │ 📊 Weekly Progress         │ │
│  │ (from Aurora)     │  │ • Sessions: 4              │ │
│  │                   │  │ • Aurora chats: 12         │ │
│  │ "Building a      │  │ • Insights gained: 3       │ │
│  │  business..."     │  │                            │ │
│  └───────────────────┘  └────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ 🎯 Current Focus & Daily Anchors                  │ │
│  │ (from Aurora Life Model)                          │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────┐  ┌────────────────────────────┐ │
│  │ 📚 My Courses     │  │ 🎧 My Recordings           │ │
│  │ (existing)        │  │ (existing)                 │ │
│  └───────────────────┘  └────────────────────────────┘ │
│                                                         │
│  ┌───────────────────┐  ┌────────────────────────────┐ │
│  │ ☯️ Recent Sessions │  │ 💜 Aurora Insights         │ │
│  │ (hypnosis)        │  │ (latest from Life Model)   │ │
│  └───────────────────┘  └────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

#### New Components

1. **`LifeDirectionCard.tsx`** - Shows life direction from Aurora
2. **`WeeklyProgressCard.tsx`** - Aggregated activity stats
3. **`DailyAnchorsCard.tsx`** - Today's non-negotiables
4. **`RecentInsightsCard.tsx`** - Latest Aurora discoveries

#### Modified Files

- `UserDashboard.tsx` - Add Life Model cards
- `DashboardRightPanel.tsx` - Add Aurora insights panel
- `DashboardSidebar.tsx` - Add Aurora quick access

---

## Phase 6: Remove Deprecated Code

### Files to Delete

```text
REMOVE:
├── supabase/functions/chat-assistant/  (replaced by unified-ai)
├── src/services/userMemory.ts          (replaced by unifiedContext)
├── src/hooks/aurora/useAuroraVoice.tsx (replaced by useVoice)
```

### Files to Consolidate

| Old File | Merged Into |
|----------|-------------|
| `services/voice.ts` | `services/unifiedVoice.ts` |
| `services/userMemory.ts` | `services/unifiedContext.ts` |
| `hooks/aurora/useAuroraVoice.tsx` | `hooks/useVoice.ts` |

### Admin Panel Cleanup

Update `/admin/chat-assistant` to:
- Manage shared knowledge base (used by all AI modes)
- Configure Aurora persona settings
- View unified conversation analytics

---

## Phase 7: Translation & i18n Cleanup

### Add Missing Keys

Ensure all new unified components have translations:

```typescript
// Add to he.ts and en.ts
unified: {
  dashboard: {
    lifeDirection: "כיוון החיים",
    weeklyProgress: "התקדמות שבועית",
    dailyAnchors: "עוגנים יומיים",
    recentInsights: "תובנות אחרונות",
  },
  progress: {
    sessions: "סשנים",
    auroraChats: "שיחות עם אורורה",
    insightsGained: "תובנות חדשות",
  }
}
```

### RTL Audit

Verify all new components support RTL correctly.

---

## Implementation Order

### Week 1: Foundation
1. Create `unifiedContext.ts` service
2. Create `unifiedVoice.ts` service
3. Update edge functions to use shared context

### Week 2: Data Flow
4. Add Aurora ← Hypnosis data flow
5. Add Hypnosis ← Aurora personalization
6. Connect gamification to Aurora events

### Week 3: Dashboard
7. Build new dashboard components
8. Integrate Life Model cards
9. Add weekly progress tracking

### Week 4: Cleanup
10. Remove deprecated files
11. Update admin panel
12. Add missing translations
13. RTL testing

### Week 5: Polish
14. Performance optimization
15. Error handling refinement
16. End-to-end testing

---

## Database Changes

### New Database Functions

```sql
-- Unified XP awarding
CREATE OR REPLACE FUNCTION award_unified_xp(
  p_user_id UUID,
  p_amount INT,
  p_source TEXT,
  p_reason TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE profiles 
  SET experience = experience + p_amount,
      updated_at = now()
  WHERE id = p_user_id;
  
  -- Log the XP source for analytics
  INSERT INTO xp_events (user_id, amount, source, reason)
  VALUES (p_user_id, p_amount, p_source, p_reason);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Weekly stats view
CREATE VIEW weekly_user_stats AS
SELECT 
  user_id,
  COUNT(*) FILTER (WHERE source = 'hypnosis') as hypnosis_sessions,
  COUNT(*) FILTER (WHERE source = 'aurora') as aurora_chats,
  COUNT(*) FILTER (WHERE source = 'aurora_insight') as insights_gained,
  SUM(amount) as total_xp
FROM xp_events
WHERE created_at > now() - interval '7 days'
GROUP BY user_id;
```

### New Table: `xp_events`

```sql
CREATE TABLE xp_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  source TEXT NOT NULL, -- 'hypnosis', 'aurora', 'aurora_insight', 'community', 'course'
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_xp_events_user_date ON xp_events(user_id, created_at DESC);
```

---

## Success Criteria

1. **Single AI Brain** - Widget and Aurora share context and knowledge
2. **Unified Voice** - All TTS/STT goes through one service
3. **Cross-Module Data** - Hypnosis informs Aurora, Aurora personalizes hypnosis
4. **Holistic Dashboard** - User sees integrated progress at a glance
5. **No Redundancy** - Deprecated files removed, code consolidated
6. **XP Everything** - All meaningful actions award XP consistently
7. **RTL Perfect** - All new components work in Hebrew

---

## File Change Summary

### New Files (7)
```text
src/services/unifiedContext.ts
src/services/unifiedVoice.ts
src/hooks/useVoice.ts
src/components/dashboard/LifeDirectionCard.tsx
src/components/dashboard/WeeklyProgressCard.tsx
src/components/dashboard/DailyAnchorsCard.tsx
src/components/dashboard/RecentInsightsCard.tsx
```

### Modified Files (15)
```text
src/pages/UserDashboard.tsx
src/pages/HypnosisSession.tsx
src/components/dashboard/DashboardRightPanel.tsx
src/components/chat/ChatPanel.tsx
src/components/ChatWidget.tsx
src/hooks/aurora/useAuroraChat.tsx
supabase/functions/aurora-chat/index.ts
supabase/functions/ai-hypnosis/index.ts
supabase/functions/generate-hypnosis-script/index.ts
src/contexts/GameStateContext.tsx
src/i18n/translations/he.ts
src/i18n/translations/en.ts
src/App.tsx
src/components/admin/AdminSidebar.tsx
src/pages/admin/ChatAssistant.tsx
```

### Deprecated/Removed Files (3)
```text
supabase/functions/chat-assistant/ (mark deprecated, keep for fallback)
src/services/userMemory.ts (replace with unifiedContext)
src/hooks/aurora/useAuroraVoice.tsx (replace with useVoice)
```

### Database Changes
- New table: `xp_events`
- New function: `award_unified_xp`
- New view: `weekly_user_stats`

