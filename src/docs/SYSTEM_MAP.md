# MindOS — Complete System Map

> Generated: 2026-02-27 | Source: Codebase + DB schema inventory

---

## 1) System Modules (Inventory)

### 1.1 Onboarding + Launchpad (Neural Intake)
- **Purpose:** 8-step guided intake capturing identity, lifestyle, traits, first chat, introspection, life plan, focus areas, first week actions, then dashboard activation.
- **Users:** End-user
- **Entry points:** `/onboarding`, `OnboardingFlow` component
- **Core entities:** `launchpad_progress`, `launchpad_summaries`, `custom_forms`, `form_submissions`
- **Core functions:** `complete_launchpad_step` (RPC), `initialize_launchpad` (trigger on profiles insert), `generate-launchpad-summary` (edge fn), `analyze-introspection-form`, `analyze-life-plan`, `generate-first-week-actions`
- **Status:** ✅ Active

### 1.2 Domain Assessments (14 Pillars)
- **Purpose:** Conversational AI-driven diagnostic per pillar. Stores structured metrics in `life_domains.domain_config.latest_assessment`. Enforced by `DOMAIN_REQUIRED_METRICS` quality gate.
- **Users:** End-user
- **Entry points:** Aurora Dock (`DomainAssessChat` with `asDock=true`), legacy routes `/life/*/assess`, `/arena/*/assess`
- **Core entities:** `life_domains` (user_id + domain_id, JSONB domain_config)
- **Core functions:** `domain-assess` (edge fn), `consciousness-assess`, `aurora-recalibrate`, `isAssessmentReady()` utility
- **Status:** ✅ Active — legacy standalone routes redirect to dock

### 1.3 Orb / Avatar System
- **Purpose:** Deterministic 3D WebGL avatar driven by ~70 behavioral variables from onboarding, archetypes, hobbies, traits, XP, and streak.
- **Users:** End-user (displayed everywhere), community (identity)
- **Entry points:** `PersonalizedOrb` / `WebGLOrb.tsx` component, rendered in dashboard, community, profile
- **Core entities:** `orb_profiles` (user_id unique, colors, morph params, `computed_from` JSONB with visualDNA bucket)
- **Core functions:** `useOrbProfile` hook, `generateOrbProfile()`, `computeAvatarDNA()`, `hashUserId()` (deterministic seed)
- **Status:** ✅ Active

### 1.4 "Job" / Archetype System
- **Purpose:** RPG-style archetype blend (Warrior, Mystic, Creator, Sage, Healer, Explorer) computed from hobbies/traits/priorities. Comment in `avatarDNA.ts` mentions "Job system for RPG-style progression" but NO dedicated `job` table exists.
- **Users:** End-user (implicit via orb)
- **Entry points:** Computed inside `useOrbProfile`, displayed in orb summary
- **Core entities:** No dedicated table. Archetype data lives in `orb_profiles.computed_from.dominantArchetype/secondaryArchetype/archetypeWeights`
- **Core functions:** `computeAvatarDNA()`, `blendArchetypes()`, `getAvatarDNASummary()`
- **Status:** ⚠️ Partially implemented — archetype computed & displayed, but NOT stored as a first-class "Job" entity. No skills, no job progression, no job-specific quests.

### 1.5 100-Day Transformation OS (Plan Engine)
- **Purpose:** Hierarchical strategy engine: 14 Pillars → 3 Missions → 5 Milestones → 5 Mini-milestones (daily actions). 10 phases (A-J) of 10 days each.
- **Users:** End-user
- **Entry points:** `/dashboard` (Today tab), Life Hub, Arena Hub, Plan tab
- **Core entities:** `life_plans` (plan_data JSONB with hub/strategy), `plan_missions`, `life_plan_milestones`, `mini_milestones`, `action_items`
- **Core functions:** `generate-90day-strategy` (edge fn), `generate-phase-actions` (edge fn), `useStrategyPlans` hook (self-healing), `update_life_plan_progress` (trigger), `calculate_milestone_dates` (trigger), `check_mission_completion` (trigger), `check_milestone_from_minis` (trigger)
- **Status:** ✅ Active

### 1.6 Unified `action_items` Engine
- **Purpose:** Single source of truth for tasks, habits, sessions, milestones, reflections, and schedule blocks. Categorized by `type` and `source`.
- **Users:** End-user, coach (via plan injection)
- **Entry points:** Dashboard Today tab, checklists, habits panel, schedule view
- **Core entities:** `action_items` (unified table with type/source/status/pillar/scheduled_date/start_time/end_time/metadata)
- **Core functions:** `handle_action_item_completion` (trigger → awards XP + energy), `src/services/actionItems.ts` (CRUD), `src/services/scheduleBlocks.ts` (schedule blocks subset)
- **Status:** ✅ Active — coexists with legacy `aurora_checklists` / `aurora_checklist_items` / `aurora_daily_minimums` which are still queried by `useMissionsRoadmap`

### 1.7 XP / Leveling Engine
- **Purpose:** Experience-based progression. `Level = floor(experience / 100) + 1`. All XP flows through `award_unified_xp` RPC → `xp_events` audit trail → `profiles.experience`.
- **Users:** End-user
- **Entry points:** Dashboard header, profile card, orb complexity
- **Core entities:** `xp_events` (user_id, amount, source, reason), `profiles.experience`, `profiles.level`
- **Core functions:** `award_unified_xp` (RPC), `aurora_award_xp` (wrapper RPC), `reconcile_user_xp` (integrity check RPC), `check_xp_integrity` (audit query)
- **Status:** ✅ Active

