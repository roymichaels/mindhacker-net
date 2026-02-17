
# 3-Column Hero Grid for Profile, Sessions, and Plan

## Concept
Replace the stacked hero + stats layout on all 3 pages with a single **3-column grid row** that packs the key info into one horizontal band, dramatically reducing vertical scroll.

## Profile Page (`ProfileContent.tsx`)

Current: Hero card (orb + title + chips) stacked above 3 stats, stacked above values/traits cards.

New **single row** `grid grid-cols-3 gap-1.5`:

| Column 1 (Right in RTL) | Column 2 (Middle) | Column 3 (Left in RTL) |
|---|---|---|
| Dark bg card with Orb (60px), identity title, Lv / Tokens / Streak chips | 3 vertical metric pills: תודעה, בהירות, מוכנות (with values) | 3 vertical action buttons: הערכים שלי, תכונות דומיננטיות, כיוון החיים |

- Remove the separate "Stats Row" (3-col grid below hero) -- merged into column 2
- Remove the separate "Values & Traits" cards and "Life Direction" card -- replaced by the 3 buttons in column 3 that open modals
- Keep the Insights grid, CTA, and Career/Change cards below

## Sessions Page (`HypnosisLibrary.tsx`)

Current: 4 stat cards stacked above daily session hero stacked above quick sessions.

New **single row** `grid grid-cols-3 gap-1.5`:

| Column 1 (Right) | Column 2 (Middle) | Column 3 (Left) |
|---|---|---|
| Dark bg card with session emoji, "Your Daily Session" title, Play button | 4 vertical stats: Sessions, Minutes, XP, Level | 4 quick session buttons stacked: Calm, Focus, Energy, Sleep |

- `SessionStats` content moves inline into column 2
- Quick sessions move from a separate 4-col grid into column 3 as a 2x2 mini grid
- Daily hero shrinks into column 1

## Plan Page (`PlanTab.tsx`)

Current: PlanProgressHero card stacked above missions stacked above roadmap.

New **single row** `grid grid-cols-3 gap-1.5`:

| Column 1 (Right) | Column 2 (Middle) | Column 3 (Left) |
|---|---|---|
| Dark bg card with week number circle, "Transformation Plan" title, month badge | Vertical progress stats: Completed/Total, Progress %, current milestone | Action buttons: View Roadmap (scroll to section), View Life Analysis |

- `PlanProgressHero` content splits across columns 1 and 2
- Column 3 provides quick navigation buttons

## Technical Details

### Files Modified (4)
1. **`src/components/dashboard/ProfileContent.tsx`** -- Replace hero + stats row + values/traits cards with single 3-col grid. Column 1: dark card with orb. Column 2: 3 stacked metrics. Column 3: 3 action buttons opening existing modals (identity for values, traits, behavioral for direction).
2. **`src/pages/HypnosisLibrary.tsx`** -- Replace SessionStats + Daily Hero + Quick Sessions with single 3-col grid. Inline the stats data directly.
3. **`src/components/hypnosis/SessionStats.tsx`** -- May be simplified or kept as-is if still used elsewhere.
4. **`src/pages/PlanTab.tsx`** -- Replace PlanProgressHero with inline 3-col grid containing the same data.

### Design Pattern
- All 3 grids use the same structure: `grid grid-cols-3 gap-1.5`
- Column 1 always has the dark gradient bg card (brand identity)
- Column 2 always has vertical stacked metrics
- Column 3 always has vertical stacked action buttons
- Each column uses `rounded-xl border` with `p-2` padding
- Text sizes: titles `text-xs font-bold`, values `text-sm font-bold`, labels `text-[10px]`
- Buttons in column 3: `text-[11px]` with small icons, full-width within their column
