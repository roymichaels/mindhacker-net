## Intent-First Journaling — kill the category picker

Rebuild `/journal` as a **conversational capture space**. The user just talks; AION categorizes, summarizes, tags, and links — silently. Categories become invisible metadata used only for filtering/orchestration, never as the primary UX.

### 1. Replace `src/pages/JournalingHub.tsx`

Remove the 9-tile category grid and the per-category `JournalTab` panel. The new hub has three stacked zones:

```text
┌──────────────────────────────────────────────┐
│  AION orb (small) + soft prompt              │
│  "דבר/י איתי. אני אארגן את המשמעות."          │
│                                              │
│  [ conversational textarea / voice ]         │
│  [ Save · ⌘↵ ]   ← single primary action     │
├──────────────────────────────────────────────┤
│  TODAY'S THREAD (optional, only if entries   │
│  exist for today — short emotional summary)  │
├──────────────────────────────────────────────┤
│  TIMELINE  (chronological feed of entries)   │
│   • each card: title · summary · ai_insight  │
│   • subtle category chip (metadata, muted)   │
│   • mood + tags as small footer              │
│   • newest first, infinite scroll later      │
└──────────────────────────────────────────────┘
```

Composer behavior:
- One unified input. No category selector. No type toggle.
- On Save → POST to `aurora-capture-journal` with `excerpt` = the user's text.
- Optimistic placeholder card ("AION is organizing…") then replaced with the saved entry returned by the function (already includes auto-detected category, title, summary, tags, mood, ai_insight).
- If `should_save=false`, still save a minimal `reflection` entry with the raw text (so the user never feels rejected) — handled client-side fallback.
- Voice: reuse existing voice input pattern from `GlobalChatInput` if straightforward, otherwise text-only in v1.

Timeline:
- `getJournalEntries` currently filters by `journal_type`. Add a new service call `getAllJournalEntries(userId, limit)` (no `type` filter) and use it here.
- Render entries from all categories together. Category only appears as a small muted badge (e.g., `bg-muted/40 text-muted-foreground text-[10px]`) — never as a tab/section divider.

Optional secondary affordance (kept low-key, not primary):
- A single `Filter` icon button in the timeline header that opens a small popover with category checkboxes for power users. Default state: all categories visible. Not shown in the empty state.

### 2. Strengthen `aurora-capture-journal` (small tweak)

`supabase/functions/aurora-capture-journal/index.ts`:
- Accept an optional `force_save: true` body flag. When true, skip the `should_save=false` short-circuit and persist as `reflection` if the model didn't classify confidently. The hub passes `force_save: true` so manual journaling never silently fails.
- Also return the `category` even when fallback to `reflection`, so the UI can label it.

### 3. Service layer

`src/services/journalEntries.ts`:
- Add `getAllJournalEntries(userId: string, limit = 50): Promise<JournalEntry[]>` — same as `getJournalEntries` but no `journal_type` filter.
- No schema migration needed; `journal_entries` already supports all current categories.

### 4. Cleanup

- Stop importing `JournalTab` from `JournalingHub.tsx`. `JournalTab` itself is left alone (still used elsewhere for legacy modals).
- Remove the category icon imports from the hub.

### 5. Out of scope for this turn

- App-wide intent orchestration (strategy/hypnosis/focus etc.) is the larger philosophy and stays on the roadmap. This task delivers the journaling instance of the principle as the first concrete proof.
- Pattern-linking, "today's thread" AI summarization, and memory-graph surfacing can ship as a follow-up; the data model already supports them via `tags`, `ai_insight`, and `linked_mission_id`.

### Visual / tone rules
- Calm, dark, single-column, max-w around 640px.
- No grid of colored tiles. No tabs. No "choose a category" anywhere.
- One soft AION prompt line above the composer, in the user's language.
- Category chip on cards uses a single neutral muted color — never the per-category accent palette from the old grid.

### Result
The journal becomes a living memory: user expresses, AION structures. Categories survive as backend metadata for search and orchestration, invisible in the primary flow.
