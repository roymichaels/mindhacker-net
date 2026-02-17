
# Ultra-Compact UI Pass v2

## Goal
Dramatically reduce vertical space consumption across all 4 tab pages so most content fits on one screen without scrolling.

## Strategy
1. **Collapse vertical gaps** -- `space-y-4` to `space-y-2` everywhere
2. **Shrink banners and heroes** -- reduce padding, font sizes, remove decorative elements
3. **Use inline/horizontal layouts** instead of stacked vertical ones
4. **Reduce card chrome** -- smaller headers, tighter padding
5. **Compact the Profile page** -- smaller orb, inline stats, collapse cards

## Changes by File

### 1. Global: `PageShell.tsx`
- Padding: `py-4 md:py-6 pb-14` stays but pass `space-y-2` as default gap

### 2. Today Page: `TodayTab.tsx`
- Root gap: `space-y-4` to `space-y-2`
- Grid gap: `gap-4` to `gap-2`

### 3. Banner Slider: `DashboardBannerSlider.tsx`
- Banner padding: `p-4 sm:p-5` to `p-3 sm:p-4`
- Icon container: `p-2.5 sm:p-3` to `p-2`; icon: `w-6 h-6 sm:w-7 sm:h-7` to `w-5 h-5`
- Title: `text-lg sm:text-xl` to `text-base sm:text-lg`
- Subtitle: `text-sm sm:text-base` to `text-xs sm:text-sm`
- Dot indicators margin: `mt-3` to `mt-1.5`

### 4. NextActionBanner
- CardContent padding: `p-4 sm:p-5` to `p-3`
- Icon container: `p-2.5 sm:p-3` to `p-2`; icon: `h-5 w-5 sm:h-6 sm:w-6` to `h-4 w-4`
- Remove the "Your Next Action" label line to save a row
- Title: `text-sm sm:text-lg` to `text-sm`
- Subtitle: keep `text-xs`

### 5. Habits Card: `TodaysHabitsCard.tsx`
- CardHeader: `px-4 pt-4` to `px-3 pt-3`
- CardContent: `px-4 pb-4` to `px-3 pb-3`
- Title: `text-lg` to `text-sm`; icon `h-5 w-5` to `h-4 w-4`
- Habit row padding: `p-3` to `py-2 px-2.5`
- Progress bar height: `h-2.5` to `h-1.5`

### 6. Checklists Card: `ChecklistsCard.tsx`
- Header padding: `p-4` to `p-3`
- Title: `text-lg` to `text-sm`
- Icon container: `p-2` to `p-1.5`; icon `w-5 h-5` to `w-4 h-4`
- Checklist row padding: `p-3` to `py-2 px-3`
- Item padding: `p-3` to `py-2 px-2.5`
- XP reminder padding: `p-3` to `p-2`

### 7. Plan Page: `PlanTab.tsx`
- Root gap: `space-y-4` to `space-y-2`
- Missions card padding: `p-4` to `p-3`

### 8. PlanProgressHero
- CardContent padding: `p-5 sm:p-6` to `p-3 sm:p-4`
- Week indicator: `w-20 h-20` to `w-16 h-16`; week number `text-2xl` to `text-xl`
- Current milestone padding: `p-2.5` to `p-2`

### 9. Life Analysis Chart: `LifeAnalysisChart.tsx`
- Chart size: `h-[150px] w-[150px] sm:h-[180px] sm:w-[180px]` to `h-[120px] w-[120px] sm:h-[140px] sm:w-[140px]`
- Inner/outer radius: `50/75` to `40/60`

### 10. Sessions Page: `HypnosisLibrary.tsx`
- Root gap: `space-y-4` to `space-y-2`
- Page header: reduce `mt-1` gap, combine title + subtitle on one line or reduce subtitle
- Daily Session Hero: `p-5 md:p-6` to `p-4`; title `text-xl md:text-2xl` to `text-lg`; remove `mb-4` on description, button height `h-11` to `h-9`
- Quick session cards: `min-h-[88px]` to `min-h-0`; padding `p-4` to `p-3`; emoji `text-2xl` to `text-lg`; title `text-base` to `text-sm`; gap `mb-3` to `mb-1.5`

### 11. Session Stats: `SessionStats.tsx`
- Card padding: `p-3` to `p-2`
- Value text: `text-lg` to `text-base`

### 12. Profile Page: `ProfileContent.tsx`
- Root gap: `space-y-4` to `space-y-2`
- Hero padding: `p-5 md:p-6` to `p-4`
- Orb size: `140` to `100`; margin `mb-4` to `mb-2`
- Name: `text-2xl` to `text-xl`
- Stats chips: `gap-4` to `gap-2`; `px-3 py-1.5` to `px-2 py-1`; text `text-sm` to `text-xs`
- MetricCard grid gap: `gap-4` to `gap-2`
- AuroraCard header: `px-4 py-3` to `px-3 py-2`
- AuroraCard body: `p-4` to `p-3`
- Insights grid: `gap-3` to `gap-2`; button `p-3` to `p-2`; icons `w-5 h-5` to `w-4 h-4`
- CTA section: `pt-2 pb-4` to `pt-1 pb-2`; space-y `3` to `2`

### 13. Aurora UI Components
- **MetricCard**: `p-3 md:p-4` to `p-2`; value `text-xl` to `text-lg`; icon `w-7 h-7` to `w-6 h-6`
- **SectionHeader**: `mb-2` to `mb-1`
- **GradientCTAButton**: `h-11` to `h-9`; text `text-sm` to `text-xs`

## Technical Details

### Files Modified (13)
1. `src/pages/TodayTab.tsx`
2. `src/pages/PlanTab.tsx`
3. `src/pages/HypnosisLibrary.tsx`
4. `src/components/dashboard/ProfileContent.tsx`
5. `src/components/dashboard/DashboardBannerSlider.tsx`
6. `src/components/dashboard/v2/NextActionBanner.tsx`
7. `src/components/dashboard/v2/TodaysHabitsCard.tsx`
8. `src/components/dashboard/unified/ChecklistsCard.tsx`
9. `src/components/dashboard/v2/PlanProgressHero.tsx`
10. `src/components/dashboard/v2/LifeAnalysisChart.tsx`
11. `src/components/hypnosis/SessionStats.tsx`
12. `src/components/aurora-ui/MetricCard.tsx`
13. `src/components/aurora-ui/SectionHeader.tsx`
14. `src/components/aurora-ui/GradientCTAButton.tsx`

All changes are CSS class adjustments only -- no logic or structure changes.
