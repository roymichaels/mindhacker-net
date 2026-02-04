
# Strategic Plan: Aurora as Jarvis - The Ultimate Hands-Free Life Operating System

## Current State Analysis

Based on codebase exploration, Aurora already has strong foundations:

### What Aurora Can Do Today
- **Voice Input/Output**: Recording → ElevenLabs transcription → Response → ElevenLabs TTS
- **Action Tags System**: `[task:complete]`, `[habit:create]`, `[reminder:set]`, etc.
- **Background Analysis**: Every 4 messages triggers `aurora-analyze` to learn patterns
- **Conversation Memory**: Summarizes every 8 messages for long-term context
- **Push Notifications**: Infrastructure exists (`push-notifications` edge function)
- **Smart Suggestions**: Context-aware suggestions based on time of day, habits, tasks

### Current Gaps for "Jarvis-Level" Experience
1. **No Proactive Outreach**: Aurora only responds; never initiates contact
2. **No Real-Time Voice Mode**: Voice is record-then-send, not continuous
3. **No Ambient Awareness**: Doesn't know time of day, location, or device state
4. **No Cross-Session Continuity**: Each chat session starts fresh emotionally
5. **No Predictive Actions**: Doesn't anticipate needs before user asks
6. **No Auto-Execution**: Still requires explicit confirmation for actions
7. **No System-Wide Commands**: Can't control app navigation, settings, or modes

---

## The Jarvis Vision: 5 Pillars of Enhancement

```text
┌─────────────────────────────────────────────────────────┐
│              AURORA AS JARVIS                          │
├─────────────────────────────────────────────────────────┤
│  1. PROACTIVE INTELLIGENCE                              │
│     └─ Aurora reaches out before you ask                │
├─────────────────────────────────────────────────────────┤
│  2. CONTEXTUAL AWARENESS                                │
│     └─ Knows time, location, patterns, mood             │
├─────────────────────────────────────────────────────────┤
│  3. SEAMLESS VOICE MODE                                 │
│     └─ Natural conversation, not record-and-send        │
├─────────────────────────────────────────────────────────┤
│  4. AUTO-EXECUTION                                      │
│     └─ Trusted actions happen without confirmation      │
├─────────────────────────────────────────────────────────┤
│  5. CROSS-APP COMMAND CENTER                            │
│     └─ Navigate, control settings, launch features      │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Proactive Intelligence System

#### 1.1 Scheduled Check-Ins (Edge Function Cron)

**New File:** `supabase/functions/aurora-proactive/index.ts`

Creates a scheduled job that:
- Runs every 30 minutes for active users
- Checks for: overdue tasks, forgotten habits, upcoming reminders, pattern anomalies
- Sends push notifications with Aurora's voice

**Database Changes:**
```sql
CREATE TABLE aurora_proactive_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  trigger_type TEXT NOT NULL, -- 'overdue_task', 'habit_reminder', 'milestone_ending', 'pattern_alert'
  trigger_data JSONB,
  priority INTEGER DEFAULT 5,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_proactive_queue_scheduled ON aurora_proactive_queue(scheduled_for, sent_at);
```

**Push Notification Types:**
- "🔔 Hey, you haven't logged your morning workout yet..."
- "📋 You have 3 overdue tasks from yesterday. Want me to reschedule them?"
- "🎯 Week 3 ends tomorrow - you're at 80% completion!"
- "🌙 It's getting late. Want a sleep hypnosis session?"

#### 1.2 Smart Greeting System

**Modify:** `supabase/functions/aurora-chat/index.ts`

When conversation starts, Aurora opens with contextual awareness:
```typescript
const generateSmartOpener = (context) => {
  // Morning: "Good morning! You have X tasks today..."
  // After absence: "Missed you yesterday! Your streak..."
  // After completion: "Welcome back! You crushed it yesterday..."
  // Pattern detected: "I noticed you've been struggling with X..."
};
```

---

### Phase 2: Enhanced Contextual Awareness

#### 2.1 User Context Tracker

**New File:** `src/hooks/aurora/useUserContext.tsx`

Tracks real-time user state:
```typescript
interface UserContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: string;
  lastActiveTime: Date;
  currentPage: string;
  deviceType: 'mobile' | 'desktop';
  focusMode: boolean;
  energyLevel?: 'low' | 'medium' | 'high'; // from recent hypnosis
  currentStreak: number;
  moodSignals: string[]; // extracted from recent messages
}
```

#### 2.2 Mood & Energy Pattern Detection

**Modify:** `supabase/functions/aurora-analyze/index.ts`

Add sentiment analysis layer:
```typescript
const extractMoodSignals = (messages) => {
  // Detect: frustration, excitement, fatigue, motivation
  // Store in aurora_user_context table
  // Use in next response tone adjustment
};
```

---

### Phase 3: Seamless Voice Mode (OpenAI Realtime API)

#### 3.1 Real-Time Voice Chat

**New File:** `supabase/functions/aurora-realtime/index.ts`

Implements OpenAI Realtime API with WebSockets:
- Continuous listening with VAD (Voice Activity Detection)
- Aurora responds in real-time with ElevenLabs voice
- No button pressing needed - just speak naturally

**Frontend Component:**

**New File:** `src/components/aurora/AuroraVoiceMode.tsx`

```tsx
// Full-screen voice mode with animated orb
// Pulsing waveform when Aurora is listening
// Visual feedback when Aurora is speaking
// "Hey Aurora" wake word detection (future)
```

#### 3.2 Voice Mode Toggle

**Modify:** `src/components/aurora/AuroraChatBubbles.tsx`

Add voice mode toggle button that:
- Switches to full-screen voice interface
- Maintains context from text chat
- Shows visual transcript in real-time

---

### Phase 4: Auto-Execution & Trust Levels

#### 4.1 Action Trust System

**Database Changes:**
```sql
CREATE TABLE aurora_action_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL, -- 'task_complete', 'habit_log', 'reminder_set'
  trust_level TEXT NOT NULL, -- 'always_ask', 'auto_execute', 'confirm_once'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Modify:** `src/hooks/aurora/useAuroraChat.tsx`

