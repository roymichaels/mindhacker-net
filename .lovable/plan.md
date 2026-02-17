

# Monetization Simplification: Free + Pro + Upsell

## Current State

**What exists today:**
- 3 subscription tiers in the database: "התחלה" (199 ILS/mo), "התמרה" (399 ILS/mo), "שינוי" (799 ILS/mo) -- confusing, unsold
- A mock payment system (no real Stripe integration) -- `SubscriptionCheckoutDialog` literally says "this is a demo, no real payment"
- No feature gating based on subscription status -- everyone gets everything
- No Aurora message limits -- unlimited for all users
- A 4-tier progression system (Clarity/Structure/Consistency/Mastery) that gates features by XP level, not payment
- Existing `purchases` table for one-off products (hypnosis, coaching sessions)
- Existing `offers` table for landing pages (Personal Hypnosis at 297 ILS, Consciousness Leap at 1,997 ILS)
- The `/subscriptions` page shows a static 97 ILS/month card with a "coming soon" toast

**The problem:** Three confusing tiers, no real payments, no feature gating. Users get everything for free so there's no reason to pay.

---

## The New Model

```
Free (default)
  - Consciousness Journey (onboarding)
  - Limited Aurora: 5 messages/day
  - Today tab: see next action, habits (max 3)
  - No 90-day plan engine
  - No proactive nudges
  - No hypnosis

Pro (97 ILS / $27 per month - Stripe subscription)
  - Unlimited Aurora messages
  - Full 90-day plan engine
  - Proactive coaching nudges
  - Hypnosis library (weekly allowance: 3 sessions/week)
  - Unlimited habits and checklists
  - All pillar hubs unlocked

Upsell (one-off purchases - keep existing offers)
  - Personal Hypnosis Video (297 ILS) -- already exists
  - Consciousness Leap 4-session package (1,997 ILS) -- already exists
  - Coach session marketplace -- future
```

---

## Implementation

### Phase 1: Stripe Integration + Subscription Infrastructure

**Enable Stripe** using the Lovable Stripe integration tool. This creates the real payment flow.

**Database changes:**
- Simplify `subscription_tiers` to 2 rows: "Free" (price 0) and "Pro" (price 97 ILS / 27 USD)
- Deactivate the 3 existing tiers (199/399/799)
- Add `aurora_daily_message_limit INTEGER DEFAULT 5` to the Free tier config
- Add `stripe_customer_id TEXT` and `stripe_subscription_id TEXT` columns to `user_subscriptions`
- Add a `subscription_status` computed field or view that combines Stripe status with local status

**New edge function:** `stripe-webhook` to handle `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted` events. On successful payment, upsert `user_subscriptions` with `status = 'active'`.

**New edge function:** `create-checkout-session` that creates a Stripe Checkout session for the Pro plan. Returns the Stripe URL for redirect.

### Phase 2: Feature Gating Hook

**New file:** `src/hooks/useSubscriptionGate.ts`

This is the single source of truth for "can this user do X?"

```
useSubscriptionGate() returns:
  - tier: 'free' | 'pro'
  - isPro: boolean
  - canSendMessage: boolean (checks daily count)
  - messagesRemaining: number
  - canAccessPlan: boolean
  - canAccessHypnosis: boolean
  - canAccessNudges: boolean
  - maxHabits: number (3 for free, unlimited for pro)
  - showUpgradePrompt: (feature: string) => void
```

**How it works:**
- Queries `user_subscriptions` joined with `subscription_tiers` for the current user
- If no active subscription or tier is Free: apply limits
- Caches result in React Query with 5-minute stale time
- Exposes a `showUpgradePrompt(feature)` that opens a modal pointing to the Pro plan

**Daily message counting:**
- Add a lightweight counter: query `aurora_conversations_messages` for today's user messages
- Or add a `daily_message_counts` table (user_id, date, count) updated by the aurora-chat edge function
- Free tier: 5 messages/day. Pro: unlimited.

### Phase 3: Apply Gates to UI

