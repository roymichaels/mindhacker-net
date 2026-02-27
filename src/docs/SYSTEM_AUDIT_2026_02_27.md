# MINDOS FULL SYSTEM AUDIT

> Generated: 2026-02-27 | **Updated: 2026-02-27 (verified pass)** | Auditor: AI | Status: VERIFIED

---

## 1. SYSTEM MAP (ACTUAL)

### 1.1 Database Tables Inventory

Total tables identified: **~85+** (from types.ts schema)

#### CORE EXECUTION ENGINE

| Table | Purpose | SSOT For | Status |
|-------|---------|----------|--------|
| `action_items` | Unified task/habit/session/milestone store | All execution items | **Active (SSOT)** |
| `aurora_checklists` | Old task groups | Tasks (pre-migration) | **LEGACY** |
| `aurora_checklist_items` | Old task items | Sub-tasks (pre-migration) | **LEGACY** |
| `aurora_daily_minimums` | Old habit definitions | Habits (pre-migration) | **LEGACY** |
| `daily_habit_logs` | Habit completion tracking | Daily habit completion | **LEGACY COUPLING** — FK → `aurora_checklist_items` |
| `life_plan_milestones` | Plan milestones | Milestones within plans | **Active but DUAL with action_items** |
| `mini_milestones` | Sub-milestones | Sub-milestone completion | **Active — triggers write to life_plan_milestones** |
| `plan_missions` | Mission groupings for milestones | Mission completion tracking | **Active** |

#### GAMIFICATION ENGINE

| Table | Purpose | SSOT For | Status |
|-------|---------|----------|--------|
| `xp_events` | XP ledger | All XP transactions | **Active (SSOT)** |
| `profiles.experience` | XP cache | Derived XP total | **Active (derived cache)** |
| `energy_events` | Energy/token ledger | All energy transactions | **Active (SSOT)** |
| `profiles.tokens` | Energy cache | Derived energy balance | **Active (derived cache)** |
| `skill_xp_events` | Skill XP ledger | Per-skill XP transactions | **Active (SSOT)** |
| `user_skill_progress` | Skill XP cache | Derived skill totals | **Active (derived cache)** |
| `skills` | Skill catalog | Skill definitions | **Active** |
| `action_skill_weights` | Pillar→skill + template→skill mappings | XP distribution weights | **Active** — all 35 rows use `mapping_type='pillar'`, `mapping_key=<pillar>` |
| `jobs` | Job/role catalog | Job definitions | **Active** |
| `job_skill_weights` | Job→skill multipliers | Skill multiplier by job | **Active** |
| `user_jobs` | User's assigned jobs | User-job assignments | **Active** |

#### AI / AURORA ENGINE

| Table | Purpose | SSOT For | Status |
|-------|---------|----------|--------|
| `conversations` | Chat threads | Conversation metadata | **Active** |
| `messages` | Chat messages | Message content | **Active** |
| `ai_response_logs` | AI call audit trail | AI observability | **Active** |
| `aurora_onboarding_progress` | Aurora-specific onboarding | Aurora readiness state | **Active** |
| `aurora_conversation_memory` | Summarized conversation context | AI long-term memory | **Active** |
| `aurora_proactive_queue` | Scheduled proactive messages | Outbound AI messaging | **Active** |
| `aurora_reminders` | User reminders | Reminder delivery | **Active** |
| `aurora_action_preferences` | Trust levels per command type | Command bus trust | **Active** |
| `aurora_behavioral_patterns` | Detected user patterns | Pattern analysis | **Active** |
| `aurora_energy_patterns` | Energy cycle patterns | Energy analysis | **Active** |
| `aurora_identity_elements` | Identity traits | Self-model | **Active** |
| `aurora_life_direction` | Life direction statement | Direction clarity | **Active** |
| `aurora_life_visions` | Vision statements | Life vision | **Active** |
| `aurora_commitments` | User commitments | Commitment tracking | **Active** |
| `aurora_focus_plans` | Focus sprints | Focus period tracking | **Active** |
| `daily_message_counts` | Rate limiting | AI message throttling | **Active** |
| `daily_pulse_logs` | Daily check-in data | Daily self-assessment | **Active** |
| `recalibration_logs` | Weekly recalibration records | Plan adjustment history | **Active** |

#### USER & AUTH

| Table | Purpose | SSOT For | Status |
|-------|---------|----------|--------|
| `profiles` | User profile + cached stats | User identity + XP/energy cache | **Active (SSOT for identity)** |
| `user_sensitive_data` | Phone numbers, PII | Sensitive data isolation | **Active** |
| `user_roles` | Role assignments (admin, practitioner) | RBAC | **Active** |
| `role_permissions` | Permission definitions | Permission catalog | **Active** |
| `launchpad_progress` | Onboarding wizard state | Onboarding completion | **Active** |
| `launchpad_summaries` | AI-generated onboarding summary | Onboarding analysis | **Active** |

#### PLANS & STRATEGY

