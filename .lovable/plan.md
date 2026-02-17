
# Fix Dashboard Color Confusion

## Problem
Nearly every dashboard element (badges, icons, separators, buttons, section headers) uses the same amber/gold tone. This creates a monotone, hard-to-read interface where nothing stands out -- especially in light mode where amber washes out against white.

## Solution
Introduce a clear color hierarchy with distinct, purposeful colors per section type while keeping amber as the brand accent for the primary CTA only.

## Changes by Component

### 1. MobileHeroGrid.tsx -- Stat Badges and Section Icons

**Game badges** (Lv, Tokens, Streak): Keep amber -- these are the "gold" game elements.

**Diagnostics row** (Awareness, Clarity, Readiness): Already have distinct colors (amber, blue, green) -- keep as-is.

**Section icons** (Habits, 90-Day Plan, Tasks): Give each a unique color instead of all amber:
- Habits: `text-emerald-500` (green = growth/habits)
- 90-Day Plan: `text-blue-500` (blue = planning)
- Tasks: `text-violet-500` (purple = productivity)

**Golden separators**: Replace `via-amber-500/40` with `via-border` so they use the theme's native border color -- subtle, clean, not amber.

**Identity/Direction/Insights buttons**: Give unique icon colors:
- Identity: `text-rose-500`
- Direction: `text-blue-500`  
- Insights: `text-violet-500`

### 2. DailyPulseCard.tsx -- Pulse Card

**Border**: Change from `border-amber-500/30` to `border-border/50` (theme-native).

**Background gradient**: Change from amber-tinted to `from-primary/5 via-transparent to-transparent` (subtle brand tint).

**Progress dots**: Change from `bg-amber-500` to `bg-primary` (brand color instead of amber).

**Header icon**: Change Activity icon from `text-amber-500` to `text-primary`.

### 3. CollapsiblePlanRow -- Plan Badges

**Week badge**: Change from `bg-amber-500/10 text-amber-500 border-amber-500/20` to `bg-primary/10 text-primary border-primary/20` for the active badge.

**Progress bars**: Change from `bg-amber-500` to `bg-primary`.

**Count suffix**: Change from `text-amber-500` to `text-primary`.

### 4. VerticalRoadmap.tsx -- Roadmap Colors

Keep amber for the current-week node (it's the spotlight). No changes needed here -- the roadmap amber is intentional and distinctive since it only highlights the "you are here" marker.

## Technical Details

### File: `src/components/dashboard/MobileHeroGrid.tsx`
- Lines 279, 291, 302: Change section icon colors from `text-amber-500` to emerald/blue/violet
- Lines 143, 159, 175, 218, 235, 251, 276, 288, 300, 314, 320, 325: Change separator `via-amber-500/40` to `via-border`
- Lines 333, 340, 346: Change Identity/Direction/Insights icon colors
- Lines 331, 338, 345: Change hover from `hover:bg-amber-500/10` to `hover:bg-accent/10`

### File: `src/components/dashboard/DailyPulseCard.tsx`
- Line 208: Border and bg-gradient color changes
- Lines 217-226: Progress dots from amber to primary
- Line 49: Header icon color

### File: `src/components/dashboard/MobileHeroGrid.tsx` (CollapsiblePlanRow)
- Lines 420-421: Badge colors from amber to primary
- Line 431: Count suffix color
- Lines 467, 511: Progress bar color

## Result
- Each section has a distinct color identity making the dashboard scannable at a glance
- Light mode gets proper contrast since `text-primary` (rose) and varied colors stand out against white
- Dark mode keeps its premium feel with richer color variety
- Amber remains exclusive to game badges and the CTA button, making them feel special
