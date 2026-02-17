

# Upgrade Roadmap: Bigger Milestones, Clearer Text, Blur Irrelevant

## What Changes

### Desktop Vertical Timeline
- **Larger milestone rows**: Each row gets more padding (`py-2.5` instead of `py-1`) and the content card becomes a proper mini-card with padding and rounded corners
- **Bigger nodes**: Current week node grows to 28px, completed/future nodes to 24px
- **Clearer text**: Week label bumps to 11px bold, milestone title to 12px with proper line height. Current week title is semi-bold white
- **Current week emphasis**: The content card gets a stronger amber glow border, subtle amber background, and the "NOW"/"כאן" badge is larger and more prominent
- **Blur irrelevant future milestones**: Future weeks get `opacity-30` plus a `blur-[0.5px]` CSS filter to visually de-emphasize them, making the completed and current weeks pop
- **Completed milestones**: Slightly muted (`opacity-70`) but still sharp -- not blurred, just less prominent than current
- **Month pills**: Slightly larger text (10px label, 9px sublabel) for better readability

### Mobile/Tablet Horizontal Timeline
- **Larger nodes**: Current node 32px, others 28px
- **Wider per-node column**: 84px instead of 72px for breathing room
- **Bigger labels**: Week label 10px, title 10px (was 9px)
- **Blur future**: Same blur treatment on future nodes and their labels
- **Current week card**: Stronger glow and "HERE" badge bigger

## Technical Details

### File: `src/components/dashboard/VerticalRoadmap.tsx`

**DesktopTimeline changes (lines 229-358):**
- Node sizes: `w-7 h-7` (28px) for current, `w-6 h-6` (24px) for completed/future
- Row padding: `py-2.5 px-1`
- Content card: `rounded-lg px-2.5 py-1.5` with stronger styling per state
- Current: `bg-amber-500/15 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.15)]`
- Future: add `filter blur-[0.5px] opacity-30` wrapper
- Text sizes: week `text-[11px]`, title `text-xs` (12px)
- "NOW" badge: `text-[8px] px-2 py-0.5`

**HorizontalTimeline changes (lines 85-227):**
- Node sizes: current `w-8 h-8`, others `w-7 h-7`
- Column width: `minWidth: 84px`
- Labels: `text-[10px]`
- Future items: `opacity-30 blur-[0.5px]`
- Title max-width: `max-w-[76px]`

## Result
- Current week stands out dramatically with size, glow, and contrast
- Completed weeks are visible but subdued
- Future weeks fade into a soft blur, creating a clear visual hierarchy
- All text is larger and more readable
- The roadmap feels like a premium, important navigation element

