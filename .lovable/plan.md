## Phase 2.5 — Mobile-Native Polish + Phase 3 Roadmap

A small, focused cleanup pass before resuming architecture work. No backend, no DB, no capability or mutation changes — only presentation.

---

### A. Polish tasks

#### A1. Header orb — kill the dark badge, restore presence

`src/components/aion/ui/AionOrb.tsx`
- Remove the `dark:aion-glow-soft` shadow span from the default header path — that ring is what reads as "black badge behind the orb". Keep glow available but opt-in (`glow="ring"` for chip contexts only).
- Keep the wrapper `relative inline-flex` but drop `rounded-full` from the container — the orb image is already round. Removing the round mask eliminates the visible disc edge on dark backgrounds.
- Add a soft radial light *behind the image* via pseudo-element instead of a ring: `radial-gradient(closest-side, hsl(var(--aion-violet)/0.22), transparent 70%)`. Lives, not framed.
- Sizes stay the same; the header just calls `size="md"` instead of `"sm"` (32 → 48 px) so it returns to the previous visual weight.

`src/components/aion/ui/AionHeader.tsx`
- Change `<AionOrb size="sm" …/>` → `size="md"`.
- Keep the orb button visually borderless: no `rounded-full bg-*` wrapper.

#### A2. Header polish

`src/components/aion/ui/AionHeader.tsx`
- Hamburger: shrink hit-target padding without changing tap area. Move from `h-9 w-9` flex-centered icon to `h-11 w-11` tap area with the icon at `h-[18px]` and `text-foreground/30 hover:text-foreground/70`. This trims visual weight while keeping a 44 px target.
- Title centering: the orb (md = 48) and menu button (44) are different widths; current `flex-1` brand block ends up 6 px off-center. Wrap brand in `absolute inset-x-0 flex justify-center pointer-events-none` and make brand button `pointer-events-auto`. Side controls (`Menu`, `AionOrb`) become absolute-positioned at the inset edges. Header height fixed at 56 px + safe-area top.
- Keep the soft bloom; reduce intensity from 0.18 → 0.12 so it dissolves more.
- Drop the bottom dissolve gradient (it adds nothing on transparent bg).

#### A3. Drawer / portal polish

