import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SmartOnboardingProvider } from "@/contexts/SmartOnboardingContext";
import { CoachesModalProvider } from "@/contexts/CoachesModalContext";
import { AuroraChatProvider } from "@/contexts/AuroraChatContext";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import { SubscriptionsModalProvider } from "@/contexts/SubscriptionsModalContext";
import { WalletModalProvider } from "@/contexts/WalletModalContext";
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
import { WalletModal } from "@/components/fm/WalletModal";
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
const AudioPlayer = lazy(() => import("./pages/AudioPlayer"));
const VideoPlayer = lazy(() => import("./pages/VideoPlayer"));
const AffiliateSignup = lazy(() => import("./pages/AffiliateSignup"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Documentation = lazy(() => import("./pages/Documentation"));
const OrbGallery = lazy(() => import("./pages/dev/OrbGallery"));
const OrbGalleryPage = lazy(() => import("./pages/OrbGallery"));
const CommunityLayoutWrapper = lazy(() => import("./components/community/CommunityLayoutWrapper"));
const CommunityThread = lazy(() => import("./pages/CommunityThread"));
const Go = lazy(() => import("./pages/Go"));
const FeatureDetailPage = lazy(() => import("./pages/FeatureDetailPage"));
const Messages = lazy(() => import("./pages/Messages"));
const MessageThread = lazy(() => import("./pages/MessageThread"));
const AuroraPage = lazy(() => import("./pages/AuroraPage"));

const LaunchpadComplete = lazy(() => import("./pages/LaunchpadComplete"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const OnboardingCeremony = lazy(() => import("./pages/OnboardingCeremony"));
import { BusinessIndexWrapper, BusinessDashboardWrapper, BusinessJourneyWrapper } from './components/business/BusinessLayoutWrapper';
const FMAppShell = lazy(() => import("./components/fm/FMAppShell"));
import EarnLayoutWrapper from "./components/fm/EarnLayoutWrapper";
import FMHomeLayoutWrapper from "./components/fm/FMHomeLayoutWrapper";
import FMWorkLayoutWrapper from "./components/fm/FMWorkLayoutWrapper";

import FMMarketLayoutWrapper from "./components/fm/FMMarketLayoutWrapper";
const FMContribute = lazy(() => import("./pages/fm/FMContribute"));
const FMCashout = lazy(() => import("./pages/fm/FMCashout"));
const FMBridge = lazy(() => import("./pages/fm/FMBridge"));
const Freelancer = lazy(() => import("./pages/Freelancer"));
const Creator = lazy(() => import("./pages/Creator"));
import FreelancerLayoutWrapper from "./components/freelancer/FreelancerLayoutWrapper";
import CreatorLayoutWrapper from "./components/creator/CreatorLayoutWrapper";
import TherapistLayoutWrapper from "./components/therapist/TherapistLayoutWrapper";
const LifeHub = lazy(() => import("./pages/LifeHub"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const LifeLayoutWrapper = lazy(() => import("./components/life/LifeLayoutWrapper"));
const PlayLayoutWrapper = lazy(() => import("./components/plan/PlayLayoutWrapper"));
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
const WorkLayoutWrapper = lazy(() => import("./components/work/WorkLayoutWrapper"));

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

// Redirect old /arena/:domainId/* → /play (via /strategy/:domainId/*)
function ArenaToStrategyRedirect() {
  const loc = window.location.pathname;
  const newPath = loc.replace(/^\/arena/, '/strategy');
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
                 <WalletModalProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                <LanguagePrompt />
                <BrowserRouter>
                   <FlowAuditProvider>
                   <AffiliateTracker />
                   <UTMTrackerMount />
                    <AnalyticsProvider>
                    <SmartOnboardingProvider>
                    <Suspense fallback={<PageSkeleton />}>
                      <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<Index />} />
                        {/* /login and /signup redirect to home (auth is now modal-based) */}
                        <Route path="/signup" element={<Navigate to="/" replace />} />
                        <Route path="/login" element={<Navigate to="/" replace />} />
                        <Route path="/blog" element={<Blog />} />
                        <Route path="/blog/:slug" element={<BlogPost />} />
                        <Route path="/courses" element={<Courses />} />
                        <Route path="/courses/:slug" element={<CourseDetail />} />
                        <Route path="/courses/:slug/watch" element={<CourseWatch />} />
                        <Route path="/subscriptions" element={<Subscriptions />} />
                        <Route path="/install" element={<Install />} />
                        <Route path="/audio/:token" element={<AudioPlayer />} />
                        <Route path="/video/:token" element={<VideoPlayer />} />
                        {/* Legacy product pages redirect to home */}
                        <Route path="/personal-hypnosis" element={<Navigate to="/" replace />} />
                        <Route path="/consciousness-leap" element={<Navigate to="/" replace />} />
                        <Route path="/consciousness-leap/apply/:token" element={<Navigate to="/" replace />} />
                        <Route path="/form/:token" element={<Navigate to="/" replace />} />
                        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                        <Route path="/terms-of-service" element={<TermsOfService />} />
                        <Route path="/affiliate-signup" element={<AffiliateSignup />} />
                        {/* Onboarding — new entry point */}
                        <Route path="/onboarding" element={<Onboarding />} />
                        <Route path="/ceremony" element={<OnboardingCeremony />} />
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
                        <Route path="/docs" element={<Documentation />} />

                        {/* ── Protected routes with root AppShell (header, sidebars, bottom tab) ── */}
                        <Route element={<ProtectedAppShell />}>
                          {/* Community */}
                          <Route path="/community" element={<CommunityLayoutWrapper />} />
                          <Route path="/community/post/:postId" element={<CommunityThread />} />
                          {/* Messages */}
                          <Route path="/messages" element={<Messages />} />
                          <Route path="/messages/:conversationId" element={<MessageThread />} />
                          {/* Aurora Chat */}
                          <Route path="/aurora" element={<AuroraPage />} />
                          {/* Legacy redirects to Play */}
                          <Route path="/now" element={<Navigate to="/play" replace />} />
                          <Route path="/plan" element={<Navigate to="/play" replace />} />
                          {/* Play (merged Strategy + Tactics) */}
                          <Route path="/play" element={<PlayLayoutWrapper />} />
                          {/* Profile page */}
                          <Route path="/profile" element={<ProfilePage />} />
                          {/* Strategy sub-routes for pillar assessments */}
                          <Route path="/strategy" element={<Navigate to="/play" replace />} />
                          <Route path="/strategy/presence" element={<PresenceHome />} />
                          <Route path="/strategy/presence/scan" element={<PresenceScan />} />
                          <Route path="/strategy/presence/analyzing" element={<PresenceAnalyzing />} />
                          <Route path="/strategy/presence/results" element={<PresenceResultsPage />} />
                          <Route path="/strategy/presence/assess" element={<PresenceChatAssess />} />
                          <Route path="/strategy/presence/chat-results" element={<PresenceChatResults />} />
                          <Route path="/strategy/presence/history" element={<PresenceHistory />} />
                          {/* Power */}
                          <Route path="/strategy/power" element={<PowerHome />} />
                          <Route path="/strategy/power/assess" element={<PowerChatAssess />} />
                          <Route path="/strategy/power/chat-results" element={<PowerChatResults />} />
                          <Route path="/strategy/power/results" element={<PowerResultsPage />} />
                          <Route path="/strategy/power/history" element={<PowerHistory />} />
                          {/* Vitality */}
                          <Route path="/strategy/vitality" element={<VitalityHome />} />
                          <Route path="/strategy/vitality/assess" element={<VitalityChatAssess />} />
                          <Route path="/strategy/vitality/chat-results" element={<VitalityChatResults />} />
                          <Route path="/strategy/vitality/intake" element={<VitalityIntake />} />
                          <Route path="/strategy/vitality/results" element={<VitalityResults />} />
                          <Route path="/strategy/vitality/history" element={<VitalityHistory />} />
                          {/* Focus */}
                          <Route path="/strategy/focus" element={<FocusHome />} />
                          <Route path="/strategy/focus/assess" element={<FocusChatAssess />} />
                          <Route path="/strategy/focus/chat-results" element={<FocusChatResults />} />
                          <Route path="/strategy/focus/results" element={<FocusResults />} />
                          <Route path="/strategy/focus/history" element={<FocusHistory />} />
                          {/* Combat */}
                          <Route path="/strategy/combat" element={<CombatHome />} />
                          <Route path="/strategy/combat/assess" element={<CombatChatAssess />} />
                          <Route path="/strategy/combat/chat-results" element={<CombatChatResults />} />
                          <Route path="/strategy/combat/results" element={<CombatResults />} />
                          <Route path="/strategy/combat/history" element={<CombatHistory />} />
                          {/* Expansion */}
                          <Route path="/strategy/expansion" element={<ExpansionHome />} />
                          <Route path="/strategy/expansion/assess" element={<ExpansionChatAssess />} />
                          <Route path="/strategy/expansion/chat-results" element={<ExpansionChatResults />} />
                          <Route path="/strategy/expansion/results" element={<ExpansionResults />} />
                          <Route path="/strategy/expansion/history" element={<ExpansionHistory />} />
                          {/* Consciousness */}
                          <Route path="/strategy/consciousness" element={<ConsciousnessHome />} />
                          <Route path="/strategy/consciousness/assess" element={<ConsciousnessAssess />} />
                          <Route path="/strategy/consciousness/results" element={<ConsciousnessResults />} />
                          <Route path="/strategy/consciousness/history" element={<ConsciousnessHistory />} />
                          {/* Arena domain routes — now under /strategy */}
                          <Route path="/strategy/wealth/assess" element={<WealthAssess />} />
                          <Route path="/strategy/wealth/results" element={<WealthResults />} />
                          <Route path="/strategy/influence/assess" element={<InfluenceAssess />} />
                          <Route path="/strategy/influence/results" element={<InfluenceResults />} />
                          <Route path="/strategy/relationships/assess" element={<RelationshipsAssess />} />
                          <Route path="/strategy/relationships/results" element={<RelationshipsResults />} />
                          <Route path="/strategy/business/assess" element={<BusinessAssess />} />
                          <Route path="/strategy/business/results" element={<BusinessResults />} />
                          <Route path="/strategy/projects/assess" element={<ProjectsAssess />} />
                          <Route path="/strategy/projects/results" element={<ProjectsResults />} />
                          <Route path="/strategy/play/assess" element={<PlayAssess />} />
                          <Route path="/strategy/play/results" element={<PlayResults />} />
                          {/* Strategy domain catch-all */}
                          <Route path="/strategy/:domainId" element={<LifeDomainPage />} />
                          {/* Legacy redirects */}
                          <Route path="/tactics" element={<Navigate to="/play" replace />} />
                          <Route path="/arena" element={<Navigate to="/play" replace />} />
                          <Route path="/arena/:domainId/*" element={<ArenaToStrategyRedirect />} />
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
                          {/* Work Hub */}
                          <Route path="/work" element={<WorkLayoutWrapper />} />
                          <Route path="/fm" element={<FMAppShell />}>
                            <Route index element={<FMMarketLayoutWrapper />} />
                            <Route path="home" element={<Navigate to="/fm" replace />} />
                            <Route path="earn" element={<Navigate to="/fm" replace />} />
                            <Route path="market" element={<Navigate to="/fm" replace />} />
                            <Route path="work" element={<Navigate to="/fm" replace />} />
                            <Route path="share" element={<Navigate to="/fm" replace />} />
                            <Route path="contribute" element={<Navigate to="/fm" replace />} />
                            <Route path="wallet" element={<Navigate to="/fm" replace />} />
                            <Route path="cashout" element={<FMCashout />} />
                            <Route path="bridge" element={<FMBridge />} />
                            <Route path="coaches" element={<Navigate to="/coaches" replace />} />
                          </Route>
                          
                          {/* Journeys */}
                          <Route path="/coaching/journey" element={<CoachingJourney />} />
                          <Route path="/coaching/journey/:journeyId" element={<CoachingJourney />} />
                          <Route path="/admin/journey" element={<AdminJourney />} />
                          <Route path="/admin/journey/:journeyId" element={<AdminJourney />} />
                          <Route path="/projects/journey" element={<ProjectsJourney />} />
                          <Route path="/projects/journey/:journeyId" element={<ProjectsJourney />} />
                          {/* Business */}
                          <Route path="/business" element={<BusinessIndexWrapper />} />
                          <Route path="/business/journey" element={<BusinessJourneyWrapper />} />
                          <Route path="/business/journey/:journeyId" element={<BusinessJourneyWrapper />} />
                          <Route path="/business/:businessId" element={<BusinessDashboardWrapper />} />
                          {/* Freelancer */}
                          <Route path="/freelancer" element={<FreelancerLayoutWrapper />} />
                          {/* Creator */}
                          <Route path="/creator" element={<CreatorLayoutWrapper />} />
                          {/* Therapist */}
                          <Route path="/therapist" element={<TherapistLayoutWrapper />} />
                          {/* Legacy hypnosis redirects */}
                          <Route path="/personal-hypnosis/success" element={<Navigate to="/play" replace />} />
                          <Route path="/personal-hypnosis/pending" element={<Navigate to="/play" replace />} />
                          {/* Success */}
                          <Route path="/success" element={<Success />} />
                        </Route>

                        {/* Legacy redirects (no shell needed) → /play */}
                        <Route path="/combat-community" element={<Navigate to="/community" replace />} />
                        <Route path="/dashboard" element={<Navigate to="/play" replace />} />
                        <Route path="/today" element={<Navigate to="/play" replace />} />
                        <Route path="/me" element={<Navigate to="/play" replace />} />
                        <Route path="/messages/ai" element={<Navigate to="/aurora" replace />} />
                        <Route path="/projects" element={<Navigate to="/play" replace />} />
                        <Route path="/life" element={<Navigate to="/play" replace />} />
                        <Route path="/life/*" element={<Navigate to="/play" replace />} />
                        <Route path="/consciousness" element={<Navigate to="/play" replace />} />
                        <Route path="/health" element={<Navigate to="/play" replace />} />
                        <Route path="/health/*" element={<Navigate to="/play" replace />} />
                        <Route path="/relationships" element={<Navigate to="/play" replace />} />
                        <Route path="/relationships/*" element={<Navigate to="/play" replace />} />
                        <Route path="/finances" element={<Navigate to="/play" replace />} />
                        <Route path="/finances/*" element={<Navigate to="/play" replace />} />
                        <Route path="/learning" element={<Navigate to="/play" replace />} />
                        <Route path="/learning/*" element={<Navigate to="/play" replace />} />
                        <Route path="/purpose" element={<Navigate to="/play" replace />} />
                        <Route path="/purpose/*" element={<Navigate to="/play" replace />} />
                        <Route path="/hobbies" element={<Navigate to="/play" replace />} />
                        <Route path="/hobbies/*" element={<Navigate to="/play" replace />} />
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
                        <Route path="/orbs" element={<OrbGalleryPage />} />
                        <Route path="/dev/orb-gallery" element={<OrbGallery />} />
                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                      <PWAInstallBanner />
                      <PWAUpdatePrompt />
                      <NotificationPermissionPrompt />
                      <CookieConsent />
                      <SubscriptionsModal />
                      <WalletModal />
                      
                    </Suspense>
                    </SmartOnboardingProvider>
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