### 1.8 Energy Currency Engine
- **Purpose:** Ledger-based virtual currency (formerly "tokens"). Stored in `profiles.tokens`, audit trail in `energy_events`.
- **Users:** End-user
- **Entry points:** Energy balance in header, spend on Aurora messages (2), hypnosis (5-10), presence scan (10), etc.
- **Core entities:** `energy_events` (user_id, change, balance_after, source, reason, idempotency_key)
- **Core functions:** `award_energy` (RPC), `spend_energy` (RPC), `ENERGY_COSTS` config in `src/lib/energyCosts.ts`
- **Status:** ✅ Active

### 1.9 Tier Progression Gates
- **Purpose:** 4-tier feature gating: Clarity (L1-3), Structure (L4-6, needs Launchpad), Consistency (L7-9, needs 7+ streak), Mastery (L10+).
- **Users:** End-user
- **Entry points:** `useSubscriptionGate` hook gates UI features, `get_user_tier` RPC for backend
- **Core entities:** `user_subscriptions`, `subscription_tiers`, `profiles.level`, `profiles.session_streak`, `launchpad_progress.launchpad_complete`
- **Core functions:** `get_user_tier` (RPC), `useSubscriptionGate` hook, `TIER_CONFIGS` / `TIER_PILLAR_LIMITS` in `src/lib/subscriptionTiers.ts`
- **Status:** ✅ Active — dual system: progression tiers (clarity/structure/consistency/mastery) + subscription tiers (free/plus/apex)

### 1.10 Subscription System (Free / Plus / Apex)
- **Purpose:** Commercial gating. Free=$0 (1+1 pillars, 5 msgs/day), Plus=$69/mo (3+3 pillars, unlimited Aurora, hypnosis), Apex=$199/mo (all 14 pillars, proactive engine, projects).
- **Users:** End-user
- **Entry points:** `/subscriptions`, upgrade prompts
- **Core entities:** `user_subscriptions`, `subscription_tiers`
- **Core functions:** `create-checkout-session` (edge fn), `stripe-webhook` (edge fn), `check-subscription` (edge fn), `customer-portal` (edge fn)
- **Status:** ✅ Active

### 1.11 Streaks / Movement Score
- **Purpose:** Session streak tracked in `profiles.session_streak` / `profiles.last_session_date`. Movement Score (0-100) computed client-side from daily action completion + body/mind/arena coverage.
- **Users:** End-user
- **Entry points:** Dashboard header, `useTodayExecution` hook
- **Core entities:** `profiles.session_streak`, `profiles.last_session_date`, `daily_pulse_logs`
- **Core functions:** `check_streak_bonus` (trigger on hypnosis_sessions), `handle_hypnosis_session_complete` (trigger), `computeMovementScore()` in `useTodayExecution`
- **Status:** ✅ Active

### 1.12 Aurora AI Assistant
- **Purpose:** Core AI companion. Contextual chat with user's full "Brain" (life model, plans, habits, energy patterns, identity). Supports streaming, voice, proactive nudges, and command emission.
- **Users:** End-user, widget (guest)
- **Entry points:** Aurora Dock (global bottom dock), `/aurora` route, widget mode
- **Core entities:** `conversations`, `messages`, `ai_response_logs`, `aurora_conversation_memory`, `aurora_onboarding_progress`, `aurora_proactive_queue`
- **Core functions:** `aurora-chat` (edge fn, 3-layer: contextBuilder → orchestrator → LLM), `aurora-proactive` (edge fn), `aurora-analyze` (edge fn), `aurora-generate-title`, `aurora-summarize-conversation`
- **Status:** ✅ Active

### 1.13 Aurora Command Bus
- **Purpose:** Parse AI-emitted tags into typed commands, classify risk (safe/moderate/destructive), and dispatch via `useCommandBus` hook.
- **Users:** End-user (transparent)
- **Entry points:** `src/lib/commandBus.ts` (parser), `src/hooks/aurora/useCommandBus.tsx` (dispatcher)
- **Core entities:** None (stateless parser)
- **Core functions:** `parseAllTags()`, `classifyRisk()`, `stripAllTags()`, `describeCommand()`
- **Supported tags:** `[task:*]`, `[habit:*]`, `[checklist:*]`, `[plan:update]`, `[plan:edit]`, `[plan:add_task]`, `[plan:remove_task]`, `[plan:replace_task]`, `[plan:add_milestone]`, `[plan:remove_milestone]`, `[plan:bulk_replace]`, `[milestone:complete]`, `[identity:*]`, `[reminder:set]`, `[focus:set]`, `[navigate:*]`, `[setting:*]`, `[action:analyze]`
- **Status:** ✅ Active

### 1.14 AI Hypnosis System
- **Purpose:** AI-generated hypnosis scripts per ego state. Includes TTS audio via ElevenLabs. Costs energy.
- **Users:** End-user (Plus+)
- **Entry points:** Hypnosis modal, `/hypnosis` routes
- **Core entities:** `hypnosis_sessions`, `custom_protocols`, `hypnosis_audio_cache`
- **Core functions:** `generate-hypnosis-script` (edge fn), `ai-hypnosis` (edge fn), `elevenlabs-tts` (edge fn), `cache-hypnosis-audio`, `text-to-speech`
- **Status:** ✅ Active

