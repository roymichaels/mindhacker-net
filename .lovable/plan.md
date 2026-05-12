
# Interactive AION Mode — Architecture Spec

A dedicated immersive surface where the user feels like they are *inside AION's consciousness*. Built on top of the existing chat surface, but everything is rearranged around a single anchor: the orb.

This document is **spec only**. No files are touched yet.

---

## 1. What this is (and what it isn't)

**Is:**
- A single immersive surface activated from anywhere via the header orb (long-press) or a `⊞` chip in the composer.
- The new *default* destination after launch and after every "open AION" action.
- One mode that braids chat, voice, focus, hypnosis, and orchestration.

**Isn't:**
- A new route in the route table. It is a **mounted layer** over the current shell — the header (TL drawer / TC env pill) stays reachable on demand.
- A separate chat. It uses the same `AuroraChatProvider` conversation, the same `aion-brain`, the same persistence — only the *rendering* changes.

The current `/aurora` chat becomes a "compact" presentation of the same conversation. Interactive Mode is the "expanded" presentation. Same data, two skins.

---

## 2. Building blocks already in place

| Need | Existing piece | Reuse as-is? |
|---|---|---|
| Live AION state | `AIONStateContext` — already has `idle / listening / thinking / speaking / guiding / immersive` | Yes, drives orb + background |
| Orb shader | `StandaloneMorphOrb` (Perlin shader, already standardized) | Yes, just resize + bind |
| Conversation store | `AuroraChatProvider` + `aurora-chat` edge fn | Yes |
| Voice in | `useAuroraVoiceMode` → `elevenlabs-transcribe` | Yes |
| Voice out | `lib/ttsPlayer` + `elevenlabs-tts` (cached) | Yes |
| Decisions / brain | `aion-brain`, `AionDecisionContext` | Yes |
| Hypnosis flow | `HypnosisPage` + `services/hypnosis.ts` | Refactor into a *layer* renderable inside Interactive Mode |
| Overlay rules | `OverlayController` (just shipped) | Yes — Interactive Mode is itself an overlay kind |

Net new code is small: a layout, a voice loop wrapper, an artifact renderer, and a hypnosis layer. The intelligence already exists.

---

## 3. Layout — three concentric zones

```
┌─────────────────────────────────────────────┐
│  pt-safe                                    │
│  [≡]                                  [✕]   │  ← Chrome (auto-hides after 3s idle)
│                                             │
│                                             │
│              ╭───────────────╮              │
│              │               │              │
│              │     ORB       │              │  ← ZONE A — Presence (always)
│              │   (anchor)    │              │     ~52% of viewport height
│              │               │              │     bound to AIONStateContext
│              ╰───────────────╯              │
│                                             │
│   "ערב טוב, דין. מה אתה צריך עכשיו?"         │  ← ZONE B — Live caption
│                                             │     last AION line, large, calm
│                                             │     OR partial transcript when
│                                             │     user is speaking
│                                             │
│   ◀  Plan my day · I'm overwhelmed · …  ▶   │  ← Soft suggestion strip
│                                             │     (hidden during voice + focus)
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ﹏  Hold to speak    or type…       │   │  ← ZONE C — Composer (secondary)
│  └─────────────────────────────────────┘   │     mic is the primary affordance
│  pb-safe                                    │
└─────────────────────────────────────────────┘
```

- **Zone A (Presence)** — fills the upper half. Just the orb on a calm background. Touching it = toggle mic.
- **Zone B (Conversation)** — *one* live line of the most recent exchange, plus optional partial transcript while the user is speaking. The full chat scroll is collapsed by default (drag-up gesture re-expands it).
- **Zone C (Composer)** — single-line collapsed input + mic; expands to multi-line on tap. Voice is the primary intent; typing is the fallback.

The chat *history* is still there — pull up from the composer (or tap a tiny ≡-on-bubble icon) to expand the message stream into a half-sheet **over** Zone B without unmounting the orb.

---

## 4. Orb behavior (state → visual mapping)

`AIONStateContext.state` already has the six values we need. Each maps to a discrete orb personality:

