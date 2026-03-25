# API Contracts

Last updated: 2026-03-25

## Conventions

- Supabase edge function base: `/functions/v1/<name>`
- Vercel agent base: `/api/<name>`
- Most edge functions support `OPTIONS` for CORS and `POST` for the real action
- `verify_jwt` in [supabase/config.toml](c:\Users\roymichaels\Desktop\mindhacker-net\supabase\config.toml) is not the whole auth story; some functions still validate bearer tokens manually

## Current Vercel Agent Contracts

### `/api/aurora-chat`

- Method: `POST`
- Auth: bearer token or session-derived fallback, depending on caller
- Body:
  - `messages`
  - `language`
  - `conversationId`
  - `userId`
  - `sessionKey`
  - optional context fields
- Response: SSE stream compatible with OpenAI-style `data: { choices: [...] }`
- Streaming: yes

### `/api/domain-assess`

- Method: `POST`
- Auth: bearer token or publishable fallback as currently called by the client
- Body:
  - `messages`
  - `language`
  - `domainId`
  - `conversationId`
  - `userId`
  - `sessionKey`
- Response: SSE stream with text deltas and tool-call-compatible payloads
- Streaming: yes

## Supabase Edge Function Catalog

Legend:

- Auth = `public`, `jwt`, `manual`, or `admin`
- Stream = `yes` for SSE passthrough

### Conversational / AI

| Function | Auth | Stream | Purpose / contract summary |
|---|---|---:|---|
| `aurora-chat` | public + manual token handling | yes | Main Aurora chat; body includes messages/context/language; SSE passthrough from AI gateway |
| `domain-assess` | public/manual | yes | Domain assessment conversation; tool-call extraction for structured scores |
| `plan-chat` | public/manual | yes | Planning chat for strategy / negotiation |
| `work-chat` | public/manual | yes | Work-planning chat using work sessions and tasks |
| `onboarding-chat` | public/manual | no | Onboarding conversational helper |
| `consciousness-assess` | public/manual | no | Consciousness-focused assessment |
| `aurora-analyze` | public/manual | no | Legacy analysis endpoint for pillar or user context |
| `aurora-proactive` | public/admin-style service access | no | Generates, lists, acknowledges proactive AI items |
| `aurora-recalibrate` | public/service | no | Recalculates pulse / calibration state for a user |
| `aurora-generate-title` | public/manual | no | Generates titles for conversations/content |
| `aurora-summarize-conversation` | public/manual | no | Summarizes existing conversations |
| `suggest-practices` | manual | no | Returns suggested user practices using DB context and tool call |
| `add-plate-item` | public | yes | Conversational item creation wizard, streams and tool-calls `create_plate_item` |
| `career-wizard` | manual | no | AI career path helper with structured output |

### Planning / generation

| Function | Auth | Stream | Purpose / contract summary |
|---|---|---:|---|
| `generate-100day-strategy` | public/manual | no | Builds long-form strategic plan |
| `generate-daily-actions` | public/manual | no | Generates daily actions from plan/context |
| `generate-phase-actions` | public/manual | no | Generates actions for a specific phase |
| `generate-today-queue` | public/manual | no | Builds today queue from existing plan/tasks |
| `generate-tactical-schedule` | public/manual | no | Creates a tactical schedule |
| `generate-execution-steps` | public/manual | no | Breaks goals down into executable steps |
| `generate-milestone-journey` | public/manual | no | Creates a milestone journey object |
| `generate-pillar-synthesis` | public/manual | no | Cross-pillar synthesis output |
| `generate-transformation-report` | public/manual | no | Long-form transformation report |
| `analyze-life-plan` | public/manual | no | Reviews or analyzes a user life plan |
| `analyze-introspection-form` | public/manual | no | Turns introspection form data into analysis |
| `generate-launchpad-summary` | jwt | no | Summarizes launchpad data for the authenticated user |
| `generate-identity-archetype` | public | no | Generates identity/archetype framing |
| `generate-orb-narrative` | public/manual | no | Generates orb narrative copy |
| `generate-business-plan` | public | no | AI-generated business plan |
| `generate-branding-suggestions` | public | no | Brand/name/positioning ideas |
| `generate-coach-plan` | public | no | Coach offering/business plan output |
| `generate-curriculum` | public | no | Course/curriculum generation |
| `generate-landing-page` | public | no | Landing page generation |
| `generate-blog-article` | public | no | Blog article generation |
| `daily-blog-generator` | public/service | no | Scheduled or triggered blog generation pipeline |
| `generate-ai-stories` | public | no | AI story generation for community or content |
| `generate-hypnosis-script` | jwt | no | Hypnosis script generation |

