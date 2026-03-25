# Directory Alignment

Last updated: 2026-03-25

## Current Structure Critique

What is messy today:

1. `src/App.tsx` is oversized
   - providers, route definitions, redirects, and app boot are concentrated in one file
2. feature ownership is split by both concern and surface
   - example: a domain feature can span `pages`, `components/pillars`, `hooks`, `lib/domain-assess`, `services`, and edge functions
3. root `hooks/` is overloaded
   - many feature hooks sit at root, while some areas also have nested subfolders
4. duplicate coach hooks exist
   - both root `hooks/*` and `hooks/coaches/*`
5. `lib/` mixes domain logic, infra helpers, prompt tooling, identity render logic, and pure utilities
6. route docs and route code are not co-located
7. legacy names remain in current paths
   - `SoulAvatar`, old Aurora assumptions, some legacy route aliases

## Proposed Folder Structure

Recommended direction for `src/`:

```text
src/
  app/
    providers/
    router/
    layouts/
  features/
    aurora/
    assessments/
    play/
    community/
    learn/
    fm/
    admin/
    coaches/
    business/
    avatar/
    identity/
    onboarding/
    messaging/
  shared/
    ui/
    navigation/
    hooks/
    lib/
    services/
    types/
  integrations/
    supabase/
    web3auth/
  pages/
    public/
    protected/
```

## Suggested Mapping

### Move route ownership

- `src/App.tsx`
  -> `src/app/router/AppRouter.tsx`
- redirect tables
  -> `src/app/router/redirects.tsx`
- provider composition
  -> `src/app/providers/AppProviders.tsx`

### Consolidate feature slices

- `components/aurora`, `hooks/aurora`, `api/aurora-chat.ts`, `services/unifiedContext.ts`
  -> feature-owned `features/aurora/*`
- `components/pillars`, `pages/pillars`, `lib/domain-assess`, `hooks/useDomainAssessment`
  -> `features/assessments/*`
- `components/play`, `components/dashboard`, `plan/*`, planning hooks
  -> `features/play/*`

### Normalize role-based surfaces

- `components/careers/coach`, `components/careers/coaches`, root coach hooks
  -> one `features/coaches/*`
- `components/careers/business`, business hooks and pages
  -> `features/business/*`

### Reduce `lib/` sprawl

Split into:

- `shared/lib` for generic helpers
- `features/<name>/lib` for feature-owned business logic
- `integrations/*` for external service clients

## Rename / Move Plan

### Phase 1: No behavior change

1. create new folders
2. add barrel exports
3. move only one slice at a time
4. keep import compatibility via re-export shims

### Phase 2: Route decomposition

1. extract router and provider composition from `App.tsx`
2. move route groups into separate modules
3. keep exact route behavior unchanged

### Phase 3: Feature ownership cleanup

1. merge duplicate coach hooks
2. move assessment logic under one feature
3. move Aurora agent tooling into a dedicated feature folder

### Phase 4: Legacy names

1. deprecate `SoulAvatar` naming behind aliases
2. align AION/Aurora naming policy
3. update docs and import paths after stable cutover

## How To Transition Safely

- use path aliases and barrel files first
- avoid broad import rewrites in one commit
- keep one vertical slice per refactor
- run build after each slice
- keep route behavior unchanged until router extraction is complete

Practical pattern:

```text
new file created
  -> old file re-exports from new file
  -> imports migrate incrementally
  -> old file deleted only after global usage is zero
```

## Rollback Plan

For each slice:

1. move in one isolated commit
2. preserve old export shims
3. if regressions appear, point old shim back to original implementation
4. only remove compatibility layers after a stable release window

## Immediate Recommendations

1. Extract `AppProviders.tsx`
2. Extract `AppRouter.tsx`
3. Merge duplicate coach hooks
4. Create `features/assessments`
5. Create `features/aurora`
6. Move OpenClaw runtime ownership under one feature boundary

## Non-Negotiable Rule

Identity source-of-truth files should remain obvious and centralized:

- `computeDNA`
- `lifeDomains`
- route registry / router modules
- agent/tool contracts

Those should never be scattered again.