### 1.15 Coach Hub (Coach OS)
- **Purpose:** 3-column coach workspace: business nav, command center, client management. Coaches create plans that inject into client's `action_items`.
- **Users:** Coach (practitioner role)
- **Entry points:** `/coaches` tab in admin/coach view
- **Core entities:** `practitioners`, `practitioner_services`, `practitioner_clients`, `practitioner_availability`, `coach_client_plans`, `bookings`
- **Core functions:** `generate-coach-plan` (edge fn → injects milestones/tasks into client action_items), `useCoachClients`, `useCoachClientView`
- **Status:** ✅ Active

### 1.16 Scheduling Blocks (Command Schedule)
- **Purpose:** Time-blocked daily schedule stored as `action_items` with `metadata.schedule_block=true`. Plus/Apex feature.
- **Users:** End-user (Plus/Apex)
- **Entry points:** Schedule tab, `useCommandSchedule` hook
- **Core entities:** `action_items` (filtered by `metadata->schedule_block`), `life_plans.schedule_settings`
- **Core functions:** `src/services/scheduleBlocks.ts`, `useCommandSchedule` hook, `useTodayBlocks`, `useCommitSchedule`
- **Status:** ✅ Active

### 1.17 Self-Healing Plan Orchestration
- **Purpose:** Auto-detects legacy plans (missing `hub` field) or incomplete orchestrations (e.g., Core exists but Arena missing) and triggers background repair.
- **Users:** End-user (transparent)
- **Entry points:** `useStrategyPlans` hook (auto-runs on query)
- **Core entities:** `life_plans`
- **Core functions:** `heal()` function inside `useStrategyPlans`, archives legacy plans, triggers `generate-90day-strategy` for missing hubs
- **Status:** ✅ Active

### 1.18 Pillar Selection / Access Control
- **Purpose:** Tier-gated pillar selection. Free=1+1, Plus=3+3, Apex=all 14. Stored in `profiles.selected_pillars` JSONB.
- **Users:** End-user
- **Entry points:** `PillarSelectionModal`, hub sidebars
- **Core entities:** `profiles.selected_pillars`
- **Core functions:** `usePillarAccess` hook
- **Status:** ✅ Active

### 1.19 Bilingual / i18n (HE/EN)
- **Purpose:** Full bilingual support. Primary language is Hebrew (RTL), with English translations. User selects language, stored in context.
- **Users:** All
- **Entry points:** `LanguageContext`, `useTranslation` hook, `getTranslation()`
- **Core entities:** Many tables have `*_en` columns (e.g., `title_en`, `description_en`, `question_en`)
- **Core functions:** `useTranslation`, `useGenderedTranslation`, `src/i18n/` directory
- **Status:** ✅ Active

### 1.20 Community (Civilization Layer)
- **Purpose:** Social-competitive feed + forum across 14 pillars. Reputation system (Bronze→Apex), player cards, Aurora-gated thread approval.
- **Users:** End-user
- **Entry points:** `/community`
- **Core entities:** `community_posts`, `community_comments`, `community_likes`, `community_members`, `community_levels`, `community_categories`, `community_events`, `community_event_rsvps`, `community_point_logs`
- **Core functions:** `update_community_member_stats` (trigger), `update_community_member_level` (trigger), `handle_new_community_member` (trigger)
- **Status:** ✅ Active

### 1.21 Daily Pulse / Energy Tracking
- **Purpose:** Daily check-in capturing mood, energy, sleep compliance, task confidence, screen discipline.
- **Users:** End-user
- **Entry points:** Dashboard morning flow, `useDailyPulse` hook
- **Core entities:** `daily_pulse_logs`
- **Core functions:** `useDailyPulse` hook
- **Status:** ✅ Active

### 1.22 Now Engine (Today Queue)
- **Purpose:** Generates a prioritized daily action queue distributed across pillars, personalized to tier and energy level.
- **Users:** End-user
- **Entry points:** Dashboard Today tab, `useNowEngine` hook
- **Core entities:** `action_items` (reads), `life_plans` (reads)
- **Core functions:** `generate-today-queue` (edge fn), `useNowEngine` hook, `useTodayExecution` hook
- **Status:** ✅ Active

### 1.23 Proactive Engine (Aurora Nudges)
- **Purpose:** Scheduled proactive messages from Aurora (morning briefings, mid-day checks, streak nudges).
- **Users:** End-user (Plus/Apex)
- **Entry points:** Notification bell, Aurora dock
- **Core entities:** `aurora_proactive_queue`, `user_notifications`
- **Core functions:** `aurora-proactive` (edge fn), `bridge_proactive_to_notification` (trigger), `queue_proactive_message` (RPC), `get_pending_proactive_items` (RPC)
- **Status:** ✅ Active

### 1.24 Business Module
- **Purpose:** Business journey (10-step guided), business branding, business plans, business orb profiles.
- **Users:** End-user (Plus/Apex)
- **Entry points:** `/business-dashboard`, `/business-journey`
- **Core entities:** `business_journeys`, `business_branding`, `business_plans`, `business_plan_milestones`, `business_orb_profiles`
- **Core functions:** `generate-business-plan` (edge fn), `generate-branding-suggestions` (edge fn), `useBusinessJourneys`, `useBusinessBranding`
- **Status:** ✅ Active

