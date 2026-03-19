# PRODUCT_SPEC.md — Frozen Source of Truth

> **Purpose**: This document is the contract that all future prompts reference before making changes.  
> **Last updated**: 2026-03-10  
> **Rule**: No UI or architecture change may contradict this spec without updating it first.

---

## Section 1: The 5 Bottom Tabs

### Tab 1: FM (`/fm/earn`)

| Field | Value |
|-------|-------|
| Label | FM |
| Icon | `Store` |
| Purpose | Free Market — earn, trade, and manage MOS tokens |

**MVP Behaviors:**
- Earn MOS via data sharing, mining, bounties, referrals
- 10-milestone Earn Launchpad onboarding
- Marketplace (courses, NFTs, services)
- Wallet & cashout
- AI-powered content publishing via Aurora wizard

**Sub-routes:** `/fm/earn`, `/fm/work`, `/fm/wallet`, `/fm/cashout`, `/fm/bridge`

---

### Tab 2: PLAY (`/play`) — Center Tab

| Field | Value |
|-------|-------|
| Label | Play |
| Icon | `Flame` (oversized, w-16 h-16, no text label) |
| Purpose | Unified execution hub — tactics, strategy, and work |

**MVP Behaviors:**
- `PlayHub` — merged Tactics + Strategy + Work views
- Tactics: daily/weekly task execution with movement score
- Strategy: 100-day life plan, pillar assessments (via modals)
- Work: projects and milestones management
- `PlanChatWizard` — Aurora-powered plan negotiation
- Domain assessment launching via strategy modal

**Data sources:** `life_plans`, `life_plan_milestones`, `action_items`, `tactical_schedules`, `mini_milestones`

**Key files:**
- `src/pages/PlayHub.tsx`
- `src/components/plan/PlayLayoutWrapper.tsx`
- `src/components/plan/PlanChatWizard.tsx`
- `src/components/plan/PlanNegotiateModal.tsx`

---

### Tab 3: AURORA (injected between tabs, `/aurora`)

| Field | Value |
|-------|-------|
| Label | Aurora |
| Icon | Custom `AuroraOrbIcon` |
| Purpose | AI coaching chat + journaling |

**MVP Behaviors:**
- Multi-tab interface: Chat, Dreams, Reflection, Gratitude
- `AuroraChatBubbles` — full conversation with streaming
- `StandaloneMorphOrb` above chat messages
- Domain assessment chat (DomainAssessChat) for pillar scanning
- Voice mode (full-screen bidirectional voice via ElevenLabs STT/TTS)
- Voice recording + transcription
- Image attachment
- Message count gating for free users (5/day)
- Journal entries persisted to `journal_entries` table

**Data sources:** `conversations`, `aurora_messages`, `daily_message_counts`, `journal_entries`

**Key files:**
- `src/pages/AuroraPage.tsx`
- `src/components/aurora/AuroraChatBubbles.tsx`
- `src/components/aurora/AuroraVoiceMode.tsx`
- `src/components/aurora/JournalTab.tsx`

---

### Tab 4: FEED (`/community`)

| Field | Value |
|-------|-------|
| Label | Feed / פיד |
| Icon | `Users` |
| Purpose | Social feed, stories, events, and member interaction |

**MVP Behaviors:**
- Social feed with posts, likes, and comments
- Instagram-style Stories tied to pillars and subtopics
- Events with RSVP
- Member profiles and leaderboard
- Category and pillar filtering

---

### Tab 5: STUDY (`/learn`)

| Field | Value |
|-------|-------|
| Label | Study / למידה |
| Icon | `GraduationCap` |
| Purpose | Courses and educational content |

---

## Section 2: Global UI Elements

### Header (ProtectedAppShell)
- `AppNameDropdown` — HUD with personalized orb (80px), user name, archetype, XP progress bar, level badge (amber/gold FM theme)
- Aurora search icon (on `/aurora` route)
- Notification bell

### Bottom Tab Bar
- 5-item layout: FM | Aurora | Play (center) | Study | Feed
- Play tab: oversized filled icon, no label
- Color-coded highlights: Cyan for Play, Violet for Aurora
- Aurora injected as special button between FM and Play

