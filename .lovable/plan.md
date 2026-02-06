

# Upgrade Coaches Modal to a Full In-Modal Platform

## Overview
Transform the current practitioners modal from a basic directory into a fully self-contained coaching platform. Everything related to coaches stays inside the modal -- no navigation to external pages. Products/services become compact horizontal cards, reviews appear as a small slider, and the overall experience is polished and professional.

## Current State
- `PractitionersModal` opens a Dialog with search/filter and a grid of `PractitionerCard` components
- Clicking a card shows `PractitionerDetailView` inside the modal (already implemented)
- The detail view shows offers using the full-size `OfferCard` which navigates to external routes (`/personal-hypnosis`, `/offer/slug`, etc.)
- Reviews data is fetched but **not displayed** in the detail view at all
- Multiple external routes exist: `/practitioners`, `/practitioner/:slug`, `/practitioners/:slug`
- Homepage showcase (`PractitionerShowcaseSection`) navigates to `/practitioners/:slug` on click
- `QuickActionsBar` navigates to `/practitioners` page
- `FeaturedPractitioners` links to `/practitioners` page

## Changes

### 1. Create `PractitionerMiniOfferCard` component
**File**: `src/components/practitioners/PractitionerMiniOfferCard.tsx`

A compact card for displaying offers horizontally inside the modal:
- Small horizontal card (fixed width ~200px) showing: brand-color accent bar, title, price, and a "View" button
- Clicking opens the offer details **within the modal** (or opens external link in new tab for booking)
- No navigation away from dashboard -- if the offer has a landing page, open in new tab via `window.open`
- Theme-aware styling: `bg-white/80 dark:bg-gray-900/60`

### 2. Create `PractitionerReviewSlider` component
**File**: `src/components/practitioners/PractitionerReviewSlider.tsx`

A small horizontal review slider:
- Uses `useRef` + scroll buttons (or swipe via `react-swipeable`)
- Each review card: avatar, name, star rating, short review text (line-clamp-2)
- Compact design: small cards ~250px wide in a horizontal scrollable row
- Auto-advances every 5 seconds (optional)
- Shows "No reviews yet" placeholder when empty

### 3. Redesign `PractitionerDetailView`
**File**: `src/components/practitioners/PractitionerDetailView.tsx`

Major overhaul of the detail view:
- **Keep**: Back button, hero section (avatar, name, title, rating, badges), action buttons (Calendly, WhatsApp, etc.), bio section
- **Replace offers grid**: Instead of the 2-column `OfferCard` grid, render a horizontal scrollable row of `PractitionerMiniOfferCard` components
- **Add reviews section**: Below bio, add `PractitionerReviewSlider` using the reviews from `usePractitioner` hook (already fetched but not displayed)
- **Remove all `navigate()` calls** -- offers open in new tabs, everything stays in modal
- **Add specialties display**: Show practitioner specialties as badges (data already fetched)
- **Add services section**: Display `practitioner_services` as compact cards in a horizontal list (similar to offers)

### 4. Update `PractitionersModal` for better UX
**File**: `src/components/practitioners/PractitionersModal.tsx`

- Increase max width to `max-w-4xl` for more room on desktop
- When viewing detail, show a mini header with back arrow + practitioner name (instead of hiding the entire header)
- Smooth transition between list and detail views

### 5. Redirect all external navigation to modal
Update the following files to open the `PractitionersModal` instead of navigating:

- **`src/components/home/PractitionerShowcaseSection.tsx`**: Change `onClick={() => navigate('/practitioners/...')}` to accept an `onOpenModal` callback prop. The CTA "View All Coaches" and individual card clicks should open the modal
- **`src/components/dashboard/v2/QuickActionsBar.tsx`**: Change the practitioners action from `navigate('/practitioners')` to trigger `setPractitionersOpen(true)` (pass callback through context or props)
- **`src/components/practitioners/FeaturedPractitioners.tsx`**: Replace `Link to="/practitioners"` with modal trigger
- **`src/components/platform/PlatformHeroSection.tsx`**: Replace `navigate('/practitioners')` with modal trigger
- **`src/components/platform/FeaturedPractitionersSection.tsx`**: Replace `navigate('/practitioners')` with modal trigger

### 6. Create a shared context for opening the practitioners modal
**File**: `src/contexts/PractitionersModalContext.tsx`

A simple context to allow any component in the app to open the practitioners modal (optionally with a pre-selected practitioner):

```
interface PractitionersModalContextType {
  openPractitioners: (practitionerId?: string) => void;
}
```

This context wraps the app and the `PractitionersModal` lives at the top level (it already does in `DashboardLayout`). For non-dashboard pages (homepage), the context provides a way to open it there too.

### 7. Keep routes but redirect them
The existing routes (`/practitioners`, `/practitioner/:slug`) should redirect to `/dashboard` and trigger the modal open. This preserves SEO and existing links while consolidating the experience.

## Technical Details

### PractitionerMiniOfferCard Design
```
[colored accent bar] Title          Price
                     Subtitle       [View ->]
```
- Width: `w-[220px] flex-shrink-0`
- Height: compact, ~80px
- Left/start border accent using `offer.brand_color`
- Price: bold, right-aligned
- Click: `window.open(route, '_blank')` for offers with landing pages

### PractitionerReviewSlider Design
```
[< ] [Review 1] [Review 2] [Review 3] [ >]
```
- Each review card: ~240px wide, shows avatar (small), name, stars, text (2 lines)
- Horizontal scroll with snap
- Subtle gradient fade on edges
- Uses `overflow-x-auto snap-x` with `scroll-snap-type`

### Files to Create
1. `src/components/practitioners/PractitionerMiniOfferCard.tsx`
2. `src/components/practitioners/PractitionerReviewSlider.tsx`
3. `src/contexts/PractitionersModalContext.tsx`

### Files to Edit
1. `src/components/practitioners/PractitionerDetailView.tsx` -- redesign with mini offers, reviews slider, services
2. `src/components/practitioners/PractitionersModal.tsx` -- wider, better header when viewing detail
3. `src/components/home/PractitionerShowcaseSection.tsx` -- use modal context instead of navigate
4. `src/components/dashboard/v2/QuickActionsBar.tsx` -- use modal context
5. `src/components/practitioners/FeaturedPractitioners.tsx` -- use modal context
6. `src/components/platform/PlatformHeroSection.tsx` -- use modal context
7. `src/components/platform/FeaturedPractitionersSection.tsx` -- use modal context
8. `src/components/dashboard/DashboardLayout.tsx` -- wrap with PractitionersModalContext provider
9. `src/components/practitioners/index.ts` -- export new components

