
# AION Visual + Product Direction Upgrade

Transform the app from a page/dashboard SaaS into a Jarvis-like intelligence: chat-first, artifact-driven, with five persistent surfaces and a cinematic dark visual language. Reference images guide the *language*, not pixel-copies.

## Scope (this plan)

This is a **visual + shell + artifact-language pass**, not a routing teardown. No pages deleted, no capabilities added. Confirmation bridge stays the gate for mutations.

## 1. Brand & Visual Foundation

- Replace the current AION mark with the glowing **ring** as primary logo (static SVG/PNG variant for headers and icons; the existing `OrbView` blob remains the *living* entity in animated contexts).
  - Add `src/assets/aion-ring.svg` (and `aion-ring.png` fallback) extracted from the supplied logo.
  - New `<AionRingMark size wordmark />` component in `src/components/aion/AionRingMark.tsx` — used in headers, splash, app icons, empty states.
  - `OrbView` stays for: chat assistant avatar, voice mode, brain center, thinking state.
- Update design tokens in `src/index.css` to lock in the cinematic palette:
  - `--background` deep navy/black (e.g. `224 40% 4%`)
  - `--aion-blue` `212 100% 60%`, `--aion-cyan` `190 95% 65%`, `--aion-violet` `265 85% 65%`
  - `--glass-bg`, `--glass-border`, `--glass-inner-shadow` semantic tokens
  - `--radius-xl: 1.25rem`, `--radius-2xl: 1.75rem` (mobile cards)
- New utility classes in `src/index.css`: `.glass-panel`, `.glass-card`, `.aion-glow`, `.thin-border`.
- Audit and remove any remaining "MindOS" / "Aurora" visible strings (logo alts, splash, manifest, meta, PWA name in `index.html` + `public/manifest.json`).

## 2. App Shell (mobile-first)

- Single safe-area header in `ProtectedAppShell` (kill any duplicate headers in nested routes):
  - Left: menu icon (24px, ghost)
  - Center: `AionRingMark` + small "AION" wordmark
  - Right: small `OrbView` 28px showing live status (idle / thinking / listening)
- Bottom tab bar reduced to **5 persistent surfaces**:
  1. Chat (default)
  2. Brain
  3. Journey
  4. Outer World
  5. Profile
  - Existing tab bar (`src/components/navigation/StandardizedTabBar.tsx` or similar) re-mapped; legacy items (FM Market, Wallet, Work, Hypnosis, Learn, Create, Community) become *capabilities reachable via Chat composer plus-button* and remain routable but not in the bar.
- Remove sidebar chrome on mobile entirely; desktop keeps a slim collapsed rail.

## 3. Chat as Home

- `/` (or `/chat`) becomes the canonical home for authenticated users.
- Strip dashboard widgets from chat home — only:
  - Greeting line ("בוקר טוב, {name}" with sun/moon icon)
  - "מה נבנה היום?" headline
  - 3–4 quick-action chips (Focus / Plan day / Deep work / Heal / Create) sourced from existing capability registry
  - Message stream
  - Persistent native composer (mic, plus, send)
- Composer plus-button opens **Capability Launcher** sheet (iOS-style bottom sheet) listing capability candidates from `registry.ts` grouped: Plan / Report / Text / Image / Video / Audio / More.
- Assistant avatar = `OrbView` (already in place); user avatar stays as `Avatar`.
- Message bubbles: glass-panel, generous padding, inline artifact slot below message.

## 4. Artifact Language (visual standard)

Extend `ArtifactLayer` + each renderer to follow one card spec:

```
┌─ glass-card, rounded-2xl, thin-border ──────┐
│ [icon] Title                          [×]   │
│ One-line summary                            │
│ ───── compact body / preview ─────          │
│ source • timestamp     [Primary] [Secondary]│
└─────────────────────────────────────────────┘
```

- Add/refine renderers (presentation only — no new capabilities):
  - `today.snapshot` (% ring, tasks count)
  - `next_action`
  - `journey.workspace` (current stage + next milestone)
  - `brain.room.preview`
  - `hypnosis.player`
  - `journal.preview`
  - `plan_summary`
  - `business.canvas`
  - `landing.preview`
  - `course.card`
  - `coach.recommendation`
  - `marketplace.card`
  - `wallet.sheet`
  - `confirmation.card` (sticky)
