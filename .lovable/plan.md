

# Phase 2: App Command Bus -- Make Aurora the Operator

## Problem

Aurora has two disconnected command systems and an unused trust/confirmation layer:

1. **`useAuroraCommands`** handles navigation, settings, mode commands -- but is never imported anywhere.
2. **`processActionTags`** (inside `useAuroraChat`, 300+ lines) handles task/habit/checklist/milestone mutations -- tightly coupled to the chat hook, no confirmation flow.
3. **`useActionTrust`** + **`AuroraActionConfirmation`** exist but are not wired to anything.

Result: Aurora executes destructive actions (delete task, archive checklist) silently with no user confirmation, and navigation commands are dead code.

---

## Architecture

```text
Aurora AI Response
       |
       v
  Tag Parser (extract all [command:...] tags)
       |
       v
  Command Bus (single dispatch point)
       |
       +---> Trust Check (useActionTrust)
       |         |
       |    auto_execute? -----> Execute immediately
       |         |
       |    always_ask? -------> Show AuroraActionConfirmation
       |                              |
       |                         User confirms --> Execute
       |                         User denies  --> Skip
       |
       +---> Execute Command
       |         |
       |    Mutation commands --> DB write + invalidate queries
       |    Navigation commands --> router.navigate()
       |    Modal commands --> open modal via context
       |    Setting commands --> setTheme, etc.
       |
       +---> Action Receipt + Toast
```

---

## Files to Create/Modify

### 1. NEW: `src/lib/commandBus.ts` -- Command Registry (pure TS, no React)

Defines the canonical command types and their payloads:

```text
Commands:
  openTab(tabId: 'today' | 'plan' | 'aurora' | 'me')
  openModal(modalId: 'hypnosis' | 'settings' | 'profile' | 'upgrade', payload?)
  createActionItem(type, title, checklistTitle?)
  completeActionItem(identifier)
  deleteActionItem(identifier)
  rescheduleActionItem(identifier, newDate)
  createHabit(name)
  completeHabit(name)
  removeHabit(name)
  createChecklist(title)
  archiveChecklist(title)
  renameChecklist(oldTitle, newTitle)
  completeMilestone(weekNumber)
  updatePlan(weekNumber, field, value)
  addIdentity(elementType, content)
  removeIdentity(elementType, content)
  setReminder(message, date)
  setFocus(title, days)
  setTheme(value)
  toggleTheme()
  triggerAnalysis()
```

Each command is a typed discriminated union:
```typescript
type AppCommand =
  | { type: 'openTab'; tabId: string }
  | { type: 'openModal'; modalId: string; payload?: Record<string, any> }
  | { type: 'createActionItem'; title: string; checklistTitle?: string }
  | { type: 'completeActionItem'; identifier: string; checklistTitle?: string }
  // ... etc
```

A `parseAllTags(content: string): AppCommand[]` function replaces the scattered regex parsing. It handles all tag formats from both `useAuroraCommands` and `processActionTags`.

A `classifyRisk(command: AppCommand): 'safe' | 'moderate' | 'destructive'` function determines confirmation requirements:
- **safe**: navigation, theme, analysis -- always auto-execute
- **moderate**: create task, complete task, log habit -- respect trust preferences
- **destructive**: delete task, archive checklist, remove habit -- always confirm unless trust is `auto_execute`

### 2. NEW: `src/hooks/aurora/useCommandBus.tsx` -- React Hook

The single dispatcher that:
- Receives `AppCommand[]` from tag parsing
- For each command, checks `useActionTrust.shouldAutoExecute(command.type)`
- If auto-execute or safe: runs immediately, emits receipt + toast
- If needs confirmation: queues command into a `pendingCommands` state
- Exposes `confirmCommand(id)` and `rejectCommand(id)` for the confirmation UI
- After execution, calls `useActionTrust.recordExecution(command.type)`
- Returns `{ pendingCommands, confirmCommand, rejectCommand, lastReceipts }`

Internally uses:
- `useNavigate()` for tab/page navigation
- `useAuroraActions()` for modal control (hypnosis, dashboard)
- `useChecklistsData()` for task/checklist mutations
- `useDailyHabits()` for habit mutations
- Direct Supabase calls for milestones, identity, focus, reminders (moved from useAuroraChat)

### 3. MODIFY: `src/hooks/aurora/useAuroraChat.tsx` -- Slim Down

Remove the 300-line `processActionTags` function and all individual mutation functions (createDailyHabit, removeHabit, updateMilestone, addIdentityElement, etc.).

Replace with:
```typescript
const { dispatchCommands, pendingCommands } = useCommandBus();

// After streaming completes:
const commands = parseAllTags(fullContent);
const cleanedContent = stripAllTags(fullContent);
await dispatchCommands(commands);
```

This reduces `useAuroraChat` from ~1037 lines to ~400 lines.

### 4. MODIFY: `src/components/aurora/AuroraChatArea.tsx` -- Render Confirmations

Import `useCommandBus` (or receive pending commands as props) and render `AuroraActionConfirmation` cards inline in the chat for any pending commands. When user confirms/rejects, call the bus methods.

### 5. MODIFY: `src/contexts/AuroraActionsContext.tsx` -- Expand Modal Registry

Add entries for all modals that Aurora can trigger:
- `settingsModalOpen` + `openSettings()` / `closeSettings()`
- `profileDrawerOpen` + `openProfile()` / `closeProfile()`
- `upgradeModalOpen` + `openUpgrade()` / `closeUpgrade()`

This makes `openModal('settings')` work through the context rather than ad-hoc navigation.

### 6. MODIFY: `src/hooks/aurora/index.ts` -- Export new hook

Add `export { useCommandBus } from './useCommandBus'`.

---

## What Does NOT Change

- `AuroraActionConfirmation.tsx` -- UI component is already built, used as-is
- `useActionTrust.tsx` -- Trust system is already built, used as-is
- `aurora_action_preferences` table -- Already exists with correct schema and RLS
- Edge functions -- No backend changes
- Database -- No migrations needed

## Confirmation Flow (User Experience)

1. Aurora responds with: "Done! I completed the task for you. [task:complete:Morning:Meditate]"
2. Command bus parses the tag, checks trust for `completeActionItem`
3. If user has never done this before (trust = `always_ask`):
   - A small confirmation card appears in chat: "Complete Task: Meditate (in Morning checklist)? [Yes] [No] [Always Allow]"
4. User taps "Yes" -- task completes, toast appears, receipt logged
5. User taps "Always Allow" -- trust level saved to DB, future completions auto-execute
6. After 5 auto-executions, system suggests promoting other similar actions

## Risk Classification

| Risk | Commands | Behavior |
|------|----------|----------|
| Safe | openTab, openModal, setTheme, toggleTheme, triggerAnalysis | Always auto-execute, no confirmation |
| Moderate | createActionItem, completeActionItem, createHabit, completeHabit, completeMilestone, setReminder, setFocus, addIdentity | Respect trust preferences (default: auto for create/complete) |
| Destructive | deleteActionItem, archiveChecklist, removeHabit, removeIdentity | Always confirm unless trust is `auto_execute` |
