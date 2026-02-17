

# Fix Chat Dock Background & Settings Icon Position

## Changes

### 1. Chat Dock - Solid Background (AuroraDock.tsx)
The dock already has `bg-background` but it may appear transparent due to theme layering. Add explicit opacity and shadow to make it feel truly solid and grounded:
- Change from `bg-background` to `bg-background/100` with a `shadow-[0_-2px_10px_rgba(0,0,0,0.1)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.4)]` to give visual weight
- Alternatively, ensure there's no `backdrop-blur` or transparency leaking from parent/child elements

### 2. Settings Icon - Better Position & Size (MeTab.tsx)
Currently the gear icon sits at `absolute top-1 end-1` which overlaps the profile card hero. Improvements:
- Move it to `top-3 sm:top-8 end-3 sm:end-4` for better spacing from edges
- Increase size from `h-5 w-5` to `h-6 w-6` for better touch target
- Add a subtle background circle (`bg-black/20 dark:bg-white/10 backdrop-blur-sm rounded-full`) so it's visible against the profile card gradient
- Use `size="sm"` or keep `size="icon"` with explicit `h-10 w-10` for proper 44px touch target

## Files to Edit

| File | Change |
|------|--------|
| `src/components/aurora/AuroraDock.tsx` | Add shadow + ensure fully opaque bg |
| `src/pages/MeTab.tsx` | Reposition settings icon, increase size, add contrast backdrop |

