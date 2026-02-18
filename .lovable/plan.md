

# Marketing Integration & Ad Strategy Plan

## Current Funnel Map

```text
Ad Click --> Landing Page (/) --> /onboarding --> Neural Intake (17 steps) --> Reveal Screen --> /today (Dashboard)
                                                                                                     |
                                                                                          PromoUpgradeModal (session-based)
                                                                                          triggers for free users
```

## Problems Identified

1. **No UTM tracking** -- Ad spend cannot be attributed. No `utm_source`, `utm_campaign`, or `utm_medium` params are captured anywhere (only `?ref=` for affiliates exists).
2. **Landing page CTAs all go to `/launchpad`** which redirects to `/onboarding` -- an unnecessary hop.
3. **No ad-specific landing pages** -- All traffic hits the generic homepage. No way to A/B test or tailor messaging per campaign.
4. **Onboarding is 17+ steps before any value** -- High drop-off risk from cold ad traffic. No "quick win" moment.
5. **Promo modal only triggers after multiple sessions** -- Cold ad traffic that signs up never sees the upgrade offer on their first session.
6. **No post-onboarding conversion nudge** -- After the impressive Neural Diagnostics reveal, there's no upsell moment when motivation peaks.
7. **No conversion event tracking** -- No way to fire Meta/Google pixel events for signup, onboarding completion, or purchase.

## Implementation Plan

### 1. UTM Parameter Tracking System
Create a `useUTMTracker` hook (similar to existing `AffiliateTracker`) that:
- Captures `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` from URL params on any page
- Stores them in `localStorage` with 30-day expiry
- Attaches UTM data to the user's profile on signup (new `utm_data` JSONB column on `profiles` table)
- Fires on the existing `AffiliateTracker` component or alongside it in `App.tsx`

### 2. Fix Landing Page CTA Routing
Update `GameHeroSection.tsx` and `FinalCTASection.tsx`:
- Change all `navigate('/launchpad')` calls to `navigate('/onboarding')` directly
- Eliminates the redirect hop and improves perceived speed

### 3. Ad Landing Route (`/go`)
Create a lightweight `/go` route that:
- Captures UTM params
- Shows a minimal, high-conversion splash (orb + one headline + single CTA)
- Auto-redirects to `/onboarding` on CTA click
- Can be used as ad destination URL: `mindos.app/go?utm_source=meta&utm_campaign=90day`

### 4. Post-Reveal Conversion Moment
Modify `OnboardingReveal.tsx` to add an upgrade prompt after the diagnostics reveal:
- After showing Neural Diagnostics scores, present a "Unlock Your Full Protocol" card
- Frame Pro tier as unlocking the complete Week 1 Protocol (unlimited Aurora messages, daily hypnosis)
- Include a "Start Free" option alongside so it doesn't feel pushy
- This is the peak motivation moment -- highest conversion probability

### 5. First-Session Promo Trigger
Update `usePromoPopup.ts`:
- Add a `first_session_after_onboarding` trigger: if user just completed onboarding (check `launchpad_progress.completed_at` within last 30 minutes) and is free tier, show promo after 60 seconds on dashboard
- Reduce session interval from 3 to 2 for new users (first week)

### 6. Conversion Pixel Events
Create a `useConversionEvents` hook that fires standard events:
- `PageView` on route change
- `Lead` on onboarding start (step 1)
- `CompleteRegistration` on signup
- `ViewContent` on onboarding reveal
- `InitiateCheckout` on promo modal CTA click
- `Purchase` on successful checkout return
- Events dispatch to `window.fbq` (Meta Pixel) and `window.gtag` (Google Ads) if present
- Add pixel script injection via `index.html` `<head>` (pixel IDs stored as env vars / theme settings)

### 7. Database Migration
Add to `profiles` table:
- `utm_data JSONB DEFAULT NULL` -- stores full UTM attribution
- `onboarding_completed_at TIMESTAMPTZ DEFAULT NULL` -- for first-session promo logic

### 8. PromoUpgradeModal Price Update
Update `PromoUpgradeModal.tsx` to reflect the actual pricing from memory (70% off, $149 -> $49) instead of current "50% OFF $97 -> $49".

## Technical Details

### Files to Create
- `src/hooks/useUTMTracker.ts` -- UTM capture and storage
- `src/hooks/useConversionEvents.ts` -- Pixel event firing
- `src/pages/Go.tsx` -- Ad landing page

### Files to Modify
- `src/App.tsx` -- Add `/go` route, mount UTM tracker
- `src/components/AffiliateTracker.tsx` -- Extend to also capture UTM params (or keep separate)
- `src/components/home/GameHeroSection.tsx` -- Fix CTA routes
- `src/components/home/FinalCTASection.tsx` -- Fix CTA routes
- `src/components/onboarding/OnboardingReveal.tsx` -- Add post-reveal conversion card
- `src/hooks/usePromoPopup.ts` -- Add first-session trigger
- `src/components/subscription/PromoUpgradeModal.tsx` -- Update pricing copy
- `index.html` -- Add pixel script placeholders

### Database Migration
```sql
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS utm_data JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ DEFAULT NULL;
```

## Priority Order
1. UTM tracking (must have before running ads)
2. Fix CTA routing (quick win)
3. Conversion pixel events (must have for ad optimization)
4. Ad landing page `/go`
5. Post-reveal conversion moment
6. First-session promo trigger
7. Price copy update

