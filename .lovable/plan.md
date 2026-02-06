
# New Crystal Logo Integration

## Overview
Replace the current wireframe orb logo with the new aurora crystal SVG across the entire application. The new logo uses gradient strokes (no fill), works beautifully on both light and dark backgrounds, and includes a soft glow filter.

## Changes

### 1. Update SVG Files
- **`public/aurora-icon.svg`** -- Replace contents with the new crystal SVG (used for PWA icons, favicon references, etc.)
- **`src/components/icons/AuroraOrbIcon.tsx`** -- Rewrite the SVG markup to match the new crystal design. Keep `currentColor` stroke approach but add the aurora gradient as an option. The component should support both `currentColor` mode (for monochrome contexts) and gradient mode.

### 2. Add Hover Effect
Add a CSS class in `src/App.css` (or `index.css`) for the logo hover animation:
```css
.logo-crystal {
  transition: transform 1.2s ease, filter 1.2s ease;
}
.logo-crystal:hover {
  transform: scale(1.06) rotate(1deg);
  filter: drop-shadow(0 0 18px rgba(180,140,255,0.35));
}
```

### 3. Usage Guidelines (applied per-context)
- **Header / Sidebar brand logos** (`DashboardSidebar`, `AdminSidebar`, `CoachSidebar`, `AffiliateSidebar`, `CoachPanel`): Small size, `opacity-85`, no animation -- just the crystal icon.
- **Chat avatars** (`AuroraChatMessage`, `AuroraChatBubbles`, `ChatMessage`): Keep small (20-24px), gradient mode.
- **Hero / Landing page**: Larger scale with subtle pulse or rotate animation if desired.

### 4. Files to Modify
| File | Change |
|------|--------|
| `public/aurora-icon.svg` | Replace with new crystal SVG |
| `src/components/icons/AuroraOrbIcon.tsx` | New crystal SVG markup with gradient |
| `src/App.css` | Add `.logo-crystal` hover class |
| `src/components/chat/ChatMessage.tsx` | Update `defaultLogo` path if needed |

No structural or architectural changes -- this is a pure visual asset swap. All existing component references to `AuroraOrbIcon` will automatically pick up the new design.