| Table | Purpose | SSOT For | Status |
|-------|---------|----------|--------|
| `life_plans` | 100-day plans | Plan definitions | **Active** |
| `life_plan_milestones` | Plan milestones | Milestone definitions | **Active** |
| `mini_milestones` | Sub-milestones within milestones | Sub-milestone tracking | **Active** |
| `plan_missions` | Mission groupings | Mission tracking | **Active** |

#### COACH / PRACTITIONER SYSTEM

| Table | Purpose | SSOT For | Status |
|-------|---------|----------|--------|
| `practitioners` | Coach profiles | Coach identity | **Active** |
| `practitioner_services` | Service catalog | Coach service offerings | **Active** |
| `practitioner_availability` | Calendar availability | Booking slots | **Active** |
| `practitioner_clients` | Coach-client relationships | Client roster | **Active** |
| `practitioner_client_profiles` | Extended client view for coach | Coach's client notes | **Active** |
| `practitioner_reviews` | Client reviews | Social proof | **Active** |
| `coach_client_plans` | AI-generated coaching plans | Coach plan data | **Active** |
| `bookings` | Session bookings | Booking state | **Active** |
| `purchases` | Service purchases | Purchase records | **Active** |

#### COMMERCE / SUBSCRIPTION

| Table | Purpose | SSOT For | Status |
|-------|---------|----------|--------|
| `products` | Product catalog | Product definitions | **Active** |
| `offers` | Landing page offers | Offer details | **Active** |
| `orders` | Purchase orders | Order records | **Active** |
| `content_products` | Digital content (courses) | Course definitions | **Active** |
| `content_series` | Series within courses | Series structure | **Active** |
| `content_episodes` | Individual episodes | Episode content | **Active** |
| `content_purchases` | Content access grants | Content entitlements | **Active** |
| `content_analytics` | Content engagement | Content metrics | **Active** |
| `course_enrollments` | Course progress tracking | Enrollment state | **Active** |
| `user_progress` | Episode-level progress | Watch progress | **Active** |
| `subscription_tiers` | Tier definitions | Subscription tiers | **Active** |
| `user_subscriptions` | Active subscriptions | Subscription state | **Active** |

#### COMMUNITY

| Table | Purpose | SSOT For | Status |
|-------|---------|----------|--------|
| `community_posts` | Forum posts | Post content | **Active** |
| `community_comments` | Post comments | Comment content | **Active** |
| `community_likes` | Like actions | Like state | **Active** |
| `community_members` | Member profiles + stats | Community identity | **Active** |
| `community_levels` | Level definitions | Community tier system | **Active** |
| `community_point_logs` | Community XP ledger | Community points | **Active** |
| `community_categories` | Forum categories | Category definitions | **Active** |
| `community_events` | Events | Event details | **Active** |
| `community_event_rsvps` | RSVPs | Event attendance | **Active** |

#### JOURNEY SYSTEM (Pillar Journeys)

| Table | Purpose | Status |
|-------|---------|--------|
| `business_journeys` | Business pillar journey | Active |
| `coaching_journeys` | Coaching pillar journey | Active |
| `finance_journeys` | Finance pillar journey | Active |
| `learning_journeys` | Learning pillar journey | Active |
| `purpose_journeys` | Purpose pillar journey | Active |
| `relationships_journeys` | Relationships pillar journey | Active |
| `projects_journeys` | Projects pillar journey | Active |
| `admin_journeys` | Admin setup journey | Active |
| `business_branding` | Branding sub-data | Active |
| `business_orb_profiles` | Business orb visual | Active |
| `business_plans` | Business action plans | Active |
| `business_plan_milestones` | Business plan milestones | Active |

#### ANALYTICS / OBSERVABILITY

| Table | Purpose | Status |
|-------|---------|--------|
| `visitor_sessions` | Anonymous visitor tracking | Active |
| `page_views` | Page-level analytics | Active |
| `conversion_events` | Funnel events | Active |
| `analytics_reports` | Generated reports | Active |
| `edge_function_errors` | Edge function error logs | Active |
| `email_logs` | Email delivery tracking | Active |
| `bug_reports` | User-submitted bugs | Active |

#### MISC / SPECIALIZED

| Table | Purpose | Status |
|-------|---------|--------|
| `custom_forms` | Dynamic form builder | Active |
| `form_submissions` | Form responses | Active |
| `custom_protocols` | Custom hypnosis protocols | Active |
| `hypnosis_sessions` | Completed hypnosis sessions | Active |
| `hypnosis_videos` | Video assets | Active |
| `user_video_access` | Token-based video access | Active |
| `consciousness_leap_leads` | Sales funnel leads | Active |
| `consciousness_leap_applications` | Application submissions | Active |
| `leads` | General leads | Active |
| `exit_intent_leads` | Exit intent captures | Active |
| `affiliates` | Affiliate program | Active |
| `affiliate_referrals` | Referral tracking | Active |
| `affiliate_payouts` | Payout records | Active |
| `landing_pages` | Dynamic landing pages | Active |
| `faqs` | FAQ content | Active |
| `chat_assistant_settings` | Chat widget config | Active |
| `chat_knowledge_base` | Chat widget knowledge | Active |
| `site_settings` | Global site config | Active |
| `push_subscriptions` | Web push registration | Active |
| `user_notifications` | In-app notifications | Active |
| `admin_notifications` | Admin-specific notifications | Active |
| `orb_profiles` | User orb visualization | Active |
| `user_projects` | User personal projects | Active |
| `questionnaire_completions` | Questionnaire results | Active |

