
# Mind OS System Integration & Hardening Plan

## Executive Summary
This plan consolidates the Mind OS platform into a unified, professional system by eliminating redundancies, standardizing patterns, and tightening integration between its core modules (Aurora, Hypnosis, Gamification, Life Model). No new features will be added - this is purely about making existing functionality work as one cohesive machine.

---

## Part 1: Unified Error Handling & Logging

### Problem Identified
- 159+ scattered `console.log` statements across the codebase
- Inconsistent error handling (some use `handleError`, most use raw `console.error`)
- No centralized logging strategy

### Solution

**1.1 Extend `src/lib/debug.ts` to be the single source of truth:**

```text
src/lib/debug.ts
├── debug.log()      - Dev-only logging
├── debug.warn()     - Dev-only warnings  
├── debug.error()    - Always logs + optional error tracking
├── debug.trace()    - Named context tracing (e.g., '[TTS]', '[Aurora]')
└── debug.metric()   - Performance tracking
```

**1.2 Migrate all `console.log` to `debug.log` or `debug.trace`:**
- Files: ~14 files with 159+ console.log statements
- Replace with contextual tracing: `debug.trace('[TTS]', 'Fallback triggered')`

**1.3 Standardize error boundaries:**
- Extend `ErrorBoundary.tsx` to report to `debug.error()` with error ID
- Add recovery hints per route

---

## Part 2: Consolidated Data Loading Architecture

### Problem Identified
- Multiple overlapping hooks fetching similar data:
  - `useUnifiedDashboard` - 8 parallel queries
  - `useDashboard` - 3 queries with realtime
  - `useLifeModel` - 5 queries with realtime
  - `useOnboardingProgress` - 1 query with realtime
  - `useGameState` - 3 queries from context
- 9+ realtime channels subscribed per user session
- Data duplication between hooks

### Solution

**2.1 Create a unified data layer:**

```text
src/contexts/UnifiedDataContext.tsx
├── Single source of truth for user data
├── Centralized query orchestration
├── Shared realtime subscription manager
└── Derived/computed values with memoization
```

**2.2 Consolidate realtime subscriptions:**
- Replace 9 individual channels with 2-3 table-group channels
- Use single channel for `aurora_*` tables with filter by table name

**2.3 Refactor hook hierarchy:**

```text
UnifiedDataContext (loads once, shares everywhere)
├── useGameState() ─────── reads from context
├── useLifeModel() ─────── reads from context  
├── useDashboard() ─────── reads from context
├── useOnboardingProgress() ─ reads from context
└── useUnifiedDashboard() ── thin wrapper, no own queries
```

---

## Part 3: Standardized Toast & Feedback System

### Problem Identified
- 454+ toast calls spread across 41 files
- Inconsistent messaging patterns (some Hebrew, some English, mixed)
- No unified feedback constants

### Solution

**3.1 Create `src/lib/feedback.ts`:**

```text
// Centralized feedback messages
export const FEEDBACK = {
  SUCCESS: {
    TASK_COMPLETED: { he: '✅ המשימה הושלמה!', en: '✅ Task completed!' },
    HABIT_LOGGED: { he: '🔥 הרגל נרשם!', en: '🔥 Habit logged!' },
    // ...
  },
  ERROR: {
    NETWORK: { he: 'שגיאת רשת', en: 'Network error' },
    UNAUTHORIZED: { he: 'אין הרשאה', en: 'Unauthorized' },
    // ...
  }
};

export const showFeedback = (key: string, type: 'success' | 'error') => {
  const msg = FEEDBACK[type.toUpperCase()][key];
  toast[type](language === 'he' ? msg.he : msg.en);
};
```

**3.2 Migrate critical paths to use centralized feedback**

---

## Part 4: Edge Function CORS & Error Standardization

### Problem Identified
- 35 edge functions each define their own `corsHeaders`
- Inconsistent error response formats
- No shared error handling utilities

### Solution

**4.1 Create `supabase/functions/_shared/cors.ts`:**

```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, ...',
};

export const jsonResponse = (data: unknown, status = 200) => 
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

export const errorResponse = (message: string, status = 500) =>
  jsonResponse({ error: message, timestamp: Date.now() }, status);
```

**4.2 Migrate all edge functions to use shared utilities**

---

## Part 5: Query Key Standardization

### Problem Identified
- 205+ `useQuery` calls across 20 hooks
- Inconsistent query key patterns:
  - Some use arrays: `['launchpad-progress', user?.id]`
  - Some use objects: `{ queryKey: ['game-state'] }`
- Risk of cache collisions and stale data

### Solution

**5.1 Create `src/lib/queryKeys.ts`:**

```typescript
export const QUERY_KEYS = {
  // User
  profile: (userId: string) => ['profile', userId] as const,
  gameState: (userId: string) => ['game-state', userId] as const,
  
  // Aurora
  lifeDirection: (userId: string) => ['aurora', 'life-direction', userId] as const,
  identityElements: (userId: string) => ['aurora', 'identity', userId] as const,
  energyPatterns: (userId: string) => ['aurora', 'energy', userId] as const,
  
  // Launchpad
  launchpadProgress: (userId: string) => ['launchpad', 'progress', userId] as const,
  
  // Hypnosis
  hypnosisSessions: (userId: string) => ['hypnosis', 'sessions', userId] as const,
} as const;
```

**5.2 Migrate all queries to use standardized keys**

---

## Part 6: Component State Consolidation

