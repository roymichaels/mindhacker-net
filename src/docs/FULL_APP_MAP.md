# MIND OS — Full App Map

> Generated: 2026-03-03

---

## Architecture

```
ProtectedAppShell (Auth Gate)
├── Header + TopNav
├── Dynamic Hub Sidebars (SidebarContext)
├── BottomTabBar (5 tabs)
└── Aurora Chat Dock

Global Providers:
  AuthProvider → LanguageProvider (HE/EN) → AuthModalProvider → GameStateProvider
  → SubscriptionsModalProvider → CoachesModalProvider → AuroraChatProvider
  → ThemeProvider → React Query → FlowAuditProvider → AnalyticsProvider
```

---

## Bottom Tab Bar (5 Tabs)

| Tab | Route | Icon | Label HE | Label EN |
|-----|-------|------|----------|----------|
| **Dashboard** | `/dashboard` | LayoutDashboard | דאשבורד | Dashboard |
| **Core** (ליבה) | `/life` | Flame | ליבה | Core |
| **Arena** (זירה) | `/arena` | Swords | זירה | Arena |
| **Community** | `/community` | Crosshair | קומיוניטי | Community |
| **Study** | `/learn` | GraduationCap | לימוד | Study |

**Role-gated (not in bottom tab bar):**
- **Coaches** `/coaches` — `practitioner` role only
- **Admin** `/admin-hub` — `admin` role, accessed via app dropdown

---

## Hub: Dashboard (`/dashboard`)

| Feature | Key Tables |
|---------|-----------|
| User Orb + Game State | `profiles`, `life_domains` |
| Action Items / Today Queue | `action_items`, `v_today_actions` |
| Life Plans + Missions | `life_plans`, `plan_missions`, `life_plan_milestones`, `mini_milestones` |
| Aurora Memory | `aurora_conversation_memory`, `aurora_behavioral_patterns` |
| Daily Habits | `aurora_daily_minimums`, `aurora_checklists` |
| Hypnosis Sessions | `hypnosis_sessions` |
| Messages | `conversations` |

### Dashboard Routes

| Route | Component |
|-------|-----------|
| `/dashboard` | `DashboardLayoutWrapper` |
| `/launchpad/complete` | `LaunchpadComplete` |
| `/quests/:pillar` | `QuestRunnerPage` |
| `/personal-hypnosis/success` | `PersonalHypnosisSuccess` |
| `/personal-hypnosis/pending` | `PersonalHypnosisPending` |
| `/success` | `Success` |

---

## Hub: Core — `/life` (Internal Development)

7 Pillars, each with: Home → Assess → Results → History

| Pillar | Route | Assessment Type |
|--------|-------|----------------|
| **Presence** (נוכחות) | `/life/presence/*` | Scan + Chat |
| **Power** (עוצמה) | `/life/power/*` | Chat |
| **Vitality** (חיוניות) | `/life/vitality/*` | Chat + Intake |
| **Focus** (פוקוס) | `/life/focus/*` | Chat |
| **Combat** (לחימה) | `/life/combat/*` | Chat |
| **Expansion** (התרחבות) | `/life/expansion/*` | Chat |
| **Consciousness** (תודעה) | `/life/consciousness/*` | Dedicated assess |

### Core Routes

| Route | Component |
|-------|-----------|
| `/life` | `LifeLayoutWrapper` |
| `/life/presence` | `PresenceHome` |
| `/life/presence/scan` | `PresenceScan` |
| `/life/presence/analyzing` | `PresenceAnalyzing` |
| `/life/presence/results` | `PresenceResultsPage` |
| `/life/presence/assess` | `PresenceChatAssess` |
| `/life/presence/chat-results` | `PresenceChatResults` |
| `/life/presence/history` | `PresenceHistory` |
| `/life/power` | `PowerHome` |
| `/life/power/assess` | `PowerChatAssess` |
| `/life/power/chat-results` | `PowerChatResults` |
| `/life/power/results` | `PowerResultsPage` |
| `/life/power/history` | `PowerHistory` |
| `/life/vitality` | `VitalityHome` |
| `/life/vitality/assess` | `VitalityChatAssess` |
| `/life/vitality/chat-results` | `VitalityChatResults` |
| `/life/vitality/intake` | `VitalityIntake` |
| `/life/vitality/results` | `VitalityResults` |
| `/life/vitality/history` | `VitalityHistory` |
| `/life/focus` | `FocusHome` |
| `/life/focus/assess` | `FocusChatAssess` |
| `/life/focus/chat-results` | `FocusChatResults` |
| `/life/focus/results` | `FocusResults` |
| `/life/focus/history` | `FocusHistory` |
| `/life/combat` | `CombatHome` |
| `/life/combat/assess` | `CombatChatAssess` |
| `/life/combat/chat-results` | `CombatChatResults` |
| `/life/combat/results` | `CombatResults` |
| `/life/combat/history` | `CombatHistory` |
| `/life/expansion` | `ExpansionHome` |
| `/life/expansion/assess` | `ExpansionChatAssess` |
| `/life/expansion/chat-results` | `ExpansionChatResults` |
| `/life/expansion/results` | `ExpansionResults` |
| `/life/expansion/history` | `ExpansionHistory` |
| `/life/consciousness` | `ConsciousnessHome` |
| `/life/consciousness/assess` | `ConsciousnessAssess` |
| `/life/consciousness/results` | `ConsciousnessResults` |
| `/life/consciousness/history` | `ConsciousnessHistory` |
| `/life/:domainId` | `LifeDomainPage` (catch-all) |

