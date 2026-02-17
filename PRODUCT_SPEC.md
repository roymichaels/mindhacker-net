# PRODUCT_SPEC.md — Frozen Source of Truth

> **Purpose**: This document is the contract that all future prompts reference before making changes.  
> **Last updated**: 2026-02-17  
> **Rule**: No UI or architecture change may contradict this spec without updating it first.

---

## Section 1: The 4 Tabs

### Tab 1: TODAY (`/today`)

| Field | Value |
|-------|-------|
| Label | Today / היום |
| Icon | `LayoutDashboard` |
| Purpose | "What matters in the next 3 hours" |

**MVP Behaviors:**
- `DashboardBannerSlider` — auto-sliding in-game banners
- `NextActionBanner` — priority-based single action: Launchpad > Nudges > Overdue > Habits > Hypnosis > Milestone > Chat
- `TodaysHabitsCard` — daily habit checklist with completion toggles
- `ChecklistsCard` — task items from 90-day plan milestones
- `HypnosisModal` — triggered from banner, gated by launchpad completion

**Data sources:** `action_items`, `aurora_proactive_queue`, `user_notifications`, `xp_events`, `profiles`

**Existing files:**
- `src/pages/TodayTab.tsx`
- `src/components/dashboard/v2/NextActionBanner.tsx`
- `src/components/dashboard/v2/TodaysHabitsCard.tsx`
- `src/components/dashboard/unified/ChecklistsCard.tsx`
- `src/components/dashboard/DashboardBannerSlider.tsx`

---

### Tab 2: PLAN (`/plan`)

| Field | Value |
|-------|-------|
| Label | Plan / תוכנית |
| Icon | `Target` |
| Purpose | "Your 90-day transformation roadmap" |

**MVP Behaviors:**
- `PlanProgressHero` — overall plan % and current week
- `GoalsCard` — milestones grouped by month 1/2/3
- `PlanProgressCard` — week-by-week progress
- `LifeAnalysisChart` — 8-pillar radar/pie
- Pro-gated: free users see `ProGateOverlay`

**Data sources:** `life_plans`, `life_plan_milestones`, `action_items`, `aurora_life_model`

**Existing files:**
- `src/pages/PlanTab.tsx`
- `src/components/dashboard/v2/PlanProgressHero.tsx`
- `src/components/dashboard/v2/GoalsCard.tsx`
- `src/components/dashboard/v2/PlanProgressCard.tsx`
- `src/components/dashboard/v2/LifeAnalysisChart.tsx`

---

### Tab 3: COACH (`/aurora`)

| Field | Value |
|-------|-------|
| Label | Aurora / אורורה |
| Icon | `Sparkles` |
| Purpose | "Your AI coaching conversation" |

**MVP Behaviors:**
- Full-screen `AuroraChatArea` (message history + streaming responses)
- Launchpad flow (if not complete, show `LaunchpadIntro` then `LaunchpadFlow`)
- `AuroraChatInput` with voice recording, image attach
- `AuroraActionsProvider` for in-chat action buttons
- Message count gating for free users (5/day)

**Data sources:** `aurora_conversations`, `aurora_messages`, `daily_message_counts`

**Existing files:**
- `src/pages/Aurora.tsx`
- `src/components/aurora/AuroraLayout.tsx`
- `src/components/aurora/AuroraChatArea.tsx`
- `src/components/aurora/AuroraChatInput.tsx`

---

### Tab 4: ME (`/me`)

| Field | Value |
|-------|-------|
| Label | Me / אני |
| Icon | `User` |
| Purpose | "Your identity, stats, and settings" |

**MVP Behaviors:**
- `StatsGrid` (Level, Streak, Weekly XP, Tokens)
- Profile button → `ProfileDrawer` (identity card, orb, achievements)
- Settings button → `SettingsModal` (profile, aurora prefs, appearance, account)

**Data sources:** `profiles`, `xp_events`, `user_subscriptions`

**Existing files:**
- `src/pages/MeTab.tsx`
- `src/components/dashboard/v2/StatsGrid.tsx`
- `src/components/dashboard/ProfileDrawer.tsx`
- `src/components/settings/SettingsModal.tsx`

---

## Section 2: Aurora Dock Capabilities

**Component:** `GlobalChatInput` — floats above tabs 1, 2, 4; hidden on tab 3 (`/aurora`)

