
# Premium UI Sizing Fix — "Million Dollar App" Pass

## Problem
The previous compaction rounds went too far — text is unreadable (`text-[8px]`, `text-[9px]`), padding is microscopic (`p-1`, `p-1.5`), icons are too small (`w-2.5 h-2.5`), and card heights are insufficient. The approach should have been **reorganizing layout** (grids, collapsible, modals) NOT **shrinking everything**.

## Strategy
1. Restore readable text sizes (minimum `text-xs` / 12px for labels, `text-sm` for titles, `text-lg` for values)
2. Restore comfortable padding (`p-3` minimum for cards, `p-4` for heroes)
3. Increase card heights and touch targets (min 48px for buttons, 44px for list items)
4. Keep the 3-column grid layout — it was a good idea — but give each column **breathing room**
5. Make checklists/tasks expandable/collapsible by default (collapsed initially)
6. Make the Plan roadmap collapsible
7. Move Insights grid items into a modal triggered by a single button

## Changes by File

### 1. Profile Page (`ProfileContent.tsx`)
**3-column hero grid — increase sizing:**
- Grid gap: `gap-1.5` to `gap-3`
- Column 1 (Orb card): Orb size 60 to 80, padding `p-2` to `p-4`, identity title `text-[10px]` to `text-sm`, badge chips text `text-[9px]` to `text-xs`, icon sizes `w-2.5` to `w-3.5`
- Column 2 (Metrics): padding `p-1.5` to `p-3`, value text `text-sm` to `text-lg font-bold`, label `text-[9px]` to `text-xs`, icon `w-3` to `w-4`
- Column 3 (Action buttons): padding `p-1.5` to `p-3`, text `text-[11px]` to `text-sm`, icon `w-3.5` to `w-5`, min-height added for tappability
- Insights section: collapse the 4x2 grid into a single "View Insights" button that opens a modal with the full grid inside
- CompactCard: header padding `px-2 py-1` to `px-4 py-2.5`, title `text-[11px]` to `text-sm`, body padding `p-2` to `p-3`

### 2. Sessions Page (`HypnosisLibrary.tsx`)
**3-column hero grid — increase sizing:**
- Grid gap: `gap-1.5` to `gap-3`
- Column 1 (Daily session): padding `p-2` to `p-4`, emoji `text-xl` to `text-3xl`, title `text-[10px]` to `text-sm font-bold`, time `text-[9px]` to `text-xs`, Play button text `text-[10px]` to `text-sm`
- Column 2 (Stats): padding `p-1` to `p-3`, value `text-xs` to `text-lg font-bold`, label `text-[8px]` to `text-xs`, icon `w-3` to `w-4`
- Column 3 (Quick sessions): padding `p-1.5` to `p-3`, emoji `text-sm` to `text-xl`, name `text-[9px]` to `text-xs font-semibold`, duration `text-[8px]` to `text-[10px]`

### 3. Plan Page (`PlanTab.tsx`)
**3-column hero grid — increase sizing:**
- Grid gap: `gap-1.5` to `gap-3`
- Column 1: week circle `w-12 h-12` to `w-16 h-16`, week number `text-lg` to `text-2xl`, title `text-[10px]` to `text-sm`, badge text `text-[9px]` to `text-xs`
- Column 2: value text `text-sm` to `text-lg font-bold`, labels `text-[9px]`/`text-[10px]` to `text-xs`, padding `p-1.5` to `p-3`
- Column 3: buttons padding `p-1.5` to `p-3`, text `text-[11px]` to `text-sm`, icon `w-3.5` to `w-5`
- Tasks section: make it collapsible (expanded by default)
- Roadmap and Life Analysis: keep collapsible (collapsed by default on mobile)

### 4. Today Page (`TodayTab.tsx`)
- Root gap: `space-y-2` to `space-y-3`
- Grid gap: `gap-2` to `gap-3`

