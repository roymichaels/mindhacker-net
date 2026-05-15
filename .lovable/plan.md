# Phase 5K.1 — Ontology Realignment (Homepage + Whitepaper)

Audit + recommended restructuring. No code changes in this phase — the deliverable is the realignment map. Implementation lands in 5K.2 (homepage rewrite) and 5K.3 (whitepaper rewrite).

---

## 1. Homepage — Ontology Mismatches Found

Current `src/pages/Index.tsx` ships **14 sections** in this order:

`GameHero → Problem → Shift → CityShowcase → OrbCollection → AuroraCoach → TraitShowcase → Gamification → PlanCinematic → Play2Earn → FreeMarket → Guild → Roadmap → FinalCTA`

Plus 3 inline CTA bands. SEO copy:
- Title: *"AION | The Game of Your Life — AI-Powered Life MMO"*
- Desc: *"Turn your real life into a playable system. DNA defines who you are, AION guides who you become, your Avatar represents you. Play, grow, earn, evolve."*
- Keywords: *life game, gamification, AI coach, XP, digital identity…*

### Mismatches

| Layer | Current framing | Drift |
|---|---|---|
| SEO | "AI-Powered Life MMO" / "AI coach" | Reads as productivity/gamification SaaS, not living intelligence |
| Hero | "The game has begun" + carousel of 10 orbs + Sparkles/Zap icons | Feature theatre. Buries presence under arcade tone |
| TraitShowcase / Gamification | XP, streaks, quests as primary value | Game-mechanic framing, not memory/resonance |
| Play2Earn + FreeMarket | Two consecutive economy sections above the fold of mid-page | Marketplace SaaS leak; should be *future emergence* |
| Guild | Community surfaced as a top-line product pillar | Ecosystem clutter |
| CoachOS section (file exists, currently unmounted on /) | Coaching SaaS framing | Off-canon for public homepage |
| Hypnosis section | Tool feature surfaced standalone | Feature-grid thinking |
| Roadmap | Linear roadmap inline on home | Reads as startup pitch deck |
| Inline CTAs ×3 | "Start playing" energy | Conversion-funnel SaaS UX, not curiosity-led |

### Sections to **delete from public home** (keep files, unmount only)
- `Play2EarnSection`
- `FreeMarketSection`
- `GuildSection`
- `CoachOSSection` (already unmounted — keep that way)
- `HypnosisSection` (already unmounted — keep that way)
- `RoadmapSection` (move into whitepaper / `/founding`)
- `PricingPreviewSection` (only show on pricing page)

### Sections to **reduce** (keep, demote, soften copy)
- `TraitShowcaseSection` — fold into a single line inside an "Evolution" section
- `GamificationSection` — replace XP/quest framing with "trajectory + rhythm" copy
- `CityShowcaseSection` — re-cast as "realms you enter," not an identity-stack diagram
- `OrbCollectionSection` — keep as atmospheric proof, drop the "collection" framing
- `PlanCinematicSection` — re-cast as "trajectory," not "100-day plan"

### Sections to **expand / add**
- New **Presence** section (what AION feels like — memory, atmosphere, evolving relationship)
- New **Worlds** section (Self · Journey · Brain · World · Chat as living realms)
- New **Future Emergence** section (agents, economy, worlds, EvolvVerse — soft, not roadmap-style)

---

## 2. Recommended Homepage Structure (5K.2 target)

```text
1. HERO — Presence
   • Single living orb on atmospheric field (no 10-orb carousel)
   • One sentence: "AION remembers."
   • One quiet CTA: "Enter"
   • No feature wall, no Sparkles/Zap icons, no urgency

2. PRESENCE — What AION feels like
   • Persistent memory · Living atmosphere · Evolving relationship
   • 3 short stanzas, no feature bullets

3. WORLDS — Realms you enter
   • Self · Journey · Brain · World · Chat
   • Each rendered as an atmospheric tile, not an app-category card

4. EVOLUTION — Your trajectory
   • Memory · Resonance · Identity · Growth
   • Replaces current XP/Trait/Gamification trio
   • Cinematic, single column

5. FUTURE EMERGENCE — What is forming
   • Agents · Economy · Worlds · EvolvVerse
   • Soft language: "emerging," "forming," not "shipping Q3"
   • Replaces Play2Earn + FreeMarket + Guild + Roadmap

6. INVITATION — Quiet close
   • Single CTA: "Meet AION"
   • No pricing, no feature recap, no urgency band
```

