## Phase 4D — Brain Room Conversationalization

Make Brain feel like AION guiding the user through their inner world. UI/copy only — no backend, DB, capability, or routing changes.

### Files to change

1. **`src/features/brain/atlas/RoomView.tsx`**
   - Add an AION insight sentence at the top (atmospheric, no card chrome). Pick from new `aionPresence` lines based on state: empty room, learning, forming, or noticing pattern.
   - Replace "AION is still learning" / "Room error" / "still empty" copy with softer voice ("This area is still forming", "AION keeps noticing this pattern…").
   - Strip the gaps confidence labels ("clearer" / "learning" + numeric hints) → render only the gap content as a soft bullet ("AION is still piecing this together").
   - Replace "Talk to AION" CTA with "Ask AION about this".
   - Add an "Explore deeper" ghost button that calls `artifactBus.summonFromIntent('brain-room', { roomId })`.
   - Keep `BrainGraphForce` rendering (atmospheric map stays); just remove visible technical labels around it.

2. **`src/features/brain/BrainNodeSheet.tsx`** (collapse to one conversational surface)
   - Remove the `node.type` / `node.pillar` uppercase header chip (visible only in diagnostics flag).
   - Remove the two `<Bar>` rows (confidence/strength) from default view; render only when diagnostics flag is on.
   - Remove the "What shaped this" evidence list from default view; gate behind diagnostics flag.
   - Keep the room pill (it's atmospheric, not technical).
   - Reorder CTAs into a single conversational stack:
     - Primary: **Ask AION about this** (existing handler).
     - Secondary row: **Correct this**, **Explore deeper** (existing `handoffToAion`).
     - Tertiary row: **Open as artifact** → `summonFromIntent('brain-node', { nodeId, content, room })`.
     - Demote **Yes/Not me** behind diagnostics flag.
   - Use `useDiagnosticsFlag` (already exists at `src/diagnostics/useDiagnosticsFlag.ts`) to gate technical sections.

3. **`src/lib/aion/artifactBus.ts`**
   - Add intents to `INTENT_KIND_MAP`:
     - `'brain-room'` → reuse a suitable existing kind (e.g. `'note'` or new mapping). Since Phase 4D forbids new capabilities, map both `'brain-room'` and `'brain-node'` to the existing `'note'` kind so the artifact frame opens with AION-styled content. Do not register new artifact kinds.
   - (No new ArtifactKind entries; intent layer only.)

4. **`src/copy/aionPresence.ts`**
   - Add EN/HE entries:
     - `roomStillForming` — "This area is still forming."
     - `roomNoticingPattern` — "AION keeps noticing this pattern."
     - `roomConnectedTo` — "This seems connected to…"
     - `exploreDeeper` — "Explore deeper"
     - `askAionAboutThis` already exists — keep.
   - Replace the existing "AION will build it from conversations…" line in RoomView with `roomStillForming`.

5. **`src/pages/BrainPage.tsx`**
   - Replace the "Consciousness Map" / "מפת התודעה" tracking-wide label with an AION-voiced ambient sentence (e.g. "AION's view of your inner world" / "כך AION רואה אותך מבפנים"). Smaller, single line, no uppercase tracking.
   - Hide the `atlasError.message` raw string; replace with a soft "AION lost focus for a moment." line (technical text only in diagnostics flag).

### Ask AION bridge

`onTalkToAion` already writes `aion.brain_focus` to `sessionStorage` with `{ node_id, type, content, room }` and navigates to `/aurora`. Keep this exact contract. Add `prompt` field set to:
- EN: "Tell me more about this pattern."
- HE: "ספר לי עוד על הדפוס הזה."

Node IDs remain in sessionStorage (not user-visible), no UI exposure.

### Artifact intent mapping

```text
'brain-room'  → kind 'note'  (params: { roomId, label })
'brain-node'  → kind 'note'  (params: { nodeId, content, room })
```

Uses existing `note` artifact kind — no new renderer, no capability change.

### Out of scope

- No changes to `BrainGraphForce`, `useBrainRoom`, `useBrainOverview`, `brainQuery.ts`, or any service/edge function.
- No DB column or RPC changes.
- No new artifact kinds, no new routes.
- "Yes that's me" / "Not me" handlers stay in code (gated, not removed) — backend write paths untouched.

### Acceptance deliverable

After implementation, return: files changed, copy diff, BrainNodeSheet before/after structure, Ask AION bridge contract, intent mapping, and any remaining Brain copy leaks (e.g. node IDs surfaced anywhere, "graph" / "node" / "confidence" terms still visible).