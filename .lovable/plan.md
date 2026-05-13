Inventory of every page, modal, and inner tab currently shipping in Mind OS.
Grouped by surface. Routes are the URL paths registered in `src/App.tsx`.

## A. Public / marketing routes

| Route | Page file |
|---|---|
| `/` `/index` `/home` | `pages/Index.tsx` (homepage) |
| `/founding` | `FoundingLanding.tsx` |
| `/landing` | landing page renderer |
| `/blog` `/blog/:slug` | `Blog.tsx`, `BlogPost.tsx` |
| `/docs` | `Documentation.tsx` |
| `/features/:slug` | `FeatureDetailPage.tsx` |
| `/install` | `Install.tsx` (PWA install) |
| `/privacy-policy` | `PrivacyPolicy.tsx` |
| `/terms-of-service` | `TermsOfService.tsx` |
| `/unsubscribe` | `Unsubscribe.tsx` |
| `/affiliate-signup` | `AffiliateSignup.tsx` |
| `/practitioner/:slug`, `/practitioners/:slug`, `/coach/:slug`, `/therapist` | `PractitionerProfile.tsx` |
| `/success` | `Success.tsx` (post-checkout) |

## B. Auth / onboarding

| Route | Page file |
|---|---|
| `/onboarding` | onboarding flow |
| `/ceremony` | `OnboardingCeremony.tsx` |
| `/launchpad/complete` | `LaunchpadComplete.tsx` |
| `/avatar` | `AvatarConfiguratorPage.tsx` |

## C. Core app shell (ProtectedAppShellV2)

| Route | Page file | Notes |
|---|---|---|
| `/aurora` | `AuroraPage.tsx` | AION chat |
| `/brain` | `BrainPage.tsx` | Memory graph |
| `/hallway`, `/hallway/:slug` | hallway shell | Rooms below |
| `/dashboard` | `UserDashboard.tsx` | |
| `/profile` `/profile-hub` | `ProfilePage.tsx` | Tabs below |
| `/messages` `/messages/:conversationId` | `Messages.tsx`, `MessageThread.tsx` |
| `/community` `/community/post/:postId` | `Community.tsx`, `CommunityThread.tsx` |
| `/journal` `/journal-hub` | `JournalingHub.tsx` (+ MindOS Journal) |
| `/play` `/play-hub` `/now` | `PlayHub.tsx` (Today / Mission Control tabs) |
| `/work` `/work-hub` | `WorkHub.tsx` (Timer / Log / Stats tabs) |
| `/strategy` `/plan` `/life-plan` | `StrategyPage.tsx` |
| `/life` | `LifeHub.tsx` |
| `/arena` `/arena/:domainId/*` | `ArenaHub.tsx`, `ArenaDomainPage.tsx` |
| `/quests/:pillar` | `QuestRunnerPage.tsx` |
| `/orbs` `/dev/orb-gallery` | `OrbGallery.tsx` |

## D. Hallway rooms (`src/hallway/rooms.ts`)

beliefs · emotions & energy · inner characters (parts) · time & memory · identity & roles · body & soma.

## E. MindOS workspace

| Route | Page |
|---|---|
| `/mindos` | `MindOSPage.tsx` (entry) |
| `/mindos/chat` | `MindOS/ChatPage.tsx` |
| `/mindos/journal` | `MindOS/JournalPage.tsx` (Dream / Reflection / Gratitude tabs) |
| `/mindos/strategy` | `MindOS/StrategyPage.tsx` |
| `/mindos/tactics` | `MindOS/TacticsPage.tsx` |
| `/mindos/work` | `MindOS/WorkPage.tsx` |

## F. Strategy / pillar assessment routes

For each pillar: `home → assess → results → history` (+ `chat-assess`, `chat-results` where present).

