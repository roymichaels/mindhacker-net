## Goal
Ensure every hub modal (FM, MindOS Tactics, Community, Study) renders with a fully opaque background so the page behind it never bleeds through.

## Findings
- All four hubs are rendered inside a single shared shell: `src/components/navigation/HubModalHost.tsx`.
- The shell already uses `bg-background`, but:
  - The header bar uses `bg-background/95 backdrop-blur-xl` (semi-transparent).
  - The inner hub wrappers (`FMMarketLayoutWrapper`, `CommunityLayoutWrapper`, `LearnLayoutWrapper`, `MindOS/TacticsPage` → `PlayLayoutWrapper`) don't enforce their own opaque background, so any transparent areas inside the page can show the underlying app.

## Changes (visual / Tailwind only)

1. **`src/components/navigation/HubModalHost.tsx`**
   - Keep root container `bg-background` and add an extra solid layer class to guarantee no translucency (e.g. replace with `bg-background` + ensure no `/xx` opacity).
   - Change header from `bg-background/95 backdrop-blur-xl` → `bg-background` (drop opacity + blur) so the top bar matches the body.
   - Wrap `<HubBody>` in a `bg-background` container so each hub's content sits on a solid surface regardless of the inner wrapper.

2. No changes to the inner hub pages — the wrapping container in `HubModalHost` will guarantee opacity for all four hubs uniformly.

## Out of scope
- No layout, spacing, typography, or behavior changes.
- No changes to colors/tokens themselves — still using semantic `bg-background`.
- No edits to individual hub pages or business logic.

## Validation
- Open each hub (FM, MindOS, Community, Study) from the bottom tab bar and confirm the modal fully covers the underlying page with no see-through.
