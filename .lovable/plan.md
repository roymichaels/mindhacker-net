
# Premium "Million Dollar App" Redesign

## Core Problems
1. The 3-column hero grid is too cramped on mobile — 3 tiny columns with microscopic content
2. Plan page has redundant "Life Analysis" section that adds no value to the transformation flow
3. Hero grid Column 3 buttons just scroll to sections below — pointless duplication
4. Cards look generic — plain white with basic text, no visual personality
5. No visual hierarchy — everything looks the same importance level

## Strategy: Replace 3-Column Grids with Premium Single-Flow Layouts

Instead of cramming 3 columns on mobile, use **full-width premium cards** with rich visual treatments. Density comes from **collapsible sections** and **smart stacking**, not from shrinking.

---

## Plan Page (`PlanTab.tsx`) — Complete Redesign

**Remove entirely:**
- Life Analysis collapsible section (and its import + state + ref)
- Column 3 action buttons (Roadmap/Life Analysis scroll buttons — redundant)

**New layout (top to bottom):**

1. **Full-width Transformation Hero** — Single dark gradient card spanning full width:
   - Left side: Week number circle (large, `w-20 h-20`) + "Transformation Plan" title + month badge
   - Right side: Progress ring or large progress bar with completion stats (0/12 completed, 0%)
   - Below: Current milestone preview line
   - This replaces the entire 3-column grid

2. **Today's Missions** — Collapsible (expanded by default), same as now but with richer header styling (gradient accent strip on left border)

3. **90-Day Roadmap** — Collapsible (collapsed by default), same as now

---

## Today Page (`TodayTab.tsx`) — Minor Polish

- Keep banner slider and next action banner as-is (they're already good)
- Keep 2-column grid for habits + checklists
- No structural changes needed, just ensure consistent card styling

---

## Profile Page (`ProfileContent.tsx`) — Replace 3-Col Grid

**New layout:**

1. **Full-width Identity Hero** — Single dark gradient card:
   - Center: Orb (100px) + identity title + gamification chips (Lv, Tokens, Streak) in a row
   - Below orb: 3 inline metric badges (Mind, Clarity, Readiness) as horizontal pills

2. **3 Action Buttons** — Full-width row of 3 evenly-spaced buttons (not cramped column):
   - My Values, Key Traits, Life Direction — each as a horizontal button with icon + label

3. **Rest stays the same** (Career/Change cards, Insights grid, CTA)

---

## Sessions Page (`HypnosisLibrary.tsx`) — Replace 3-Col Grid

**New layout:**

1. **Full-width Daily Session Hero** — Large gradient card with centered content:
   - Emoji + "Your Daily Session" + duration + prominent Play button
   - Gradient background matching primary color

2. **Stats Row** — Horizontal row of 4 stat pills (Sessions, Minutes, XP, Level) — `grid grid-cols-4 gap-2`

3. **Quick Sessions** — Horizontal row of 4 cards — `grid grid-cols-4 gap-2` (same as stats row)

4. **Recent Sessions** — Stays the same

---

## Technical Details

### Files Modified (4)

1. **`src/pages/PlanTab.tsx`**
   - Remove: `LifeAnalysisChart` import, `analysisRef`, `analysisOpen` state, entire Life Analysis section, Column 3 action buttons
   - Replace 3-col grid with single full-width hero card
   - Hero contains: week circle (left), stats + progress bar (right), current milestone (bottom)
   - Keep collapsible Tasks (expanded) and Roadmap (collapsed)

2. **`src/components/dashboard/ProfileContent.tsx`**
   - Replace 3-col grid with: full-width identity hero (orb centered, chips below)
   - Move metrics to horizontal badge row inside hero
   - Move 3 action buttons to a full-width `grid grid-cols-3 gap-2` row below hero
   - Button size: `py-3` with `text-sm` labels and `w-5 h-5` icons

3. **`src/pages/HypnosisLibrary.tsx`**
   - Replace 3-col grid with: full-width daily session hero card
   - Stats become horizontal `grid grid-cols-4 gap-2` row
   - Quick sessions become horizontal `grid grid-cols-4 gap-2` row
   - Each section stacked vertically with `space-y-3`

4. **`src/components/dashboard/plan/PlanRoadmap.tsx`** (minor)
   - Remove the duplicate section header "🗺️ 90-Day Roadmap" inside the component (since the collapsible toggle already shows it)

### Design Standards
- Hero cards: `rounded-2xl p-5` with gradient backgrounds
- Full-width layout: no more 3-col grids on mobile
- Stats: horizontal pill rows with `grid grid-cols-4` or `grid grid-cols-3`
- Buttons: full-width rows with minimum `py-3` height
- Collapsible headers: `px-4 py-3.5` with `text-base font-semibold`
- Color accents: left border gradient strips on collapsible sections
