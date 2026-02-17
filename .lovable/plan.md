

# Merge "Me" Page with Profile Content

## What Changes

The current `/me` page shows a stats grid and two buttons (Profile, Settings) that open separate modals/drawers. This feels disconnected. The redesign renders the **Profile Identity Card** directly inline as the page content, with a **Settings gear icon** to open the settings modal.

## New Layout

```text
+------------------------------------------+
|  [Settings gear icon - top corner]       |
|                                          |
|  HERO IDENTITY CARD (Orb + Title)        |
|  Lv.117 | 925 tokens | 2 streak         |
+------------------------------------------+
|  Consciousness | Clarity | Readiness     |
+------------------------------------------+
|  My Values (tags)                        |
+------------------------------------------+
|  Dominant Traits (tags)                  |
+------------------------------------------+
|  Life Direction + clarity bar            |
+------------------------------------------+
|  Career Path                             |
+------------------------------------------+
|  Transformation (habits)                 |
+------------------------------------------+
|  [Edit Journey] [Regenerate AI]          |
+------------------------------------------+
|                                          |
|  Settings Modal (opens on gear click)    |
+------------------------------------------+
```

## Technical Details

### File: `src/pages/MeTab.tsx` (rewrite)
- Remove `StatsGrid`, `ProfileDrawer`, and the two-button grid
- Import and render `ProfileContent` directly inline (no modal/drawer wrapper)
- Pass `onClose` as undefined since it's not in a modal
- Add a floating/absolute Settings gear icon button at the top of the page
- Keep `SettingsModal` as a modal triggered by the gear icon
- Keep SEO logic as-is

### File: `src/components/dashboard/ProfileContent.tsx` (minor edit)
- Make `onClose` truly optional -- remove the close button reference if the hero section had one
- The component already accepts `onClose?` so it works standalone without changes

### Cleanup
- `ProfileDrawer` and `ProfileModal` become unused from the Me tab (may still be used elsewhere, so keep files)
- `StatsGrid` is removed from Me tab since ProfileContent already shows Level, Tokens, Streak in the hero card -- no data is lost

### What stays the same
- Settings modal with all 4 tabs (Profile, Aurora, Appearance, Account) -- unchanged
- ProfileContent component internals -- unchanged
- All data hooks and queries -- unchanged
