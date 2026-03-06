

## Understanding the Problem

Currently, each milestone is scheduled as an **individual time slot** (e.g., "Morning Breathing Protocol" at 06:30-06:45). The user wants milestones to be **grouped into themed time blocks** — for example, a "Morning Block" (06:00-07:30) that **contains** breathing, tai chi, yoga, grounding milestones inside it. Each milestone within the block is a journey/adventure that opens the visual roadmap when tapped.

**Current**: Day → flat list of individual milestones with times
**Desired**: Day → themed BLOCKS (Morning, Training, Focus, Evening) → each block contains multiple milestones → each milestone opens as a journey

## Plan

### 1. Restructure the AI Schedule Generator

**File**: `supabase/functions/generate-tactical-schedule/index.ts`

Update the prompt to generate **nested blocks** instead of flat milestone lists:

```json
{
  "days": [{
    "day_number": 1,
    "blocks": [
      {
        "block_title_he": "בלוק בוקר",
        "block_title_en": "Morning Block",
        "block_emoji": "🌅",
        "start_time": "06:00",
        "end_time": "07:30",
        "category": "health",
        "milestones": [
          { "milestone_id": "...", "title_he": "פרוטוקול נשימה", "duration_minutes": 15, ... },
          { "milestone_id": "...", "title_he": "תרגול טאי צ'י", "duration_minutes": 20, ... },
          { "milestone_id": "...", "title_he": "יוגה בוקר", "duration_minutes": 25, ... }
        ]
      },
      {
        "block_title_he": "בלוק אימון",
        "block_title_en": "Training Block",
        "start_time": "10:00",
        "end_time": "11:00",
        ...
      }
    ]
  }]
}
```

The AI groups related milestones into 3-5 themed blocks per day. Each milestone can appear in multiple days' blocks based on cadence.

### 2. Update Types & Parser

**File**: `src/hooks/useWeeklyTacticalPlan.ts`

- Update `TacticalBlock` to hold block-level metadata (title, emoji, time range)
- Update `TacticalAction` entries to be the milestones within each block
- Update `parseAiSchedule()` to parse the nested structure where each AI block contains an array of milestones

### 3. Redesign the DayView UI

**File**: `src/pages/ArenaHub.tsx`

Replace the flat list with **collapsible block cards**:
- Each block shows as a card with title, emoji, time range, and milestone count
- Expanding a block reveals the milestones inside it
- Each milestone row has a play button that opens the `MilestoneJourneyModal`
- Visual: block header with gradient based on category, milestones listed inside with progress indicators

### 4. Update the Journey Modal Integration

No changes needed — `MilestoneJourneyModal` already works per-milestone. When user taps a milestone inside a block, it opens the journey for that specific milestone.

### Technical Details

- The AI prompt will instruct grouping by theme: Morning rituals together, training together, deep work together, social together, evening review together
- Each block gets a total duration (sum of its milestones) and a time window
- The same milestone can appear in blocks across different days (e.g., breathing in Morning Block on days 1,3,5,7,9)
- Block completion = all milestones inside completed

