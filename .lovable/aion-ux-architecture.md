# AION — Product Experience Architecture

**Status:** Plan approved → Phase 1 implemented.
**Premise:** AION is a Jarvis-like intelligence. The user mostly *talks* to it; the UI *manifests* on demand.

---

## 1. Final App Surface Map

Only **5 permanent surfaces.** Everything else is summoned.

| Surface | Route | Purpose | What it is NOT |
|---|---|---|---|
| Chat | `/` | Command chamber. Talk to AION. | Dashboard, chatbot, feature grid |
| Brain | `/brain` | Inner map. Self-knowledge. | Analytics graph |
| Journey | `/play` | Today + active mission. | Task dashboard |
| Outer World | `/outer` (alias of marketplace/coaches) | Portals to economy, coaches, learning | SaaS marketplace |
| Profile / Self | `/profile` | Identity, avatar, DNA. | Account settings |

Navigation: 5-tab dock (`AionNavDock`), summonable via swipe / hidden by default during deep chat.

Everything currently exposed as a top-level route that is NOT one of the 5 → demoted to **artifact** or **hidden behind AION**.

---

## 2. Main Screen Wireframes (text)

### Chat (Command Chamber)
```
┌──────────────────────────────────────────┐
│        [bloom]  AION  [orb]              │  ← floating header, no band
│  ─                                       │
│                                          │
│   AION presence ✦                        │  ← idle: orb + greeting
│                                          │
│   ◯ "I'm here. What's on your mind?"     │  ← AI msg (left, 88%, blurred-in)
│                                          │
│              "I want to focus today" ▢   │  ← user msg (right, 72%)
│                                          │
│   [ artifact: Today plan ]               │  ← summoned, lifecycle
│                                          │
│  ─                                       │
│   ╭──── ▢  Talk to AION  ●  ────╮       │  ← composer dock w/ underglow
│  ──────────────────────────────────────  │
│   nav: chat | brain | journey | … |  me  │  ← only when scrolled-up / idle
└──────────────────────────────────────────┘
```

### Brain (Inner Map)
```
┌──────────────────────────────────────────┐
│              [orb]  Inner Map            │
│                                          │
│       ✦   ✦                              │
│    ╲     ╲                               │  ← rooms (memory clusters)
│   ✦──● self ──✦                          │  ← self at center
│         ╲                                │
│          ✦                               │
│                                          │
│  Tap a room → "Ask AION about this"      │
└──────────────────────────────────────────┘
```
No bar charts. No "85% confidence". Rooms are nebula clusters; copy is human.

### Journey (Today / Path)
```
┌──────────────────────────────────────────┐
│              [orb]   Today                │
│                                          │
│   "Your one next step"                   │
│   ─────────────────                      │
│   ◯ Write the strategy memo              │  ← single next action
│      [ start ]   [ ask AION ]            │
│                                          │
│   Active mission: …                      │  ← collapsed by default
│   Plan summary  …                        │  ← summonable artifact link
└──────────────────────────────────────────┘
```

### Outer World
```
┌──────────────────────────────────────────┐
│              [orb]  Outer World          │
│                                          │
│   ╭─ Coaches  ─╮  ╭─ Marketplace ─╮      │  ← max 4 portals, gold mood
│   ╰────────────╯  ╰────────────────╯      │
│   ╭─ Learning ─╮  ╭─ Wallet      ─╮      │
│   ╰────────────╯  ╰────────────────╯      │
└──────────────────────────────────────────┘
```

### Profile / Self
```
┌──────────────────────────────────────────┐
│              [orb]   Self                │
│                                          │
│   AION    Avatar    DNA                  │  ← triad cards
│   ────    ──────    ───                  │
│                                          │
│   "What I understand about you"          │
│   …corrections + privacy summarized      │
└──────────────────────────────────────────┘
```

---

## 3. Artifact Taxonomy

Every artifact has: **purpose · lifecycle · source · primary action · dismiss/keep · mood**.

| Category | Lifecycle | Default action | Persistence |
|---|---|---|---|
| **Insight** | summon → read → dissolve (TTL 9s) | "Save" | journal if saved |
| **Plan** | summon → read → keep | "Open Plan" | links into Journey |
| **Today** | summon → act → completes/dissolves | "Start" | updates `action_items` |
| **Task** | summon → act → confirm | "Complete" | confirmation required |
| **Confirmation** | summon → confirm/cancel (sticky) | "Confirm" | gates a real mutation |
| **Hypnosis** | summon → play → dissolve | "Play" | session log |
| **Journal** | summon → save → dissolve | "Save" | persists in journal |
| **Brain Room** | summon → enter → navigates | "Enter" | nav to Brain |
| **Identity** | summon → review → keep | "Review" | persists in Profile |
| **Business** | summon → act → keep | "Open canvas" | persists in business hub |
| **Marketplace** | summon → tap → portal | "Open" | navigates Outer |
| **Coach** | summon → tap → contact | "Connect" | navigates Outer |
| **Work Session** | summon → start → in-place timer | "Begin" | session log |
| **Media** | summon → play → dissolve | "Play" | none |

