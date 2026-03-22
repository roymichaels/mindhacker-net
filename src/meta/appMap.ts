/**
 * ┌──────────────────────────────────────────────────────────────────┐
 * │  MindOS — Canonical App Map Registry                            │
 * │                                                                  │
 * │  This is the SINGLE SOURCE OF TRUTH for the application's        │
 * │  structure. Every route, hub, context, hook, service, and        │
 * │  identity layer is catalogued here.                              │
 * │                                                                  │
 * │  HOW TO MAINTAIN:                                                │
 * │  1. When adding a route → add to `routes` array                  │
 * │  2. When adding a context/hook → add to `contexts`/`hooks`       │
 * │  3. When deprecating → set status to 'deprecated'                │
 * │  4. When removing → delete the entry entirely                    │
 * │  5. Run `grep -c 'status:' src/meta/appMap.ts` to audit size     │
 * └──────────────────────────────────────────────────────────────────┘
 */

// ─── Types ───────────────────────────────────────────────────────────

export type Category =
  | 'homepage' | 'onboarding' | 'play' | 'aion' | 'dna' | 'profile'
  | 'community' | 'learn' | 'fm' | 'careers' | 'docs' | 'admin'
  | 'settings' | 'auth' | 'affiliate' | 'dev' | 'legal' | 'media'
  | 'avatar' | 'other';

export type Status = 'active' | 'partial' | 'legacy' | 'deprecated' | 'hidden';
export type IdentityOwner = 'DNA' | 'AION' | 'Orb' | 'Aurora' | 'none';
export type RenderType = 'orb' | 'dna' | 'none' | 'mixed';
export type CleanupPriority = 'none' | 'low' | 'medium' | 'high';

export interface RouteEntry {
  id: string;
  name: string;
  route: string;
  category: Category;
  purpose: string;
  protected: boolean;
  mainComponents: string[];
  layoutWrapper?: string;
  keyContexts?: string[];
  keyHooks?: string[];
  identityOwner: IdentityOwner;
  renderType: RenderType;
  status: Status;
  cleanupPriority: CleanupPriority;
  notes?: string;
}

export interface ContextEntry {
  name: string;
  file: string;
  purpose: string;
  status: Status;
  usedBy: string[];
  notes?: string;
}

export interface HookEntry {
  name: string;
  file: string;
  purpose: string;
  featureArea: Category;
  status: Status;
  replacement?: string;
  notes?: string;
}

export interface ServiceEntry {
  name: string;
  file: string;
  purpose: string;
  featureArea: Category;
  status: Status;
}

export interface IdentityLayerEntry {
  name: string;
  internalName: string;
  purpose: string;
  files: string[];
  status: Status;
  notes?: string;
}

// ─── ROUTES ──────────────────────────────────────────────────────────

