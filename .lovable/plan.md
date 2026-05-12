# Switch AI Engine to OpenRouter (AION Brain First)

## Approach
Introduce a shared backend helper that routes AI calls to **OpenRouter** when `OPENROUTER_API_KEY` is configured, with the existing Lovable AI Gateway as a fallback. Migrate the **AION Brain** (`aurora-chat`) first so the user-facing chat is fast immediately; the remaining 40 edge functions automatically benefit later as they adopt the helper (no need to touch all 41 in one pass).

## What you provide
One secret: **`OPENROUTER_API_KEY`** — get it from https://openrouter.ai/keys (account → Keys → Create Key). I'll request it via the secrets prompt after you approve this plan.

## Changes

### 1. New shared helper — `supabase/functions/_shared/aiGateway.ts`
- Single `chatCompletion({ model, messages, stream, tools, ... })` function.
- If `OPENROUTER_API_KEY` is set → POST `https://openrouter.ai/api/v1/chat/completions` with `Authorization: Bearer …`, `HTTP-Referer`, and `X-Title` headers.
- Else → fall back to existing `https://ai.gateway.lovable.dev/v1/chat/completions` with `LOVABLE_API_KEY`.
- Model alias map so existing call-sites keep working:
  - `google/gemini-3-flash-preview` → `google/gemini-2.5-flash`
  - `google/gemini-2.5-flash` / `-flash-lite` → kept as-is (OpenRouter supports them)
  - `openai/gpt-5*` → `openai/gpt-4o` family equivalents
- Forwards SSE stream bodies untouched, surfaces `429` / `402` cleanly.

### 2. Update AION Brain — `supabase/functions/aurora-chat/index.ts`
- Replace direct `fetch` to Lovable gateway with the new helper.
- Default model for AION: **`google/gemini-2.5-flash`** (fast + cheap, suits chat). Reasoning/tool calls stay on whichever model the route already requests.
- Keep streaming, CORS, error handling, and JWT validation unchanged.

### 3. (Out of scope, follow-up) Other functions
The other 40 functions keep running on Lovable AI until each is migrated to the helper in subsequent passes — zero behavior change for them today.

## Verification
After secret is added: open AION chat in the preview, send a message, confirm tokens stream in noticeably faster and edge-function logs show `openrouter.ai` as the upstream.
