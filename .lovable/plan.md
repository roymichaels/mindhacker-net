
# Deep Verification Audit: Triggers, Indexes, Stripe, and Gating

---

## Prompt A: DB Trigger Forensics

### All Active Triggers (public schema)

| Table | Trigger Name | Timing | Event | Function | Writes To |
|-------|-------------|--------|-------|----------|-----------|
| `action_items` | `trg_action_item_completion` | BEFORE | UPDATE | `handle_action_item_completion()` | `xp_events` (via `award_unified_xp`), `profiles` (tokens) |
| `action_items` | `update_action_items_updated_at` | BEFORE | UPDATE | `update_updated_at_column()` | self |
| `admin_notifications` | `trg_fanout_admin_notifications_to_users` | AFTER | INSERT | `fanout_admin_notifications_to_users()` | `user_notifications` |
| `affiliate_referrals` | `on_referral_status_change` | AFTER | UPDATE | `update_affiliate_earnings()` | `affiliates` |
| `aurora_proactive_queue` | `bridge_proactive_to_notification_trigger` | AFTER | INSERT | `bridge_proactive_to_notification()` | `user_notifications` |
| `bookings` | `check_booking_status` | BEFORE | INSERT/UPDATE | `validate_booking_status()` | none (validation only) |
| `community_comments` | `trigger_update_stats_on_comment` | AFTER | INSERT | `update_community_member_stats()` | `community_members`, `community_point_logs`, `community_posts` |
| `community_likes` | `trigger_update_stats_on_like` | AFTER | INSERT | `update_community_member_stats()` | `community_members`, `community_posts`, `community_comments` |
| `community_posts` | `trigger_update_stats_on_post` | AFTER | INSERT | `update_community_member_stats()` | `community_members`, `community_point_logs` |
| ~25 tables | `update_*_updated_at` | BEFORE | UPDATE | `update_updated_at_column()` | self |

### Key Confirmation: Proactive Pipeline

**YES** -- `bridge_proactive_to_notification` IS attached to `aurora_proactive_queue` (AFTER INSERT).

It inserts into `user_notifications` with:
- `type = 'aurora_coaching'`
- `link = '/aurora'`
- metadata containing `proactive_id`, `trigger_type`, `priority`

It does **NOT** call `push-notifications` edge function. Push notifications are a separate system not triggered by this pipeline.

### Cron Jobs

| Job ID | Schedule | Target | Purpose |
|--------|----------|--------|---------|
| 1 | `0 */3 * * *` (every 3 hours) | `aurora-proactive` edge function | Batch analyze users for proactive coaching nudges |

---

## Prompt B: Index and Performance Audit

### Current Indexes

| Table | Index | Definition |
|-------|-------|-----------|
| `action_items` | `action_items_pkey` | btree(id) |
| `action_items` | `idx_action_items_parent` | btree(parent_id) WHERE parent_id IS NOT NULL |
| `action_items` | `idx_action_items_plan` | btree(plan_id) WHERE plan_id IS NOT NULL |
| `action_items` | `idx_action_items_recurrence` | btree(user_id, recurrence_rule) WHERE recurrence_rule IS NOT NULL |
| `action_items` | `idx_action_items_user_due` | btree(user_id, due_at) WHERE due_at IS NOT NULL |
| `action_items` | `idx_action_items_user_type_status` | btree(user_id, type, status) |
| `conversations` | `conversations_pkey` | btree(id) |
| `conversations` | `idx_conversations_last_message` | btree(last_message_at DESC) |
| `conversations` | `idx_conversations_participant_1` | btree(participant_1) |
| `conversations` | `idx_conversations_participant_2` | btree(participant_2) |
| `conversations` | `unique_direct_conversation` | btree(participant_1, participant_2) |
| `daily_message_counts` | PK | btree(user_id, message_date) |
| `messages` | `messages_pkey` | btree(id) |
| `messages` | `idx_messages_conversation` | btree(conversation_id) |
| `messages` | `idx_messages_created` | btree(created_at DESC) |
| `profiles` | `profiles_pkey` | btree(id) |
| `user_notifications` | `user_notifications_pkey` | btree(id) |
| `user_notifications` | `idx_user_notifications_user_id` | btree(user_id) |
| `user_notifications` | `idx_user_notifications_is_read` | btree(is_read) |
| `user_notifications` | `idx_user_notifications_created_at` | btree(created_at DESC) |
| `xp_events` | `xp_events_pkey` | btree(id) |
| `xp_events` | `idx_xp_events_user_date` | btree(user_id, created_at DESC) |
| `xp_events` | `idx_xp_events_source` | btree(source) |
| `xp_events` | `idx_xp_events_idempotency` | UNIQUE btree(idempotency_key) WHERE NOT NULL |