export const routes: RouteEntry[] = [
  // ── Homepage ───────────────────────────────────────
  {
    id: 'homepage',
    name: 'Homepage',
    route: '/',
    category: 'homepage',
    purpose: 'Public landing page with hero, features, pricing',
    protected: false,
    mainComponents: ['Index', 'HeroSection', 'Footer'],
    identityOwner: 'none',
    renderType: 'none',
    status: 'active',
    cleanupPriority: 'none',
  },
  {
    id: 'founding',
    name: 'Founding Landing',
    route: '/founding',
    category: 'homepage',
    purpose: 'Founding members landing page with avatar group showcase',
    protected: false,
    mainComponents: ['FoundingLanding', 'FoundingHero', 'FoundingAvatarGroup', 'FoundingPlatformDeep'],
    identityOwner: 'none',
    renderType: 'none',
    status: 'active',
    cleanupPriority: 'none',
    notes: 'Shows 5 random avatars with different poses as a group',
  },
  {
    id: 'features',
    name: 'Feature Detail',
    route: '/features/:slug',
    category: 'homepage',
    purpose: 'Individual feature detail pages',
    protected: false,
    mainComponents: ['FeatureDetailPage'],
    identityOwner: 'none',
    renderType: 'none',
    status: 'active',
    cleanupPriority: 'none',
  },
  {
    id: 'go',
    name: 'Go (Quick Entry)',
    route: '/go',
    category: 'homepage',
    purpose: 'Quick-start entry point / invite link handler',
    protected: false,
    mainComponents: ['Go'],
    identityOwner: 'none',
    renderType: 'none',
    status: 'active',
    cleanupPriority: 'none',
  },

  // ── Auth / Onboarding ─────────────────────────────
  {
    id: 'onboarding',
    name: 'Onboarding',
    route: '/onboarding',
    category: 'onboarding',
    purpose: 'New user onboarding flow (launchpad + AION activation)',
    protected: false,
    mainComponents: ['Onboarding', 'OnboardingSteps', 'OnboardingIntro'],
    keyContexts: ['SmartOnboardingContext'],
    keyHooks: ['useSmartOnboardingRedirect', 'useLaunchpadData', 'useLaunchpadProgress'],
    identityOwner: 'AION',
    renderType: 'orb',
    status: 'active',
    cleanupPriority: 'none',
  },
  {
    id: 'ceremony',
    name: 'Onboarding Ceremony',
    route: '/ceremony',
    category: 'onboarding',
    purpose: 'AION activation ceremony post-onboarding',
    protected: false,
    mainComponents: ['OnboardingCeremony'],
    identityOwner: 'AION',
    renderType: 'orb',
    status: 'active',
    cleanupPriority: 'none',
  },
  {
    id: 'launchpad-complete',
    name: 'Launchpad Complete',
    route: '/launchpad/complete',
    category: 'onboarding',
    purpose: 'Completion screen after launchpad flow',
    protected: true,
    mainComponents: ['LaunchpadComplete'],
    identityOwner: 'AION',
    renderType: 'orb',
    status: 'active',
    cleanupPriority: 'none',
  },

  // ── Play Hub ──────────────────────────────────────
  {
    id: 'play',
    name: 'Play Hub',
    route: '/play',
    category: 'play',
    purpose: 'Main dashboard merging Strategy + Tactics views',
    protected: true,
    mainComponents: ['PlayHub', 'PlayLayoutWrapper'],
    layoutWrapper: 'ProtectedAppShell',
    keyContexts: ['GameStateContext'],
    keyHooks: ['useUnifiedDashboard', 'useDailyPriorities', 'useNowEngine'],
    identityOwner: 'AION',
    renderType: 'orb',
    status: 'active',
    cleanupPriority: 'none',
  },

  // ── Strategy / Pillars ────────────────────────────
  {
    id: 'strategy-presence',
    name: 'Presence Pillar',
    route: '/strategy/presence',
    category: 'play',
    purpose: 'Presence pillar home + assessment + results + history',
    protected: true,
    mainComponents: ['PresenceHome', 'PresenceScan', 'PresenceAnalyzing', 'PresenceResultsPage', 'PresenceChatAssess', 'PresenceChatResults', 'PresenceHistory'],
    layoutWrapper: 'ProtectedAppShell',
    keyHooks: ['usePresenceCoach', 'usePresenceScans'],
    identityOwner: 'DNA',
    renderType: 'none',
    status: 'active',
    cleanupPriority: 'none',
    notes: 'Sub-routes: /scan, /analyzing, /results, /assess, /chat-results, /history',
  },
  {
    id: 'strategy-power',
    name: 'Power Pillar',
    route: '/strategy/power',
    category: 'play',
    purpose: 'Power pillar assessment flow',
    protected: true,
    mainComponents: ['PowerHome', 'PowerChatAssess', 'PowerChatResults', 'PowerResultsPage', 'PowerHistory'],
    layoutWrapper: 'ProtectedAppShell',
    identityOwner: 'DNA',
    renderType: 'none',
    status: 'active',
    cleanupPriority: 'none',
  },
  {
    id: 'strategy-vitality',
    name: 'Vitality Pillar',
    route: '/strategy/vitality',
    category: 'play',
    purpose: 'Vitality pillar assessment + intake flow',
    protected: true,
    mainComponents: ['VitalityHome', 'VitalityChatAssess', 'VitalityChatResults', 'VitalityIntake', 'VitalityResults', 'VitalityHistory'],
    layoutWrapper: 'ProtectedAppShell',
    keyHooks: ['useVitalityEngine'],
    identityOwner: 'DNA',
    renderType: 'none',
    status: 'active',
    cleanupPriority: 'none',
  },
  {
    id: 'strategy-focus',
    name: 'Focus Pillar',
    route: '/strategy/focus',
    category: 'play',
    purpose: 'Focus pillar assessment flow',
    protected: true,
    mainComponents: ['FocusHome', 'FocusChatAssess', 'FocusChatResults', 'FocusResults', 'FocusHistory'],
    layoutWrapper: 'ProtectedAppShell',
    keyHooks: ['useFocusCoach'],
    identityOwner: 'DNA',
    renderType: 'none',
    status: 'active',
    cleanupPriority: 'none',
  },
  {
    id: 'strategy-combat',
    name: 'Combat Pillar',
    route: '/strategy/combat',
    category: 'play',
    purpose: 'Combat pillar assessment flow',
    protected: true,
    mainComponents: ['CombatHome', 'CombatChatAssess', 'CombatChatResults', 'CombatResults', 'CombatHistory'],
    layoutWrapper: 'ProtectedAppShell',
    keyHooks: ['useCombatCoach'],
    identityOwner: 'DNA',
    renderType: 'none',
    status: 'active',
    cleanupPriority: 'none',
  },
  {
    id: 'strategy-expansion',
    name: 'Expansion Pillar',
    route: '/strategy/expansion',
    category: 'play',
    purpose: 'Expansion pillar assessment flow',
    protected: true,
    mainComponents: ['ExpansionHome', 'ExpansionChatAssess', 'ExpansionChatResults', 'ExpansionResults', 'ExpansionHistory'],
    layoutWrapper: 'ProtectedAppShell',
    keyHooks: ['useExpansionCoach'],
    identityOwner: 'DNA',
    renderType: 'none',
    status: 'active',
    cleanupPriority: 'none',
  },
  {
    id: 'strategy-consciousness',
    name: 'Consciousness Pillar',
    route: '/strategy/consciousness',
    category: 'play',
    purpose: 'Consciousness pillar assessment flow',
    protected: true,
    mainComponents: ['ConsciousnessHome', 'ConsciousnessAssess', 'ConsciousnessResults', 'ConsciousnessHistory'],
    layoutWrapper: 'ProtectedAppShell',
    keyHooks: ['useConsciousnessCoach'],
    identityOwner: 'DNA',
    renderType: 'none',
    status: 'active',
    cleanupPriority: 'none',
  },
  {
    id: 'strategy-arena-domains',
    name: 'Arena Domain Assessments',
    route: '/strategy/:domain/assess',
    category: 'play',
    purpose: 'Wealth, Influence, Relationships, Business, Projects, Play domain assessments',
    protected: true,
    mainComponents: ['WealthAssess', 'InfluenceAssess', 'RelationshipsAssess', 'BusinessAssess', 'ProjectsAssess', 'PlayAssess'],
    layoutWrapper: 'ProtectedAppShell',
    keyHooks: ['useDomainAssessment'],
    identityOwner: 'DNA',
    renderType: 'none',
    status: 'active',
    cleanupPriority: 'none',
    notes: 'Each domain has /assess and /results sub-routes',
  },
  {
    id: 'strategy-domain-catch-all',
    name: 'Life Domain Page',
    route: '/strategy/:domainId',
    category: 'play',
    purpose: 'Generic life domain page catch-all',
    protected: true,
    mainComponents: ['LifeDomainPage'],
    layoutWrapper: 'ProtectedAppShell',
    identityOwner: 'DNA',
    renderType: 'none',
    status: 'active',
    cleanupPriority: 'low',
  },
  {
    id: 'quests',
    name: 'Quest Runner',
    route: '/quests/:pillar',
    category: 'play',
    purpose: 'Gamified quest execution per pillar',
    protected: true,
    mainComponents: ['QuestRunnerPage'],
    layoutWrapper: 'ProtectedAppShell',
    identityOwner: 'AION',
    renderType: 'none',
    status: 'active',
    cleanupPriority: 'none',
  },

  // ── AION / Chat ───────────────────────────────────
  {
    id: 'aurora-chat',
    name: 'AION Chat',
    route: '/aurora',
    category: 'aion',
    purpose: 'Primary AION chat interface (Aurora engine)',
    protected: true,
    mainComponents: ['AuroraPage', 'AuroraChatView'],
    layoutWrapper: 'ProtectedAppShell',
    keyContexts: ['AuroraChatContext', 'AuroraActionsContext'],
    keyHooks: ['useAuroraChat', 'useAuroraCommands', 'useAuroraVoice'],
    identityOwner: 'AION',
    renderType: 'orb',
    status: 'active',
    cleanupPriority: 'none',
    notes: 'User-facing name is personal AION name, engine is Aurora internally',
  },

  // ── Profile ───────────────────────────────────────
  {
    id: 'profile',
    name: 'Profile (Modal)',
    route: '/profile',
    category: 'profile',
    purpose: 'User profile modal (AION identity, Orb, DNA, stats)',
    protected: true,
    mainComponents: ['ProfilePage'],
    keyContexts: ['ProfileModalContext', 'SoulAvatarContext'],
    keyHooks: ['useProfile', 'useOrbProfile', 'useLiveOrbProfile'],
    identityOwner: 'AION',
    renderType: 'mixed',
    status: 'active',
    cleanupPriority: 'none',
    notes: 'Route redirects to /play; profile is modal-based via ProfileModalContext',
  },

  // ── Community ─────────────────────────────────────
  {
    id: 'community',
    name: 'Community',
    route: '/community',
    category: 'community',
    purpose: 'Social feed with posts, events, categories',
    protected: true,
    mainComponents: ['CommunityLayoutWrapper', 'CommunityFeed'],
    layoutWrapper: 'ProtectedAppShell',
    keyHooks: ['useCommunityFeed', 'useCommunityUsername', 'useCommunityDailyLimit'],
    identityOwner: 'AION',
    renderType: 'orb',
    status: 'active',
    cleanupPriority: 'none',
  },
  {
    id: 'community-thread',
    name: 'Community Thread',
    route: '/community/post/:postId',
    category: 'community',
    purpose: 'Individual post thread with comments',
    protected: true,
    mainComponents: ['CommunityThread'],
    layoutWrapper: 'ProtectedAppShell',
    identityOwner: 'AION',
    renderType: 'orb',
    status: 'active',
    cleanupPriority: 'none',
  },

  // ── Messages ──────────────────────────────────────
  {
    id: 'messages',
    name: 'Messages',
    route: '/messages',
    category: 'community',
    purpose: 'Direct messaging between users',
    protected: true,
    mainComponents: ['Messages', 'MessageThread'],
    layoutWrapper: 'ProtectedAppShell',
    identityOwner: 'AION',
    renderType: 'none',
    status: 'active',
    cleanupPriority: 'none',
  },

  // ── Learn ─────────────────────────────────────────
  {
    id: 'learn',
    name: 'Learn Hub',
    route: '/learn',
    category: 'learn',
    purpose: 'Educational content hub with courses and lessons',
    protected: true,
    mainComponents: ['LearnLayoutWrapper'],
    layoutWrapper: 'ProtectedAppShell',
    keyHooks: ['useLearnPillarAction'],
    identityOwner: 'none',
    renderType: 'none',
    status: 'active',
    cleanupPriority: 'none',
  },
  {
    id: 'courses',
    name: 'Courses',
    route: '/courses',
    category: 'learn',
    purpose: 'Public course listing',
    protected: false,
    mainComponents: ['Courses'],
    identityOwner: 'none',
    renderType: 'none',
    status: 'active',
    cleanupPriority: 'none',
  },
  {
    id: 'course-detail',
    name: 'Course Detail',
    route: '/courses/:slug',
    category: 'learn',
    purpose: 'Individual course page',
    protected: false,
    mainComponents: ['CourseDetail'],
    identityOwner: 'none',
    renderType: 'none',
    status: 'active',
    cleanupPriority: 'none',
  },
  {
    id: 'course-watch',
    name: 'Course Watch',
    route: '/courses/:slug/watch',
    category: 'learn',
    purpose: 'Course video player',
    protected: false,
    mainComponents: ['CourseWatch'],
    identityOwner: 'none',
    renderType: 'none',
    status: 'active',
    cleanupPriority: 'none',
  },

  // ── FreeMarket ────────────────────────────────────
  {
    id: 'fm',
    name: 'FreeMarket Hub',
    route: '/fm',
    category: 'fm',
    purpose: 'Token economy hub: market, wallet, earn, cashout, bridge',
    protected: true,
    mainComponents: ['FMAppShell', 'FMMarketLayoutWrapper', 'FMCashout', 'FMBridge'],
    layoutWrapper: 'ProtectedAppShell > FMAppShell',
    keyContexts: ['WalletModalContext'],
    keyHooks: ['useFMWallet', 'useSoulWallet', 'useMOSEconomy', 'useMiningStats'],
    identityOwner: 'none',
    renderType: 'none',
    status: 'active',
    cleanupPriority: 'none',
    notes: 'Sub-routes: /cashout, /bridge. Most others redirect to /fm index.',
  },

  // ── Work Hub ──────────────────────────────────────
  {
    id: 'work',
    name: 'Work Hub',
    route: '/work',
    category: 'careers',
    purpose: 'Work productivity hub',
    protected: true,
    mainComponents: ['WorkLayoutWrapper'],
    layoutWrapper: 'ProtectedAppShell',
    keyHooks: ['useWorkSessions', 'useActiveWorkSession'],
    identityOwner: 'none',
    renderType: 'none',
    status: 'active',
    cleanupPriority: 'none',
  },

  // ── Careers ───────────────────────────────────────
  {
    id: 'coaches',
    name: 'Coaches Directory',
    route: '/coaches',
    category: 'careers',
    purpose: 'Browse and connect with coaches',
    protected: true,
    mainComponents: ['CoachesLayoutWrapper'],
    layoutWrapper: 'ProtectedAppShell',
    keyContexts: ['CoachesModalContext'],
    keyHooks: ['usePractitioners'],
    identityOwner: 'none',
    renderType: 'none',
    status: 'active',
    cleanupPriority: 'none',
  },
  {
    id: 'coaching-journey',
    name: 'Coaching Journey',
    route: '/coaching/journey',
    category: 'careers',
    purpose: 'Coach career path onboarding journey',
    protected: true,
    mainComponents: ['CoachingJourney'],
    keyHooks: ['useCoachingJourneyProgress'],
    identityOwner: 'none',
    renderType: 'none',
    status: 'active',
    cleanupPriority: 'none',
  },
  {
    id: 'business',
    name: 'Business Hub',
    route: '/business',
    category: 'careers',
    purpose: 'Business career path: index, dashboard, journey',
    protected: true,
    mainComponents: ['BusinessIndexWrapper', 'BusinessDashboardWrapper', 'BusinessJourneyWrapper'],
    layoutWrapper: 'ProtectedAppShell',
    keyHooks: ['useBusinessJourneys', 'useBusinessJourneyProgress', 'useBusinessPlan', 'useBusinessBranding', 'useBusinessOrbProfile'],
    identityOwner: 'none',
    renderType: 'orb',
    status: 'active',
    cleanupPriority: 'none',
    notes: 'Sub-routes: /journey, /journey/:id, /:businessId',
  },
  {
    id: 'freelancer',
    name: 'Freelancer Hub',
    route: '/freelancer',
    category: 'careers',
    purpose: 'Freelancer career path dashboard',
    protected: true,
    mainComponents: ['FreelancerLayoutWrapper'],
    layoutWrapper: 'ProtectedAppShell',
    identityOwner: 'none',
    renderType: 'none',
    status: 'active',
    cleanupPriority: 'none',
  },
  {
    id: 'creator',
    name: 'Creator Hub',
    route: '/creator',
    category: 'careers',
    purpose: 'Creator career path dashboard',
    protected: true,
    mainComponents: ['CreatorLayoutWrapper'],
    layoutWrapper: 'ProtectedAppShell',
    identityOwner: 'none',
    renderType: 'none',
    status: 'active',
    cleanupPriority: 'none',
  },
  {
    id: 'therapist',
    name: 'Therapist Hub',
    route: '/therapist',
    category: 'careers',
    purpose: 'Therapist career path dashboard',
    protected: true,
    mainComponents: ['TherapistLayoutWrapper'],
    layoutWrapper: 'ProtectedAppShell',
    identityOwner: 'none',
    renderType: 'none',
    status: 'active',
    cleanupPriority: 'none',
  },
  {
    id: 'projects-journey',
    name: 'Projects Journey',
    route: '/projects/journey',
    category: 'careers',
    purpose: 'Projects career journey onboarding',
    protected: true,
    mainComponents: ['ProjectsJourney'],
    keyHooks: ['useProjectsJourneyProgress'],
    identityOwner: 'none',
    renderType: 'none',
    status: 'active',
    cleanupPriority: 'none',
  },
  {
    id: 'admin-journey',
    name: 'Admin Journey',
    route: '/admin/journey',
    category: 'careers',
    purpose: 'Admin career journey onboarding',
    protected: true,
    mainComponents: ['AdminJourney'],
    keyHooks: ['useAdminJourneyProgress'],
    identityOwner: 'none',
    renderType: 'none',
    status: 'active',
    cleanupPriority: 'none',
  },
  {
    id: 'coach-slug',
    name: 'Coach Profile (Public)',
    route: '/practitioner/:slug',
    category: 'careers',
    purpose: 'Public coach profile landing page',
    protected: false,
    mainComponents: ['CoachSlugRedirect'],
    identityOwner: 'none',
    renderType: 'none',
    status: 'active',
    cleanupPriority: 'none',
    notes: 'Also /practitioners/:slug, /coach/:slug',
  },

  // ── Admin ─────────────────────────────────────────
  {
    id: 'admin-hub',
    name: 'Admin Hub',
    route: '/admin-hub',
    category: 'admin',
    purpose: 'Platform admin dashboard (users, analytics, content management)',
    protected: true,
    mainComponents: ['AdminLayoutWrapper'],
    layoutWrapper: 'ProtectedAppShell',
    keyHooks: ['useAdminUserView', 'useAdminNotifications', 'useAdminAuroraInsights'],
    identityOwner: 'none',
    renderType: 'none',
    status: 'active',
    cleanupPriority: 'none',
  },

  // ── Affiliate ─────────────────────────────────────
  {
    id: 'affiliate',
    name: 'Affiliate Panel',
    route: '/affiliate',
    category: 'affiliate',
    purpose: 'Affiliate dashboard, links, referrals, payouts',
    protected: true,
    mainComponents: ['AffiliatePanel', 'AffiliateDashboardPanel', 'MyLinks', 'MyReferrals', 'MyPayouts'],
    keyHooks: ['useUserRoles'],
    identityOwner: 'none',
    renderType: 'none',
    status: 'active',
    cleanupPriority: 'none',
    notes: 'Role-gated: affiliate role required',
  },
  {
    id: 'affiliate-signup',
    name: 'Affiliate Signup',
    route: '/affiliate-signup',
    category: 'affiliate',
    purpose: 'Public affiliate registration page',
    protected: false,
    mainComponents: ['AffiliateSignup'],
    identityOwner: 'none',
    renderType: 'none',
    status: 'active',
    cleanupPriority: 'none',
  },

  // ── Docs ──────────────────────────────────────────
  {
    id: 'docs',
    name: 'Documentation / Whitepaper',
    route: '/docs',
    category: 'docs',
    purpose: 'Platform documentation and whitepaper viewer',
    protected: false,
    mainComponents: ['Documentation'],
    identityOwner: 'none',
    renderType: 'none',
    status: 'active',
    cleanupPriority: 'none',
  },
  {
    id: 'blog',
    name: 'Blog',
    route: '/blog',
    category: 'docs',
    purpose: 'Blog listing and individual posts',
    protected: false,
    mainComponents: ['Blog', 'BlogPost'],
    identityOwner: 'none',
    renderType: 'none',
    status: 'active',
    cleanupPriority: 'none',
  },

  // ── Legal / Utility ───────────────────────────────
  {
    id: 'privacy',
    name: 'Privacy Policy',
    route: '/privacy-policy',
    category: 'legal',
    purpose: 'Privacy policy page',
    protected: false,
    mainComponents: ['PrivacyPolicy'],
    identityOwner: 'none',
    renderType: 'none',
    status: 'active',
    cleanupPriority: 'none',
  },
  {
    id: 'terms',
    name: 'Terms of Service',
    route: '/terms-of-service',
    category: 'legal',
    purpose: 'Terms of service page',
    protected: false,
    mainComponents: ['TermsOfService'],
    identityOwner: 'none',
    renderType: 'none',
    status: 'active',
    cleanupPriority: 'none',
  },
  {
    id: 'install',
    name: 'Install (PWA)',
    route: '/install',
    category: 'other',
    purpose: 'PWA installation instructions page',
    protected: false,
    mainComponents: ['Install'],
    identityOwner: 'none',
    renderType: 'none',
    status: 'active',
    cleanupPriority: 'none',
  },
  {
    id: 'subscriptions',
    name: 'Subscriptions',
    route: '/subscriptions',
    category: 'other',
    purpose: 'Subscription plans / pricing page',
    protected: false,
    mainComponents: ['Subscriptions'],
    keyContexts: ['SubscriptionsModalContext'],
    identityOwner: 'none',
    renderType: 'none',
    status: 'active',
    cleanupPriority: 'none',
  },
  {
    id: 'success',
    name: 'Success',
    route: '/success',
    category: 'other',
    purpose: 'Payment / action success page',
    protected: true,
    mainComponents: ['Success'],
    identityOwner: 'none',
    renderType: 'none',
    status: 'active',
    cleanupPriority: 'none',
  },
  {
    id: 'unsubscribe',
    name: 'Unsubscribe',
    route: '/unsubscribe',
    category: 'other',
    purpose: 'Email unsubscribe handler',
    protected: false,
    mainComponents: ['Unsubscribe'],
    identityOwner: 'none',
    renderType: 'none',
    status: 'active',
    cleanupPriority: 'none',
  },

  // ── Media ─────────────────────────────────────────
  {
    id: 'audio-player',
    name: 'Audio Player',
    route: '/audio/:token',
    category: 'media',
    purpose: 'Standalone audio player for shared content',
    protected: false,
    mainComponents: ['AudioPlayer'],
    identityOwner: 'none',
    renderType: 'none',
    status: 'active',
    cleanupPriority: 'none',
  },
  {
    id: 'video-player',
    name: 'Video Player',
    route: '/video/:token',
    category: 'media',
    purpose: 'Standalone video player for shared content',
    protected: false,
    mainComponents: ['VideoPlayer'],
    identityOwner: 'none',
    renderType: 'none',
    status: 'active',
    cleanupPriority: 'none',
  },

  // ── Avatar ─────────────────────────────────────────
  {
    id: 'avatar',
    name: 'Avatar Configurator',
    route: '/avatar',
    category: 'avatar',
    purpose: '3D character avatar customizer (head, hair, clothes, accessories)',
    protected: true,
    mainComponents: ['AvatarConfiguratorPage', 'AvatarConfigurator', 'AvatarModel', 'AvatarConfiguratorUI', 'Asset', 'AssetTilePreview'],
    keyHooks: ['useUserAvatarData'],
    identityOwner: 'none',
    renderType: 'none',
    status: 'active',
    cleanupPriority: 'none',
    notes: 'Loads/saves avatar customization to DB. Uses Zustand store (avatarStore). GLB-based skinned meshes with Armature.',
  },

  // ── Dev / Gallery ─────────────────────────────────
  {
    id: 'orb-gallery-public',
    name: 'Orb Gallery (Public)',
    route: '/orbs',
    category: 'dev',
    purpose: 'Public orb showcase gallery',
    protected: false,
    mainComponents: ['OrbGalleryPage'],
    identityOwner: 'Orb',
    renderType: 'orb',
    status: 'active',
    cleanupPriority: 'none',
  },
  {
    id: 'orb-gallery-dev',
    name: 'Orb Gallery (Dev)',
    route: '/dev/orb-gallery',
    category: 'dev',
    purpose: 'Developer orb testing gallery',
    protected: false,
    mainComponents: ['OrbGallery'],
    identityOwner: 'Orb',
    renderType: 'orb',
    status: 'hidden',
    cleanupPriority: 'none',
  },

  // ── Legacy / Redirects ────────────────────────────
  {
    id: 'legacy-now',
    name: '/now → /play',
    route: '/now',
    category: 'other',
    purpose: 'Legacy redirect',
    protected: true,
    mainComponents: [],
    identityOwner: 'none',
    renderType: 'none',
    status: 'deprecated',
    cleanupPriority: 'low',
    notes: 'Redirect route only. See src/routes/redirects.tsx for full redirect list.',
  },
];

