
# MindOS Mobile Shell — Audit & Architecture Reset

Reference set: 5 Lovable mobile screenshots (chat surface, "…" sheet, project list drawer, workspace sheet, account sheet) compared against the current MindOS mobile shell at 402×716.

---

## 1. What Lovable is actually doing (structural read)

Lovable's mobile shell is **one full-bleed surface with three persistent affordances and everything else as a sheet**. Nothing floats, nothing overlaps, nothing competes.

### 1a. The shell is exactly three layers, never more
1. **Status-bar-aware top bar** — pill-shaped, transparent, sits inside the safe area. Three controls only:
   - Left: hamburger (`≡`) → opens the **left drawer** (project list).
   - Center: **project switcher pill** ("MindOS ▾") — this is the *only* thing that names the current context.
   - Right: a single contextual action (▶ play / preview toggle).
2. **Main surface** — fills 100% of the remaining viewport. On the chat route it is *just* the message stream. No cards, no tabs, no sub-headers, no second navbar.
3. **Bottom composer block** — anchored, safe-area padded. Three rows, in order:
   - Suggested follow-up chips (horizontal scroll, single line, fade at edges).
   - Multiline input ("Ask Lovable…"), no border, no card, just a rounded rect that grows.
   - Action row: `+` (attach), `…` (more), spacer, mode pill (Build/Plan), mic. All circular, ~36px, ghost.

That's the entire shell. There is no bottom tab bar. There is no side rail. There is no second header. There is no floating widget.

### 1b. Why it feels native
- **One overlay rule.** Tapping the top-right "…" or any header control opens a **bottom sheet** (rounded top, grab handle, dim scrim, content scrolls). The sheet *replaces* attention — the underlying chat dims and freezes, it does not slide or shrink. Only one sheet at a time.
- **Drawer is a true drawer, not a modal.** The left "≡" pushes a panel in from the edge that occupies ~85% of width. The remaining ~15% sliver still shows the dimmed previous surface — that sliver is the universal "tap to dismiss" target. The main surface itself does not resize, reflow, or unmount.
- **No chrome on the body.** No borders, no glow, no theme tint, no ambient gradients. The background is one flat color across header + body + composer. The sheets and drawer are one shade lighter (`#1a1a1a` over `#0a0a0a`).
- **Touch targets are huge and identical.** Every pill is the same height (~40px), same corner radius, same ghost stroke. The eye sees one design language.
- **Hierarchy by position, not by color.** Primary action lives in the bottom-right (mic). Secondary lives bottom-left (`+`). Identity lives top-center. Navigation lives top-left. AION-equivalent action lives top-right. Five fixed slots — that's the entire grammar.

### 1c. How each surface is handled

| Affordance | Lovable behavior |
|---|---|
| **Top header** | Sticky pill row, `pt-safe`. Transparent over body. Never disappears. Never grows. |
| **Left drawer** (≡) | Edge-anchored sheet, ~85% width. Contents top-down: search pill + filter pill, "Create new project", project rows (icon + name + relative time), then a sticky **footer chip**: workspace avatar + name + account avatar (red dot for unread). Tapping the workspace chip opens a *second* sheet (workspace switcher). Tapping the avatar opens a *third* sheet (account). These never stack on screen — opening one closes the previous. |
| **Bottom sheets** ("…" menu) | Roughly 70% height, rounded top, grab handle, plain list of icon+label rows. No section headers, no descriptions. Pure list. Sheet is the *only* paradigm for secondary navigation. |
| **Account/profile** | Bottom sheet from the avatar. Header row = avatar + name + email. Then `Inbox`, `What's new` (with red dot). Divider. Then `Profile`, `Account settings`, `Connectors`, `Support`, `Documentation`, `Appearance`, `Notification settings`, `Community`, `Send feedback`, `Sign out`. No tabs, no nesting visible — just one flat list with a thin divider. |
| **Composer** | Lives inline at the bottom of the chat surface, never floats over content. Suggestion chips are part of the composer block, not the message stream. |
| **Project switcher** | The center pill is the switcher. Tapping it does **not** open a dropdown — it opens the same left drawer. So the switcher and the drawer are one mechanism with two entry points. |

