

# Golden Flow Audit Runner

## Overview
Extend the existing `flowAudit.ts` singleton with scenario-aware tracking and a PASS/FAIL summary system. No UI changes, no DB changes, no new features -- just structured diagnostic output layered onto the existing instrumentation.

## How It Works

The user activates a scenario via the browser console:

```javascript
localStorage.FLOW_AUDIT = "true";
localStorage.FLOW_AUDIT_SCENARIO = "free_anon"; // or paid_anon, returning_user, coach_storefront
```

Then walks the flow. At any time, they call `flowAudit.summary()` in the console to get a structured PASS/FAIL report. A 60-second auto-timeout also prints the summary automatically if the scenario hasn't completed.

## Changes

### File 1: `src/lib/flowAudit.ts`

Add scenario tracking on top of the existing class (no existing methods changed):

**New types:**
```typescript
type ScenarioId = 'free_anon' | 'paid_anon' | 'returning_user' | 'coach_storefront';

interface ScenarioSummary {
  scenario: ScenarioId | null;
  reachedDashboard: boolean;
  onboardingSaved: boolean;
  authStateStable: boolean;
  subscriptionResolved: boolean;
  xpChangedOnFirstAction: boolean;
  errors: string[];
  pass: boolean;
}
```

**New private state** (added to the class):
- `activeScenario: ScenarioId | null` -- read from `localStorage.FLOW_AUDIT_SCENARIO`
- `scenarioErrors: string[]` -- accumulated error strings
- `flags` object tracking: `reachedDashboard`, `onboardingSaved`, `authStateStable`, `subscriptionResolved`, `xpChangedOnFirstAction`, `authModalOpened`, `checkoutUrlReceived`, `initialXp`
- `scenarioTimer` -- 60s auto-summary timeout

**New methods:**
- `startScenario()` -- reads localStorage, resets flags, starts timer. Called automatically on first `isEnabled()` check.
- `summary(): ScenarioSummary` -- evaluates all flags, prints a formatted PASS/FAIL table, returns the object. Also exposed on `window.__flowAudit` for console access.
- `markFlag(key, value)` -- internal helper to set boolean flags
- `recordError(msg)` -- pushes to `scenarioErrors[]`

**Modifications to existing methods** (logging additions only, no logic changes):
- `route()` -- when `to === '/dashboard'`, set `reachedDashboard = true`. When scenario is `returning_user` and route goes `/dashboard -> /onboarding`, record error "Onboarding loop detected for returning user".
- `auth()` -- track `authStateStable` (set false on `session_lost` breakpoint). Track auth modal opening.
- `subscription()` -- when `isLoading === false` and `tier` is defined, set `subscriptionResolved = true`. If `isLoading` stays true for 10s+, record error "Subscription loading stuck".
- `launchpad()` -- when `isComplete === true`, set `onboardingSaved = true`.
- `gamestate()` -- capture `initialXp` on first call. On subsequent calls, if XP changed, set `xpChangedOnFirstAction = true`.
- `breakpoint()` -- also push to `scenarioErrors[]`.

**New detections** (added inside existing methods):
- `redirect()` -- if `to` contains `/aurora` and no `/aurora` route exists (detected via `missing_route_target` in breakpoints), record error.
- `auth()` -- if scenario requires auth (`free_anon`, `paid_anon`) and no `SIGNED_IN` event received after 30s, record error "Auth modal may not have opened".

**Console access:**
```typescript
// At the bottom of the file
if (typeof window !== 'undefined') {
  (window as any).__flowAudit = flowAudit;
}
```

### File 2: `src/components/FlowAuditProvider.tsx`

Add one line in the mount effect to call `flowAudit.startScenario()` which reads the localStorage scenario key. No other changes.

### File 3: `src/components/onboarding/OnboardingReveal.tsx`

Add two `flowAudit` calls (logging only):
- After `openAuthModal` is called for anonymous users: `flowAudit.markFlag('authModalOpened', true)`
- After checkout URL is received: `flowAudit.markFlag('checkoutUrlReceived', true)`

### File 4: `src/hooks/useSubscriptionGate.ts`

Add a stuck-loading detection: if `subLoading` has been true for 10+ seconds, call `flowAudit.recordError('Subscription loading stuck > 10s')`. This is a ref-based timer alongside the existing `flowAudit.subscription()` call.

## Summary Output Format

When `flowAudit.summary()` is called (or auto-fires at 60s):

```
[FLOW_AUDIT] ═══ GOLDEN FLOW SUMMARY ═══
  Scenario:             free_anon
  Reached Dashboard:    PASS
  Onboarding Saved:     PASS
  Auth State Stable:    PASS
  Subscription Resolved: PASS
  XP Changed on Action: FAIL
  Errors (1):
    - xpChangedOnFirstAction never triggered
  ─────────────────────────
  RESULT: FAIL
═════════════════════════════
```

## PASS/FAIL Logic Per Scenario

| Check | free_anon | paid_anon | returning_user | coach_storefront |
|-------|-----------|-----------|----------------|------------------|
| reachedDashboard | Required | Required | Required | Required |
| onboardingSaved | Required | Required | Skip (already done) | Skip |
| authStateStable | Required | Required | Required | Required |
| subscriptionResolved | Required | Required (must be paid tier) | Required | Skip |
| xpChangedOnFirstAction | Required | Optional | Required | Skip |

## Files Changed Summary

| File | What's Added |
|------|-------------|
| `src/lib/flowAudit.ts` | ScenarioId type, ScenarioSummary interface, scenario state fields, `startScenario()`, `summary()`, `markFlag()`, `recordError()`, flag-setting inside existing methods, `window.__flowAudit` export |
| `src/components/FlowAuditProvider.tsx` | One `flowAudit.startScenario()` call in mount effect |
| `src/components/onboarding/OnboardingReveal.tsx` | Two `flowAudit.markFlag()` calls (auth modal opened, checkout URL received) |
| `src/hooks/useSubscriptionGate.ts` | Stuck-loading timer detection (ref-based, alongside existing audit call) |

## Risk Assessment
- **LOW** across all changes. Only logging/diagnostic code is added. No control flow, no rendering, no DB queries modified.

