

## Aurora Chat Page Overhaul

### What's Wrong Now
1. **Background issue**: The chat area has nested containers with visible borders/backgrounds creating a "container in container" look
2. **Tab switcher is inline**: Dreams, Reflect, Gratitude tabs sit inside the chat page as tab switcher bar — should be iPhone widgets that open as modals
3. **Chat input is not truly fixed/floating**: It scrolls with content instead of staying pinned
4. **Only 3 journal modals exist** — user wants 4 total iPhone widget buttons (Dreams, Reflect, Gratitude + Plan + Beliefs = 5... but user said "2 other modals so it will be 4" — meaning 4 widgets: Dreams, Gratitude, Plan, Beliefs)

### Plan

#### 1. Clean up AuroraPage layout — remove nested containers
- Remove the tab switcher bar entirely
- Make the chat the main/only content of the page
- Remove any visible background containers — chat messages float directly on `bg-background`
- Ensure `AuroraChatArea` and `AuroraChatBubbles` have no wrapping card/container styling

#### 2. Make chat input dock truly floating & fixed
- Change the input dock from `absolute bottom-0` to `fixed bottom-[84px]` (above bottom nav)
- Add floating styling: `mx-3 rounded-2xl backdrop-blur-xl bg-background/80 border border-border/30`
- Remove the gradient fade background, replace with clean floating pill

#### 3. Replace tab switcher with 4 floating iPhone widgets
- Add a floating horizontal row of 4 `IPhoneWidget` buttons above the chat input dock
- Position: fixed, above the input dock
- Widgets:
  - **Dreams** (Moon icon, indigo gradient) → opens Dreams journal modal
  - **Gratitude** (Heart icon, rose gradient) → opens Gratitude journal modal  
  - **Plan** (Target icon, cyan gradient) → opens Plan summary modal (today's tasks from `action_items`)
  - **Beliefs** (Brain icon, violet gradient) → opens Beliefs modal (from `aurora_memory_graph` where `node_type = 'belief'`)

#### 4. Create modal wrappers for each widget
Each opens as a full-screen or sheet-style modal (`Dialog` or `Drawer`):
- **Dreams Modal**: Wraps existing `JournalTab` with `type="dream"`
- **Gratitude Modal**: Wraps existing `JournalTab` with `type="gratitude"`  
- **Plan Modal**: New component — fetches today's `action_items` (tasks, habits) and displays them as a checklist. Read-only summary view.
- **Beliefs Modal**: New component — fetches `aurora_memory_graph` entries where `node_type = 'belief'`, displays them as cards with strength indicators

#### 5. Auto-update from Aurora conversations
This already works! The existing infrastructure handles it:
- **Beliefs**: `useCommandBus` already processes `memoryGraphUpsert` commands from Aurora's responses, writing to `aurora_memory_graph`
- **Plan**: Aurora already uses `[task:create]`, `[task:swap]` commands via the command bus to update `action_items`
- **Dreams/Gratitude**: These are manually entered journal entries (user writes them)
- No new backend changes needed — the existing `aurora-analyze` function and command bus already extract beliefs/patterns from chat and update the memory graph automatically

#### 6. Remove Reflection tab
User only mentioned Dreams, Gratitude, Plan, Beliefs — Reflection is dropped.

### Files to modify
- `src/pages/AuroraPage.tsx` — Major rewrite: remove tabs, add floating widgets row, floating input, modals
- `src/components/aurora/AuroraPlanModal.tsx` — New: today's plan summary from `action_items`
- `src/components/aurora/AuroraBeliefsModal.tsx` — New: beliefs from `aurora_memory_graph`
- `src/components/aurora/AuroraJournalModal.tsx` — New: wrapper modal for `JournalTab`
- `src/components/aurora/AuroraChatBubbles.tsx` — Remove any container backgrounds
- `src/components/aurora/AuroraChatArea.tsx` — Remove `max-w-3xl` container wrapper, clean bg

### No database changes needed
All data sources already exist: `journal_entries`, `action_items`, `aurora_memory_graph`.