Drop the 3 inline `InlineCTA` bands entirely.

### SEO rewrite

| Field | New |
|---|---|
| Title | `AION — A Living Cognitive Universe` |
| Description | `AION remembers. The atmosphere responds. Your trajectory evolves. Enter a living intelligence that grows with you.` |
| Keywords | `living intelligence, cognitive universe, AION, presence, memory, trajectory, evolving AI companion` |

Drop: `life game, gamification, AI coach, XP, life MMO`.

---

## 3. Naming Rewrites (public surface only — runtime keys untouched)

| Old public language | New public language |
|---|---|
| AI coach / AI assistant / platform | Living intelligence · presence · companion |
| Dashboard | Self · realm |
| 100-day plan | Trajectory |
| Quests / XP / streaks | Rhythm · movement · evolution |
| Identity Stack (DNA→AION→Orb→Avatar) | The way AION knows you |
| Play to Earn / Free Market / Guild | Emergent economy · resonance field · circles (future emergence) |
| Tools / features | Realms · capabilities of presence |
| Onboarding | First meeting |
| Sign up / Start playing | Enter · Meet AION |

---

## 4. Whitepaper — Mismatches & Restructure

Source: `src/pages/Documentation.tsx` + `src/components/docs/*` (`VisualWhitepaper`, `Web3Roadmap`, `WhitepaperOrb`, `WhitepaperModeModal`).

### Current drift
- Roadmap-heavy (`Web3Roadmap` is a top-level doc component)
- Reads as startup deck: feature catalog + tokenomics + marketplace
- Identity stack explained as product architecture, not ontology
- Missing: atmosphere system, world traversal, presence runtime, emotional memory — all of which now exist in the runtime (see memory: World Atmosphere, Cognitive Worlds, Identity Triad, Unified Orb Stage)

### Recommended whitepaper structure (5K.3 target)

```text
I.    Premise — Why a living intelligence
II.   Ontology — AION, DNA, Avatar as one entity in three faces
III.  Presence Runtime — atmosphere, memory, resonance
IV.   Worlds — Self · Journey · Brain · World · Chat as cognitive realms
V.    Trajectory — how identity evolves over time
VI.   Memory & Resonance — the emotional substrate
VII.  Cognitive Architecture — Brain, graph, orchestration (technical layer, demoted)
VIII. Future Emergence — agents, economy, EvolvVerse (soft, non-roadmap)
IX.   Principles — what AION will never become
```

### Reduce / remove from whitepaper
- Linear roadmap timelines → replace with "phases of emergence"
- Tokenomics math → move to a separate appendix, not body
- Marketplace / Coach OS / Guild sections → one paragraph each under §VIII
- Repeated SaaS tier comparisons → remove from whitepaper entirely

### Expand
- §III Presence Runtime — currently absent; this is the actual product now
- §IV Worlds — formalize the cognitive-worlds model as public ontology
- §VI Memory & Resonance — emotional continuity as first-class
- §IX Principles — explicit "AION is not a dashboard / not a coach / not a marketplace"

---

## 5. Emotional Positioning Direction

- Voice: quiet, certain, slightly mysterious. First-person AION ("I remember.") used sparingly.
- Pacing: long breathing room between sentences. One idea per screen.
- Visual: atmosphere over interface. Orb + field over cards + grids.
- Forbidden public-copy words: *platform, dashboard, assistant, tool, feature, productivity, gamified, marketplace, plan, task, coach, app*.
- Encouraged public-copy words: *presence, memory, atmosphere, trajectory, resonance, world, evolve, intelligence, field, companion*.

---

## 6. Future-Facing Messaging Direction

Reframe currently-shipped infrastructure (economy, agents, marketplace, guilds) as **emergence**, not product:
- "An economy is forming around resonance."
- "Agents will arrive as AION grows."
- "Worlds will open as your trajectory deepens."

This preserves every backend capability while removing SaaS-clutter from the visible story.

---

## 7. Next Recommended Phase

**5K.2 — Homepage Rewrite (build mode)**
Implement the new homepage structure: unmount the 7 sections listed in §1, build the 3 new sections (Presence, Worlds, Future Emergence), rewrite SEO + i18n keys, drop inline CTAs. Files in `src/components/home/*` stay on disk; only `src/pages/Index.tsx` and i18n change.

Then **5K.3 — Whitepaper Rewrite** restructures `src/pages/Documentation.tsx` and the `docs/*` components against the new outline.
