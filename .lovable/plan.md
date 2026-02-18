

# Promotional Upgrade Popup for Free Users

## What We're Building
A visually striking, full-screen promotional modal (like Duolingo Super, Spotify Premium, or Calm) that shows free users a "limited-time 70% off" deal on the Pro tier. It will appear automatically at strategic moments -- after login, periodically during sessions, and after key engagement milestones.

---

## Design

The modal will have a premium, high-conversion look:
- Dark gradient background with glowing accents
- Large "70% OFF" badge with a strikethrough original price
- Feature comparison (Free vs Pro) with checkmarks/crosses
- Urgency element: countdown timer or "offer expires soon"
- Two CTAs: "Claim My Discount" (primary) and "Maybe Later" (ghost)
- Bilingual (Hebrew/English), RTL-aware

### Fake Discount Math
- Pro "original" price shown as ~$149/mo (strikethrough)
- "Discounted" price shown as $49/mo (the actual price)
- Hebrew: "was 649 ILS/mo, now 179 ILS/mo"

---

## Trigger Logic

The popup will show for free-tier users at these moments:

1. **After login** -- on the first dashboard load after authentication
2. **Every 3rd session** -- tracked via `localStorage` counter
3. **After completing the Launchpad** -- right after onboarding finishes
4. **After hitting the daily Aurora message limit** -- when the 5th message is sent

Cooldown: once dismissed, it won't show again for 24 hours (stored in `localStorage`).

---

## Technical Plan

### 1. Create `PromoUpgradeModal` Component
**File**: `src/components/subscription/PromoUpgradeModal.tsx`

A full-screen Dialog with:
- Animated gradient background using framer-motion
- Sparkle/star decorations
- "70% OFF" pill badge
- Strikethrough fake original price + real discounted price
- Feature bullet list (what they unlock with Pro)
- "Claim My Discount" button navigating to `/subscriptions`
- "Maybe Later" dismiss button
- All text bilingual via `useTranslation` pattern

### 2. Create `usePromoPopup` Hook
**File**: `src/hooks/usePromoPopup.ts`

Manages show/hide logic:
- Reads `tier` from `useSubscriptionGate`
- Only activates for `tier === "free"` users
- Tracks in `localStorage`:
  - `promo_last_dismissed`: timestamp of last dismissal (24h cooldown)
  - `promo_session_count`: incremented on mount, triggers every 3rd session
  - `promo_shown_after_login`: flag to show once per login session
- Exposes: `{ shouldShowPromo, dismissPromo, triggerPromo }`

### 3. Integrate into Dashboard
**File**: `src/pages/UserDashboard.tsx`

- Import `usePromoPopup` and `PromoUpgradeModal`
- Render the modal conditionally when `shouldShowPromo` is true
- Trigger after login detection (user exists + first render)

### 4. Integrate into Aurora Chat (message limit trigger)
**File**: `src/components/aurora/AuroraChatArea.tsx` (or wherever message limit is checked)

- When `messagesRemaining === 0`, call `triggerPromo()` alongside the existing upgrade prompt

### 5. Integrate after Launchpad Completion
**File**: `src/components/aurora/AuroraLayout.tsx`

- When `isLaunchpadComplete` transitions from false to true, trigger the promo

---

## Visual Mockup (Text Description)

```text
+------------------------------------------+
|  [dark gradient bg with glow effects]    |
|                                          |
|       (sparkle)  (sparkle)               |
|                                          |
|    +---------------------------+         |
|    |   70% OFF  - LIMITED TIME |  badge  |
|    +---------------------------+         |
|                                          |
|    Unlock Your Full Potential            |
|                                          |
|    was $149/mo  -->  $49/mo              |
|    ~~~~~~~~~~~                           |
|                                          |
|    [check] Unlimited Aurora messages     |
|    [check] Daily AI hypnosis             |
|    [check] Proactive coaching nudges     |
|    [check] Unlimited habits              |
|    [x]     Free: 5 msgs/day, 3 habits   |
|                                          |
|    [ ====  Claim My Discount  ==== ]     |
|    [        Maybe Later          ]       |
|                                          |
+------------------------------------------+
```

---

## Summary of Files

| Action | File |
|--------|------|
| Create | `src/components/subscription/PromoUpgradeModal.tsx` |
| Create | `src/hooks/usePromoPopup.ts` |
| Edit   | `src/pages/UserDashboard.tsx` -- add promo modal |
| Edit   | `src/components/aurora/AuroraLayout.tsx` -- trigger after launchpad |
| Edit   | Aurora message-limit handler -- trigger on limit hit |