| State | Trigger | Orb visual | Background | Sound |
|---|---|---|---|---|
| `idle` | No activity | slow breathing, default hue, ~340px | flat dark | none |
| `listening` | Mic open | tighter pulse synced to mic level (input volume), brighter ring | subtle radial glow following pulse | soft confirm tick on open |
| `thinking` | Awaiting `aurora-chat` response | slower morph, desaturated, faint orbiting particles | unchanged | none |
| `speaking` | TTS playing | morph synced to output amplitude, warmest hue | gentle ambient bloom | TTS audio |
| `guiding` | Artifact rendered (plan / next-action / list) | stable, slightly larger ring around orb | dimmed | none |
| `immersive` | Hypnosis / focus / breath session | orb expands to ~80% viewport, very slow breath, mood-tinted | full-screen darkened, particles | session audio |

**Tap = toggle mic. Long-press = open AION sheet (status + quick actions).** No other gestures on the orb itself.

The existing `StandaloneMorphOrb` already supports color/intensity props, so the binding layer is a thin `<AIONOrbStage>` wrapper that reads `useAIONState()` + voice audio levels and feeds props down.

---

## 5. Voice behavior

**Default mode = push-to-talk.** Hold the orb (or hold the mic in composer) to speak; release to send.

- **Hold-to-talk** — lowest friction, no false triggers, mirrors Siri's button mode and avoids battery/permission ambiguity.
- **Hands-free toggle** — a `🎙️` pill in the composer area flips on continuous VAD listening. While on, the orb pulses with input level and the title bar shows a tiny "live" dot.
- Transcription via existing `elevenlabs-transcribe` edge function (already wired in `useAuroraVoiceMode`).
- Once a final transcript is available, it is sent through the *same* `aurora-chat` pipeline that text uses. **No separate AI path** — voice is just a different input channel.
- AION's response auto-plays via `ttsPlayer` (already cached). Each bubble exposes a small ▶ to replay.
- Interruption: tapping the orb while AION is speaking immediately stops TTS and re-opens the mic (Jarvis behavior).

Permission UX: first time the user enters Interactive Mode, a one-line bottom sheet asks for mic. Refusing leaves type-only mode functional.

---

## 6. Composer behavior

- Collapsed by default to a single 44px row containing: mic button (left, primary), text placeholder (center), ⊞ environment chip (right).
- Tapping the text area expands to a multi-line input; the orb shrinks slightly to make room.
- Suggestion chips appear *only* when `aion-brain` returns `suggestions[]` for the current turn (≤3 chips, single line, fade edges). They disappear the moment the user starts typing or talking.
- The composer is the *only* place to type. Suggestion chips also live here so that the message stream stays clean.

---

## 7. Artifacts — inline, never as new pages

When AION decides to surface structured output (plan, next action, schedule, journal capture, lesson card, hypnosis session), it returns an *artifact* in the message envelope. Interactive Mode renders artifacts as **floating cards** that drop in below Zone B, between the live line and the suggestion strip.

| Artifact kind | Rendered as | Source already exists? |
|---|---|---|
| `next_action` | One large card with a single CTA, prefers `action_items` SSOT | yes — `services/actionItems` |
| `plan` | Compact day timeline card | yes — `utils/exportPlanPDF` aggregator |
| `journal_capture` | A "Saved to journal" toast-card with tap-to-open | yes — `aurora-capture-journal` |
| `lesson` | Course/learn card with start CTA | yes — Learning OS |
| `hypnosis_session` | Triggers immersive state, see §9 | yes — `services/hypnosis` |
| `recovery_protocol` | Soft card with breath / break suggestion | new (small) |

Artifact card max-height ≈ 35vh; if longer, it scrolls inside itself. Closing returns the orb to its full size. Artifacts never push the orb off-screen.

The contract — `{ kind, payload, cta?, dismissable }` — lives in one shared TS type so adding a new artifact later is a single switch case.

---

## 8. Focus mode (built-in, not separate)

"Focus" is a *modifier* on Interactive Mode, not a different surface.

- Trigger: AION says "let's focus" / user taps a focus chip / user says "focus me".
- Effect:
  - Background dims to near-black.
  - Suggestion chips hide.
  - Composer collapses to mic-only.
  - Orb visual shifts to `guiding` (calmer, brighter ring).
  - A thin progress arc appears around the orb showing remaining session minutes.
  - Notifications/proactive nudges from `aion-brain` are queued, not delivered.
- Exit: tap arc / long-press orb → confirm sheet → back to normal Interactive Mode.

---

## 9. Hypnosis behavior

