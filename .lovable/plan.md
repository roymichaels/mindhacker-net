
# Mobile 3-Column Grid Layout for Dashboard

## Overview
On mobile, add a compact 3-column, 1-row grid at the top of the dashboard that shows the three key modules side by side (RTL order): **HUD** (right), **Daily Session Hero** (middle), **Plan + Tasks** (left).

## Layout

The 3-column grid will be **mobile-only** (`md:hidden`) and placed as the first section inside PageShell. Each column is a compact card version of its full section:

```text
|  Tasks/Plan  |  Daily Session  |   HUD/Profile   |
|   (left)     |    (middle)     |    (right)       |
```
Since the app is RTL, the visual order right-to-left maps to grid columns naturally.

## Column Content

### Right Column - HUD (Profile Identity)
- Personalized Orb (small, ~48px)
- Identity title + icon
- Level, Tokens, Streak pills (compact)
- 3 micro-metric bars (Readiness, Clarity, Consciousness)

### Middle Column - Daily Session Hero
- Sparkle icon
- "הסשן היומי שלך" title
- "15 דקות" subtitle
- "התחל עכשיו" button
- Purple gradient background (matching screenshot)

### Left Column - Plan Modules
- Habits mini-card (count indicator + progress)
- 90-Day Plan mini-card (week number + progress bar)
- Tasks mini-card (count + progress bar)
- Stacked vertically within the column

## Technical Details

### Files Modified

1. **`src/pages/UserDashboard.tsx`**
   - Add a new `mobile-only` section (`md:hidden`) before the existing Section 1
   - Uses `grid grid-cols-3 gap-2` for the 3-column layout
   - Each column is a compact `Card` component with condensed content
   - The existing full sections below remain unchanged (they'll serve as the desktop/scrollable view)
   - Extract compact versions of the HUD, Session Hero, and Plan data inline

### What Stays Unchanged
- All existing sections remain for scroll-through on both mobile and desktop
- No data hooks change
- No routing changes
- Desktop layout unaffected