---

### 1.2 Edge Functions (53 total)

| Function | Purpose | Tables Touched | Status |
|----------|---------|---------------|--------|
| `aurora-chat` | Main AI chat handler | conversations, messages, profiles, ai_response_logs, many aurora_* tables | **Active (Core)** |
| `aurora-proactive` | Scheduled outreach | aurora_proactive_queue, profiles | **Active** |
| `aurora-analyze` | Life model extraction | aurora_* context tables | **Active** |
| `aurora-generate-title` | Thread naming | conversations | **Active** |
| `aurora-summarize-conversation` | Conversation summarization | aurora_conversation_memory | **Active** |
| `aurora-recalibrate` | Weekly plan recalibration | recalibration_logs, action_items | **Active** |
| `generate-90day-strategy` | 100-day plan generation | life_plans, life_plan_milestones, plan_missions, action_items | **Active** |
| `generate-today-queue` | Daily action queue | action_items | **Active** |
| `generate-phase-actions` | Phase-level action generation | action_items | **Active** |
| `generate-execution-steps` | Execution step breakdown | action_items | **Active** |
| `generate-first-week-actions` | First week action planning | action_items | **Active** |
| `generate-coach-plan` | AI coaching plan | coach_client_plans | **Active** |
| `generate-health-plan` | Health plan generation | - | **Active** |
| `generate-business-plan` | Business plan generation | business_plans | **Active** |
| `generate-branding-suggestions` | Brand suggestions | business_branding | **Active** |
| `generate-identity-archetype` | Identity archetype | profiles | **Active** |
| `generate-pillar-synthesis` | Pillar synthesis | - | **Active** |
| `generate-launchpad-summary` | Onboarding summary | launchpad_summaries | **Active** |
| `generate-analytics-report` | Analytics report | analytics_reports | **Active** |
| `generate-hypnosis-script` | AI hypnosis script | custom_protocols | **Active** |
| `ai-hypnosis` | Hypnosis session handler | hypnosis_sessions | **Active** |
| `domain-assess` | Domain assessment chat | conversations, messages | **Active** |
| `consciousness-assess` | Consciousness assessment | - | **Active** |
| `onboarding-chat` | Onboarding chat handler | conversations, messages | **Active** |
| `analyze-introspection-form` | Form analysis | questionnaire_completions | **Active** |
| `analyze-life-plan` | Life plan analysis | - | **Active** |
| `analyze-presence` | Presence analysis | - | **Active** |
| `elevenlabs-tts` | Text-to-speech | - | **Active** |
| `elevenlabs-transcribe` | Speech-to-text | - | **Active** |
| `text-to-speech` | TTS (alternate) | - | **Possible duplicate** |
| `cache-hypnosis-audio` | Audio caching | - | **Active** |
| `get-audio-by-token` | Token-based audio access | - | **Active** |
| `get-video-by-token` | Token-based video access | user_video_access | **Active** |
| `create-checkout-session` | Stripe checkout | orders, user_subscriptions | **Active** |
| `create-coach-checkout` | Coach service checkout | purchases | **Active** |
| `customer-portal` | Stripe portal | user_subscriptions | **Active** |
| `check-subscription` | Subscription validation | user_subscriptions | **Active** |
| `stripe-webhook` | Stripe events handler | orders, user_subscriptions, content_purchases | **Active** |
| `push-notifications` | Web push sender | push_subscriptions | **Active** |
| `send-welcome-email` | Welcome email | email_logs | **Active** |
| `send-newsletter` | Newsletter sender | email_logs | **Active** |
| `send-form-pdf-email` | PDF email | email_logs | **Active** |
| `send-order-confirmation` | Order confirmation | email_logs | **Active** |
| `send-order-notification` | Admin order notification | admin_notifications | **Active** |
| `submit-lead` | Lead capture | leads | **Active** |
| `submit-consciousness-leap-lead` | CL lead capture | consciousness_leap_leads | **Active** |
| `submit-consciousness-leap-application` | CL application | consciousness_leap_applications | **Active** |
| `validate-consciousness-leap-token` | Token validation | consciousness_leap_leads | **Active** |
| `admin-grant-purchase` | Admin grants access | content_purchases | **Active** |
| `get-user-data` | User data export | profiles, multiple tables | **Active** |
| `add-plate-item` | Add item to user plate | action_items | **Active** |

---

## 2. SSOT VIOLATIONS

