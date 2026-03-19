

## Problem

The phase roadmap looks clunky with oversized circles and the briefing card below feels heavy/cluttered. Both need a visual overhaul to feel premium and clean.

## Roadmap Redesign

**Current**: Big 32px circles with thick borders, letter labels underneath, busy gradient background.

**New**: Minimal horizontal progress strip:
- Smaller nodes (20px), connected by a thin line
- Current phase: subtle glow dot, no heavy shadow
- Completed: filled primary dot, no checkmark icon clutter
- Future: hollow dots with border only
- Remove the letter labels underneath each node — they add noise
- Phase label + day counter in a single compact header row
- Remove the radial gradient background, use flat `bg-card` with subtle border
- Clicking a node still expands the milestone detail

## Briefing Card Redesign

**Current**: Heavy card with classification badge, pillar badge, directive quote, current mission sub-card, then 3 separate bordered sections (Field Assessment, Doctrine, Intel), and Commander's Directive footer. Lots of borders and padding = visual weight.

**New**: Single flowing narrative card, no inner sub-cards:
- Classification + pillar in one compact line (keep)
- Remove inner bordered sections for Assessment/Doctrine/Intel — instead flow them as continuous prose paragraphs with just a small colored dot or dash separator
- Current Mission: just the title in bold, inline — no sub-card with icon/border
- Commander's Directive: stays as closing line
- Reduce overall padding from `p-3.5` to `p-3`
- Remove the radial gradient overlay — clean flat card

Result: both elements become lighter, more typographic, less "dashboard widget" and more "document briefing."

## Technical Details

- **File**: `src/components/play/TodayOverviewTab.tsx`
- Roadmap: reduce node size, remove letter labels, flatten bg
- Briefing: remove inner bordered divs, flow as paragraphs with dot separators
- No structural/data changes — same content, better visual hierarchy