### 1.25 Coaching Journey
- **Purpose:** 10-step journey for coaches to define their niche, methodology, services, marketing.
- **Users:** Coach
- **Entry points:** `/coaching-journey`
- **Core entities:** `coaching_journeys`
- **Core functions:** Journey step hooks
- **Status:** ✅ Active

### 1.26 Admin Hub
- **Purpose:** Full admin dashboard: user management, content, analytics, bug reports, notifications, leads, affiliates, theme, settings.
- **Users:** Admin
- **Entry points:** `/admin-hub` with sub-tabs
- **Core entities:** `admin_notifications`, `bug_reports`, `analytics_reports`, `user_roles`
- **Core functions:** `fanout_admin_notifications_to_users` (trigger), `notify_new_user` (trigger)
- **Status:** ✅ Active

### 1.27 Content / Courses Platform
- **Purpose:** Video courses, series, episodes with access control and enrollment tracking.
- **Users:** End-user, Admin
- **Entry points:** `/courses`, `/courses/:slug`
- **Core entities:** `content_products`, `content_series`, `content_episodes`, `content_purchases`, `course_enrollments`, `content_analytics`
- **Core functions:** `notify_users_new_content` (trigger), `notify_course_completion` (trigger), `notify_user_purchase` (trigger)
- **Status:** ✅ Active

### 1.28 Presence Scanner
- **Purpose:** AI analysis of user's digital/social presence.
- **Users:** End-user
- **Entry points:** `/presence` routes, `usePresenceScans` hook
- **Core entities:** `presence_scans` (assumed, check DB)
- **Core functions:** `analyze-presence` (edge fn)
- **Status:** ✅ Active

### 1.29 Push Notifications
- **Purpose:** Web push via service worker.
- **Users:** End-user
- **Entry points:** `NotificationPermissionPrompt`, PWA
- **Core entities:** `push_subscriptions`, `user_notifications`
- **Core functions:** `push-notifications` (edge fn), `send_push_notification_via_edge` (trigger on user_notifications insert)
- **Status:** ✅ Active

### 1.30 Affiliate System
- **Purpose:** Referral tracking with commission calculation.
- **Users:** Admin, Affiliates
- **Entry points:** `/affiliate-signup`, admin affiliates tab
- **Core entities:** `affiliates`, `affiliate_referrals`, `affiliate_payouts`
- **Core functions:** `create_affiliate_referral_on_payment` (trigger), `update_affiliate_earnings` (trigger)
- **Status:** ✅ Active

### 1.31 Consciousness Leap
- **Purpose:** Premium application-based program with lead capture → application → admin review flow.
- **Users:** End-user, Admin
- **Entry points:** `/consciousness-leap`, `/consciousness-leap/apply`
- **Core entities:** `consciousness_leap_leads`, `consciousness_leap_applications`
- **Core functions:** `submit-consciousness-leap-lead` (edge fn), `submit-consciousness-leap-application` (edge fn), `validate-consciousness-leap-token` (edge fn)
- **Status:** ✅ Active

### 1.32 Projects Module
- **Purpose:** Personal project tracking.
- **Users:** End-user (Apex)
- **Entry points:** `/projects`, `/projects-journey`
- **Core entities:** `user_projects`, `projects_journeys`
- **Core functions:** `useProjects` hook
- **Status:** ✅ Active

### 1.33 Landing Page Builder
- **Purpose:** Admin-managed dynamic landing pages with bilingual support.
- **Users:** Admin
- **Entry points:** `/admin-hub` → Landing Pages, `/go/:slug`
- **Core entities:** `landing_pages`, `homepage_sections`, `offers`
- **Core functions:** `DynamicLandingPage` component
- **Status:** ✅ Active

### 1.34 Legacy Tables (Deprecated / Dual-use)
- **Purpose:** Pre-unified tables still queried by some components.
- **Tables:** `aurora_checklists`, `aurora_checklist_items`, `aurora_daily_minimums`, `daily_habit_logs`
- **Status:** ⚠️ Legacy — `useMissionsRoadmap` still reads from `aurora_checklists` + `aurora_checklist_items`. Migration function `migrate_to_action_items` exists but dual reads persist.

---

## 2) Data Model Map