### Voice / media

| Function | Auth | Stream | Purpose / contract summary |
|---|---|---:|---|
| `elevenlabs-transcribe` | public | no | Speech-to-text |
| `elevenlabs-tts` | public | no | Text-to-speech |
| `cache-hypnosis-audio` | public/manual | no | Stores or retrieves cached hypnosis audio |
| `get-audio-by-token` | public | no | Public tokenized audio fetch |
| `get-video-by-token` | public | no | Public tokenized video fetch |
| `ai-hypnosis` | jwt | no | Suggest/personalize/analyze hypnosis content |
| `analyze-presence` | public/manual | no | Presence analysis, likely media-assisted |

### Commerce / subscriptions

| Function | Auth | Stream | Purpose / contract summary |
|---|---|---:|---|
| `create-checkout-session` | public | no | Starts Stripe checkout |
| `create-coach-checkout` | public | no | Coach-specific checkout |
| `customer-portal` | public | no | Opens Stripe customer portal |
| `stripe-webhook` | public webhook | no | Stripe event ingestion |
| `check-subscription` | manual | no | Returns `{ subscribed, tier }` for current user |
| `check-coach-subscription` | manual | no | Coach subscription status |
| `fm-approve-claim` | admin/manual | no | FM claim approval |
| `send-order-confirmation` | public/service | no | Sends order confirmation email |
| `send-order-notification` | public/service | no | Sends internal order notification |

### Notifications / email / ops

| Function | Auth | Stream | Purpose / contract summary |
|---|---|---:|---|
| `push-notifications` | public/manual | no | Subscribe, send, or manage push notifications |
| `process-email-queue` | jwt | no | Processes queued outbound emails |
| `send-welcome-email` | public/service | no | Welcome email |
| `send-newsletter` | public/service | no | Newsletter delivery |
| `daily-priority-rebalance` | public/service | no | Rebalances daily priorities |

### Auth / user / web3

| Function | Auth | Stream | Purpose / contract summary |
|---|---|---:|---|
| `web3auth-exchange` | public | no | `config` or `exchange` action; returns Web3Auth config or Supabase OTP/session bootstrap info |
| `web3-wallet` | manual/jwt | no | Wallet `status`, `create`, or `mint` actions |
| `get-user-data` | jwt | no | Authenticated user data fetch |
| `admin-refresh-users` | admin/manual | no | Admin maintenance on users/orbs/plans |
| `admin-grant-purchase` | admin/jwt | no | Admin grants sessions/content/subscriptions |

### Marketplace / social / misc AI

| Function | Auth | Stream | Purpose / contract summary |
|---|---|---:|---|
| `ai-match` | public/manual | no | AI-assisted matching |
| `negotiate-plan` | public/manual | no | Plan negotiation |
| `course-orchestrator` | public/manual | no | Course flow orchestration |
| `add-plate-item` | public | yes | Plate item creation via AI questioning |

## Additional Existing Functions

The repo also contains these edge functions and supporting operational endpoints. Their contracts are smaller or more action-specific, but they still belong to the runtime surface:

- `admin-refresh-users`
- `analyze-presence`
- `daily-priority-rebalance`
- `fm-approve-claim`
- `generate-business-plan`
- `generate-branding-suggestions`
- `generate-coach-plan`
- `generate-curriculum`
- `get-user-data`
- `negotiate-plan`
- `process-email-queue`
- `send-newsletter`

## Complete Function Inventory

Complete directory inventory from `supabase/functions` excluding `_shared`:

- `add-plate-item`
- `admin-grant-purchase`
- `admin-refresh-users`
- `ai-hypnosis`
- `ai-match`
- `analyze-introspection-form`
- `analyze-life-plan`
- `analyze-presence`
- `aurora-analyze`
- `aurora-chat`
- `aurora-generate-title`
- `aurora-proactive`
- `aurora-recalibrate`
- `aurora-summarize-conversation`
- `cache-hypnosis-audio`
- `career-wizard`
- `check-coach-subscription`
- `check-subscription`
- `consciousness-assess`
- `course-orchestrator`
- `create-checkout-session`
- `create-coach-checkout`
- `customer-portal`
- `daily-blog-generator`
- `daily-priority-rebalance`
- `domain-assess`
- `elevenlabs-transcribe`
- `elevenlabs-tts`
- `fm-approve-claim`
- `generate-100day-strategy`
- `generate-ai-stories`
- `generate-blog-article`
- `generate-branding-suggestions`
- `generate-business-plan`
- `generate-coach-plan`
- `generate-curriculum`
- `generate-daily-actions`
- `generate-execution-steps`
- `generate-hypnosis-script`
- `generate-identity-archetype`
- `generate-landing-page`
- `generate-launchpad-summary`
- `generate-milestone-journey`
- `generate-orb-narrative`
- `generate-phase-actions`
- `generate-pillar-synthesis`
- `generate-tactical-schedule`
- `generate-today-queue`
- `generate-transformation-report`
- `get-audio-by-token`
- `get-user-data`
- `get-video-by-token`
- `negotiate-plan`
- `onboarding-chat`
- `plan-chat`
- `process-email-queue`
- `push-notifications`
- `send-newsletter`
- `send-order-confirmation`
- `send-order-notification`
- `send-welcome-email`
- `stripe-webhook`
- `suggest-practices`
- `web3-wallet`
- `web3auth-exchange`
- `work-chat`

## OpenClaw Tooling Requirements

For agent parity, the replacement runtime needs these tools:

- `supabase_query`
  - read user profile, plans, conversations, action items, assessments, community and work data
- `extract_domain_profile`
  - produce structured domain assessment payloads from conversational evidence
- `memory_upsert` or equivalent
  - optional next step for long-term Aurora context parity
- `action_item_create`
  - eventual parity for in-chat execution actions
- `conversation_title_generate`
  - optional convenience tool, currently separate in legacy edge setup

## Frequently Accessed Tables

Most visible in current chat, identity, and planning flows:

- `profiles`
- `user_roles`
- `conversations`
- `messages`
- `launchpad_progress`
- `life_plans`
- `life_plan_milestones`
- `action_items`
- `daily_message_counts`
- `journal_entries`
- `orb_profiles`
- `user_skill_progress`
- domain assessment and pillar result tables
- `work_sessions`
- `work_scores`
- `visitor_sessions`
- `user_subscriptions`

## Authentication Notes

- Client-side chat callers often send `Authorization: Bearer <session token>`
- some callers still fall back to publishable keys when no session exists
- `verify_jwt = false` does not mean unauthenticated business logic is safe; several functions still do their own token validation
- admin functions usually:
  - validate current user from bearer token
  - then query `public.user_roles` for `admin`

## Parity Risk Areas

Highest parity risk during agent migration:

- SSE format compatibility
- tool-call shape for domain extraction
- session continuity via `sessionKey`
- Hebrew prompt behavior
- auth fallback behavior
- message persistence timing
