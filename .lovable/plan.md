
# AION Cinematic Visual Rebuild

A presentation-only pass. No orchestration, mutations, capabilities, routes, or DB changes. Existing components are restyled in place; a small set of new atmospheric primitives is introduced.

## Guiding principles

- One entity (the orb) is the brand — replace logo usage where it competes.
- Bioluminescent palette: deep navy → cyan → electric blue → violet, with restrained magenta accents.
- Atmosphere over chrome: replace cards/borders with glow, depth layering, and negative space.
- Cinematic motion: soft easing, breathing, contextual emergence — no flashy mechanical UI motion.
- Mobile-native by default; desktop inherits the same vocabulary.

## 1. Global visual language (`src/index.css`, `tailwind.config.ts`)

Add a new dark token layer (light mode untouched):

- `--aion-navy: 230 55% 6%`, `--aion-deep: 232 60% 9%`, `--aion-blue: 212 100% 62%`, `--aion-cyan: 188 95% 65%`, `--aion-violet: 265 85% 66%`, `--aion-magenta: 305 80% 65%`.
- `--aion-glow-sm/md/lg`: layered radial-gradient strings.
- `--aion-bg`: vertical `radial-gradient` of navy → near-black with a faint cyan top halo, applied to `.dark body` (replaces the current transparent body so canvas effects layer on top of a real cinematic ground).

New utilities:

- `.atmo-surface` — borderless soft surface: `background: linear-gradient(180deg, hsl(var(--aion-deep)/0.55), hsl(var(--aion-navy)/0.35)); backdrop-filter: blur(24px) saturate(140%); border-radius: 1.25rem;` plus an inset top hairline (`box-shadow: inset 0 1px 0 hsl(var(--aion-cyan)/0.08)`). No outer border.
- `.atmo-divider` — 1px gradient line that fades to transparent at both ends; replaces hard `border-border`.
- `.aion-glow` / `.aion-glow-soft` — outer radial halos for orbs/CTAs.
- `.aion-text-hero` — tracking-tight, large, gradient-fill cinematic title.
- `.aion-mask-fade-y` — top/bottom mask for scroll regions so content fades into atmosphere.

Tailwind: extend `colors.aion`, `boxShadow.glow{,Lg}`, `keyframes.{breath,floatY,emerge}`, `animation.{breath,float,emerge}`.

## 2. Header system

Targets: `src/components/Header.tsx` (public), `src/shellv2/ShellV2Header.tsx` (app), `src/components/panel/AdminSidebar.tsx`, `src/components/panel/AffiliateSidebar.tsx`.

- Drop `border-b` and `shadow-sm`. Replace with a 1px `atmo-divider` and a downward fade gradient under the header.
- Background: `bg-transparent` over the global atmosphere; only on scroll add `backdrop-blur-2xl` and a subtle top tint.
- Three-zone grid retained, but: orb on the right gets a real living halo (`aion-glow-soft` + `animate-breath`), wordmark center uses `aion-text-hero` at 18–20px with `tracking-[0.32em]`, left becomes a single ghost icon (no chevrons, no notification dot competing with the orb — bell folds into drawer).
- Safe-area: `pt-[env(safe-area-inset-top)]`, content min-height `92px`. No visible container edges.

## 3. Chat / composer experience

Targets: `src/pages/AuroraPage.tsx`, `src/components/aurora/AuroraChatArea.tsx`, `AuroraMessageThread.tsx`, `AuroraChatBubbles.tsx`, `AuroraChatInput.tsx`, `AuroraTypingIndicator.tsx`, `composer/*`.

- Message bubbles → `atmo-surface` with no border, 18px radius, soft inner top hairline. AION messages get a 1px left/right cyan glow line that fades; user messages get a violet tint.
- Time/avatar metadata becomes `text-foreground/45 text-[11px]`, single line, never above the bubble.
- Replace any `Card`/`shadow` wrappers in the message list with plain spacing.
- Composer: pill-shaped, `atmo-surface`, no border, focus state = expanding cyan glow ring (no outline). Plus, mic, send collapse into a single trailing send orb when the field is empty; chips appear contextually under the field, not always.
- Typing indicator becomes a small breathing orb dot trio with cyan glow.
- Background of the chat surface picks up the global `--aion-bg`; remove any solid chat panel background.

