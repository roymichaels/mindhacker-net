

# More Color Diversification -- Phase 2

## Remaining Issues (from screenshots)

1. **Daily Pulse summary card**: All 5 metric values (Energy, Sleep, Tasks, Screen, Mood) are plain white text with no color -- hard to scan
2. **Identity title**: Still uses `from-amber-500 to-yellow-400` gradient -- should use the brand primary
3. **Roadmap progress circle + month pills**: All amber -- the month dividers and % circle should use softer theme colors
4. **Roadmap current-week content card**: The `bg-amber-500/15 border-amber-500/40` card background blends with the amber node -- needs more distinction

## Changes

### 1. DailyPulseCard.tsx -- Color-coded summary metrics
Give each of the 5 logged pulse metrics a distinct icon/value color:
- Energy (Zap): `text-amber-500`
- Sleep (Moon): `text-blue-500`
- Tasks (Check): `text-emerald-500`
- Screen (Smartphone): `text-violet-500`
- Mood (Brain): `text-rose-500`

Add the icon above or beside each value with its color for scannability.

### 2. MobileHeroGrid.tsx -- Identity title gradient
Change the identity title from `from-amber-500 to-yellow-400` to `from-primary to-rose-400` (brand rose) on both mobile and desktop instances.

### 3. VerticalRoadmap.tsx -- Month pills and progress circle
- **Month divider pills**: Change from `bg-amber-500/10 text-amber-500 border-amber-500/20` to `bg-muted/50 text-muted-foreground border-border/30` (neutral, not amber)
- **Progress % circle**: Change border from `border-amber-500/40` and text from `text-amber-500` to `border-primary/40` and `text-primary`
- **Horizontal progress bar fill**: Keep the emerald-to-amber gradient (it semantically shows completed=green to current=amber)
- **Current content card (desktop)**: Change from `bg-amber-500/15 border-amber-500/40` to `bg-primary/10 border-primary/30` so it doesn't blend with the amber node

### 4. VerticalRoadmap.tsx -- Current week label
Change the "HERE"/"NOW" badge from `bg-amber-500/20 text-amber-500 border-amber-500/30` to `bg-primary/20 text-primary border-primary/30`. The amber node itself stays amber as the spotlight marker.

## Technical Details

### File: `src/components/dashboard/DailyPulseCard.tsx`
- Lines 54-66 (summary grid): Add distinct color classes to each metric's icon and value
- Add the icon component rendering for each metric cell

### File: `src/components/dashboard/MobileHeroGrid.tsx`
- Line 124: Change `from-amber-500 to-yellow-400` to `from-primary to-rose-400`
- Line 200: Same change for desktop identity title

### File: `src/components/dashboard/VerticalRoadmap.tsx`
- Lines 106-108 (mobile progress circle): Change amber to primary
- Lines 131-138 (mobile month divider): Change amber to neutral muted
- Lines 213-215 (mobile HERE badge): Change amber to primary
- Lines 237-239 (desktop progress circle): Change amber to primary
- Lines 248-254 (desktop month pill): Change amber to neutral muted
- Lines 324 (desktop current card bg): Change amber to primary
- Lines 335-337 (desktop NOW badge): Change amber to primary

## Result
- Daily Pulse becomes a colorful at-a-glance readout instead of plain white numbers
- Identity title uses the brand rose color instead of generic amber
- Roadmap month labels become subtle/neutral, letting the actual milestone nodes be the focus
- The "you are here" node stays amber (intentional spotlight) but surrounding UI elements use distinct colors