// ─── CONTEXTS ────────────────────────────────────────────────────────

export const contexts: ContextEntry[] = [
  { name: 'AuthContext', file: 'src/contexts/AuthContext.tsx', purpose: 'User auth state, login/logout, admin flag', status: 'active', usedBy: ['global'] },
  { name: 'AuthModalContext', file: 'src/contexts/AuthModalContext.tsx', purpose: 'Controls Web3Auth modal open/close', status: 'active', usedBy: ['global'] },
  { name: 'AuroraChatContext', file: 'src/contexts/AuroraChatContext.tsx', purpose: 'AION chat state, messages, send/receive', status: 'active', usedBy: ['aurora-chat', 'play'] },
  { name: 'AuroraActionsContext', file: 'src/contexts/AuroraActionsContext.tsx', purpose: 'AION autonomous actions and trust levels', status: 'active', usedBy: ['aurora-chat'] },
  { name: 'GameStateContext', file: 'src/contexts/GameStateContext.tsx', purpose: 'XP, tokens, level, streaks, gamification state', status: 'active', usedBy: ['global'] },
  { name: 'LanguageContext', file: 'src/contexts/LanguageContext.tsx', purpose: 'i18n language and RTL management', status: 'active', usedBy: ['global'] },
  { name: 'SmartOnboardingContext', file: 'src/contexts/SmartOnboardingContext.tsx', purpose: 'Onboarding progress and smart navigation', status: 'active', usedBy: ['onboarding', 'play'] },
  { name: 'ProfileModalContext', file: 'src/contexts/ProfileModalContext.tsx', purpose: 'Profile modal open/close state', status: 'active', usedBy: ['profile', 'navigation'] },
  { name: 'SoulAvatarContext', file: 'src/contexts/SoulAvatarContext.tsx', purpose: 'NFT minting state for soul avatar', status: 'active', usedBy: ['profile', 'web3'], notes: 'Legacy name; provides AION NFT minting functionality' },
  { name: 'CoachesModalContext', file: 'src/contexts/CoachesModalContext.tsx', purpose: 'Coaches browsing modal state', status: 'active', usedBy: ['coaches'] },
  { name: 'SubscriptionsModalContext', file: 'src/contexts/SubscriptionsModalContext.tsx', purpose: 'Subscription upsell modal state', status: 'active', usedBy: ['global'] },
  { name: 'WalletModalContext', file: 'src/contexts/WalletModalContext.tsx', purpose: 'Wallet modal open/close', status: 'active', usedBy: ['fm', 'navigation'] },
  { name: 'SidebarContext', file: 'src/contexts/SidebarContext.tsx', purpose: 'Sidebar collapsed/expanded state', status: 'active', usedBy: ['layout'] },
  { name: 'WelcomeGateContext', file: 'src/contexts/WelcomeGateContext.tsx', purpose: 'Welcome gate / first-visit state', status: 'active', usedBy: ['homepage'] },
  { name: 'ChromeVisibilityContext', file: 'src/contexts/ChromeVisibilityContext.tsx', purpose: 'Header/footer/sidebar visibility toggling', status: 'active', usedBy: ['layout'] },
];

