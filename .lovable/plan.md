

# Critical Path Flow Auditor for Mind OS

## Overview
A diagnostic utility that passively monitors and logs every state transition in the onboarding-to-dashboard critical path. Activated only when `localStorage.FLOW_AUDIT = "true"`. Zero UI changes, zero schema changes, zero architecture changes.

## What Gets Created

### 1. `src/lib/flowAudit.ts` — Core Audit Logger
A singleton utility that:
- Checks `localStorage.getItem('FLOW_AUDIT') === 'true'` on init; no-ops if disabled
- Exposes a typed API for logging categorized events under a `[FLOW_AUDIT]` console group
- Detects and flags state inconsistencies automatically

**Event categories logged:**
| Category | Data Logged |
|---|---|
| `route` | `from`, `to`, timestamp |
| `auth` | user id (truncated), session exists, event type (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.) |
| `subscription` | tier, isPro, isLoading, subscriptionEnd |
| `launchpad` | currentStep, isComplete, isLoading |
| `gamestate` | level, tokens, loading, error |
| `redirect` | from, to, reason |
| `context` | contextName, event (mount/unmount) |

**Breakpoint detection rules:**
- `redirect_loop`: same route transition logged more than 3 times within 5 seconds
- `session_lost`: auth state goes from authenticated to null without explicit sign-out
- `subscription_race`: subscription data accessed while still loading
- `context_hydration_race`: route renders before a required context finishes loading
- `guest_migration_conflict`: user present but launchpad progress query returns null/error
- `double_provider_mount`: same context mount logged twice without an unmount in between

### 2. `src/components/FlowAuditProvider.tsx` — Route + Context Monitor
A thin React component placed inside `BrowserRouter` (in `App.tsx`) that:
- Uses `useLocation()` to log every route transition
- Subscribes to `supabase.auth.onAuthStateChange` to log auth events
- Logs its own mount/unmount as a canary for provider stability
- Only renders children; adds zero DOM elements

### 3. Instrumentation Points (minimal, read-only patches)
Small logging calls added to existing files — no logic changes:

| File | What's Added |
|---|---|
| `src/contexts/AuthContext.tsx` | Log auth state changes and mount/unmount |
| `src/contexts/GameStateContext.tsx` | Log hydration status on load complete and mount/unmount |
| `src/hooks/useLaunchpadProgress.ts` | Log progress state when query resolves |
| `src/hooks/useSubscriptionGate.ts` | Log subscription tier when query resolves |
| `src/components/ProtectedRoute.tsx` | Log redirect decisions (why auth modal shown, why redirect to `/`) |
| `src/pages/Go.tsx` | Log entry and CTA click |
| `src/pages/Index.tsx` | Log redirect decision for logged-in users |
| `src/components/dashboard/DashboardLayoutWrapper.tsx` | Log sidebar gating decision |

Each instrumentation is a single `flowAudit.log(...)` call guarded by the localStorage check — effectively zero-cost when disabled.

## Technical Details

### `flowAudit` API (src/lib/flowAudit.ts)

```typescript
const flowAudit = {
  isEnabled(): boolean,
  route(from: string, to: string): void,
  auth(event: string, userId?: string, hasSession?: boolean): void,
  subscription(data: { tier, isPro, isLoading }): void,
  launchpad(data: { currentStep, isComplete, isLoading }): void,
  gamestate(data: { level, tokens, loading, error }): void,
  redirect(from: string, to: string, reason: string): void,
  context(name: string, event: 'mount' | 'unmount'): void,
  breakpoint(location: string, category: string, detail: string): void,
}
```

All methods are no-ops when `localStorage.FLOW_AUDIT` is not `"true"`.

### Console Output Format

```
[FLOW_AUDIT] ──── Route: /go → /onboarding ────
  Auth: anonymous | Session: none
  Subscription: free | Loading: false
  Launchpad: step 1 | Complete: false
  Redirect: none

[FLOW_AUDIT] ⚠ BREAKPOINT DETECTED
  Location: ProtectedRoute
  Category: session_lost
  Detail: Session was present, now null. No SIGNED_OUT event received.
```

### Integration in App.tsx
`FlowAuditProvider` is added as a direct child of `<BrowserRouter>`, before `<AffiliateTracker>`. It renders no DOM and passes children through.

### Files Created
- `src/lib/flowAudit.ts`
- `src/components/FlowAuditProvider.tsx`

### Files Modified (logging calls only)
- `src/App.tsx` — add `<FlowAuditProvider>` inside BrowserRouter
- `src/contexts/AuthContext.tsx` — 3 log calls
- `src/contexts/GameStateContext.tsx` — 2 log calls
- `src/hooks/useLaunchpadProgress.ts` — 1 log call
- `src/hooks/useSubscriptionGate.ts` — 1 log call
- `src/components/ProtectedRoute.tsx` — 2 log calls
- `src/pages/Go.tsx` — 2 log calls
- `src/pages/Index.tsx` — 1 log call
- `src/components/dashboard/DashboardLayoutWrapper.tsx` — 1 log call

### How to Use
1. Open browser console
2. Run: `localStorage.FLOW_AUDIT = "true"`
3. Refresh the page
4. Walk through any critical path
5. Review `[FLOW_AUDIT]` logs for breakpoints
6. To disable: `localStorage.removeItem('FLOW_AUDIT')`

