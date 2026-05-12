# AI-Native Orchestration: Many Small Calls, Not One Big Chat

Strategic architecture using **OpenRouter Nemotron 3 Super (free)** as the workhorse for lightweight orchestration calls everywhere — turning AION from a chatbot into the operating layer of MindOS.

## Principle

```
user action → signal → AION interprets → app adapts
```

Every interaction emits a tiny signal. A handful of cheap, specialized AI micro-calls interpret each signal and steer the UI / data / next-action — instead of one giant streaming chat doing everything.

## Architecture: AI Micro-Service Layer

```
                    ┌────────────────────────────────┐
                    │   aion-orchestrator (router)   │   single edge fn
                    │   POST { kind, payload }       │   verifies JWT
                    └────────────┬───────────────────┘
                                 │ dispatches by kind
        ┌──────────┬──────────┬──┴──────┬─────────────┬──────────────┐
        ▼          ▼          ▼         ▼             ▼              ▼
   intent     emotion    journal     mode         artifact       memory
   classify   detect     extract    select        generate       update
        \         \          \         |            /              /
         \         \          \        |           /              /
          └─────────┴──────────┴──────┬┴──────────┴──────────────┘
                                      │
                          aiCall(prompt, schema)
                          → OpenRouter Nemotron-3-Super-Free
                          → strict JSON via tool-calling
                          → 800-token cap, 8s timeout
```

Each "skill" is a pure function with: input shape → tool-call schema → typed output. No streaming, no markdown — just structured JSON the app consumes.

## The 7 Core Skills (each ~50 lines)

| Skill | Input | Output | Triggered by |
|---|---|---|---|
| `intent.classify` | last user msg + recent route | `{ intent: "journal" \| "plan" \| "vent" \| "execute" \| "reflect" \| "ask", confidence }` | composer submit, intent bar |
| `emotion.detect` | last 1-3 user msgs | `{ tone, valence -1..1, arousal 0..1, signals[] }` | every user msg |
| `journal.extract` | recent chat window | `{ shouldSave: bool, entry?: { title, body, pillar, tags[] } }` | every 4 user msgs / on intent=reflect |
| `mode.select` | recent signals + current mode | `{ next_mode: "focus"\|"recovery"\|"overwhelmed"\|"dominate"\|"calm"\|"normal", reason }` | aion-brain cron + after emotion.detect |
| `artifact.generate` | intent + context | `{ kind: "card"\|"plan"\|"hypnosis"\|"protocol", payload }` | intent=plan/execute |
| `memory.update` | new fact + existing memory hash | `{ patch: { add[], remove[], reinforce[] } }` | journal.extract success, milestone events |
| `next.action` | open action_items + decision + tone | `{ suggestion: { id?, title, why, urgency } }` | route_change to /play, idle 5min |

All seven share the same tool-calling skeleton; only the system prompt + output schema differ.

## Files

### Backend (new)
- `supabase/functions/_shared/aiSkill.ts` — generic tool-calling helper:
  ```ts
  callSkill<T>({ system, user, schema, model?, maxTokens?, timeoutMs? }): Promise<T>
  ```
  Defaults: `model="nvidia/nemotron-3-super-120b-a12b:free"`, `maxTokens=800`, `timeoutMs=8000`. Forces `tool_choice` so the response is always typed JSON. Logs duration + token count.
- `supabase/functions/_shared/skillRegistry.ts` — exports each skill's prompt + schema as `SKILLS.intentClassify`, `SKILLS.emotionDetect`, etc.
- `supabase/functions/aion-orchestrator/index.ts` — single dispatch endpoint:
  ```
  POST /aion-orchestrator { kind: "intent.classify" | ..., payload }
  → { ok: true, result: T } | { ok: false, error }
  ```
  CORS, JWT validated, per-user rate limit (20/min), writes the result + duration into `aion_signals` so the brain sees it.
