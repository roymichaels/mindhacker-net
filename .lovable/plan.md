

# 4-Tier Subscription Restructure

## Overview
Replacing the current Free + Pro ($27) model with a 4-tier system: **Free**, **Pro ($49/mo)**, **Coach ($79/mo)**, and **Business ($129/mo)**.

---

## Tier Breakdown

| Feature | Free | Pro $49/mo | Coach $79/mo | Business $129/mo |
|---------|------|-----------|--------------|-----------------|
| Onboarding / Launchpad | Yes | Yes | Yes | Yes |
| 90-Day Plan | Yes (free) | Yes | Yes | Yes |
| Dashboard | Yes | Yes | Yes | Yes |
| Aurora messages | 5/day | Unlimited | Unlimited | Unlimited |
| AI Hypnosis | No | 1x/day (personalized) | 1x/day | 1x/day |
| Proactive nudges | No | Yes | Yes | Yes |
| Unlimited habits | No (3 max) | Unlimited | Unlimited | Unlimited |
| Become a Coach | No | No | Yes | Yes |
| Coach AI Plan Builder | No | No | Yes | Yes |
| Marketplace listing | No | No | Yes | Yes |
| Business hub | No | No | No | Yes |
| Business website builder | No | No | No | Yes |
| E-commerce / Shopify tools | No | No | No | Yes |

---

## Changes from Current System

- **Free tier** now INCLUDES the 90-day plan (currently Pro-only)
- **Pro** price changes from $27/mo to $49/mo with daily personalized hypnosis
- **Coach** price changes from $99/mo to $79/mo
- **Business** is a new tier at $129/mo

---

## Technical Plan

### 1. Create Stripe Products and Prices
- Create new **"MindOS Pro"** price at $49/mo (replace old $27 price)
- Create new **"MindOS Business"** product + price at $129/mo
- Update Coach Pro price to $79/mo (create new price, keep old for existing subscribers)

### 2. Update `useSubscriptionGate` Hook
Expand the tier type from `"free" | "pro"` to `"free" | "pro" | "coach" | "business"` with product ID mapping:

```text
TIER_MAP:
  prod_TzbSX1sFG1woDZ -> "pro"     (MindOS Pro)
  prod_TzsD5sivmfnEeC -> "coach"   (Coach Pro)
  prod_NEW_BUSINESS   -> "business" (MindOS Business)
  default             -> "free"
```

New gate properties:
- `canAccessPlan`: ALL tiers (including free)
- `canAccessHypnosis`: pro, coach, business
- `canAccessNudges`: pro, coach, business
- `canBeCoach`: coach, business
- `canAccessBusiness`: business only
- `maxHabits`: free=3, others=unlimited
- `dailyHypnosisLimit`: 1 for pro/coach/business, 0 for free

### 3. Update `UpgradePromptModal`
- Add feature-specific messages for coach and business gates
- Update pricing display from "$27/month" to show relevant tier pricing
- Show appropriate upgrade target based on what feature is locked

### 4. Update Subscriptions Page
- Replace single Pro card with a 4-tier comparison grid
- Each tier card shows features, price, and CTA
- Free tier shows "Current Plan" if user has no subscription
- Active subscription highlighted with green border

### 5. Update `create-checkout-session` Edge Function
- Accept a `tier` parameter (`pro`, `coach`, `business`)
- Map to the correct Stripe price ID
- Keep 7-day trial for Pro tier only

### 6. Update `stripe-webhook` Edge Function
- Update `getTier()` function to handle 3 product IDs
- Map each product to the correct tier string in `user_subscriptions` and `profiles`

### 7. Update `check-subscription` Edge Function
- Return the specific tier name instead of just "pro"/"free"

### 8. Update Feature Gates Across the App
- `LifePlan.tsx` / `PlanTab.tsx`: Remove Pro gate (plan is now free for all)
- `HypnosisModal.tsx`: Keep gate but allow pro/coach/business
- Coach journey entry: Gate behind coach/business tier
- Business hub: Gate behind business tier
- Marketplace "Become a Coach" button: Gate behind coach/business tier

### 9. Update `create-coach-checkout` Edge Function
- Update success/cancel URLs to `/marketplace` (already partially done)
- Use new $79/mo price ID

### 10. Personalized Daily Hypnosis (Pro Feature)
- The hypnosis system already considers stats/tasks/streaks via `useDailyHypnosis`
- Add daily limit tracking: 1 hypnosis session per day for Pro users
- Enhance the hypnosis prompt context to include: last task completion time, app engagement level, and suggest motivation boosts for inactive users

