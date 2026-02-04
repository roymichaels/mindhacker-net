
# Fix: Center the Orb in LifePillarsSection

## Problem Analysis

The orb appears offset to the right of the visual center. The SVG connection lines correctly converge at the mathematical center (350, 350), but the orb itself doesn't align with that point.

**Root Causes:**
1. The orb's container uses `transform: translate(-50%, -50%)` but doesn't have a fixed size
2. The glow effect divs (`w-72`, `w-56`) are absolutely positioned with their own transforms, creating nested transform conflicts
3. The `PersonalizedOrb` (180px) is wrapped in an unsized flex container

---

## Solution

### File: `src/components/home/LifePillarsSection.tsx`

**Changes to the Central Orb section (lines 187-228):**

1. **Give the orb container explicit dimensions** matching the orb size (180px)
2. **Remove nested transform conflicts** - use a single positioning strategy
3. **Position glows relative to the orb**, not with additional transforms
4. **Use proper centering math**: `left: calc(50% - 90px)` and `top: calc(50% - 90px)` where 90px = half of 180px orb size

**New structure:**

```tsx
{/* Central Orb - Exact center of 700x700 container */}
<motion.div
  initial={{ opacity: 0, scale: 0 }}
  whileInView={{ opacity: 1, scale: 1 }}
  viewport={{ once: true }}
  transition={{ duration: 0.8, type: "spring" }}
  className="absolute z-20"
  style={{ 
    left: 'calc(50% - 90px)',  // 50% minus half orb width (180/2)
    top: 'calc(50% - 90px)',   // 50% minus half orb height (180/2)
    width: '180px',
    height: '180px',
  }}
>
  {/* Outer Glow - Centered behind orb */}
  <motion.div 
    className="absolute inset-0 flex items-center justify-center pointer-events-none"
    animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
    transition={{ duration: 4, repeat: Infinity }}
  >
    <div className="w-72 h-72 rounded-full bg-primary/30 blur-[60px]" />
  </motion.div>
  
  {/* Inner Glow */}
  <motion.div 
    className="absolute inset-0 flex items-center justify-center pointer-events-none"
    animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
    transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
  >
    <div className="w-56 h-56 rounded-full bg-primary/20 blur-[40px]" />
  </motion.div>
  
  {/* The Orb - fills parent container exactly */}
  <PersonalizedOrb size={180} state="idle" className="relative z-10" />
  
  {/* Label */}
  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
    <span className="text-base font-semibold text-muted-foreground">
      {isRTL ? 'הזהות שלך' : 'Your Identity'}
    </span>
  </div>
</motion.div>
```

**Key changes:**
- Use `calc(50% - 90px)` for left/top instead of `350px` + transform
- Add explicit `width: 180px` and `height: 180px` to the container
- Change glow containers from transform-based to `inset-0 flex items-center justify-center`
- Remove the extra wrapper div around `PersonalizedOrb`
- Move label to `-bottom-10` to account for new structure

---

## Why This Works

The 700x700 container has its center at 350,350. 

- `calc(50% - 90px)` = `350px - 90px` = `260px` for both left and top
- With width/height of 180px, the element spans from 260px to 440px
- The center of that range is exactly 350px = the mathematical center

This eliminates the nested transform issues and ensures the orb's visual center perfectly aligns with the SVG connection lines.
