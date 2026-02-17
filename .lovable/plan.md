
# Aurora OS Design System Overhaul

## Overview

A comprehensive UI redesign creating a cohesive "Aurora OS" design language across 5 pages and shared components. No logic, routes, or data changes -- purely presentation layer.

## Phase 1: Shared Components (Foundation)

Create 6 reusable components in `src/components/aurora-ui/`:

### `PageShell.tsx`
- Wrapper with `max-w-6xl mx-auto` on desktop, consistent `px-4 md:px-6` padding
- Accepts `className` for page-specific overrides
- Handles RTL `dir` attribute automatically

### `SectionHeader.tsx`
- Left: icon + title + optional subtitle
- Right: optional action button (e.g., "See all", "Edit")
- Props: `icon`, `title`, `subtitle`, `action`, `actionLabel`
- Consistent typography: title is `text-base font-bold`, subtitle is `text-xs text-muted-foreground`

### `MetricCard.tsx`
- Small stat card with icon circle, label, value, and optional gradient background
- Replaces the `ScoreCard` sub-component in ProfileContent
- Props: `icon`, `label`, `value`, `suffix`, `gradient`

### `GradientCTAButton.tsx`
- Primary gradient button (primary -> accent) with icon + arrow
- Used as the single main CTA per page
- Props: `onClick`, `label`, `icon`, `className`

### `HeroBanner.tsx`
- Full-width card with gradient background, icon, title, subtitle, and optional CTA button
- Replaces inline hero patterns in PlanProgressHero and status banners
- Props: `gradient`, `icon`, `title`, `subtitle`, `action`, `actionLabel`

### `PillChips.tsx`
- Renders a `flex-wrap` list of styled pill tags
- Props: `items: string[]`, `colorScheme` (pink, violet, green, etc.)
- Replaces repeated chip patterns in ProfileContent values/traits

## Phase 2: `/today` (Home) Page

### Changes to `TodayTab.tsx`
- Wrap content in `<PageShell>`
- Keep `DashboardBannerSlider`, `NextActionBanner`, `TodaysHabitsCard`, `ChecklistsCard`
- Use consistent `space-y-6` gap

### Changes to `NextActionBanner.tsx`
- Refine spacing: ensure consistent `rounded-2xl` corners
- Ensure mobile button stacking works cleanly

### Changes to `TodaysHabitsCard.tsx`
- Use `rounded-2xl` for consistency
- Use `SectionHeader` pattern for card header

### Changes to `ChecklistsCard.tsx`
- Use `rounded-2xl` and soft shadow
- Use `SectionHeader` pattern in header area
- Remove `md:col-span-2` (now always single column in its grid cell)

## Phase 3: `/plan` Page

### Changes to `PlanTab.tsx`
- Wrap in `<PageShell>`
- Use `SectionHeader` for "Today's Missions" heading
- Consistent section spacing with `space-y-6`

### Changes to `PlanProgressHero.tsx`
- Use `rounded-2xl`, consistent shadow and border
- Keep existing data fetching and display logic

### Changes to `PlanRoadmap.tsx`
- Use `SectionHeader` for "90-Day Roadmap" heading
- Month cards: `rounded-2xl`, consistent border/shadow
- Week rows: consistent padding and hover states

## Phase 4: `/me` (Profile) Page

### Changes to `ProfileContent.tsx`
- Wrap in `<PageShell>`
- Replace `GlassCard` sub-component with consistent `rounded-2xl bg-card border shadow-sm` cards with `SectionHeader`-style headers
- Replace `ScoreCard` with `MetricCard`
- Replace inline chip rendering with `PillChips`
- Replace bottom CTA with `GradientCTAButton`
- Keep all modals, data hooks, and navigation logic unchanged

## Phase 5: `/quests` Page

### Changes to `QuestsPage.tsx`
- Wrap in `<PageShell>`
- Use `SectionHeader` for page heading
- Grid: `grid-cols-2 md:grid-cols-4 gap-4`
- Quest cards: `rounded-2xl`, consistent border/shadow, hover states
- Status badges: use `Badge` component consistently

## Phase 6: FlowRenderer Card Polish

### Changes to `FlowRenderer.tsx`
- Already has card wrapper, just ensure `rounded-2xl shadow-lg` matches the system

### Changes to `QuestionCard.tsx`
- Option buttons: ensure consistent `rounded-xl border-2` treatment
- CTA button: match `GradientCTAButton` gradient style

## Files Summary

### New files (6)
| File | Purpose |
|------|---------|
| `src/components/aurora-ui/PageShell.tsx` | Layout wrapper |
| `src/components/aurora-ui/SectionHeader.tsx` | Section header pattern |
| `src/components/aurora-ui/MetricCard.tsx` | Stat display card |
| `src/components/aurora-ui/GradientCTAButton.tsx` | Primary CTA button |
| `src/components/aurora-ui/HeroBanner.tsx` | Hero card component |
| `src/components/aurora-ui/PillChips.tsx` | Chip/tag list |

### Modified files (8)
| File | Change |
|------|--------|
| `src/pages/TodayTab.tsx` | Wrap in PageShell |
| `src/pages/PlanTab.tsx` | Wrap in PageShell, use SectionHeader |
| `src/pages/MeTab.tsx` | Wrap in PageShell |
| `src/pages/QuestsPage.tsx` | Wrap in PageShell, expand grid to 4 cols |
| `src/components/dashboard/ProfileContent.tsx` | Use MetricCard, PillChips, GradientCTAButton, SectionHeader-style headers |
| `src/components/dashboard/v2/TodaysHabitsCard.tsx` | Consistent rounded-2xl styling |
| `src/components/dashboard/unified/ChecklistsCard.tsx` | Consistent rounded-2xl styling, SectionHeader pattern |
| `src/components/flow/QuestionCard.tsx` | Gradient CTA button style |

### Not modified
- No data hooks, DB schema, routes, or autosave logic
- DashboardBannerSlider (already polished)
- NextActionBanner (minimal changes, mostly fine)
- DashboardLayout (container already handled)
- All edge functions and flow specs

## Design Tokens Applied Everywhere

| Token | Value |
|-------|-------|
| Card radius | `rounded-2xl` |
| Card border | `border border-border` |
| Card shadow | `shadow-sm hover:shadow-md` |
| Section gap | `space-y-6` |
| Page padding | `px-4 md:px-6` |
| Max width | `max-w-6xl mx-auto` (PageShell) |
| Primary CTA | `bg-gradient-to-r from-primary to-accent` |
| Touch target | `min-h-[44px]` on interactive elements |

## Note on /sessions

No `/sessions` route currently exists in the app. The hypnosis/sessions feature is accessed via a modal (`HypnosisModal`) triggered from the dashboard. Creating a dedicated sessions page would require new routing and potentially new data hooks, which is out of scope for this UI-only redesign. This can be added as a separate feature request.