---

## Hub: Arena — `/arena` (External Execution)

6 Domains, each with: Assess → Results

| Domain | Route |
|--------|-------|
| **Wealth** | `/arena/wealth/*` |
| **Influence** | `/arena/influence/*` |
| **Relationships** | `/arena/relationships/*` |
| **Business** | `/arena/business/*` |
| **Projects** | `/arena/projects/*` |
| **Play** | `/arena/play/*` |

### Arena Routes

| Route | Component |
|-------|-----------|
| `/arena` | `ArenaLayoutWrapper` |
| `/arena/wealth/assess` | `WealthAssess` |
| `/arena/wealth/results` | `WealthResults` |
| `/arena/influence/assess` | `InfluenceAssess` |
| `/arena/influence/results` | `InfluenceResults` |
| `/arena/relationships/assess` | `RelationshipsAssess` |
| `/arena/relationships/results` | `RelationshipsResults` |
| `/arena/business/assess` | `BusinessAssess` |
| `/arena/business/results` | `BusinessResults` |
| `/arena/projects/assess` | `ProjectsAssess` |
| `/arena/projects/results` | `ProjectsResults` |
| `/arena/play/assess` | `PlayAssess` |
| `/arena/play/results` | `PlayResults` |
| `/arena/:domainId` | `ArenaDomainPage` (catch-all) |

---

## Hub: Community — `/community`

| Route | Component | Feature |
|-------|-----------|---------|
| `/community` | `CommunityLayoutWrapper` | Feed, Posts, Categories |
| `/community/events` | (internal) | Events + RSVP |
| `/community/members` | (internal) | Member directory |
| `/community/leaderboard` | (internal) | Points + Levels |
| `/community/profile/:userId` | (internal) | Member profile |
| `/community/post/:id` | (internal) | Single post |

**Tables:** `community_posts`, `community_comments`, `community_likes`, `community_events`, `community_event_rsvps`, `community_members`, `community_levels`, `community_point_logs`, `community_categories`

---

## Hub: Study — `/learn`

| Feature | Details |
|---------|---------|
| Curriculum Wizard | AI chat → generates ~50 lesson skeleton |
| Lazy Content Gen | Lesson body generated on-demand via `generate-curriculum` edge fn |
| Brain Context | Pulls from 11+ tables for personalization (profiles, life_domains, hypnosis_sessions, onboarding, etc.) |

---

## Coaches — `/coaches` (practitioner role)

| Route | Component | Feature |
|-------|-----------|---------|
| `/coaches` | `CoachesLayoutWrapper` | Coach hub (Overview, Clients, Plans, Marketing, Landing Pages, Settings) |
| `/coaching/journey` | `CoachingJourney` | Coaching setup journey (10 steps) |
| `/coaching/journey/:journeyId` | `CoachingJourney` | Resume journey |

### Coach Sub-routes (sidebar)
`overview` · `clients` · `plans` · `marketing` · `landing-pages` · `settings`

### Coach Public Storefront (`/p/:slug`)
- `/p/:slug` — StorefrontHome
- `/p/:slug/login` — StorefrontLogin
- `/p/:slug/signup` — StorefrontSignup
- `/p/:slug/courses` — StorefrontCourses
- `/p/:slug/dashboard` — StorefrontClientDashboard

**Tables:** `practitioners`, `practitioner_services`, `practitioner_reviews`, `practitioner_specialties`, `practitioner_settings`, `practitioner_availability`, `practitioner_client_profiles`, `coaching_journeys`, `coach_client_plans`, `coach_landing_pages`, `coach_leads`, `bookings`