### 2.1 CRITICAL — Dual Task/Milestone Systems

| Violation | Description | Severity |
|-----------|-------------|----------|
| **action_items vs aurora_checklists** | `aurora_checklists` + `aurora_checklist_items` still exist and have FKs. `daily_habit_logs.habit_item_id` → `aurora_checklist_items.id`. Legacy tables are not dropped. | 🔴 HIGH |
| **action_items.type='milestone' vs life_plan_milestones** | Milestones exist in BOTH tables. `action_items` has `milestone_id` FK to `life_plan_milestones`. The `migrate_to_action_items()` RPC copies milestones but doesn't delete originals. `mini_milestones` still references `life_plan_milestones` directly. | 🔴 HIGH |
| **action_items.type='habit' vs aurora_daily_minimums** | Habits were migrated to `action_items` but `aurora_daily_minimums` table still exists. | 🟡 MEDIUM |
| **daily_habit_logs FK to legacy** | `daily_habit_logs.habit_item_id` references `aurora_checklist_items.id` — this means habit completion tracking still depends on the legacy system. | 🔴 HIGH |

### 2.2 CRITICAL — Multiple XP Write Paths

| Violation | Description | Severity |
|-----------|-------------|----------|
| **handle_hypnosis_session_complete bypasses action_items** | This trigger calls `award_unified_xp` directly from `hypnosis_sessions` insert, not through `action_items` completion. XP is awarded outside the action_items flow. | 🟡 MEDIUM (acceptable — sessions are a separate concept) |
| **handle_mini_milestone_completion bypasses action_items** | Mini-milestone completion calls `award_unified_xp` directly. Not routed through action_items. | 🟡 MEDIUM |
| **complete_launchpad_step awards XP directly** | Launchpad step completion calls `award_unified_xp` for each step. Not tracked in action_items. | 🟡 MEDIUM (acceptable for onboarding) |
| **community_point_logs is separate from xp_events** | Community has its own point system (`community_point_logs`, `community_members.total_points`) completely disconnected from the main XP ledger. | 🟡 MEDIUM |

### 2.3 Data Representation Duplication

| Issue | Tables Involved | Severity |
|-------|----------------|----------|
| **Two notification systems** | `admin_notifications` + `user_notifications` + fanout trigger. Admin notifications are cloned to user_notifications for admin users. | 🟢 LOW (by design) |
| **Two product systems** | `products` (simple catalog) + `content_products` (course platform). Different purposes but confusing naming. | 🟡 MEDIUM |
| **Two purchase systems** | `orders` (product orders) + `purchases` (practitioner service purchases) + `content_purchases` (content access grants). Three different purchase concepts. | 🟡 MEDIUM |
| **Orb profiles in two tables** | `orb_profiles` (user) + `business_orb_profiles` (business). | 🟢 LOW (different contexts) |

### 2.4 Frontend Aggregation Instead of DB

| Location | Issue |
|----------|-------|
| `useSkillsProgress.ts` | `totalTodayXP` computed client-side via `reduce()`. Should use DB aggregate. |
| `src/services/actionItems.ts:getTodayActions` | Complex date filtering in client query string. Could miss edge cases around timezone boundaries. |
| `useSkillsProgress.ts:topSkills` | `slice(0, 12)` on client after fetching all. Should use `LIMIT 12` in query. |

---

## 3. DATA FLOW MAP

### 3.1 New User Onboarding

```
1. User signs up → auth.users INSERT
2. Trigger: auto_create_aurora_onboarding_progress() → aurora_onboarding_progress INSERT
3. Trigger: handle_new_sensitive_data() → user_sensitive_data INSERT
4. Trigger: handle_new_community_member() → community_members INSERT
5. Trigger: initialize_launchpad() → launchpad_progress INSERT
6. Trigger: notify_new_user() → admin_notifications INSERT
7. Trigger: notify_new_user_welcome() → user_notifications INSERT
8. Trigger: fanout_admin_notifications_to_users() → user_notifications INSERT (for admins)
9. Trigger: send_push_notification_via_edge() → HTTP call to push-notifications edge function
10. User completes launchpad steps → complete_launchpad_step() RPC → launchpad_progress UPDATE + award_unified_xp() → xp_events + profiles UPDATE
```

### 3.2 Generated Plan (100-Day Strategy)

```
1. Edge function: generate-90day-strategy called
2. AI generates plan structure
3. INSERT → life_plans
4. INSERT → plan_missions (per pillar)
5. INSERT → life_plan_milestones (per mission, per week)
6. INSERT → mini_milestones (sub-steps per milestone)
7. INSERT → action_items (type='milestone', linking to life_plan_milestones)
8. Trigger: calculate_milestone_dates() → auto-fills start_date/end_date on life_plan_milestones
```

### 3.3 Creating an Action Item

```
1. Frontend calls createAction() → supabase INSERT action_items
2. DB trigger handle_action_item_completion (on UPDATE, not INSERT)
3. No trigger fires on INSERT — item sits as todo
```

