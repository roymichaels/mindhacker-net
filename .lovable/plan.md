
# Auto-Sliding In-Game Banners for Dashboard

## Overview
Add a professional auto-sliding banner carousel at the top of the dashboard, above the Next Action Banner. Each banner will be crafted entirely from UI components and typography -- no images needed -- styled to look as polished as graphic banners.

## Banner Designs (5 rotating banners)

1. **"Level Up Your Life"** -- Deep purple-to-indigo gradient with a geometric pattern overlay, large bold headline, XP sparkle accents
2. **"Daily Streak Bonus"** -- Warm amber-to-orange gradient with flame iconography, streak counter styling, urgency text
3. **"Unlock Your Potential"** -- Emerald-to-cyan gradient with DNA helix pattern (CSS), motivational copy, glowing CTA
4. **"Aurora AI Coach"** -- Rose-to-pink gradient (brand primary), chat bubble motifs, sparkle animations
5. **"90-Day Transformation"** -- Dark gradient with timeline dots, progress bar visual, countdown feel

## Technical Details

### New Component
- **`src/components/dashboard/DashboardBannerSlider.tsx`**
  - Uses Embla Carousel (already installed) with autoplay plugin (also installed)
  - Auto-advances every 5 seconds with smooth transitions
  - Dot indicators at the bottom for manual navigation
  - Pause on hover/touch
  - Each banner is a styled Card with:
    - Full-width gradient background with decorative CSS shapes/patterns
    - Large display typography (font-space for headlines)
    - Subtle animated accents (shimmer, pulse)
    - Responsive: taller on desktop, compact on mobile
    - Light/dark theme support using `dark:` prefix classes
  - RTL-aware using `useTranslation` hook
  - Hebrew + English text for all banners

### Integration
- **`src/components/dashboard/UnifiedDashboardView.tsx`**
  - Import and render `DashboardBannerSlider` as the first element, before `NextActionBanner`

### Styling Approach
- Glassmorphism overlays with `backdrop-blur`
- Decorative abstract shapes using `absolute` positioned divs with gradients and rounded corners
- Typography hierarchy: large bold headline + smaller subtitle + optional badge/tag
- Dot indicators styled to match the active banner's color scheme
- Framer Motion for entrance animation of the container
