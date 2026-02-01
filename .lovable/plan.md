

# Update Aurora Suggestion Card Colors

## Overview
Replace the current multi-colored suggestion card scheme (purple, cyan, amber, emerald) with a unified deep navy gradient theme based on the uploaded color reference.

## Color Extraction from Image
The uploaded image shows a deep navy gradient card background:
- **Top color**: Approximately `#1E1B4A` (HSL ~245, 45%, 20%)
- **Bottom color**: Approximately `#1A2D40` (HSL ~205, 40%, 18%)
- **Overall feel**: Deep, calm, unified navy-to-teal gradient

## Current Implementation
Located in `src/components/aurora/AuroraWelcome.tsx`:

```typescript
const cardColors = [
  { bg: 'from-purple-500/20 to-purple-600/10', border: 'border-purple-500/30', ... },
  { bg: 'from-cyan-500/20 to-cyan-600/10', border: 'border-cyan-500/30', ... },
  { bg: 'from-amber-500/20 to-amber-600/10', border: 'border-amber-500/30', ... },
  { bg: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/30', ... },
];
```

## Proposed Changes

### Option A: Unified Single Color Scheme
All 4 cards share the same deep navy gradient, creating a cohesive look:

```typescript
const cardColors = [
  { 
    bg: 'from-[#1E1B4A] to-[#1A2D40]', 
    border: 'border-slate-600/30', 
    icon: 'text-slate-300', 
    hover: 'hover:border-slate-500/50 hover:from-[#252358]' 
  },
  // Same for all 4 cards
];
```

### Option B: Subtle Icon Color Variations (Recommended)
Same background for all cards but keep distinct icon colors for visual differentiation:

```typescript
const cardColors = [
  { bg: 'from-[#1E1B4A] to-[#1A2D40]', border: 'border-slate-600/30', icon: 'text-purple-400', hover: 'hover:border-purple-500/40' },
  { bg: 'from-[#1E1B4A] to-[#1A2D40]', border: 'border-slate-600/30', icon: 'text-cyan-400', hover: 'hover:border-cyan-500/40' },
  { bg: 'from-[#1E1B4A] to-[#1A2D40]', border: 'border-slate-600/30', icon: 'text-amber-400', hover: 'hover:border-amber-500/40' },
  { bg: 'from-[#1E1B4A] to-[#1A2D40]', border: 'border-slate-600/30', icon: 'text-emerald-400', hover: 'hover:border-emerald-500/40' },
];
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/aurora/AuroraWelcome.tsx` | Update `cardColors` array with new deep navy gradient |

---

## Technical Details

The hex values from the image will be applied using Tailwind's arbitrary value syntax:
- `from-[#1E1B4A]` - Deep purple-navy (top)
- `to-[#1A2D40]` - Deep teal-navy (bottom)

This creates a smooth gradient matching the uploaded reference image while maintaining the glassmorphism aesthetic with `backdrop-blur-sm`.

