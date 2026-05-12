## Goal
Fix the overlapping double-header in the screenshot: when a Hub modal is open, the underlying `DashboardLayout` header still renders behind the `HubModalHost` header, producing the garbled `MindOS / Study / bell / shield / search` row at the top.

## Root cause
- `DashboardLayout` header is `position: sticky z-50`.
- `HubModalHost` overlay is `fixed inset-0 z-[70]` but the framer-motion wrapper applies a `transform` while animating, which creates a new stacking context and breaks the expected layering against the sticky header on some browsers/iOS Safari.
- Result: both headers occupy the top 56 px at the same time and read as overlapping text/icons.

## Fix

1. **`src/components/dashboard/DashboardLayout.tsx`**
   - Use `useHubModalSafe()` to check `activeHub`.
   - When `activeHub` is non-null, skip rendering the dashboard `<header>` (mobile + desktop branches) entirely. The hub modal already provides its own top bar with the close button.
   - Also stop rendering `<AuroraDock />` while a hub is active so it doesn't hover above the hub content.

2. **`src/components/navigation/HubModalHost.tsx`** (small polish, no behavior change)
   - Keep `fixed inset-0 z-[70]`.
   - Bump the inner motion.div to also set `style={{ zIndex: 70 }}` explicitly so iOS Safari respects it even with the transform-induced stacking context.
   - Ensure header bar inside the modal is solid `bg-background` (already done) and full-width.

3. **No changes** to AppSideMenu, hub bodies, AION chat, or any business logic.

## Validation
- Open `/aurora`.
- Tap the side menu → open Study hub.
- Top of the screen should show only the Study hub's header (`Study • [close]`), no `MindOS` chevron, no bell/shield/search behind it.
- Close hub → dashboard header reappears as before.
- Repeat for FM, MindOS Tactics, Community.

## Out of scope
- Inner Study/Learn page layout overflow ("Boot Camp" card text running into the progress bar) — separate cleanup if you want it next.
- Any restructure of the broader navigation (covered in the previous strategic analysis).
