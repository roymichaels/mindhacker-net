# Brain Graph — Living Mind Atlas

Replace the current concentric-ring SVG with an explorable force-directed graph that renders nodes by *type* (identity / belief / value / goal / habit / pattern / contradiction / memory / emotion / mission), clusters by pillar, draws relationship edges, supports pinch/zoom + drag, and infers soft edges when the backend returns none.

Scope: visualization only. No backend, RPC, or schema changes.

## Files

**New**
- `src/features/brain/BrainGraphForce.tsx` — the new canvas (replaces `BrainGraphCanvas`).
- `src/features/brain/useForceLayout.ts` — tiny self-contained force simulation (no library, ~120 lines: charge repulsion, link spring, pillar cluster gravity, center gravity, Verlet-ish integration, runs in `requestAnimationFrame`, freezes after ~3s of low energy).
- `src/features/brain/inferSoftEdges.ts` — derives client-side soft edges when `edges.length === 0` or sparse: same `pillar`, same `type`, shared significant tokens in `content` (length > 3, lowercase, stop-list filtered). Returns edges marked `inferred: true`.
- `src/features/brain/brainNodeStyle.ts` — maps `node.type` → glyph/icon, color (HSL token), and shape (circle / diamond / ring / soft-square). Central pseudo-node "AION" rendered when `node.type === 'identity'` or as fallback root.

**Edited**
- `src/features/brain/BrainView.tsx` — swap `BrainGraphCanvas` for `BrainGraphForce`; pass through filtered nodes/edges and a `softEdges` array from `inferSoftEdges`; remove the giant CTA block from inside `ShellHeader` (move "Refresh brain" into a small icon button beside the title); ensure the graph container is full-bleed and respects safe areas (no `pb-` that hides under composer — graph height becomes `min(70vh, 640px)` and composer/filter chips sit *below* via normal flow inside the existing scroll container).
- Remove `BrainGraphCanvas.tsx` (delete) so the ring layout cannot regress.

## BrainGraphForce behavior

- Renders into an `<svg>` with a `<g transform="translate(tx,ty) scale(k)">` wrapper.
- Pan: pointer drag on empty canvas. Zoom: wheel + pinch (two-pointer distance delta). Tap node: `onSelect(id)`.
- Force model (per tick, dt fixed):
  - Charge: O(n²) repulsion, fine for ≤300 nodes (we cap render at 250, sorted by `score`).
  - Link: spring for real edges (stiffness 0.05) and soft edges (stiffness 0.015, dotted render).
  - Cluster: gravity toward per-pillar centroid (computed from current positions each tick).
  - Center gravity: pulls all nodes weakly toward (0,0); identity node pinned at center.
- Settles in ~120 ticks, then `cancelAnimationFrame`. On node tap or filter change, re-heat for 60 ticks.

## Visual spec

- Dark premium: background transparent (lets ShellV2 backdrop show), edges `stroke="hsl(var(--foreground))"` at opacity 0.12 (real) / 0.06 dashed (inferred / weak).
- Node fill = type color from `brainNodeStyle` (HSL tokens, no raw hex):
  - identity → primary
  - belief → 220 80% 65%
  - value → 160 70% 60%
  - goal → 45 95% 60%
  - habit → 280 70% 65%
  - pattern → 190 90% 60%
  - contradiction → 0 80% 65%
  - memory → 30 70% 60%
  - emotion → 330 75% 65%
  - mission → 142 70% 55%
- Glow: SVG `<filter>` with `feGaussianBlur` on a duplicated circle, opacity scaled by `confidence`.
- Selected node: 2px ring + label below, others fade to 0.4 opacity, connected edges highlight.
- Contradiction edges: solid red. Reinforces: green. Triggers: amber. Blocks: red dashed. Belongs_to / evolved_from: muted.

## Empty / low-data state

- If `nodes.length === 0`: keep existing premium "Your brain is still forming" empty card (already in `BrainView`).
- If `nodes.length > 0 && edges.length < nodes.length / 4`: pass `inferSoftEdges(nodes)` result to the canvas; render dotted, lower opacity. Show a small caption under the graph: "Showing inferred connections — AION will firm them up as it learns."

## Filters

Keep existing layer + "Weak signals" chips below the graph. Add a horizontally-scrolling "Type" chip row (All, Identity, Beliefs, Values, …) that filters by `node.type`.

## Acceptance

After implementation I will:
1. Confirm `BrainGraphCanvas.tsx` is deleted and no import remains (`rg BrainGraphCanvas`).
2. Read the preview, capture node/edge counts via console log already present in `BrainView`.
3. Screenshot the `/brain` route at the user's viewport (402×716) showing the force layout — no rings.
4. If real edges = 0, confirm dotted inferred edges render.

## Out of scope

- WebGL / canvas2d rewrite (SVG is enough for ≤250 nodes and stays themable).
- Backend edge inference, new node types, RPC changes.
- Bottom composer / safe-area work outside the Brain route.