### 3.4 Completing an Action Item

```
1. Frontend calls completeAction(id) → UPDATE action_items SET status='done'
2. DB trigger: handle_action_item_completion fires
   a. Sets completed_at = now()
   b. Calls award_unified_xp(user_id, xp_reward, source, reason)
      → INSERT xp_events
      → UPDATE profiles.experience (via set_config guard bypass)
      → Calculates level
      → Optionally calls award_energy() for level-up bonus
   c. Resolves action_skill_weights for this item
      → Calls award_skill_xp() per skill
      → INSERT skill_xp_events
      → UPSERT user_skill_progress
```

### 3.5 Skill XP Award

```
1. Triggered by handle_action_item_completion (see 3.4 step c)
2. Looks up action_skill_weights by:
   - First: metadata->>'execution_template' (mapping_type='execution_template')
   - Fallback: action_items.pillar (mapping_type IS NULL)
3. For each weight: award_skill_xp(user_id, skill_id, xp * weight, source)
4. Enhanced by job_skill_weights multiplier (user's primary job)
5. INSERT skill_xp_events (unique constraint on action_item_id + skill_id)
6. UPSERT user_skill_progress (xp_total, level = floor(xp_total/100))
```

### 3.6 Energy Award

```
1. Called via award_energy(user_id, amount, source, reason, idempotency_key)
2. UPDATE profiles.tokens += amount
3. INSERT energy_events (ledger entry)
4. Returns new balance
```

### 3.7 Job Assignment

```
1. Admin/system assigns via INSERT user_jobs
2. Sets is_primary = true
3. job_skill_weights multipliers become active for that user
4. Next action_item completion uses these multipliers in skill XP calculation
```

### 3.8 Coach-Injected Task

```
1. Coach uses generate-coach-plan edge function
2. AI generates plan → INSERT coach_client_plans
3. Plan data stored as JSON in plan_data column
4. NO automatic injection into client's action_items
5. Coach must manually create action_items for client (if implemented)
⚠️ GAP: coach_client_plans.plan_data is disconnected from action_items
```

---

## 4. TRIGGER & RPC MAP

### 4.1 Triggers

| Trigger | Table | Event | Calls RPCs | Idempotent | Guard |
|---------|-------|-------|-----------|------------|-------|
| `auto_create_aurora_onboarding_progress` | profiles | INSERT | No | Yes (ON CONFLICT DO NOTHING) | ✅ |
| `handle_new_sensitive_data` | profiles | INSERT | No | Yes (ON CONFLICT DO NOTHING) | ✅ |
| `handle_new_community_member` | profiles | INSERT | No | Yes (ON CONFLICT DO NOTHING) | ✅ |
| `initialize_launchpad` | profiles | INSERT | No | Yes (ON CONFLICT DO NOTHING) | ✅ |
| `notify_new_user` | profiles | INSERT | create_admin_notification | No dedup | ⚠️ |
| `notify_new_user_welcome` | profiles | INSERT | No | No dedup | ⚠️ |
| `guard_xp_direct_update` | profiles | BEFORE UPDATE | No | N/A | ✅ |
| `handle_hypnosis_session_complete` | hypnosis_sessions | INSERT | award_unified_xp, award_energy | No idempotency key | ⚠️ |
| `handle_action_item_completion` | action_items | BEFORE UPDATE | award_unified_xp, award_skill_xp | Partial (skill_xp has unique constraint) | ⚠️ |
| `trg_enforce_execution_template` | action_items | BEFORE INSERT (row) | No | Yes (idempotent — only sets if missing) | ✅ |
| `handle_mini_milestone_completion` | mini_milestones | UPDATE | award_unified_xp | No dedup | ⚠️ |
| `check_milestone_from_minis` | mini_milestones | UPDATE | No | Yes (conditional) | ✅ |
| `check_mission_completion` | life_plan_milestones | UPDATE | No | Yes (conditional) | ✅ |
| `update_life_plan_progress` | life_plan_milestones | UPDATE | No | Yes (calc) | ✅ |
| `calculate_milestone_dates` | life_plan_milestones | INSERT | No | Yes | ✅ |
| `update_conversation_last_message` | messages | INSERT | No | Yes | ✅ |
| `bridge_proactive_to_notification` | aurora_proactive_queue | INSERT | No | No dedup | ⚠️ |
| `fanout_admin_notifications_to_users` | admin_notifications | INSERT | No | No dedup | ⚠️ |
| `send_push_notification_via_edge` | user_notifications | INSERT | HTTP call | No dedup | ⚠️ |
| `update_community_member_stats` | community_posts/comments/likes | INSERT/DELETE | No | No | ⚠️ |
| `update_community_member_level` | community_members | UPDATE | No | Yes | ✅ |
| `validate_booking_status` | bookings | INSERT/UPDATE | No | N/A | ✅ |
| `validate_day_of_week` | practitioner_availability | INSERT/UPDATE | No | N/A | ✅ |
| `create_affiliate_referral_on_payment` | orders | INSERT/UPDATE | No | Yes (checks existing) | ✅ |
| `update_affiliate_earnings` | affiliate_referrals | UPDATE | No | Yes (conditional) | ✅ |
| `notify_users_new_content` | content_products | INSERT/UPDATE | No | No dedup | ⚠️ |
| `notify_course_completion` | course_enrollments | UPDATE | No | No dedup | ⚠️ |
| `notify_user_purchase` | orders | UPDATE | No | No dedup | ⚠️ |
| `notify_subscription_activated` | user_subscriptions | INSERT | No | No dedup | ⚠️ |
| `notify_user_subscription_cancelled` | user_subscriptions | UPDATE | No | No dedup | ⚠️ |
| `notify_onboarding_completed` | launchpad_progress | UPDATE | No | No dedup | ⚠️ |

