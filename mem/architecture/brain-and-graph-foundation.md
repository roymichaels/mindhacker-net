---
name: Brain + Graph Foundation (Phase A+B)
description: AionDecisionProvider lifted to App root. EnvironmentProvider always-on and decision-bound. memory-writer edge silently grows aurora_memory_graph from chat/journal/hypnosis/mission.
type: architecture
---
- `AionDecisionProvider` is mounted at App root (above `EnvironmentProvider`); never re-mount inside `ProtectedAppShell`. PresenceShell at `/` reads live decisions.
- `EnvironmentProvider` has NO localStorage flag. It is always active. When a non-expired `aion_decisions` row exists (and no manual `setUserMode` override), its `mode/tone/density/focus_target/suggestion` override fast-tier rules. Fast-tier remains the cold-start fallback.
- `EnvironmentState.aionDecision` carries the raw brain output for consumers that want verbatim values.
- Sanitizer coverage: `aurora-chat`, `work-chat`, `onboarding-chat`, `plan-chat` all stream through `_shared/sanitizeStream`. `negotiate-plan` sanitizes its JSON `reason`/`suggestion` via `sanitizeFinalText`. The aurora-chat-local `sanitizeStream.ts` is just a re-export shim.
- `supabase/functions/memory-writer` is the silent graph-writer. Pipeline: emotion.detect → intent.classify (chat) → journal.extract → graph.proposal (typed) → `_shared/graphUpsert` (lower-cased dedupe). Recurring `pattern` nodes (≥3 refs) mirror to `aurora_behavioral_patterns`; identity-tagged nodes mirror to `aurora_identity_elements`.
- Auth: caller's JWT only — RLS enforces ownership, no service role.
- Invoked fire-and-forget from `useAuroraChat` after each assistant reply. Journal/hypnosis/mission completion sites should follow the same pattern (`supabase.functions.invoke('memory-writer', { body: { source, context } })`).
- DO NOT build the graph viewer yet. Phase B's only goal is data flowing.
