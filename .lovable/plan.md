## Goal

Restructure the side drawer and its account entry point so identity feels *layered* and *premium* — not like a flat settings page. The avatar becomes a gateway, the drawer becomes a floating identity environment.

## Scope

Frontend / presentation only. No backend, no data, no route changes. Two files:
- `src/components/navigation/AppSideMenu.tsx` (the drawer)
- (consequence) the trigger inside it

No changes to `AuroraAccountDropdown`, `HeaderActions`, profile modal, or any data hook.

---

## 1. Trigger — avatar as gateway

In `AppSideMenu.tsx`, replace the current `Menu` icon + "MindOS" + chevron trigger with an **avatar pill**:

- `AvatarMiniPreview size={32}` inside a 36×36 ring (`ring-1 ring-border + subtle primary glow halo`).
- No "MindOS" text, no chevron.
- `aria-label="Open account"`.
- Tap → opens the drawer (no navigation, no profile modal).

Result: the avatar is the *only* thing the user taps to enter their space. It now feels like an identity entry point, not a hamburger.

## 2. Drawer container — floating premium panel

Currently `SheetContent` is `w-screen sm:max-w-sm` flush against the edge with hard borders. Change to a **floating layered surface**:

- Width: `w-[88vw] max-w-[360px]`.
- Inset from edges: wrap inner content in a container with `m-2 rounded-3xl border border-white/10 bg-card/95 backdrop-blur-2xl shadow-[0_30px_120px_rgba(0,0,0,0.55)]` and `h-[calc(100dvh-1rem)] overflow-hidden`.
- Remove the flush `border-border` look; replace section dividers with `border-white/5` hairlines.
- Internal padding: `p-3` outer, `gap-1` between menu items, generous vertical rhythm.

Result: feels like Arc / ChatGPT desktop — a floating panel, not a full-page takeover.

## 3. Identity Card — the centerpiece

Replace the current single-row account button with a dedicated **Identity Card** at the top of the drawer:

```
┌────────────────────────────────┐
│   [ glow halo ]                │
│                                │
│       ◉  ← HD avatar (96px)    │
│                                │
│       Display Name             │
│       email@domain.com         │
│       ✶ Identity title (opt)   │
│                                │
│   [ Lv.x · ⬢ tokens · 🔥 streak ]
└────────────────────────────────┘
```

Implementation details:
- Card: `rounded-2xl bg-gradient-to-b from-primary/10 to-transparent border border-primary/15 p-5` with a soft inner glow (`absolute inset-[-30%] rounded-full bg-primary/15 blur-2xl` behind the avatar).
- Avatar: `AvatarMiniPreview size={96}` centered, wrapped in a 104×104 ring (`ring-2 ring-primary/30`).
- Below avatar: `displayName` (text-base font-semibold), `user?.email` (text-xs text-muted-foreground), optional `dashboard.identityTitle` chip.
- Footer row inside the card: small Level / Tokens / Streak pills (pull from `useUnifiedDashboard`, same hook `AuroraAccountDropdown` already uses). Hidden gracefully when `dashboard.isLoading`.
- The **whole card is the press target** → `openProfile()`. Tap feedback: subtle scale on press, hover ring brighten.

Result: the avatar visible in the trigger appears again as a *larger HD self-portrait* inside the card — exactly the "secondary mini-avatar layer" requested. Strong digital identity anchor.

## 4. Section hierarchy & breathing room

Re-group the existing menu items (no items added or removed) with stronger section headings and more space:

- **Section A — Quick Actions** (new tiny header, optional)
  - Profile (already the card, so omit the duplicate `User` row)
  - Settings
  - Subscriptions
- **Section B — Environments** (renamed from "Hubs")
  - Home, plus existing `tabs.map(...)` rows
- **Section C — Preferences**
  - Theme toggle, Language toggle, Docs
- **Section D — Workspaces** (only when admin/practitioner/affiliate — unchanged logic)
- **Footer** — Report a bug, Sign out

Style updates for `MenuItem`:
- Padding `px-3 py-3` (was `py-2.5`), `text-[15px]`, `gap-3`, `rounded-xl`, hover `bg-white/5`.
- Icon container 28×28 rounded-lg `bg-white/5` so each row has a small icon chip → looks like Linear/Notion rows.
- Section headings: `px-3 pt-4 pb-2 text-[10px] tracking-[0.18em] uppercase text-muted-foreground/70`.
- Replace `border-t border-border mt-2` between sections with a single hairline `border-t border-white/5`.

## 5. Behavior changes summary

| Before | After |
|---|---|
| Hamburger + "MindOS" text opens drawer | Avatar pill (only) opens drawer |
| Top row of drawer = button → instantly opens profile | Top of drawer = visual Identity Card; card tap → profile |
| Flush full-width sheet with hard borders | Floating rounded panel, inset, glassy, soft shadow |
| Tight `py-2.5` rows, plain text | Larger `py-3` rows with icon chips, calm spacing |
| Sections separated by visible borders | Sections grouped under uppercase labels with subtle hairlines |

## Out of scope

- Settings panel itself
- Profile modal contents (still opens existing `openProfile()`)
- Desktop side nav (`DesktopSideNav`) — drawer is mobile/tablet primary
- Any non-presentation logic (auth, roles, data queries all preserved unchanged)

## Validation

1. Tap top-left avatar → drawer slides in as floating panel, not full-screen flush.
2. Identity Card dominates the top with a large HD avatar; name/email/level/streak visible.
3. Tap card → profile modal opens (existing behavior).
4. Tap any menu row → navigates and closes drawer (existing behavior preserved).
5. Theme/language/sign-out still work.
6. RTL layout (Hebrew) still mirrors correctly — drawer slides from right, icon chips align right.