
# Transformation Journey Landing Page & Guest Flow

## Overview
Create a compact, mobile-first landing page for the "Transformation Journey" as a free gift offering. The page will allow guest users to complete the journey without login (using localStorage), receive their full AI analysis and 90-day plan with PDF download, and then be converted to registered users.

---

## Technical Architecture

```text
+------------------+     +--------------------+     +-------------------+
|  Landing Page    | --> |  Guest Launchpad   | --> |  Completion +     |
|  /free-journey   |     |  Flow (localStorage)|    |  Conversion CTA   |
+------------------+     +--------------------+     +-------------------+
                                                            |
                              +-----------------------------+
                              v
                    +---------------------+
                    |  Sign Up / Login    |
                    |  (Save to account)  |
                    +---------------------+
```

---

## Deliverables

### 1. New Landing Page Component
**File**: `src/pages/FreeTransformationJourney.tsx`

Single-section, compact mobile-optimized landing page featuring:
- Hero with animated orb and compelling headline
- Benefit cards showcasing all value:
  - AI-powered consciousness analysis (Hawkins scale)
  - 90-day personalized transformation plan
  - Professional PDF download
  - Identity profile with traits and values
  - Life direction clarity assessment
- Clear CTA: "Start Free Journey"
- Trust signals (no credit card, 5 minutes, instant results)

### 2. Guest Launchpad Flow
**New Hook**: `src/hooks/useGuestLaunchpadProgress.ts`

Mirrors existing `useLaunchpadProgress` but uses localStorage instead of database:
- All 9 steps stored in `guest_launchpad_*` localStorage keys
- Progress persisted across sessions on same device
- Auto-save via existing pattern with `guest_` prefix

### 3. Guest Launchpad Flow Component
**File**: `src/components/launchpad/GuestLaunchpadFlow.tsx`

Wrapper around existing steps that:
- Uses guest hooks instead of authenticated ones
- Skips database calls, uses localStorage only
- On completion, calls edge function for AI analysis (anonymous mode)

### 4. Edge Function Update
**File**: `supabase/functions/generate-launchpad-summary/index.ts`

Add anonymous/guest mode:
- Accept data directly in request body (instead of fetching from DB)
- Generate summary and plan without saving to DB
- Return full results in response for client to display

### 5. Guest Completion Page
**File**: `src/pages/FreeJourneyComplete.tsx`

Displays all results (same as LaunchpadComplete) plus conversion CTAs:
- Show full AI analysis, identity profile, scores
- PDF download (generated client-side from response data)
- Prominent signup CTA with benefits:
  - "Save your results forever"
  - "Unlock Aurora AI coach (X free tokens)"
  - "Access personalized hypnosis sessions"
  - "Track your 90-day progress"
  - "Join the community"

### 6. Homepage Integration
**File**: `src/pages/Index.tsx`

Add new section after `WhatIsThisSection`:
- `FreeJourneyBannerSection` component
- Compact, eye-catching banner promoting free journey
- Links to `/free-journey`

### 7. Routing
**File**: `src/App.tsx`

Add public routes:
- `/free-journey` - Landing page (public)
- `/free-journey/start` - Guest Launchpad flow (public)
- `/free-journey/complete` - Completion page (public)

---

## Key Features & Benefits Display

The landing page will highlight:

| Benefit | Description (HE) | Description (EN) |
|---------|-----------------|------------------|
| AI Analysis | ניתוח תודעה מבוסס AI | AI-powered consciousness analysis |
| Hawkins Scale | ציון על סולם הוקינס | Hawkins scale score |
| 90-Day Plan | תוכנית טרנספורמציה ל-90 יום | 90-day transformation plan |
| 12 Weekly Milestones | 12 אבני דרך שבועיות | 12 weekly milestones |
| PDF Download | הורדת דו"ח מקצועי | Professional PDF report |
| Identity Profile | פרופיל זהות עם תכונות וערכים | Identity profile with traits |
| Life Direction | בהירות כיוון חיים | Life direction clarity |
| Growth Insights | תובנות לצמיחה | Growth insights |

---

## Conversion Strategy

After completing the journey, users see their results and are presented with:

**Primary CTA**: "Save & Unlock More"
- Save results to permanent account
- Get X Aurora tokens for AI coaching
- Unlock personalized hypnosis
- Track progress on dashboard

**Secondary messaging**:
- "Your data is only saved on this device"
- "Create account to access from anywhere"
- "Join X users who transformed their lives"

---

## File Changes Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/pages/FreeTransformationJourney.tsx` | Create | Landing page |
| `src/pages/FreeJourneyComplete.tsx` | Create | Completion + conversion |
| `src/components/launchpad/GuestLaunchpadFlow.tsx` | Create | Guest-mode wrapper |
| `src/hooks/useGuestLaunchpadProgress.ts` | Create | localStorage-based progress |
| `src/hooks/useGuestLaunchpadAutoSave.ts` | Create | localStorage auto-save |
| `src/components/home/FreeJourneyBannerSection.tsx` | Create | Homepage banner |
| `src/pages/Index.tsx` | Modify | Add banner section |
| `src/App.tsx` | Modify | Add public routes |
| `supabase/functions/generate-launchpad-summary/index.ts` | Modify | Add anonymous mode |
| `src/lib/guestProfilePdfGenerator.ts` | Create | PDF from local data |

---

## Mobile-First Design Specifications

The landing page will be optimized for mobile screenshots:
- Single-section design (no scrolling required for key info)
- Large, tappable CTA button (min 56px height)
- Compact benefit grid (2 columns on mobile)
- Animated orb as visual anchor
- Dark theme with glassmorphism effects
- Brand colors from theme settings

---

## Implementation Notes

1. **Privacy**: Guest data stays on device only; no server storage until signup
2. **PDF Generation**: Reuse existing jsPDF logic with response data
3. **Edge Function**: Add `mode: 'guest'` parameter to skip DB operations
4. **Tokens Reward**: On signup after guest completion, award bonus tokens
5. **Data Migration**: On signup, transfer localStorage data to database

