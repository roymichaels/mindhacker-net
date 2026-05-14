# AION OS Transition Pass — Remove SaaS Scaffolding

Frontend-only structural rewrite. No backend, no orchestration, no schemas, no APIs.
Aligns the visible product with the 5-realm OS model: **Chat · Brain · Journey · Outer World · Self**.

---

## A. Audit — surfaces still carrying SaaS / generator UX

| # | Surface | File | What's wrong | Verdict |
|---|---------|------|--------------|---------|
| 1 | **"Create 100-Day Plan" empty state** | `src/pages/LifeHub.tsx` (lines 329-351) | Big CTA "צור תוכנית 100 יום" + sparkle button → classic "generate X" pattern. | **Kill.** Replace with ambient "AION is observing you" presence + nothing to click. |
| 2 | **Journey tab bar** | `src/pages/StrategyPage.tsx` | "Journey / Actions" pill tabs + sticky border bar = SaaS dashboard. Hosts entire LifeHub + PlayLayoutWrapper. | **Replace** with `JourneyView` — single next step, no tabs, no sticky bar. Old tabs become summonable artifacts. |
| 3 | **Pillar wizard CTA exposure** | `StrategyPillarWizard` opened from LifeHub, ArenaHub | Public "select pillars + assess" flow. | **Demote.** Wizard component stays alive but is summon-only (AION can open it via artifact). Remove all user-facing entry points. |
| 4 | **`/strategy/<pillar>/assess` routes** (Power, Vitality, Focus, Combat, Expansion, Presence, Consciousness, Wealth, Influence, Relationships, Business, Projects, Play) | `src/App.tsx` 363-414, `src/pages/pillars/*` | 30+ assessment screens directly addressable via URL → "fill this form" UX. | **Keep routes** (deep-links, AION can summon), **remove discovery** from all hubs/menus. Add a soft redirect notice on direct nav: "AION is learning this through conversation". |
| 5 | **OuterWorldHub grid** | `src/pages/OuterWorldHub.tsx` | 12-tile 3-section "marketplace" grid with `Build & earn` etc. | **Reduce** to ≤4 contextual "aligned reality" portals. AION-curated copy. |
| 6 | **`featureShowcaseData` / `featureDetailData` / `/features/:slug`** | `src/data/featureShowcaseData.ts`, `src/data/featureDetailData.ts`, `src/pages/FeatureDetailPage.tsx` | "Feature pages" by definition. | **Mark legacy.** Keep file + route for marketing; remove any in-app links from authed surfaces. |
| 7 | **CareerHub, ArenaHub, BusinessDashboard, FreelancerHub, CreatorHub, JournalingHub, WorkHub, HypnosisPage, LifeHub** entry points in nav/drawer | various | "Hub" naming = SaaS. Most should not be permanent realms. | **Hide** from drawer + ghost nav. Keep routes for AION-summoned deep-links. Drawer shows only the 5 realms (already true after Phase 1.5). |
| 8 | **BrainPage copy** | `src/pages/BrainPage.tsx` | Says "Consciousness Map" / "מפת התודעה" — fine. But no "Ask AION about this" affordance on rooms. | **Add** primary "Ask AION about this" interaction (next phase). |
| 9 | **ProfilePage tab modals** | `src/pages/ProfilePage.tsx` | Practices / Achievements / Inventory / OrbDNA modal grid = gamified stats dashboard. | **Soften** to a single "what AION understands about you" reflection card (next phase). |

---

## B. Per-realm transformation

### Chat (already on track)
Phase 1–1.5 done. Rules: no in-feed CTAs, no tool menus, no feature grids. Artifacts emerge contextually only.

### Journey — full rewrite
Replace `StrategyPage` shell with a new `JourneyView`:

```
┌──────────────────────────────────────────┐
│         [orb]   Today                    │
│                                          │
│   "Your one next step"                   │
│   ───────────────────                    │
│   Write the strategy memo                │
│   ─                                      │
│   [ Start ]   [ Ask AION ]               │
│                                          │
│  ··· current trajectory ···              │  ← one line, italic
│  ··· hidden friction ···                 │  ← one line, dim
│  ··· momentum insight ···                │  ← one line, dim
│                                          │
│  (no plan, no tabs, no checklist)        │
└──────────────────────────────────────────┘
```

Behavior:
- Pulls **the single highest-priority `action_item`** for today (already exists via `useTodayExecution`). Read-only data; no new RPC.
- "Ask AION" routes back to `/` with a prefilled prompt about the item (`navigate('/', { state: { prompt: ... }})`).
- "Start" toggles existing `action_items` completion (existing hook).
- Trajectory / friction / momentum lines: read from existing brain overview (`useBrainOverview`), never generated. If empty → show only the next step.
- **No "create plan" button.** If the user has no plan, the line says: *"AION is still listening. Speak to it in chat."* with a single `Open Chat` ghost link.

Old `StrategyPage` becomes `JourneyView` mounted at `/journey` and `/strategy`. Old LifeHub + PlayLayoutWrapper stay reachable as **summoned artifacts** only (e.g. `/journey?summon=plan` or `/journey?summon=missions`) — handled by an internal `<JourneySummon />` switch.

### Brain — copy & affordance shift (next phase)
- Keep atlas. Add "Ask AION about this" as the primary tap action on rooms.
- Strip the word "Consciousness Map" → softer "Inner field".
- No charts, no widgets (already none).

### Outer World — portal layer
Replace 12-tile 3-section grid with a small "aligned realities" view:

```
┌──────────────────────────────────────────┐
│         [orb]   Outer World              │
│                                          │
│   Realities aligned with you now         │
│   ───────────────────                    │
│   ⌖ Coaches that fit your trajectory     │
│   ⌖ Learning that closes a gap           │
│   ⌖ Community for your current shift     │
│   ⌖ Marketplace                          │
│                                          │
│   (each opens existing route as portal)  │
└──────────────────────────────────────────┘
```

