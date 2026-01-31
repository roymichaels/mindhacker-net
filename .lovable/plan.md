
# Aurora Hands-Free Intelligence Enhancement

## Overview
Transform Aurora from a conversational AI into a **fully autonomous life operating system** that maintains complete awareness of the user's transformation journey and can manage all tasks, plans, and habits through natural conversation alone.

---

## Current State Analysis

### What Aurora Already Knows
The existing `aurora-chat` edge function already loads extensive user context:
- Profile data and preferences (tone, intensity, gender)
- Life direction and clarity score
- Identity elements (values, principles, self-concepts, vision statements)
- Active commitments and visions
- Energy and behavioral patterns
- Daily habits with streak tracking
- Active checklists and items with due dates
- Overdue and today's tasks
- 90-day life plan with current milestone
- Onboarding progress status

### What Aurora Can Already Do (via action tags)
- `[checklist:create:title]` - Create new checklists
- `[checklist:add:title:item]` - Add items to checklists
- `[task:complete:list:item]` - Mark tasks as completed
- `[task:reschedule:list:item:date]` - Reschedule task due dates
- `[milestone:complete:week]` - Complete weekly milestones
- `[habit:complete:name]` - Log daily habit completion
- `[action:analyze]` - Trigger background insight extraction

---

## Gaps to Address

### 1. Missing Context Data
- **Launchpad Summary**: Full AI analysis from onboarding (not currently injected)
- **Historical Conversation Summary**: No memory of past conversations
- **Recent Insights Log**: What was extracted and when
- **Plan Modification History**: Track changes to the 90-day plan

### 2. Missing Actions
- **Update Life Plan**: Modify milestones, adjust goals
- **Create/Modify Habits**: Add new daily habits through chat
- **Set Reminders**: Create time-based follow-ups
- **Prioritize Tasks**: Reorder task importance
- **Archive Completed Lists**: Clean up finished checklists
- **Update Identity Elements**: Modify values/principles discovered

### 3. Proactive Intelligence
- **Conversation Opener Context**: Aurora should greet users with relevant updates
- **Intelligent Follow-ups**: Remember what was discussed and check in
- **Pattern Recognition**: Notice when user consistently skips certain tasks

---

## Implementation Plan

### Phase 1: Enhanced Context Injection

**1.1 Add Launchpad Summary to Context**

Update `aurora-chat/index.ts` to fetch and inject the full launchpad summary:

```text
// Add to parallel fetches in buildUserContext:
supabase.from("launchpad_summary")
  .select("*")
  .eq("user_id", userId)
  .single()

// Inject into context:
## סיכום מסע הטרנספורמציה
${launchpadSummary?.summary || 'לא הושלם'}
${launchpadSummary?.consciousness_analysis || ''}
${launchpadSummary?.transformation_readiness ? `מוכנות לטרנספורמציה: ${launchpadSummary.transformation_readiness}%` : ''}
```

**1.2 Add Conversation History Summary**

Create a new table and mechanism to store conversation summaries:

