# MindOS Architecture

Last updated: 2026-03-25

## Stack

### Frontend

- React 18 + Vite + TypeScript
- React Router for route composition
- Tailwind + shadcn/ui + Radix primitives
- React Query for server state
- Context providers for app-wide client state
- Zustand in limited scope, currently most visibly for avatar configuration
- Framer Motion for motion
- Three.js / React Three Fiber for orb and avatar rendering
- i18n for Hebrew + English

### Backend

- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage
- Supabase Edge Functions in `supabase/functions`
- Vercel serverless API routes in `api/` for newer agent runtime

### External Services

- Supabase project `voiomhujdmadsidbqskp`
- Vercel hosting
- Web3Auth
- OpenRouter for current Vercel agent runtime
- Lovable AI gateway still referenced by many legacy edge functions
- ElevenLabs for voice
- Stripe for subscriptions and checkout
- Resend / email queue infrastructure
- push notification services

## Current High-Level Shape

```text
Browser
  -> React app
    -> contexts + hooks + React Query
    -> Supabase client
    -> Vercel /api agents or Supabase edge functions
      -> Supabase DB / storage / auth
      -> external AI / voice / payments
```

## Identity Layers

Canonical identity layering:

```text
DNA
  -> computed identity facts
  -> archetype, traits, signal weights

AION
  -> user-facing future-self abstraction
  -> personal identity narrative

Orb
  -> visual rendering of identity
  -> no identity invention

Aurora
  -> AI operating layer
  -> chat, assessment, plan, proactive guidance

Avatar
  -> customizable 3D body
  -> persisted separately from orb
```

Source files:

- DNA: [src/identity/computeDNA.ts](c:\Users\roymichaels\Desktop\mindhacker-net\src\identity\computeDNA.ts)
- Identity registry: [src/meta/appMap.ts](c:\Users\roymichaels\Desktop\mindhacker-net\src\meta\appMap.ts)
- Domain registry: [src/navigation/lifeDomains.ts](c:\Users\roymichaels\Desktop\mindhacker-net\src\navigation\lifeDomains.ts)

## Data Flows

### Auth and app boot

```text
Browser
  -> BrowserRouter
  -> Web3AuthProviderWrapper
  -> AuthProvider
  -> ProtectedAppShell
  -> route page
  -> hooks fetch Supabase data
```

### Domain assessment flow

```text
User input
  -> DomainAssessChat
  -> fetch /api/domain-assess
  -> agent runtime
  -> model stream (SSE)
  -> optional tool call extract_domain_profile
  -> assessment payload
  -> useDomainAssessment.saveAssessment()
  -> Supabase tables / results route
```

Primary file:

- [src/components/pillars/DomainAssessChat.tsx](c:\Users\roymichaels\Desktop\mindhacker-net\src\components\pillars\DomainAssessChat.tsx)

### Aurora chat flow

```text
User message
  -> chat hook / context
  -> /api/aurora-chat
  -> agent runtime
  -> Supabase query tools + OpenRouter
  -> SSE back to client
  -> UI stream renderer
  -> optional persistence / follow-up actions
```

### Identity computation flow

```text
Orb profile
Onboarding identity profile
Game state
Pillar scores
Skill distribution
Habit completion
Energy signal
Community score
  -> computeDNA()
  -> DNAProfile
  -> downstream renderers / AI context / profile views
```

## State Management

### Context-based app state

Provider order is defined in [src/App.tsx](c:\Users\roymichaels\Desktop\mindhacker-net\src\App.tsx).

Key contexts:

- `AuthContext`
- `AuroraChatContext`
- `LanguageContext`
- `AuthModalContext`
- `GameStateContext`
- `SubscriptionsModalContext`
- `CoachesModalContext`
- `WalletModalContext`
- `SoulAvatarContext`
- `ProfileModalContext`
- `SmartOnboardingContext`

### React Query

Used for:

- user/profile reads
- domain assessments
- community data
- work sessions
- courses and content
- admin reads

### Zustand

Current confirmed active usage:

- avatar configurator store in [src/components/avatar/avatarStore.ts](c:\Users\roymichaels\Desktop\mindhacker-net\src\components\avatar\avatarStore.ts)

### Local component state

Still heavily used for:

- chat streaming state
- modal visibility
- form progression
- view toggles and shell responsiveness

## Routing Architecture

### Public routes

Public routes are mounted directly in [src/App.tsx](c:\Users\roymichaels\Desktop\mindhacker-net\src\App.tsx).

Primary public surfaces:

- `/`
- `/founding`
- `/courses/*`
- `/blog/*`
- `/onboarding`
- `/ceremony`
- `/docs`
- `/install`
- media token routes
- legal routes

### Protected routes

Protected shell:

- wrapped by `ProtectedAppShell`
- default protected center of gravity is `/play`

Main protected groups:

- `/play`
- `/community`
- `/messages`
- `/strategy/*`
- `/coaches`
- `/admin-hub`
- `/learn`
- `/work`
- `/fm/*`
- `/business`
- `/freelancer`
- `/creator`
- `/therapist`
- `/quests/*`

### Redirect architecture

Redirects are centralized in [src/routes/redirects.tsx](c:\Users\roymichaels\Desktop\mindhacker-net\src\routes\redirects.tsx).

Current routing reality that differs from old docs:

- `/aurora` redirects to `/play`
- `/plan`, `/now`, `/strategy`, `/profile`, `/arena` all redirect to `/play`
- many old legacy routes collapse to `/play`, `/community`, `/coaches`, or `/admin-hub`

## Navigation Architecture

Primary navigation source:

- [src/navigation/osNav.ts](c:\Users\roymichaels\Desktop\mindhacker-net\src\navigation\osNav.ts)

Visible bottom tabs:

- `FM`
- `Play`
- `Community`
- `Study`

Special behavior:

- Aurora is injected by UI, not defined as a standard `OS_TABS` item
- admin is dropdown-only
- coach is nested, not bottom-tab primary

## Edge Functions Catalog

The project has a large Supabase edge-function surface. Current strategic classification:

### High-priority conversational / agent functions

- `aurora-chat`
- `domain-assess`
- `plan-chat`
- `work-chat`
- `onboarding-chat`
- `consciousness-assess`

These are the strongest candidates for OpenClaw-style or Vercel-side agent migration.

### AI generation functions

- plan generation
- milestone / execution / tactical schedule generation
- launchpad summary
- orb narrative
- business / branding / curriculum / blog / story generation

### Commerce and account functions

- checkout
- customer portal
- stripe webhook
- subscription checks
- admin grants

### Media / notification functions

- TTS / transcription
- welcome / order / newsletter email
- push notifications

### Web3 / auth bridge functions

- `web3auth-exchange`
- `web3-wallet`

## Which Functions Should Move First

Priority order:

1. `aurora-chat`
2. `domain-assess`
3. `plan-chat`
4. `work-chat`
5. `onboarding-chat`
6. `aurora-proactive`

Reason:

- they are streaming or conversational
- they rely on AI context assembly
- they benefit most from reusable tools and sessions

## Current Hybrid Reality

As of now the app is hybrid:

- legacy edge functions still exist under `supabase/functions`
- new chat endpoints now also exist in `api/`
- frontend behavior is no longer exclusively edge-function-based

That means architecture decisions must distinguish:

- legacy supported
- actively used in production
- migration target

## Known Architecture Risks

1. `App.tsx` is too large and owns too much route truth
2. product docs still trail runtime reality
3. edge-function and Vercel-agent systems overlap
4. naming is inconsistent across AION / Aurora / SoulAvatar / legacy orbital concepts
5. domain logic is split across too many folders
6. auth depends on external Web3Auth config correctness
7. many legacy edge functions still depend on Lovable gateway keys
