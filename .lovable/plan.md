

# Make Aurora Reliable: 3-Layer Architecture Split

## The Problem

`aurora-chat/index.ts` is a 1,178-line monolith that does everything in one function:
- **Lines 520-968**: `buildUserContext()` -- 21 parallel DB queries, streak calculations, date math, habit logs, project analysis, string formatting. All deterministic. Untestable because it's entangled with the LLM call.
- **Lines 14-451**: `buildSystemPrompt()` -- 450 lines of prompt engineering across 3 modes (full/lite/widget) in 2 languages. Unversioned. Impossible to A/B test.
- **Lines 1008-1178**: The actual serve handler -- validation, routing, model selection, and the LLM call all mixed together.

`aurora-proactive/index.ts` (472 lines) duplicates much of the same context-building logic with its own `getUserContext()`.

**The result**: You can't test context building without LLM randomness, can't retry model calls safely, can't cache context, and can't version prompts. Every bug is a mystery because there's no trace of what context + prompt produced what response.

## The Solution: 3 Hard-Boundary Layers

Split into 3 separate modules with clear contracts between them.

```
Layer 1: Context Builder (deterministic)
   reads DB -> returns structured JSON
   no LLM calls, fully testable

Layer 2: Orchestrator (policy + routing)
   chooses mode, builds prompt, applies safety checks
   returns {messages, model, config}

Layer 3: Model Call (LLM only)
   takes prepared payload -> streams response
   logs prompt_version + context_hash
```

### What This Enables
- **Test context building** without AI randomness (pure DB -> JSON)
- **Retry model calls safely** (Layer 3 is stateless, just takes a payload)
- **Cache context** (hash the JSON, skip DB queries if hash matches within TTL)
- **Version prompts cleanly** (prompt_version stored per response)
- **Debug any AI response** (look up context_hash + prompt_version to reproduce)

---

## Technical Details

### New File: `supabase/functions/aurora-chat/contextBuilder.ts`

Extract `buildUserContext()` (lines 520-968) into a pure module:

```text
Input:  (supabaseClient, userId, language)
Output: AuroraContext (typed JSON object)
```

- All 21 parallel DB queries stay here
- Streak calculation stays here
- Habit log joining stays here
- Project analysis stays here
- NOW reads from `action_items` instead of legacy tables
- Returns a typed `AuroraContext` object (not a string)
- Includes `context_hash` (MD5 of the JSON) for caching/debugging
- Deterministic: same DB state always produces same output

Key change from current code: instead of returning a formatted string, returns structured JSON. The string formatting moves to Layer 2.

### New File: `supabase/functions/aurora-chat/orchestrator.ts`

Extract prompt building + mode routing:

```text
Input:  (mode, context: AuroraContext, language, knowledgeBase?)
Output: { systemPrompt, model, maxTokens, temperature, promptVersion }
```

- `buildSystemPrompt()` (lines 14-451) moves here
- Mode routing (full/lite/widget) moves here
- Model selection logic moves here
- Each prompt template gets a `PROMPT_VERSION` constant (e.g., `"full-v1.0"`, `"widget-v1.0"`)
- `formatContextForPrompt(context)` -- converts structured JSON to the markdown string the LLM consumes
- `generateOpenerContext()` (lines 454-518) moves here
- Safety checks (message validation, length limits) move here

### Refactored File: `supabase/functions/aurora-chat/index.ts`

Becomes a thin ~80-line handler:

```text
1. Parse request (mode, userId, messages, language)
2. Call contextBuilder.buildContext(supabase, userId, language)
3. Call orchestrator.prepare(mode, context, language)
4. Call LLM gateway with prepared payload
5. Log { prompt_version, context_hash, model, mode }
6. Stream response back
```

### Database: Add tracing columns

Add `prompt_version` and `context_hash` to `aurora_conversations` or a new `ai_response_logs` table:

```text
ai_response_logs:
  id UUID PK
  user_id UUID
  conversation_id UUID (nullable)
  prompt_version TEXT (e.g., "full-v1.2")
  context_hash TEXT (MD5 of context JSON)
  model TEXT (e.g., "google/gemini-2.5-flash")
  mode TEXT (full/lite/widget)
  token_count INTEGER
  created_at TIMESTAMPTZ
```

This makes every AI response debuggable: given a bug report, look up the context_hash and prompt_version to reproduce exactly what the LLM saw.

### Refactored File: `supabase/functions/aurora-proactive/index.ts`

Replace the duplicate `getUserContext()` (lines 27-174) with an import from the shared context builder. The proactive function becomes:

```text
1. Get list of active users
2. For each user: contextBuilder.buildContext(supabase, userId, 'he')
3. analyzeAndQueue(context) -- policy logic stays here
4. generateAICoachingMessage(context) -- uses a simplified orchestrator call
```

### Files to Create
1. `supabase/functions/aurora-chat/contextBuilder.ts` -- Pure context assembly from DB
2. `supabase/functions/aurora-chat/orchestrator.ts` -- Prompt building, mode routing, versioning
3. Database migration: `ai_response_logs` table with RLS

### Files to Modify
1. `supabase/functions/aurora-chat/index.ts` -- Slim down from 1,178 to ~80 lines
2. `supabase/functions/aurora-proactive/index.ts` -- Replace duplicate getUserContext with import

### Migration from Legacy Tables

The context builder will read from the new `action_items` table instead of querying `aurora_checklists`, `aurora_checklist_items`, `aurora_daily_minimums`, and `life_plan_milestones` separately. This means:
- 21 parallel queries reduce to ~12 (action_items replaces 4-5 legacy table queries)
- Overdue tasks: `action_items WHERE type='task' AND status IN ('todo','doing') AND due_at < today`
- Today's tasks: `action_items WHERE due_at::date = today`
- Daily habits: `action_items WHERE type='habit'`
- Milestones: `action_items WHERE type='milestone' AND plan_id = active_plan`

### No Breaking Changes

- The API contract (request/response format) stays identical
- The frontend code (`useAuroraChat.tsx`, `MessageThread.tsx`) needs zero changes
- Streaming behavior is unchanged
- The split is purely internal to the edge function

### Prompt Versioning Scheme

```text
Format: "{mode}-v{major}.{minor}"
Examples: "full-v1.0", "lite-v1.0", "widget-v1.0"

Bump minor for wording changes (e.g., "full-v1.1")
Bump major for structural changes (e.g., "full-v2.0")
```

The version string is logged with every response, so you can correlate user complaints ("Aurora said something weird yesterday") with exactly which prompt version was active.