// ─── HOOKS (grouped by feature) ──────────────────────────────────────

export const hooks: HookEntry[] = [
  // ── Aurora / AION ──
  { name: 'useAuroraChat', file: 'src/hooks/aurora/useAuroraChat.tsx', purpose: 'Chat message sending, history, streaming', featureArea: 'aion', status: 'active' },
  { name: 'useAuroraCommands', file: 'src/hooks/aurora/useAuroraCommands.tsx', purpose: 'AION command parsing and execution', featureArea: 'aion', status: 'active' },
  { name: 'useAuroraVoice', file: 'src/hooks/aurora/useAuroraVoice.tsx', purpose: 'Voice input/output for AION', featureArea: 'aion', status: 'active' },
  { name: 'useAuroraVoiceMode', file: 'src/hooks/aurora/useAuroraVoiceMode.tsx', purpose: 'Voice mode toggle state', featureArea: 'aion', status: 'active' },
  { name: 'useAuroraConversations', file: 'src/hooks/aurora/useAuroraConversations.ts', purpose: 'Conversation list and switching', featureArea: 'aion', status: 'active' },
  { name: 'useAuroraReminders', file: 'src/hooks/aurora/useAuroraReminders.tsx', purpose: 'Reminder scheduling via AION', featureArea: 'aion', status: 'active' },
  { name: 'useSmartSuggestions', file: 'src/hooks/aurora/useSmartSuggestions.tsx', purpose: 'AI-driven contextual suggestions', featureArea: 'aion', status: 'active' },
  { name: 'useProactiveAurora', file: 'src/hooks/aurora/useProactiveAurora.tsx', purpose: 'Proactive AION notifications', featureArea: 'aion', status: 'active' },
  { name: 'useOnboardingProgress', file: 'src/hooks/aurora/useOnboardingProgress.tsx', purpose: 'Aurora-specific onboarding tracking', featureArea: 'aion', status: 'active' },
  { name: 'useUserContext', file: 'src/hooks/aurora/useUserContext.tsx', purpose: 'Unified user context for AI prompts', featureArea: 'aion', status: 'active' },
  { name: 'useCommandBus', file: 'src/hooks/aurora/useCommandBus.tsx', purpose: 'Cross-component command dispatch', featureArea: 'aion', status: 'active' },
  { name: 'useActionTrust', file: 'src/hooks/aurora/useActionTrust.tsx', purpose: 'Autonomous action trust levels', featureArea: 'aion', status: 'active' },
  { name: 'useChecklistsData', file: 'src/hooks/aurora/useChecklistsData.tsx', purpose: 'Aurora checklists CRUD', featureArea: 'aion', status: 'active' },
  { name: 'useDailyHabits', file: 'src/hooks/aurora/useDailyHabits.tsx', purpose: 'Daily habit tracking', featureArea: 'aion', status: 'active' },
  { name: 'useDashboard', file: 'src/hooks/aurora/useDashboard.tsx', purpose: 'Aurora dashboard data aggregation', featureArea: 'aion', status: 'active' },
  { name: 'useLifeModel', file: 'src/hooks/aurora/useLifeModel.tsx', purpose: 'Life model state (direction, identity, patterns)', featureArea: 'aion', status: 'active' },
  { name: 'useConversationSearch', file: 'src/hooks/aurora/useConversationSearch.ts', purpose: 'Search within conversation history', featureArea: 'aion', status: 'active' },
  { name: 'useAuroraDockUI', file: 'src/hooks/aurora/useAuroraDockUI.ts', purpose: 'Dock panel UI state', featureArea: 'aion', status: 'active' },
  { name: 'useAIONDisplayName', file: 'src/hooks/useAIONDisplayName.ts', purpose: 'Resolves personal AION name with fallback', featureArea: 'aion', status: 'active' },
  { name: 'useVoicePersona', file: 'src/hooks/useVoicePersona.ts', purpose: 'Voice persona selection for TTS', featureArea: 'aion', status: 'active' },

  // ── Identity / Visual ──
  { name: 'useOrbProfile', file: 'src/hooks/useOrbProfile.ts', purpose: 'Fetch/compute orb visual profile from DB', featureArea: 'profile', status: 'active' },
  { name: 'useLiveOrbProfile', file: 'src/hooks/useLiveOrbProfile.ts', purpose: 'Live-updating orb profile with real-time mutations', featureArea: 'profile', status: 'active' },
  { name: 'useOrbPresetMorph', file: 'src/hooks/useOrbPresetMorph.ts', purpose: 'Preset morphing animations for orbs', featureArea: 'profile', status: 'active' },
  { name: 'useTraitDetail', file: 'src/hooks/useTraitDetail.ts', purpose: 'Individual trait detail view', featureArea: 'dna', status: 'active' },
  { name: 'useTraitGallery', file: 'src/hooks/useTraitGallery.ts', purpose: 'Trait gallery browsing', featureArea: 'dna', status: 'active' },
  { name: 'useProfile', file: 'src/hooks/useProfile.ts', purpose: 'User profile data CRUD', featureArea: 'profile', status: 'active' },
  { name: 'useProfilePDF', file: 'src/hooks/useProfilePDF.ts', purpose: 'Generate profile PDF export', featureArea: 'profile', status: 'active' },

  // ── Game / Play ──
  { name: 'useGameState', file: 'src/hooks/useGameState.ts', purpose: 'XP, tokens, level, streak state', featureArea: 'play', status: 'active' },
  { name: 'useActionItems', file: 'src/hooks/useActionItems.ts', purpose: 'Action items CRUD', featureArea: 'play', status: 'active' },
  { name: 'useDailyPriorities', file: 'src/hooks/useDailyPriorities.ts', purpose: 'Daily priority management', featureArea: 'play', status: 'active' },
  { name: 'useDailyPulse', file: 'src/hooks/useDailyPulse.ts', purpose: 'Daily pulse check-in', featureArea: 'play', status: 'active' },
  { name: 'useNowEngine', file: 'src/hooks/useNowEngine.ts', purpose: 'Now engine — current focus / next action', featureArea: 'play', status: 'active' },
  { name: 'useFocusQueue', file: 'src/hooks/useFocusQueue.ts', purpose: 'Focus queue / deep work management', featureArea: 'play', status: 'active' },
  { name: 'useTodayExecution', file: 'src/hooks/useTodayExecution.ts', purpose: 'Today execution tracking', featureArea: 'play', status: 'active' },
  { name: 'useTodaysHabits', file: 'src/hooks/useTodaysHabits.ts', purpose: 'Today habits list', featureArea: 'play', status: 'active' },
  { name: 'useWeeklyActivity', file: 'src/hooks/useWeeklyActivity.ts', purpose: 'Weekly activity aggregation', featureArea: 'play', status: 'active' },
  { name: 'useWeeklyTacticalPlan', file: 'src/hooks/useWeeklyTacticalPlan.ts', purpose: 'Weekly tactical plan management', featureArea: 'play', status: 'active' },
  { name: 'useStrategyPlans', file: 'src/hooks/useStrategyPlans.ts', purpose: 'Strategy-level life plans', featureArea: 'play', status: 'active' },
  { name: 'useUnifiedDashboard', file: 'src/hooks/useUnifiedDashboard.ts', purpose: 'Unified dashboard data aggregation', featureArea: 'play', status: 'active' },
  { name: 'useSkillsProgress', file: 'src/hooks/useSkillsProgress.ts', purpose: 'Skills XP and leveling progress', featureArea: 'play', status: 'active' },
  { name: 'useInventory', file: 'src/hooks/useInventory.ts', purpose: 'User inventory items', featureArea: 'play', status: 'active' },
  { name: 'useMissionsRoadmap', file: 'src/hooks/useMissionsRoadmap.ts', purpose: 'Missions roadmap progression', featureArea: 'play', status: 'active' },
  { name: 'useMilestoneJourney', file: 'src/hooks/useMilestoneJourney.ts', purpose: 'Milestone journey tracking', featureArea: 'play', status: 'active' },
  { name: 'useDailyHypnosis', file: 'src/hooks/useDailyHypnosis.ts', purpose: 'Daily hypnosis session tracking', featureArea: 'play', status: 'active' },

  // ── Pillar coaches ──
  { name: 'usePresenceCoach', file: 'src/hooks/usePresenceCoach.ts', purpose: 'Presence pillar assessment engine', featureArea: 'play', status: 'active' },
  { name: 'useCombatCoach', file: 'src/hooks/useCombatCoach.ts', purpose: 'Combat pillar assessment engine', featureArea: 'play', status: 'active' },
  { name: 'useExpansionCoach', file: 'src/hooks/useExpansionCoach.ts', purpose: 'Expansion pillar assessment engine', featureArea: 'play', status: 'active' },
  { name: 'useFocusCoach', file: 'src/hooks/useFocusCoach.ts', purpose: 'Focus pillar assessment engine', featureArea: 'play', status: 'active' },
  { name: 'useConsciousnessCoach', file: 'src/hooks/useConsciousnessCoach.ts', purpose: 'Consciousness pillar assessment engine', featureArea: 'play', status: 'active' },
  { name: 'useVitalityEngine', file: 'src/hooks/useVitalityEngine.ts', purpose: 'Vitality pillar assessment engine', featureArea: 'play', status: 'active' },
  { name: 'useDomainAssessment', file: 'src/hooks/useDomainAssessment.ts', purpose: 'Generic domain assessment handler', featureArea: 'play', status: 'active' },
  { name: 'useLifeDomains', file: 'src/hooks/useLifeDomains.ts', purpose: 'Life domains listing and scores', featureArea: 'play', status: 'active' },
  { name: 'useLifeAnalysis', file: 'src/hooks/useLifeAnalysis.ts', purpose: 'Cross-domain life analysis', featureArea: 'play', status: 'active' },
  { name: 'useLifePlan', file: 'src/hooks/useLifePlan.ts', purpose: 'Life plan CRUD', featureArea: 'play', status: 'active' },
  { name: 'usePillarAccess', file: 'src/hooks/usePillarAccess.ts', purpose: 'Pillar unlock / access gating', featureArea: 'play', status: 'active' },
  { name: 'usePillarContext', file: 'src/hooks/usePillarContext.ts', purpose: 'Current pillar context for assessments', featureArea: 'play', status: 'active' },
  { name: 'useAllDomainsComplete', file: 'src/hooks/useAllDomainsComplete.ts', purpose: 'Check if all domains are assessed', featureArea: 'play', status: 'active' },
  { name: 'usePresenceScans', file: 'src/hooks/usePresenceScans.ts', purpose: 'Presence photo scan history', featureArea: 'play', status: 'active' },

  // ── Coaches (practitioner) ──
  { name: 'usePractitioners', file: 'src/hooks/usePractitioners.ts', purpose: 'Fetch practitioner listings', featureArea: 'careers', status: 'active' },
  { name: 'useCoachClients (root)', file: 'src/hooks/useCoachClients.ts', purpose: 'Coach client management', featureArea: 'careers', status: 'active', notes: 'Duplicate exists in hooks/coaches/' },
  { name: 'useCoachLeads (root)', file: 'src/hooks/useCoachLeads.ts', purpose: 'Coach lead management', featureArea: 'careers', status: 'active', notes: 'Duplicate exists in hooks/coaches/' },
  { name: 'useCoachSubscription (root)', file: 'src/hooks/useCoachSubscription.ts', purpose: 'Coach subscription status', featureArea: 'careers', status: 'active', notes: 'Duplicate exists in hooks/coaches/' },
  { name: 'useCoachingJourneyProgress (root)', file: 'src/hooks/useCoachingJourneyProgress.ts', purpose: 'Coaching journey progress', featureArea: 'careers', status: 'active', notes: 'Duplicate exists in hooks/coaches/' },
  { name: 'useCareerApplication', file: 'src/hooks/useCareerApplication.ts', purpose: 'Career application submission', featureArea: 'careers', status: 'active' },
  { name: 'useUserJob', file: 'src/hooks/useUserJob.ts', purpose: 'User current job/role', featureArea: 'careers', status: 'active' },

  // ── FM / Economy ──
  { name: 'useFMWallet', file: 'src/hooks/useFMWallet.ts', purpose: 'FreeMarket wallet balance and transactions', featureArea: 'fm', status: 'active' },
  { name: 'useSoulWallet', file: 'src/hooks/useSoulWallet.ts', purpose: 'Soul wallet (on-chain) integration', featureArea: 'fm', status: 'active' },
  { name: 'useMOSEconomy', file: 'src/hooks/fm/useMOSEconomy.ts', purpose: 'MOS token economy stats', featureArea: 'fm', status: 'active' },
  { name: 'useMiningStats', file: 'src/hooks/fm/useMiningStats.ts', purpose: 'Mining/earning stats', featureArea: 'fm', status: 'active' },
  { name: 'useAuroraOpportunities', file: 'src/hooks/fm/useAuroraOpportunities.ts', purpose: 'AI-suggested earning opportunities', featureArea: 'fm', status: 'active' },
  { name: 'useDataMarketplace', file: 'src/hooks/fm/useDataMarketplace.ts', purpose: 'Data marketplace listings', featureArea: 'fm', status: 'active' },

  // ── Community ──
  { name: 'useCommunityFeed', file: 'src/hooks/useCommunityFeed.ts', purpose: 'Community feed posts and pagination', featureArea: 'community', status: 'active' },
  { name: 'useCommunityUsername', file: 'src/hooks/useCommunityUsername.ts', purpose: 'Community display name', featureArea: 'community', status: 'active' },
  { name: 'useCommunityDailyLimit', file: 'src/hooks/useCommunityDailyLimit.ts', purpose: 'Daily posting limit enforcement', featureArea: 'community', status: 'active' },

  // ── System / Utility ──
  { name: 'useTranslation', file: 'src/hooks/useTranslation.ts', purpose: 'i18n translations, RTL, language', featureArea: 'other', status: 'active' },
  { name: 'useThemeSettings', file: 'src/hooks/useThemeSettings.ts', purpose: 'Theme and visual settings', featureArea: 'settings', status: 'active' },
  { name: 'useRouteTheme', file: 'src/hooks/useRouteTheme.ts', purpose: 'Per-route theme overrides', featureArea: 'settings', status: 'active' },
  { name: 'useSEO', file: 'src/hooks/useSEO.ts', purpose: 'Dynamic SEO meta tags', featureArea: 'other', status: 'active' },
  { name: 'useAnalytics', file: 'src/hooks/useAnalytics.ts', purpose: 'Analytics event tracking', featureArea: 'other', status: 'active' },
  { name: 'useConversionEvents', file: 'src/hooks/useConversionEvents.ts', purpose: 'Conversion tracking (signup, purchase)', featureArea: 'other', status: 'active' },
  { name: 'usePWA', file: 'src/hooks/usePWA.ts', purpose: 'PWA install and update prompts', featureArea: 'other', status: 'active' },
  { name: 'usePushNotifications', file: 'src/hooks/usePushNotifications.ts', purpose: 'Push notification subscription', featureArea: 'other', status: 'active' },
  { name: 'useHaptics', file: 'src/hooks/useHaptics.ts', purpose: 'Haptic feedback for mobile', featureArea: 'other', status: 'active' },
  { name: 'useSwipeNavigation', file: 'src/hooks/useSwipeNavigation.ts', purpose: 'Swipe gesture navigation', featureArea: 'other', status: 'active' },
  { name: 'usePullToRefresh', file: 'src/hooks/usePullToRefresh.tsx', purpose: 'Pull-to-refresh mobile pattern', featureArea: 'other', status: 'active' },
  { name: 'useSidebars', file: 'src/hooks/useSidebars.ts', purpose: 'Sidebar state management', featureArea: 'other', status: 'active' },
  { name: 'useSiteSettings', file: 'src/hooks/useSiteSettings.ts', purpose: 'Global site settings from DB', featureArea: 'admin', status: 'active' },
  { name: 'useUserRoles', file: 'src/hooks/useUserRoles.ts', purpose: 'User role checking', featureArea: 'auth', status: 'active' },
  { name: 'useSubscriptionGate', file: 'src/hooks/useSubscriptionGate.ts', purpose: 'Subscription-based feature gating', featureArea: 'other', status: 'active' },
  { name: 'useSmartOnboardingRedirect', file: 'src/hooks/useSmartOnboardingRedirect.ts', purpose: 'Smart redirect based on onboarding state', featureArea: 'onboarding', status: 'active' },
  { name: 'useUTMTracker', file: 'src/hooks/useUTMTracker.ts', purpose: 'UTM parameter tracking', featureArea: 'other', status: 'active' },
  { name: 'useBugReport', file: 'src/hooks/useBugReport.ts', purpose: 'Bug report submission', featureArea: 'other', status: 'active' },
  { name: 'usePromoPopup', file: 'src/hooks/usePromoPopup.ts', purpose: 'Promotional popup display logic', featureArea: 'other', status: 'active' },
  { name: 'useGenderedTranslation', file: 'src/hooks/useGenderedTranslation.ts', purpose: 'Hebrew gendered text handling', featureArea: 'other', status: 'active' },
  { name: 'useUnreadBadge', file: 'src/hooks/useUnreadBadge.ts', purpose: 'Unread message/notification count', featureArea: 'community', status: 'active' },
  { name: 'useUserNotifications', file: 'src/hooks/useUserNotifications.ts', purpose: 'User notification fetching', featureArea: 'other', status: 'active' },
  { name: 'useUserPlate', file: 'src/hooks/useUserPlate.ts', purpose: 'User plate / badge display', featureArea: 'profile', status: 'active' },
  { name: 'useUserPractices', file: 'src/hooks/useUserPractices.ts', purpose: 'User practice tracking', featureArea: 'play', status: 'active' },
  { name: 'useAutoPopulatePractices', file: 'src/hooks/useAutoPopulatePractices.ts', purpose: 'Auto-populate default practices', featureArea: 'play', status: 'active' },
  { name: 'useUserPurchases', file: 'src/hooks/useUserPurchases.ts', purpose: 'User purchase history', featureArea: 'other', status: 'active' },
  { name: 'useWhitepaperPDF', file: 'src/hooks/useWhitepaperPDF.ts', purpose: 'Whitepaper PDF generation', featureArea: 'docs', status: 'active' },

  // ── Business ──
  { name: 'useBusinessJourneys', file: 'src/hooks/useBusinessJourneys.ts', purpose: 'Business journey CRUD', featureArea: 'careers', status: 'active' },
  { name: 'useBusinessJourneyProgress', file: 'src/hooks/useBusinessJourneyProgress.ts', purpose: 'Business journey step progress', featureArea: 'careers', status: 'active' },
  { name: 'useBusinessPlan', file: 'src/hooks/useBusinessPlan.ts', purpose: 'Business plan management', featureArea: 'careers', status: 'active' },
  { name: 'useBusinessBranding', file: 'src/hooks/useBusinessBranding.ts', purpose: 'Business branding settings', featureArea: 'careers', status: 'active' },
  { name: 'useBusinessOrbProfile', file: 'src/hooks/useBusinessOrbProfile.ts', purpose: 'Business-specific orb visuals', featureArea: 'careers', status: 'active' },

  // ── Work ──
  { name: 'useWorkSessions', file: 'src/hooks/useWorkSessions.ts', purpose: 'Work session tracking', featureArea: 'careers', status: 'active' },
  { name: 'useActiveWorkSession', file: 'src/hooks/useActiveWorkSession.ts', purpose: 'Currently active work session', featureArea: 'careers', status: 'active' },

  // ── Learn ──
  { name: 'useLearnPillarAction', file: 'src/hooks/useLearnPillarAction.ts', purpose: 'Learn hub pillar-specific actions', featureArea: 'learn', status: 'active' },
  { name: 'useEpisodeProgress', file: 'src/hooks/useEpisodeProgress.ts', purpose: 'Course episode progress tracking', featureArea: 'learn', status: 'active' },
  { name: 'useUpdateEnrollmentProgress', file: 'src/hooks/useUpdateEnrollmentProgress.ts', purpose: 'Course enrollment progress update', featureArea: 'learn', status: 'active' },
  { name: 'useLessonTTS', file: 'src/hooks/learn/useLessonTTS.ts', purpose: 'Text-to-speech for lessons', featureArea: 'learn', status: 'active' },

  // ── Journey shared ──
  { name: 'useAutoSave (journey)', file: 'src/hooks/journey/useAutoSave.ts', purpose: 'Journey auto-save logic', featureArea: 'careers', status: 'active' },

  // ── Projects ──
  { name: 'useProjects', file: 'src/hooks/useProjects.ts', purpose: 'User projects CRUD', featureArea: 'careers', status: 'active' },
  { name: 'useProjectsJourneyProgress', file: 'src/hooks/useProjectsJourneyProgress.ts', purpose: 'Projects journey progress', featureArea: 'careers', status: 'active' },

  // ── Journal ──
  { name: 'useJournalEntries', file: 'src/hooks/useJournalEntries.ts', purpose: 'Journal entries CRUD', featureArea: 'play', status: 'active' },

  // ── Admin ──
  { name: 'useAdminUserView', file: 'src/hooks/useAdminUserView.ts', purpose: 'Admin user browsing/management', featureArea: 'admin', status: 'active' },
  { name: 'useAdminNotifications', file: 'src/hooks/useAdminNotifications.ts', purpose: 'Admin notification management', featureArea: 'admin', status: 'active' },
  { name: 'useAdminAuroraInsights', file: 'src/hooks/useAdminAuroraInsights.ts', purpose: 'Admin AI insights dashboard', featureArea: 'admin', status: 'active' },
  { name: 'useAdminJourneyProgress', file: 'src/hooks/useAdminJourneyProgress.ts', purpose: 'Admin journey progress tracking', featureArea: 'admin', status: 'active' },

  // ── Avatar ──
  { name: 'useUserAvatarData', file: 'src/hooks/useUserAvatarData.ts', purpose: 'Load saved avatar customization from DB', featureArea: 'avatar', status: 'active' },

  // ── Launchpad ──
  { name: 'useLaunchpadAutoSave', file: 'src/hooks/useLaunchpadAutoSave.ts', purpose: 'Auto-save launchpad progress', featureArea: 'onboarding', status: 'active' },
  { name: 'useLaunchpadData', file: 'src/hooks/useLaunchpadData.ts', purpose: 'Launchpad configuration data', featureArea: 'onboarding', status: 'active' },
  { name: 'useLaunchpadProgress', file: 'src/hooks/useLaunchpadProgress.ts', purpose: 'Launchpad step progress tracking', featureArea: 'onboarding', status: 'active' },

  // ── UI Utility ──
  { name: 'useMobile', file: 'src/hooks/use-mobile.tsx', purpose: 'Mobile viewport detection', featureArea: 'other', status: 'active' },
  { name: 'useToast', file: 'src/hooks/use-toast.ts', purpose: 'Toast notification hook (shadcn)', featureArea: 'other', status: 'active' },

  // ── Deprecated / Legacy ──
  { name: 'useAdaptiveDifficulty', file: 'src/lib/adaptiveDifficulty.ts', purpose: 'Adaptive difficulty system', featureArea: 'play', status: 'legacy', notes: 'Logic exists in lib; hook was deleted' },
];

