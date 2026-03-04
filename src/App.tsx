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
import { PWAUpdatePrompt } from "@/components/PWAUpdatePrompt";
import { NotificationPermissionPrompt } from "@/components/NotificationPermissionPrompt";
import CookieConsent from "@/components/CookieConsent";
import SubscriptionsModal from "@/components/subscription/SubscriptionsModal";
import { LanguagePrompt } from "@/components/LanguagePrompt";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import RoleRoute from "@/components/RoleRoute";
const ProtectedAppShell = lazy(() => import("./components/layout/ProtectedAppShell"));

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
const CommunityLayoutWrapper = lazy(() => import("./components/community/CommunityLayoutWrapper"));
const Go = lazy(() => import("./pages/Go"));
const FeatureDetailPage = lazy(() => import("./pages/FeatureDetailPage"));
const Messages = lazy(() => import("./pages/Messages"));
const MessageThread = lazy(() => import("./pages/MessageThread"));

const LaunchpadComplete = lazy(() => import("./pages/LaunchpadComplete"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Business = lazy(() => import("./pages/Business"));
const FMHome = lazy(() => import("./pages/FMHome"));
const FMEarn = lazy(() => import("./pages/fm/FMEarn"));
const FMWork = lazy(() => import("./pages/fm/FMWork"));
const FMContribute = lazy(() => import("./pages/fm/FMContribute"));
const FMWalletPage = lazy(() => import("./pages/fm/FMWallet"));
const BusinessJourney = lazy(() => import("./pages/BusinessJourney"));
const BusinessDashboard = lazy(() => import("./pages/BusinessDashboard"));
const LifeHub = lazy(() => import("./pages/LifeHub"));
const LifeLayoutWrapper = lazy(() => import("./components/life/LifeLayoutWrapper"));
const LifeDomainPage = lazy(() => import("./pages/LifeDomainPage"));

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
const WealthAssess = lazy(() => import("./pages/arena/WealthAssess"));
const WealthResults = lazy(() => import("./pages/arena/WealthResults"));
const InfluenceAssess = lazy(() => import("./pages/arena/InfluenceAssess"));
const InfluenceResults = lazy(() => import("./pages/arena/InfluenceResults"));
const RelationshipsAssess = lazy(() => import("./pages/arena/RelationshipsAssess"));
const RelationshipsResults = lazy(() => import("./pages/arena/RelationshipsResults"));
const BusinessAssess = lazy(() => import("./pages/arena/BusinessAssess"));
const BusinessResults = lazy(() => import("./pages/arena/BusinessResults"));
const ProjectsAssess = lazy(() => import("./pages/arena/ProjectsAssess"));
const ProjectsResults = lazy(() => import("./pages/arena/ProjectsResults"));
const PlayAssess = lazy(() => import("./pages/arena/PlayAssess"));
const PlayResults = lazy(() => import("./pages/arena/PlayResults"));
const PresenceChatAssess = lazy(() => import("./pages/life/PresenceChatAssess"));
const PresenceChatResults = lazy(() => import("./pages/life/PresenceChatResults"));
const PowerChatAssess = lazy(() => import("./pages/life/PowerChatAssess"));
const PowerChatResults = lazy(() => import("./pages/life/PowerChatResults"));
const VitalityChatAssess = lazy(() => import("./pages/life/VitalityChatAssess"));
const VitalityChatResults = lazy(() => import("./pages/life/VitalityChatResults"));
const FocusChatAssess = lazy(() => import("./pages/life/FocusChatAssess"));
const FocusChatResults = lazy(() => import("./pages/life/FocusChatResults"));
const CombatChatAssess = lazy(() => import("./pages/life/CombatChatAssess"));
const CombatChatResults = lazy(() => import("./pages/life/CombatChatResults"));
const ExpansionChatAssess = lazy(() => import("./pages/life/ExpansionChatAssess"));
const ExpansionChatResults = lazy(() => import("./pages/life/ExpansionChatResults"));
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
const ArenaDomainPage = lazy(() => import("./pages/ArenaDomainPage"));
const QuestRunnerPage = lazy(() => import("./pages/QuestRunnerPage"));
const LearnLayoutWrapper = lazy(() => import("./components/learn/LearnLayoutWrapper"));

// Panel pages still actively used by /affiliate route
const AffiliatePanel = lazy(() => import("./components/panel/AffiliatePanel"));
const AffiliateDashboardPanel = lazy(() => import("./pages/panel/AffiliateDashboard"));

const MyLinks = lazy(() => import("./pages/panel/MyLinks"));
const MyReferrals = lazy(() => import("./pages/panel/MyReferrals"));
const MyPayouts = lazy(() => import("./pages/panel/MyPayouts"));

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

// Redirect /arena/:domainId/* → /life/:domainId/*
function ArenaToLifeRedirect() {
  const loc = window.location.pathname;
  const newPath = loc.replace(/^\/arena/, '/life');
  return <Navigate to={newPath} replace />;
}

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
                        {/* Feature detail pages */}
                        <Route path="/features/:slug" element={<FeatureDetailPage />} />
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

                        {/* ── Protected routes with root AppShell (header, sidebars, bottom tab) ── */}
                        <Route element={<ProtectedAppShell />}>
                          {/* Community */}
                          <Route path="/community" element={<CommunityLayoutWrapper />} />
                          {/* Messages */}
                          <Route path="/messages" element={<Messages />} />
                          <Route path="/messages/ai" element={<MessageThread />} />
                          <Route path="/messages/:conversationId" element={<MessageThread />} />
                          {/* Dashboard */}
                          <Route path="/dashboard" element={<DashboardLayoutWrapper />} />
                          {/* Life System */}
                          <Route path="/life" element={<LifeLayoutWrapper />} />
                          <Route path="/life/presence" element={<PresenceHome />} />
                          <Route path="/life/presence/scan" element={<PresenceScan />} />
                          <Route path="/life/presence/analyzing" element={<PresenceAnalyzing />} />
                          <Route path="/life/presence/results" element={<PresenceResultsPage />} />
                          <Route path="/life/presence/assess" element={<PresenceChatAssess />} />
                          <Route path="/life/presence/chat-results" element={<PresenceChatResults />} />
                          <Route path="/life/presence/history" element={<PresenceHistory />} />
                          {/* Power */}
                          <Route path="/life/power" element={<PowerHome />} />
                          <Route path="/life/power/assess" element={<PowerChatAssess />} />
                          <Route path="/life/power/chat-results" element={<PowerChatResults />} />
                          <Route path="/life/power/results" element={<PowerResultsPage />} />
                          <Route path="/life/power/history" element={<PowerHistory />} />
                          {/* Vitality */}
                          <Route path="/life/vitality" element={<VitalityHome />} />
                          <Route path="/life/vitality/assess" element={<VitalityChatAssess />} />
                          <Route path="/life/vitality/chat-results" element={<VitalityChatResults />} />
                          <Route path="/life/vitality/intake" element={<VitalityIntake />} />
                          <Route path="/life/vitality/results" element={<VitalityResults />} />
                          <Route path="/life/vitality/history" element={<VitalityHistory />} />
                          {/* Focus */}
                          <Route path="/life/focus" element={<FocusHome />} />
                          <Route path="/life/focus/assess" element={<FocusChatAssess />} />
                          <Route path="/life/focus/chat-results" element={<FocusChatResults />} />
                          <Route path="/life/focus/results" element={<FocusResults />} />
                          <Route path="/life/focus/history" element={<FocusHistory />} />
                          {/* Combat */}
                          <Route path="/life/combat" element={<CombatHome />} />
                          <Route path="/life/combat/assess" element={<CombatChatAssess />} />
                          <Route path="/life/combat/chat-results" element={<CombatChatResults />} />
                          <Route path="/life/combat/results" element={<CombatResults />} />
                          <Route path="/life/combat/history" element={<CombatHistory />} />
                          {/* Expansion */}
                          <Route path="/life/expansion" element={<ExpansionHome />} />
                          <Route path="/life/expansion/assess" element={<ExpansionChatAssess />} />
                          <Route path="/life/expansion/chat-results" element={<ExpansionChatResults />} />
                          <Route path="/life/expansion/results" element={<ExpansionResults />} />
                          <Route path="/life/expansion/history" element={<ExpansionHistory />} />
                          {/* Consciousness */}
                          <Route path="/life/consciousness" element={<ConsciousnessHome />} />
                          <Route path="/life/consciousness/assess" element={<ConsciousnessAssess />} />
                          <Route path="/life/consciousness/results" element={<ConsciousnessResults />} />
                          <Route path="/life/consciousness/history" element={<ConsciousnessHistory />} />
                          {/* Arena domain routes — now under /life */}
                          <Route path="/life/wealth/assess" element={<WealthAssess />} />
                          <Route path="/life/wealth/results" element={<WealthResults />} />
                          <Route path="/life/influence/assess" element={<InfluenceAssess />} />
                          <Route path="/life/influence/results" element={<InfluenceResults />} />
                          <Route path="/life/relationships/assess" element={<RelationshipsAssess />} />
                          <Route path="/life/relationships/results" element={<RelationshipsResults />} />
                          <Route path="/life/business/assess" element={<BusinessAssess />} />
                          <Route path="/life/business/results" element={<BusinessResults />} />
                          <Route path="/life/projects/assess" element={<ProjectsAssess />} />
                          <Route path="/life/projects/results" element={<ProjectsResults />} />
                          <Route path="/life/play/assess" element={<PlayAssess />} />
                          <Route path="/life/play/results" element={<PlayResults />} />
                          {/* Life domain catch-all */}
                          <Route path="/life/:domainId" element={<LifeDomainPage />} />
                          {/* Arena — execution layer */}
                          <Route path="/arena" element={<ArenaLayoutWrapper />} />
                          {/* Arena domain sub-routes redirect to Core assessment pages */}
                          <Route path="/arena/:domainId/*" element={<ArenaToLifeRedirect />} />
                          {/* Coaches */}
                          <Route path="/coaches" element={<CoachesLayoutWrapper />} />
                          {/* Admin Hub */}
                          <Route path="/admin-hub" element={<AdminLayoutWrapper />} />
                          {/* Launchpad */}
                          <Route path="/launchpad/complete" element={<LaunchpadComplete />} />
                          {/* Quests */}
                          <Route path="/quests/:pillar" element={<QuestRunnerPage />} />
                          {/* Learn */}
                          <Route path="/learn" element={<LearnLayoutWrapper />} />
                          {/* FM — Free Market */}
                          <Route path="/fm" element={<FMHome />} />
                          
                          {/* Journeys */}
                          <Route path="/coaching/journey" element={<CoachingJourney />} />
                          <Route path="/coaching/journey/:journeyId" element={<CoachingJourney />} />
                          <Route path="/admin/journey" element={<AdminJourney />} />
                          <Route path="/admin/journey/:journeyId" element={<AdminJourney />} />
                          <Route path="/projects/journey" element={<ProjectsJourney />} />
                          <Route path="/projects/journey/:journeyId" element={<ProjectsJourney />} />
                          {/* Business */}
                          <Route path="/business" element={<Business />} />
                          <Route path="/business/journey" element={<BusinessJourney />} />
                          <Route path="/business/journey/:journeyId" element={<BusinessJourney />} />
                          <Route path="/business/:businessId" element={<BusinessDashboard />} />
                          {/* Personal Hypnosis */}
                          <Route path="/personal-hypnosis/success" element={<PersonalHypnosisSuccess />} />
                          <Route path="/personal-hypnosis/pending" element={<PersonalHypnosisPending />} />
                          {/* Success */}
                          <Route path="/success" element={<Success />} />
                        </Route>

                        {/* Legacy redirects (no shell needed) */}
                        <Route path="/combat-community" element={<Navigate to="/community" replace />} />
                        <Route path="/today" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/plan" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/me" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/aurora" element={<Navigate to="/messages/ai" replace />} />
                        <Route path="/projects" element={<Navigate to="/life" replace />} />
                        {/* Legacy arena redirects — all point to /life now */}
                        <Route path="/life/wealth" element={<Navigate to="/life/wealth" replace />} />
                        <Route path="/life/influence" element={<Navigate to="/life/influence" replace />} />
                        <Route path="/life/relationships" element={<Navigate to="/life/relationships" replace />} />
                        {/* Old pillar routes */}
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
                        {/* Admin redirects */}
                        <Route path="/admin" element={<Navigate to="/admin-hub" replace />} />
                        <Route path="/admin/*" element={<Navigate to="/admin-hub" replace />} />
                        {/* Legacy panel redirects */}
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
                        {/* Coach panel redirects */}
                        <Route path="/coach" element={<Navigate to="/coaches" replace />} />
                        <Route path="/coach/*" element={<Navigate to="/coaches" replace />} />
                        {/* Affiliate Panel */}
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
                      <PWAUpdatePrompt />
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