- Confirmation cards: sticky, gradient primary CTA ("אשר פעולה"), neutral cancel, warning row "פעולה זו תיצור שינויים במערכת".
- Read artifacts: non-sticky, dismissable, max 3 stacked.
- `trace_id` only in metadata tooltip — never visible chrome.

## 5. Brain — Consciousness Map

Reframe `BrainView` from analytics into a navigable map (reference image 2/3 right panel):

- Central node: `OrbView` 120px (figure silhouette) representing the user.
- Radial arrangement of pillar/room nodes with colored glow halos by domain (purple identity, orange body, green relationships, cyan learning, etc.) — pull from existing pillar registry.
- Tap a node → bottom-sheet "פרטי צומת" with:
  - Pillar icon + title + subtitle
  - Strength bar (existing data)
  - Source counts (memories / journals / linked nodes)
  - CTAs: "שאל את AION על זה" / "תקן / עדכן מידע" / "חקור לעומק"
- Remove dashboard/analytics widgets from Brain route; metrics move into the node sheet.
- Reuse existing graph data — purely a presentation refactor of `src/features/brain/BrainView.tsx` + new `BrainNodeSheet.tsx`.

## 6. Journey, Outer World, Profile (light pass)

- **Journey**: convert top of `/journey` (or equivalent) to the "מסע החיים" workspace card style — current stage card, next milestone card, "next steps" checklist, full-timeline CTA. Internals reuse existing data hooks.
- **Outer World**: container shell only — house FM Market / Coaches / Community as *artifact entry points*, not as a dashboard. Default view = chat-style suggestions list.
- **Profile**: keep existing profile triad (AION / Avatar / DNA) but reflow into native iOS settings-list under the cards. Remove redundant headers.

## 7. Capability Launcher Sheet

New `src/components/aion/CapabilityLauncherSheet.tsx`:

- Triggered from chat composer plus-button.
- Reads `capabilities/registry.ts` (already populated by Phase 2 batches 1–3).
- Sections: Generate (plan, report, text, image, video, audio), Capture (journal, photo, voice memo), Plan (schedule block, deep work), Heal (hypnosis), Connect (message, marketplace), Wallet.
- Selecting a capability emits a `capability.candidate` through the existing router → confirmation bridge → executor pipeline. No new mutation paths.

## 8. Cleanup / Removal of Clutter

- Remove top-level dashboard widget grids on home, Brain, and any route that still shows them (Today snapshot, etc.). They re-appear only as artifacts when AION offers them.
- Remove childish gamification visuals from chat home (XP bar moves to Profile).
- Audit and delete duplicate headers in: `ShellV2`, page-level wrappers, lazy modules under `pages/MindOS/*` re-exports.
- Replace any remaining blank `AvatarFallback` dots with mini `AionRingMark`.

## Out of scope (future phases)

- Deleting old pages or rewriting routes
- Enabling new real mutations (still gated by Phase-3 Batch-1 allow-list)
- New capabilities beyond presentation of existing ones
- Voice mode redesign beyond using the `OrbView` (already done)

## Technical Notes

**Files to add**
- `src/assets/aion-ring.svg`
- `src/components/aion/AionRingMark.tsx`
- `src/components/aion/CapabilityLauncherSheet.tsx`
- `src/components/aion/artifacts/renderers/{today,nextAction,journey,brainRoom,hypnosis,journal,planSummary,business,landing,course,coach,marketplace,wallet,confirmation}.tsx` (only the ones not already present)
- `src/features/brain/BrainNodeSheet.tsx`

**Files to edit**
- `src/index.css` — tokens + glass utilities
- `tailwind.config.ts` — extend colors / radii
- `src/components/layout/ProtectedAppShell.tsx` — single header, safe-area
- `src/components/navigation/*TabBar.tsx` — reduce to 5 surfaces
- `src/pages/Index.tsx` (or chat home) — strip widgets, add quick chips + composer
- `src/components/aion/artifacts/ArtifactLayer.tsx` — enforce card spec
- `src/features/brain/BrainView.tsx` — consciousness map layout
- `src/features/journey/*` — workspace card style
- `src/pages/Profile*` — native settings list under triad
- `index.html`, `public/manifest.json` — AION naming + ring icon

**No DB migrations.** All work is presentation/shell.

**Verification**
- Mobile preview at 402×716 must show: AION header, 5-tab bar, clean chat home, no legacy widgets.
- Visible-string scan must return 0 hits for "MindOS" / "Aurora" in rendered routes.
- Existing artifact + capability traces must continue to fire end-to-end (no router changes).
