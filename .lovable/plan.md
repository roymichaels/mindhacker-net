

# Launch Hardening: Auth/Payment Guard Utilities

## Overview
Create three reusable guard functions that eliminate silent failures across the codebase. No UI redesign, no new features, no DB changes.

## What Gets Created

### `src/lib/guards.ts` -- Three Guard Utilities

**1. `requireAuthOrOpenModal(user, openAuthModal, options)`**

Returns `true` if user is authenticated, otherwise opens the auth modal, logs a FLOW_AUDIT breakpoint, and returns `false`.

```typescript
export function requireAuthOrOpenModal(
  user: User | null,
  openAuthModal: (view?: 'login' | 'signup', onSuccess?: () => void) => void,
  options?: { reason?: string; nextActionName?: string; onSuccess?: () => void }
): boolean {
  if (user?.id) return true;
  
  flowAudit.breakpoint(
    options?.nextActionName ?? 'unknown_cta',
    'session_lost',
    `Auth required for: ${options?.reason ?? 'action'} — opening auth modal`
  );
  openAuthModal('signup', options?.onSuccess);
  return false;
}
```

**2. `requireCheckoutUrlOrToast(result, isHe)`**

Validates checkout response. If URL is present, navigates to it and returns `true`. If missing, shows a toast and logs error. Replaces empty catch blocks and missing-URL silent failures.

```typescript
export function requireCheckoutUrlOrToast(
  result: { data?: { url?: string }; error?: any },
  isHe: boolean
): string | null {
  if (result.error) {
    const msg = result.error.message || 'Checkout failed';
    toast.error(isHe ? 'שגיאה ביצירת תשלום' : msg);
    flowAudit.recordError(`Checkout failed: ${msg}`);
    return null;
  }
  if (!result.data?.url) {
    toast.error(isHe ? 'שגיאה ביצירת תשלום' : 'No checkout URL received');
    flowAudit.recordError('Checkout response missing URL');
    return null;
  }
  flowAudit.markFlag('checkoutUrlReceived', true);
  return result.data.url;
}
```

**3. `safeNavigate(navigate, target, fallback)`**

Wraps `navigate()` with route validation. Logs to FLOW_AUDIT if the target looks suspicious (not in allowed list) and falls back to `/dashboard`.

```typescript
export function safeNavigate(
  navigate: NavigateFunction,
  target: string,
  fallback: string = '/dashboard'
): void {
  const KNOWN_ROUTES = ['/dashboard', '/onboarding', '/messages', '/messages/ai', ...];
  const isKnown = KNOWN_ROUTES.some(r => target === r || target.startsWith(r + '/'));
  if (!isKnown) {
    flowAudit.recordError(`safeNavigate: unknown target "${target}", using fallback "${fallback}"`);
    navigate(fallback, { replace: true });
    return;
  }
  navigate(target);
}
```

## Where Guards Get Applied

### File 1: `src/components/onboarding/OnboardingReveal.tsx`
- **"Start Free" CTA** (line 288-296): Already uses `openAuthModal` -- replace with `requireAuthOrOpenModal` for consistent logging.
- **"Upgrade" CTA** (line 513-530): Wrap checkout result with `requireCheckoutUrlOrToast`. Replace inline `if (data?.url)` and catch block.

### File 2: `src/components/subscription/SubscriptionsModal.tsx`
- **`handleCheckout`** (line 74-101): Replace the toast-only auth check with `requireAuthOrOpenModal`. Replace `window.open(data.url, "_blank")` with `requireCheckoutUrlOrToast` + `window.location.href`.
- **`handleManageSubscription`** (line 103-120): Wrap with `requireCheckoutUrlOrToast` for the portal URL.

### File 3: `src/components/subscription/PromoUpgradeModal.tsx`
- **`handleClaim`** (line 20-39): Replace `window.open(data.url, "_blank")` with `requireCheckoutUrlOrToast` + `window.location.href`.

### File 4: `src/components/dashboard/RecalibrateModal.tsx`
- **`handleSubmit`** (line 260): Currently `if (!user?.id) return;` -- replace with `requireAuthOrOpenModal`.

### File 5: `src/components/launchpad/steps/IntrospectionStep.tsx`
- **`handleSubmit`** (line 256): Currently `if (!user?.id) return;` -- replace with `requireAuthOrOpenModal`.

## Diff Summary

| File | Change |
|------|--------|
| `src/lib/guards.ts` | **NEW** -- 3 guard functions (~60 lines) |
| `src/components/onboarding/OnboardingReveal.tsx` | Replace inline auth check with `requireAuthOrOpenModal`; wrap checkout with `requireCheckoutUrlOrToast` |
| `src/components/subscription/SubscriptionsModal.tsx` | Replace toast-only auth check with `requireAuthOrOpenModal`; wrap checkout with `requireCheckoutUrlOrToast`; change `window.open` to `window.location.href` |
| `src/components/subscription/PromoUpgradeModal.tsx` | Wrap checkout with `requireCheckoutUrlOrToast`; change `window.open` to `window.location.href` |
| `src/components/dashboard/RecalibrateModal.tsx` | Replace silent `return` with `requireAuthOrOpenModal` |
| `src/components/launchpad/steps/IntrospectionStep.tsx` | Replace silent `return` with `requireAuthOrOpenModal` |

## Risk Assessment
- **LOW** for all changes. Each guard replaces an existing pattern (silent return or empty catch) with a user-visible fallback + logging. No control flow or rendering logic is altered beyond the early-return points.