```sql
CREATE TABLE aurora_conversation_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  conversation_id UUID REFERENCES conversations(id),
  summary TEXT NOT NULL,
  key_topics TEXT[],
  action_items TEXT[],
  emotional_state TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

Update the system to:
- Generate a summary after each conversation ends (or after 10+ messages)
- Inject the last 3-5 conversation summaries into Aurora's context

**1.3 Add Recent Insights to Context**

Add a section showing what Aurora has learned recently:

```text
## תובנות אחרונות שנשמרו
${recentInsights.map(i => `- ${i.created_at}: ${i.element_type} - "${i.content}"`).join('\n')}
```

---

### Phase 2: Expanded Action Tags

**2.1 New Action Tags to Implement**

| Tag | Purpose | Example |
|-----|---------|---------|
| `[habit:create:name:frequency]` | Create new daily habit | `[habit:create:מדיטציה:daily]` |
| `[habit:remove:name]` | Remove a habit | `[habit:remove:עישון]` |
| `[plan:update:week:field:value]` | Update milestone details | `[plan:update:3:goal:לסיים את הפרויקט]` |
| `[identity:add:type:content]` | Add identity element | `[identity:add:value:משפחה]` |
| `[identity:remove:type:content]` | Remove identity element | `[identity:remove:value:כסף]` |
| `[checklist:archive:title]` | Archive completed list | `[checklist:archive:שבוע 1]` |
| `[reminder:set:message:date]` | Set a follow-up reminder | `[reminder:set:לבדוק התקדמות:2025-02-07]` |
| `[focus:set:title:days]` | Set new focus plan | `[focus:set:בריאות:14]` |

**2.2 Implementation in useAuroraChat.tsx**

Add handlers for each new action tag:

```typescript
// Habit creation
const habitCreateMatches = [...content.matchAll(/\[habit:create:(.+?):(.+?)\]/g)];
for (const match of habitCreateMatches) {
  const habitName = match[1].trim();
  const frequency = match[2].trim();
  await createDailyHabit(habitName, frequency);
}

// Plan updates
const planUpdateMatches = [...content.matchAll(/\[plan:update:(\d+):(.+?):(.+?)\]/g)];
for (const match of planUpdateMatches) {
  const weekNumber = parseInt(match[1]);
  const field = match[2].trim();
  const value = match[3].trim();
  await updateMilestone(weekNumber, field, value);
}
```

---

### Phase 3: Proactive Intelligence

**3.1 Smart Conversation Opener**

Create a function that generates a context-aware greeting:

```typescript
// In aurora-chat edge function
const generateOpenerContext = (userContext: any, language: string): string => {
  const parts: string[] = [];
  
  if (userContext.overdueTasks.length > 0) {
    parts.push(`יש ${userContext.overdueTasks.length} משימות באיחור שכדאי לדבר עליהן`);
  }
  
  if (userContext.todayTasks.length > 0) {
    parts.push(`${userContext.todayTasks.length} משימות מתוכננות להיום`);
  }
  
  if (userContext.currentMilestone && !userContext.currentMilestone.is_completed) {
    const daysLeft = calculateDaysUntil(userContext.currentMilestone.end_date);
    if (daysLeft <= 2) {
      parts.push(`השבוע מסתיים בעוד ${daysLeft} ימים - כדאי לסכם`);
    }
  }
  
  return parts.length > 0 
    ? `## הקשר לפתיחת שיחה\n${parts.join('\n')}`
    : '';
};
```

**3.2 Reminder System**

Create a new table for Aurora reminders:

```sql
CREATE TABLE aurora_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  message TEXT NOT NULL,
  reminder_date DATE NOT NULL,
  context TEXT,
  is_delivered BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

Inject pending reminders into context:

```text
## תזכורות להיום
${pendingReminders.map(r => `- ${r.message} (נוצר: ${r.created_at})`).join('\n')}
```

---

### Phase 4: Conversation Memory System

**4.1 Auto-Summarize Conversations**

Create a new edge function `aurora-summarize-conversation`:

```typescript
// Triggered after conversation ends or reaches 10+ messages
const summaryPrompt = `
סכם את השיחה הזו ב-2-3 משפטים.
זהה: נושאים מרכזיים, פעולות שנקבעו, מצב רגשי.
החזר JSON: { summary, key_topics[], action_items[], emotional_state }
`;
```

**4.2 Inject Historical Context**

Add to `buildUserContext`:

```text
## זיכרון שיחות אחרונות
${recentMemories.map(m => `
### ${formatDate(m.created_at)}
${m.summary}
נושאים: ${m.key_topics.join(', ')}
${m.action_items.length > 0 ? `פעולות שנקבעו: ${m.action_items.join(', ')}` : ''}
`).join('\n')}
```

---