| Table | Purpose | Key Fields | Relationships | Module | Legacy? |
|-------|---------|------------|---------------|--------|---------|
| `profiles` | User profile + game state | id, full_name, experience, level, tokens, session_streak, last_session_date, selected_pillars, wake_time, sleep_time, ego_state_usage | FK to auth.users (implicit) | Core | No |
| `action_items` | Unified tasks/habits/sessions/milestones | id, user_id, type, source, status, title, pillar, due_at, scheduled_date, start_time, end_time, recurrence_rule, parent_id, plan_id, milestone_id, xp_reward, token_reward, metadata, tags | FK → life_plan_milestones, action_items (self), life_plans, user_projects | Unified Action | No |
| `life_plans` | 100-day strategy plans | id, user_id, plan_data (JSONB with hub/strategy), status, start_date, end_date, progress_percentage, schedule_settings | — | Plan Engine | No |
| `plan_missions` | Mission groups per pillar | id, plan_id, pillar, title, title_en, is_completed | FK → life_plans | Plan Engine | No |
| `life_plan_milestones` | Weekly milestones within missions | id, plan_id, mission_id, week_number, month_number, title, title_en, goal, tasks, is_completed | FK → life_plans, plan_missions | Plan Engine | No |
| `mini_milestones` | Daily actions within milestones | id, milestone_id, title, title_en, is_completed, xp_reward, phase, day_number | FK → life_plan_milestones | Plan Engine | No |
| `life_domains` | Per-user domain assessment data | id, user_id, domain_id, domain_config (JSONB), status | FK → profiles | Assessments | No |
| `xp_events` | XP audit trail | id, user_id, amount, source, reason | FK → profiles | XP Engine | No |
| `energy_events` | Energy (token) ledger | id, user_id, change, balance_after, source, reason, idempotency_key | FK → profiles | Energy Engine | No |
| `orb_profiles` | Personalized orb visual data | id, user_id (unique), primary_color, secondary_colors, morph_intensity, computed_from (JSONB with visualDNA) | — | Orb System | No |
| `conversations` | Chat threads | id, participant_1, type (ai/human), context | — | Aurora | No |
| `messages` | Chat messages | id, conversation_id, content, sender_type | FK → conversations | Aurora | No |
| `ai_response_logs` | AI call tracing | id, user_id, model, mode, prompt_version, context_hash | FK → profiles | Aurora | No |
| `aurora_proactive_queue` | Scheduled proactive nudges | id, user_id, trigger_type, scheduled_for, sent_at | — | Proactive | No |
| `launchpad_progress` | Onboarding step tracking | user_id (unique), current_step, step_1-7 data, launchpad_complete | FK → profiles | Onboarding | No |
| `launchpad_summaries` | AI-generated intake summary | user_id, summary_data, clarity_score, consciousness_score | — | Onboarding | No |
| `user_subscriptions` | Stripe subscription state | user_id, product_id, status, end_date | — | Subscription | No |
| `daily_message_counts` | Free tier message limiting | user_id, message_date, count | — | Subscription | No |
| `daily_pulse_logs` | Daily energy/mood check-in | user_id, log_date, energy_rating, mood_signal, sleep_compliance | — | Pulse | No |
| `hypnosis_sessions` | Completed hypnosis records | user_id, ego_state, duration_seconds, experience_gained | — | Hypnosis | No |
| `practitioners` | Coach profiles | id, user_id, slug, specialties | — | Coach Hub | No |
| `practitioner_clients` | Coach-client relationships | practitioner_id, client_user_id, status | FK → practitioners | Coach Hub | No |
| `coach_client_plans` | AI-generated coaching plans | coach_id, client_user_id, plan_data, methodology | FK → practitioners | Coach Hub | No |
| `community_posts` | Forum/feed threads | user_id, content, pillar, category_id, likes_count | FK → community_categories | Community | No |
| `community_members` | Community profiles + reputation | user_id (unique), total_points, current_level_id | FK → community_levels | Community | No |
| `aurora_checklists` | Legacy checklist containers | user_id, title, category, origin, milestone_id | FK → life_plan_milestones | ⚠️ Legacy | Yes |
| `aurora_checklist_items` | Legacy checklist items | checklist_id, content, is_completed | FK → aurora_checklists | ⚠️ Legacy | Yes |
| `aurora_daily_minimums` | Legacy daily habits | user_id, title, is_active | — | ⚠️ Legacy | Yes |
| `daily_habit_logs` | Legacy habit tracking | habit_item_id, user_id, track_date | FK → aurora_checklist_items | ⚠️ Legacy | Yes |
| `business_journeys` | Business intake journey | user_id, step_1-10, journey_complete | — | Business | No |
| `business_plans` | Generated business plans | business_id, user_id, plan_data, total_weeks | FK → business_journeys | Business | No |
| `landing_pages` | Dynamic landing pages | slug, template_type, hero fields, sections_config | — | Admin/Marketing | No |

---

## 3) Event & Trigger Map

| Trigger | Fires On | Writes/Updates | Calls | Side Effects |
|---------|----------|---------------|-------|-------------|
| `handle_action_item_completion` | `action_items` UPDATE (status→done) | Sets completed_at | `award_unified_xp`, `award_energy` | XP + Energy awards |
| `handle_hypnosis_session_complete` | `hypnosis_sessions` INSERT | Updates `profiles` (streak, ego_state_usage) | `award_unified_xp` | Streak calc, XP award |
| `check_streak_bonus` | `hypnosis_sessions` INSERT | Updates `profiles` (streak, tokens, experience) | — | Streak milestones (3/7/14/30/60/100 day bonuses) |
| `handle_mini_milestone_completion` | `mini_milestones` UPDATE (is_completed→true) | Sets completed_at | `award_unified_xp` | XP award via milestone→plan→user chain |
| `check_milestone_from_minis` | `mini_milestones` UPDATE | May complete parent `life_plan_milestones` | — | Auto-completes milestone when all minis done |
| `check_mission_completion` | `life_plan_milestones` UPDATE | May complete parent `plan_missions` | — | Auto-completes mission when all milestones done |
| `update_life_plan_progress` | `life_plan_milestones` UPDATE | Updates `life_plans.progress_percentage` | — | Plan progress tracking |
| `calculate_milestone_dates` | `life_plan_milestones` INSERT | Computes start_date/end_date from plan | — | Date assignment |
| `initialize_launchpad` | `profiles` INSERT | Creates `launchpad_progress` row | — | Auto-init onboarding |
| `auto_create_aurora_onboarding_progress` | `profiles` INSERT | Creates `aurora_onboarding_progress` row | — | Auto-init Aurora state |
| `handle_new_community_member` | `profiles` INSERT | Creates `community_members` row | — | Auto-join community |
| `update_community_member_stats` | `community_posts/comments/likes` INSERT/DELETE | Updates `community_members` counters | — | Points + stats |
| `update_community_member_level` | `community_members` UPDATE | Sets `current_level_id` based on points | — | Auto-level community |
| `bridge_proactive_to_notification` | `aurora_proactive_queue` INSERT (with title+body) | Creates `user_notifications` row | — | Notification bridge |
| `send_push_notification_via_edge` | `user_notifications` INSERT | — | `push-notifications` edge fn via HTTP | Web push delivery |
| `fanout_admin_notifications_to_users` | `admin_notifications` INSERT | Creates `user_notifications` for all admins | — | Admin broadcast |
| `notify_new_user` | `profiles` INSERT | Creates `admin_notifications` | — | Admin alert |
| `notify_onboarding_completed` | `launchpad_progress` UPDATE (complete→true) | Creates `admin_notifications` | — | Admin alert with diagnostic data |
| `update_conversation_last_message` | `messages` INSERT | Updates `conversations.last_message_at/preview` | — | Conversation metadata |
| `create_affiliate_referral_on_payment` | `orders` INSERT/UPDATE (payment→completed) | Creates `affiliate_referrals`, updates `affiliates.total_earnings` | — | Commission calculation |

