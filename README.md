# Evolve

Evolve is the platform. `MindOS` is the AI coaching and execution layer inside it.

## Current Status

This repository is in a staged architecture transition:

- Production app behavior is already aligned around `Evolve` + `MindOS`
- Main protected navigation is now:
  - `Free Market` -> `/fm`
  - `MindOS` -> `/mindos/*`
  - `Community` -> `/community`
  - `Study` -> `/learn`
- Legacy routes such as `/aurora`, `/play`, and `/work` are preserved as redirects; `/aurora` now resolves into the AION chat experience
- OpenClaw-style agent runtime is already live through Vercel `/api/*`
- The repo is now bootstrapped as a workspace monorepo, but the live app source still physically lives in root `src/` and `supabase/`

## Workspace Shape

```text
.
|- apps/
|  `- evolve/           # active Vite package used by root workspace build
|- backend/
|  |- openclaw/         # agent configs, tool stubs, future service boundary
|  `- supabase/         # target home for Supabase assets (bootstrap docs only for now)
|- design/              # reserved for design assets and brand material
|- management/          # architecture and operational source of truth
|- api/                 # current Vercel serverless routes
|- src/                 # current live React application source
`- supabase/            # current live Supabase project files
```

## Product Structure

### Platform tabs

- `Free Market` -> marketplace, wallet, earning surfaces
- `MindOS` -> coaching hub with:
  - `chat`
  - `tactics`
  - `strategy`
  - `work`
  - `journal`
- `Community` -> social feed, stories, profiles
- `Study` -> courses and learning

### Identity stack

```text
DNA -> AION -> MindOS Layer -> Avatar
```

- `DNA` is the canonical identity computation layer
- `AION` is the future-self presence and visual identity abstraction
- `MindOS Layer` is the unified OpenClaw-powered intelligence surface
- `Avatar` is the user's 3D body/customization layer

## Runtime Architecture

### Frontend

- React 18
- Vite
- TypeScript
- React Router
- Tailwind + shadcn/ui
- React Query
- Context providers
- Three.js / React Three Fiber

### Backend / services

- Supabase for auth, DB, storage, and legacy edge functions
- Vercel `/api` routes for the current MindOS agent runtime
- OpenRouter for model access
- Web3Auth for wallet bootstrap
- Stripe, ElevenLabs, Resend, push infrastructure

## OpenClaw Status

The repo already contains the first practical cut of the OpenClaw migration:

- agent runtime in `api/`
- config loader in `src/lib/openclaw.ts`
- shared agent tools in `src/lib/tools/`
- backend-aligned agent configs in `backend/openclaw/agents/`

The next step is moving from "runtime works" to "backend boundary is fully normalized."

## Development

Install from the workspace root:

```sh
npm install
```

Run the app:

```sh
npm run dev
```

Build the app:

```sh
npm run build
```

App package only:

```sh
npm run dev:app
npm run build:app
```

## Environment

See [.env.example](c:\Users\roymichaels\Desktop\mindhacker-net\.env.example).

Core variables:

```sh
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENROUTER_API_KEY=
VITE_WEB3AUTH_CLIENT_ID=
VITE_WEB3AUTH_NETWORK=
```

## Source Of Truth Docs

Start here:

- [management/VISION.md](c:\Users\roymichaels\Desktop\mindhacker-net\management\VISION.md)
- [management/ARCHITECTURE.md](c:\Users\roymichaels\Desktop\mindhacker-net\management\ARCHITECTURE.md)
- [management/API_CONTRACTS.md](c:\Users\roymichaels\Desktop\mindhacker-net\management\API_CONTRACTS.md)
- [management/OPENCLAW_MIGRATION.md](c:\Users\roymichaels\Desktop\mindhacker-net\management\OPENCLAW_MIGRATION.md)
- [management/DIRECTORY_ALIGNMENT.md](c:\Users\roymichaels\Desktop\mindhacker-net\management\DIRECTORY_ALIGNMENT.md)