### 4.2 Key RPCs

| RPC | Security | Calls Other RPCs | Idempotent | Tables Written |
|-----|----------|-----------------|------------|---------------|
| `award_unified_xp` | DEFINER | award_energy (conditional) | No (no idemp key) | xp_events, profiles |
| `award_energy` | DEFINER | No | Yes (idempotency_key) | energy_events, profiles |
| `spend_energy` | DEFINER | No | Yes (idempotency_key) | energy_events, profiles |
| `award_skill_xp` | DEFINER | No | Yes (unique constraint) | skill_xp_events, user_skill_progress |
| `complete_launchpad_step` | DEFINER | award_unified_xp | No | launchpad_progress, xp_events, profiles |
| `reconcile_user_xp` | DEFINER | No | Yes (corrective) | profiles |
| `check_xp_integrity` | DEFINER | No | Yes (read-only) | None |
| `get_user_tier` | DEFINER | No | Yes (read-only) | None |
| `get_or_create_ai_conversation` | DEFINER | No | Yes (UPSERT-like) | conversations |
| `get_or_create_pillar_conversation` | DEFINER | No | Yes | conversations |
| `create_ai_conversation` | DEFINER | No | No | conversations |
| `queue_proactive_message` | DEFINER | No | No | aurora_proactive_queue |
| `increment_daily_message_count` | DEFINER | No | Yes (UPSERT) | daily_message_counts |
| `create_user_notification` | DEFINER | No | No | user_notifications |
| `create_admin_notification` | DEFINER | No | No | admin_notifications |
| `get_pending_proactive_items` | DEFINER | No | Yes (read-only) | None |
| `get_practitioner_id_for_user` | DEFINER | No | Yes (read-only) | None |
| `migrate_to_action_items` | DEFINER | No | Yes (ON CONFLICT) | action_items |
| `aurora_award_xp` | DEFINER | award_unified_xp | No | xp_events, profiles |
| `notify_journey_completion` | DEFINER | No | No | admin_notifications |
| `get_skill_gains_today` | (not shown) | No | Yes (read-only) | None |

---

## 5. LEGACY & DEAD CODE

### 5.1 Legacy Tables (Should Be Dropped or Frozen)

| Table | Reason | Risk of Removal |
|-------|--------|----------------|
| `aurora_checklists` | Replaced by `action_items`. Migration RPC exists. | 🟡 MEDIUM — `daily_habit_logs` still has FK |
| `aurora_checklist_items` | Replaced by `action_items` children. | 🔴 HIGH — `daily_habit_logs.habit_item_id` FK |
| `aurora_daily_minimums` | Replaced by `action_items` type='habit'. | 🟢 LOW — no active FKs detected |

### 5.2 Potentially Dead/Redundant Edge Functions

| Function | Issue |
|----------|-------|
| `text-to-speech` | Possibly duplicates `elevenlabs-tts`. Need to verify if both are called. |
| `analyze-presence` | May overlap with `consciousness-assess`. |

### 5.3 Shadow Systems

| System | Description |
|--------|-------------|
| **Legacy checklist hooks** | `useChecklists.tsx` and `useChecklistsData.tsx` in `src/hooks/aurora/` — may still reference `aurora_checklists`. |
| **daily_habit_logs** | Entire habit logging system still coupled to legacy `aurora_checklist_items` via FK. |
| **Business plan milestones** | `business_plan_milestones` is a separate milestone system from `life_plan_milestones` and `action_items`. |

### 5.4 Code References to Deprecated Systems

Need to audit: `useChecklists.tsx`, `useChecklistsData.tsx`, `useDailyHabits.tsx` for legacy table references.

---

## 6. PERFORMANCE RISK ANALYSIS

### 6.1 N+1 Patterns

| Location | Risk |
|----------|------|
| `useSkillsProgress` → fetches ALL user_skill_progress then slices client-side | 🟡 Minor (bounded by skill count) |
| `getTodayActions` → complex OR filter with date range | 🟡 May not use index efficiently |
| Community stats triggers → multiple UPDATE queries per single like/comment | 🟡 Write amplification |

