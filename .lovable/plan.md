

## Move Roadmap Above Active Operation & Improve Title

### Current State
In `TodayOverviewTab.tsx`, the layout order inside the unified card is:
1. Header (pillar + classification)
2. Directive quote
3. Current Mission / Active Operation
4. **Embedded Roadmap** (lines 240-343)
5. Narrative Briefing
6. Commander's Directive

The roadmap title currently says "שלב A" / "Phase A" which is too minimal.

### Changes

**File: `src/components/play/TodayOverviewTab.tsx`**

1. **Move the roadmap block** (lines 240-343) to render **before** the directive (line 209), so it appears right after the header and above everything else.

2. **Replace the roadmap title** from `שלב A` to a more descriptive title:
   - Hebrew: `מסלול 100 הימים — שלב A` (100-Day Route — Phase A)
   - English: `100-Day Route — Phase A`
   - This gives context about the overall journey while still indicating the current phase.

3. The roadmap sub-info (day count, progress bar, phase pills) stays the same — only the position and title text change.

### Technical Detail
- Cut the JSX block from lines 240-343 and paste it between the header block (line 207) and the directive (line 209)
- Update the title span (line 248) from `שלב ${letter}` to `מסלול 100 הימים — שלב ${letter}` / `100-Day Route — Phase ${letter}`

