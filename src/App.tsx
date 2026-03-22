import { Toaster } from "@/components/ui/toaster";
import { renderRedirectRoutes, renderProtectedRedirectRoutes } from "@/routes/redirects";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SmartOnboardingProvider } from "@/contexts/SmartOnboardingContext";
import { CoachesModalProvider } from "@/contexts/CoachesModalContext";
import { AuroraChatProvider } from "@/contexts/AuroraChatContext";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import { ProfileModalProvider } from "@/contexts/ProfileModalContext";
import { SubscriptionsModalProvider } from "@/contexts/SubscriptionsModalContext";
import { WalletModalProvider } from "@/contexts/WalletModalContext";
import { SoulAvatarProvider } from "@/contexts/SoulAvatarContext";
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
import Web3AuthProviderWrapper from "@/providers/Web3AuthProviderWrapper";

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
const FoundingLanding = lazy(() => import("./pages/FoundingLanding"));
const FeatureDetailPage = lazy(() => import("./pages/FeatureDetailPage"));
const Messages = lazy(() => import("./pages/Messages"));
const MessageThread = lazy(() => import("./pages/MessageThread"));
const AuroraPage = lazy(() => import("./pages/AuroraPage"));

const LaunchpadComplete = lazy(() => import("./pages/LaunchpadComplete"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const OnboardingCeremony = lazy(() => import("./pages/OnboardingCeremony"));
import { BusinessIndexWrapper, BusinessDashboardWrapper, BusinessJourneyWrapper } from './components/careers/business/BusinessLayoutWrapper';
const FMAppShell = lazy(() => import("./components/fm/FMAppShell"));
import FMMarketLayoutWrapper from "./components/fm/FMMarketLayoutWrapper";
const FMCashout = lazy(() => import("./pages/fm/FMCashout"));
const FMBridge = lazy(() => import("./pages/fm/FMBridge"));
const Freelancer = lazy(() => import("./pages/Freelancer"));
const Creator = lazy(() => import("./pages/Creator"));
import FreelancerLayoutWrapper from "./components/careers/freelancer/FreelancerLayoutWrapper";
import CreatorLayoutWrapper from "./components/careers/creator/CreatorLayoutWrapper";
import TherapistLayoutWrapper from "./components/careers/therapist/TherapistLayoutWrapper";
const LifeHub = lazy(() => import("./pages/LifeHub"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const SoulAvatarMintWizardGlobal = lazy(() => import("./components/web3/SoulAvatarMintWizardGlobal"));
const LifeLayoutWrapper = lazy(() => import("./components/pillars/LifeLayoutWrapper"));
const PlayLayoutWrapper = lazy(() => import("./components/plan/PlayLayoutWrapper"));
const LifeDomainPage = lazy(() => import("./pages/LifeDomainPage"));

const PresenceHome = lazy(() => import("./pages/pillars/PresenceHome"));
const PresenceScan = lazy(() => import("./pages/pillars/PresenceScan"));
const PresenceAnalyzing = lazy(() => import("./pages/pillars/PresenceAnalyzing"));
const PresenceResultsPage = lazy(() => import("./pages/pillars/PresenceResultsPage"));
const PresenceHistory = lazy(() => import("./pages/pillars/PresenceHistory"));
const PowerHome = lazy(() => import("./pages/pillars/PowerHome"));
const PowerAssess = lazy(() => import("./pages/pillars/PowerAssess"));
const PowerResultsPage = lazy(() => import("./pages/pillars/PowerResultsPage"));
const PowerHistory = lazy(() => import("./pages/pillars/PowerHistory"));
const VitalityHome = lazy(() => import("./pages/pillars/VitalityHome"));
const VitalityIntake = lazy(() => import("./pages/pillars/VitalityIntake"));
const VitalityResults = lazy(() => import("./pages/pillars/VitalityResults"));
const VitalityHistory = lazy(() => import("./pages/pillars/VitalityHistory"));
const FocusHome = lazy(() => import("./pages/pillars/FocusHome"));
const FocusAssess = lazy(() => import("./pages/pillars/FocusAssess"));
const FocusResults = lazy(() => import("./pages/pillars/FocusResults"));
const FocusHistory = lazy(() => import("./pages/pillars/FocusHistory"));
const CombatHome = lazy(() => import("./pages/pillars/CombatHome"));
const CombatAssess = lazy(() => import("./pages/pillars/CombatAssess"));
const CombatResults = lazy(() => import("./pages/pillars/CombatResults"));
const CombatHistory = lazy(() => import("./pages/pillars/CombatHistory"));
const ExpansionHome = lazy(() => import("./pages/pillars/ExpansionHome"));
const ExpansionAssess = lazy(() => import("./pages/pillars/ExpansionAssess"));
const ExpansionResults = lazy(() => import("./pages/pillars/ExpansionResults"));
const ExpansionHistory = lazy(() => import("./pages/pillars/ExpansionHistory"));
const ConsciousnessHome = lazy(() => import("./pages/pillars/ConsciousnessHome"));
const ConsciousnessAssess = lazy(() => import("./pages/pillars/ConsciousnessAssess"));
const ConsciousnessResults = lazy(() => import("./pages/pillars/ConsciousnessResults"));
const ConsciousnessHistory = lazy(() => import("./pages/pillars/ConsciousnessHistory"));
const WealthAssess = lazy(() => import("./pages/pillars/WealthAssess"));
const WealthResults = lazy(() => import("./pages/pillars/WealthResults"));
const InfluenceAssess = lazy(() => import("./pages/pillars/InfluenceAssess"));
const InfluenceResults = lazy(() => import("./pages/pillars/InfluenceResults"));
const RelationshipsAssess = lazy(() => import("./pages/pillars/RelationshipsAssess"));
const RelationshipsResults = lazy(() => import("./pages/pillars/RelationshipsResults"));
const BusinessAssess = lazy(() => import("./pages/pillars/BusinessAssess"));
const BusinessResults = lazy(() => import("./pages/pillars/BusinessResults"));
const ProjectsAssess = lazy(() => import("./pages/pillars/ProjectsAssess"));
const ProjectsResults = lazy(() => import("./pages/pillars/ProjectsResults"));
const PlayAssess = lazy(() => import("./pages/pillars/PlayAssess"));
const PlayResults = lazy(() => import("./pages/pillars/PlayResults"));
const PresenceChatAssess = lazy(() => import("./pages/pillars/PresenceChatAssess"));
const PresenceChatResults = lazy(() => import("./pages/pillars/PresenceChatResults"));
const PowerChatAssess = lazy(() => import("./pages/pillars/PowerChatAssess"));
const PowerChatResults = lazy(() => import("./pages/pillars/PowerChatResults"));
const VitalityChatAssess = lazy(() => import("./pages/pillars/VitalityChatAssess"));
const VitalityChatResults = lazy(() => import("./pages/pillars/VitalityChatResults"));
const FocusChatAssess = lazy(() => import("./pages/pillars/FocusChatAssess"));
const FocusChatResults = lazy(() => import("./pages/pillars/FocusChatResults"));
const CombatChatAssess = lazy(() => import("./pages/pillars/CombatChatAssess"));
const CombatChatResults = lazy(() => import("./pages/pillars/CombatChatResults"));
const ExpansionChatAssess = lazy(() => import("./pages/pillars/ExpansionChatAssess"));
const ExpansionChatResults = lazy(() => import("./pages/pillars/ExpansionChatResults"));
const Projects = lazy(() => import("./pages/Projects"));
const Coaches = lazy(() => import("./pages/Coaches"));
const CoachingJourney = lazy(() => import("./pages/CoachingJourney"));
const AdminJourney = lazy(() => import("./pages/AdminJourney"));
const ProjectsJourney = lazy(() => import("./pages/ProjectsJourney"));
const CoachProfile = lazy(() => import("./pages/PractitionerProfile"));
const CoachSlugRedirect = lazy(() => import("./components/careers/coach/CoachSlugRedirect"));
const AdminLayoutWrapper = lazy(() => import("./components/admin/AdminLayoutWrapper"));
const ProjectsLayoutWrapper = lazy(() => import("./components/projects/ProjectsLayoutWrapper"));
const ArenaLayoutWrapper = lazy(() => import("./components/pillars/ArenaLayoutWrapper"));
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
const CoachesLayoutWrapper = lazy(() => import('./components/careers/coach/CoachesLayoutWrapper'));

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
          <BrowserRouter>
          <Web3AuthProviderWrapper>
            <AuthProvider>
              <AuroraChatProvider>
               <LanguageProvider>
               <AuthModalProvider>
                <GameStateProvider>
                <SubscriptionsModalProvider>
                 <CoachesModalProvider>
                 <WalletModalProvider>
                 <SoulAvatarProvider>
                 <ProfileModalProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                
                   <FlowAuditProvider>
                   <AffiliateTracker />
                   <UTMTrackerMount />
                    <AnalyticsProvider>
                    <SmartOnboardingProvider>
                    <Suspense fallback={<PageSkeleton />}>
                      <Routes>
...
                      <PWAInstallBanner />
                      <PWAUpdatePrompt />
                      <NotificationPermissionPrompt />
                      <CookieConsent />
                      <SubscriptionsModal />
                      <WalletModal />
                      <Suspense fallback={null}><ProfilePage /></Suspense>
                      <SoulAvatarMintWizardGlobal />
                      
                    </Suspense>
                    </SmartOnboardingProvider>
                  </AnalyticsProvider>
                   </FlowAuditProvider>
                </TooltipProvider>
                </ProfileModalProvider>
                </SoulAvatarProvider>
                </WalletModalProvider>
                </CoachesModalProvider>
                </SubscriptionsModalProvider>
              </GameStateProvider>
             </AuthModalProvider>
               </LanguageProvider>
            </AuroraChatProvider>
          </AuthProvider>
          </Web3AuthProviderWrapper>
          </BrowserRouter>
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;