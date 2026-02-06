
# Unify Hub Pages with Reusable Components and Fix Colors

## Problem
1. The **Health Status Card** uses hardcoded dark colors (`from-gray-900/80`, `bg-gray-800`) that break in light theme
2. The **Consciousness page** has a unique dark-only header (`from-blue-950 to-gray-900`, yellow text) that doesn't match the standardized pattern used by Hobbies, Purpose, Finances, etc.
3. All 8 hub pages (Health, Business, Consciousness, Hobbies, Purpose, Finances, Relationships, Learning) repeat the exact same layout structure with only colors and data changing -- massive code duplication

## Solution
Create a shared `PillarHubLayout` component and a `PillarToolsGrid` component, then refactor all hub pages to use them.

## Technical Plan

### 1. Create `src/components/hub-shared/PillarHubLayout.tsx`
A reusable layout component that renders:
- **Header banner**: theme-aware gradient with icon, title, description, and "Start Journey" button
- **Decorative circles**: consistent across all hubs
- Uses color config passed as props (matching the Hobbies/Purpose pattern: `from-{color}-100 to-{color}-50 dark:from-{color}-950`)

Props:
```
{
  colorScheme: { light gradient, dark gradient, text, border, button gradient, icon bg, etc. }
  icon: LucideIcon
  title: { he: string, en: string }
  description: { he: string, en: string }
  journeyPath: string
  extraHeaderButtons?: ReactNode
  children: ReactNode  // tools grid + status card
}
```

### 2. Create `src/components/hub-shared/PillarToolsGrid.tsx`
A reusable tools grid matching the Hobbies/Finances pattern:
- `grid grid-cols-2 md:grid-cols-3 gap-4`
- Theme-aware card styling: `bg-white/80 dark:bg-gray-900/60`
- Icon with gradient background
- Title + description

Props: array of tool items with icon, title, description, onClick

### 3. Create `src/components/hub-shared/PillarStatusCard.tsx`
A reusable "index" card (like Hobbies' "Leisure Balance Index"):
- Theme-aware: `bg-gradient-to-br from-{color}-100/50 ... dark:from-{color}-950/30`
- Icon + title + description + CTA button
- Can accept custom children for pages with actual data (like Health)

### 4. Create color presets in `src/components/hub-shared/pillarColors.ts`
Define all 8 pillar color configs so each page just picks one:
```
consciousness: { primary: 'blue', secondary: 'cyan', ... }
business: { primary: 'amber', secondary: 'orange', ... }
health: { primary: 'red', secondary: 'rose', ... }
relationships: { primary: 'pink', secondary: 'rose', ... }
finances: { primary: 'emerald', secondary: 'green', ... }
learning: { primary: 'indigo', secondary: 'violet', ... }
purpose: { primary: 'purple', secondary: 'fuchsia', ... }
hobbies: { primary: 'teal', secondary: 'cyan', ... }
```

### 5. Fix HealthStatusCard theme awareness
Replace hardcoded dark colors:
- `from-gray-900/80 to-gray-950/80` --> `bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl`
- `bg-gray-800` progress bars --> `bg-muted` 
- `border-red-800/30` --> `border-red-200 dark:border-red-800/30`
- Dark-only text colors --> theme-aware pairs

### 6. Fix Consciousness page
- Replace hardcoded dark header (`from-blue-950 to-gray-900`, yellow text) with theme-aware pattern: `from-blue-100 to-blue-50 dark:from-blue-950 dark:to-gray-900`, `text-blue-700 dark:text-blue-400`
- Use `PillarHubLayout` + `PillarToolsGrid`

### 7. Refactor all hub pages
Each page (Health, Business, Consciousness, Hobbies, Purpose, Finances, Relationships, Learning) becomes ~30-50 lines:
- Import `PillarHubLayout`, color preset, tool definitions
- Pass tools array and children for any custom content (like Health's StatusCard or Business's "My Businesses" section)

### Files to Create
- `src/components/hub-shared/PillarHubLayout.tsx`
- `src/components/hub-shared/PillarToolsGrid.tsx`
- `src/components/hub-shared/PillarStatusCard.tsx`
- `src/components/hub-shared/pillarColors.ts`
- `src/components/hub-shared/index.ts`

### Files to Edit
- `src/pages/Consciousness.tsx` -- use shared components, fix dark-only colors
- `src/pages/Health.tsx` -- use shared components
- `src/pages/Business.tsx` -- use shared components
- `src/pages/Hobbies.tsx` -- use shared components
- `src/pages/Purpose.tsx` -- use shared components
- `src/pages/Finances.tsx` -- use shared components
- `src/pages/Relationships.tsx` -- use shared components
- `src/pages/Learning.tsx` -- use shared components
- `src/components/health-hub/HealthStatusCard.tsx` -- fix theme-aware colors
- `src/components/health-hub/HealthToolsGrid.tsx` -- use shared PillarToolsGrid or keep as-is (it already has theme-aware classes)

Pages with custom content (Business with "My Businesses", Health with StatusCard, Consciousness with Identity Status + modals) will pass that content as children to the layout.