---

## 2. Current MindOS state (what the screenshots and code show)

Looking at `DashboardLayout.tsx` + `OSDrawer.tsx` + `AuroraLayout.tsx`:

### 2a. Structurally you are already close to Lovable's grammar
- Header is a 3-slot pill row (`OSDrawer | MindOSSheet | AIONPresenceButton`). ✓
- Full-screen `AuroraDock` overlay is gone. ✓
- Route theme tint, ambient glow, FM top nav, StoryWorldShell auto-mount are gone. ✓
- Composer is mounted inside `AuroraLayout` (no global floating dock). ✓
- `stripReasoning()` + edge guards stop the "internal thinking" leak. ✓

### 2b. Where it still feels like a web app
1. **Drawer footer is a vertical stack of three buttons** (profile row, Settings row, Logout row). Lovable collapses identity to **one footer chip** that opens a sheet. Yours reads like a desktop side menu pinned to the bottom.
2. **Drawer body is a primary nav list** (Home + OS_TABS), not a contextual list. Lovable's drawer body is **content** ("projects"). For MindOS the equivalent content is **conversations / environments**, not a route table. You're using the drawer as a router, which makes the app feel like an admin panel.
3. **No bottom-sheet pattern for secondary actions.** "Settings" opens a `SettingsModal` (centered modal), not a bottom sheet. `HubModalHost` is a full-takeover surface that hides the header. Profile uses `ProfileModalContext` — yet another modal style. Three different modal grammars exist; Lovable has exactly one (sheet).
4. **The `MindOSSheet` switcher and the `OSDrawer` are competing for the same role.** Lovable's center pill *is* a re-entry into the drawer. In MindOS they open *different* surfaces with different content — the user has to learn two mental models for "where am I and where can I go."
5. **`AIONPresenceButton` routes to `/aurora`.** Lovable's top-right is a contextual action on the *current* surface. AION as the always-present "Jarvis" is currently a route, not a presence — it disappears the moment you're on /aurora because it would be redundant. The orb should be an **ambient signal** in the header that taps to *summon a sheet* (AION command panel), and only navigates as a fallback.
6. **Home is `/index`, not the chat surface.** Right now opening the app drops you into a dashboard-shaped page (`UserDashboard` via `DashboardLayoutWrapper`). Lovable's authenticated home is the working surface itself (chat or last project). MindOS's "home" should be AION chat, with hubs as **artifacts you can pull up via a sheet**, not as primary destinations.
7. **`HubModalHost` hides the header when active** (`hubActive` flag in `DashboardLayoutInner`). That's the inverse of native: in Lovable the header is *always* visible because it's the user's anchor. Hiding chrome to make room for a hub is exactly the "web app full-screen takeover" feeling you want gone.
8. **Drawer width on mobile is 300–320px on a 402px viewport** (~78%). Lovable's is ~85% with a clear dismiss sliver. Yours leaves enough background visible that the eye doesn't lock onto the drawer; it reads like a panel, not a sheet.
9. **Header height is `h-12` mobile / `h-14` desktop.** Lovable uses a single height (~44px) with the pill controls floating inside it. The two-height system makes the mobile preview feel cramped under the safe-area inset.
10. **AION-as-runtime is not wired to the shell.** `aion-brain` density / state exists, but the orb in the header has no visible state changes tied to it (focus / recovery / breakthrough / night). The orb is decorative, not a presence.