| Pillar | Routes |
|---|---|
| Combat | `/strategy/combat`, `/assess`, `/results`, `/chat-results`, `/history` |
| Power | `/strategy/power`, `/assess`, `/results`, `/chat-results`, `/history` |
| Focus | `/strategy/focus`, `/assess`, `/results`, `/chat-results`, `/history` |
| Expansion | `/strategy/expansion`, `/assess`, `/results`, `/chat-results`, `/history` |
| Vitality | `/strategy/vitality`, `/intake`, `/assess`, `/results`, `/chat-results`, `/history` |
| Presence | `/strategy/presence`, `/scan`, `/analyzing`, `/assess`, `/results`, `/chat-results`, `/history` |
| Consciousness | `/strategy/consciousness`, `/assess`, `/results`, `/history` |
| Business | `/strategy/business/assess`, `/results` |
| Wealth | `/strategy/wealth/assess`, `/results` |
| Influence | `/strategy/influence/assess`, `/results` |
| Projects | `/strategy/projects/assess`, `/results` |
| Relationships | `/strategy/relationships/assess`, `/results` |
| Play | `/strategy/play/assess`, `/results` |
| Generic | `/strategy/:domainId` |

## G. Career / outer-world hubs

| Route | Page |
|---|---|
| `/outer-world` | `OuterWorldHub.tsx` (FM, Services, Coaches, Therapists, Learn, Community, Messages, Creator, Freelancer, Business, Affiliate, Wallet) |
| `/career` | `CareerHub.tsx` (tabs vary by career path — see below) |
| `/coach-hub` | `CoachHub.tsx` |
| `/coaches` | `Coaches.tsx` |
| `/coaching/journey`, `/coaching/journey/:journeyId` | `CoachingJourney.tsx` |
| `/business`, `/business/:businessId` | `Business.tsx`, `BusinessDashboard.tsx` |
| `/business/journey`, `/:journeyId` | `BusinessJourney.tsx` |
| `/projects/journey`, `/:journeyId` | `ProjectsJourney.tsx` |
| `/admin/journey`, `/:journeyId` | `AdminJourney.tsx` |
| `/freelancer` `/freelancer-hub` | `Freelancer.tsx`, `FreelancerHub.tsx` |
| `/creator` `/creator-hub` | `Creator.tsx`, `CreatorHub.tsx` |
| `/learn` `/courses` `/courses/:slug` `/courses/:slug/watch` | `Learn.tsx`, `Courses.tsx`, `CourseDetail.tsx`, `CourseWatch.tsx` |

### Career hub tabs (`CareerHub.tsx`, per `careerPath`)
- **Coach**: Dashboard · Clients · Leads · Products · Content · Plans · Marketing · Analytics · Landing Pages · Settings
- **Therapist**: Dashboard · Clients · Leads · Services · Content · Plans · Marketing · Analytics · Landing Pages · Settings
- **Freelancer**: Dashboard · Gigs · Projects · Clients · Portfolio · Products · Content · Earnings · Marketing · Analytics · Settings
- **Creator**: Dashboard · Courses · Products · Content · Clients · Marketing · Analytics · Landing Pages · Settings
- **Business**: Dashboard · Clients · Leads · Products · Content · Marketing · Analytics · Landing Pages · Settings

## H. Free Market

| Route | Page |
|---|---|
| `/fm` | `fm/FMMarket.tsx` |
| `/fm/bridge` | `fm/FMBridge.tsx` |
| `/fm/cashout` | `fm/FMCashout.tsx` |

## I. Affiliate panel (`/panel/...`)

Dashboard · `links` · `payouts` · `referrals` (`AffiliateDashboard`, `MyLinks`, `MyPayouts`, `MyReferrals`).

## J. Hypnosis / media

`/hypnosis` (`HypnosisPage.tsx`), `/audio/:token` (`AudioPlayer.tsx`), `/video/:token` (`VideoPlayer.tsx`).

## K. Subscriptions / checkout

`/subscriptions` (`Subscriptions.tsx`), `/go` (`Go.tsx`).

## L. Admin (`/admin-hub`) — tabs from `domain/admin/tabConfig.ts`

| Tab | Sub-tabs |
|---|---|
| Overview | Dashboard · Analytics · Notifications |
| Admin | Users · Coaches · Leads · Businesses · Insights · FM Bounties · Work Monitor · Career Apps |
| Campaigns | Affiliates · Newsletter · Offers · Purchases |
| Content | Products · Blog · Content · Videos · Recordings · Forms |
| Site | Landing Pages · Homepage · Theme · FAQs · Testimonials |
| System | Bug Reports · Chat Assistant · Template Coverage · Settings |

