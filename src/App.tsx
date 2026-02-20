import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CoachesModalProvider } from "@/contexts/CoachesModalContext";
import { AuroraChatProvider } from "@/contexts/AuroraChatContext";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import { SubscriptionsModalProvider } from "@/contexts/SubscriptionsModalContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { GameStateProvider } from "@/contexts/GameStateContext";
import AnalyticsProvider from "@/components/AnalyticsProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import { lazy, Suspense } from "react";
import MatrixRain from "@/components/MatrixRain";
import ConsciousnessField from "@/components/ConsciousnessField";
import ThemeProvider from "@/components/ThemeProvider";
import { useThemeSettings } from "@/hooks/useThemeSettings";
import AffiliateTracker from "@/components/AffiliateTracker";
import FlowAuditProvider from "@/components/FlowAuditProvider";
import { useUTMTracker } from "@/hooks/useUTMTracker";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";
import { NotificationPermissionPrompt } from "@/components/NotificationPermissionPrompt";
import CookieConsent from "@/components/CookieConsent";
import SubscriptionsModal from "@/components/subscription/SubscriptionsModal";
import { LanguagePrompt } from "@/components/LanguagePrompt";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import RoleRoute from "@/components/RoleRoute";

import { PageSkeleton } from "@/components/ui/skeleton";

import { useAuth } from "@/contexts/AuthContext";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const DashboardLayoutWrapper = lazy(() => import("./components/dashboard/DashboardLayoutWrapper"));

