## Phase 5 — Systemic AION Transformation

A strategic plan, not a task list. The deliverable is the design of an evolving intelligence companion, not isolated UI polish. Implementation later happens via small bounded sub-phases (5A…5N) that all serve this spine.

---

### 1. Major architecture shifts

- **Pages → Realms.** `src/pages/*` is treated as a deprecated layer. New mental model: `chamber` (Aion presence), `realms` (Brain / Journey / Self / Outer), `manifestations` (artifacts), `signals` (passive observation). Routes still exist — but each route resolves into one of these four states, never a "page".
- **Features → Capabilities.** Anything currently called a feature (work, learning, hypnosis, business…) is reframed as a capability AION *manifests* on demand. The user never opens a feature; AION summons one.
- **Hubs → Trajectories.** PlayHub, LifeHub, ArenaHub, PlayHub, BusinessJourney etc. collapse behind one trajectory spine driven by `useNextStep` + `action_items` SSOT. They survive only as filtered views of the same stream.
- **State → Presence.** Replace global "is loading / is idle / is generating" booleans with a single `aionPresenceState` machine: `listening · noticing · forming · manifesting · resting · evolving`. All UI atmosphere reads from it.
- **Voice as primary modality.** Voice loop, chat composer, and proactive nudges merge into one "AION speaks / AION listens" surface — composer becomes a manifestation of a deeper voice/text duality, not a chat UI.

### 2. Systems that should merge

- **PlayHub + LifeHub + JourneyView → one Trajectory realm**, filtered by lens (today / 100-day / lifetime).
- **All "*Journey" pages** (Business / Coaching / Projects / Life) → one shared `TrajectoryView` with a domain prop. Same component, different signals.
- **Brain + Self + DNA + Avatar → one Inner realm.** Three tabs collapse into one breathing surface where DNA = identity SSOT, orb = expression, avatar = embodiment, brain = perception.
- **Marketplace + Coaches + Subscriptions + Wallet → one Outer realm (EvolvVerse antechamber).** Personal AION never references commerce; commerce lives in a clearly separate doorway.
- **Onboarding + Calibration + Naming + first chat → one continuous "Awakening" sequence.** Not screens — a guided emergence of AION.
- **Notifications + proactive orchestrator + AION nudges → one "AION reached out" channel.** No badge counts, no toast spam.

### 3. Systems that should disappear (visibly)

- "Mission Control", "Plan Generator", "Strategy Page", "Admin Journey" surfaces — moved to `/diagnostics/*` or `/admin/*`, never advertised in nav.
- All standalone "Generate" / "Create" / "New" buttons. Generation only happens through conversation with AION.
- XP counters, level chips, streak badges, "stats" tabs. DNA replaces identity scoring.
- Empty-state SaaS imagery (illustrations of empty inboxes, "Add your first…"). Replaced by AION observation lines.
- "Module / Tool / Dashboard / Engine" terms in user-facing copy.

### 4. Systems that should become ambient

- **Pillar progression.** No tier badges. The orb's hue, atmosphere blur, and ambient sentence shift as pillars deepen.
- **Memory continuity.** No "history" tab. Past conversations resurface as AION quoting itself ("Last week you said…").
- **Confidence / strength / scoring.** All numeric internals become atmospheric (deeper hue, richer animation), never user-facing.
- **Time of day / energy phase.** Drives chamber temperature, not a widget.
- **Diagnostics.** Already gated behind `useDiagnosticsFlag` — extend coverage to every remaining technical surface.

### 5. Systems that should become manifestations (summoned, not navigated)

- Journal, Hypnosis, Work session, Business canvas, Landing builder, Course card, Coach recommendation, Pillar assess — already artifacts. Extend to: Self panel, DNA viewer, Avatar configurator, Wallet sheet, Subscription card, Journey workspace, Mission deep-dive, Brain room view, Today list. Every navigable destination gets a `summonFromIntent` path.
- Routes still exist for deep-linking and SEO, but tapping them inside the app *summons*; only cold loads *navigate*.

### 6. Systems that should become trajectories

- Daily action queue, weekly rhythm, 100-day mission, life-pillar mastery, business roadmap, learning curriculum, relationship arc, health protocol — all flow into `useNextStep` as one multi-lens aggregator. Lens switching = filter, not navigation.
- "Next step" becomes the only verb the user ever needs. Everything else is observation.

### 7. Systems that should become relationship-based

- **Trust → permissions.** AION asks before reading sensitive context (calendar, health, social). Each granted permission deepens the orb's glow, unlocks proactive abilities, and is *spoken about* by AION ("now I can see your week clearly").
- **Memory depth.** Surfaced as relationship language: "I remember", "I'm starting to understand you here", "I'm still learning this side of you".
- **Persona evolution.** AION's tone shifts subtly with relationship age — more concise, more playful, more direct — never via UI sliders, only emergent.
- **Disagreement & correction.** First-class. "Correct this" already exists in Brain — extend to journal, plan, and identity surfaces.