### Current Capabilities (TODAY)
- Text message send to Aurora AI
- Voice recording + transcription (Whisper)
- Image attach (UI ready, backend TODO)
- Subscription gate: 5 msgs/day free, unlimited Pro
- Messages remaining counter (free users)
- `UpgradePromptModal` on limit hit
- `AuroraChatBubbles`: shows last 2–3 responses inline above input

### Planned Capabilities (NEXT — not yet built)
- Deep-link actions from Aurora responses (navigate to specific tabs/modals)
- One-tap habit creation from chat
- One-tap task completion from chat
- Image analysis (backend support)
- Proactive push-to-chat (nudge appears as chat bubble)

**Existing files:**
- `src/components/dashboard/GlobalChatInput.tsx`
- `src/components/aurora/AuroraChatBubbles.tsx`
- `src/components/aurora/VoiceRecordingButton.tsx`

---

## Section 3: Gating Rules

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
| Plan tab | LOCKED (`ProGateOverlay`) |
| Hypnosis | LOCKED (`ProGateOverlay`) |
| Proactive nudges | LOCKED |
| Today tab | FULL ACCESS |
| Me tab | FULL ACCESS |
| Coach tab | ACCESS with message limit |

### Pro Tier

Everything unlimited.

### UI Components

| Component | Purpose | Used in |
|-----------|---------|---------|
| `ProGateOverlay` | Full-page lock with upgrade CTA | PlanTab, LifePlan, HypnosisModal |
| `UpgradePromptModal` | Dialog on limit hit | GlobalChatInput, AuroraChatInput |

### Enforcement Status

| Surface | Status |
|---------|--------|
| `GlobalChatInput` | ✅ ENFORCED |
| `AuroraChatInput` | ✅ ENFORCED |
| `PlanTab` | ✅ ENFORCED |
| `LifePlan` page | ✅ ENFORCED |
| `HypnosisModal` | ✅ ENFORCED |
| Habit creation | ⚠️ NOT YET ENFORCED |
| Proactive nudge click-through | ⚠️ NOT YET ENFORCED |

### Stripe Flow

1. `create-checkout-session` → Stripe Checkout (with `client_reference_id = user.id`)
2. `stripe-webhook` → upserts `user_subscriptions` + updates `profiles.subscription_tier`
3. `check-subscription` → reads from DB (no Stripe API call)
4. `customer-portal` → opens Stripe billing portal

---

## Section 4: Tab-to-Component Mapping

### TODAY tab composes
- ✅ `DashboardBannerSlider`
- ✅ `NextActionBanner` (v2)
- ✅ `TodaysHabitsCard` (v2)
- ✅ `ChecklistsCard` (unified)
- ✅ `HypnosisModal`
- 🔇 `StatsGrid` — lives in MeTab instead
- 🔇 `PlanProgressHero` — lives in PlanTab

### PLAN tab composes
- ✅ `PlanProgressHero` (v2)
- ✅ `GoalsCard` (v2)
- ✅ `PlanProgressCard` (v2)
- ✅ `LifeAnalysisChart` (v2)
- 🔇 Life Plan expanded view (`/life-plan`)
- 🔇 Pillar hub pages (8× at `/health`, `/business`, etc.)
- 🔇 Journey flows (8× at `/health/journey`, etc.)

### COACH tab composes
- ✅ `AuroraLayout` (handles launchpad gating)
- ✅ `AuroraChatArea`
- ✅ `AuroraChatInput`
- ✅ `AuroraActionsProvider`

### ME tab composes
- ✅ `StatsGrid` (v2)
- ✅ `ProfileDrawer`
- ✅ `SettingsModal`
- 🔇 Purchases / subscription management
- 🔇 PDF report exports
- 🔇 Achievement badges

### Floating (all tabs)
- ✅ `GlobalChatInput` (hidden on `/aurora`)
- ✅ `AuroraChatBubbles` (hidden on `/aurora`)
- ✅ `BottomTabBar` (mobile)
- ✅ `TopNavBar` (desktop)

### Shadow Routes (not in any tab)

| Route | Status |
|-------|--------|
| `/dashboard` | Redirects to `/today` (legacy) |
| `/life-plan` | Standalone plan view |
| `/projects` | Premium projects hub |
| `/launchpad` | Standalone launchpad (also embedded in Aurora) |
| `/health`, `/business`, etc. | Pillar hubs |
| `/*/journey` | Pillar journey flows |
| `/hypnosis` | Standalone hypnosis library |
| `/community/*` | DEAD |
| `/messages/*` | DEAD |