### Missing Indexes (Recommended)

The hottest query patterns found in the codebase:

1. **`action_items` filtered by `user_id + status`** (in `actionItems.ts:getTodayTasks`) -- COVERED by `idx_action_items_user_type_status`
2. **`action_items` filtered by `user_id + type = 'habit'`** (in `useTodaysHabits.ts`) -- COVERED by same index
3. **`messages` filtered by `conversation_id` ordered by `created_at`** -- COVERED by `idx_messages_conversation` (sort on created_at could be added)
4. **`user_notifications` filtered by `user_id + is_read`** -- Needs composite index

```sql
-- Recommended missing indexes:

-- 1. Composite for notification queries (user + unread filter)
CREATE INDEX idx_user_notifications_user_unread 
ON public.user_notifications (user_id, is_read, created_at DESC);

-- 2. Messages: conversation + order (composite for common query pattern)
CREATE INDEX idx_messages_conversation_ordered 
ON public.messages (conversation_id, created_at ASC);

-- 3. Profiles: missing index on subscription_tier for gating queries
CREATE INDEX idx_profiles_subscription_tier 
ON public.profiles (subscription_tier) WHERE subscription_tier IS NOT NULL;
```

**Overall index coverage: GOOD.** The `action_items` table is well-indexed. Main gap is `user_notifications` composite and `messages` ordered composite.

---

## Prompt C: Stripe Subscription Architecture Verification

### **NO STRIPE WEBHOOK EXISTS.**

There is no `supabase/functions/stripe-webhook/` directory. No file in the codebase references "stripe-webhook".

### Current Stripe Architecture

Three edge functions exist:
- `create-checkout-session/` -- Creates Stripe Checkout with 7-day trial
- `check-subscription/` -- Queries Stripe API directly for active/trialing subscriptions by email
- `customer-portal/` -- Creates Stripe billing portal session

### Canonical Subscription Truth

Currently: **Stripe is the single source of truth.** `check-subscription` queries Stripe directly every time. The `user_subscriptions` table exists but is **NOT being written to** by any function or webhook.

This is problematic because:
- Every page load makes a Stripe API call
- No webhook means subscription changes (cancellation, payment failure) are only detected when the user opens the app
- `user_subscriptions.stripe_customer_id` and `stripe_subscription_id` columns exist but are always NULL

### Required: `stripe-webhook` Edge Function

Must handle these events:
1. `checkout.session.completed` -- Create/update `user_subscriptions`, set `profiles.subscription_tier = 'pro'`
2. `customer.subscription.updated` -- Update status, `current_period_end`, `cancel_at_period_end`
3. `customer.subscription.deleted` -- Set tier back to `'free'`, deactivate subscription
4. `invoice.payment_failed` -- Flag subscription as `past_due`

DB columns to use:
- `user_subscriptions`: `user_id`, `tier_id`, `status`, `stripe_customer_id`, `stripe_subscription_id`, `started_at`, `expires_at`
- `profiles`: `subscription_tier` (for fast frontend reads)

---

## Prompt D: Subscription Gate Enforcement Map

### Current State: `useSubscriptionGate` is BUILT but NOT ENFORCED

