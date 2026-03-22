# App Map — Single Source of Truth

> Updated: 2026-03-22 | Avatar system + founding page updates

## Tab Structure (Bottom Nav)

| Tab | Route | Component | Position |
|-----|-------|-----------|----------|
| **FM** | `/fm` | `FMAppShell > FMMarketLayoutWrapper` | Left |
| **Aurora** | `/aurora` | `AuroraPage` | Injected (special button) |
| **Play** | `/play` | `PlayLayoutWrapper > PlayHub` | Center (oversized icon) |
| **Community** | `/community` | `CommunityLayoutWrapper` | Right of center |
| **Study** | `/learn` | `LearnLayoutWrapper` | Right |

## Active Routes

### Public
| Route | Component |
|-------|-----------|
| `/` | `Index` |
| `/founding` | `FoundingLanding` (with FoundingAvatarGroup — 5 random 3D avatars) |
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
| `/practitioner/:slug` | `CoachSlugRedirect` |
| `/orbs` | `OrbGalleryPage` |

### Protected — App Shell
| Route | Component | Tab |
|-------|-----------|-----|
| `/play` | `PlayLayoutWrapper > PlayHub` | Play |
| `/aurora` | `AuroraPage` | Aurora |
| `/community` | `CommunityLayoutWrapper` | Community |
| `/community/post/:postId` | `CommunityThread` | Community |
| `/learn` | `LearnLayoutWrapper` | Study |
| `/profile` | `ProfilePage` (modal, redirects to /play) | — |
| `/messages` | `Messages` | — |
| `/messages/:conversationId` | `MessageThread` | — |
| `/fm/*` | FM sub-routes (market, wallet, cashout, bridge) | FM |
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
| `/avatar` | `AvatarConfiguratorPage` | — (admin edit via profile) |

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

## Avatar System

| Component | File | Purpose |
|-----------|------|---------|
| `AvatarConfiguratorPage` | `src/pages/AvatarConfiguratorPage.tsx` | Full-page configurator, loads/saves to DB |
| `AvatarConfigurator` | `src/components/avatar/AvatarConfigurator.tsx` | Canvas + UI overlay |
| `AvatarModel` | `src/components/avatar/AvatarModel.tsx` | Armature + skinned mesh rendering |
| `AvatarConfiguratorUI` | `src/components/avatar/AvatarConfiguratorUI.tsx` | Sidebar: categories, assets, colors |
| `Asset` | `src/components/avatar/Asset.tsx` | Individual skinned mesh with color/skin |
| `AssetTilePreview` | `src/components/avatar/AssetTilePreview.tsx` | Asset thumbnail in sidebar |
| `AvatarMiniPreview` | `src/components/avatar/AvatarMiniPreview.tsx` | Small avatar in profile/nav/dropdown |
| `FoundingAvatarGroup` | `src/components/founding/FoundingAvatarGroup.tsx` | 5 random avatars with poses for founding page |
| `avatarStore` | `src/components/avatar/avatarStore.ts` | Zustand store: customization, randomize, save/load |
| `avatarAssets` | `src/components/avatar/avatarAssets.ts` | Static asset config (categories, GLB URLs, palettes) |
| `useUserAvatarData` | `src/hooks/useUserAvatarData.ts` | React Query hook: loads avatar_customizations from DB |
| `PlayerAvatar` | `src/components/community/PlayerAvatar.tsx` | Community avatar fallback (letter-based) |

**DB Table:** `avatar_customizations` — stores `customization_data` (JSON) per `user_id`

**Essential categories** (never null in randomize): Face, Top, Shoes, Eyes, Head, Bottom

## Identity Layers

| Layer | Internal Name | Purpose | Status |
|-------|---------------|---------|--------|
| **DNA** | `computeDNA` | Single source of truth for identity structure (archetype, egoState, traits) | Active |
| **AION** | `Aurora (engine)` | User-facing identity abstraction — the "Future Self" with personal name | Active |
| **Orb** | `MorphOrb` | Pure visual renderer for AION. Receives params from `mapDNAtoVisual` | Active |
| **Aurora** | `Aurora` | AI engine powering AION (chat, commands, suggestions, proactive) | Active |
| **Avatar** | `AvatarConfigurator` | User-customizable 3D character body. Future game body | Active |
| **SoulAvatar** | `SoulAvatar` | Legacy NFT minting, being absorbed into AION NFT | Legacy |

## Redirect Routes

| From | To |
|------|----|
| `/plan`, `/now`, `/today`, `/dashboard`, `/me`, `/tactics`, `/arena`, `/projects` | `/play` |
| `/life`, `/life/*` | `/play` |
| `/consciousness`, `/health/*`, `/relationships/*`, `/finances/*`, `/learning/*`, `/purpose/*`, `/hobbies/*` | `/play` |
| `/personal-hypnosis`, `/consciousness-leap`, `/consciousness-leap/apply/*`, `/form/*` | `/` |
| `/personal-hypnosis/success`, `/personal-hypnosis/pending` | `/play` |
| `/strategy` | `/play` |
| `/profile` | `/play` |
| `/messages/ai` | `/aurora` |
| `/combat-community` | `/community` |
| `/signup`, `/login` | `/` |
| `/admin`, `/admin/*`, `/panel/*` | `/admin-hub` |
| `/coach`, `/coach/*`, `/practitioners`, `/marketplace` | `/coaches` |
| `/start`, `/free-journey/*` | `/onboarding` |
| `/affiliate-dashboard` | `/affiliate` |
| `/arena/:domainId/*` | `/strategy/:domainId` |
| `/fm/home`, `/fm/earn`, `/fm/market`, `/fm/work`, `/fm/share`, `/fm/contribute`, `/fm/wallet` | `/fm` |
| `/fm/coaches` | `/coaches` |

## Navigation Config

Single source of truth: `src/navigation/osNav.ts`
- `OS_TABS` — 4 visible tabs (FM, Play, Community, Study)
- Aurora injected by `BottomTabBar` between FM and Play
- `COACH_TAB` — nested under FM, not top-level
- `ADMIN_TAB` — app dropdown only, not bottom nav

## Key Contexts

| Context | Purpose |
|---------|---------|
| `AuthContext` | User auth state, login/logout, admin flag |
| `AuthModalContext` | Web3Auth modal open/close |
| `AuroraChatContext` | AION chat state, messages, send/receive |
| `AuroraActionsContext` | AION autonomous actions and trust levels |
| `GameStateContext` | XP, tokens, level, streaks, gamification |
| `LanguageContext` | i18n language and RTL management |
| `SmartOnboardingContext` | Onboarding progress and smart navigation |
| `ProfileModalContext` | Profile modal open/close state |
| `SoulAvatarContext` | NFT minting state (legacy) |
| `CoachesModalContext` | Coaches browsing modal state |
| `SubscriptionsModalContext` | Subscription upsell modal state |
| `WalletModalContext` | Wallet modal open/close |
| `SidebarContext` | Sidebar collapsed/expanded state |
| `WelcomeGateContext` | Welcome gate / first-visit state |
| `ChromeVisibilityContext` | Header/footer/sidebar visibility |