Today `HypnosisPage` is a standalone page. Spec: refactor its body into `<HypnosisLayer>` and let Interactive Mode mount it as the `immersive` state.

- Entry: voice/text "start hypnosis" → AION emits a `hypnosis_session` artifact → user taps Begin → state flips to `immersive`.
- Layout transformation:
  - Header chrome fully hidden.
  - Orb expands to ~80% viewport with very slow breath.
  - Background tints to mood (cool/warm based on session script).
  - Audio plays via existing cached pipeline.
  - Only a single ✕ in the corner to exit.
- Exit: ✕ → fade-out → state back to `idle` → orb shrinks → composer reappears.

The standalone `/hypnosis` route still works for direct deep-links and can also be removed later — Interactive Mode supersedes it.

---

## 10. Entry / exit controls

**Entry points (all open the same surface):**
- App launch (authed) → `/` lands in Interactive Mode.
- Header orb tap (any other route) → opens Interactive Mode as full overlay.
- Drawer item "AION" → same.
- Deep links `/aurora`, `/aion`, `/talk` → all redirect to Interactive Mode.

**Exit / sub-navigation while inside:**
- `≡` (top-left) opens the left drawer (conversations + environments). Drawer is on top, orb dims behind. Closing returns instantly.
- Env pill (top-center) opens the env switcher sheet. Same behavior.
- `✕` (top-right) appears only when Interactive Mode was opened *over* another route — closes the mode and returns to that route.
- Pull-down gesture on the orb area → reveal full chat history sheet.
- Hardware back / Esc → if any sheet is open, close it; else if `✕` exists, close mode; else stay (this is home).

The `OverlayController` already enforces "one overlay at a time" — Interactive Mode is itself an overlay kind (`hub:aion-interactive`) so opening any other sheet automatically dims it without unmount.

---

## 11. Mobile-native transitions

- **Enter Interactive Mode**: 240ms fade-in for background + scale-from-0.7 for the orb (spring), header chrome cross-fades in delayed by 80ms.
- **Idle → listening**: orb scales 1.0 → 1.04 with a 120ms pulse; ambient ring opacity 0 → 0.3.
- **Listening → thinking**: ring desaturates over 200ms; particles fade in.
- **Thinking → speaking**: warmest hue cross-fades; live caption types in line-by-line.
- **Speaking → idle**: 180ms cool-down to default hue.
- **Normal → immersive (hypnosis)**: orb scales to 0.8 of viewport over 600ms, background dims, chrome cross-fades out, audio fades in.
- **Chrome auto-hide**: header pills fade out after 3s of no input; any tap re-shows them for 3s.
- All transitions use the same easing curve (`cubic-bezier(.2,.8,.2,1)`), 60fps targets, no layout thrash (transforms only).

---

## 12. Connection to drawer + environment switcher

- The **left drawer** (conversations + environments) opens *over* Interactive Mode without unmounting it. Selecting a conversation swaps the underlying `activeConversationId` in `AuroraChatProvider`; the orb stays mounted, the live caption updates.
- The **environment switcher** changes the AION persona/context (Mind / Work / Play / etc., from `EnvironmentProvider`). Switching environments triggers a 300ms hue retint of the orb and a fresh greeting line in Zone B — so the user *sees* the environment change.
- This is the spec's whole point: the user almost never navigates. They speak, AION responds, artifacts appear in place. The drawer/env are escape hatches, not the main path.

---

## 13. Component tree (target)

```
<InteractiveAION>                       ← single overlay kind: hub:aion-interactive
  <ImmersiveBackdrop state={state} />   ← reads AIONStateContext for tint/dim
  <TopChrome autoHideMs={3000} />       ← reuses existing TopBar slots (drawer, env, ✕)

  <OrbStage>
    <StandaloneMorphOrb               ← existing component, props bound to:
      state, hue, pulse, scale,         - AIONStateContext.state
      audioInLevel, audioOutLevel       - voice in/out RMS
    />
  </OrbStage>

  <LiveCaption>
    {partialTranscript ?? lastAssistantLine}
  </LiveCaption>

  <SuggestionStrip suggestions={brain.suggestions} />

  <ArtifactLayer artifacts={message.artifacts}>
    {artifact.kind === 'hypnosis_session' && <HypnosisLayer .../>}
    {artifact.kind === 'plan' && <PlanCard .../>}
    {artifact.kind === 'next_action' && <NextActionCard .../>}
    ...
  </ArtifactLayer>

  <ImmersiveComposer>                    ← collapsible, mic-primary
    <MicButton holdToTalk hands­FreeToggle />
    <TextInput collapsed />
    <EnvChip />
  </ImmersiveComposer>

  <ChatHistorySheet />                   ← bottom-sheet, opens on pull-up
</InteractiveAION>
```