---

## 4) API / Function Map

### Edge Functions

| Function | Inputs | Outputs | Called By | Notes |
|----------|--------|---------|-----------|-------|
| `aurora-chat` | messages[], mode, userId, language, pillar | SSE stream | Aurora Dock / Chat UI | 3-layer: contextBuilder → orchestrator → LLM. Fallback on timeout/5xx. |
| `aurora-proactive` | user_id | proactive items | Cron / manual trigger | Generates nudges based on user state |
| `aurora-analyze` | user_id | life model extraction | Command bus `[action:analyze]` | Extracts identity/behavioral patterns |
| `aurora-generate-title` | conversation_id | title string | After first messages | Thread naming |
| `aurora-summarize-conversation` | conversation_id | summary | Periodic | Memory management |
| `aurora-recalibrate` | user_id, domain_id | updated domain_config | Pillar recalibration flow | Re-assessment |
| `generate-90day-strategy` | user_id, hub (core/arena/both), selected_pillars | plan data | Strategy generation UI, self-healing | Writes to life_plans, plan_missions, life_plan_milestones |
| `generate-phase-actions` | user_id, plan_id, phase | action items | Lazy phase generation | Writes to mini_milestones and/or action_items |
| `generate-today-queue` | user_id, language | NowEngineData | `useNowEngine` hook | Computes daily action queue |
| `generate-coach-plan` | coach_id, client_user_id, params | plan data | Coach Hub | Injects into client's action_items |
| `domain-assess` | messages, domain_id, user_id | SSE stream | DomainAssessChat | Domain-specific diagnostic |
| `consciousness-assess` | messages, user_id | SSE stream | Consciousness pillar | Consciousness diagnostic |
| `onboarding-chat` | messages, user_id, step | SSE stream | Onboarding flow | Intake conversation |
| `generate-hypnosis-script` | user_id, ego_state, goal | script text | Hypnosis modal | AI script generation |
| `ai-hypnosis` | user_id, params | hypnosis data | Hypnosis flow | Session orchestration |
| `elevenlabs-tts` | text, voice | audio stream | Hypnosis, voice mode | Text-to-speech |
| `elevenlabs-transcribe` | audio | text | Voice input | Speech-to-text |
| `generate-launchpad-summary` | user_id | summary_data | After onboarding complete | Writes to launchpad_summaries |
| `analyze-introspection-form` | form_data | analysis | Onboarding step 6 | Introspection analysis |
| `analyze-life-plan` | form_data | analysis | Onboarding step 7 | Life plan analysis |
| `generate-first-week-actions` | user_id | actions | Onboarding step 7 | First week plan |
| `generate-business-plan` | business_id | plan | Business module | Business plan AI |
| `generate-branding-suggestions` | business_id | branding | Business module | Branding AI |
| `analyze-presence` | user_id | scan results | Presence scanner | Digital presence AI |
| `generate-pillar-synthesis` | user_id, pillar | synthesis | Post-assessment | Pillar insights |
| `generate-execution-steps` | action params | steps | Action detail view | Execution protocol |
| `generate-identity-archetype` | user_data | archetype | Onboarding/profile | Identity computation |
| `create-checkout-session` | user_id, price_id | session URL | Subscription flow | Stripe checkout |
| `stripe-webhook` | Stripe event | — | Stripe | Payment processing |
| `customer-portal` | user_id | portal URL | Settings | Stripe portal |
| `push-notifications` | user_id, title, body | — | Trigger via DB | Web push |
| `send-welcome-email` | user_id | — | Post-registration | Email |
| `send-newsletter` | — | — | Admin | Bulk email |

### Key RPCs

| RPC | Inputs | Output | Notes |
|-----|--------|--------|-------|
| `award_unified_xp` | user_id, amount, source, reason | jsonb | Central XP award + level calc |
| `award_energy` | user_id, amount, source, reason, idempotency_key | jsonb | Energy credit with idempotency |
| `spend_energy` | user_id, amount, source, reason, idempotency_key | jsonb | Energy debit with balance check |
| `complete_launchpad_step` | user_id, step, data | jsonb | Atomic step completion + XP |
| `get_user_tier` | user_id | text | Progression tier lookup |
| `increment_daily_message_count` | user_id | integer | Free tier message tracking |
| `reconcile_user_xp` | user_id | jsonb | XP integrity check + correction |
| `get_or_create_ai_conversation` | user_id | uuid | Default Aurora thread |
| `get_or_create_pillar_conversation` | user_id, pillar | uuid | Pillar-scoped thread |
| `create_ai_conversation` | user_id | uuid | New Aurora thread |
| `queue_proactive_message` | user_id, trigger_type, data, priority | uuid | Queue proactive nudge |
| `get_pending_proactive_items` | user_id | rows | Fetch unsent nudges |

