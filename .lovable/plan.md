
## Plan: Apply New Color Scheme Across the App

### Overview
Update the application's color palette to match the logo colors shown in the screenshot - pink/magenta primary, purple/violet accents, gold highlights, and a deep dark theme throughout.

### Color Analysis from Screenshot
Based on the uploaded image:
- **Primary (Pink/Magenta)**: `#e879f9` or HSL `292 95% 73%` - Used for title text
- **Secondary (Violet/Purple)**: `#a855f7` or HSL `270 95% 65%` - Icon color
- **Accent (Gold/Amber)**: `#f59e0b` or HSL `38 95% 50%` - Gem/reward highlights
- **Background**: Deep blue-purple gradient `#0c0a1d` to `#1a1333`

---

### Changes Required

#### 1. Update CSS Variables in `src/index.css`

**Dark Mode Colors (lines 96-138)**:
- Change `--primary` from cyan `187 100% 50%` to magenta `292 95% 73%`
- Change `--primary-glow` to match brighter pink
- Change `--secondary` to purple `270 95% 65%`
- Update `--accent` to gold `38 95% 50%`
- Adjust `--ring` to match new primary
- Update `--glass-border` to use new primary

**Light Mode Colors (lines 35-89)**:
- Update `--primary` to a slightly deeper pink for contrast
- Update `--secondary` to purple
- Keep `--accent` as gold

#### 2. Update Default Theme Settings in `src/hooks/useThemeSettings.ts`

**Lines 102-120** - Update default theme values:
```typescript
primary_h: "292",
primary_s: "95%",
primary_l: "73%",
primary_glow_l: "80",
secondary_h: "270",
secondary_s: "95%",
secondary_l: "65%",
accent_h: "38",
accent_s: "95%",
accent_l: "50%",
```

#### 3. Update Aurora Link Button in `src/components/dashboard/DashboardSidebar.tsx`

**Line 249** - Change the gradient:
```tsx
// From:
"bg-gradient-to-r from-primary/20 via-accent/25 to-primary/20"

// To:
"bg-gradient-to-r from-pink-500/20 via-purple-500/25 to-pink-500/20 text-pink-400"
```

Or use the new primary CSS variable which will inherit the pink color.

#### 4. Update AuroraOrbIcon Colors in `src/components/icons/AuroraOrbIcon.tsx`

Add gradient stops matching the logo:
- Pink mesh lines
- Cyan/teal inner details
- White highlights

#### 5. Update Homepage Gradient in `src/pages/Index.tsx`

**Lines 77-79** - Use the new color scheme:
```tsx
<div className="fixed inset-0 bg-gradient-to-br from-pink-500/15 via-purple-500/10 to-pink-500/15 -z-10" />
```

#### 6. Update Additional UI Components

**`src/components/platform/AuroraPromoSection.tsx` (line 88)**:
Update the button gradient to use new colors.

**`src/lib/productColors.ts`**:
Add new pink/purple color options for product cards.

---

### Technical Details

#### CSS Variable Structure (HSL Format)
```css
/* New Dark Mode Palette */
--primary: 292 95% 73%;          /* Pink/Magenta */
--primary-glow: 292 95% 80%;     /* Brighter pink for glows */
--secondary: 270 95% 65%;         /* Purple/Violet */
--accent: 38 95% 50%;             /* Gold/Amber */
--background: 260 60% 5%;         /* Deep purple-black */
--ring: 292 95% 73%;              /* Pink ring focus */
```

#### Files to Modify
1. `src/index.css` - Core CSS variables
2. `src/hooks/useThemeSettings.ts` - Default theme values
3. `src/components/dashboard/DashboardSidebar.tsx` - Aurora link styling
4. `src/pages/Index.tsx` - Homepage background
5. `src/components/platform/AuroraPromoSection.tsx` - Promo section
6. `src/components/icons/AuroraOrbIcon.tsx` - Logo colors (optional - add gradient)
7. `src/lib/productColors.ts` - Add pink/purple options

---

### Summary (Hebrew)
התוכנית כוללת עדכון פלטת הצבעים של האפליקציה בהתאם לצבעי הלוגו שהוצגו - ורוד/מגנטה כצבע ראשי, סגול כצבע משני, וזהב כאקסנט. השינויים יחולו על משתני ה-CSS הגלובליים, ערכי ברירת המחדל של הנושא, כפתור Aurora Link, ורקע דף הבית.