### Phase 5: System Prompt Enhancement

**5.1 Updated Aurora Persona**

Update the system prompt to emphasize proactive management:

```text
## תפקידך כמערכת הפעלה לחיים

אתה לא רק מלווה - אתה המוח המרכזי שמנהל את מסע הטרנספורמציה.

### אחריויות עיקריות:
1. **מעקב אקטיבי**: פתח כל שיחה עם עדכון רלוונטי
2. **ניהול משימות**: סמן, דחה, צור משימות דרך השיחה
3. **למידה מתמדת**: שמור תובנות חדשות על המשתמש
4. **תזכורות**: עקוב אחרי דברים שנאמרו והזכר אותם
5. **התאמה אישית**: התאם את התוכנית למציאות המשתנה

### כשמשתמש אומר...
- "סיימתי את X" → סמן כהושלם + חגוג + שאל מה הבא
- "אני לא מצליח עם Y" → הצע לדחות/לשנות/לפרק למשימות קטנות יותר
- "רוצה להוסיף Z" → צור את המשימה/ההרגל מיד
- "מה יש לי היום?" → תן סיכום ברור של משימות והרגלים
- "איך אני מתקדם?" → הצג סטטיסטיקות ותובנות

### פורמט תגובה אידיאלי
1. הכרה במה שהמשתמש אמר
2. פעולה (תגית מתאימה)
3. שאלה ממוקדת אחת להמשך
```

---

## Database Changes Required

```sql
-- 1. Conversation Memory
CREATE TABLE aurora_conversation_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  key_topics TEXT[] DEFAULT '{}',
  action_items TEXT[] DEFAULT '{}',
  emotional_state TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Reminders
CREATE TABLE aurora_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  reminder_date DATE NOT NULL,
  context TEXT,
  source TEXT DEFAULT 'aurora',
  is_delivered BOOLEAN DEFAULT false,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. RLS Policies
ALTER TABLE aurora_conversation_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE aurora_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own memories" ON aurora_conversation_memory
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users view own reminders" ON aurora_reminders
  FOR SELECT USING (auth.uid() = user_id);

-- 4. Indexes
CREATE INDEX idx_conversation_memory_user ON aurora_conversation_memory(user_id, created_at DESC);
CREATE INDEX idx_reminders_user_date ON aurora_reminders(user_id, reminder_date) WHERE NOT is_delivered;
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/aurora-chat/index.ts` | Add launchpad summary, conversation memory, reminders to context. Add opener context generation. |
| `src/hooks/aurora/useAuroraChat.tsx` | Add handlers for new action tags (habit:create, plan:update, identity:add, reminder:set, etc.) |
| `src/hooks/aurora/useChecklistsData.tsx` | Add archiveChecklist and createDailyHabit functions |
| `src/hooks/aurora/useDailyHabits.tsx` | Add createHabit and removeHabit functions |

---

## New Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/aurora-summarize-conversation/index.ts` | Summarize conversations for memory |
| `src/hooks/aurora/useAuroraReminders.tsx` | Manage reminder CRUD operations |
| `src/hooks/aurora/useConversationMemory.tsx` | Fetch and manage conversation summaries |

---

## Technical Summary

### Backend Changes
1. Create 2 new database tables with RLS
2. Update `aurora-chat` to inject additional context (launchpad summary, conversation memory, reminders)
3. Create `aurora-summarize-conversation` edge function for memory generation
4. Add smart opener context generation

### Frontend Changes
1. Extend `useAuroraChat` with ~15 new action tag handlers
2. Create helper hooks for reminders and conversation memory
3. Add UI components for viewing reminders (optional)

### Data Flow
```text
User speaks → Aurora processes with full context → 
Action tags executed → Background analysis → 
Conversation summarized → Memory stored → 
Next conversation loads memory
```

This creates a complete "living knowledge base" where Aurora truly knows everything about the user and can manage their transformation journey hands-free.