---

## 5) UI Surface Map

| Route | Purpose | Data Source | User Actions | Module |
|-------|---------|-------------|-------------|--------|
| `/` | Landing / Homepage | `landing_pages`, `homepage_sections` | CTA clicks, lead capture | Marketing |
| `/onboarding` | Neural Intake (8 steps) | `launchpad_progress` | Complete steps, chat with Aurora | Onboarding |
| `/dashboard` | Main user dashboard (Today/Plan/Aurora/Me tabs) | `action_items`, `life_plans`, `profiles`, Now Engine | Complete actions, view schedule, chat | Core |
| `/life/:pillarId` | Core pillar home | `life_domains`, `action_items` | Start assessment, view progress | Assessments |
| `/life/:pillarId/assess` | Legacy assess route (redirects to dock) | — | — | ⚠️ Redirect |
| `/arena/:pillarId` | Arena pillar home | `life_domains`, `action_items` | Start assessment, view progress | Assessments |
| `/subscriptions` | Pricing / upgrade | `subscription_tiers`, `user_subscriptions` | Subscribe, manage | Subscription |
| `/community` | Social feed + forum | `community_posts`, `community_members` | Post, comment, like, RSVP | Community |
| `/courses` | Course catalog | `content_products` | Browse, enroll | Content |
| `/courses/:slug` | Course detail + watch | `content_episodes`, `course_enrollments` | Watch, track progress | Content |
| `/business-dashboard` | Business module | `business_journeys`, `business_plans` | Journey steps, view plans | Business |
| `/business-journey` | Business intake | `business_journeys` | Complete steps | Business |
| `/coaching-journey` | Coach setup | `coaching_journeys` | Complete steps | Coach |
| `/coaches` | Coach Hub | `practitioners`, `practitioner_clients` | Manage clients, create plans | Coach Hub |
| `/projects` | Project tracker | `user_projects` | CRUD projects | Projects |
| `/admin-hub` | Admin dashboard | Multiple admin tables | Full admin ops | Admin |
| `/go/:slug` | Dynamic landing pages | `landing_pages` | CTA, lead capture | Marketing |
| `/consciousness-leap` | Premium program landing | — | Lead capture → application | Consciousness Leap |
| `/install` | PWA install prompt | — | Install app | PWA |
| `/messages` | DM threads | `conversations`, `messages` | Read/send messages | Messages |

---

## 6) Integration Points / Gaps

### 6.1 "Job" Storage & Usage
- **Current state:** The archetype system (Warrior, Mystic, Creator, Sage, Healer, Explorer) is computed in `computeAvatarDNA()` from hobbies, traits, and priorities. Results are stored ONLY in `orb_profiles.computed_from.dominantArchetype` / `archetypeWeights`.
- **Gap:** There is NO `jobs` table, no job progression, no job-specific quests or skill trees. The comment "supports the Job system for RPG-style progression" in `avatarDNA.ts` is aspirational, not implemented.
- **Where it could attach:** Create a `user_jobs` table (user_id, job_id, job_level, unlocked_at) linked to archetypes. Job XP could be a sub-ledger within `xp_events`.

### 6.2 Orb/Avatar Storage & Usage
- **Current state:** Fully stored in `orb_profiles` table (one row per user). Computed deterministically from seed + user signals. Rendered via `PersonalizedOrb` WebGL component. Used in: dashboard, community (identity), profile.
- **No gaps** — well-integrated.

### 6.3 Coach Plans → User Plans
- **Current state:** `generate-coach-plan` edge function creates `coach_client_plans` rows and injects milestones/tasks into the CLIENT's `action_items` table.
- **Gap:** No merge/conflict resolution if client already has a strategy plan for the same pillar. Coach plan items are source='coach' in action_items but don't interact with `life_plans` hierarchy (missions/milestones). They exist as flat action_items alongside the strategy engine's output.
- **Potential conflict:** A client could have both coach-injected tasks and strategy-engine-generated tasks for the same pillar/day.

### 6.4 Skills Attachment Point
- **Current state:** No skills system exists. No `skills` table, no skill-action mapping.
- **Where it could attach cleanly:**
  - The `handle_action_item_completion` trigger is the ideal injection point — when a task completes, award skill XP based on `action_items.pillar` + `action_items.type` + optional `metadata.skill_weights`.
  - `life_domains.domain_config.latest_assessment` already contains per-pillar metrics that could seed initial skill levels.
  - The archetype system could derive "skill affinities" (e.g., Warrior → combat skills boost).

