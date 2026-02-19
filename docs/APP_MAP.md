# App Map — Single Source of Truth

> Generated: 2026-02-19 | Cleanup Pass v1

## Tab Structure

| Tab | Route | Component | Key Data |
|-----|-------|-----------|----------|
| **Dashboard** | `/dashboard` | `DashboardLayout > UserDashboard` | gameState, aurora, actionItems, lifePlans |
| **Projects** | `/projects` | `DashboardLayout > Projects` | user_projects, action_items |
| **Coaches** | `/coaches` | `CoachesLayoutWrapper` | practitioners, coaching_journeys, coach_client_plans |
| **Business** | `/business` | `Business` | business_journeys |
| **Admin** | `/admin-hub` | `DashboardLayout > AdminHub` | all admin tables |

## Active Routes

### Public
| Route | Component | Tab |
|-------|-----------|-----|
| `/` | `Index` | — |
| `/courses` | `Courses` | — |
| `/courses/:slug` | `CourseDetail` | — |
| `/courses/:slug/watch` | `CourseWatch` | — |
| `/subscriptions` | `Subscriptions` | — |
| `/install` | `Install` | — |
| `/audio/:token` | `AudioPlayer` | — |
| `/video/:token` | `VideoPlayer` | — |
| `/personal-hypnosis` | `PersonalHypnosisLanding` | — |
| `/consciousness-leap` | `ConsciousnessLeapLanding` | — |
| `/consciousness-leap/apply/:token` | `ConsciousnessLeapApply` | — |
| `/form/:token` | `FormView` | — |
| `/privacy-policy` | `PrivacyPolicy` | — |
| `/terms-of-service` | `TermsOfService` | — |
| `/affiliate-signup` | `AffiliateSignup` | — |
| `/onboarding` | `Onboarding` | — |
| `/go` | `Go` | — |
| `/practitioner/:slug` | `PractitionerProfile` | Coaches |
| `/practitioners/:slug` | `PractitionerProfile` | Coaches |
| `/lp/:slug` | `DynamicLandingPage` | — |
| `/unsubscribe` | `Unsubscribe` | — |

### Coach Storefront (`/p/:slug/*`)
| Route | Component | Tab |
|-------|-----------|-----|
| `/p/:slug` | `StorefrontLayout > StorefrontHome` | Coaches |
| `/p/:slug/login` | `StorefrontLogin` | Coaches |
| `/p/:slug/signup` | `StorefrontSignup` | Coaches |
| `/p/:slug/courses` | `StorefrontCourses` | Coaches |
| `/p/:slug/dashboard` | `StorefrontClientDashboard` | Coaches |

### Protected — Dashboard
| Route | Component | Tab |
|-------|-----------|-----|
| `/dashboard` | `DashboardLayout > UserDashboard` | Dashboard |
| `/launchpad/complete` | `LaunchpadComplete` | Dashboard |
| `/quests/:pillar` | `QuestRunnerPage` | Dashboard |
| `/personal-hypnosis/success` | `PersonalHypnosisSuccess` | Dashboard |
| `/personal-hypnosis/pending` | `PersonalHypnosisPending` | Dashboard |
| `/success` | `Success` | Dashboard |

### Protected — Projects
| Route | Component | Tab |
|-------|-----------|-----|
| `/projects` | `DashboardLayout > Projects` | Projects |

### Protected — Coaches
| Route | Component | Tab |
|-------|-----------|-----|
| `/coaches` | `CoachesLayoutWrapper` | Coaches |
| `/coaching/journey` | `CoachingJourney` | Coaches |
| `/coaching/journey/:journeyId` | `CoachingJourney` | Coaches |

### Protected — Business
| Route | Component | Tab |
|-------|-----------|-----|
| `/business` | `Business` | Business |
| `/business/journey` | `BusinessJourney` | Business |
| `/business/journey/:journeyId` | `BusinessJourney` | Business |
| `/business/:businessId` | `BusinessDashboard` | Business |