## 4. Artifact system

Targets: `src/components/aion/artifacts/ArtifactLayer.tsx`, all renderers under `src/components/aion/artifacts/`, `AuroraActionConfirmation.tsx`, `StrategyApprovalCard.tsx`.

- One shared shell `<AtmoArtifact>`: `atmo-surface`, no border, 22px radius, top hairline + outer glow tinted by artifact kind (cyan = read, violet = plan, magenta = confirmation, amber = warning).
- Entrance: `animate-emerge` (scale 0.96 → 1, opacity 0 → 1, 12px Y, 280ms cubic-bezier(0.22,1,0.36,1)).
- Replace inner `Card`/`Separator` chains with `atmo-divider` and increased vertical rhythm (16/20/24).
- Source row fixed at the bottom in micro-text with the trace_id hidden behind a tap.
- Confirmation artifacts: sticky behavior preserved, but visually anchored by an outer breathing halo so they read as "summoned by AION".

## 5. Brain / map system

Targets: `src/features/brain/BrainView.tsx`, `BrainSections.tsx`, `BrainNodeSheet.tsx`, `atlas/RoomView.tsx`, `brainNodeStyle.ts`.

- Remove dashboard widgets and counters from the top of `BrainView`. The whole route is the map.
- Center: shared `OrbView` at 96–120px with breathing aura.
- Nodes: replace flat circles with small living spheres (radial gradient + outer halo tinted by pillar). Edges become 1px gradient lines fading toward endpoints.
- Background: deep navy with a faint nebula radial gradient and slow particle drift (CSS-only, 6–10 dots, opacity ≤ 0.15).
- Tap on node → `BrainNodeSheet` becomes `atmo-surface` bottom sheet with strength bar as a thin neon line, not a solid bar.

## 6. Navigation simplification

Targets: tab bar / drawer in `src/shellv2/`, `src/navigation/`.

- Trim persistent tabs to 5 max (Chat, Brain, Today, Journey, More). Anything else moves into the drawer or contextual artifacts.
- Tab bar background: transparent over atmosphere with a top `atmo-divider`. Active tab uses an under-glow dot, not a pill.
- Drawer adopts `atmo-surface` and removes nested separators.

## 7. Motion refinement

- Single easing token `cubic-bezier(0.22, 1, 0.36, 1)` exported as `--ease-cinema`.
- Breathing keyframe (4s, scale 1 → 1.03 → 1, glow 0.6 → 0.85 → 0.6) for orbs + sticky artifacts.
- Emerge keyframe for artifacts/sheets/modals.
- Reduce framer-motion usage to entrance + layout, no per-hover bounces.
- Honor `prefers-reduced-motion` (disables breathing/emerge).

## 8. Environmental atmosphere

- New `<AtmosphereLayer />` mounted once at app root: a fixed full-viewport gradient + 2 slow-drifting nebula blobs (CSS, GPU-only). z-index sits below `OrbView` host, above body.
- Light mode untouched (atmosphere disabled), only dark mode receives the cinematic ground.

---

## Technical notes

- All colors stay HSL via tokens; no hard-coded hex in components.
- No new routes, no orchestration / capability changes, no DB migrations, no edge function edits.
- `OrbView` (the live orb) remains the single entity primitive — `AionRingMark` (static) is kept only for favicon/app-icon surfaces.
- `confirmationBridge` and `safeMutationExecutor` paths are untouched.

## Out of scope

- Backend, mutations, AI prompts, capabilities registry.
- Onboarding flow logic (visual treatment only on its existing screens).
- Marketing landing copy.

## File-change estimate

~25 files: 1 token file (`index.css`), 1 tailwind config, 1 new `AtmosphereLayer`, 1 new `AtmoArtifact` shell, 1 new `atmoUtils.css`, ~6 header/shell files, ~8 chat files, ~4 artifact renderers, ~3 brain files. No file deletions.

## Deliverables on completion

- Files changed, systems redesigned, before/after screenshots (mobile 402×716 + desktop), remaining inconsistencies, and a recommended next pass.
