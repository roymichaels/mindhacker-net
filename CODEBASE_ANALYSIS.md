# Evolve Codebase Analysis

Last updated: 2026-03-25

This document is a practical architecture snapshot, not a legacy audit of the Lovable-era app.

## Executive Summary

The repository now has three simultaneous realities:

1. the product has already rebranded from "MindOS app" to `Evolve`
2. the protected user experience now centers on `MindOS` as an internal hub
3. the codebase has begun a monorepo/bootstrap migration, but the live code still physically sits in root `src/` and `supabase/`

That means the app is functionally ahead of its filesystem structure.

## What Is True Right Now

### Product

- `Evolve` is the platform brand
- `MindOS` is the coaching/execution layer
- `MindOS` is now the single AI brain across coaching surfaces

### Navigation

- primary tabs are `Free Market`, `MindOS`, `Community`, `Study`
- `MindOS` has internal sections for chat, tactics, strategy, work, and journal
- legacy `Aurora` and `Play` routes now redirect into `MindOS`; Aurora branding is being deprecated in favor of AION

### Runtime

- frontend is React + Vite + TypeScript
- auth/data/storage are still Supabase-based
- new conversational runtime uses Vercel `/api`
- legacy edge functions still exist and still matter

### Repository

- workspace root exists
- [apps/evolve](c:\Users\roymichaels\Desktop\mindhacker-net\apps\evolve) now builds the app package
- [backend/openclaw](c:\Users\roymichaels\Desktop\mindhacker-net\backend\openclaw) exists as the new AI backend boundary
- root `src/` still contains the active application source
- root `supabase/` still contains the active Supabase project

## Strengths

- product direction is clearer than before
- AI routing is moving away from ad hoc edge-only logic
- identity model is differentiated and already implemented
- bilingual support is built in
- avatar/AION/identity stack is a meaningful moat
- the app still builds after the workspace bootstrap

## Main Risks

### 1. Structure lags behavior

The app behavior already reflects the new platform model, but the filesystem still reflects older phases of the product.

### 2. Routing is partly modernized, partly transitional

- `/mindos/*` is the new protected hub
- deep pillar flows still live in the older `/strategy/*` tree

### 3. AI backend is hybrid

- new routes: `api/mindos-chat.ts`, `api/domain-assess.ts`
- old edge functions still exist and are still part of the runtime surface

### 4. Auth is still complex

- Supabase auth
- Web3Auth bridge
- wallet creation/mint side effects

### 5. Documentation drift has been high

The repo had multiple conflicting "truths" before this consolidation pass.

## Architectural Recommendation

Treat the repo as a staged migration, not a clean-sheet rewrite.

### Correct next order

1. keep current app behavior stable
2. finish doc consolidation
3. move physical app source into `apps/evolve`
4. move physical Supabase project into `backend/supabase`
5. normalize AI backend around `backend/openclaw`
6. reduce route/provider monolith in `src/App.tsx`

### Wrong order

- broad rename/move of everything first
- deleting legacy edges before parity is proven
- assuming route migration is finished because the main tab structure is finished

## Current Source Of Truth Files

- [src/App.tsx](c:\Users\roymichaels\Desktop\mindhacker-net\src\App.tsx)
- [src/navigation/osNav.ts](c:\Users\roymichaels\Desktop\mindhacker-net\src\navigation\osNav.ts)
- [src/pages/MindOSPage.tsx](c:\Users\roymichaels\Desktop\mindhacker-net\src\pages\MindOSPage.tsx)
- [src/lib/openclaw.ts](c:\Users\roymichaels\Desktop\mindhacker-net\src\lib\openclaw.ts)
- [backend/openclaw](c:\Users\roymichaels\Desktop\mindhacker-net\backend\openclaw)
- [management/ARCHITECTURE.md](c:\Users\roymichaels\Desktop\mindhacker-net\management\ARCHITECTURE.md)
