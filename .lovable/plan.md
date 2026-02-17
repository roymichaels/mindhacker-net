
# V2 Visual Overhaul — Bold DOM Restructure

## Overview

A dramatic visual redesign of all 5 pages with new DOM structures, upgraded typography, enforced spacing system, and a "UI V2" debug label. No logic/hooks/data changes.

## Global Changes

### PageShell.tsx — Spacing System Upgrade
- Change padding to `px-4 md:px-8 py-8 md:py-10 pb-16`
- Change default gap from `space-y-6` to nothing (each page controls its own `gap-8`)

### SectionHeader.tsx — Typography Upgrade
- Title: `text-xl font-semibold` (was `text-base font-bold`)
- Subtitle: `text-sm text-muted-foreground` (was `text-xs`)
- Add bottom margin: `mb-4` built into the component
- Icon size bump to `w-5 h-5`

### MetricCard.tsx — Card Elevation
- Increase padding to `p-4 md:p-5`
- Value size to `text-2xl font-bold`
- Add subtle hover: `hover:shadow-md transition-shadow`

### HeroBanner.tsx — Full Signature Hero
- Increase padding to `p-8 md:p-10`
- Title size: `text-2xl md:text-3xl font-semibold`
- Subtitle: `text-base leading-7`
- Add decorative gradient orbs (absolute positioned blurred circles)
- Support `children` slot for custom content below title

### GradientCTAButton.tsx — Bigger Impact
- Height: `h-14` (was `h-12`)
- Text: `text-base font-semibold`
- Shadow: `shadow-xl shadow-primary/30`

### PillChips.tsx — Minor
- Pill text: `text-sm` stays, add `py-1.5` for bigger touch targets

## Page-by-Page Restructure

### A) `/today` — TodayTab.tsx

**New DOM structure:**
```
PageShell (gap-8)
  "UI V2" debug label (absolute top-right)
  DashboardBannerSlider (kept as-is)
  NextActionBanner (kept as-is, already a signature element)
  Two-column grid (gap-6, md:grid-cols-2)
    TodaysHabitsCard
    ChecklistsCard
  HypnosisModal
```

Key changes:
- Wrap in `PageShell className="space-y-8"`
- Add the "UI V2" debug label as a fixed badge

**TodaysHabitsCard.tsx changes:**
- Card padding: `p-6` throughout
- Header title: `text-lg font-semibold` (was `text-sm`)
- Habit row padding: `p-4 rounded-xl` (was `p-3 rounded-lg`)
- Progress bar: `h-2.5` (was `h-2`)

**ChecklistsCard.tsx changes:**
- Header padding: `p-5` (was `p-4`)
- Header title: `text-lg font-semibold` (was `font-bold` no size)
- Checklist row padding: `p-5` (was `p-4`)
- Item padding: `p-4 rounded-xl` (was `p-3 rounded-lg`)

### B) `/me` — ProfileContent.tsx

**New DOM structure:**
```
div (space-y-8)
  "UI V2" debug label (absolute top-right)
  Identity Hero Card (existing, upgrade padding/typography)
  Metrics Row (3-col grid, gap-4)
  Values section (AuroraCard with upgraded header)
  Traits section (AuroraCard with upgraded header)
  Life Direction section (AuroraCard upgraded)
  Career Path section (AuroraCard upgraded)
  Transformation Habits section (AuroraCard upgraded)
  Insights Grid (AuroraCard upgraded)
  CTA Section (GradientCTAButton + Regenerate)
  Modals
```

Key changes:
- Root: `space-y-8` (was `space-y-4`)
- Identity Hero: padding `p-8 md:p-10` (was `p-6`), name text `text-3xl` (was `text-2xl`)
- Level/tokens/streak chips: `px-4 py-2` (was `px-3 py-1.5`), text `text-base` (was `text-sm`)
- AuroraCard sub-component: header padding `px-5 py-4` (was `px-4 py-3`), header title `text-base font-semibold` (was `text-sm`), body padding `p-5` (was `p-4`)
- Insights grid buttons: `p-4 rounded-2xl` (was `p-3 rounded-xl`), icon size `w-6 h-6` (was `w-5 h-5`)
- CTA section: `pt-4 pb-6` (was `pt-2 pb-4`)

### C) `/sessions` — HypnosisLibrary.tsx

