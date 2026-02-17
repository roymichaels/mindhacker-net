

# Phase 0 + Phase 1: PRODUCT_SPEC.md and Tab Mapping

## Deliverable

Create a single `PRODUCT_SPEC.md` file at the project root that serves as the frozen source of truth. This prevents "assistant drift" by codifying exactly what each tab does, what Aurora can do, and what gating rules apply.

No UI or code changes -- this is a documentation-only step.

---

## PRODUCT_SPEC.md Contents

### Section 1: The 4 Tabs

```text
Tab 1: TODAY (/today)
  Label: Today / היום
  Icon: LayoutDashboard
  Purpose: "What matters in the next 3 hours"
  MVP Behaviors:
    - DashboardBannerSlider (auto-sliding in-game banners)
    - NextActionBanner (priority-based single action: Launchpad > Nudges > Overdue > Habits > Hypnosis > Milestone > Chat)
    - TodaysHabitsCard (daily habit checklist with completion toggles)
    - ChecklistsCard (task items from 90-day plan milestones)
    - HypnosisModal (triggered from banner, gated by launchpad completion)
  Data sources: action_items, aurora_proactive_queue, user_notifications, xp_events, profiles
  Existing files:
    - src/pages/TodayTab.tsx
    - src/components/dashboard/v2/NextActionBanner.tsx
    - src/components/dashboard/v2/TodaysHabitsCard.tsx
    - src/components/dashboard/unified/ChecklistsCard.tsx
    - src/components/dashboard/DashboardBannerSlider.tsx

Tab 2: PLAN (/plan)
  Label: Plan / תוכנית
  Icon: Target
  Purpose: "Your 90-day transformation roadmap"
  MVP Behaviors:
    - PlanProgressHero (overall plan % and current week)
    - GoalsCard (milestones grouped by month 1/2/3)
    - PlanProgressCard (week-by-week progress)
    - LifeAnalysisChart (8-pillar radar/pie)
    - Pro-gated: free users see ProGateOverlay
  Data sources: life_plans, life_plan_milestones, action_items, aurora_life_model
  Existing files:
    - src/pages/PlanTab.tsx
    - src/components/dashboard/v2/PlanProgressHero.tsx
    - src/components/dashboard/v2/GoalsCard.tsx
    - src/components/dashboard/v2/PlanProgressCard.tsx
    - src/components/dashboard/v2/LifeAnalysisChart.tsx

Tab 3: COACH (/aurora)
  Label: Aurora / אורורה
  Icon: Sparkles
  Purpose: "Your AI coaching conversation"
  MVP Behaviors:
    - Full-screen AuroraChatArea (message history + streaming responses)
    - Launchpad flow (if not complete, show LaunchpadIntro then LaunchpadFlow)
    - AuroraChatInput with voice recording, image attach
    - AuroraActionsProvider for in-chat action buttons
    - Message count gating for free users (5/day)
  Data sources: aurora_conversations, aurora_messages, daily_message_counts
  Existing files:
    - src/pages/Aurora.tsx
    - src/components/aurora/AuroraLayout.tsx
    - src/components/aurora/AuroraChatArea.tsx
    - src/components/aurora/AuroraChatInput.tsx

Tab 4: ME (/me)
  Label: Me / אני
  Icon: User
  Purpose: "Your identity, stats, and settings"
  MVP Behaviors:
    - StatsGrid (Level, Streak, Weekly XP, Tokens)
    - Profile button -> ProfileDrawer (identity card, orb, achievements)
    - Settings button -> SettingsModal (profile, aurora prefs, appearance, account)
  Data sources: profiles, xp_events, user_subscriptions
  Existing files:
    - src/pages/MeTab.tsx
    - src/components/dashboard/v2/StatsGrid.tsx
    - src/components/dashboard/ProfileDrawer.tsx
    - src/components/settings/SettingsModal.tsx
```

### Section 2: Aurora Dock Capabilities

```text
AURORA DOCK (GlobalChatInput -- floats above tabs 1, 2, 4; hidden on tab 3)

Current capabilities (TODAY):
  - Text message send to Aurora AI
  - Voice recording + transcription (Whisper)
  - Image attach (UI ready, backend TODO)
  - Subscription gate: 5 msgs/day free, unlimited Pro
  - Messages remaining counter (free users)
  - UpgradePromptModal on limit hit
  - AuroraChatBubbles: shows last 2-3 responses inline above input

Current capabilities (NEXT -- not yet built):
  - Deep-link actions from Aurora responses (navigate to specific tabs/modals)
  - One-tap habit creation from chat
  - One-tap task completion from chat
  - Image analysis (backend support)
  - Proactive push-to-chat (nudge appears as chat bubble)

Existing files:
  - src/components/dashboard/GlobalChatInput.tsx
  - src/components/aurora/AuroraChatBubbles.tsx
  - src/components/aurora/VoiceRecordingButton.tsx
```