Visual contract: each rendered via `AionArtifactCard` / `AtmoArtifact`, wrapped in `ManifestedArtifactShell`, mood color from `moods.ts`. **No artifact may render as a generic Tailwind Card.**

---

## 4. Capability → UX Behavior Table

| Capability | Invoked by | In launcher? | Confirms? | Artifact | Brain | Journey | Lifecycle |
|---|---|---|---|---|---|---|---|
| `journal.capture` | chat | no | yes | Confirmation → Journal | — | — | dissolves |
| `action.complete` | chat | no | yes | Confirmation | — | updates | dissolves |
| `journey.nextAction` | chat | no | no | Today | — | — | sticky until acted |
| `plan.summarize` | chat | no | no | Plan | — | links | keep |
| `plan.regenerate` | chat | no | **yes (sticky)** | Confirmation → Plan | — | rebuilds | dissolves on confirm |
| `hypnosis.recommend` | chat | no | no | Hypnosis | — | — | dissolves on stop |
| `brain.openRoom` | chat | no | no | Brain Room → navigate | enters | — | dissolves on nav |
| `business.createDraft` | chat | no | yes | Confirmation → Business | — | — | persists in hub |
| `coach.recommend` | chat | no | no | Coach | — | — | dissolves on dismiss |
| `wallet.open` | chat | no | no | Wallet sheet | — | — | dissolves |
| `marketplace.card` | chat | no | no | Marketplace portal | — | — | navigates |
| `work.start` | chat | no | no | Work Session | — | logs | in-place timer |
| `identity.update` | chat | no | yes | Confirmation → Identity | — | — | persists in Profile |

Rule: **launcher = empty.** No grid of buttons. AION is the launcher.

---

## 5. User Journey Examples

**a. "I want to focus today"**
1. User types intent.
2. AION: "OK. Here's your one next step."
3. **Today artifact** manifests with one action.
4. Tap Start → Work Session artifact replaces it (in-place timer).
5. Done → confirmation → action_items update → dissolve.

**b. "I feel stuck"**
1. Intent.
2. AION asks one clarifying question.
3. **Insight artifact** appears with re-frame; "Save" → Journal.
4. Optional follow-up: "Want a 10-min reset?" → Hypnosis artifact.

**c. "Show my brain"**
1. Intent.
2. AION: "Pull up your inner map."
3. **Brain Room artifact** appears with 1-tap "Enter" → navigates `/brain`.

**d. "Plan my day"**
1. Intent.
2. Plan artifact manifests → "Open Plan" → links to Journey.

**e. "Build me a business idea"**
1. Intent.
2. **Confirmation artifact** ("Create draft business?").
3. On confirm → Business Canvas artifact persists in business hub.

---

## 6. Migration: What Changes Where

### To remove from view
- All persistent feature grids on Chat screen
- Pillar action button on chat (move to summoned `Today` artifact)
- "About" sheet hint version chip
- Permanent quick-action toolbars
- Visible model picker / token counter
- All "X capabilities available" rails

### To convert into artifacts
- Strategy approval dialog → Confirmation artifact (already migrated)
- Action confirmation modal → Confirmation artifact (already migrated)
- Wallet modal → Wallet artifact (sheet kind)
- Hypnosis player → Hypnosis artifact
- Coach picker → Coach artifact
- Business canvas → Business artifact
- Free Market hub → Outer World portal cards
- Work hub → Work Session artifact

### To keep permanent
- Header (AION title + orb + ghost menu)
- Conversation feed
- Composer dock
- 5-tab nav dock (idle-only)
- Brain / Journey / Outer / Profile routes

---

## 7. Migration Phases

| Phase | Scope | Status |
|---|---|---|
| **1** | Chat command chamber + artifact placement + composer cleanup + hide persistent controls | **this turn** |
| 2 | Brain inner-map UX (rooms, ask AION, no charts) | next |
| 3 | Journey "one next step" UX | after |
| 4 | Outer World portal cards | after |
| 5 | Profile self-model (triad + corrections) | after |
| 6 | Capability → artifact wiring sweep | after |

---

## 8. Risks

- Hiding persistent controls breaks habitual flows → keep nav dock summonable, surface "Try saying…" hints in idle Chat.
- Artifact churn risk → use `ManifestationProvider`'s "single primary at a time" rule (already enforced).
- Removal of feature grids may hide capabilities from new users → `Brain` becomes the discovery surface (rooms = capabilities).
- RTL sweep needs revalidation per surface migration.