**Domain layer:** `src/domain/coaches/` (types, hooks, mappers — wraps `practitioners` DB)

---

## Business — `/business`

| Route | Component | Feature |
|-------|-----------|---------|
| `/business` | `Business` | Business listing |
| `/business/journey` | `BusinessJourney` | Business setup journey (10 steps) |
| `/business/journey/:journeyId` | `BusinessJourney` | Resume journey |
| `/business/:businessId` | `BusinessDashboard` | Business dashboard |

**Tables:** `business_journeys`, `business_plans`, `business_plan_milestones`, `business_branding`, `business_orb_profiles`

---

## Admin — `/admin-hub` (admin role)

### Admin Sub-tabs (sidebar)
`overview` · `admin` · `campaigns` · `content` · `site` · `system`

**Tables:** `admin_notifications`, `admin_journeys`, `analytics_reports`, `bug_reports`, `offers`, `content_products`, `content_series`, `content_episodes`, `testimonials`, `chat_assistant_settings`, `chat_knowledge_base`

**Domain layer:** `src/domain/admin/` (types, hooks, tab config)

---

## Messages — `/messages`

| Route | Component |
|-------|-----------|
| `/messages` | `Messages` (conversation list) |
| `/messages/ai` | `MessageThread` (Aurora AI thread) |
| `/messages/:conversationId` | `MessageThread` |

---

## Public Routes (No Auth Required)

| Route | Page |
|-------|------|
| `/` | Index (landing page) |
| `/courses` | Course catalog |
| `/courses/:slug` | Course detail |
| `/courses/:slug/watch` | Course player |
| `/subscriptions` | Pricing / plans |
| `/onboarding` | Onboarding flow |
| `/go` | Ad landing page |
| `/features/:slug` | Feature detail page |
| `/personal-hypnosis` | Personal Hypnosis landing |
| `/consciousness-leap` | Consciousness Leap funnel |
| `/consciousness-leap/apply/:token` | CL application form |
| `/lp/:slug` | Dynamic landing pages |
| `/affiliate-signup` | Affiliate signup |
| `/install` | PWA install page |
| `/form/:token` | Public form view |
| `/audio/:token` | Audio player (token-gated) |
| `/video/:token` | Video player (token-gated) |
| `/privacy-policy` | Privacy policy |
| `/terms-of-service` | Terms of service |
| `/unsubscribe` | Email unsubscribe |
| `/practitioner/:slug` | Redirects → `/p/:slug` |
| `/practitioners/:slug` | Redirects → `/p/:slug` |

---

## Affiliate Panel — `/affiliate` (affiliate role)

| Route | Component |
|-------|-----------|
| `/affiliate` | `AffiliateDashboard` |
| `/affiliate/links` | `MyLinks` |
| `/affiliate/referrals` | `MyReferrals` |
| `/affiliate/payouts` | `MyPayouts` |

**Tables:** `affiliates`, `affiliate_referrals`, `affiliate_payouts`

---

## Edge Functions (56 total)

### Aurora AI
| Function | Purpose |
|----------|---------|
| `aurora-chat` | Main Aurora conversation |
| `aurora-analyze` | Analyze user context |
| `aurora-proactive` | Proactive nudges |
| `aurora-recalibrate` | Recalibrate user model |
| `aurora-summarize-conversation` | Summarize chat |
| `aurora-generate-title` | Auto-title conversations |

### Generation
| Function | Purpose |
|----------|---------|
| `generate-curriculum` | Study bootcamp (skeleton + lazy content) |
| `generate-90day-strategy` | 90-day life strategy |
| `generate-business-plan` | Business plan from journey |
| `generate-coach-plan` | Coach client plan |
| `generate-daily-quests` | Daily quest generation |
| `generate-execution-steps` | Execution step breakdown |
| `generate-first-week-actions` | First week action plan |
| `generate-health-plan` | Health/vitality plan |
| `generate-hypnosis-script` | Personalized hypnosis |
| `generate-identity-archetype` | Identity archetype |
| `generate-landing-page` | AI landing page |
| `generate-launchpad-summary` | Onboarding summary |
| `generate-phase-actions` | Phase-specific actions |
| `generate-pillar-synthesis` | Pillar synthesis report |
| `generate-today-queue` | Today's action queue |
| `generate-weekly-build` | Weekly build plan |
| `generate-branding-suggestions` | Brand suggestions |
| `generate-analytics-report` | Analytics report |

### Assessment
| Function | Purpose |
|----------|---------|
| `domain-assess` | Domain assessment (all pillars) |
| `consciousness-assess` | Consciousness-specific assessment |
| `analyze-life-plan` | Life plan analysis |
| `analyze-presence` | Presence scan analysis |
| `analyze-introspection-form` | Introspection form analysis |