Everything else (drawer, settings sheet, profile sheet) is provided by the shell from the previous phase — Interactive Mode does not duplicate them.

---

## 14. What changes in existing files (when implementation begins)

- `src/contexts/AIONStateContext.tsx` — add `audioInLevel`, `audioOutLevel`, `mood: hsl` (no behavior change yet).
- `src/components/aurora/AuroraLayout.tsx` — keep as-is; remains the "compact" presentation when accessed from non-mobile or when the user explicitly opts out.
- `src/pages/AuroraPage.tsx` — render `<InteractiveAION/>` by default; keep compact view behind a settings flag.
- `src/components/orb/StandaloneMorphOrb.tsx` — *no logic change*. Only consumed differently.
- `src/pages/HypnosisPage.tsx` — extract body into `src/components/aion/HypnosisLayer.tsx`; page becomes a thin wrapper that mounts the layer in `immersive` state.
- `src/contexts/AuroraChatContext.tsx` — extend message envelope to optionally carry `artifacts: Artifact[]` and `suggestions: string[]`. (`aion-brain` and `aurora-chat` already carry equivalents — wire them through.)
- New: `src/components/aion/InteractiveAION.tsx`, `OrbStage.tsx`, `LiveCaption.tsx`, `ImmersiveComposer.tsx`, `ArtifactLayer.tsx`, `HypnosisLayer.tsx`, `useVoiceLoop.ts` (thin wrapper over `useAuroraVoiceMode` + `ttsPlayer`).

No DB migration required for this phase. Artifacts ride in the message JSON.

---

## 15. Implementation order (when you green-light)

1. Add `<InteractiveAION>` skeleton with orb + state binding + auto-hide chrome. Mount at `/` for authed users behind a `interactive_mode` feature flag (off by default).
2. Wire `useVoiceLoop` (hold-to-talk + hands-free) using existing transcribe + TTS edge functions. Feed audio levels into `AIONStateContext`.
3. Render `<LiveCaption>` from the active conversation's last assistant message + live partial transcript.
4. Implement `<ImmersiveComposer>` (collapsed mic-first, expandable text).
5. Add `<ChatHistorySheet>` pull-up.
6. Extend message envelope + render `<ArtifactLayer>` for `next_action` and `plan` first; the rest are switch cases.
7. Extract `<HypnosisLayer>` and wire `immersive` state transitions.
8. Add Focus modifier (background dim, suggestion hide, progress arc).
9. Flip the feature flag to default-on; keep the legacy compact `AuroraLayout` reachable from settings.

---

## 16. Anti-patterns to avoid

- **No tab bar, no nav grid inside Interactive Mode.** The mode owes its feeling to having only one anchor (the orb).
- **No second AI pipeline for voice.** Voice in → transcript → existing `aurora-chat`. Same `aion-brain`. Same persistence.
- **No new modal grammars.** Sheets only, all via `OverlayController`.
- **No background gradients or theme tints across routes.** Background is a single dark; mood/state changes are *radial* and centered on the orb.
- **No autoplay of TTS without user gesture.** First entry asks for mic + audio permission via a one-line sheet; subsequent visits remember.
- **No moving the orb between zones.** The orb's location is a constant — that is what makes it feel like a *presence* rather than a widget.

---

When you say **"build phase 1"** of section 15 I'll start. Nothing is touched yet.

---

### Phase 1 — shipped

- `src/lib/clientFlags.ts` — runtime flag store (`?ff_interactive_mode=1` to enable).
- `src/components/aion/InteractiveAION.tsx` — full-bleed surface, orb anchored to ~52vh, auto-hide chrome (3s), state-driven radial backdrop, secondary composer.
- `src/pages/AuroraPage.tsx` — renders InteractiveAION when flag is on (assessment flows still use compact chat).

Next: Phase 2 (`useVoiceLoop` hold-to-talk + hands-free) and Phase 3 (LiveCaption from active conversation).