### Problem Identified
- `DashboardLayout.tsx` manages 4 boolean states: `leftSheetOpen`, `settingsOpen`, `hypnosisOpen`, `profileOpen`
- Similar patterns across other layout components
- No unified modal/drawer management

### Solution

**6.1 Create `useModalState` hook:**

```typescript
export function useModalState() {
  const [modals, setModals] = useState<Record<string, boolean>>({});
  
  const open = (id: string) => setModals(prev => ({ ...prev, [id]: true }));
  const close = (id: string) => setModals(prev => ({ ...prev, [id]: false }));
  const toggle = (id: string) => setModals(prev => ({ ...prev, [id]: !prev[id] }));
  const isOpen = (id: string) => modals[id] ?? false;
  
  return { open, close, toggle, isOpen };
}
```

**6.2 Simplify layout components to use unified modal management**

---

## Part 7: Type Safety Improvements

### Problem Identified
- Some `catch` blocks are empty: `catch {}`
- Type assertions without validation: `as Record<string, unknown>`
- Missing null checks before accessing nested properties

### Solution

**7.1 Add explicit error handling to empty catches:**

```typescript
// Before
catch {}

// After  
catch (e) {
  debug.warn('[LocalStorage] Parse failed', e);
}
```

**7.2 Create type guards for common patterns:**

```typescript
// src/lib/typeGuards.ts
export const isNonNull = <T>(value: T | null | undefined): value is T => 
  value !== null && value !== undefined;

export const hasProperty = <T, K extends string>(obj: T, key: K): obj is T & Record<K, unknown> =>
  obj !== null && typeof obj === 'object' && key in obj;
```

---

## Part 8: Cross-Module Data Flow Verification

### Current Integration Points
Based on memory: "Cross-module data synchronization" ensures:
- Hypnosis outcomes feed into Aurora energy patterns
- Aurora Life Model insights inject into hypnosis script generation

### Verification Checklist

| Source | Target | Data Flow | Status |
|--------|--------|-----------|--------|
| `hypnosis_sessions` | `aurora_energy_patterns` | On session complete | Verify trigger |
| `aurora_life_direction` | `generate-hypnosis-script` | Injected via context | Verify prompt |
| `launchpad_progress` | `aurora_onboarding_progress` | On step complete | Verify sync |
| `profiles` (gamification) | All dashboards | Via context | Verify propagation |

**8.1 Audit existing database triggers for completeness**

**8.2 Verify edge functions receive full context**

---

## Part 9: Performance Optimizations

### Identified Bottlenecks

**9.1 Multiple realtime subscriptions:**
- Current: 9+ channels per user
- Target: 3 consolidated channels

**9.2 Redundant queries:**
- `useUnifiedDashboard` duplicates data from other hooks
- Solution: Make it a pure consumer, not fetcher

**9.3 Query stale times:**
- Current: 5 minutes default
- Review per-query needs (some should be shorter, some longer)

---

## Part 10: Code Organization Cleanup

### Files to Consolidate

| Area | Current State | Target |
|------|---------------|--------|
| Aurora hooks | 15 files in `/hooks/aurora/` | Keep, but ensure no overlap |
| Services | 4 files | Add `/services/feedback.ts` |
| Lib utilities | 21 files | Add `/lib/queryKeys.ts`, `/lib/typeGuards.ts` |
| Edge shared | 3 files | Add `cors.ts`, `errorHandling.ts` |

---

## Implementation Order

| Phase | Focus | Files Changed | Risk |
|-------|-------|---------------|------|
| 1 | Debug/logging standardization | 14 files | Low |
| 2 | Query key standardization | 20 files | Low |
| 3 | Edge function CORS consolidation | 35 functions | Low |
| 4 | Toast/feedback centralization | 41 files | Low |
| 5 | Data context consolidation | 8 hooks | Medium |
| 6 | Realtime subscription optimization | 5 hooks | Medium |
| 7 | Type safety improvements | Throughout | Low |

---

## Technical Details

### New Files to Create

```text
src/lib/queryKeys.ts          - Standardized query key factory
src/lib/feedback.ts           - Centralized toast messages
src/lib/typeGuards.ts         - Type safety utilities
src/hooks/useModalState.ts    - Unified modal management
supabase/functions/_shared/cors.ts       - CORS headers
supabase/functions/_shared/responses.ts  - Response utilities
```

### Files to Modify (High Priority)

```text
src/lib/debug.ts                    - Extend with trace/metric
src/contexts/GameStateContext.tsx   - Optimize queries
src/hooks/useUnifiedDashboard.ts    - Convert to consumer
src/components/dashboard/DashboardLayout.tsx - Simplify state
src/components/ErrorBoundary.tsx    - Enhance reporting
```

### Edge Functions to Update (Batch)

All 35 functions in `supabase/functions/` will import shared CORS and response utilities, reducing code duplication by ~200 lines total.

---

## Expected Outcomes

1. **Reduced bundle size** - No duplicate code patterns
2. **Faster debugging** - Unified logging with context tracing
3. **Better performance** - Consolidated queries and realtime
4. **Easier maintenance** - Standardized patterns everywhere
5. **Fewer bugs** - Type guards and proper error handling
6. **Professional codebase** - Consistent, enterprise-grade structure

---

## Summary

This plan transforms Mind OS from a collection of well-functioning features into a single, unified system. Every piece will speak the same language, share the same utilities, and follow the same patterns. The result is a platform that not only works well but is built to scale and maintain professionally.