### 5. Banner Slider (`DashboardBannerSlider.tsx`)
- Banner padding: `p-3 sm:p-4` to `p-4 sm:p-5`
- Icon container: `p-2` to `p-2.5`, icon `w-5 h-5` to `w-6 h-6`
- Title: `text-base sm:text-lg` to `text-lg sm:text-xl`
- Subtitle: `text-xs sm:text-sm` to `text-sm`

### 6. NextActionBanner
- CardContent padding: `p-3` to `p-4`
- Icon container: `p-2` to `p-2.5`, icon `h-4 w-4` to `h-5 w-5`
- Title: `text-sm` to `text-base font-semibold`
- Subtitle: `text-xs` to `text-sm`

### 7. Habits Card (`TodaysHabitsCard.tsx`)
- Header: padding `px-2.5 pt-2.5` to `px-4 pt-4`
- Title: `text-xs` to `text-sm`, icon `h-3.5 w-3.5` to `h-4 w-4`
- Content: `px-2.5 pb-2.5` to `px-4 pb-4`
- Habit row: `py-1.5 px-2` to `py-2.5 px-3`, text `text-xs` to `text-sm`
- Checkbox: `w-4 h-4` to `w-5 h-5`
- Progress bar: `h-1` to `h-2`

### 8. Checklists Card (`ChecklistsCard.tsx`)
- Already collapsible -- keep as is but increase sizing
- Header: `px-2.5 py-2` to `px-4 py-3`, icon `w-3.5` to `w-4`, title `text-xs` to `text-sm`
- Checklist row: `py-1.5 px-2.5` to `py-3 px-4`, title `text-xs` to `text-sm`, icon `text-sm` to `text-base`
- Items: `py-1.5 px-2` to `py-2.5 px-3`, text `text-xs` to `text-sm`, checkbox `w-4 h-4` to `w-5 h-5`
- XP reminder: `px-2 py-1` to `px-3 py-2`

### 9. Aurora UI Components
- **MetricCard**: `p-1.5` to `p-3`, icon `w-5 h-5` to `w-8 h-8`, label `text-[10px]` to `text-xs`, value `text-base` to `text-xl font-bold`
- **SectionHeader**: `mb-0.5` to `mb-2`, title `text-sm` to `text-base`, icon `w-4 h-4` to `w-5 h-5`
- **GradientCTAButton**: `h-9` to `h-11`, text `text-xs` to `text-sm`

### 10. New: Insights Modal for Profile
- Create a simple Dialog-based modal that contains the 4x2 insights grid
- Profile page shows a single "View Insights" button that opens this modal
- Inside the modal, the grid uses `p-4` cards with `text-sm` labels and `w-6 h-6` icons

## Technical Details

### Files Modified (10)
1. `src/components/dashboard/ProfileContent.tsx` — restore hero sizing, move insights to modal
2. `src/pages/HypnosisLibrary.tsx` — restore hero sizing
3. `src/pages/PlanTab.tsx` — restore hero sizing, collapsible sections
4. `src/pages/TodayTab.tsx` — restore gaps
5. `src/components/dashboard/DashboardBannerSlider.tsx` — restore banner sizing
6. `src/components/dashboard/v2/NextActionBanner.tsx` — restore sizing
7. `src/components/dashboard/v2/TodaysHabitsCard.tsx` — restore sizing
8. `src/components/dashboard/unified/ChecklistsCard.tsx` — restore sizing
9. `src/components/aurora-ui/MetricCard.tsx` — restore sizing
10. `src/components/aurora-ui/SectionHeader.tsx` — restore sizing
11. `src/components/aurora-ui/GradientCTAButton.tsx` — restore sizing

### Design Principles
- Minimum text size: `text-xs` (12px) for labels, `text-sm` (14px) for body/titles, `text-lg` (18px) for hero values
- Minimum padding: `p-3` for cards, `p-4` for heroes
- Minimum touch target: 44px height for interactive elements
- Keep the 3-column grid structure but with proper breathing room (`gap-3`)
- Use collapsible sections and modals to manage content density instead of shrinking