Before executing an action:
```typescript
const shouldAutoExecute = async (actionType: string) => {
  const pref = await getUserActionPreference(actionType);
  if (pref === 'auto_execute') return true;
  if (pref === 'confirm_once') {
    // Show quick inline confirmation
    return await showInlineConfirmation();
  }
  return false; // Always ask
};
```

#### 4.2 Inline Confirmation UI

**New File:** `src/components/aurora/AuroraActionConfirmation.tsx`

Instead of plain text, show actionable cards:
```tsx
// "I'm about to mark 'Send proposal' as complete. Confirm?"
// [✓ Yes] [✗ No] [⚙️ Always do this]
```

---

### Phase 5: Cross-App Command Center

#### 5.1 Navigation Commands

**New File:** `src/hooks/aurora/useAuroraCommands.tsx`

Aurora can execute app commands:
```typescript
const commands = {
  'open_dashboard': () => navigate('/dashboard'),
  'open_hypnosis': (goal?: string) => navigate(`/hypnosis?goal=${goal}`),
  'open_health': () => navigate('/health'),
  'toggle_dark_mode': () => setTheme('dark'),
  'set_focus_mode': () => enableFocusMode(),
  'show_calendar': () => navigate('/life-plan'),
};
```

**New Action Tags:**
- `[navigate:dashboard]` - Navigate to dashboard
- `[navigate:hypnosis:sleep]` - Open hypnosis with goal
- `[setting:theme:dark]` - Change app settings
- `[mode:focus:on]` - Enable focus mode

#### 5.2 Global Command Listener

**Modify:** `src/contexts/AuroraChatContext.tsx`

Register a global command handler that listens for Aurora commands from anywhere in the app:
```typescript
const executeCommand = useCallback((command: AuroraCommand) => {
  switch (command.type) {
    case 'navigate': navigate(command.path); break;
    case 'setting': updateSetting(command.key, command.value); break;
    case 'action': triggerAction(command.action); break;
  }
}, [navigate]);
```

---

## Technical Implementation Details

### Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/aurora-proactive/index.ts` | Scheduled proactive outreach |
| `src/hooks/aurora/useUserContext.tsx` | Real-time user context tracking |
| `src/hooks/aurora/useAuroraCommands.tsx` | App command execution |
| `src/components/aurora/AuroraVoiceMode.tsx` | Full-screen voice interface |
| `src/components/aurora/AuroraActionConfirmation.tsx` | Inline action confirmations |

### Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/aurora-chat/index.ts` | Smart greetings, mood awareness, new action tags |
| `src/hooks/aurora/useAuroraChat.tsx` | Action trust system, command execution |
| `src/contexts/AuroraChatContext.tsx` | Global command handler |
| `src/components/aurora/AuroraChatBubbles.tsx` | Voice mode toggle, action cards |
| `supabase/functions/aurora-analyze/index.ts` | Mood/sentiment extraction |

### Database Migrations

```sql
-- Proactive queue for scheduled outreach
CREATE TABLE aurora_proactive_queue (...);

-- User action preferences (trust levels)
CREATE TABLE aurora_action_preferences (...);

-- Enhanced user context
ALTER TABLE aurora_user_context ADD COLUMN mood_signals JSONB;
ALTER TABLE aurora_user_context ADD COLUMN energy_level TEXT;
ALTER TABLE aurora_user_context ADD COLUMN last_active_page TEXT;
```

---

## Recommended Implementation Order

### Sprint 1: Proactive Intelligence (1-2 weeks)
1. Create `aurora_proactive_queue` table
2. Build `aurora-proactive` edge function
3. Integrate with push notifications
4. Add smart greeting system

### Sprint 2: Enhanced Context (1 week)
1. Create `useUserContext` hook
2. Add mood signal extraction to analyzer
3. Inject context into chat responses

### Sprint 3: Auto-Execution (1 week)
1. Create action preferences table
2. Implement trust level system
3. Build inline confirmation UI

### Sprint 4: Command Center (1 week)
1. Create `useAuroraCommands` hook
2. Add navigation action tags
3. Build global command listener

### Sprint 5: Voice Mode (2 weeks)
1. Implement OpenAI Realtime API edge function
2. Build full-screen voice UI
3. Add continuous listening mode

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Messages initiated by Aurora | > 30% of total interactions |
| Voice mode adoption | > 20% of active users |
| Auto-executed actions | > 50% of repeatable actions |
| User retention improvement | +15% |
| Daily active session length | +25% |

---

## Summary

This plan transforms Aurora from a reactive chatbot into a proactive life operating system that:

1. **Reaches out first** - Push notifications for important updates
2. **Knows your context** - Time, mood, patterns, and preferences
3. **Speaks naturally** - Real-time voice conversation
4. **Acts without asking** - Trusted actions execute automatically
5. **Controls the whole app** - Navigation, settings, modes

The result: A true "Jarvis for life" experience where users can manage their entire transformation journey just by talking.
