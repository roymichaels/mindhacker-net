

# Make Aurora Reliable: 3-Layer Architecture Split

## Status: ✅ IMPLEMENTED

The monolith has been split into 3 hard-boundary layers:

### Layer 1: Context Builder (`supabase/functions/_shared/contextBuilder.ts`)
- Pure deterministic module: DB → structured `AuroraContext` JSON
- Reads from unified `action_items` table (not legacy tables)
- Includes `context_hash` (SHA-256) for caching/debugging
- Shared between `aurora-chat` and `aurora-proactive`
- Re-exported via `aurora-chat/contextBuilder.ts` for local imports

### Layer 2: Orchestrator (`supabase/functions/aurora-chat/orchestrator.ts`)
- Mode routing (full/lite/widget)
- Prompt versioning: `full-v1.0`, `lite-v1.0`, `widget-v1.0`
- `formatContextForPrompt()` converts structured JSON → markdown for LLM
- Request validation (message count, content length, role checks)
- Returns `{ systemPrompt, model, maxTokens, temperature, promptVersion }`

### Layer 3: Handler (`supabase/functions/aurora-chat/index.ts`)
- ~120 lines thin handler
- Parses request → calls Layer 1 → calls Layer 2 → streams LLM → logs tracing

### Database: `ai_response_logs` table
- Stores `prompt_version`, `context_hash`, `model`, `mode` per AI response
- Enables exact reproduction of any AI response for debugging

### `aurora-proactive` refactored
- Now imports shared `buildContext` from `_shared/contextBuilder.ts`
- Adapts `AuroraContext` to `ProactiveSnapshot` via `toProactiveSnapshot()`
- No more duplicate `getUserContext()` logic

### Prompt Versioning Scheme
```
Format: "{mode}-v{major}.{minor}"
Examples: "full-v1.0", "lite-v1.0", "widget-v1.0"
Bump minor for wording changes, major for structural changes.
```
