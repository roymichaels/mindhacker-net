# Evolve Architecture

Last updated: 2026-03-25

## Architecture State

The repository is currently in a hybrid state:

- product architecture has already shifted to `Evolve` + `MindOS`
- runtime architecture has partly shifted from Supabase edge functions to Vercel `/api`
- filesystem architecture has begun shifting to a workspace monorepo

The right way to read this repo is: current production first, future alignment second.

## Stack

### Frontend

- React 18
- Vite
- TypeScript
- React Router
- Tailwind + shadcn/ui + Radix
- React Query
- context providers
- Zustand in isolated areas like avatar config
- Three.js / React Three Fiber
- i18n for Hebrew + English

### Backend

- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage
- Supabase Edge Functions in root `supabase/functions`
- Vercel `/api` runtime for newer MindOS agents

### External services

- Supabase project `voiomhujdmadsidbqskp`
- Vercel
- OpenRouter
- Web3Auth
- Stripe
- ElevenLabs
- Resend / email queue infra

## Physical Repository Shape

```text
repo root
  |- apps/evolve            # new app package entrypoint
  |- backend/openclaw       # new AI backend boundary
  |- backend/supabase       # target location, not yet physically migrated
  |- design                 # reserved design home
  |- management             # architecture/docs source of truth
  |- api                    # current Vercel routes
  |- src                    # current live app source
  `- supabase               # current live Supabase project
```

Important:

- `apps/evolve` is the active package Vercel now builds toward
- root `src/` is still the real source tree used by that package

## Identity Layers

```text
DNA
  -> AION
    -> Orb
      -> Aurora
        -> Avatar
```

- `DNA` comes from [src/identity/computeDNA.ts](c:\Users\roymichaels\Desktop\mindhacker-net\src\identity\computeDNA.ts)
- `AION` is the identity abstraction in code
- `Orb` is the visual output
- `Aurora` is the AI persona and reasoning surface
- `Avatar` is the customizable 3D body

## Navigation Architecture

Primary nav source:

- [src/navigation/osNav.ts](c:\Users\roymichaels\Desktop\mindhacker-net\src\navigation\osNav.ts)

Current visible tabs:

- `/fm`
- `/mindos/chat`
- `/community`
- `/learn`

MindOS internal sections:

- `/mindos/chat`
- `/mindos/tactics`
- `/mindos/strategy`
- `/mindos/work`
- `/mindos/journal`

MindOS shell:

- [src/pages/MindOSPage.tsx](c:\Users\roymichaels\Desktop\mindhacker-net\src\pages\MindOSPage.tsx)

## Routing Architecture

Route truth currently lives in [src/App.tsx](c:\Users\roymichaels\Desktop\mindhacker-net\src\App.tsx).

### Public routes

- landing
- onboarding
- ceremony
- docs
- blog
- courses
- legal/media/token routes

### Protected shell routes

- MindOS
- Free Market
- Community
- Study
- coaches
- admin
- journeys
- business

### Transitional routes

- `/aurora` -> `/mindos/chat`
- `/play` -> `/mindos/tactics`
- `/work` -> `/mindos/work`
- `/strategy` -> `/mindos/strategy`

### Transitional deep strategy reality

Deep pillar flows still exist on `/strategy/*`. The architecture is therefore:

```text
MindOS route shell
  -> strategic landing in /mindos/strategy
  -> legacy detailed pillar routes still mounted under /strategy/*
```

## State Management

### Contexts

Main provider composition is still in [src/App.tsx](c:\Users\roymichaels\Desktop\mindhacker-net\src\App.tsx).

Important contexts:

- `AuthContext`
- `AuroraChatContext`
- `LanguageContext`
- `GameStateContext`
- `SmartOnboardingContext`
- modal/shell contexts

### React Query

Used heavily for:

- profile data
- community data
- assessments
- execution/work data
- admin data

### Zustand

Current confirmed use:

- avatar configuration store

## AI Runtime Architecture

### Current flow

```text
User
  -> React client
    -> /api/aurora-chat or /api/domain-assess
      -> api/_lib/agent-runtime.ts
        -> src/lib/openclaw.ts
        -> src/lib/tools/*
        -> OpenRouter
      -> SSE back to client
```

### Backend alignment path

```text
backend/openclaw/
  |- agents/
  |- tools/
  `- workspace/
```

Current state:

- canonical agent configs now live in [backend/openclaw/agents](c:\Users\roymichaels\Desktop\mindhacker-net\backend\openclaw\agents)
- loader in [src/lib/openclaw.ts](c:\Users\roymichaels\Desktop\mindhacker-net\src\lib\openclaw.ts) prefers that new location
- Python tool stubs exist for future service extraction

## Data Flow Diagrams

### Auth and app boot

```text
Browser
  -> BrowserRouter
  -> Web3Auth provider
  -> Auth provider
  -> ProtectedAppShell
  -> route page
  -> hooks/query -> Supabase
```

### Domain assess flow

```text
User input
  -> DomainAssessChat
  -> POST /api/domain-assess
  -> agent runtime
  -> OpenRouter stream
  -> extract_domain_profile tool schema
  -> client persists structured result
```

### Wallet flow

```text
Web3Auth login
  -> Supabase bridge/session
  -> edge function web3-wallet
  -> wallet create/status/mint
```

## Edge Function Catalog

High-value legacy functions still in `supabase/functions`:

- `aurora-chat`
- `domain-assess`
- `plan-chat`
- `work-chat`
- `onboarding-chat`
- `aurora-proactive`
- commerce / webhook / media / auth bridge functions

Functions most likely to migrate first:

1. `aurora-chat`
2. `domain-assess`
3. `plan-chat`
4. `work-chat`
5. `aurora-proactive`

Functions likely to remain serverless/infrastructure-oriented:

- Stripe webhooks
- customer portal / checkout flows
- email queue processors
- tokenized media delivery
- Web3 bridge flows until auth is redesigned

## Current Risks

1. `src/App.tsx` is still a route/provider monolith
2. physical directory migration is incomplete
3. strategy route migration is incomplete
4. AI backend is hybrid
5. Web3Auth remains brittle
6. many legacy edge functions still reference older AI gateway assumptions
