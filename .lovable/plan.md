

# Upgrade Roadmap: Polish + Horizontal on Mobile/Tablet

## Current Issues
- The vertical roadmap is desktop-only (hidden on mobile/tablet)
- Design is functional but lacks the premium Web3 "wow" factor
- No way for mobile users to see their journey progress

## Changes

### 1. Responsive Layout in `VerticalRoadmap.tsx`
- **Desktop (lg+)**: Keep vertical layout, but enhance visuals
- **Mobile/Tablet (below lg)**: Render as a horizontal scrollable timeline with snap scrolling, auto-scrolled to the current week node

### 2. Visual Upgrades (both orientations)
- **Larger "current" node** (28px vs 22px) with a double-ring glow effect and subtle shadow pulse
- **Connector line**: thicker (3px) with a gradient that transitions from emerald (completed) through amber (current) to muted (future)
- **Month dividers**: styled as pill badges with a subtle glassmorphism background instead of plain text
- **Completed nodes**: add a subtle line-through or checkmark animation on mount
- **Future nodes**: use a dotted/dashed border instead of solid to clearly differentiate from completed
- **Progress percentage**: show as a small radial/arc indicator next to the header instead of plain text

### 3. Horizontal Mode Details (Mobile/Tablet)
- Container: `overflow-x-auto snap-x snap-mandatory` with hidden scrollbar CSS
- Each week node is a vertical card (node on top, week label + title below) spaced horizontally
- Month labels appear as floating section headers above the horizontal line
- Auto-scroll via `useEffect` + `scrollIntoView` to center the current week on mount
- The connecting line runs horizontally with the same gradient fill logic
- Compact: ~80px wide per node, fits 4-5 visible nodes with scroll

### 4. Integration in `MobileHeroGrid.tsx`
- Remove the `hidden lg:flex` wrapper from COL 3's roadmap
- On mobile, render the roadmap above or below the "90-Day Plan" collapsible row (below Daily Pulse, above Habits) as a horizontal strip
- On desktop, keep it in COL 3 as vertical

## Technical Details

### File: `src/components/dashboard/VerticalRoadmap.tsx` (rewrite)
- Add `useIsMobile` or media query check (use the existing `use-mobile` hook, but check for `lg` breakpoint ~1024px since the grid switches there)
- Render two layouts conditionally:
  - `HorizontalTimeline` for small screens
  - `VerticalTimeline` for desktop
- `HorizontalTimeline`:
  - Horizontal flex container with `overflow-x-auto scrollbar-hide snap-x`
  - A horizontal gradient line (`h-[3px]`) running behind the nodes
  - Each milestone as a snap-aligned column: node circle on top, week badge + title below
  - Month labels as sticky/floating amber pills at section boundaries
  - `useRef` + `scrollIntoView({ behavior: 'smooth', inline: 'center' })` on the current week node
- `VerticalTimeline`:
  - Keep existing structure but upgrade node sizes, line thickness, and add dashed borders for future nodes
  - Month dividers get glassmorphism pill styling

### File: `src/components/dashboard/MobileHeroGrid.tsx`
- Move `<VerticalRoadmap />` from the desktop-only COL 3 wrapper
- On mobile: render it inside COL 2 (between Daily Pulse and Habits)
- On desktop: keep it in COL 3
- Use `lg:hidden` / `hidden lg:block` pattern for the two placements

## Result
- Mobile users see a sleek horizontal scrollable roadmap showing their 12-week journey
- Desktop keeps the vertical column layout
- Both get upgraded visuals with better glow effects, gradient lines, and glassmorphism month badges
- Current week auto-scrolls into view on mobile