// ─── SERVICES ────────────────────────────────────────────────────────

export const services: ServiceEntry[] = [
  { name: 'actionItems', file: 'src/services/actionItems.ts', purpose: 'Action items DB operations', featureArea: 'play', status: 'active' },
  { name: 'hypnosis', file: 'src/services/hypnosis.ts', purpose: 'Hypnosis audio management', featureArea: 'play', status: 'active' },
  { name: 'journalEntries', file: 'src/services/journalEntries.ts', purpose: 'Journal entries DB operations', featureArea: 'play', status: 'active' },
  { name: 'scheduleBlocks', file: 'src/services/scheduleBlocks.ts', purpose: 'Schedule block management', featureArea: 'play', status: 'active' },
  { name: 'unifiedContext', file: 'src/services/unifiedContext.ts', purpose: 'Unified context builder for AI prompts', featureArea: 'aion', status: 'active' },
  { name: 'userMemory', file: 'src/services/userMemory.ts', purpose: 'User memory graph DB operations', featureArea: 'aion', status: 'active' },
  { name: 'voice', file: 'src/services/voice.ts', purpose: 'Voice/TTS service', featureArea: 'aion', status: 'active' },
  { name: 'workSessions', file: 'src/services/workSessions.ts', purpose: 'Work session DB operations', featureArea: 'careers', status: 'active' },
];