The hook exists in `src/hooks/useSubscriptionGate.ts` and exposes: `canSendMessage`, `canAccessPlan`, `canAccessHypnosis`, `canAccessNudges`, `maxHabits`, `showUpgradePrompt`.

The `UpgradePromptModal` exists in `src/components/subscription/UpgradePromptModal.tsx`.

**But neither is imported anywhere except `src/pages/Subscriptions.tsx`** (which only reads `isPro`).

### Enforcement Map: Where Gates Must Be Applied

| # | Feature | File Path | Function/Component | Current Status | Recommended Integration |
|---|---------|-----------|-------------------|----------------|------------------------|
| 1 | **Aurora chat send** | `src/components/dashboard/GlobalChatInput.tsx` | `handleSubmit()` | **NOT ENFORCED** | Import `useSubscriptionGate`, check `canSendMessage` before sending, show remaining count, trigger `showUpgradePrompt('aurora')` when limit hit |
| 2 | **Aurora chat send (chat area)** | `src/hooks/aurora/useAuroraChat.tsx` | `sendMessage()` (line 841) | **NOT ENFORCED** | Call `increment_daily_message_count` RPC after successful send; or gate at UI level only |
| 3 | **Plan tab view** | `src/pages/PlanTab.tsx` | `PlanTab` component | **NOT ENFORCED** | Import `useSubscriptionGate`, if `!canAccessPlan` show locked overlay with upgrade CTA |
| 4 | **Life Plan view** | `src/pages/LifePlan.tsx` | `LifePlan` component | **NOT ENFORCED** | Same pattern as PlanTab |
| 5 | **Hypnosis / Power-Up entry** | `src/components/dashboard/HypnosisModal.tsx` | `HypnosisModal` component | **NOT ENFORCED** | Check `canAccessHypnosis` on open, show upgrade prompt if false |
| 6 | **Habit creation** | `src/hooks/aurora/useAuroraChat.tsx` | `createDailyHabit()` (line 183) | **NOT ENFORCED** | Check habit count against `maxHabits` before creating |
| 7 | **Proactive nudge click-through** | `src/components/dashboard/v2/NextActionBanner.tsx` | Banner action buttons | **NOT ENFORCED** | Check `canAccessNudges` before executing action |

### Implementation Plan (5 Highest-Impact Gates)

**Gate 1: Aurora Chat (GlobalChatInput.tsx)**
- Import `useSubscriptionGate`
- In `handleSubmit`: if `!canSendMessage`, call `showUpgradePrompt('aurora')` and return
- After successful send, call `supabase.rpc('increment_daily_message_count', { p_user_id: user.id })`
- Show `messagesRemaining` counter in the input area for free users
- Render `UpgradePromptModal` in the component

**Gate 2: Plan Tab (PlanTab.tsx)**
- Import `useSubscriptionGate`
- If `!canAccessPlan`, render a locked state with blurred content preview and upgrade CTA
- Render `UpgradePromptModal`

**Gate 3: Hypnosis Modal (HypnosisModal.tsx)**
- Import `useSubscriptionGate`
- In the `open` handler or at modal top: if `!canAccessHypnosis`, show upgrade prompt instead of session
- Could allow 1 free trial session, then gate

**Gate 4: Life Plan (LifePlan.tsx)**
- Same pattern as PlanTab -- lock view for free users

**Gate 5: Habit Creation Cap (useAuroraChat.tsx)**
- Before `createDailyHabit`, count existing habits
- If count >= `maxHabits` (3 for free), return false and show toast directing to upgrade

### Technical Notes
- The `increment_daily_message_count` SQL function exists in the DB but is **never called** from any frontend or edge function code
- The `daily_message_counts` table has proper RLS and a composite PK on `(user_id, message_date)`
- The `UpgradePromptModal` component is complete and bilingual but unused outside Subscriptions page
- A `stripe-webhook` edge function must be created before gates are production-ready, otherwise subscription state will lag