- `supabase/functions/aion-brain/index.ts` (extend) — when composing the live `aion_decisions` row, pull the 5 most recent skill outputs from `aion_signals` to feed `mode.select` and `next.action`.

### Database (migration)
Extend existing `aion_signals` table — no new tables:
- New signal `kind` values: `intent.classified`, `emotion.detected`, `journal.extracted`, `mode.selected`, `memory.updated`, `next.action`.
- `payload jsonb` already there — store the typed result. Index on `(user_id, kind, created_at desc)` for fast last-N lookups.

### Client (new + light edits)
- `src/services/aionSkills.ts` — typed wrappers:
  ```ts
  classifyIntent(text), detectEmotion(text), extractJournal(window),
  selectMode(), generateArtifact(intent, ctx), updateMemory(fact), nextAction()
  ```
  Each: `supabase.functions.invoke('aion-orchestrator', { body: { kind, payload } })`. Fire-and-forget by default (`void`) — app keeps moving.
- `src/hooks/aion/useAionSkills.ts` — debounce + dedupe queue so the same payload isn't re-classified within 30s.
- Wire 4 call-sites (no UI changes yet, just signal emission):
  1. `useAuroraChat.sendMessage` after the user message saves → fire `intent.classify` + `emotion.detect` (parallel, non-blocking).
  2. After every 4th AI reply → fire `journal.extract`.
  3. `AionDecisionContext` realtime handler → on `mode.selected` change, expose `decision.mode` for future UI subscribers.
  4. Idle hook (`useIdle(5min)`) on `/play` → fire `next.action`.

## Performance & Cost Discipline

- **One model, one path**: Nemotron-3-Super-free for all 7 skills. Vision stays on Gemini in `aurora-chat` only.
- **Token caps**: 800 max tokens per skill, 4-8 message context window — never the full conversation.
- **Concurrency**: orchestrator runs skills in parallel when triggered together; client debounces (30s) and dedupes.
- **Failure isolation**: each skill is best-effort. A failed `journal.extract` never blocks `intent.classify` and never blocks the chat reply (already enforced after the previous fix).
- **Observability**: every skill call writes `{ kind, duration_ms, ok, model }` to `aion_signals` so we can see which skill is slow/failing in `read_query`.

## What This Slice Does NOT Build

- **No new UI yet** — this is the engine. UI subscribers (intent bar, adaptive density, mode-driven theming) come in the next slices and will read from `aion_decisions` + `aion_signals`.
- **No journaling write yet** — `journal.extract` returns the candidate; persisting to `journal_entries` is the next slice with a confirm step.
- **No model switching** — single workhorse; we'll evaluate per-skill upgrades once we have duration/quality data in `aion_signals`.
- **No replacement of existing edge functions** (`aurora-analyze`, `aurora-capture-journal`, etc.) — those keep working. The new orchestrator is additive; later slices migrate the right pieces in.

## Verification After Build

1. From the chat, send one message → `read_query` `aion_signals` shows two new rows (`intent.classified`, `emotion.detected`) within ~2s.
2. `edge_function_logs aion-orchestrator` shows `kind=intent.classify duration_ms=…` lines.
3. Hit the orchestrator with an unauthenticated request → 401.
4. Force a Nemotron timeout (set TIMEOUT=100ms locally) → orchestrator returns `{ ok:false }` and the chat still works.

## Tradeoffs

- **Why a single dispatcher edge fn instead of 7 separate functions?** One deploy surface, one auth path, one rate-limit ledger, easier to compare durations across skills.
- **Why Nemotron free for everything?** Per the user's brief: cheap enough to lean in heavily. We can promote a specific skill (e.g. `artifact.generate`) to a stronger model later without touching call sites — only `skillRegistry.ts` changes.
- **Why JSON tool-calls instead of raw text?** Deterministic shape = the app can consume the result without parsing tricks; failures are loud, not silent.
