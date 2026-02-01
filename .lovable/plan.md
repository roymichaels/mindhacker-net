
# Settings Modal Implementation Plan

## Problem Analysis

Currently, when a user clicks "Settings" (הגדרות) in the account dropdown, it opens a `ProfileDrawer` component that shows the **identity card / transformation journey** content (with Orb, level stats, values, traits, etc.) - NOT actual app settings.

This is confusing because:
1. The drawer shows profile/identity data, not settings
2. Users expect settings to include: account info, preferences, language, theme, notifications, etc.
3. Major apps (Duolingo, Spotify, etc.) have dedicated settings modals with organized sections

---

## Solution Overview

Create a new **SettingsModal** component that follows modern app UX patterns with:
- Tabbed navigation for different setting categories
- Clean, organized layout
- Proper settings functionality

---

## Settings Sections

### 1. Profile Tab
- Display name (editable)
- Email (read-only)
- Bio/about (editable)
- Avatar/Orb preview

### 2. Aurora Preferences Tab
- Communication tone (warm/direct/playful)
- Intensity (gentle/balanced/challenging)
- Gender/pronoun preference

### 3. Appearance Tab
- Theme toggle (light/dark)
- Language toggle (Hebrew/English)

### 4. Notifications Tab (future expansion)
- Placeholder for notification settings

### 5. Account Tab
- Sign out button
- Link to privacy policy
- Link to terms of service

---

## Technical Implementation

### Files to Create
1. **`src/components/settings/SettingsModal.tsx`** - Main modal component with tabs
2. **`src/components/settings/tabs/ProfileSettingsTab.tsx`** - Profile editing
3. **`src/components/settings/tabs/AuroraPreferencesTab.tsx`** - Aurora AI preferences (reuse existing `AuroraProfileSettings` logic)
4. **`src/components/settings/tabs/AppearanceSettingsTab.tsx`** - Theme and language
5. **`src/components/settings/tabs/AccountSettingsTab.tsx`** - Account actions
6. **`src/components/settings/index.ts`** - Exports

### Files to Modify
1. **`src/components/dashboard/DashboardLayout.tsx`** 
   - Replace `ProfileDrawer` with `SettingsModal`
   - Update state from `profileOpen` to `settingsOpen`

2. **`src/components/aurora/AuroraAccountDropdown.tsx`** 
   - Keep `onOpenSettings` callback (already exists)

3. **`src/i18n/translations/he.ts`** & **`src/i18n/translations/en.ts`**
   - Add new translation keys for settings sections

---

## UI Design

```text
┌─────────────────────────────────────────────────────────────┐
│  ✕                         הגדרות                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐    │
│  │ פרופיל │ │ אורורה │ │  מראה  │ │ התראות │ │ חשבון  │    │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘    │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                                                       │  │
│  │  Profile / Aurora / Appearance / Account content      │  │
│  │                                                       │  │
│  │  - Display Name: [_____________]                      │  │
│  │  - Email: user@example.com                            │  │
│  │  - Bio: [___________________]                         │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                      שמור                              │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Features

1. **Glassmorphism design** - Follows existing theme with `backdrop-blur-xl`, gradient backgrounds
2. **Tabs component** - Uses existing `@radix-ui/react-tabs` via shadcn/ui
3. **RTL/LTR support** - Proper direction handling for Hebrew/English
4. **Mobile responsive** - Works on all screen sizes
5. **Persists settings to database** - Uses existing `profiles` table

---

## Existing Code to Reuse

- `AuroraProfileSettings` component logic (tone, intensity, gender preferences)
- `useTheme` from next-themes for dark/light toggle
- `useLanguage` context for language switching
- Profile fetching pattern from `AuroraAccountDropdown`

---

## Implementation Sequence

1. Create the settings folder structure with all tab components
2. Create the main `SettingsModal` component with Tabs
3. Update `DashboardLayout` to use the new modal instead of drawer
4. Add translation keys for new settings labels
5. Test the flow end-to-end
