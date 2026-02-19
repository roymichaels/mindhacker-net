
# Restructure Coach Hub and Admin Hub to Match Projects UI/UX

## Goal
Redesign both the Coach Hub and Admin Hub pages to follow the same premium visual language used in the Projects tab -- gradient hero banners, glassmorphic cards, Aurora OS components, and polished navigation. Currently both hubs use plain text headers and flat unstyled tab bars that feel disconnected from the rest of the app.

## Design Pattern (from Projects)
The Projects page establishes this visual hierarchy:
1. **Gradient Hero Banner** -- rounded-2xl container with gradient background, decorative blur orbs, icon badge, title with gradient text, and a CTA button
2. **Section Headers** -- uppercase tracking-wider muted text
3. **Glassmorphic Cards** -- rounded-2xl, backdrop-blur, border-border/50, hover shadows
4. **Brand Color Identity** -- Projects uses amber/gold; Coach will use purple/indigo; Admin will use emerald/teal

## Changes

### 1. Coach Hub (`src/pages/CoachHub.tsx`)
- Replace the plain text header with a **HeroBanner** component featuring a purple-to-indigo gradient
- Add a gradient icon badge (Briefcase icon in a rounded-xl gradient container)
- Title with `bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-indigo-600`
- "View Storefront" button gets gradient styling matching the coach color theme
- Tab bar gets **pill-style navigation** (rounded-lg buttons with gradient active state) instead of the default shadcn TabsList, matching the scrollable pill pattern from Admin Hub but with the gradient treatment
- Wrap content in `PageShell` for consistent max-width and padding

### 2. Coach Dashboard Tab (`src/components/coach/CoachDashboardTab.tsx`)
- Replace plain `Card` stat cards with **MetricCard** from aurora-ui (with purple gradient)
- "Upcoming Sessions" and "Recent Activity" cards get glassmorphic styling: `bg-card/80 backdrop-blur-sm rounded-2xl border-border/50`

### 3. Admin Hub (`src/pages/AdminHub.tsx`)
- Replace the plain text header with a **HeroBanner** featuring an emerald-to-teal gradient
- Add a gradient icon badge (Shield icon in a rounded-xl gradient container)
- Title with `bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-600`
- Primary tab bar gets the same **pill-style navigation** with emerald active gradient
- Secondary sub-tab bar gets a refined underline treatment with emerald accent color
- NotificationBell moves into the hero banner area (top-right of banner)
- Wrap in `PageShell`

### 4. Shared Tab Navigation Component (`src/components/aurora-ui/PillTabNav.tsx`)
- Create a reusable pill-style tab navigation component both hubs can share
- Props: `tabs`, `activeTab`, `onTabChange`, `accentColor` (gradient class)
- Each tab is a rounded-lg button with: icon, label, gradient active state, muted hover state
- Horizontal scroll on mobile with hidden scrollbar

## Visual Summary

```text
+----------------------------------------------------------+
| [Icon Badge]  Title (gradient text)          [CTA Button] |
|  Subtitle text                                            |
|  (decorative blur orbs in background)                     |
+----------------------------------------------------------+
|                                                          |
| [ Tab 1 ]  [ Tab 2 ]  [ Tab 3 ]  ... (pill navigation)  |
|                                                          |
| +--- Sub-tabs (underlined) ---------------------------+  |
| | Sub A  |  Sub B  |  Sub C  |                        |  |
| +----------------------------------------------------|  |
|                                                          |
|  Content area with glassmorphic cards                    |
|  (rounded-2xl, backdrop-blur, hover shadows)             |
+----------------------------------------------------------+
```

## Technical Details

### Files to Create
| File | Purpose |
|------|---------|
| `src/components/aurora-ui/PillTabNav.tsx` | Reusable pill-style tab navigation with gradient active states |

### Files to Modify
| File | Changes |
|------|---------|
| `src/pages/CoachHub.tsx` | Replace header with HeroBanner, replace TabsList with PillTabNav, wrap in PageShell, purple/indigo gradient theme |
| `src/pages/AdminHub.tsx` | Replace header with HeroBanner, replace tab bars with PillTabNav, wrap in PageShell, emerald/teal gradient theme |
| `src/components/coach/CoachDashboardTab.tsx` | Replace Card stats with MetricCard, add glassmorphic card styling |
| `src/components/coach/CoachClientsTab.tsx` | Add glassmorphic card styling to containers |
| `src/components/coach/CoachPlansTab.tsx` | Add glassmorphic card styling |
| `src/components/coach/CoachProductsTab.tsx` | Add glassmorphic card styling |
| `src/components/coach/CoachMarketingTab.tsx` | Add glassmorphic card styling |
| `src/components/coach/CoachSettingsTab.tsx` | Add glassmorphic card styling |

### Color Themes
- **Projects**: amber-500/yellow-600 (gold tier)
- **Coach Hub**: purple-500/indigo-600 (professional coaching)
- **Admin Hub**: emerald-500/teal-600 (authority/system)

Each hub gets its own gradient identity while sharing the same structural layout and component library, creating a cohesive but distinct visual experience across all three management interfaces.