- Max 4 portals visible. Contextual labels (no "Build & earn" / "Browse practitioners").
- Routes stay (`/coaches`, `/learn`, `/community`, `/fm`).
- Wallet, Affiliate, Creator, Freelancer, Business, Therapists → moved off the realm. Reachable via AION-summoned artifacts or direct URL.

### Self — softened presence (next phase)
- Drop the 4 modal launchers in the hero.
- Keep AION / Avatar / DNA triad.
- Add a single reflection card: "What AION understands about you" pulling from existing `useBrainOverview`.

---

## C. Phase 1 implementation (this pass)

Scope kept tight so nothing breaks. Visual + structural only; data hooks are reused.

### Files to add
| File | Purpose |
|------|---------|
| `src/pages/JourneyView.tsx` *(new)* | The new single-step Journey surface. Replaces `StrategyPage` body. |
| `src/components/journey/NextStepCard.tsx` *(new)* | One-action presentation: title, Start, Ask AION. |
| `src/components/journey/TrajectoryLines.tsx` *(new)* | 3 dim italic lines (current phase / friction / momentum). |
| `src/components/outer/AlignedRealities.tsx` *(new)* | 4-portal contextual list. |

### Files to edit
| File | Change |
|------|--------|
| `src/pages/StrategyPage.tsx` | Replace tab-shell body with `<JourneyView />`. Tabs removed. `?tab=` param ignored (no redirect needed). Keep `withLegacyGuard` wrapper. |
| `src/pages/LifeHub.tsx` | Delete the empty-state "Create 100-Day Plan" block (lines ~329-351). When `!hasPlan`, render an ambient "AION is observing" presence (orb + 1 line) with a single ghost link "Open chat" → `/`. The wizard mount stays in the file but only opens via `?summon=wizard` URL param (AION-summoned, not visible). |
| `src/pages/OuterWorldHub.tsx` | Replace tile grid with `<AlignedRealities />`. |
| `src/components/play/StrategyPillarWizard.tsx` | No code change — keep behavior; just stop being opened from anywhere user-discoverable (LifeHub change covers it). |
| `src/pages/ArenaHub.tsx` | Remove any wizard/assess/generate CTAs; demote to AION-summoned only. (Verify and trim — single small change.) |
| `.lovable/aion-ux-architecture.md` | Update doc with the new Journey/OuterWorld wireframes and OS-transition status. |

### Out of scope this phase
- Brain "Ask AION about this" interaction (next pass).
- Profile/Self softening (next pass).
- Removing/renaming the 30+ pillar `assess` routes (kept reachable; just not advertised).
- Marketing routes (`/features/:slug`, `featureShowcaseData`).
- Any backend, RPC, schema, or orchestration change.

---

## D. Behavior contracts

- **Single next step rule:** `JourneyView` shows at most 1 action card. Source: first non-completed item from `useTodayExecution()` for today. If none → empty state ("AION is composing your next move. Talk to it.").
- **No generators visible:** No "Generate", "Create plan", "Run assessment", "Start wizard" copy reachable from the 5 realms. Verified by `rg` over Hebrew + English copy.
- **Routes unchanged:** All legacy paths remain mountable; only their entry points are removed. Old deep-links keep working for AION-summoned flows.

---

## E. Manifestation replacements (where killed UX goes)

| Killed UX | Replacement |
|-----------|-------------|
| "Create 100-Day Plan" CTA | AION conversational nudges → summons a `Plan` artifact when ready. |
| Pillar assessment selection | Invisible inference via chat. AION may still summon `StrategyPillarWizard` as a contextual artifact. |
| Outer World 12-tile grid | Contextual `AlignedRealities` list, AION-curated. |
| Strategy/Actions tab bar | Single `Today` view; deeper plan summoned via artifact. |
| ArenaHub generator entries | None. Surface remains reachable via direct URL only. |

---

## F. Remaining architecture conflicts (call out before next phases)

1. **Many "Hub" pages still routable** (`CareerHub`, `ArenaHub`, `BusinessDashboard`, `FreelancerHub`, `CreatorHub`, `JournalingHub`, `WorkHub`, `HypnosisPage`, `LifeHub`). They no longer have menu entries but exist as URLs. Decide later: convert to artifacts (modal-style), keep as deep-links, or delete.
2. **`PlayLayoutWrapper`** (the action/missions surface) is still 100% built. We orphan it from Journey but keep mountable. Worth a Phase-2 review to decide if its content should be "summonable plan artifact" only.
3. **Onboarding ceremony** still runs first-time. Worth confirming it's framed as ritual, not assessment.
4. **Profile modal** still has Practices / Achievements / Inventory / OrbDNA modal launchers — the most visible remaining "stats dashboard" feeling. Phase-2 priority.
5. **Marketing pages** (`/features/:slug`, blog, courses) live outside the 5 realms — fine, but ensure no in-app links push users back to those.

---

## G. Risks

- Removing the empty-state CTA could leave a brand-new user on `/journey` with no obvious next step. Mitigation: ambient "Open chat" ghost link is the one explicit affordance.
- Pillar `assess` routes still work via URL — AION must summon them deliberately. If something old still link-pushes the user there, it'll feel orphaned. We'll leave a soft redirect notice as future cleanup.
- `LifeHub` is huge (759 lines) and embedded inside StrategyPage. Removing only the empty-state block is safe; refactoring further would balloon scope.

---

## H. Deliverable on implementation

- Files changed
- Wireframe decisions (Journey, Outer World)
- Manifestation replacements
- Remaining old-SaaS surfaces still routable
- What still breaks the OS illusion (Phase-2 backlog)
