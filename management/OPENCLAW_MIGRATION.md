# OpenClaw Migration

Last updated: 2026-03-25

## Current State

OpenClaw migration has already started.

Live runtime pieces:

- [api/aurora-chat.ts](c:\Users\roymichaels\Desktop\mindhacker-net\api\aurora-chat.ts)
- [api/domain-assess.ts](c:\Users\roymichaels\Desktop\mindhacker-net\api\domain-assess.ts)
- [api/_lib/agent-runtime.ts](c:\Users\roymichaels\Desktop\mindhacker-net\api\_lib\agent-runtime.ts)
- [src/lib/openclaw.ts](c:\Users\roymichaels\Desktop\mindhacker-net\src\lib\openclaw.ts)
- [src/lib/tools/supabaseQuery.ts](c:\Users\roymichaels\Desktop\mindhacker-net\src\lib\tools\supabaseQuery.ts)
- [src/lib/tools/extractDomainProfile.ts](c:\Users\roymichaels\Desktop\mindhacker-net\src\lib\tools\extractDomainProfile.ts)

Backend alignment layer:

- [backend/openclaw/agents](c:\Users\roymichaels\Desktop\mindhacker-net\backend\openclaw\agents)
- [backend/openclaw/tools](c:\Users\roymichaels\Desktop\mindhacker-net\backend\openclaw\tools)
- [backend/openclaw/workspace](c:\Users\roymichaels\Desktop\mindhacker-net\backend\openclaw\workspace)

## Goal

Move from "Vercel runtime with OpenClaw-style configs" to "clear MindOS backend boundary powered by OpenClaw tooling."

## Replace First

Priority order:

1. `aurora-chat`
2. `domain-assess`
3. `plan-chat`
4. `work-chat`
5. `aurora-proactive`
6. remaining conversational generation assistants

## Target Runtime Shape

```text
Frontend
  -> Vercel /api proxy or backend service endpoint
    -> OpenClaw runtime
      -> agent configs
      -> tools
      -> memory/session
      -> OpenRouter
      -> Supabase
```

## Agent Definitions

Canonical backend location:

- `backend/openclaw/agents/aurora-chat.yaml`
- `backend/openclaw/agents/domain-assess.yaml`

Current loader behavior:

- prefer `backend/openclaw/agents`
- fall back to legacy `openclaw-workspace/agents`

This is intentional so migration can proceed without breaking runtime during the transition window.

## Required Tools

### `supabase_query`

Required for:

- user profile and subscription context
- plans, action items, milestones
- recent messages/conversations
- assessment context and results

### `extract_domain_profile`

Required for:

- structured assessment output
- current frontend save contract compatibility
- preserving subsystem scoring and result shapes

### Recommended next tools

- `save_message`
- `upsert_memory`
- `create_action_item`
- `generate_title`
- `list_notifications`

## Migration Phases

### Phase 1: hybrid stability

- keep legacy edge functions live
- run new `/api/*` endpoints in production
- preserve SSE shape and sessionKey behavior

### Phase 2: backend normalization

- move canonical prompts/configs under `backend/openclaw`
- move tool ownership to backend contracts
- add clearer telemetry and agent run logging

### Phase 3: parity hardening

- compare latency
- compare SSE completion rate
- compare assessment save success
- compare Hebrew/English quality
- compare auth failure patterns

### Phase 4: controlled cutover

- move callers one surface at a time
- keep emergency fallback window
- only then archive stale edge functions

## Monitoring

Track:

- request volume by endpoint
- SSE open/completion rate
- fallback usage
- tool invocation success
- auth failures
- assessment persistence success
- latency p50/p95

## Important Constraint

This is not only a model migration. It is a migration of:

- prompts
- tools
- contracts
- persistence
- session continuity
- streaming behavior