### Payments (Stripe)
| Function | Purpose |
|----------|---------|
| `create-checkout-session` | Stripe checkout |
| `create-coach-checkout` | Coach-specific checkout |
| `customer-portal` | Stripe customer portal |
| `check-subscription` | Verify subscription status |
| `stripe-webhook` | Stripe webhook handler |

### Email
| Function | Purpose |
|----------|---------|
| `send-welcome-email` | Welcome email |
| `send-newsletter` | Newsletter dispatch |
| `send-order-confirmation` | Order confirmation |
| `send-order-notification` | Admin order notification |
| `send-form-pdf-email` | Form PDF email |

### Media
| Function | Purpose |
|----------|---------|
| `ai-hypnosis` | AI hypnosis generation |
| `cache-hypnosis-audio` | Cache audio files |
| `elevenlabs-tts` | ElevenLabs TTS |
| `elevenlabs-transcribe` | ElevenLabs transcription |
| `text-to-speech` | Generic TTS |
| `get-audio-by-token` | Token-gated audio |
| `get-video-by-token` | Token-gated video |

### Leads & Funnels
| Function | Purpose |
|----------|---------|
| `submit-lead` | Generic lead capture |
| `submit-consciousness-leap-lead` | CL lead capture |
| `submit-consciousness-leap-application` | CL application |
| `validate-consciousness-leap-token` | CL token validation |

### Misc
| Function | Purpose |
|----------|---------|
| `onboarding-chat` | Onboarding AI chat |
| `push-notifications` | Push notification dispatch |
| `add-plate-item` | Add item to user plate |
| `get-user-data` | Fetch user data bundle |

---

## Contexts (9)

| Context | Purpose |
|---------|---------|
| `AuthContext` | Auth state, user session |
| `AuroraChatContext` | Aurora chat state, messages |
| `AuroraActionsContext` | Aurora action execution |
| `AuthModalContext` | Login/signup modal state |
| `CoachesModalContext` | Coach-related modals |
| `GameStateContext` | XP, tokens, level, streaks |
| `LanguageContext` | HE/EN language toggle |
| `SidebarContext` | Dynamic sidebar injection per hub |
| `SubscriptionsModalContext` | Subscription paywall modal |

---

## Services (6)

| Service | Purpose |
|---------|---------|
| `actionItems` | CRUD for action items |
| `hypnosis` | Hypnosis session management |
| `scheduleBlocks` | Schedule/time blocking |
| `unifiedContext` | Aggregate user context for AI |
| `userMemory` | Aurora memory persistence |
| `voice` | Voice recording/playback |

---

## Domain Layers

| Domain | Path | Purpose |
|--------|------|---------|
| `coaches` | `src/domain/coaches/` | Types, hooks, mappers wrapping `practitioners` DB |
| `admin` | `src/domain/admin/` | Admin types, hooks, tab config |

---

## Navigation Config

**Source of truth:** `src/navigation/osNav.ts`

- `OS_TABS` — 5 main tabs (Dashboard, Core, Arena, Community, Study)
- `COACH_TAB` — Appended for `practitioner` role
- `ADMIN_TAB` — App dropdown only (not in bottom bar)
- `COACH_SUB_ROUTES` — 6 sidebar sub-routes
- `ADMIN_SUB_ROUTES` — 6 sidebar sub-routes
- `getVisibleTabs()` — Builds visible tab array by role

---

## Hooks (80+)

### Aurora Hooks (`src/hooks/aurora/`)
`useAuroraChat`, `useChecklistsData`, `useChecklists`, `useDailyHabits`, `useLifeModel`, `useDashboard`, `useOnboardingProgress`, `useAuroraVoice`, `useAuroraReminders`, `useSmartSuggestions`, `useCommandBus`

### Core Hooks (`src/hooks/`)
`useActionItems`, `useGameState`, `useLifePlan`, `useLifeDomains`, `useMissionsRoadmap`, `useStrategyPlans`, `useDomainAssessment`, `useSkillsProgress`, `useTodayExecution`, `useTodaysHabits`, `useDailyPriorities`, `useDailyPulse`, `useNowEngine`, `useWeeklyActivity`, `useUnifiedDashboard`, `useUserProfile`, `useUserRoles`, `useUserPlate`, `useUserPurchases`, `useUserNotifications`, `usePillarAccess`, `usePillarContext`, `useTranslation`, `useGenderedTranslation`, `useSubscriptionGate`, `useSiteSettings`, `useThemeSettings`, `useAnalytics`, `useConversionEvents`, `useSEO`, `usePWA`, `usePushNotifications`, `useHaptics`, `useModalState`, `usePullToRefresh`, `useStorageUrl`, `usePromoPopup`, `useUTMTracker`, `useGuestDataMigration`, `useGuestLaunchpadAutoSave`, `useGuestLaunchpadProgress`, `useGuestPDF`, `useLaunchpadAutoSave`, `useLaunchpadData`, `useLaunchpadProgress`, `useAllDomainsComplete`, `useUpdateEnrollmentProgress`, `useUserJob`