### Section 3: Gating Rules

```text
GATING ARCHITECTURE

Source of truth: useSubscriptionGate hook
  File: src/hooks/useSubscriptionGate.ts
  Reads: user_subscriptions table (status IN active/trialing)
  Product ID for Pro: prod_TzbSX1sFG1woDZ

FREE TIER:
  - Aurora messages: 5/day (tracked in daily_message_counts, incremented via RPC)
  - Habits: max 3
  - Plan tab: LOCKED (ProGateOverlay)
  - Hypnosis: LOCKED (ProGateOverlay)
  - Proactive nudges: LOCKED
  - Today tab: FULL ACCESS
  - Me tab: FULL ACCESS
  - Coach tab: ACCESS with message limit

PRO TIER:
  - Everything unlimited

UI COMPONENTS:
  - ProGateOverlay (src/components/subscription/ProGateOverlay.tsx)
    Full-page lock state with upgrade CTA. Used in PlanTab, LifePlan, HypnosisModal.
  - UpgradePromptModal (src/components/subscription/UpgradePromptModal.tsx)
    Dialog triggered by useSubscriptionGate.showUpgradePrompt(). Used in GlobalChatInput, AuroraChatInput.

ENFORCEMENT STATUS:
  - GlobalChatInput: ENFORCED (canSendMessage check + daily count increment)
  - AuroraChatInput: ENFORCED (same pattern)
  - PlanTab: ENFORCED (ProGateOverlay)
  - LifePlan page: ENFORCED (ProGateOverlay)
  - HypnosisModal: ENFORCED (canAccessHypnosis check)
  - Habit creation: NOT YET ENFORCED (maxHabits check exists in hook but not wired in createDailyHabit)
  - Proactive nudge click-through: NOT YET ENFORCED

STRIPE FLOW:
  - create-checkout-session -> Stripe Checkout (with client_reference_id = user.id)
  - stripe-webhook -> upserts user_subscriptions + updates profiles.subscription_tier
  - check-subscription -> reads from DB (no longer calls Stripe API)
  - customer-portal -> opens Stripe billing portal
```

### Section 4: Tab-to-Component Mapping (Phase 1)

```text
EXISTING BUILDING BLOCKS -> TAB ASSIGNMENT

TODAY tab composes:
  [ACTIVE] DashboardBannerSlider
  [ACTIVE] NextActionBanner (v2)
  [ACTIVE] TodaysHabitsCard (v2)
  [ACTIVE] ChecklistsCard (unified)
  [ACTIVE] HypnosisModal
  [SHADOW - NOT USED IN TODAY] StatsGrid (lives in MeTab instead)
  [SHADOW - NOT USED IN TODAY] PlanProgressHero (lives in PlanTab)

PLAN tab composes:
  [ACTIVE] PlanProgressHero (v2)
  [ACTIVE] GoalsCard (v2)
  [ACTIVE] PlanProgressCard (v2)
  [ACTIVE] LifeAnalysisChart (v2)
  [SHADOW - AVAILABLE] Life Plan expanded view (/life-plan page)
  [SHADOW - AVAILABLE] Pillar hub pages (8x hubs at /health, /business, etc.)
  [SHADOW - AVAILABLE] Journey flows (8x at /health/journey, /business/journey, etc.)

COACH tab composes:
  [ACTIVE] AuroraLayout (handles launchpad gating)
  [ACTIVE] AuroraChatArea
  [ACTIVE] AuroraChatInput
  [ACTIVE] AuroraActionsProvider

ME tab composes:
  [ACTIVE] StatsGrid (v2)
  [ACTIVE] ProfileDrawer
  [ACTIVE] SettingsModal
  [SHADOW - AVAILABLE] Purchases / subscription management
  [SHADOW - AVAILABLE] PDF report exports
  [SHADOW - AVAILABLE] Achievement badges

FLOATING (all tabs):
  [ACTIVE] GlobalChatInput (hidden on /aurora)
  [ACTIVE] AuroraChatBubbles (hidden on /aurora)
  [ACTIVE] BottomTabBar (mobile)
  [ACTIVE] TopNavBar (desktop)

ROUTES NOT IN ANY TAB (SHADOW):
  /dashboard -> redirects to /today (legacy)
  /life-plan -> standalone plan view (could be linked from Plan tab)
  /projects -> premium projects hub
  /launchpad -> standalone launchpad (also embedded in Aurora)
  /health, /business, /consciousness, etc. -> pillar hubs
  /*/journey -> pillar journey flows
  /hypnosis -> standalone hypnosis library
  /community/* -> community system (DEAD)
  /messages/* -> messaging system (DEAD)
```

---

## Implementation

Single file creation: `PRODUCT_SPEC.md` at project root containing all 4 sections above, formatted as clean markdown. No code changes, no migrations, no component modifications.

This document becomes the contract that all future prompts reference before making changes.