**Aurora chat (`useAuroraChat.tsx`):**
- Before sending a message, check `canSendMessage` from `useSubscriptionGate`
- If limit reached, show upgrade prompt instead of sending
- Display remaining messages counter in the chat input area for free users

**Today tab (`TodayTab.tsx`):**
- Free: show max 3 habits in `TodaysHabitsCard`, with a "Unlock more with Pro" card after
- Pro: show all habits

**Plan tab (`PlanTab.tsx`):**
- Free: show `PlanProgressHero` in a locked/blurred state with "Unlock your 90-day plan" CTA
- Pro: full access

**Hypnosis (`HypnosisModal`):**
- Free: locked entirely, shows upgrade prompt
- Pro: 3 sessions/week allowance

**Proactive nudges (`aurora-proactive` edge function):**
- Skip free users entirely (don't generate nudges for them)
- Only process users with active Pro subscriptions

### Phase 4: Upgrade Flow

**Replace `/subscriptions` page** with a clean single-offer page:
- Hero: "Unlock your full transformation" (outcome-focused, not feature-focused)
- Single Pro card at 97 ILS/month ($27)
- "Start 7-day free trial" button (Stripe trial period)
- Social proof section
- FAQ section (keep existing, update content)
- Click CTA -> Stripe Checkout -> redirect back to `/today` on success

**Upgrade prompt modal** (`UpgradePromptModal.tsx`):
- Triggered by `showUpgradePrompt(feature)` from the gate hook
- Shows: "You've used your 5 daily Aurora messages" or "90-day planning is a Pro feature"
- Single CTA: "Upgrade to Pro" -> navigates to `/subscriptions` or opens Stripe Checkout directly

### Phase 5: Existing Upsells (Keep As-Is)

The existing offers system (Personal Hypnosis at 297 ILS, Consciousness Leap at 1,997 ILS) stays unchanged. These are already well-built landing pages with their own checkout flows. They complement Pro as upsells, not competitors.

---

## Technical Details

### Files to Create
1. `src/hooks/useSubscriptionGate.ts` -- Central feature gating hook
2. `src/components/subscription/UpgradePromptModal.tsx` -- Reusable upgrade modal
3. `supabase/functions/create-checkout-session/index.ts` -- Stripe checkout session creator
4. `supabase/functions/stripe-webhook/index.ts` -- Stripe webhook handler

### Files to Modify
1. `src/pages/Subscriptions.tsx` -- Rebuild as single Pro offer page with Stripe checkout
2. `src/hooks/aurora/useAuroraChat.tsx` -- Add message limit check before sending
3. `src/pages/TodayTab.tsx` -- Gate habits count for free users
4. `src/pages/PlanTab.tsx` -- Lock plan engine for free users
5. `src/components/dashboard/HypnosisModal.tsx` -- Gate behind Pro
6. `supabase/functions/aurora-chat/index.ts` -- Track daily message count, enforce limit
7. `supabase/functions/aurora-proactive/index.ts` -- Skip free users
8. `src/components/checkout/SubscriptionCheckoutDialog.tsx` -- Replace mock with Stripe redirect

### Database Migrations
1. Deactivate existing 3 tiers, insert "Free" and "Pro" tiers
2. Add `stripe_customer_id`, `stripe_subscription_id` to `user_subscriptions`
3. Create `daily_message_counts` table: `(user_id UUID, message_date DATE, count INTEGER, PRIMARY KEY(user_id, message_date))`
4. RLS: users can read their own subscription and message counts

### Implementation Order
1. Enable Stripe integration (requires user to provide Stripe secret key)
2. Database migration (simplify tiers, add Stripe columns, message counts table)
3. Stripe edge functions (checkout session + webhook)
4. `useSubscriptionGate` hook
5. `UpgradePromptModal` component
6. Apply gates to Aurora chat (highest impact -- users hit this first)
7. Apply gates to Plan, Hypnosis, Habits
8. Rebuild `/subscriptions` page
9. Update proactive function to skip free users

