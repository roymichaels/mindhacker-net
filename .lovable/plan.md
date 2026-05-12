## Goal

Shift MindOS from a dashboard/launcher to a conversation-first OS where AION is the primary interface. UI surfaces (landing-page builder, blog creator, strategy planner, mind map, etc.) appear *because* of conversational intent, not as permanent menu entries.

## Principle

- **Conversation-first, capability surfaces second.**
- Persistent navigation = foundational only.
- Everything else = invoked by AION as in-chat artifacts, temporary workspaces, or composer actions.

## Scope

Frontend shell + composer + intent routing only. No changes to existing tool implementations (landing builder, blog creator, strategy, etc.) — they get *invoked differently*, not rebuilt.

---

## 1. Slim the world-switcher (`MindOSSheet`)

Reduce the primary grid from 9 hubs to 5 foundational destinations:

- **AION** (chat) — `/aurora`
- **Brain / Identity** — opens Brain View (existing profile sheet)
- **Timeline / Memory** — `/journal` (rebranded "Memory")
- **Notifications**
- **Settings**

**Move out of the menu** (still reachable via routes for now, but not surfaced as nav):
Strategy, Hypnosis, Free Market, Community, Learn, Career/Business/Creator/Freelancer hubs, Mind Map page, etc. → become AION-summonable capabilities.

Keep Admin link gated to admins.

## 2. Composer "+" menu (new)

Add a `+` button at the start of `AuroraChatInput` that opens a compact action sheet:

```
┌─ Composer actions ──────────┐
│ 📎 Upload / attach context  │
│ ✨ Create…  (business, page,│
│    course, blog, strategy)  │
│ 🧭 Map my mind              │
│ 🚀 Launch workflow          │
│ 🔍 Deep dive                │
│ 🎙 Voice mode               │
│ 📂 Open current task        │
└─────────────────────────────┘
```

Each entry **prefills the chat** with a structured intent (e.g. "Create a business for me") and submits — letting the orchestrator drive from there. No direct route navigation from composer.

New file: `src/components/aurora/composer/ComposerActions.tsx` + an intents registry `src/components/aurora/composer/intents.ts`.

## 3. Capability registry (intent → surface)

New file: `src/lib/aion/capabilities.ts` — single source of truth mapping intent keywords to existing routes/artifacts:

```
business      → /business       (artifact: BusinessBuilder)
landing page  → existing landing builder route
blog          → existing blog creator
course        → /courses/new
strategy      → /strategy
mind map      → Brain View (profile sheet)
fitness plan  → /strategy?domain=health
content plan  → existing content workflow
```

The orchestrator already routes intents in `aurora-chat`; we only add a *client-side* capability map so AION's responses can include a `summon: { capability, params }` directive that the chat UI renders as an in-message **"Open surface" card** (uses existing `ArtifactLayer`).

No new edge-function logic in this plan — the registry is consumed by the existing artifact renderer; orchestrator changes deferred to a follow-up if needed.

## 4. In-chat surfaces (existing `ArtifactLayer`)

Extend `src/components/aion/artifacts/ArtifactLayer.tsx` to support a new artifact kind: `capability_card` — renders title, short description, "Open" CTA, "Continue in chat" CTA. Tapping "Open" routes to the existing destination (so we don't rebuild). This is the bridge from conversation to existing tools.

## 5. Header + presence

Header structure stays as previously fixed (orb · MindOS · overflow). MindOSSheet trimmed per §1. No other header changes.

## 6. Files to change

- `src/components/shell/MindOSSheet.tsx` — slim primary grid to 5 entries; move rest to a collapsed "More" section (so power users still reach legacy pages during transition).
- `src/components/aurora/AuroraChatInput.tsx` — add `+` button + open `ComposerActions`.
- `src/components/aurora/composer/ComposerActions.tsx` (new) — bottom-sheet of composer actions.
- `src/components/aurora/composer/intents.ts` (new) — labels + prefilled prompts.
- `src/lib/aion/capabilities.ts` (new) — intent → route/artifact map.
- `src/components/aion/artifacts/ArtifactLayer.tsx` — add `capability_card` renderer.

## 7. Out of scope (follow-ups)

- Orchestrator-side intent classification upgrades (today AION can already mention capabilities in text; structured `summon` directive can ship next).
- Removing legacy routes — they remain reachable for now, just not surfaced in nav.
- Redesign of individual tool pages.
- Proactive AION suggestions / autonomous workflows (separate plan).

## 8. Acceptance signals

- MindOS sheet shows ≤6 primary tiles (foundational only).
- Composer `+` opens action sheet with at least 6 capability prompts; tapping one sends a chat message.
- AION reply containing a capability reference renders an inline `capability_card` with "Open" CTA that routes to the existing tool.
- No existing route is broken; legacy hubs reachable via "More" disclosure or direct URL.
- Hebrew/RTL labels intact; full-spelling rule respected.
