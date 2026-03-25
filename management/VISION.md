# Evolve Vision

Last updated: 2026-03-25

## Core Framing

- `Evolve` is the platform
- `MindOS` is the AI processing and coaching layer inside Evolve
- `AION` is the visual presence layer for MindOS
- `MindOS` is the single conversational and reasoning brain

The product goal is not "chat with an AI." The goal is to turn identity, assessment, memory, and execution into one continuous operating system for growth.

## Who We Serve

Primary users:

- ambitious users seeking structure and execution
- bilingual Hebrew/English users
- users drawn to identity-based growth rather than generic productivity

Secondary users:

- coaches
- creators
- community contributors
- business builders

## Product Promise

Evolve should help a user answer, continuously:

1. Who am I becoming?
2. What matters next?
3. What should I do today?

## Identity Stack

Canonical stack:

```text
DNA -> AION -> MindOS Layer -> Avatar
```

- `DNA` = canonical computed identity layer
- `AION` = future-self identity and visual presence abstraction
- `MindOS Layer` = the OpenClaw-powered AI interaction layer
- `Avatar` = embodied customizable body layer

Note:

- the codebase uses `AION`, not `AINO`
- future branding can rename this, but current docs should not invent a different canonical internal term

## Domains

Canonical product-facing domains:

1. consciousness
2. presence
3. power
4. vitality
5. focus
6. combat
7. expansion
8. wealth
9. influence
10. relationships
11. business
12. projects
13. play
14. order

Purpose:

- these domains let MindOS move from vague motivation to structured diagnostic guidance

## User Journey

```text
Landing
  -> onboarding
  -> ceremony
  -> avatar + username setup
  -> protected MindOS entry
  -> assessment / planning / execution
  -> community / market / study
```

Operationally:

1. user lands in Evolve
2. onboarding captures profile, intent, and identity signals
3. avatar setup now also captures community username
4. user enters `MindOS`
5. user chats, assesses, plans, and executes
6. user extends into Free Market, Community, and Study

## What MindOS Must Do

- maintain session continuity
- use user context and memory
- support Hebrew and English
- convert assessments into structured recommendations
- convert guidance into action
- remain embedded in the product, not feel like a detached chatbot

## Success Metrics

- onboarding completion
- avatar completion
- first MindOS session start
- first domain assessment completion
- action item creation and completion
- weekly retained active users
- free-to-paid conversion
- SSE success rate for AI flows

## Current Blockers

1. route migration is only partially complete
2. app source is still physically outside the target `apps/evolve/src` structure
3. Supabase project files are still physically outside `backend/supabase`
4. Vercel `/api` and Supabase edge functions overlap
5. Web3Auth remains a fragile dependency
6. docs have historically drifted faster than the code

## Direction Of Travel

Near-term direction:

- stabilize current `Evolve` + `MindOS` navigation
- finish documentation alignment
- move repo structure toward monorepo form
- finish OpenClaw backend normalization

Longer-term direction:

- platform shell in `apps/evolve`
- minimal serverless surface for webhooks/auth bridges
- OpenClaw as the primary MindOS orchestration engine