const Courses = lazy(() => import("./pages/Courses"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const CourseWatch = lazy(() => import("./pages/CourseWatch"));
const Subscriptions = lazy(() => import("./pages/Subscriptions"));
const Success = lazy(() => import("./pages/Success"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const Install = lazy(() => import("./pages/Install"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));
const FormView = lazy(() => import("./pages/FormView"));
const AudioPlayer = lazy(() => import("./pages/AudioPlayer"));
const VideoPlayer = lazy(() => import("./pages/VideoPlayer"));
const PersonalHypnosisLanding = lazy(() => import("./pages/PersonalHypnosisLanding"));
const PersonalHypnosisSuccess = lazy(() => import("./pages/PersonalHypnosisSuccess"));
const PersonalHypnosisPending = lazy(() => import("./pages/PersonalHypnosisPending"));
const ConsciousnessLeapLanding = lazy(() => import("./pages/ConsciousnessLeapLanding"));
const ConsciousnessLeapApply = lazy(() => import("./pages/ConsciousnessLeapApply"));
const AffiliateSignup = lazy(() => import("./pages/AffiliateSignup"));
const OrbGallery = lazy(() => import("./pages/dev/OrbGallery"));
const DynamicLandingPage = lazy(() => import("./pages/DynamicLandingPage"));
const Community = lazy(() => import("./pages/Community"));
const Go = lazy(() => import("./pages/Go"));
const CommunityPost = lazy(() => import("./pages/CommunityPost"));
const CommunityEvents = lazy(() => import("./pages/CommunityEvents"));
const CommunityMembers = lazy(() => import("./pages/CommunityMembers"));
const CommunityLeaderboard = lazy(() => import("./pages/CommunityLeaderboard"));
const CommunityProfile = lazy(() => import("./pages/CommunityProfile"));
const Messages = lazy(() => import("./pages/Messages"));
const MessageThread = lazy(() => import("./pages/MessageThread"));

const LaunchpadComplete = lazy(() => import("./pages/LaunchpadComplete"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Business = lazy(() => import("./pages/Business"));
const BusinessJourney = lazy(() => import("./pages/BusinessJourney"));
const BusinessDashboard = lazy(() => import("./pages/BusinessDashboard"));
const LifeHub = lazy(() => import("./pages/LifeHub"));
const LifeLayoutWrapper = lazy(() => import("./components/life/LifeLayoutWrapper"));
const LifeDomainPage = lazy(() => import("./pages/LifeDomainPage"));
const PresencePage = lazy(() => import("./pages/PresencePage"));
const PresenceHome = lazy(() => import("./pages/presence/PresenceHome"));
const PresenceScan = lazy(() => import("./pages/presence/PresenceScan"));
const PresenceAnalyzing = lazy(() => import("./pages/presence/PresenceAnalyzing"));
const PresenceResultsPage = lazy(() => import("./pages/presence/PresenceResultsPage"));
const PresenceHistory = lazy(() => import("./pages/presence/PresenceHistory"));
const PowerHome = lazy(() => import("./pages/power/PowerHome"));
const PowerAssess = lazy(() => import("./pages/power/PowerAssess"));
const PowerResultsPage = lazy(() => import("./pages/power/PowerResultsPage"));
const PowerHistory = lazy(() => import("./pages/power/PowerHistory"));
const VitalityHome = lazy(() => import("./pages/vitality/VitalityHome"));
const VitalityIntake = lazy(() => import("./pages/vitality/VitalityIntake"));
const VitalityResults = lazy(() => import("./pages/vitality/VitalityResults"));
const VitalityHistory = lazy(() => import("./pages/vitality/VitalityHistory"));
const FocusHome = lazy(() => import("./pages/focus/FocusHome"));
const FocusAssess = lazy(() => import("./pages/focus/FocusAssess"));
const FocusResults = lazy(() => import("./pages/focus/FocusResults"));
const FocusHistory = lazy(() => import("./pages/focus/FocusHistory"));
const CombatHome = lazy(() => import("./pages/combat/CombatHome"));
const CombatAssess = lazy(() => import("./pages/combat/CombatAssess"));
const CombatResults = lazy(() => import("./pages/combat/CombatResults"));
const CombatHistory = lazy(() => import("./pages/combat/CombatHistory"));
const ExpansionHome = lazy(() => import("./pages/expansion/ExpansionHome"));
const ExpansionAssess = lazy(() => import("./pages/expansion/ExpansionAssess"));
const ExpansionResults = lazy(() => import("./pages/expansion/ExpansionResults"));
const ExpansionHistory = lazy(() => import("./pages/expansion/ExpansionHistory"));
const ConsciousnessHome = lazy(() => import("./pages/consciousness/ConsciousnessHome"));
const ConsciousnessAssess = lazy(() => import("./pages/consciousness/ConsciousnessAssess"));
const ConsciousnessResults = lazy(() => import("./pages/consciousness/ConsciousnessResults"));
const ConsciousnessHistory = lazy(() => import("./pages/consciousness/ConsciousnessHistory"));
const Projects = lazy(() => import("./pages/Projects"));
const Coaches = lazy(() => import("./pages/Coaches"));
const CoachingJourney = lazy(() => import("./pages/CoachingJourney"));
const AdminJourney = lazy(() => import("./pages/AdminJourney"));
const ProjectsJourney = lazy(() => import("./pages/ProjectsJourney"));
const CoachProfile = lazy(() => import("./pages/PractitionerProfile"));
const CoachSlugRedirect = lazy(() => import("./components/coach/CoachSlugRedirect"));
const AdminLayoutWrapper = lazy(() => import("./components/admin/AdminLayoutWrapper"));
const ProjectsLayoutWrapper = lazy(() => import("./components/projects/ProjectsLayoutWrapper"));
const ArenaLayoutWrapper = lazy(() => import("./components/arena/ArenaLayoutWrapper"));
const QuestRunnerPage = lazy(() => import("./pages/QuestRunnerPage"));
// Panel pages still actively used by /affiliate route
const AffiliatePanel = lazy(() => import("./components/panel/AffiliatePanel"));
const AffiliateDashboardPanel = lazy(() => import("./pages/panel/AffiliateDashboard"));

const MyLinks = lazy(() => import("./pages/panel/MyLinks"));
const MyReferrals = lazy(() => import("./pages/panel/MyReferrals"));
const MyPayouts = lazy(() => import("./pages/panel/MyPayouts"));
// Storefront
const StorefrontLayout = lazy(() => import("./pages/storefront/StorefrontLayout"));
const StorefrontHome = lazy(() => import("./pages/storefront/StorefrontHome"));
const StorefrontLogin = lazy(() => import("./pages/storefront/StorefrontLogin"));
const StorefrontSignup = lazy(() => import("./pages/storefront/StorefrontSignup"));
const StorefrontCourses = lazy(() => import("./pages/storefront/StorefrontCourses"));
const StorefrontClientDashboard = lazy(() => import("./pages/storefront/StorefrontClientDashboard"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Wrapper that injects coach sidebars when user is a coach
const CoachesLayoutWrapper = lazy(() => import('./components/coach/CoachesLayoutWrapper'));

// Background effect wrapper component
const BackgroundEffect = () => {
  const { theme } = useThemeSettings();
  
  switch (theme.background_effect) {
    case 'matrix_rain':
      return <MatrixRain />;
    case 'consciousness_field':
      return <ConsciousnessField />;
    default:
      return (
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 dark:from-primary/15 dark:via-transparent dark:to-accent/15 pointer-events-none" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/3 dark:bg-primary/10 blur-[120px] -translate-y-1/3 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent/3 dark:bg-accent/10 blur-[100px] translate-y-1/3 -translate-x-1/4" />
        </div>
      );
  }
};

// UTM tracker wrapper (hook needs to be inside BrowserRouter)
const UTMTrackerMount = () => {
  useUTMTracker();
  return null;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BackgroundEffect />
        <div className="relative z-10">
            <AuthProvider>
              <AuroraChatProvider>
               <LanguageProvider>
               <AuthModalProvider>
                <GameStateProvider>
                <SubscriptionsModalProvider>
                 <CoachesModalProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                <LanguagePrompt />
                <BrowserRouter>
                   <FlowAuditProvider>
                   <AffiliateTracker />
                   <UTMTrackerMount />
                   <AnalyticsProvider>
                    <Suspense fallback={<PageSkeleton />}>
                      <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<Index />} />
                        {/* /login and /signup redirect to home (auth is now modal-based) */}
                        <Route path="/signup" element={<Navigate to="/" replace />} />
                        <Route path="/login" element={<Navigate to="/" replace />} />
                        <Route path="/courses" element={<Courses />} />
                        <Route path="/courses/:slug" element={<CourseDetail />} />
                        <Route path="/courses/:slug/watch" element={<CourseWatch />} />
                        <Route path="/subscriptions" element={<Subscriptions />} />
                        <Route path="/install" element={<Install />} />
                        <Route path="/audio/:token" element={<AudioPlayer />} />
                        <Route path="/video/:token" element={<VideoPlayer />} />
                        <Route path="/personal-hypnosis" element={<PersonalHypnosisLanding />} />
                        <Route path="/consciousness-leap" element={<ConsciousnessLeapLanding />} />
                        <Route path="/consciousness-leap/apply/:token" element={<ConsciousnessLeapApply />} />
                        <Route path="/form/:token" element={<FormView />} />
                        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                        <Route path="/terms-of-service" element={<TermsOfService />} />
                        <Route path="/affiliate-signup" element={<AffiliateSignup />} />
                        {/* Onboarding — new entry point */}
                        <Route path="/onboarding" element={<Onboarding />} />
                        {/* Ad landing page */}
                        <Route path="/go" element={<Go />} />
                        {/* Legacy redirects → onboarding */}
                        <Route path="/start" element={<Navigate to="/onboarding" replace />} />
                        <Route path="/free-journey" element={<Navigate to="/onboarding" replace />} />
                        <Route path="/free-journey/start" element={<Navigate to="/onboarding" replace />} />
                        <Route path="/free-journey/complete" element={<Navigate to="/launchpad/complete" replace />} />
                        {/* ── Canonical Routes ──
                         * /p/:slug          → Coach public storefront (CANONICAL)
                         * /coach/:slug      → Alias, redirects to /p/:slug
                         * /practitioners    → Alias, redirects to /coaches directory
                         * /practitioner/*   → Legacy, redirects to /coaches
                         * /panel/*          → Legacy, all redirect to /admin-hub
                         */}
                        <Route path="/practitioners" element={<Navigate to="/coaches" replace />} />
                        <Route path="/marketplace" element={<Navigate to="/coaches" replace />} />
                        <Route path="/practitioner/:slug" element={<CoachSlugRedirect />} />
                        <Route path="/practitioners/:slug" element={<CoachSlugRedirect />} />
                        {/* Coach slug alias → storefront */}
                        <Route path="/coach/:slug" element={<CoachSlugRedirect />} />
                        {/* Redirect old affiliate dashboard to new panel */}
                        <Route
                          path="/affiliate-dashboard"
                          element={<Navigate to="/affiliate" replace />}
                        />
                        <Route path="/unsubscribe" element={<Unsubscribe />} />

                        {/* Community routes (protected) */}
                        <Route
                          path="/community"
                          element={
                            <ProtectedRoute>
                              <Community />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/community/post/:id"
                          element={
                            <ProtectedRoute>
                              <CommunityPost />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/community/events"
                          element={
                            <ProtectedRoute>
                              <CommunityEvents />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/community/members"
                          element={
                            <ProtectedRoute>
                              <CommunityMembers />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/community/leaderboard"
                          element={
                            <ProtectedRoute>
                              <CommunityLeaderboard />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/community/profile/:userId"
                          element={
                            <ProtectedRoute>
                              <CommunityProfile />
                            </ProtectedRoute>
                          }
                        />
                        
                        {/* Messages routes (protected) */}
                        <Route
                          path="/messages"
                          element={
                            <ProtectedRoute>
                              <Messages />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/messages/ai"
                          element={
                            <ProtectedRoute>
                              <MessageThread />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/messages/:conversationId"
                          element={
                            <ProtectedRoute>
                              <MessageThread />
                            </ProtectedRoute>
                          }
                        />


                        {/* Hypnosis library → redirect to dashboard */}
                        <Route path="/hypnosis" element={<Navigate to="/dashboard" replace />} />

                        {/* Dynamic Landing Pages */}
                        <Route path="/lp/:slug" element={<DynamicLandingPage />} />
                        
                        {/* Coach Storefront Routes (canonical: /p/:slug) */}
                        <Route path="/p/:practitionerSlug" element={<StorefrontLayout />}>
                          <Route index element={<StorefrontHome />} />
                          <Route path="login" element={<StorefrontLogin />} />
                          <Route path="signup" element={<StorefrontSignup />} />
                          <Route path="courses" element={<StorefrontCourses />} />
                          <Route path="dashboard" element={<StorefrontClientDashboard />} />
                        </Route>

                        {/* Protected user routes */}
                        <Route
                          path="/personal-hypnosis/success"
                          element={
                            <ProtectedRoute>
                              <PersonalHypnosisSuccess />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/personal-hypnosis/pending"
                          element={
                            <ProtectedRoute>
                              <PersonalHypnosisPending />
                            </ProtectedRoute>
                          }
                        />
                        {/* Unified Dashboard */}
                        <Route
                          path="/dashboard"
                          element={
                            <ProtectedRoute>
                              <DashboardLayoutWrapper />
                            </ProtectedRoute>
                          }
                        />
                        {/* Life System */}
                        <Route
                          path="/life"
                          element={
                            <ProtectedRoute>
                              <LifeLayoutWrapper />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/life/presence"
                          element={
                            <ProtectedRoute>
                              <PresenceHome />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/life/presence/scan"
                          element={
                            <ProtectedRoute>
                              <PresenceScan />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/life/presence/analyzing"
                          element={
                            <ProtectedRoute>
                              <PresenceAnalyzing />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/life/presence/results"
                          element={
                            <ProtectedRoute>
                              <PresenceResultsPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/life/presence/assess"
                          element={<Navigate to="/life/presence" replace />}
                        />
                        <Route
                          path="/life/presence/history"
                          element={
                            <ProtectedRoute>
                              <PresenceHistory />
                            </ProtectedRoute>
                          }
                        />
                        {/* Power pillar routes */}
                        <Route
                          path="/life/power"
                          element={
                            <ProtectedRoute>
                              <PowerHome />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/life/power/assess"
                          element={
                            <ProtectedRoute>
                              <PowerAssess />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/life/power/results"
                          element={
                            <ProtectedRoute>
                              <PowerResultsPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/life/power/history"
                          element={
                            <ProtectedRoute>
                              <PowerHistory />
                            </ProtectedRoute>
                          }
                        />
                        {/* Vitality pillar routes */}
                        <Route
                          path="/life/vitality"
                          element={
                            <ProtectedRoute>
                              <VitalityHome />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/life/vitality/intake"
                          element={
                            <ProtectedRoute>
                              <VitalityIntake />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/life/vitality/results"
                          element={
                            <ProtectedRoute>
                              <VitalityResults />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/life/vitality/history"
                          element={
                            <ProtectedRoute>
                              <VitalityHistory />
                            </ProtectedRoute>
                          }
                        />
                        {/* Focus pillar routes */}
                        <Route
                          path="/life/focus"
                          element={
                            <ProtectedRoute>
                              <FocusHome />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/life/focus/assess"
                          element={
                            <ProtectedRoute>
                              <FocusAssess />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/life/focus/results"
                          element={
                            <ProtectedRoute>
                              <FocusResults />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/life/focus/history"
                          element={
                            <ProtectedRoute>
                              <FocusHistory />
                            </ProtectedRoute>
                          }
                        />
                        {/* Combat pillar routes */}
                        <Route
                          path="/life/combat"
                          element={
                            <ProtectedRoute>
                              <CombatHome />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/life/combat/assess"
                          element={
                            <ProtectedRoute>
                              <CombatAssess />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/life/combat/results"
                          element={
                            <ProtectedRoute>
                              <CombatResults />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/life/combat/history"
                          element={
                            <ProtectedRoute>
                              <CombatHistory />
                            </ProtectedRoute>
                          }
                        />
                        {/* Expansion pillar routes */}
                        <Route
                          path="/life/expansion"
                          element={
                            <ProtectedRoute>
                              <ExpansionHome />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/life/expansion/assess"
                          element={
                            <ProtectedRoute>
                              <ExpansionAssess />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/life/expansion/results"
                          element={
                            <ProtectedRoute>
                              <ExpansionResults />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/life/expansion/history"
                          element={
                            <ProtectedRoute>
                              <ExpansionHistory />
                            </ProtectedRoute>
                          }
                        />
                        {/* Consciousness pillar routes */}
                        <Route
                          path="/life/consciousness"
                          element={
                            <ProtectedRoute>
                              <ConsciousnessHome />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/life/consciousness/assess"
                          element={
                            <ProtectedRoute>
                              <ConsciousnessAssess />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/life/consciousness/results"
                          element={
                            <ProtectedRoute>
                              <ConsciousnessResults />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/life/consciousness/history"
                          element={
                            <ProtectedRoute>
                              <ConsciousnessHistory />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/life/:domainId"
                          element={
                            <ProtectedRoute>
                              <LifeDomainPage />
                            </ProtectedRoute>
                          }
                        />
                        {/* Legacy tab routes → redirect to dashboard */}
                        <Route path="/today" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/plan" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/me" element={<Navigate to="/dashboard" replace />} />
                        {/* Aurora → Messages AI */}
                        <Route path="/aurora" element={<Navigate to="/messages/ai" replace />} />
                        {/* Arena - sidebar-driven layout (replaces Projects) */}
                        <Route
                          path="/arena"
                          element={
                            <ProtectedRoute>
                              <ArenaLayoutWrapper />
                            </ProtectedRoute>
                          }
                        />
                        {/* Legacy /projects redirect to Arena */}
                        <Route path="/projects" element={<Navigate to="/arena" replace />} />
                        {/* Coaches */}
                        <Route
                          path="/coaches"
                          element={
                            <ProtectedRoute>
                              <CoachesLayoutWrapper />
                            </ProtectedRoute>
                          }
                        />
                        {/* Admin Hub - sidebar-driven layout */}
                        <Route
                          path="/admin-hub"
                          element={
                            <ProtectedRoute>
                              <AdminLayoutWrapper />
                            </ProtectedRoute>
                          }
                        />
                        <Route path="/launchpad" element={<Navigate to="/onboarding" replace />} />
                        <Route
                          path="/launchpad/complete"
                          element={
                            <ProtectedRoute>
                              <LaunchpadComplete />
                            </ProtectedRoute>
                          }
                        />
                        {/* Pillar Quests — redirect to onboarding */}
                        <Route path="/quests" element={<Navigate to="/onboarding" replace />} />
                        <Route
                          path="/quests/:pillar"
                          element={
                            <ProtectedRoute>
                              <QuestRunnerPage />
                            </ProtectedRoute>
                          }
                        />
                        {/* Coaching Journey */}
                        <Route
                          path="/coaching/journey"
                          element={
                            <ProtectedRoute>
                              <CoachingJourney />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/coaching/journey/:journeyId"
                          element={
                            <ProtectedRoute>
                              <CoachingJourney />
                            </ProtectedRoute>
                          }
                        />
                        {/* Admin Journey */}
                        <Route
                          path="/admin/journey"
                          element={
                            <ProtectedRoute>
                              <AdminJourney />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/journey/:journeyId"
                          element={
                            <ProtectedRoute>
                              <AdminJourney />
                            </ProtectedRoute>
                          }
                        />
                        {/* Projects Journey */}
                        <Route
                          path="/projects/journey"
                          element={
                            <ProtectedRoute>
                              <ProjectsJourney />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/projects/journey/:journeyId"
                          element={
                            <ProtectedRoute>
                              <ProjectsJourney />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/business"
                          element={
                            <ProtectedRoute>
                              <Business />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/business/journey"
                          element={
                            <ProtectedRoute>
                              <BusinessJourney />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/business/journey/:journeyId"
                          element={
                            <ProtectedRoute>
                              <BusinessJourney />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/business/:businessId"
                          element={
                            <ProtectedRoute>
                              <BusinessDashboard />
                            </ProtectedRoute>
                          }
                        />
                        {/* Old pillar routes → redirect to /life */}
                        <Route path="/consciousness" element={<Navigate to="/life" replace />} />
                        <Route path="/health" element={<Navigate to="/life" replace />} />
                        <Route path="/health/journey" element={<Navigate to="/life" replace />} />
                        <Route path="/health/journey/:id" element={<Navigate to="/life" replace />} />
                        <Route path="/health/plan" element={<Navigate to="/life" replace />} />
                        <Route path="/relationships" element={<Navigate to="/life" replace />} />
                        <Route path="/relationships/journey" element={<Navigate to="/life" replace />} />
                        <Route path="/relationships/journey/:id" element={<Navigate to="/life" replace />} />
                        <Route path="/finances" element={<Navigate to="/life" replace />} />
                        <Route path="/finances/journey" element={<Navigate to="/life" replace />} />
                        <Route path="/finances/journey/:id" element={<Navigate to="/life" replace />} />
                        <Route path="/learning" element={<Navigate to="/life" replace />} />
                        <Route path="/learning/journey" element={<Navigate to="/life" replace />} />
                        <Route path="/learning/journey/:id" element={<Navigate to="/life" replace />} />
                        <Route path="/purpose" element={<Navigate to="/life" replace />} />
                        <Route path="/purpose/journey" element={<Navigate to="/life" replace />} />
                        <Route path="/purpose/journey/:id" element={<Navigate to="/life" replace />} />
                        <Route path="/hobbies" element={<Navigate to="/life" replace />} />
                        <Route path="/hobbies/journey" element={<Navigate to="/life" replace />} />
                        <Route path="/hobbies/journey/:id" element={<Navigate to="/life" replace />} />
                        <Route
                          path="/success"
                          element={
                            <ProtectedRoute>
                              <Success />
                            </ProtectedRoute>
                          }
                        />

                        {/* Admin routes redirect to /admin-hub */}
                        <Route path="/admin" element={<Navigate to="/admin-hub" replace />} />
                        <Route path="/admin/*" element={<Navigate to="/admin-hub" replace />} />

                        {/* Legacy /panel routes redirect to /admin-hub */}
                        <Route path="/panel" element={<Navigate to="/admin-hub" replace />} />
                        <Route path="/panel/analytics" element={<Navigate to="/admin-hub?tab=overview&sub=analytics" replace />} />
                        <Route path="/panel/notifications" element={<Navigate to="/admin-hub?tab=overview&sub=notifications" replace />} />
                        <Route path="/panel/users" element={<Navigate to="/admin-hub?tab=admin&sub=users" replace />} />
                        <Route path="/panel/roles" element={<Navigate to="/admin-hub?tab=admin&sub=roles" replace />} />
                        <Route path="/panel/leads" element={<Navigate to="/admin-hub?tab=admin&sub=leads" replace />} />
                        <Route path="/panel/businesses" element={<Navigate to="/admin-hub?tab=admin&sub=businesses" replace />} />
                        <Route path="/panel/aurora-insights" element={<Navigate to="/admin-hub?tab=admin&sub=aurora-insights" replace />} />
                        <Route path="/panel/affiliates" element={<Navigate to="/admin-hub?tab=campaigns&sub=affiliates" replace />} />
                        <Route path="/panel/newsletter" element={<Navigate to="/admin-hub?tab=campaigns&sub=newsletter" replace />} />
                        <Route path="/panel/offers" element={<Navigate to="/admin-hub?tab=campaigns&sub=offers" replace />} />
                        <Route path="/panel/purchases" element={<Navigate to="/admin-hub?tab=campaigns&sub=purchases" replace />} />
                        <Route path="/panel/products" element={<Navigate to="/admin-hub?tab=content&sub=products" replace />} />
                        <Route path="/panel/content" element={<Navigate to="/admin-hub?tab=content&sub=content-mgmt" replace />} />
                        <Route path="/panel/videos" element={<Navigate to="/admin-hub?tab=content&sub=videos" replace />} />
                        <Route path="/panel/recordings" element={<Navigate to="/admin-hub?tab=content&sub=recordings" replace />} />
                        <Route path="/panel/forms" element={<Navigate to="/admin-hub?tab=content&sub=forms" replace />} />
                        <Route path="/panel/landing-pages" element={<Navigate to="/admin-hub?tab=site&sub=landing-pages" replace />} />
                        <Route path="/panel/homepage" element={<Navigate to="/admin-hub?tab=site&sub=homepage" replace />} />
                        <Route path="/panel/theme" element={<Navigate to="/admin-hub?tab=site&sub=theme" replace />} />
                        <Route path="/panel/faqs" element={<Navigate to="/admin-hub?tab=site&sub=faqs" replace />} />
                        <Route path="/panel/testimonials" element={<Navigate to="/admin-hub?tab=site&sub=testimonials" replace />} />
                        <Route path="/panel/bug-reports" element={<Navigate to="/admin-hub?tab=system&sub=bug-reports" replace />} />
                        <Route path="/panel/chat-assistant" element={<Navigate to="/admin-hub?tab=system&sub=chat-assistant" replace />} />
                        <Route path="/panel/settings" element={<Navigate to="/admin-hub?tab=system&sub=settings" replace />} />
                        <Route path="/panel/*" element={<Navigate to="/admin-hub" replace />} />

                        {/* Coach Panel — redirect to /coaches for practitioners */}
                        <Route path="/coach" element={<Navigate to="/coaches" replace />} />
                        <Route path="/coach/*" element={<Navigate to="/coaches" replace />} />

                        {/* Affiliate Panel routes */}
                        <Route
                          path="/affiliate"
                          element={
                            <RoleRoute allowedRoles={['affiliate']}>
                              <AffiliatePanel />
                            </RoleRoute>
                          }
                        >
                          <Route index element={<AffiliateDashboardPanel />} />
                          <Route path="links" element={<MyLinks />} />
                          <Route path="referrals" element={<MyReferrals />} />
                          <Route path="payouts" element={<MyPayouts />} />
                        </Route>

                        {/* Dev routes */}
                        <Route path="/dev/orb-gallery" element={<OrbGallery />} />

                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                      <PWAInstallBanner />
                      <NotificationPermissionPrompt />
                      <CookieConsent />
                      <SubscriptionsModal />
                      
                    </Suspense>
                  </AnalyticsProvider>
                   </FlowAuditProvider>
                </BrowserRouter>
                </TooltipProvider>
                </CoachesModalProvider>
                </SubscriptionsModalProvider>
              </GameStateProvider>
             </AuthModalProvider>
               </LanguageProvider>
            </AuroraChatProvider>
          </AuthProvider>
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;