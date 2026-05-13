## What's actually broken

The screenshot shows AION repeating `אני מחובר, אבל הייתה תקלה בחשיבה שלי. נסה שוב רגע.` for every message. That string is the **client-side fallback** in `src/hooks/aurora/useAuroraChat.tsx:16`, only shown when the `fetch` to `aurora-chat` throws.

Edge logs confirm it: in the last hour `aurora-chat` received only `OPTIONS` preflights, **zero `POST`s**. The browser is blocking the actual request.

### Root cause

Phase 1 (turn tracing) added two custom request headers from the client:

```ts
// src/hooks/aurora/useAuroraChat.tsx
'X-Aion-Trace-Id': tracer.id,
'X-Aion-Route':    window.location.pathname,
```

But the edge functions' CORS preflight responses do **not** list those header names in `Access-Control-Allow-Headers`. The browser therefore fails the preflight and never sends the POST. Same problem affects every flag-gated capability call, which is why "delete strategy" / "create strategy" do nothing now.

Affected functions:
- `supabase/functions/aurora-chat/index.ts` (line 44) — main chat pipe
- `supabase/functions/aion-capabilities/index.ts` (line 21) — capability invocations
- `supabase/functions/memory-writer/index.ts` (line 32) — graph writes piggy-backed on the chat turn
- `supabase/functions/aion-brain/index.ts` (line 8) — diagnostics turn refresh
- `supabase/functions/_shared/cors.ts` (line 10) — shared default used by other functions

## Fix (Phase 1 hot-fix, no behavioural changes)

Add `x-aion-trace-id, x-aion-route` to the `Access-Control-Allow-Headers` value in each of the five files above. That's the entire change — no logic, no UI, no orchestration changes.

After edit, redeploy `aurora-chat`, `aion-capabilities`, `memory-writer`, `aion-brain` (the shared `cors.ts` is bundled into anything importing it and will redeploy with its consumers).

## Verification

1. Open the preview, send `מה קורה?` — expect a fresh streamed reply, not the canned fallback.
2. Check `function_edge_logs` for `aurora-chat`: a `POST … 200` row should appear.
3. With `AION_CAPS=1` set on the backend, send `תמחק לי את התוכנית` — the deterministic confirm artifact should appear (Phase 3 already wired) and tapping `Delete` should invoke `plan.delete` via `aion-capabilities` (`POST … 200` in its logs).
4. Open Diagnostics → AION Trace panel and confirm a new turn trace appears with `intent`, `router`, `capability`, `stream.start`/`stream.end` events.

## Out of scope

- No new capabilities, no new artifacts, no UI redesign.
- The repeating-reply look in the screenshot is a side-effect of the same fallback; it'll disappear once real streaming returns.
- The `<<AION_ARTIFACT>>` rendering pipeline and `plan.restart` confirmation flow are already in place from Phase 3 — once CORS is fixed they start working as designed.