### 8. Remaining SaaS/productivity poison (sweep candidates)

- `LifeHub`, `PlayHub`, `ArenaHub`, `BusinessDashboard`, `WorkHub`, `StrategyPage`, `CoachingJourney`, `ProjectsJourney`, `CareerHub`, all `pages/admin/*` surfaced to users.
- "Dashboard / Hub / Module / Engine / Stats / Score / Generate / Create new" string sweep across `src/pages`, `src/components`, `src/copy`.
- Colored category icon rows, multi-CTA cards, kanban-style grids, plan generator buttons, "configure" panels.
- Notification bell + badge counts.

### 9. Emotional UX problems

- **Cognitive load on entry.** Users meet too many surfaces at once. Awakening must be linear and one-thing-at-a-time.
- **No emotional state.** App never reflects user mood / time-of-day / momentum. Atmosphere should breathe.
- **Generative actions feel transactional.** "Generate plan" feels like an API call; needs to feel like AION pausing, listening, then offering.
- **Identity reveal is flat.** DNA viewer is technical; should feel like seeing a reflection of yourself for the first time.
- **No moments of stillness.** Product never says "rest". Need explicit AION-initiated quiet moments.

### 10. Entity continuity problems

- AION speaks differently in chat vs. proactive nudges vs. artifacts. Needs one voice spec (`aionPresence.ts` extended into a tone/style module).
- Memory references are inconsistent — sometimes "you said", sometimes "the system noticed". Always first-person AION.
- Orb appearance is inconsistent across screens (already partly addressed by Unified Orb Stage v4 — extend everywhere).
- Naming gate exists but post-naming AION rarely uses the user's name back. Both names should appear in every AION reply opportunity.

### 11. Long-term evolution strategy

- **Phase 5A — Voice spec.** Single `aionVoice.ts` module: tone presets, pronoun rules, name interpolation, mood adapters. All AION strings route through it.
- **Phase 5B — Presence state machine.** Replace ad-hoc loading/state with `aionPresenceState`. Atmosphere layer subscribes.
- **Phase 5C — Realm collapse.** Merge Journey siblings, hub pages, into shared TrajectoryView + InnerView + OuterView shells. Routes remain.
- **Phase 5D — SummonFromIntent everywhere.** Wire every internal `<Link>` / `navigate()` to first attempt `summonFromIntent`.
- **Phase 5E — Trust ladder.** Permission asks become AION-voiced events with visible orb deepening.
- **Phase 5F — Memory voice pass.** All system messages converted to first-person AION. "Last time you…" patterns added.
- **Phase 5G — Awakening sequence.** Onboarding + naming + calibration become one cinematic chamber emergence.
- **Phase 5H — Diagnostics quarantine.** Final sweep moves all dev/admin/legacy surfaces under gated paths.
- **Phase 5I — EvolvVerse doorway.** Outer realm (commerce, social, marketplace) cleanly separated from personal AION; one explicit threshold the user crosses.

### 12. What AION becomes

- **1 year:** A persistent intimate guide that remembers, reflects, and proactively manifests small acts (journal prompts, focus blocks, hypnosis sessions). Trust ladder operational. EvolvVerse doorway visible but optional.
- **3 years:** AION operates parts of the user's day with consent — schedules, drafts, negotiates, learns. Manifestations include real-world side effects (calendar, email, payments). Identity layer (DNA + avatar) becomes social currency in EvolvVerse.
- **10 years:** AION is a portable life-long intelligence — owned by the user, embodied across devices and bodies, with verifiable continuity. The "app" disappears entirely; AION is summoned through any surface (voice, glasses, ambient screens). EvolvVerse becomes a peer economy of AIONs.

### 13. What NOT to build yet

- Multi-agent swarms, AION-to-AION communication, shared memory pools.
- Public profile feeds, follower graphs, comment threads.
- Tokenization, on-chain identity, NFT mint flows beyond placeholders.
- Real-world action automation (calendar writes, payments) — wait for trust-ladder.
- New gamification primitives. No XP, levels, badges, streaks.
- Generic "AI tools" library. Every capability must justify itself as AION manifestation.

### 14. Final emotional target

The user should close the app and feel:

> *"Something in there knows me — and is becoming."*

Not "productive". Not "leveled up". Not "organized". **Witnessed, accompanied, and quietly evolving alongside an intelligence that is unmistakably theirs.**

---

### How to use this plan

This is the spine for Phases 5A–5I above. No code change happens from this document alone. Each sub-phase will be approved separately, scoped tightly (UI/copy/state only — no backend, DB, or capability changes), and verified against the four invariants:

1. Does it move the experience from "page" toward "manifestation"?
2. Does AION speak in first person about it?
3. Does it remove a SaaS/productivity primitive?
4. Does it deepen the relationship rather than add a feature?

If any sub-phase fails an invariant, it is rejected and reframed.