// ─── IDENTITY LAYERS ────────────────────────────────────────────────

export const identityLayers: IdentityLayerEntry[] = [
  {
    name: 'DNA',
    internalName: 'DNA / computeDNA',
    purpose: 'Single source of truth for user identity structure. Computes archetype, egoState, traits.',
    files: [
      'src/components/dna/computeDNA.ts',
      'src/components/dna/DNAProfileCard.tsx',
      'src/components/dna/DNAViewer.tsx',
      'src/components/dna/DNANFTCard.tsx',
    ],
    status: 'active',
    notes: 'Only computeDNA may derive identity values. All other systems consume DNA output.',
  },
  {
    name: 'AION',
    internalName: 'Aurora (engine) + AION (brand)',
    purpose: 'User-facing identity abstraction. The "Future Self" entity with a personal name.',
    files: [
      'src/contexts/AuroraChatContext.tsx',
      'src/hooks/aurora/',
      'src/components/aurora/',
      'src/hooks/useAIONDisplayName.ts',
    ],
    status: 'active',
    notes: 'Internal code uses "Aurora" naming. UI displays personal AION name.',
  },
  {
    name: 'Orb (AION Visual Body)',
    internalName: 'Orb / MorphOrb',
    purpose: 'Pure visual renderer for AION. Receives visual params from mapDNAtoVisual.',
    files: [
      'src/components/orb/',
      'src/lib/mapDNAtoVisual.ts',
      'src/lib/orbProfileGenerator.ts',
      'src/lib/userOrbGenerator.ts',
      'src/lib/orbDNAThreads.ts',
      'src/lib/orbVisualSystem.ts',
      'src/lib/visualDNA.ts',
    ],
    status: 'active',
    notes: 'MUST NOT compute identity. Pure visual mapping only. Pipeline: DNA → mapDNAtoVisual → orbProfileGenerator → renderer.',
  },
  {
    name: 'Aurora (AI Engine)',
    internalName: 'Aurora',
    purpose: 'AI engine powering AION. Handles chat, commands, suggestions, proactive actions.',
    files: [
      'src/contexts/AuroraChatContext.tsx',
      'src/contexts/AuroraActionsContext.tsx',
      'src/hooks/aurora/',
      'src/services/unifiedContext.ts',
      'src/services/userMemory.ts',
    ],
    status: 'active',
    notes: 'Not visible as identity to users. Powers AION behind the scenes.',
  },
  {
    name: 'SoulAvatar (Legacy)',
    internalName: 'SoulAvatar',
    purpose: 'Legacy NFT minting system. Being absorbed into AION NFT.',
    files: [
      'src/contexts/SoulAvatarContext.tsx',
      'src/components/web3/SoulAvatarMintWizardGlobal.tsx',
    ],
    status: 'legacy',
    notes: 'Name persists in code for stability. Conceptually part of AION NFT system.',
  },
  {
    name: 'Avatar (3D Character)',
    internalName: 'AvatarConfigurator / avatarStore',
    purpose: 'User-customizable 3D character body. Persisted to avatar_customizations table. Rendered via GLB skinned meshes.',
    files: [
      'src/components/avatar/avatarStore.ts',
      'src/components/avatar/avatarAssets.ts',
      'src/components/avatar/AvatarModel.tsx',
      'src/components/avatar/AvatarConfigurator.tsx',
      'src/components/avatar/AvatarConfiguratorUI.tsx',
      'src/components/avatar/AvatarMiniPreview.tsx',
      'src/components/avatar/Asset.tsx',
      'src/components/avatar/AssetTilePreview.tsx',
      'src/components/founding/FoundingAvatarGroup.tsx',
      'src/hooks/useUserAvatarData.ts',
      'src/pages/AvatarConfiguratorPage.tsx',
    ],
    status: 'active',
    notes: 'Future game body. Zustand store manages customization state. AvatarMiniPreview used in profile/nav/founding. DB table: avatar_customizations.',
  },
];

// ─── HELPER: Get route by ID ─────────────────────────────────────────

export function getRoute(id: string): RouteEntry | undefined {
  return routes.find(r => r.id === id);
}

export function getRoutesByCategory(cat: Category): RouteEntry[] {
  return routes.filter(r => r.category === cat);
}

export function getActiveRoutes(): RouteEntry[] {
  return routes.filter(r => r.status === 'active');
}

export function getCleanupCandidates(): RouteEntry[] {
  return routes.filter(r => r.cleanupPriority !== 'none');
}
