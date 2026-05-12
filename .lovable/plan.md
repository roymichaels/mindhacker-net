## Goal

Fix the broken preview by collapsing the monorepo (`apps/evolve`, `backend/*`, turbo, npm workspaces) back into a single root Vite app. The Lovable preview harness runs `npm run dev -- --port 8080`, which the current turbo-based script rejects, so the dev server crashes immediately.

## Why preview is broken

Root `package.json` has:
```
"dev": "turbo run dev --parallel --filter=@evolve/app"
```
Turbo doesn't accept `--port 8080` as a top-level flag, so it exits with `unexpected argument '--port' found` before Vite ever starts.

## What's already in place

- Root already has working `vite.config.ts`, `index.html`, `src/`, `public/`, `tailwind.config.ts`, `postcss.config.js`, `tsconfig*.json`, `supabase/`.
- `apps/evolve/` is mostly a duplicate that re-points at root `../../src` and `../../public`. Its `package.json` is the real dependency manifest.
- `backend/openclaw/`, `backend/supabase/`, `apps/game-server/` are scaffolds/READMEs not used by the live app.

## Plan

### 1. Single-app root `package.json`

- Remove `workspaces`, `turbo`-based scripts, and the `@vercel/node` root dep.
- Rename to a normal app package; set scripts to:
  - `"dev": "vite"`
  - `"build": "vite build"`
  - `"build:dev": "vite build --mode development"`
  - `"lint": "eslint ."`
  - `"preview": "vite preview"`
- Merge `apps/evolve/package.json` `dependencies` + `devDependencies` into root (drop `openclaw` if unused, keep everything else the app imports).

### 2. Delete monorepo scaffolding

Files/dirs to remove:
- `apps/evolve/` (duplicate of root app)
- `apps/game-server/` (separate Colyseus server, not part of preview)
- `apps/` (becomes empty)
- `backend/openclaw/`, `backend/supabase/`, `backend/` (READMEs/scaffolds)
- `turbo.json`
- `vercel-build.sh`
- `Makefile` (references the monorepo scripts)
- `management/DIRECTORY_ALIGNMENT.md` will be left as-is (docs only).

### 3. Vercel config

Update `vercel.json`:
- `buildCommand`: `npm run build`
- `outputDirectory`: `dist`
- Keep `api/**/*.ts` builder and rewrites unchanged.

### 4. Reinstall + restart

- Run `npm install` at root so the merged dependency set is hoisted into a single `node_modules`.
- Restart the dev server. Lovable's harness will then run `npm run dev -- --port 8080`, which Vite accepts natively.

### 5. Verify

- Confirm Vite starts on port 8080 from the daemon log.
- Load `/` in the preview and confirm no module-resolution errors in the console.
- Spot-check that `@/...` aliases still resolve (root `vite.config.ts` already maps `@` to `./src`).

## Out of scope

- No source code, routing, theming, or auth changes.
- `apps/game-server` (Colyseus) won't be deleted from git history, only from the working tree; if you actually need it later we can re-introduce it as a separate repo.
- No changes to `supabase/` (root) or edge functions.

## Risk / rollback

Risk is low because the root already contains a working Vite setup; we're removing the broken turbo wrapper and a duplicate app folder. If anything regresses, rolling back this single change set restores the previous (broken-preview) state.