### Floating Chat Input
- `GlobalChatInput` — transparent background, fixed bottom, doesn't obscure messages
- Available on all pages except `/aurora` (where it's integrated inline)
- Voice recording, image attach, voice mode trigger

---

## Section 3: Aurora Capabilities

### Chat Features
- Streaming AI responses via `aurora-chat` edge function
- Context-aware (identity, life direction, assessments, behavioral patterns, energy patterns)
- Pillar-specific conversations
- Proactive messages and nudges
- Command bus for in-chat actions (navigate, create tasks, etc.)
- Memory graph for long-term context retention

### Voice Mode
- Full-screen overlay with animated orb
- States: idle → listening → processing → speaking → listening (auto-loop)
- ElevenLabs STT (transcribe) + TTS (speak)
- Works in both main chat and domain assessments

### Journal System (on `/aurora`)
- **Chat**: AI conversation with Aurora
- **Dreams**: Dream journaling with interpretation
- **Reflection**: Daily reflection prompts
- **Gratitude**: Gratitude practice entries
- Tabs are sticky with blurred backdrop

---

## Section 4: Gating Rules

### Source of Truth

| Item | Value |
|------|-------|
| Hook | `useSubscriptionGate` |
| File | `src/hooks/useSubscriptionGate.ts` |
| Table | `user_subscriptions` (status IN `active`, `trialing`) |
| Pro Product ID | `prod_TzbSX1sFG1woDZ` |

### Free Tier

| Feature | Limit |
|---------|-------|
| Aurora messages | 5/day (tracked in `daily_message_counts`) |
| Habits | max 3 |
| Proactive nudges | LOCKED |
| Play hub | FULL ACCESS |
| FM | FULL ACCESS |
| Community | FULL ACCESS |
| Study | FULL ACCESS |

### Pro Tier
Everything unlimited.

### Stripe Flow
1. `create-checkout-session` → Stripe Checkout (with `client_reference_id = user.id`)
2. `stripe-webhook` → upserts `user_subscriptions` + updates `profiles.subscription_tier`
3. `check-subscription` → reads from DB (no Stripe API call)
4. `customer-portal` → opens Stripe billing portal

---

## Section 5: Strategy Routes (Pillar Assessments)

All under `/strategy/*` within ProtectedAppShell:

| Domain | Routes |
|--------|--------|
| Presence | `/strategy/presence`, `/strategy/presence/scan`, `/strategy/presence/assess`, etc. |
| Power | `/strategy/power`, `/strategy/power/assess`, etc. |
| Vitality | `/strategy/vitality`, `/strategy/vitality/assess`, etc. |
| Focus | `/strategy/focus`, `/strategy/focus/assess`, etc. |
| Combat | `/strategy/combat`, `/strategy/combat/assess`, etc. |
| Expansion | `/strategy/expansion`, `/strategy/expansion/assess`, etc. |
| Consciousness | `/strategy/consciousness`, `/strategy/consciousness/assess`, etc. |
| Arena domains | `/strategy/wealth/*`, `/strategy/influence/*`, `/strategy/relationships/*`, `/strategy/business/*`, `/strategy/projects/*`, `/strategy/play/*` |

---

## Section 6: Other Protected Routes

| Route | Purpose |
|-------|---------|
| `/coaches` | Coach marketplace (find/become) |
| `/admin-hub` | Admin panel (role-gated) |
| `/business` | Business journey & dashboard |
| `/freelancer` | Freelancer tools |
| `/creator` | Creator tools |
| `/therapist` | Therapist tools |
| `/work` | Work hub |
| `/profile` | User profile page |
| `/quests/:pillar` | Quest runner |

---

## Section 7: Legacy Redirects

All legacy routes redirect to `/play`:
- `/plan`, `/now`, `/today`, `/dashboard`, `/me`, `/tactics`, `/arena`
- `/projects`, `/life`, `/life/*`
- `/consciousness`, `/health/*`, `/relationships/*`, `/finances/*`, `/learning/*`, `/purpose/*`, `/hobbies/*`
- `/personal-hypnosis/*` → `/play`

Other redirects:
- `/messages/ai` → `/aurora`
- `/combat-community` → `/community`
- `/admin`, `/admin/*`, `/panel/*` → `/admin-hub`
- `/coach`, `/coach/*`, `/practitioners`, `/marketplace` → `/coaches`

---

## Section 8: Deleted Pages (Cleanup 2026-03-10)

| Page | Reason |
|------|--------|
| `FormView` | No longer used, route redirects to `/` |
| `PersonalHypnosisLanding` | Legacy product page, redirects to `/` |
| `PersonalHypnosisSuccess` | Legacy, redirects to `/play` |
| `PersonalHypnosisPending` | Legacy, redirects to `/play` |
| `ConsciousnessLeapLanding` | Legacy product page, redirects to `/` |
| `ConsciousnessLeapApply` | Legacy product page, redirects to `/` |
| `DynamicLandingPage` | Unused dynamic landing system |
