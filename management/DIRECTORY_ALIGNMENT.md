# Directory Alignment

Last updated: 2026-03-25

## Current Physical Reality

The repo is only partially aligned with the target monorepo.

### Already created

- [apps/evolve](c:\Users\roymichaels\Desktop\mindhacker-net\apps\evolve)
- [backend/openclaw](c:\Users\roymichaels\Desktop\mindhacker-net\backend\openclaw)
- [backend/supabase](c:\Users\roymichaels\Desktop\mindhacker-net\backend\supabase)
- [design](c:\Users\roymichaels\Desktop\mindhacker-net\design)
- [management](c:\Users\roymichaels\Desktop\mindhacker-net\management)

### Still physically at root

- `src/`
- `public/`
- `api/`
- `supabase/`
- root shared configs

This is deliberate. The workspace bootstrap was done in a compatibility-first way so the app could keep building and deploying while the structure changes.

## Current Critique

Problems that still exist:

1. root `src/` is still the real app source
2. root `supabase/` is still the real Supabase project
3. `src/App.tsx` still owns too much
4. feature logic is spread across `components`, `hooks`, `pages`, `lib`, and `services`
5. there is still naming and route debt from older product phases

## Target Shape

```text
apps/
  evolve/
    src/
    public/
    api/
backend/
  supabase/
  openclaw/
design/
management/
```

## Safe Move Plan

### Phase 1: bootstrap

Completed:

- root workspace package
- `apps/evolve` package
- `backend/openclaw` scaffold
- Vercel build output retargeted to `apps/evolve/dist`

### Phase 2: app source migration

Next:

1. move `src/` into `apps/evolve/src`
2. move `public/` into `apps/evolve/public`
3. move app configs into `apps/evolve/`
4. update aliases/imports/config references
5. keep build green at each slice

### Phase 3: backend migration

1. move `supabase/` into `backend/supabase/`
2. update Supabase CLI workflows
3. update docs and deployment scripts

### Phase 4: feature decomposition

1. split router/providers out of `App.tsx`
2. organize by feature domain inside app package
3. keep compatibility shims where necessary

## Feature-Oriented Target

Recommended future app structure:

```text
apps/evolve/src/
  app/
  components/
    evolve/
    mindos/
    marketplace/
    community/
    learn/
    shared/
  contexts/
    evolve/
    mindos/
    marketplace/
    community/
  hooks/
  integrations/
  identity/
  lib/
  pages/
  types/
```

## Transition Rules

- no wide destructive move without a passing build
- one vertical slice at a time
- prefer compatibility shims
- update docs with each structural milestone
- do not treat scaffold folders as proof the migration is finished

## Rollback

For each structural slice:

1. isolate it in its own commit
2. keep old paths working temporarily when possible
3. revert only that slice if it regresses

## Current Recommendation

The next structural pass should be:

1. physically move `src/` into `apps/evolve/src`
2. physically move `public/` into `apps/evolve/public`
3. then move `supabase/` into `backend/supabase`

That sequence minimizes risk because the app package already exists and already builds.