### 6.5 Duplication / Conflicting Sources of Truth
1. **action_items vs aurora_checklists:** `useMissionsRoadmap` still reads from `aurora_checklists` + `aurora_checklist_items` (legacy tables). `useActionItems` reads from `action_items`. Both are active. Migration function exists but hasn't fully replaced legacy reads.
2. **Streak tracking:** Streaks are updated in BOTH `check_streak_bonus` (trigger on hypnosis_sessions) AND `handle_hypnosis_session_complete` (another trigger on same table). Potential double-update.
3. **XP award paths:** `handle_hypnosis_session_complete` calls `award_unified_xp` AND directly updates `profiles.experience`. The `check_streak_bonus` trigger ALSO directly updates `profiles.experience`. This bypasses the unified XP ledger for some paths.
4. **Progression tiers vs subscription tiers:** Two independent tier systems coexist: (a) progression-based (`get_user_tier`: clarity→structure→consistency→mastery) and (b) commercial subscription-based (free→plus→apex). Feature gating primarily uses subscription tiers; progression tiers are underutilized.

---

## 7) Final Output Summary

### What Exists Today
MindOS is a comprehensive life-operating-system built on 14 life domains (7 Core + 7 Arena), unified around a single `action_items` table, a 100-day hierarchical strategy engine, and Aurora — an AI assistant with full context of the user's "Brain" (identity, habits, plans, energy patterns). The platform features a complete gamification layer (XP, levels, energy currency, streaks, movement score), a 3D personalized Orb avatar driven by ~70 behavioral variables, a 3-tier commercial subscription model (Free/Plus/Apex), a coach hub with AI plan generation and client injection, a social community with reputation, proactive AI nudges, AI hypnosis, domain assessments with mandatory metric gates, self-healing plan orchestration, bilingual HE/EN support, push notifications, Stripe payments, affiliate system, and a full admin hub. The architecture is layered: deterministic context building → policy/routing orchestration → LLM call, with a command bus enabling Aurora to modify the user's data through structured tags.

### What's Missing for Job → Skills → Plan Integration
No "Job" entity exists beyond the computed archetype blend stored in the orb profile — there is no job table, no job progression, no skill trees, and no skill-action weighting. To implement this, a `user_jobs` table would define the user's RPG class (derived from their dominant archetype), a `skills` table would define per-pillar competencies, and a `skill_events` ledger (mirroring `xp_events`) would track skill growth. The `handle_action_item_completion` trigger is the natural injection point for skill XP, using `pillar` + `metadata.skill_weights` to distribute points. Domain assessment scores from `life_domains.domain_config.latest_assessment` would seed initial skill levels, and the strategy engine would use skill gaps to prioritize daily actions — creating a closed loop from assessment → skills → plan → execution → skill growth.

### Top 10 "Single Source of Truth" Principles

1. ✅ **action_items IS the unified task store** — tasks, habits, sessions, milestones, schedule blocks all in one table
2. ✅ **xp_events IS the XP ledger** — `award_unified_xp` is the canonical entry point
3. ✅ **energy_events IS the energy ledger** — `award_energy`/`spend_energy` RPCs with idempotency
4. ✅ **RESOLVED (Phase 1): Roadmap reads action_items only** — `useMissionsRoadmap` refactored, `aurora_checklists` marked legacy
5. ✅ **RESOLVED (Phase 1): XP guardrail enforced** — `guard_xp_direct_update` trigger blocks non-RPC updates, `check_streak_bonus` dropped
6. ⚠️ **Two tier systems coexist (by design)** — progression tiers (clarity→mastery) and subscription tiers (free→apex) serve different purposes
7. ✅ **life_domains IS the assessment store** — all 14 domain diagnostics stored in `domain_config.latest_assessment`
8. ✅ **orb_profiles IS the avatar store** — single row per user with full visual DNA
9. ✅ **profiles IS the user state store** — experience, level, tokens, streak, selected_pillars all on profiles
10. ✅ **RESOLVED (Phase 2): Job is a first-class entity** — `jobs` catalog + `user_jobs` assignment history. SSOT = `user_jobs WHERE is_primary = true`. `orb_profiles.computed_from` remains informational only.

---

## Job SSOT Spec (Phase 2)

### Tables
- **`jobs`** — Catalog of 6 archetype-based jobs (Warrior, Mystic, Creator, Sage, Healer, Explorer). Public read access.
- **`user_jobs`** — Assignment history. `is_primary = true` marks the current job. One primary per user enforced by `assign_user_job()` RPC.

### Write Paths
1. **Onboarding completion** → `generate-launchpad-summary` edge function → calls `assign_user_job(user_id, job_name, 'ai', metadata)` → maps `suggested_ego_state` to job name
2. **User self-change** → `JobPanel` component → calls `assign_user_job(user_id, job_name, 'user')`
3. **Coach recommendation** → (future) Coach can call `assign_user_job(client_id, job_name, 'coach')`
4. **Re-onboarding** → Creates new `user_jobs` record; previous `is_primary` demoted to `false`. Full history preserved.

### Read Paths
- **`useUserJob` hook** — Reads `user_jobs` joined with `jobs` where `is_primary = true`
- **`JobPanel` component** — Displays current job in ProfileContent
- **Coach `ClientProfilePanel`** — Reads client's primary job for coach visibility
- **`orb_profiles.computed_from`** — Informational only; NOT the SSOT for job

### Backfill
- Existing users with `orb_profiles.computed_from` populated were backfilled into `user_jobs` during migration
- Legacy `egoState` values mapped: guardian→Warrior, visionary→Explorer, achiever→Warrior, nurturer→Healer, analyst→Sage, rebel→Explorer

### Edge Cases
- User with no orb_profile → No job assigned until they complete onboarding
- Job name not recognized → Falls back to Explorer
- Multiple onboarding completions → New job record created, history preserved