### 2c. What the screenshots specifically show
- IMG_1574 (chat): perfect Lovable example — three header pills, full chat body, suggestion chips above the composer, composer at bottom. **This is the target.**
- IMG_1575 (`…` sheet): a clean bottom sheet, list-only, no nested cards. **MindOS Settings/Profile/Hubs should all share this exact shape.**
- IMG_1577 (left drawer): note the **footer chip** showing workspace + avatar — that's the entire identity surface in 56px of height. Yours uses ~140px for the same thing.
- IMG_1578 (workspace sheet from drawer footer): proves the drawer footer is not a button, it's a *sheet trigger*.
- IMG_1579 (account sheet from avatar): proves account is a sheet, not a route or modal.

---

## 3. Diagnosis — the actual list of things wrong

In priority order:

1. **Two switcher mechanisms** — `OSDrawer` and `MindOSSheet` overlap in purpose.
2. **Three modal grammars** — `Sheet` (drawer), centered `Dialog` (Settings/Profile), full-screen `HubModalHost`. Pick one.
3. **Header disappears under `HubModalHost`** — kills the "always-on anchor" feeling.
4. **Drawer body is route navigation, not user content.**
5. **Drawer footer is a 3-row stack, not a single identity chip.**
6. **Home is a dashboard, not the chat surface.**
7. **Orb is a route trigger, not a presence/state indicator.**
8. **Hubs are destinations, not artifacts** — they take over the screen instead of opening as a sheet over the chat.
9. **Inconsistent header height + safe-area handling** between mobile and desktop reads as cramped on real devices.
10. **`AIONStateContext` / `aion-brain` signals are not bound to any visible orb state** — Jarvis is technically alive, experientially absent.

---

## 4. Proposed mobile shell architecture

### 4a. The five-slot grammar (Lovable + ChatGPT + Jarvis)

```
┌───────────────────────────────────────────────┐
│  pt-safe                                      │
│  [≡]      ┌─ MindOS ▾ ─┐         [● AION]    │  ← Header (44px, transparent, sticky)
├───────────────────────────────────────────────┤
│                                               │
│                                               │
│            ChatSurface (full bleed)           │  ← Main (only child)
│            • messages stream                  │
│            • inline artifact cards            │
│                                               │
│                                               │
├───────────────────────────────────────────────┤
│  ◀ chip · chip · chip · chip ▶                │  ← Suggestion strip (in composer block)
│  ┌───────────────────────────────────────┐   │
│  │ Ask AION…                             │   │  ← Multiline input
│  └───────────────────────────────────────┘   │
│  [+]  [⋯]                      [⊞]   [🎤]    │  ← Action row
│  pb-safe                                      │
└───────────────────────────────────────────────┘
```

**Five slots, never more:**
- **TL** = drawer trigger (≡)
- **TC** = environment/context pill ("MindOS ▾" — opens drawer; same surface, two entries)
- **TR** = AION orb (presence + tap = AION command sheet)
- **BL** = composer attach + more (`+`, `⋯`)
- **BR** = environment/mode shortcut + mic (`⊞`, 🎤)

### 4b. Component tree (target)

```
<AppShell>                          ← replaces DashboardLayout for authed routes
  <TopBar>                          ← single height, transparent, pt-safe
    <DrawerTrigger />               ← opens <LeftDrawer/>
    <EnvSwitcher />                 ← also opens <LeftDrawer/> (shared mechanism)
    <AIONOrb />                     ← reads AIONState; tap → <AIONSheet/>
  </TopBar>

  <MainSurface>                     ← single child, no padding, no background variation
    {route === "/" ? <ChatSurface/> : <ArtifactSurface/>}
  </MainSurface>

  <Composer />                      ← only on chat-bearing surfaces

  {/* Overlays — exactly one at a time */}
  <LeftDrawer />                    ← 85% width, dismiss sliver, footer chip
  <BottomSheet kind="env" />        ← environment switcher (≤55vh)
  <BottomSheet kind="aion" />       ← AION command panel (≤80vh)
  <BottomSheet kind="settings" />   ← settings list
  <BottomSheet kind="profile" />    ← account list
  <BottomSheet kind="hub:*" />      ← every hub (work, play, learn, etc.) becomes a sheet
</AppShell>
```