### 6.2 Missing Indexes (Likely)

| Table | Column(s) | Reason |
|-------|-----------|--------|
| `action_items` | `(user_id, status, type, scheduled_date)` | Today's queue query |
| `action_items` | `(user_id, type, parent_id)` | Parent-child lookups |
| `skill_xp_events` | `(user_id, created_at)` | Daily gains RPC |
| `energy_events` | `(user_id, created_at)` | Balance history |
| `xp_events` | `(user_id, created_at)` | XP history |
| `daily_pulse_logs` | `(user_id, log_date)` | Daily lookup |
| `messages` | `(conversation_id, created_at)` | Chat history scroll |

### 6.3 Unbounded JSON Growth

| Table.Column | Risk |
|------------|------|
| `profiles.ego_state_usage` | Grows with every hypnosis session. No pruning. |
| `profiles.aurora_preferences` | Unbounded metadata blob. |
| `launchpad_progress.step_2_profile_data` | Accumulates deep_dive data via || operator. |
| `coach_client_plans.plan_data` | Full AI-generated plan as JSON. Could be very large. |
| `action_items.metadata` | Generic JSON bag. No schema enforcement. |
| `action_items.generated_payload` | AI-generated content. Potentially large. |

### 6.4 Heavy Trigger Chains

```
action_items UPDATE (status='done')
  → handle_action_item_completion
    → award_unified_xp → UPDATE profiles (XP)
      → guard_xp_direct_update (BEFORE UPDATE)
      → award_energy (if level-up) → UPDATE profiles (tokens)
    → award_skill_xp (per skill, potentially 3-5 calls)
      → INSERT skill_xp_events
      → UPSERT user_skill_progress
```

**At 100k users:** A single action completion could trigger 8-12 DB operations in one transaction. Under load, this chain could cause contention on `profiles` row lock.

---

## 7. CONFLICT & MERGE RISKS

### 7.1 Coach Plan Injection vs User Plan Editing

- `coach_client_plans.plan_data` is **disconnected** from `action_items`
- No mechanism to sync coach plan changes to the user's action queue
- If both coach and user create action_items independently, no conflict resolution exists
- **Risk:** Coach generates a plan, user already has conflicting action_items → no merge logic

### 7.2 Job System vs Skill Multipliers

- `job_skill_weights` applies multipliers during skill XP award
- If user's job changes mid-plan, previously completed actions retain old multipliers
- No retroactive recalculation mechanism
- **Risk:** Job change creates inconsistent skill progression history

### 7.3 action_items vs mini_milestones

- `mini_milestones` has its own completion trigger → `award_unified_xp` + auto-completes parent `life_plan_milestones`
- `action_items` type='milestone' also references `life_plan_milestones` via `milestone_id`
- Completing a mini_milestone auto-completes the parent milestone, but the corresponding action_item may remain as 'todo'
- **Risk:** Desynchronization between mini_milestone completion state and action_items status

### 7.4 execution_template Derivation vs Explicit Override

**VERIFIED** — `trg_enforce_execution_template` (BEFORE INSERT on `action_items`) auto-derives `metadata.execution_template` from pillar using a CASE mapping. It skips if the field is already set (explicit override).

**However:** There is NO `execution_template_source` column on `action_items`. The trigger does not record whether the template was explicit or derived. This makes debugging silent — you cannot tell from the data whether a template was user-set or auto-assigned.

- `handle_action_item_completion` then uses `metadata->>'execution_template'` to look up `action_skill_weights` with `mapping_type='execution_template'`.
- **Current DB state:** All 35 `action_skill_weights` rows use `mapping_type='pillar'`. There are ZERO rows with `mapping_type='execution_template'`.
- **Implication:** The template→skill lookup path ALWAYS returns no rows, and the trigger falls back to pillar mapping every time. The execution_template skill mapping feature is **defined but unpopulated** — effectively dead code in the trigger.
- **Risk:** Silent — no error, no logging. Template-based skill weighting is architecturally ready but has zero data.

---

## 8. SECURITY & RLS

### 8.1 SECURITY DEFINER RPCs (Privilege Escalation Surface)

All of these bypass RLS:

| RPC | Risk |
|-----|------|
| `award_unified_xp` | If callable from client, users could award themselves XP |
| `award_energy` | Same — users could mint energy |
| `spend_energy` | Lower risk — spending is self-penalizing |
| `complete_launchpad_step` | Users could skip onboarding steps |
| `migrate_to_action_items` | Mass data write — should be admin-only |
| `reconcile_user_xp` | Could be used to manipulate XP |
| `send_push_notification_via_edge` | Trigger contains hardcoded anon key in HTTP call |

### 8.2 Hardcoded Secrets in Triggers

- `send_push_notification_via_edge` contains the **hardcoded anon key** in the trigger body. This is visible in `pg_proc`. While anon key is publishable, embedding it in triggers is poor practice.

### 8.3 Tables Potentially Missing RLS

