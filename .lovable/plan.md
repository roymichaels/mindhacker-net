## Problem

AION is streaming raw chain-of-thought instead of a reply. The leaked text shows it analyzing the system prompt out loud:
"This is confirmed multiple times in the conversation history by Aurora herself.", "According to the guidelines:", "I need to check what tasks/habits the user has for today", "Looking at the user's profile…".

## Root cause

`supabase/functions/aurora-chat/index.ts` routes every tier (free/plus/apex) to `nvidia/nemotron-3-super-120b-a12b:free` via OpenRouter. Nemotron is a reasoning model that, on the OpenRouter free endpoint, streams its reasoning as **plain `delta.content` text** (not wrapped in `<think>` tags and not in a separate `reasoning` field). Our existing sanitizer in `supabase/functions/_shared/sanitizeStream.ts` only catches:
- `<think>/<reasoning>/<analysis>/<internal>/<scratchpad>` tag blocks
- `[reasoning]/[plan]/...` meta lines
- A short list of English/Hebrew preamble phrases, and only **before** the first "real" token

So Nemotron's untagged reasoning slips through, and once `emittedReal` flips true, every subsequent meta sentence is forwarded verbatim.

The `reasoning: { exclude: true }` flag in the request body is ignored by Nemotron-free; that toggle only works for providers that emit reasoning in a dedicated channel.

## Fix

Two complementary changes, both server-side, in the existing edge function — no client changes.

### 1. Stop defaulting to a leaky reasoning model

In `supabase/functions/aurora-chat/index.ts` replace the Nemotron default with a non-reasoning chat model that has been stable for AION:

```
const TIER_MODELS = {
  free: "google/gemini-2.5-flash-lite",
  plus: "google/gemini-2.5-flash",
  apex: "google/gemini-2.5-pro",
};
```

(Vision path already forces `google/gemini-2.5-flash`, leave it.)

This alone removes the leak source for new sessions.

### 2. Harden the sanitizer as defense-in-depth

In `supabase/functions/_shared/sanitizeStream.ts`:

- Expand `PREAMBLE_PATTERNS` to also catch the phrases observed in the screenshot, e.g.
  - `/\bthis is confirmed (multiple times )?in the conversation\b/i`
  - `/\bthe user'?s most recent message\b/i`
  - `/\baccording to the guidelines\b/i`
  - `/\bi need to check what (tasks|habits)\b/i`
  - `/\blooking at the user'?s profile\b/i`
  - `/\bgiven that:?$/i`
  - `/\bactually,?\s+looking (more carefully )?at\b/i`
- Add a "meta block" mode: if a sanitized line matches any preamble pattern **anywhere** in the stream (not just before `emittedReal`), drop the line and the next blank-separated continuation lines until we hit a line that starts with a Hebrew word, an emoji, or a short greeting (≤80 chars) — i.e., assume the model has finally entered the user-facing answer.
- Drop standalone bulleted analysis lines that start with `- ` or `* ` and contain `(0/0)`, English colonized headers like `According to the guidelines:`, or template fragments like `For morning (06:00-12:00):`.
- Keep the existing `<think>` and `[reasoning]` handling unchanged.

### 3. Verification

- Redeploy `aurora-chat` (auto on edit).
- Trigger a fresh "היי" in `/aurora`; confirm response is a short Hebrew greeting, no English meta narration.
- Tail `supabase--edge_function_logs aurora-chat` for `[aurora-chat] sanitizer dropped N chars` to confirm the sanitizer is active even on the new model (should normally be 0).

## Out of scope

- No prompt changes in `orchestrator.ts` / `contextBuilder.ts`.
- No UI changes in `AuroraChatBubbles` / `InteractiveAION`.
- Nemotron stays mapped in `aiGateway.ts` for any caller that explicitly opts in; we just stop defaulting to it.