## M. Profile page tabs (`components/profile/ProfileTabs.tsx`)

Profile · AION · Activity · Purchases · Settings · Avatar/Wand (variants gated by feature flag).

## N. Settings modal tabs (`components/settings/SettingsModal.tsx`)

Profile · Aurora · Energy · Appearance · Account.

## O. Global / context-driven modals

(Each owned by a context provider and openable from anywhere.)

- **AuthModal** (`AuthModalContext` → `auth/AuthModal.tsx`, `CloudAuthModal.tsx`, `Web3AuthModalBridge`)
- **ProfileModal** (`ProfileModalContext`)
- **CoachesModal** (`CoachesModalContext` → `careers/coaches/CoachesModal.tsx`)
- **SubscriptionsModal** (`SubscriptionsModalContext` → `subscription/SubscriptionsModal.tsx`)
- **WalletModal** (`WalletModalContext` → `fm/WalletModal.tsx`)
- **WelcomeGate** (`WelcomeGateContext` → `modals/WelcomeGateModal.tsx`)
- **PWAInstallModal**, **CookieConsent**, **NotificationPermissionPrompt**, **PWAUpdatePrompt**

## P. Dashboard / play / strategy modals

- DailyPrioritiesModal · ExecutionModal · HypnosisModal · MilestoneDetailModal · PillarSynthesisModal · SkillDetailModal (dashboard)
- FocusQueueModal · MilestoneJourneyModal · StrategyPillarWizard (play)
- MissionModal · MiniMilestoneModal · PillarModal · MissingQuestModal (missions)
- PracticesModal · CharacterProfileModal · InventoryBagModal · AchievementGalleryModal · UserDocsModal (top-level `components/modals`)
- PlanChatWizard · PlanNegotiateModal · AuroraPlanModal · AuroraJournalModal · AuroraBeliefsModal (Aurora)
- BugReportDialog (bug capture)

## Q. Career / business modals

- BrandingModal · FinancialsModal · GrowthModal · MarketingModal · OperationsModal · StrategyModal (Business Tools Grid)
- BusinessDashboardModals · AddProjectWizard · AddItemWizard
- AutoPlanEngineModal · ClientProfilePanel (coach)
- AvatarRequiredModal (avatar) · SoulAvatarMintWizard (web3)

## R. Community / messaging modals

- CreateThreadModal · CreateStoryModal · SuggestTopicModal · EventsModal · AIMatchModal · AddToPlanModal · CommunityMiniProfile · PostDetailModal · ProjectDetailModal
- NewMessageDialog (messages)

## S. Commerce modals

- CheckoutDialog · SubscriptionCheckoutDialog · PromoUpgradeModal · UpgradePromptModal · ProGateOverlay · SpendConfirmDialog · EnergySpendModal · EarnLaunchpadModal · LeadCaptureDialog · LessonViewer

## T. Admin-only dialogs

AdminGrantPurchaseDialog · AdminCouponsPanel · LandingPageDialog · AddSectionDialog · FormDialog · FieldEditorDialog · CampaignDialog · ImportSubscribersDialog · EpisodeDialog · ProductDialog · SeriesDialog · AssignAudio/VideoDialog · AudioUploadDialog · VideoUploadDialog · PendingPayments · FMPublishWizard

## U. PlayHub inner tabs

Overview (Today) · Mission Control.

## V. Misc

- WorkChatWizard, PillarSelectionModal, OrbDNAModal — onboarding/contextual wizards
- Hallway BodyHypnosisSurface (in-room overlay)
- ConsciousnessField, MatrixRain — ambient overlays (not modals)
- 404: `NotFound.tsx`

---

If you want, I can next:
1. Export this as a Markdown/PDF artifact under `/mnt/documents/`,
2. Add a status column (built / WIP / stub / orphaned) by scanning each file,
3. Or generate true ASCII wireframes per surface (would be a much bigger doc — ask before I start).