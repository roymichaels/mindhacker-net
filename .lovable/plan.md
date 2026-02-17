

# Compact UI Pass — Reduce Scrolling Across All Pages

## Problem
The V2 upgrade over-inflated padding, gaps, and element sizes. Every page now requires excessive scrolling. The goal is to tighten everything so more content fits on screen without losing the visual hierarchy.

## Changes

### 1. Global Components (Aurora UI)

**PageShell.tsx**
- Padding: `py-8 md:py-10 pb-16` → `py-4 md:py-6 pb-14`

**HeroBanner.tsx**
- Padding: `p-8 md:p-10` → `p-5 md:p-6`
- Title: `text-2xl md:text-3xl` → `text-xl md:text-2xl`
- Subtitle leading: `leading-7` → `leading-6`

**SectionHeader.tsx**
- Bottom margin: `mb-4` → `mb-2`

**MetricCard.tsx**
- Padding: `p-4 md:p-5` → `p-3 md:p-4`
- Value text: `text-2xl` → `text-xl`
- Icon container: `w-9 h-9 mb-1.5` → `w-7 h-7 mb-1`

**GradientCTAButton.tsx**
- Height: `h-14` → `h-11`

### 2. Today Page (TodayTab.tsx)
- Root gap: `space-y-8` → `space-y-4`
- Grid gap: `gap-6` → `gap-4`

### 3. Plan Page (PlanTab.tsx)
- Root gap: `space-y-8` → `space-y-4`
- Missions section: `space-y-4` → `space-y-2`
- Missions card padding: `p-6` → `p-4`

### 4. Sessions Page (HypnosisLibrary.tsx)
- Root gap: `space-y-8` → `space-y-4`
- Page header title: `text-3xl` → `text-2xl`
- Daily Session Hero: `p-8 md:p-10` → `p-5 md:p-6`, title `text-2xl md:text-3xl` → `text-xl md:text-2xl`, reduce inner margins
- Quick session cards: `p-6 min-h-[120px]` → `p-4 min-h-[88px]`
- CTA button inside hero: `h-14` → `h-11`

### 5. Me/Profile Page (ProfileContent.tsx)
- Root gap: `space-y-8` → `space-y-4`
- Identity hero: `p-8 md:p-10` → `p-5 md:p-6`, orb size 200 → 140, name `text-3xl` → `text-2xl`
- Level/tokens chips: `px-4 py-2 text-base` → `px-3 py-1.5 text-sm`
- AuroraCard header: `px-5 py-4` → `px-4 py-3`, title `text-base` → `text-sm`
- AuroraCard body: `p-5` → `p-4`
- Insights grid icons: `w-6 h-6` → `w-5 h-5`, button padding `p-4` → `p-3`
- CTA section: `pt-4 pb-6` → `pt-2 pb-4`

### 6. Checklists Card (ChecklistsCard.tsx)
- Header: `p-5` → `p-4`
- Checklist row: `p-5` → `p-3`
- Item: `p-4` → `p-3`

### 7. Habits Card (TodaysHabitsCard.tsx)
- Header/content: `px-6 pt-6 pb-6` → `px-4 pt-4 pb-4`
- Habit rows: `p-4` → `p-3`

## Files Modified (11)
- `src/components/aurora-ui/PageShell.tsx`
- `src/components/aurora-ui/HeroBanner.tsx`
- `src/components/aurora-ui/SectionHeader.tsx`
- `src/components/aurora-ui/MetricCard.tsx`
- `src/components/aurora-ui/GradientCTAButton.tsx`
- `src/pages/TodayTab.tsx`
- `src/pages/PlanTab.tsx`
- `src/pages/HypnosisLibrary.tsx`
- `src/components/dashboard/ProfileContent.tsx`
- `src/components/dashboard/v2/TodaysHabitsCard.tsx`
- `src/components/dashboard/unified/ChecklistsCard.tsx`