Cannot verify from types.ts alone — requires `supabase--linter` check. Key tables to verify:
- `xp_events` (sensitive — audit trail)
- `energy_events` (sensitive — economy)
- `skill_xp_events` (sensitive — progression)
- `ai_response_logs` (sensitive — usage)
- `edge_function_errors` (sensitive — system errors)
- `analytics_reports` (admin-only)
- `admin_notifications` (admin-only)

---

## 9. ARCHITECTURE SCORECARD

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| **SSOT Integrity** | 6/10 | XP/Energy ledgers are well-designed. But dual task systems (action_items vs aurora_checklists), dual milestone systems, and disconnected coach plans create fragmentation. |
| **Modularity** | 7/10 | Good separation: domain layer, hooks, services, edge functions. But 53 edge functions with some overlap. Journey tables are highly repetitive (8 nearly identical schemas). |
| **Scalability** | 5/10 | Heavy trigger chains on action_item completion (8-12 ops). profiles row is a hot spot (XP, energy, streak, ego_state_usage all update same row). Missing critical indexes. |
| **Observability** | 7/10 | ai_response_logs with prompt_version + context_hash is excellent. xp_events + energy_events provide good audit trails. edge_function_errors table exists. |
| **Risk Level** | 7/10 | Multiple XP write paths without universal idempotency. Legacy FK dependencies block cleanup. Community points disconnected from main economy. |
| **Technical Debt** | 7/10 | Legacy tables still exist with active FKs. daily_habit_logs coupled to deprecated tables. Business plan milestones duplicate pattern. 8 identical journey table schemas. |

**Overall: 6.5/10** — Strong ledger foundations but significant legacy baggage and scalability concerns.

---

## 10. RECOMMENDED RESTRUCTURE PLAN

### Phase 1: CRITICAL CLEANUP (Week 1-2)

**Goal:** Remove legacy coupling, prevent data integrity issues.

1. **Migrate `daily_habit_logs` FK** from `aurora_checklist_items` to `action_items`
   - Create migration to add `action_item_id` column
   - Backfill from legacy mapping
   - Drop old FK
   
2. **Freeze legacy tables** — Add `REVOKE INSERT, UPDATE ON aurora_checklists, aurora_checklist_items, aurora_daily_minimums FROM authenticated`
   
3. **Add idempotency to `award_unified_xp`** — Add optional `p_idempotency_key` parameter (matching `award_energy` pattern)

4. **Audit `useChecklists.tsx` and `useChecklistsData.tsx`** — Ensure they read from `action_items`, not legacy tables. If still reading legacy, redirect.

5. **Fix mini_milestone ↔ action_items sync** — When `check_milestone_from_minis` auto-completes a `life_plan_milestones` row, also UPDATE the corresponding `action_items` row to status='done'.

### Phase 2: SCALABILITY (Week 3-4)

**Goal:** Reduce `profiles` row contention, add indexes.

1. **Split hot columns from profiles** — Move `experience`, `level`, `tokens`, `session_streak`, `ego_state_usage` to a dedicated `user_stats` table with its own row lock scope.

2. **Add composite indexes** on:
   - `action_items (user_id, status, type, scheduled_date)`
   - `action_items (user_id, parent_id)`
   - `skill_xp_events (user_id, created_at)`
   - `messages (conversation_id, created_at)`
   - `xp_events (user_id, created_at)`

3. **Batch trigger operations** — Refactor `handle_action_item_completion` to batch skill XP awards in a single function call instead of N sequential `award_skill_xp` calls.

4. **Cap JSON growth** — Add validation triggers to limit `profiles.ego_state_usage` to top 20 entries and `action_items.metadata` to 10KB.

### Phase 3: CONSOLIDATION (Week 5-8)

**Goal:** Merge duplicates, reduce surface area.

1. **Merge journey tables** — Replace 8 identical `*_journeys` tables with a single `user_journeys` table with a `journey_type` column and `step_data JSONB`.

2. **Unify purchase systems** — Merge `orders`, `purchases`, `content_purchases` into a single `transactions` table with a `transaction_type` discriminator.

3. **Connect coach plans to action_items** — Add `generate-coach-actions` edge function that materializes `coach_client_plans.plan_data` into the client's `action_items`.

4. **Drop legacy tables** — After Phase 1 migration is proven stable, DROP `aurora_checklists`, `aurora_checklist_items`, `aurora_daily_minimums`.

5. **Deduplicate edge functions** — Verify `text-to-speech` vs `elevenlabs-tts` and remove the redundant one.

### FROZEN (Do Not Touch)

- `xp_events` / `energy_events` / `skill_xp_events` — These ledger tables are the SSOT. Never modify their schema.
- `award_unified_xp` / `award_energy` / `spend_energy` / `award_skill_xp` — These RPCs are the canonical write paths. Never bypass them.
- `guard_xp_direct_update` — This trigger enforces SSOT integrity. Never disable it.
- `profiles.id` as user identifier — All FKs reference this. Never change the PK strategy.

---

*End of audit.*
