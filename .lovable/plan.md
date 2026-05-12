## Menu items open as modal hubs (no page navigation)

Goal: tapping any item in the AppName menu (Home, Free Market, Strategy, Hypnosis, Journal, Community, Learn) opens a **fullscreen modal hub overlay** layered above the current screen, instead of routing away. Existing routes stay intact for deep links and back-compat — but the menu never navigates.

### 1. New global hub-modal layer

Create:

- `src/contexts/HubModalContext.tsx` — exposes `openHub(id: HubId)`, `closeHub()`, and current `activeHub`.
- `src/components/navigation/HubModal.tsx` — single fullscreen overlay that renders the hub component for `activeHub`.

```text
HubId = 'home' | 'fm' | 'strategy' | 'hypnosis' | 'journal' | 'community' | 'study'
```

Component map (lazy-loaded with `React.lazy` to avoid bundling everything up front):

| HubId       | Component rendered inside the modal              |
|-------------|--------------------------------------------------|
| home        | `Dashboard` (existing `/dashboard` page)         |
| fm          | `FMAppShell` (with synthetic outlet → FM home)   |
| strategy    | `StrategyPage`                                   |
| hypnosis    | `HypnosisPage`                                   |
| journal     | `JournalingHub`                                  |
| community   | `CommunityLayoutWrapper`                         |
| study       | `LearnPage` (or whatever `/learn` resolves to)   |

### 2. Modal shell (mobile-first, AION-presence aligned)

Use Radix `Dialog` styled as a fullscreen surface (not a side `Sheet`, since these are full hubs):

- `fixed inset-0 z-[70]` overlay with `bg-background` and `backdrop-blur-2xl`.
- `motion` enter: fade + slight scale-up (`enter` keyframe from the design system).
- Top bar (40px): small AION orb on the start side, hub label centered, `X` close on the end side. No back button.
- Body: `flex-1 min-h-0 overflow-y-auto` containing the lazy-loaded hub component.
- Esc / swipe-down on mobile / X click → `closeHub()`.
- Trap focus and lock body scroll while open.

Routing inside the modal: hub components that internally use `useNavigate` still work — but routes that change the page (e.g. `/strategy/presence`) will mutate the URL without unmounting the modal because the modal is rendered above `<Routes>`. We keep the modal open across these in-hub navigations; closing the modal returns the user to wherever they were before opening it (we snapshot `location` on open and `navigate(snapshot)` only when needed for cleanup).

For v1 we deliberately do **not** try to sync the URL to the modal state. Direct URL visits to `/strategy` etc. still render the page normally without the modal — the modal is purely an in-app navigation overlay. This keeps scope contained.

### 3. Wire up

- Mount `<HubModalProvider>` near the top of the auth shell (inside `ProtectedAppShell`, above `<Outlet />`).
- Mount `<HubModal />` inside the provider so it's always available globally.
- Update `src/components/navigation/AppNameMenu.tsx`:
  - Remove `useNavigate` + `go(path)`.
  - Each nav button calls `openHub(item.id)` then `setOpen(false)` to close the AppName popover.
  - `home` maps to id `'home'`; rest come from `OS_TABS` directly.

### 4. Out of scope for this turn

- Converting bottom tab bar / other entry points (FM bottom tab, header brand link, push notifications, deep links) — they keep navigating as today. Only the AppName menu items become modal-openers per the user's request.
- Closing the modal automatically when the inner hub deeplinks elsewhere — kept open intentionally, matching "environment" feel.
- Per-hub state preservation across opens (each open mounts fresh).

### 5. Files

- new: `src/contexts/HubModalContext.tsx`
- new: `src/components/navigation/HubModal.tsx`
- edit: `src/components/navigation/AppNameMenu.tsx`
- edit: `src/components/auth/ProtectedAppShell.tsx` (or equivalent) to wrap children in `<HubModalProvider>` and render `<HubModal />`.

### Result

Tapping any menu item slides up an immersive AION-feeling overlay containing that hub. The user feels they’re entering an environment AION opens for them — not navigating to a page.