`src/shellv2/ShellV2Drawer.tsx`
- Add `paddingTop: max(env(safe-area-inset-top), 1rem)` and `paddingBottom: max(env(safe-area-inset-bottom), 5.5rem)` so the bottom doesn't run under the composer/dock.
- Cap height to `100dvh` and make the inner column `flex flex-col min-h-0` with the items list `overflow-y-auto`. Footer (sign-out) sticks to bottom inside the safe area.
- Remove the legacy `ring-1 ring-white/[0.05]` and the `shadow-[0_20px_60px_…]` — those read as old desktop sidebar. Replace with `bg-background/55 backdrop-blur-2xl`, no border, no shadow.
- Identity row: increase top padding to `pt-[max(env(safe-area-inset-top),1.5rem)]`, swap `<AionOrb size="xs"/>` for `size="md"` matching the new header weight, drop the "MINDOS" wordmark if still present.
- When drawer opens, dispatch `chamberIdle.hideNav()` and `setComposerState('idle')` so the nav dock + composer underglow recede; eliminates the "two stacked bottom UIs" feeling. (Hook already exists; just call it from the drawer's open effect.)

#### A4. Composer breathing room

`src/components/aion/ui/AionComposerDock.tsx`
- Bump base `bottom` from `max(env(safe-area-inset-bottom), 14px)` → `max(env(safe-area-inset-bottom), 22px)`.
- When `navVisible` is true, add an extra `28px` to bottom via inline style (read from `useChamberIdle`). Prevents overlap with `AionNavDock` (which sits at `safe-bottom + 12`).
- The grabber chevron in `NavLayer.tsx` currently sits at `safe-bottom + 70/88px`. Recompute against the new composer height: `bottom = composerBottom + composerHeight + 8`. Use a CSS variable `--composer-h` set on the dock root; chevron reads it.
- Last assistant bubble in `ChatLayer.tsx` should reserve `padding-bottom: calc(var(--composer-h, 88px) + 96px)` so artifacts and bubbles never tuck under the composer.

#### A5. Native sweep (one-off)

Targeted file passes (no global rewrites):
- `src/components/aurora/AuroraChatBubbles.tsx`: ensure `.message-bubble` uses `px-4 py-3` and `max-w-[88%]`; remove any leftover `border` class.
- `src/components/journey/NextStepCard.tsx`: pad to `p-5`, ensure `text-balance` on titles to prevent clipping.
- `src/components/outer/AlignedRealities.tsx`: row touch target `min-h-[56px]`, edge inset `px-5`, no divider lines.
- `src/components/aion/ui/AionNavDock.tsx`: confirm icons are uniform `h-5 w-5` `strokeWidth={1.5}` and label `text-[10px] tracking-[0.16em]`.
- `src/shellv2/ShellV2.tsx`: add `--composer-h` CSS var on the shell root and update on resize observer of the composer.

---

### B. Files expected to change (Phase 2.5)

| File | Change |
|---|---|
| `src/components/aion/ui/AionOrb.tsx` | Remove dark badge ring, replace with soft radial light, drop rounded mask |
| `src/components/aion/ui/AionHeader.tsx` | Absolute-centered title, larger orb (`md`), trimmed hamburger, cleaner header |
| `src/shellv2/ShellV2Drawer.tsx` | Safe-area padding, no border/shadow, native sheet feel, hide nav/composer when open |
| `src/components/aion/ui/AionComposerDock.tsx` | Bottom inset bump, nav-aware spacing, expose `--composer-h` |
| `src/shellv2/layers/NavLayer.tsx` | Chevron position reads `--composer-h` |
| `src/shellv2/ShellV2.tsx` | Composer height observer → CSS var |
| `src/components/aurora/AuroraChatBubbles.tsx` | Bubble padding/border sweep |
| `src/components/journey/NextStepCard.tsx` | Padding + text-balance |
| `src/components/outer/AlignedRealities.tsx` | Row hit area + edge inset |

### C. Mobile UX bugs not solved by this pass (track for later)

- Profile modal (`ProfilePage`) uses a fixed gradient bg that doesn't honor `100dvh`; on iOS Safari the bottom strip shows the under-page when keyboard collapses.
- `BrainGraphForce` SVG can overflow horizontally on narrow widths; needs `viewBox` recalc.
- Some pillar pages (still reachable via deep-links) render their own headers and double-stack with the chamber header.
- Toasts (`sonner`) currently anchor `bottom-right` and collide with the composer at `safe-bottom + 22`. Need to move to `top-center` or above-composer.

---

### D. Recommended Phase 3 sequence

Execute strictly in this order — each phase removes a class of "still feels like an app" leaks:

1. **Phase 3A — Copy sweep across hidden legacy surfaces.** Cheapest, biggest perceived win. Replace every "Generate / Create plan / Hub / Dashboard / Choose / Take assessment / Open Hub" string in legacy pages with `aionPresence` constants. Keep pages otherwise intact. *Why first:* deep-links + drawer-rare paths still leak SaaS language; one regex sweep + manual review of ~20 files clears it.

2. **Phase 3B — Profile-stats artifact bridge.** Right now `<ProfileStatsArtifact/>` only renders the legacy `ProfilePage` if `isOpen` is true. Add a tiny bridge: artifact mount calls `openProfile()` on mount and `closeProfile()` on dismiss. Closes the only Phase 2 wiring gap.

3. **Phase 3C — Remaining hub pages become artifact-only visual shells.** `LifeHub`, `ArenaHub`, `CareerHub`, `JournalingHub`, `WorkHub`, `BusinessIndexWrapper`, `FreelancerLayoutWrapper`, `CreatorLayoutWrapper`, `TherapistLayoutWrapper`: strip their internal page chrome (own header, own back button, own bottom nav). They render purely as artifact bodies. Visual unification with the chamber.

4. **Phase 3D — Brain room sheet & "Ask AION" interaction polish.** Sheet open animation, RoomView haptic-feel, primary CTA pulse on first open, back-from-AION returns to the same node. Sheet dismiss should pre-fill the composer with the focus context as a soft prompt chip rather than navigating away cold.

5. **Phase 3E — Journey as one living mission.** Remove the "queue" mental model from `useTodayExecution`-driven UI: show only `next` + the *why* line (pillar, phase, AION's reasoning). Completion triggers an ambient transition to the next step in-place — no list reveal. Plan history available only via summon ("show me the plan").

6. **Phase 3F — Outer World portal polish.** `AlignedRealities` rows should breathe and react to focus (subtle glow on press, AION whisper line per row). Add a single ambient line at top: "the world AION is aligning around you".

7. **Phase 3G — Artifact UX lifecycle refinement.** Standardize summon → settle → dismiss animation across all artifacts. One header strip with `← back` + `done`. Auto-dismiss after action complete + fade. Stack rules: max 1 visible, others minimized into a single chip stack above composer.

Order rationale: copy first (free wins), then close known wiring gap (3B), then visual unification of artifacts (3C), then deepen the two highest-traffic realms (3D, 3E), then peripheral polish (3F), then cross-cutting motion language (3G).

---

### E. Acceptance for this phase

- [ ] Header orb has no dark disc; reads as a glowing AION presence, ~48 px.
- [ ] AION title is pixel-centered regardless of side controls.
- [ ] Drawer has top + bottom safe-area; no overlap with composer/nav dock; no shadow/border.
- [ ] Composer never closer than 22 px to the home indicator; never under nav dock.
- [ ] Grabber chevron sits 8 px above the composer at all states.
- [ ] No global className changes; all edits scoped to the files listed in §B.