**New DOM structure (replaces DashboardLayout with PageShell):**
```
PageShell (space-y-8)
  "UI V2" debug label
  Page Header (text-3xl font-semibold)
  SessionStats
  Daily Session Hero (signature element, p-8, bigger text)
  SectionHeader "Quick Sessions"
  Quick Sessions Grid (grid-cols-2 md:grid-cols-4 gap-4)
    Session Cards (p-6, rounded-2xl, min-h-[120px])
  SectionHeader "Recent Sessions"
  RecentSessions
```

Key changes:
- Replace `DashboardLayout` wrapper with `PageShell`
- Page title: `text-3xl font-semibold` (was `text-2xl sm:text-3xl font-bold`)
- Section gap: `space-y-8` (was `space-y-6`)
- Daily session hero: padding `p-8 md:p-10` (was `p-5 sm:p-6`), title `text-2xl md:text-3xl font-semibold` (was `text-lg sm:text-xl font-bold`)
- Quick sessions: `md:grid-cols-4` (was `grid-cols-2`), card `p-6 min-h-[120px]` (was `p-4 min-h-[88px]`)
- Session card title: `text-base font-semibold` (was `text-sm font-medium`)
- Use `SectionHeader` component for "Quick Sessions" and "Recent Sessions" headings

### D) `/plan` — PlanTab.tsx

**New DOM structure:**
```
PageShell (space-y-8)
  "UI V2" debug label
  PlanProgressHero (kept, signature hero)
  Section: Today's Missions
    SectionHeader (text-xl)
    TasksPanel wrapper (p-6, rounded-2xl)
  Section: 90-Day Roadmap
    PlanRoadmap
  Section: Life Analysis
    LifeAnalysisChart
```

Key changes:
- Root gap: `space-y-8` (was `space-y-6`)
- Missions wrapper: `p-6` (was `p-4`)
- Section spacing: `space-y-4` inside each section (was `space-y-3`)

### E) `/quests` — QuestsPage.tsx

**New DOM structure:**
```
PageShell (space-y-8)
  "UI V2" debug label
  Page Header (HeroBanner-style with icon + title + subtitle)
  Quest Grid (grid-cols-2 md:grid-cols-4 gap-5)
    Quest Cards (p-6, min-h-[160px], rounded-2xl)
      Icon (text-4xl)
      Title (text-base font-semibold)
      Status badge / progress bar
      Completed badge overlay
  Back button
```

Key changes:
- Replace `SectionHeader` at top with a proper `HeroBanner` component for the page header
- Grid gap: `gap-5` (was `gap-4`)
- Card: `p-6 min-h-[160px]` (was `p-5 min-h-[44px]`)
- Icon: `text-4xl` (was `text-3xl`)
- Title: `text-base font-semibold` (was `text-sm`)
- Progress bar: `h-2` (was `h-1.5`)
- Progress text: `text-xs` (was `text-[10px]`)

## "UI V2" Debug Label

Every page gets a temporary label at the top-right corner:
```tsx
<div className="flex justify-end">
  <span className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">UI V2</span>
</div>
```
This will be the first element inside PageShell on each page.

## Files Modified (11)

| File | Changes |
|------|---------|
| `src/components/aurora-ui/PageShell.tsx` | Upgraded padding/spacing |
| `src/components/aurora-ui/SectionHeader.tsx` | Bigger typography, built-in margin |
| `src/components/aurora-ui/MetricCard.tsx` | Larger padding, hover state |
| `src/components/aurora-ui/HeroBanner.tsx` | Larger padding/text, decorative orbs |
| `src/components/aurora-ui/GradientCTAButton.tsx` | Taller, bolder |
| `src/pages/TodayTab.tsx` | space-y-8, debug label |
| `src/pages/PlanTab.tsx` | space-y-8, upgraded section padding, debug label |
| `src/pages/QuestsPage.tsx` | HeroBanner header, larger cards, debug label |
| `src/pages/HypnosisLibrary.tsx` | PageShell, bigger hero/cards, 4-col grid, debug label |
| `src/components/dashboard/ProfileContent.tsx` | space-y-8, bigger hero/cards/chips/grid, debug label |
| `src/components/dashboard/v2/TodaysHabitsCard.tsx` | Bigger padding/typography |
| `src/components/dashboard/unified/ChecklistsCard.tsx` | Bigger padding/typography |

## Files NOT Modified
- All hooks, data fetching, edge functions, routes, DB schema
- DashboardBannerSlider (already polished)
- NextActionBanner (already well-structured)
- FlowRenderer / QuestionCard (already has card background)
