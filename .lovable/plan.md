
# Aurora Smart Suggestions - Direct Actions Enhancement

## Overview
Transform Aurora's smart suggestion buttons from message-sending prompts into direct action triggers. When a user clicks on a suggestion button, instead of sending a message to Aurora, the app will directly open the relevant feature/modal.

## Current Behavior
- User clicks suggestion → sends a message/prompt to Aurora chat
- Aurora then has to respond and potentially guide the user

## Proposed Behavior
- User clicks suggestion → **directly opens** the relevant modal/page/action
- Faster, more direct UX - "one tap to action"

---

## Architecture Design

### New Action Type System

Currently, `SmartSuggestion` has:
```typescript
interface SmartSuggestion {
  id: string;
  text: string;
  prompt: string;  // sent as message
  priority: number;
  icon: 'task' | 'hypnosis' | 'plan' | 'habit' | 'reflection' | 'milestone';
}
```

Will become:
```typescript
interface SmartSuggestion {
  id: string;
  text: string;
  priority: number;
  icon: 'task' | 'hypnosis' | 'plan' | 'habit' | 'reflection' | 'milestone';
  action: SuggestionAction;
}

type SuggestionAction = 
  | { type: 'open_hypnosis' }
  | { type: 'open_dashboard' }
  | { type: 'open_dashboard_view'; view: 'habits' | 'tasks' | 'plan' }
  | { type: 'send_message'; prompt: string }  // fallback for conversational ones
  | { type: 'navigate'; path: string };
```

---

## Implementation Steps

### Step 1: Create Aurora Actions Context
A new context to manage Aurora's action modals globally (similar to how DashboardSidebar manages them locally).

**New file: `src/contexts/AuroraActionsContext.tsx`**

```text
┌─────────────────────────────────────────────┐
│  AuroraActionsProvider                      │
│  ├── hypnosisModalOpen: boolean             │
│  ├── dashboardModalOpen: boolean            │
│  ├── openHypnosis(): void                   │
│  ├── openDashboard(view?): void             │
│  └── Renders: HypnosisModal, DashboardModal │
└─────────────────────────────────────────────┘
```

This allows any component (including AuroraWelcome) to trigger modals without prop drilling.

### Step 2: Update SmartSuggestion Interface
Modify `useSmartSuggestions.tsx` to use the new action-based system.

**File: `src/hooks/aurora/useSmartSuggestions.tsx`**

Changes:
- Add `SuggestionAction` type
- Replace `prompt` field with `action` field
- Map existing suggestions to appropriate actions:
  - `daily-hypnosis` / `start-hypnosis` → `{ type: 'open_hypnosis' }`
  - `daily-habits` → `{ type: 'open_dashboard', view: 'habits' }`
  - `overdue-task` / `today-task` → `{ type: 'open_dashboard', view: 'tasks' }`
  - `milestone-progress` → `{ type: 'open_dashboard', view: 'plan' }`
  - `reflection` → `{ type: 'send_message', prompt: '...' }` (keep conversational)

### Step 3: Update AuroraWelcome Component
Modify to execute actions instead of sending messages.

**File: `src/components/aurora/AuroraWelcome.tsx`**

Changes:
- Import and use `useAuroraActions` context
- Update `onClick` handler to dispatch appropriate action:

```typescript
const handleSuggestionAction = (action: SuggestionAction) => {
  switch (action.type) {
    case 'open_hypnosis':
      openHypnosis();
      break;
    case 'open_dashboard':
      openDashboard(action.view);
      break;
    case 'send_message':
      onSuggestionClick(action.prompt);
      break;
    case 'navigate':
      navigate(action.path);
      break;
  }
};
```

### Step 4: Integrate Context into Layout
Wrap the Aurora layout with the new actions provider.

**File: `src/components/aurora/AuroraLayout.tsx`**

Changes:
- Import `AuroraActionsProvider`
- Wrap content with provider
- Provider renders the modals at this level

### Step 5: Update AuroraChatArea
Keep backward compatibility for the `onSuggestionClick` prop but handle both action types.

**File: `src/components/aurora/AuroraChatArea.tsx`**

Changes:
- Pass down action handler or context access to AuroraWelcome
- Maintain message-sending for conversational suggestions

---

## File Changes Summary

| File | Change Type | Description |
|------|-------------|-------------|
| `src/contexts/AuroraActionsContext.tsx` | **New** | Context for global Aurora actions (modals) |
| `src/hooks/aurora/useSmartSuggestions.tsx` | **Modify** | Add action types, replace prompts with actions |
| `src/components/aurora/AuroraWelcome.tsx` | **Modify** | Execute actions instead of sending messages |
| `src/components/aurora/AuroraChatArea.tsx` | **Modify** | Handle both action and message suggestions |
| `src/components/aurora/AuroraLayout.tsx` | **Modify** | Integrate AuroraActionsProvider |
| `src/hooks/aurora/index.ts` | **Modify** | Export new types |

---

## Action Mapping Table

| Suggestion ID | Current Behavior | New Behavior |
|---------------|------------------|--------------|
| `start-hypnosis` | Sends message | Opens HypnosisModal |
| `daily-hypnosis` | Sends message | Opens HypnosisModal |
| `daily-habits` | Sends message | Opens DashboardModal → Habits view |
| `overdue-task` | Sends message | Opens DashboardModal → Tasks view |
| `today-task` | Sends message | Opens DashboardModal → Tasks view |
| `milestone-progress` | Sends message | Opens DashboardModal → Plan view |
| `whats-today` | Sends message | Sends message (keep conversational) |
| `progress-check` | Sends message | Sends message (keep conversational) |
| `feeling-stuck` | Sends message | Sends message (keep conversational) |
| `reflection` | Sends message | Sends message (keep conversational) |

---

## Technical Details

### AuroraActionsContext Implementation

```typescript
interface AuroraActionsContextType {
  // Modal states
  hypnosisModalOpen: boolean;
  dashboardModalOpen: boolean;
  dashboardInitialView: 'dashboard' | 'habits' | 'tasks' | 'plan';
  
  // Actions
  openHypnosis: () => void;
  openDashboard: (view?: string) => void;
  closeHypnosis: () => void;
  closeDashboard: () => void;
}
```

### DashboardModal Enhancement
The current `DashboardModal` supports `initialView: 'dashboard' | 'profile'`. This may need to be extended to support direct navigation to specific sections like habits, tasks, or plan views if they exist as sub-views within the dashboard.

---

## Benefits

1. **Faster UX**: One tap directly opens the feature
2. **Reduced AI load**: No need for Aurora to parse intent and respond
3. **Clear intent**: Actions are explicit, not interpreted
4. **Maintainable**: Centralized action handling
5. **Extensible**: Easy to add new action types (future: open 90-day plan editor, open habit tracker, etc.)

---

## Future Extensibility

This action system can be expanded to support:
- `{ type: 'open_90_day_plan' }`
- `{ type: 'open_habit_tracker' }`
- `{ type: 'start_breathing_exercise' }`
- `{ type: 'open_checklist', checklistId: string }`
- `{ type: 'call_edge_function', functionName: string, params: object }`

The architecture is designed to be a foundation for Aurora's "powers" - direct control over the app through intelligent suggestions.
