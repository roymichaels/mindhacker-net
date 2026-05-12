## Problem

On mobile (402px) the admin onboarding banner in `src/components/layout/OnboardingGate.tsx` wraps to two lines and visually overlaps the dashboard header (bell/shield/username) and pushes the Aurora/MindOS story circles out of view at the top.

The banner is `sticky top-0 z-[60]`, but the dashboard header below it isn't aware of its height, so the chrome stacks awkwardly and the feed's first row gets clipped.

## Fix

Edit only `src/components/layout/OnboardingGate.tsx`:

1. Make the banner a single compact row on mobile:
   - Shorten the Hebrew copy to `עדיין לא השלמת הצטרפות` (single line).
   - Add `truncate` + `min-w-0` to the text span so it never wraps.
   - Reduce vertical padding (`py-1.5`) and tighten gaps.
   - Shrink the CTA (`h-6 px-2 text-[11px]`) and the dismiss button.
2. Keep the banner `sticky top-0 z-[60]` but ensure it renders as a fixed-height strip (~32px) so the dashboard header sits cleanly underneath instead of being visually overlapped.
3. Desktop layout unchanged (same row, just inherits the smaller paddings — still fits comfortably).

No logic, routing, or data changes. Pure presentation tweak in one file.
