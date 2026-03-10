# App Map — Single Source of Truth

> Updated: 2026-03-10 | Full cleanup pass

## Tab Structure (Bottom Nav)

| Tab | Route | Component | Position |
|-----|-------|-----------|----------|
| **FM** | `/fm/earn` | `FMAppShell > EarnLayoutWrapper` | Left |
| **Aurora** | `/aurora` | `AuroraPage` | Injected (special button) |
| **Play** | `/play` | `PlayLayoutWrapper > PlayHub` | Center (oversized icon) |
| **Community** | `/community` | `CommunityLayoutWrapper` | Right of center |
| **Study** | `/learn` | `LearnLayoutWrapper` | Right |

## Active Routes

### Public
| Route | Component |
|-------|-----------|
| `/` | `Index` |
| `/courses` | `Courses` |
| `/courses/:slug` | `CourseDetail` |
| `/courses/:slug/watch` | `CourseWatch` |
| `/subscriptions` | `Subscriptions` |
| `/install` | `Install` |
| `/audio/:token` | `AudioPlayer` |
| `/video/:token` | `VideoPlayer` |
| `/blog` | `Blog` |
| `/blog/:slug` | `BlogPost` |
| `/privacy-policy` | `PrivacyPolicy` |
| `/terms-of-service` | `TermsOfService` |
| `/affiliate-signup` | `AffiliateSignup` |
| `/onboarding` | `Onboarding` |
| `/ceremony` | `OnboardingCeremony` |
| `/go` | `Go` |
| `/features/:slug` | `FeatureDetailPage` |
| `/docs` | `Documentation` |
| `/unsubscribe` | `Unsubscribe` |
| `/p/:slug` | Coach storefront |

### Protected — App Shell
| Route | Component | Tab |
|-------|-----------|-----|
| `/play` | `PlayLayoutWrapper > PlayHub` | Play |
| `/aurora` | `AuroraPage` | Aurora |
| `/community` | `CommunityLayoutWrapper` | Community |
| `/community/post/:postId` | `CommunityThread` | Community |
| `/learn` | `LearnLayoutWrapper` | Study |
| `/profile` | `ProfilePage` | — |
| `/messages` | `Messages` | — |
| `/messages/:conversationId` | `MessageThread` | — |
| `/fm/*` | FM sub-routes (earn, work, wallet, cashout, bridge) | FM |
| `/coaches` | `CoachesLayoutWrapper` | — |
| `/admin-hub` | `AdminLayoutWrapper` | — (admin-only) |
| `/work` | `WorkLayoutWrapper` | — |
| `/business` | `BusinessIndexWrapper` | — |
| `/business/journey` | `BusinessJourneyWrapper` | — |
| `/business/:businessId` | `BusinessDashboardWrapper` | — |
| `/freelancer` | `FreelancerLayoutWrapper` | — |
| `/creator` | `CreatorLayoutWrapper` | — |
| `/therapist` | `TherapistLayoutWrapper` | — |
| `/quests/:pillar` | `QuestRunnerPage` | — |
| `/launchpad/complete` | `LaunchpadComplete` | — |
| `/success` | `Success` | — |

### Protected — Strategy (Pillar Assessments)
| Route Pattern | Domains |
|---------------|---------|
| `/strategy/:domain` | presence, power, vitality, focus, combat, expansion, consciousness |
| `/strategy/:domain/assess` | Chat-based assessment |
| `/strategy/:domain/results` | Assessment results |
| `/strategy/:domain/history` | Assessment history |
| `/strategy/:domain/scan` | Presence scan only |
| `/strategy/:arenaId/assess` | wealth, influence, relationships, business, projects, play |

### Protected — Journeys
| Route | Component |
|-------|-----------|
| `/coaching/journey` | `CoachingJourney` |
| `/admin/journey` | `AdminJourney` |
| `/projects/journey` | `ProjectsJourney` |

### Protected — Affiliate (role-gated)
| Route | Component |
|-------|-----------|
| `/affiliate` | `AffiliatePanel > AffiliateDashboard` |
| `/affiliate/links` | `MyLinks` |
| `/affiliate/referrals` | `MyReferrals` |
| `/affiliate/payouts` | `MyPayouts` |

### Dev
| Route | Component |
|-------|-----------|
| `/orbs` | `OrbGalleryPage` |
| `/dev/orb-gallery` | `OrbGallery` |

## Redirect Routes

| From | To |
|------|----|
| `/plan`, `/now`, `/today`, `/dashboard`, `/me`, `/tactics`, `/arena`, `/projects` | `/play` |
| `/life`, `/life/*` | `/play` |
| `/consciousness`, `/health/*`, `/relationships/*`, `/finances/*`, `/learning/*`, `/purpose/*`, `/hobbies/*` | `/play` |
| `/personal-hypnosis`, `/consciousness-leap`, `/consciousness-leap/apply/*`, `/form/*` | `/` |
| `/personal-hypnosis/success`, `/personal-hypnosis/pending` | `/play` |
| `/strategy` | `/play` |
| `/messages/ai` | `/aurora` |
| `/combat-community` | `/community` |
| `/signup`, `/login` | `/` |
| `/admin`, `/admin/*`, `/panel/*` | `/admin-hub` |
| `/coach`, `/coach/*`, `/practitioners`, `/marketplace` | `/coaches` |
| `/start`, `/free-journey/*` | `/onboarding` |
| `/affiliate-dashboard` | `/affiliate` |

## Deleted Pages (2026-03-10)

| File | Reason |
|------|--------|
| `FormView.tsx` | Unused, route → redirect |
| `PersonalHypnosisLanding.tsx` | Legacy product |
| `PersonalHypnosisSuccess.tsx` | Legacy product |
| `PersonalHypnosisPending.tsx` | Legacy product |
| `ConsciousnessLeapLanding.tsx` | Legacy product |
| `ConsciousnessLeapApply.tsx` | Legacy product |
| `DynamicLandingPage.tsx` | Unused landing system |

## Key Renames (2026-03-10)

| Old | New |
|-----|-----|
| `PlanHub.tsx` | `PlayHub.tsx` |
| `PlanLayoutWrapper.tsx` | `PlayLayoutWrapper.tsx` |
| Route `/plan` | Route `/play` |
| Nav id `plan` | Nav id `play` |

## Navigation Config

Single source of truth: `src/navigation/osNav.ts`
- `OS_TABS` — 4 visible tabs (FM, Play, Community, Study)
- Aurora injected by `BottomTabBar` between FM and Play
- `COACH_TAB` — nested under FM, not top-level
- `ADMIN_TAB` — app dropdown only, not bottom nav
