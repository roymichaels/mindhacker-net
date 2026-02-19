

# Stripe Flow Verification

## Verification Checklist

### 1. Environment Key Safety
**Status: NEEDS FIX**
Currently, no code on either client or server asserts test-mode keys. The edge function blindly reads `STRIPE_SECRET_KEY` without checking the prefix.

**Fix:** Add a startup guard at the top of `create-checkout-session/index.ts` that logs a loud warning if `STRIPE_SECRET_KEY` starts with `sk_live`. This is a console warning only -- it does not block the request, since the actual key management is the operator's responsibility, but it makes accidental live-key usage visible in edge function logs.

```typescript
const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
if (stripeKey.startsWith("sk_live")) {
  console.warn("[STRIPE SAFETY] LIVE secret key detected in create-checkout-session. Ensure this is intentional.");
}
```

### 2. Return URLs (success_url / cancel_url)
**Status: CORRECT -- no changes needed**
- `success_url` is already set to `${origin}/success?checkout=success&session_id={CHECKOUT_SESSION_ID}` (line 62)
- `cancel_url` is already set to `${origin}/dashboard` (line 63)
- `origin` falls back to the published URL `https://mind-os-space.lovable.app` (line 54)

These are correct per the plan's memory notes.

### 3. /success Page Session Verification
**Status: NEEDS FIX**
The `/success` page (`src/pages/Success.tsx`) currently only handles `purchaseId` (legacy one-off purchases). When Stripe redirects back with `?checkout=success&session_id=cs_xxx`, the page shows "Welcome" with no purchase ID and a button to dashboard -- functional but not optimal. It does NOT verify the Stripe session status.

**Fix:** Add a `useEffect` branch that detects the `checkout=success` + `session_id` params, shows a subscription-specific success message, fires the conversion tracking event, and auto-redirects to `/dashboard` after a short delay. No new edge function needed -- the subscription status is already verified by the existing `check-subscription` function that runs on dashboard load.

## Files Changed

### File 1: `supabase/functions/create-checkout-session/index.ts`
- Add a `console.warn` if `STRIPE_SECRET_KEY` starts with `sk_live` (safety guard, 3 lines, before the `serve()` handler or inside the try block after reading the key).

### File 2: `src/pages/Success.tsx`
- Read `checkout` and `session_id` from search params (already has `useSearchParams`).
- When `checkout === 'success'` and `session_id` is present, render a subscription-confirmed card (reusing existing Card components) instead of the "no purchaseId" fallback.
- Fire `trackPurchase()` from `useConversionEvents` on mount for this branch.
- Auto-navigate to `/dashboard` after 4 seconds via `setTimeout`.
- Log `flowAudit.markFlag('reachedDashboard', true)` before navigation.

### No changes needed:
- `create-checkout-session` URLs are already correct.
- DB schema unchanged.
- No UI redesign -- reuses existing Card/Button components with different text.

## Summary Checklist

| Check | Status | Action |
|-------|--------|--------|
| sk_test/sk_live warning in edge function | NEEDS FIX | Add console.warn guard |
| success_url includes session_id | ALREADY CORRECT | None |
| cancel_url points to /dashboard | ALREADY CORRECT | None |
| /success reads session_id | NEEDS FIX | Add checkout-success branch |
| /success verifies session status | NEEDS FIX | Show confirmation + route to dashboard (actual sub verification happens via check-subscription on dashboard load) |
| Conversion event fires on success | NEEDS FIX | Add trackPurchase() call |

## Risk
LOW -- One edge function log line added; one new conditional branch in Success.tsx using existing components.
