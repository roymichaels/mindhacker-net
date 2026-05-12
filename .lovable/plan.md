# Fix the Crash + Pink-Themed Error Screen

## Problem

Two issues are visible on the preview:

1. **Underlying crash** (the cause of the error screen): `src/components/avatar/Experience.tsx` loads `/models/Teleporter Base.glb` via `<Gltf>`. In the preview deployment that asset 404s (URL-encoded space `Teleporter%20Base.glb`), which throws inside react-three-fiber and is caught by the global `ErrorBoundary`. The avatar itself doesn't need this teleporter base to render.

2. **Theme mismatch**: The error screen currently shows the cyan/blue primary button (image 1). The user wants the pink/magenta variant (image 2) to match the rest of the dark UI.

There is also a noisy `[story-world] scene fallback` SyntaxError logged from `StoryWorldContext.tsx`, but it is already handled by a fallback path and does not trigger the boundary — out of scope unless it surfaces again.

## Changes

### 1. Stop the crash in `src/components/avatar/Experience.tsx`
- Remove the `<Gltf src="/models/Teleporter Base.glb" …>` element (the floor disc under the avatar). It is decorative, the file is unreliable in deployment, and removing it eliminates the boundary trip on `/index`.
- No other avatar logic changes.

### 2. Re-skin `src/components/ErrorBoundary.tsx` to the pink theme
Match image 2 exactly while keeping the same structure, copy, RTL behavior, and buttons:
- Card: dark `bg-card` with a soft pink border (`border-pink-500/40`) and outer pink glow (`shadow-[0_0_40px_-10px_hsl(320_90%_65%/0.45)]`), rounded-2xl.
- Icon bubble: keep red `AlertTriangle` in `bg-destructive/10`.
- Primary button (`Refresh page`): gradient pink `from-pink-400 to-fuchsia-500`, black text, glow `shadow-[0_0_30px_-5px_hsl(320_90%_65%/0.7)]`.
- Secondary button (`Go to home page`): ghost/outline with pink-tinted border `border-pink-500/30`, transparent background, foreground text.
- Error ID stays muted mono.
- No changes to copy, language detection, or handlers.

### 3. Verify
Reload `/index` in the preview; avatar should render without tripping the boundary, and any future crash will display the pink-themed card.

## Out of scope
- Story-world JSON fallback log noise.
- Pre-existing TypeScript `@ts-nocheck` files.
- Auth flow (already migrated in previous turn).
