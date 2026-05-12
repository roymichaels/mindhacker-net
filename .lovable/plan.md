## 1. Remove journaling chips from AION composer

**File:** `src/pages/AuroraPage.tsx`

- Delete the `quickActions` array (Dreams / Gratitude / Plan / Beliefs).
- Delete the chip-row `<div>` that maps `quickActions` above the composer.
- Delete the four `Aurora*Modal` mounts and the `activeModal` state + `WidgetModal` type.
- Drop now-unused imports (`useState`, `Moon, Heart, Target, Brain`, the three modal components).
- Keep the floating dock containing **only** `GlobalChatInput` (composer, voice, send, AION presence).

Result: composer layer is clean; all journaling lives in `/journal` (Journaling Hub) only.

## 2. Redesign AppName menu — premium compact dropdown

**File:** `src/components/navigation/AppNameMenu.tsx`

Replace the full-height side `Sheet` with a compact `Popover` anchored under the header trigger.

### Trigger (unchanged behavior)
`☰ מיינד OS ⌄` button — keeps current styling.

### Popover content
- Anchored under trigger, `align="start"`, `sideOffset={8}`.
- Width: `w-[300px]` (mobile: `w-[calc(100vw-1.5rem)] max-w-[320px]`).
- Auto height (no `100dvh`), `max-h-[min(560px,calc(100dvh-5rem))]`, internal `overflow-y-auto` only if needed.
- Style: `rounded-2xl bg-card/95 backdrop-blur-2xl ring-1 ring-white/[0.08] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.55)] p-0 overflow-hidden`.
- Subtle `motion` fade+scale on open (already provided by Radix Popover animations).

### Internal structure (two contained sections, clear hierarchy)

```text
┌─ Popover ───────────────────────┐
│  ┌ Account (nested AS-IS) ────┐ │   px-3 pt-3 pb-2
│  │  <AppNameDropdown />        │ │   self-contained component
│  └─────────────────────────────┘ │
│  ── divider (mx-3) ──────────── │
│  NAVIGATION   (10px caption)    │   px-3 pt-2 pb-1
│  • בית                          │   compact rows: h-9, px-2.5,
│  • שוק חופשי                    │   rounded-lg, text-[13.5px],
│  • אסטרטגיה                     │   icon 16px, gap-2.5
│  • היפנוזה                      │
│  • יומן            ← new        │
│  • קהילה                        │
│  • לימוד                        │
└─────────────────────────────────┘
```

- Account block keeps `<AppNameDropdown />` rendered AS-IS (independent dropdown, not flattened).
- Divider: `h-px bg-white/[0.08] mx-3 my-1`.
- Nav rows: tighter than current (`h-9` not `py-2.5`), `rounded-lg`, `hover:bg-white/[0.05]`, no large empty padding.
- Add Journal entry to nav list (icon `BookOpen`, path `/journal`, `יומן` / `Journal`); rest pulled from `OS_TABS` as today.

### DashboardLayout

No changes — it already imports `AppNameMenu`. Compact behavior controlled inside the component.

### Visual goal
Feels like a floating command palette / app switcher, not a full-screen drawer:
- compact height, tight padding
- nested account component visually contained (its own surface)
- nav block clearly separated under a labeled divider
- no dead vertical space, no full-viewport sheet