### Coach Hooks
`usePractitioners`, `useCoachClients`, `useCoachClientView`, `useCoachLeads`, `useCoachingJourneyProgress`

### Business Hooks
`useBusinessJourneys`, `useBusinessJourneyProgress`, `useBusinessPlan`, `useBusinessBranding`, `useBusinessOrbProfile`, `useProductBranding`

### Pillar Coach Hooks
`useCombatCoach`, `useConsciousnessCoach`, `useExpansionCoach`, `useFocusCoach`, `usePresenceCoach`, `useVitalityEngine`

### Admin Hooks
`useAdminAuroraInsights`, `useAdminJourneyProgress`, `useAdminNotifications`, `useAdminUserView`

### Other
`useBugReport`, `useCommunityDailyLimit`, `useCommunityFeed`, `useCommunityUsername`, `useDailyHypnosis`, `useEpisodeProgress`, `useLiveOrbProfile`, `useOrbProfile`, `useOrbPresetMorph`, `usePresenceScans`, `useProfilePDF`, `useProjects`, `useProjectsJourneyProgress`, `useCommandSchedule`

---

## Legacy Redirects (~40+)

| From | To |
|------|----|
| `/signup`, `/login` | `/` |
| `/today`, `/plan`, `/me` | `/dashboard` |
| `/aurora` | `/messages/ai` |
| `/projects` | `/arena` |
| `/practitioners`, `/marketplace` | `/coaches` |
| `/coach`, `/coach/*` | `/coaches` |
| `/start`, `/free-journey`, `/free-journey/start` | `/onboarding` |
| `/launchpad`, `/quests` | `/onboarding` |
| `/hypnosis` | `/dashboard` |
| `/consciousness`, `/health`, `/relationships`, `/finances`, `/learning`, `/purpose`, `/hobbies` | `/life` |
| `/life/wealth`, `/life/influence`, `/life/relationships` | `/arena/*` |
| `/admin`, `/admin/*` | `/admin-hub` |
| `/panel/*` (20+ routes) | `/admin-hub?tab=...&sub=...` |
| `/affiliate-dashboard` | `/affiliate` |
| `/combat-community` | `/community` |

---

## Component Directories (50+)

`admin-journey`, `admin`, `arena`, `aurora-ui`, `aurora`, `auth`, `bug-report`, `business-hub`, `business-journey`, `business`, `checkout`, `coach`, `coaches`, `coaching-journey`, `community`, `course-watch`, `courses`, `dashboard`, `domain-assess`, `energy`, `execution`, `flow`, `gamification`, `home`, `hub-shared`, `hubs`, `hypnosis`, `icons`, `journey-shared`, `landing`, `launchpad`, `layout`, `learn`, `life`, `messages`, `missions`, `modals`, `navigation`, `onboarding`, `orb`, `panel`, `pdf`, `pillars`, `plate`, `practitioner-landing`, `presence`, `profile`, `projects-journey`, `projects`, `settings`, `sidebar`, `subscription`, `ui`

---

## Dev Routes

| Route | Component |
|-------|-----------|
| `/dev/orb-gallery` | `OrbGallery` |

---

## Key Architecture Patterns

1. **ProtectedAppShell** — Single auth gate + layout shell for all protected routes
2. **Hub Sidebars** — Injected dynamically via `SidebarContext` + `useSidebars()`
3. **FlowSpec Engine** — One-question-per-screen micro-flows for onboarding/quests
4. **Lazy Generation** — Study bootcamp generates skeleton first, content on-demand
5. **Brain Context** — AI pulls from 11+ tables for personalization
6. **Domain Layers** — `src/domain/coaches/` and `src/domain/admin/` abstract DB access
7. **Bilingual (HE/EN)** — `useTranslation()` + `labelEn`/`labelHe` on all nav items
8. **3-Layer Mission Hierarchy** — Missions → Milestones → Mini-milestones (75 daily actions per pillar)
9. **Core/Arena Split** — Internal development vs external execution at routing level
