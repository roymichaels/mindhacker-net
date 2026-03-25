# OpenClaw Migration Plan

Last updated: 2026-03-25

## Status

The repo already contains a practical first cut of the migration:

- `api/aurora-chat.ts`
- `api/domain-assess.ts`
- `api/_lib/agent-runtime.ts`
- `src/lib/openclaw.ts`
- `src/lib/tools/supabaseQuery.ts`
- `src/lib/tools/extractDomainProfile.ts`
- `openclaw-workspace/agents/*.yaml`

This means the migration is not theoretical anymore. The remaining work is standardization, parity hardening, and legacy removal.

## Replace First

Priority order:

1. `aurora-chat`
2. `domain-assess`
3. `plan-chat`
4. `work-chat`
5. `onboarding-chat`
6. `aurora-proactive`

Why this order:

- highest user-facing value
- strongest streaming requirement
- strongest reuse of shared tools and memory/session model

## Target Agent Structure

Recommended workspace:

```text
openclaw-workspace/
  agents/
    aurora-chat.yaml
    domain-assess.yaml
    plan-chat.yaml
    work-chat.yaml
  prompts/
  tools/
```

Recommended runtime split:

- server runtime in `api/_lib`
- agent definitions in `openclaw-workspace/agents`
- tool wrappers in `src/lib/tools`
- thin route handlers in `api/*.ts`

## Required Tools

### `supabase_query`

Purpose:

- fetch user profile
- fetch plans, milestones, action items
- fetch recent messages and conversations
- fetch work sessions and scores
- fetch launchpad data and identity context
- fetch domain results

Requirements:

- enforce an allowlist of tables and views
- parameterize queries
- log query intent, not raw secrets

### `extract_domain_profile`

Purpose:

- transform assessment conversation into structured scoring payload
- maintain domain-specific question/subsystem logic
- preserve current result shape expected by `useDomainAssessment`

Requirements:

- return scores, confidence, findings, mirror statement, next step
- keep domain-specific metrics for save compatibility

### Recommended next tools

- `save_message`
- `upsert_memory`
- `create_action_item`
- `generate_title`
- `list_recent_notifications`

## Migration Steps

### Phase 1: Parallel path

1. keep edge functions live
2. add Vercel or server runtime equivalent
3. match request/response contracts exactly
4. route selected frontend callers to new endpoints

### Phase 2: Parity verification

1. compare streamed chunk format
2. compare tool call payloads
3. compare save success rates
4. compare response latency
5. verify Hebrew and English prompts

### Phase 3: Controlled cutover

1. route all production clients to new endpoints
2. keep edge functions as emergency fallback for one release window
3. log failures with route-level tagging
4. remove stale UI assumptions about edge-function URLs

### Phase 4: Legacy cleanup

1. delete or archive unused edge functions
2. remove Lovable AI gateway dependencies from remaining agentic paths
3. centralize prompts and tool schemas
4. update docs and runbooks

## Keep / Cut Guidance

Keep for now:

- billing functions
- webhook handlers
- email queue processors
- tokenized media delivery
- web3 exchange until auth flow is refactored holistically

Cut over early:

- conversational streaming AI
- domain assessments
- plan/work conversational guidance

## Monitoring Plan

Track these side by side during migration:

- request count by endpoint
- SSE open rate
- SSE completion rate
- tool-call parse success
- message persistence success
- assessment save success
- median and p95 latency
- fallback usage rate
- auth failures by client route

Recommended log tags:

- `agent_name`
- `session_key`
- `user_id`
- `route_source`
- `language`
- `fallback_used`
- `tool_invocations`

## Parity Checklist

- same request body fields
- same SSE framing
- same tool-call JSON schema
- same results persistence
- same session continuity behavior
- same free/pro gating behavior
- same Hebrew / English quality floor
- graceful error fallback to user-visible message

## Risks

1. Many old edge functions assume Lovable model semantics
2. Some UI code still assumes Supabase function URLs or old route names
3. Auth fallback behavior is inconsistent across clients
4. Structured outputs vary by domain and are easy to regress silently

## Recommendation

Treat OpenClaw migration as an application platform migration, not a simple model swap. The real unit of work is:

- prompts
- tools
- session model
- persistence contract
- streaming contract

That is the layer users actually feel.