### Protected — Pillar Hubs
| Route | Component | Tab |
|-------|-----------|-----|
| `/consciousness` | `Consciousness` | Dashboard |
| `/health` | `Health` | Dashboard |
| `/health/journey` | `HealthJourney` | Dashboard |
| `/health/plan` | `HealthPlan` | Dashboard |
| `/relationships` | `Relationships` | Dashboard |
| `/relationships/journey` | `RelationshipsJourney` | Dashboard |
| `/finances` | `Finances` | Dashboard |
| `/finances/journey` | `FinancesJourney` | Dashboard |
| `/learning` | `Learning` | Dashboard |
| `/learning/journey` | `LearningJourney` | Dashboard |
| `/purpose` | `Purpose` | Dashboard |
| `/purpose/journey` | `PurposeJourney` | Dashboard |
| `/hobbies` | `Hobbies` | Dashboard |
| `/hobbies/journey` | `HobbiesJourney` | Dashboard |

### Protected — Community
| Route | Component | Tab |
|-------|-----------|-----|
| `/community` | `Community` | Dashboard |
| `/community/post/:id` | `CommunityPost` | Dashboard |
| `/community/events` | `CommunityEvents` | Dashboard |
| `/community/members` | `CommunityMembers` | Dashboard |
| `/community/leaderboard` | `CommunityLeaderboard` | Dashboard |
| `/community/profile/:userId` | `CommunityProfile` | Dashboard |

### Protected — Messages
| Route | Component | Tab |
|-------|-----------|-----|
| `/messages` | `Messages` | Dashboard |
| `/messages/ai` | `MessageThread` | Dashboard |
| `/messages/:conversationId` | `MessageThread` | Dashboard |

### Protected — Admin
| Route | Component | Tab |
|-------|-----------|-----|
| `/admin-hub` | `DashboardLayout > AdminHub` | Admin |

### Protected — Affiliate
| Route | Component | Tab |
|-------|-----------|-----|
| `/affiliate` | `AffiliatePanel > AffiliateDashboard` | — |
| `/affiliate/links` | `MyLinks` | — |
| `/affiliate/referrals` | `MyReferrals` | — |
| `/affiliate/payouts` | `MyPayouts` | — |

### Dev
| Route | Component | Tab |
|-------|-----------|-----|
| `/dev/orb-gallery` | `OrbGallery` | — |

## Redirect Routes (Legacy Safety Nets)
- `/signup`, `/login` → `/`
- `/today`, `/plan`, `/me` → `/dashboard`
- `/practitioners`, `/marketplace` → `/coaches`
- `/affiliate-dashboard` → `/affiliate`
- `/start`, `/free-journey`, `/free-journey/start` → `/onboarding`
- `/launchpad` → `/onboarding`
- `/quests` → `/onboarding`
- `/hypnosis` → `/dashboard`
- `/admin`, `/admin/*` → `/admin-hub`
- `/panel/*` → `/admin-hub` (with tab params)
- `/coach`, `/coach/*` → `/coaches`

## Key DB Tables by Domain

### Dashboard
- `profiles`, `action_items`, `life_plans`, `life_plan_milestones`
- `conversations`, `aurora_*` (memory, patterns, checklists, etc.)
- `hypnosis_sessions`, `user_projects`

### Coaches
- `practitioners`, `practitioner_services`, `practitioner_reviews`, `practitioner_specialties`
- `practitioner_settings`, `practitioner_availability`, `practitioner_client_profiles`
- `coaching_journeys`, `coach_client_plans`, `bookings`

### Business
- `business_journeys`, `business_plans`, `business_plan_milestones`
- `business_branding`, `business_orb_profiles`

### Admin
- `admin_notifications`, `analytics_reports`, `bug_reports`
- `offers`, `content_products`, `content_series`, `content_episodes`
- `community_*`, `testimonials`

### Affiliate
- `affiliates`, `affiliate_referrals`, `affiliate_payouts`

## Dead Code Removed (This Pass)
- ~40 dead lazy imports removed from App.tsx (admin pages handled by AdminHub's own lazy loading)
- Legacy panel pages moved to `src/legacy/` (see README there)
- Old `src/components/practitioners/` folder superseded by `src/components/coaches/`
- Old `PractitionersModalContext` superseded by `CoachesModalContext`

## Architecture Created (This Pass)
- `src/domain/coaches/` — Coach types + hook wrappers over practitioner DB
- `src/navigation/navConfig.ts` — Single source of truth for tab definitions
- `src/components/coaches/` — Renamed component folder with backward-compat aliases
- `src/contexts/CoachesModalContext.tsx` — Renamed context with backward-compat aliases
