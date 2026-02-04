
# Create Business Page

## Overview
Creating a new `/business` route and page component for the Business tab that was added to the sidebar. This page will serve as a hub for career and business growth, aligned with the platform's "elite transformation" and "Mind Hacker" positioning.

## Technical Approach

### 1. Create the Business Page Component
**File:** `src/pages/Business.tsx`

The page will follow existing patterns from UserDashboard and HypnosisLibrary:
- Use `DashboardLayout` for consistent navigation
- RTL support via `useTranslation` hook
- Protected route (requires authentication)
- Mobile-first responsive design
- Glass morphism styling consistent with Game UI standards

### 2. Add Route to App.tsx
Add a protected route for `/business` after the existing protected user routes.

### 3. Add Translations
Add business-related translation keys to both `he.ts` and `en.ts` files.

## Page Content Structure

The Business page will display:

**Header Section:**
- Gold gradient header with business icon
- Title: "עסקים" / "Business"
- Subtitle about career transformation

**Career Status Card:**
- Display user's current career status (from launchpad data)
- Display user's career goal
- If no data, show CTA to complete launchpad

**Business Tools Section (3-4 cards):**
1. **Career Actions** - AI-generated weekly action items (using existing `generate-first-week-actions` edge function)
2. **90-Day Business Plan** - Link to life plan focused on career milestones
3. **Elite Challenges** - Challenge missions from the transformation plan
4. **Business Resources** - Coming soon placeholder for future content

**Quick Actions Grid:**
- Start Business Session (hypnosis)
- Ask Aurora about Business
- View Full Plan

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/pages/Business.tsx` | Create | Main business page component |
| `src/App.tsx` | Modify | Add protected route |
| `src/i18n/translations/he.ts` | Modify | Add Hebrew translations |
| `src/i18n/translations/en.ts` | Modify | Add English translations |

## Component Structure

```text
Business Page
├── DashboardLayout
│   └── Content Container
│       ├── Header (gold gradient, icon, title)
│       ├── Career Status Card
│       │   ├── Current Status
│       │   └── Career Goal
│       ├── Business Tools Grid
│       │   ├── Weekly Actions Card
│       │   ├── 90-Day Plan Card
│       │   ├── Elite Challenges Card
│       │   └── Resources Card (coming soon)
│       └── Quick Actions Section
│           ├── Business Hypnosis
│           ├── Ask Aurora
│           └── View Plan
```

## Styling Details
- Gold gradient header: `from-amber-500 to-yellow-400`
- Purple accent text: `text-purple-900`
- Glass morphism cards: `backdrop-blur-xl bg-background/60`
- Consistent with existing dashboard card styling
- Motion animations using framer-motion

## Data Requirements
The page will fetch from existing data:
- `launchpad_progress` table for career status/goal
- Optionally call `generate-first-week-actions` for dynamic career steps
- Link to existing life plan data
