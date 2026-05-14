## Phase G — Brain + Rooms Visualization

Make `/brain` feel like a navigable consciousness map. Reuse what already works (room registry, `useBrainAtlas`, `useBrainRoom`, `BrainGraphForce`, `BrainNodeSheet`, `inferSoftEdges`, `useBrainFallback`). No mutations, no new shells, no unrelated UI.

### What's already in place (keep)
- `src/features/brain/data/useBrainAtlas.ts` → `brain_get_atlas` RPC: per-room aggregates + cross-room edges.
- `src/features/brain/data/useBrainRoom.ts` → `brain_get_room` RPC: nodes/edges/gaps per room.
- `src/features/brain/atlas/RoomView.tsx` → already wraps `BrainGraphForce` + `BrainNodeSheet` + gaps list. Solid; only minor polish.
- `BrainGraphForce` already does force-directed layout with pinch/drag/zoom.
- `BrainNodeSheet` already a native-feeling bottom sheet.
- `inferSoftEdges` + `useBrainFallback` already produce client-inferred soft edges.

### What violates the spec today (fix)
1. `ConsciousnessAtlas.tsx` lays rooms out on a **perfect circle around a center** — explicitly forbidden ("no orbit rings, no perfect circles").
2. Atlas is rendered inside a scrolling `<main>` with cards above it (`SelfPanel`) and a `<details>` "Full graph (legacy)" + `BrainView` below — reads as a dashboard, not a map.
3. Only 8 rooms (`beliefs, emotions, parts, time, identity, body, dreams, beyond`). Spec asks for 10 clusters incl. **Journey / Mission**, **Relationships**, **Outer World links**.
4. Atlas isn't pinch/drag/zoomable; not full-screen; no safe-area top.
5. Cross-room edges are drawn but only between fixed circle positions — they need to come from the same organic simulation.

### Plan