**One sheet primitive.** All of: settings, profile, hubs, AION command, env switcher → use the same `<BottomSheet>` component (rounded top, grab handle, scrim, single overlay enforced via context). Centered `Dialog` and `HubModalHost` go away as primary surfaces.

### 4c. Surface-by-surface spec

**Top header**
- `h-11` (44px) on all viewports, `pt-safe`.
- `bg-transparent` over body. No border. No tint. No glow.
- Three slots only. RTL flips left/right via `flex-row-reverse`.

**Left drawer**
- Width: `min(85vw, 360px)`. Side: `start` (RTL-aware).
- Body: **conversations list** (recent AION chats) + a small "Environments" section below it (Mind, Work, Play, …). Not a route table.
- Footer chip (single 56px row): workspace/avatar + display name → tap opens **Profile sheet**. No separate Settings or Logout buttons in the drawer — those live inside the Profile sheet.

**Environment switcher (TC pill)**
- Same drawer, opened from the center. Rename `MindOSSheet` → `EnvPill` and have it call `drawer.open()`. One mechanism.

**AION orb (TR)**
- Reads `AIONStateContext` density / mood:
  - calm/idle → slow breathing
  - focus → tighter pulse, brighter ring
  - recovery → cool tint, slower
  - breakthrough → bright flash + haptic on first paint
  - night → dimmed, very slow
- Tap → **AION sheet**: 1) status line (what AION is tracking now), 2) quick actions (start session / capture thought / open journal), 3) "Open full chat" → routes to `/aurora`.
- Long-press → mic (voice command).

**Composer**
- Lives inside `<ChatSurface>`. `pb-safe`. No floating, no global mount.
- Suggestion chips are *part of the composer block*, not floating above the message stream.

**Profile / account sheet**
- Mirror Lovable's IMG_1579: header (avatar + name + email), then a flat list. Settings, Subscription, Connectors, Appearance, Notifications, Support, Sign out. No nested tabs visible at this level.

**Hubs as artifacts**
- `HubModalHost` becomes `HubSheet`. Opening Work/Play/Learn does **not** unmount the chat or hide the header. The hub slides up as a sheet over the chat. Closing it returns you to the exact chat scroll position.
- The chat remains the trunk; hubs are branches you can pull up and drop.

**Home redefinition**
- `/` (authed) renders `<ChatSurface>` directly. The current `UserDashboard` becomes a hub sheet (`hub:dashboard`) that the user can summon, not the default landing.

### 4d. AION runtime wiring (the missing nervous system)

```
aion-brain (edge) ──► AIONStateContext (client)
                        │
                        ├── density: calm | focus | recovery | breakthrough | night
                        ├── mood:    HSL hint
                        ├── nudge:   { text, cta } | null
                        │
                        ▼
                 ┌──────┴──────┐
                 ▼             ▼
            <AIONOrb>     <ChatSurface>
            (visual       (proactive bubble
             state)        when nudge present)
```

- The orb is the *only* always-visible AION manifestation.
- Nudges from `aion-brain` surface as **AION-authored bubbles in the chat**, not toasts. That's the "Jarvis is here" feel.
- The `aion-brain` Hebrew/English persona stays untouched; only the *output channel* is rewired.

---

## 5. What to remove, move, or rebuild

**Remove from the shell**
- `MindOSSheet` as an independent surface (collapse into `EnvPill` that opens the drawer).
- Centered `SettingsModal` (becomes a sheet).
- `HubModalHost`'s header-hiding behavior (`hubActive` branch in `DashboardLayoutInner`).
- The 3-row footer in `OSDrawer` (collapse to one chip).
- The dual `h-12` / `h-14` header heights (single 44px).

