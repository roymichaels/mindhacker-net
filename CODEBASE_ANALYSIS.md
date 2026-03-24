# MindOS Codebase Analysis

**Date:** 2026-03-24  
**Analyzed by:** Harvey  
**Scope:** Full stack audit (frontend, backend, dependencies, architecture)

---

## 1. PROJECT OVERVIEW

**Type:** Full-stack SPA (Single Page App) + Supabase edge functions  
**Scale:** 1,094 files, ~51.5k lines of TypeScript/React code  
**Framework:** React 18 + Vite + TypeScript  
**Deployment:** Currently Lovable → Moving to Vercel  
**Backend:** Supabase (PostgreSQL, edge functions, auth, storage)  

---

## 2. ARCHITECTURE

### Frontend Stack
```
React 18 (SPA)
├── Vite (bundler, dev server)
├── TypeScript 5.8
├── React Router v7 (navigation)
├── Tailwind CSS 3.4 + shadcn/ui (Radix primitives)
├── Zustand (state management)
├── React Query v5 (server state, caching)
├── React Hook Form (forms)
├── Framer Motion (animations)
├── Three.js + React Three Fiber (3D orbs)
└── ElevenLabs (TTS/STT for voice mode)
```

### Backend Stack
```
Supabase (tsvfsbluyuaajqmkpzdv)
├── PostgreSQL (database)
├── Edge Functions (TypeScript serverless)
│   ├── aurora-chat (main AI coaching)
│   ├── aurora-analyze (pillar assessment)
│   ├── aurora-proactive (notifications)
│   ├── aurora-generate-title (content generation)
│   ├── elevenlabs-transcribe (voice)
│   ├── web3auth-exchange (wallet connect)
│   ├── push-notifications
│   └── submit-lead
├── Auth (Google, Apple OAuth)
├── Storage (file uploads)
└── Realtime (websocket events)
```

---

## 3. CRITICAL ISSUES

### 🔴 High Priority

#### 1. **Lovable Dependency** (BLOCKER)
- **Package:** `@lovable.dev/cloud-auth-js@0.0.3`
- **Used in:** `src/integrations/lovable/index.ts` + `src/components/onboarding/OnboardingIntro.tsx`
- **Problem:** OAuth initialization tied to Lovable's service
- **Solution:** Replace with native Supabase OAuth

#### 2. **Security Vulnerabilities**
- **32 total:** 19 low, 4 moderate, 8 high, 1 critical
- **Critical:** elliptic (Web3Auth dependency)
- **Fix:** `npm audit fix` available

#### 3. **Zero Tests**
- No unit/integration tests across 1,094 files
- High refactor risk

#### 4. **Build Issues**
- Three.js peer dependency mismatch
- npm install times out in constrained environments

---

## 4. WHAT'S WORKING WELL

✅ Architecture: Clean separation, 13 context providers  
✅ Supabase: 25 edge functions, solid auth setup  
✅ UI/UX: shadcn/ui + Framer Motion polish  
✅ Type coverage: ~90% TypeScript  
✅ PWA: Installable with service worker  
✅ i18n: Hebrew + English built-in  
✅ Product spec: Frozen & documented  

---

## 5. IMMEDIATE ACTION ITEMS

### Lovable Removal (2-3 hours)
1. Replace `@lovable.dev/cloud-auth-js` with native Supabase OAuth
2. Remove lovable-tagger from package.json & vite.config.ts
3. Update OnboardingIntro.tsx to use supabase.auth directly
4. Delete `.lovable/` directory
5. Test Google + Apple OAuth

### Build Fixes (1-2 hours)
6. Fix Three.js peer dependency conflict
7. Ensure @vitejs/plugin-react-swc included
8. Test full build

### Vercel Deploy (1 hour)
9. Push changes to GitHub
10. Deploy to Vercel (auto via webhook)
11. Configure OAuth redirect URIs for new domain

---

## 6. FILE BREAKDOWN

**51.5k LOC across:**
- 118 pages
- 400+ components (52 subdirectories)
- 134 custom hooks
- 13 context providers
- 40+ utility modules
- 25 Supabase edge functions

**Largest component directories:**
- admin/ (696 KB)
- careers/ (540 KB)
- dashboard/ (404 KB)
- journeys/ (340 KB)

---

Generated: 2026-03-24 03:30 UTC
