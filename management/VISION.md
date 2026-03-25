# MindOS Vision

Last updated: 2026-03-25

## Purpose

MindOS is a personal operating system for self-development, execution, and identity-based guidance. It combines assessment, planning, AI coaching, community, learning, and monetization into one continuous user experience.

The product promise is simple:

- map the user clearly
- turn that map into direction
- turn direction into daily execution
- keep the loop alive through Aurora, identity, and feedback

## Who We Are

MindOS is not a single-feature app. It is a structured life system:

- identity engine
- AI coach
- execution hub
- learning layer
- social layer
- creator / coach / market layer

It is designed as a system users live inside, not a dashboard they visit occasionally.

## Who We Serve

Primary users:

- ambitious individuals who want structure, clarity, and execution support
- users who resonate with identity-based growth, assessment, and coaching
- bilingual Hebrew / English users

Secondary users:

- coaches and practitioners
- creators and business builders
- affiliates and community contributors

## Core Proposition

MindOS helps a user answer three questions continuously:

1. Who am I becoming?
2. What matters next?
3. What should I do today?

The differentiated layer is that these answers are grounded in identity, domains, and memory, not just generic chat.

## Identity Stack

Important naming note:

- Current codebase term: `AION`
- User prompt term: `AINO`
- Repository evidence does not show `AINO`; use `AION` as canonical unless branding changes intentionally

Current identity stack:

1. `DNA`
   - canonical identity computation layer
   - computed by [src/identity/computeDNA.ts](c:\Users\roymichaels\Desktop\mindhacker-net\src\identity\computeDNA.ts)
   - merges orb signals, onboarding identity profile, pillar scores, skills, habits, energy, and community activity
2. `AION`
   - user-facing future-self identity abstraction
   - the branded persona users relate to
3. `Orb`
   - visual body of AION
   - must render identity, not invent it
4. `Aurora`
   - AI engine behind chat, assessments, commands, and proactive behavior
5. `Avatar`
   - user-customized 3D body, separate from the orb

In practical terms:

`DNA -> AION meaning -> Orb visualization -> Aurora interaction -> Avatar embodiment`

## 14 Life Domains

Canonical domain list comes from [src/navigation/lifeDomains.ts](c:\Users\roymichaels\Desktop\mindhacker-net\src\navigation\lifeDomains.ts).

1. `consciousness`
   - self-awareness, inner coherence, identity clarity
2. `presence`
   - appearance, grooming, style, posture, visible self-presentation
3. `power`
   - strength, physical capability, skill progression
4. `vitality`
   - sleep, nutrition, recovery, hormones, energy foundations
5. `focus`
   - attention control, deep work, dopamine discipline
6. `combat`
   - pressure capacity, technical fighting exposure, reaction and resilience
7. `expansion`
   - learning, creativity, language, intellectual range
8. `wealth`
   - income, monetization, financial control
9. `influence`
   - communication, leadership, charisma, persuasion
10. `relationships`
   - social bonds, support network, partnerships
11. `business`
   - building and operating ventures
12. `projects`
   - organizing goals, delivery, and execution systems
13. `play`
   - regeneration, joy, movement, recovery through engagement
14. `order`
   - cleanliness, systems, digital and physical organization

Outdated note:

- `romantics` exists in code and assessment tooling, but the current canonical domain registry still documents 14 domains in product-facing language. Treat `romantics` as implemented-but-not-fully-aligned with top-level product messaging.

## User Journey

```text
Public landing
  -> onboarding / ceremony
  -> auth / wallet auth
  -> launchpad + identity capture
  -> DNA / orb / AION initialization
  -> Play hub
  -> domain assessments
  -> Aurora-guided plans and daily execution
  -> community / learn / FM / role-specific hubs
```

Expanded flow:

1. Public user lands on `/` or `/founding`
2. User enters onboarding through `/onboarding`
3. Launchpad collects profile, lifestyle, goals, and preferences
4. Identity is synthesized into DNA, orb, and AION-facing outputs
5. User enters protected shell at `/play`
6. User completes domain assessments in `/strategy/*`
7. Aurora uses memory, plans, scores, and context to guide execution
8. User expands into community, learning, FM, coaching, or role-specific routes

## Product Surfaces

Current primary protected surfaces:

- `Play` for execution and strategy
- `Community` for social layer
- `Learn` for content and courses
- `FM` for marketplace and monetization
- `Aurora` as pervasive assistant, now increasingly widget- and modal-driven

## Success Metrics

North-star product metrics:

- onboarding completion rate
- first assessment completion rate
- `% users reaching /play after onboarding`
- weekly active users returning to protected routes
- Aurora conversations per active user
- assessment-to-plan conversion rate
- action completion / daily execution adherence
- subscription conversion from free to paid
- retention of users who complete at least one domain assessment

Operational metrics:

- SSE chat success rate
- edge/api failure rate
- auth success rate
- average time to first meaningful response
- assessment save success rate

## Current Blockers

1. Documentation drift
   - `README.md` is still Lovable boilerplate
   - `PRODUCT_SPEC.md` and `docs/APP_MAP.md` partially conflict with current routes
2. Route/spec drift
   - `/aurora` is documented as a full route, but [src/App.tsx](c:\Users\roymichaels\Desktop\mindhacker-net\src\App.tsx) currently redirects it to `/play`
   - FM is documented as `/fm/earn`; current route root is `/fm`
3. Architecture concentration
   - [src/App.tsx](c:\Users\roymichaels\Desktop\mindhacker-net\src\App.tsx) is still the route and provider monolith
4. AI backend transition
   - Supabase edge functions and new Vercel `/api/*` agent runtime now coexist
   - cutover policy is not yet fully normalized
5. Naming inconsistency
   - AION vs AINO vs Aurora needs one canonical external language policy
6. Folder sprawl
   - domain logic is split across `components`, `hooks`, `lib`, `pages`, and `flows`
7. Legacy systems remain live
   - Lovable references, SoulAvatar naming, duplicate hooks, and unused aliases still exist

## What Future Prompts Should Assume

- `DNA` is the identity source of truth
- `AION` is the correct identity abstraction name in code
- `Aurora` is the AI engine
- `Play` is the protected default destination
- `lifeDomains.ts` is the canonical domain registry
- `App.tsx` is the current route truth, even where product docs lag
