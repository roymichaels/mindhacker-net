## Validation pass — what I observed

I could not drive the chat from the headless browser (it lands on `/aurora` without your Supabase session). I validated everything I could from logs + database + code.

### Pipelines that ARE alive
- `aurora-chat` (id `9a00…`), `aion-orchestrator` (`4575…`), `memory-writer` (`268e…`), `aion-brain` (`3c6e…`) all returning **200** repeatedly in the last few minutes.
- `aion_signals` is being populated: latest entries include `route_change` at 20:27, `intent.classified` (smalltalk, 0.95) at 20:24, `emotion.detected` (joyful, valence 0.7) at 20:24 — so the chat → orchestrator → signals path works.
- The client heartbeat I added is firing: every route change calls `aion-brain` (visible in edge logs).

### What is broken — root cause found

**`aion_decisions` row is frozen at `updated_at = 15:47:16 UTC` (4h+ ago) and `expires_at = 15:57:16 UTC`.** The brain edge function is being invoked but **never writes a fresh row**. That is why:
- `BrainSection` shows "expired"
- `EnvironmentSection.source = fast-tier`
- All replies feel scripted (fast-tier rules drive tone/density without a live decision)

The smoking gun is in `supabase/functions/aion-brain/index.ts`:

```ts
if (!aiResp.ok) {
  if (existing) return { ...existing, stale: true };   // ← returns 200, row untouched
  throw new Error(`AI gateway ${aiResp.status}`);
}
const toolCall = aiJson.choices?.[0]?.message?.tool_calls?.[0];
if (!toolCall) {
  if (existing) return { ...existing, stale: true };   // ← same problem
  throw new Error("No tool call returned");
}
```

When the AI gateway either errors OR returns a response without a `tool_calls` block, the function returns the **old row** with `stale: true` — **without bumping `updated_at` / `expires_at`**. That's why every retry succeeds (200) yet the decision never refreshes. The model `google/gemini-3-flash-preview` likely isn't returning tool calls reliably for this prompt, so we're stuck in this branch.

## Fix

### 1. `supabase/functions/aion-brain/index.ts` — never return silently-stale
- Switch model to `google/gemini-2.5-flash-lite` (proven tool-calling on the free tier and what the rest of the orchestrator already uses).
- When the gateway fails OR returns no `tool_calls`, do NOT return the old row. Instead **compute a deterministic heuristic decision** from `signals` + hour-of-day + previous mode and **upsert it** so `expires_at` advances. This guarantees the heartbeat always produces a fresh row.
- Log the failure shape (`aiResp.status`, first 300 chars of body, or `aiJson.choices?.[0]?.message`) so we can see why tool-calling missed.
- Drop the `60_000`ms debounce to `20_000`ms so route_change → composer_focus bursts within a minute can still get a fresh decision after the first one settles.
- Add a `source` field to the row payload (`'llm' | 'heuristic'`) so diagnostics can show which path produced the current decision.

### 2. `BrainSection.tsx` — surface the new `source` field
- Show a chip: `source: llm` (emerald) or `source: heuristic` (amber). This makes it obvious when the brain is running on its own fallback heuristic vs the LLM.

### 3. Schema — add `source` column to `aion_decisions`
Migration to add a nullable `source TEXT` column, default null. Backfill not needed.

### 4. Re-validate after fix
Once deployed, the next `route_change` (or my 60s auto-refresh) should produce a row with `updated_at = now()` and `expires_at = now() + 10min`. I'll then have you send "היי" and a reflection and report:
- response source header (`live`)
- mode downgrade (`lite` for greeting)
- memory-writer event in the panel
- graph counter delta
- leak-guard status
- new `aion-brain run` event with `ok` status and duration

## Out of scope

- No visual graph, room UI, or homepage redesign (per your standing instruction).
- Not changing `aion-orchestrator`, `memory-writer`, or chat sanitizer — they're verified working.
- No new tables; just one column on `aion_decisions`.

## Why this is the right fix

The orchestration loop you asked for IS wired end-to-end. Client heartbeat fires, edge function is reached, signals flow, downstream services emit. The single broken link is the brain choosing to discard its own output silently. Removing that silent path makes the loop actually breathe.
