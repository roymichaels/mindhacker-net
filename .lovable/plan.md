

# Fix: Floating Notification & Mission Icons

## Problem
The notification and mission icons are currently styled with `sticky` positioning and a gradient background, which:
1. Doesn't keep them fixed when scrolling through chat messages
2. Creates an unwanted header-like appearance

## Solution
Position the icons as absolutely floating buttons over the chat area without any background.

## Changes

**File: `src/components/aurora/AuroraChatArea.tsx`**

Update line 53 to change the container styling:

**Before:**
```tsx
<div className={`sticky top-0 z-20 flex items-center justify-start gap-1 py-2 px-2 bg-gradient-to-b from-background via-background/80 to-transparent pointer-events-none ${isRTL ? 'flex-row-reverse' : ''}`}>
```

**After:**
```tsx
<div className={`absolute top-2 z-20 flex items-center gap-1 pointer-events-none ${isRTL ? 'right-2 flex-row-reverse' : 'left-2'}`}>
```

Key changes:
- `sticky top-0` → `absolute top-2` - Float over content with small offset
- Remove gradient: `bg-gradient-to-b from-background via-background/80 to-transparent` - No background at all
- Remove `py-2 px-2` padding (using `top-2` and `left-2`/`right-2` for positioning)
- RTL support: Position on right side for RTL, left side for LTR