#### 1. Atlas becomes an organic force-directed map
Rewrite `src/features/brain/atlas/ConsciousnessAtlas.tsx` to use the same `useForceLayout` hook that `BrainGraphForce` uses, but at the **room level**:
- Treat each room as a single super-node (radius scaled by `sqrt(node_count)`, ring opacity = `avg_confidence`, fill = `coverage`, ambience hue from registry).
- Treat `cross_edges` as the simulation links (weighted). Empty rooms still participate but with weaker links.
- Add gentle initial seeding (jittered around a poisson-disc-ish layout, not a circle) so the simulation settles into an organic blob, not a wheel.
- Pan / pinch / zoom mirror `BrainGraphForce` (extract the gesture block into `src/features/brain/useGraphGestures.ts` and reuse in both — small shared hook, no new system).
- No orbit rings, no decorative particles, no gradients.
- Tap on a room super-node → existing `onRoomTap(roomId)` (atlas → room view) for implemented rooms; for virtual rooms (#2) → `navigate()` to their canonical surface.

#### 2. Add 3 virtual "atlas-only" rooms (no new shell, no new route)
Instead of extending the hallway `RoomId` union (which would force route + surface implementations), add a small adapter file `src/features/brain/atlas/atlasRooms.ts`:
- Re-exports `listRooms()` from the hallway registry **plus** 3 virtual entries:
  - `journey` → tagline "Mission & 100-day arc", deep-link `/play`.
  - `relationships` → tagline "People in your field", deep-link `/messages`.
  - `outer` → tagline "World you act in", deep-link `/outer-world`.
- Each virtual room carries `ambience.hue`, copy (he/en), and a `kind: 'virtual' | 'room'` flag.
- `useBrainAtlas` is left untouched; virtual rooms simply have no entry in `atlas.rooms` (they render as "AION is still learning" until we have aggregates) and tapping them deep-links instead of opening RoomView.
- `BrainPage.goRoom` keeps current behavior for hallway rooms; virtual rooms route via the deep-link.

#### 3. Strip dashboard chrome from `/brain`
In `src/pages/BrainPage.tsx` (atlas view branch only):
- Drop `SelfPanel` and the `<details>` "Full graph (legacy)" `BrainView` block — they make Brain look like a dashboard. Keep `BrainView` file for now (still imported by no one after this — leave the file, just unmount).
- Remove the outer page padding/scroll on the atlas branch and render the `ConsciousnessAtlas` as a full-screen surface (`fixed inset-0` within the chat slot, with `pt-[max(env(safe-area-inset-top),1rem)]` and bottom inset for the composer).
- `ShellHeader` becomes a translucent overlay (absolute, top, safe-area aware) so the map feels native.
- RoomView branch keeps the back header + gaps list; only minor padding cleanup.

#### 4. Node detail sheet — fill in missing actions
`BrainNodeSheet` currently exists. Verify and (where missing) add:
- "What this means" → `node.content` + small humanized type label.
- "Source / evidence" → `node.source` + link to journal/action if `source_id` present.
- "Confidence / strength" → existing.
- "Related nodes" → derived from edges of the active room.
- "Ask AION about this" → already wired via `onTalkToAion` (sessionStorage handoff).
- "Correct this" → opens AION composer with a prefilled prompt `"תקן את ההבנה שלך לגבי …"` (read-only handoff, no mutation).
- "Explore deeper" → triggers `journey.nextAction` capability suggestion via the existing safe-suggest path (no direct mutation).

#### 5. Empty / sparse fallback
`useBrainFallback` already infers soft edges client-side. Wire the same logic at the **atlas level**: if `atlas.rooms` is empty or `atlas.cross_edges.length === 0`, render rooms anyway, sized by a heuristic (count of related nodes from any cached room queries), and label every empty room with the existing "AION עדיין חוקר / AION exploring" string. No empty/blank dashboard ever.

#### 6. Acceptance checks (manual, after code lands)
- Open `/brain` → full-screen organic map, no perfect circle, no decorative rings, safe-area respected.
- 10 room clusters visible (8 real + 3 virtual) with ambience-tinted colors.
- Pinch + drag + zoom feel native on the 402px viewport.
- Tap a real room → `RoomView` with internal force-graph + gaps list.
- Tap Journey/Relationships/Outer → deep-link to `/play`, `/messages`, `/outer-world`.
- Tap a node → bottom sheet with all 6 sections; "Ask AION" hands off via sessionStorage; "Correct" / "Explore" route through existing safe-suggest pipeline (no DB writes).
- Sparse user: every room visible with "AION exploring" hint; soft edges inferred; no blank dashboard.

### Files touched

```text
ADD     src/features/brain/atlas/atlasRooms.ts          (virtual room adapter)
ADD     src/features/brain/useGraphGestures.ts          (shared pinch/drag/zoom hook)
EDIT    src/features/brain/atlas/ConsciousnessAtlas.tsx (force-directed rewrite, full-screen, gestures)
EDIT    src/features/brain/atlas/RoomView.tsx           (minor padding / safe-area)
EDIT    src/features/brain/BrainGraphForce.tsx          (use shared gesture hook)
EDIT    src/features/brain/BrainNodeSheet.tsx           (add missing actions: correct / explore / related)
EDIT    src/pages/BrainPage.tsx                         (drop SelfPanel + legacy BrainView block, full-screen atlas, overlay header)
EDIT    docs/CLEANUP_REPORT.md                          (Phase G acceptance log)
```

No DB migrations. No edge function changes. No new routes. No mutations.

### Risks
- Force-layout at room scale (~10 super-nodes) is cheap, but seeding matters — bad seeding can collapse all rooms to the center for a frame. Mitigation: deterministic jittered grid seed before first tick.
- Removing `SelfPanel` from `/brain` may surprise users who relied on it; it remains accessible via `/brain?panel=profile` (already wired) and the profile modal.
- Virtual rooms have no `brain_get_atlas` aggregates → they always render as "exploring" until we extend the RPC. Acceptable for Phase G (read-only visualization step); a follow-up phase can light them up.
- Pinch/zoom on iOS Safari occasionally fights the page scroll — the atlas full-screen surface uses `touch-none` on the SVG layer to avoid that; `RoomView` already does the same.