**Move**
- `OSDrawer` body: from route list → conversations + environments.
- Profile/Settings/Logout: from drawer footer rows → inside the Profile sheet.
- All hubs: from full-screen pages → `<BottomSheet>` instances over the chat.
- Suggestion chips: from chat body → composer block.

**Rebuild**
- `AppShell` (replaces `DashboardLayout` for authed routes).
- One `<BottomSheet>` primitive + a single `OverlayController` context that enforces "one overlay at a time" and handles back-button / scrim dismiss.
- `<AIONOrb>` bound to `AIONStateContext` with five visual states.
- Authed `/` route → `<ChatSurface>` (not `UserDashboard`).

**Keep untouched**
- Identity / DNA, `award_unified_xp`, `action_items`, Quest specs, gamification, auth, onboarding flow, pillar data models, `aion-brain` decision logic itself.
- All edge functions' business logic — only the output channel changes.
- `stripReasoning()` + edge guards (already correct).

---

## 6. Implementation order (when you green-light the build)

1. **`OverlayController` + `<BottomSheet>` primitive.** Single source of truth for sheets; enforces single-overlay rule. No visual changes yet.
2. **`AppShell` scaffold** with single 44px transparent header + the existing chat surface as the only main child. Swap `DashboardLayout` import behind a feature flag.
3. **Collapse `MindOSSheet` into `EnvPill`** that calls `drawer.open()`. Delete the duplicate switcher surface.
4. **Rebuild `OSDrawer` body** as conversations + environments; collapse footer to one identity chip.
5. **Convert `SettingsModal` → settings sheet**, `ProfileModal` → profile sheet (mirrors IMG_1579).
6. **Convert `HubModalHost` → `HubSheet`** and stop hiding the header.
7. **Move home route** from `UserDashboard` → `<ChatSurface>`. Demote dashboard to `hub:dashboard`.
8. **Wire `<AIONOrb>` to `AIONStateContext`** (five visual states + tap → AION sheet).
9. **Surface `aion-brain` nudges as in-chat bubbles** (replaces any toast-style proactive output).
10. **Delete dead chrome:** any remaining `BottomTabBar`, `BottomHudBar`, `DesktopSideNav`, `TopNavBar`, `AppNameMenu`, `AppNameDropdown`, `AppSideMenu`, `HeaderActions`, `FMTopNav`, `AuroraDock` references.

**Definition of done (mobile, 402×716):**
- Authed home shows: 44px transparent header (≡ | MindOS ▾ | orb) + full-bleed chat + composer block. Nothing else.
- Tapping ≡ or "MindOS ▾" opens the same drawer.
- Tapping the orb opens the AION sheet.
- Tapping `…` in composer or anywhere else opens a single bottom sheet — never two overlays at once.
- Opening a hub does not hide the header and does not lose chat scroll position.
- Orb visibly changes between idle / focus / recovery / breakthrough / night states driven by `aion-brain`.
- Zero horizontal scroll, all targets ≥44px, `pt-safe` + `pb-safe` respected.

---

## 7. Anti-patterns to actively avoid

- **Don't add a bottom tab bar.** It's the single biggest "this is a web app" tell. Lovable has none. ChatGPT has none. Jarvis has none.
- **Don't bring back centered `Dialog` modals** for primary actions on mobile. Sheets only.
- **Don't let two overlays be visible at once** (e.g., drawer + sheet). The `OverlayController` must close the previous one.
- **Don't re-introduce route theme tints, ambient glows, or per-page header colors.** One flat background. Hierarchy through position, not color.
- **Don't make the orb a router.** It's a presence + a sheet trigger. Routing to `/aurora` happens only as the explicit "Open full chat" affordance inside the AION sheet.
- **Don't rebuild AION's persona or `aion-brain` logic.** Only the *channel* (orb state + in-chat bubbles) changes.

When you're ready, say "build phase 1" and I'll start at step 1 of section 6 — not before.
