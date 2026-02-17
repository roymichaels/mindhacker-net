

# Stripe Webhook as Source of Truth -- Implementation Plan

## Current State (Problems)

1. **Webhook resolves users only by email** -- scans all auth users via `listUsers()`, which is slow and fragile. Does not use `metadata.user_id` from the checkout session.
2. **`profiles` table has no subscription columns** -- no `subscription_tier` or `is_pro` for fast frontend reads.
3. **`user_subscriptions` table is missing columns** -- no `price_id`, `product_id`, or `cancel_at_period_end`.
4. **`check-subscription` hits Stripe API on every call** -- should read from the DB instead (webhook keeps it current).
5. **`useSubscriptionGate` calls the edge function** -- should read `user_subscriptions` table directly via a simple Supabase query.
6. **`create-checkout-session` is missing `client_reference_id`** -- user resolution in webhook has no reliable fallback.
7. **`STRIPE_WEBHOOK_SECRET` is not configured** -- signature verification silently falls back to parsing raw JSON.
8. **No `invoice.paid` handler** -- only `invoice.payment_failed` is handled.

---

## What Changes

### Step 1: Database Migration

Add columns to `profiles`:
- `subscription_tier TEXT DEFAULT 'free'`
- `stripe_customer_id TEXT`

Add columns to `user_subscriptions`:
- `price_id TEXT`
- `product_id TEXT`
- `cancel_at_period_end BOOLEAN DEFAULT false`

### Step 2: Rewrite `stripe-webhook/index.ts`

Key improvements:
- **User resolution**: Read `metadata.user_id` or `client_reference_id` from checkout session first. Fall back to looking up `profiles.stripe_customer_id`. Final fallback: email lookup via `profiles` table (not `auth.admin.listUsers`).
- **Add `invoice.paid` handler**: Reactivate subscription if it was `past_due`.
- **Write to `profiles`**: Set `subscription_tier = 'pro'` or `'free'` and `stripe_customer_id` on every upsert.
- **Store `price_id`, `product_id`, `cancel_at_period_end`** on `user_subscriptions`.
- **Require signature verification**: Remove the dev fallback that parses raw JSON without verification.

Events handled:
| Event | Action |
|-------|--------|
| `checkout.session.completed` | Resolve user, retrieve subscription, upsert `user_subscriptions`, update `profiles` |
| `customer.subscription.created` | Upsert subscription + update `profiles.subscription_tier` |
| `customer.subscription.updated` | Same (catches plan changes, trial end, renewals) |
| `customer.subscription.deleted` | Mark cancelled, set `profiles.subscription_tier = 'free'` |
| `invoice.paid` | If subscription was `past_due`, reactivate to `active` |
| `invoice.payment_failed` | Set status to `past_due` |

### Step 3: Update `create-checkout-session/index.ts`

- Add `client_reference_id: user.id` to the checkout session creation.
- Keep `metadata: { user_id: user.id }` (already present).

### Step 4: Rewrite `check-subscription/index.ts`

Instead of calling Stripe API, read from the database:

```text
1. Get user from auth token
2. SELECT from user_subscriptions WHERE user_id = X AND status IN ('active','trialing') LIMIT 1
3. Return { subscribed, tier, subscription_end, status }
```

This makes it fast, free (no Stripe API call), and consistent with the webhook as source of truth.

### Step 5: Rewrite `useSubscriptionGate.ts`

Replace the edge function call with a direct Supabase query:

```text
1. Query user_subscriptions where user_id = currentUser AND status IN ('active','trialing')
2. If found with pro product_id -> isPro = true
3. Query daily_message_counts (unchanged)
4. Derive all gate flags from these two queries
```

This eliminates the edge function call entirely for the common case, making page loads faster.

### Step 6: Request `STRIPE_WEBHOOK_SECRET`

Prompt you to add the secret. You will need to:
1. Go to Stripe Dashboard > Developers > Webhooks
2. Create an endpoint pointing to: `https://tsvfsbluyuaajqmkpzdv.supabase.co/functions/v1/stripe-webhook`
3. Subscribe to: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`
4. Copy the signing secret (starts with `whsec_`)
5. Add it as the `STRIPE_WEBHOOK_SECRET` secret in the project

---

## Files Changed

| File | Action |
|------|--------|
| Migration SQL | Add columns to `profiles` and `user_subscriptions` |
| `supabase/functions/stripe-webhook/index.ts` | Rewrite with metadata-based user resolution, `profiles` sync, `invoice.paid` handler |
| `supabase/functions/create-checkout-session/index.ts` | Add `client_reference_id` |
| `supabase/functions/check-subscription/index.ts` | Rewrite to read from DB instead of Stripe API |
| `src/hooks/useSubscriptionGate.ts` | Read from `user_subscriptions` table directly |

## What Does NOT Change

- `customer-portal/index.ts` -- works fine as-is
- `UpgradePromptModal.tsx` -- UI component, no data layer changes
- `ProGateOverlay.tsx` -- UI component, no data layer changes
- `supabase/config.toml` -- already has `verify_jwt = false` for stripe-webhook

