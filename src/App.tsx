import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuroraChatProvider } from "@/contexts/AuroraChatContext";
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
import { PWAInstallBanner } from "@/components/PWAInstallBanner";
import { NotificationPermissionPrompt } from "@/components/NotificationPermissionPrompt";
import CookieConsent from "@/components/CookieConsent";
import { LanguagePrompt } from "@/components/LanguagePrompt";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import RoleRoute from "@/components/RoleRoute";
import BugReportWidget from "@/components/BugReportWidget";
import { PageSkeleton } from "@/components/ui/skeleton";

import { useAuth } from "@/contexts/AuthContext";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const SignUp = lazy(() => import("./pages/SignUp"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
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
const DynamicLandingPage = lazy(() => import("./pages/DynamicLandingPage"));
const Community = lazy(() => import("./pages/Community"));
const CommunityPost = lazy(() => import("./pages/CommunityPost"));
const CommunityEvents = lazy(() => import("./pages/CommunityEvents"));
const CommunityMembers = lazy(() => import("./pages/CommunityMembers"));
const CommunityLeaderboard = lazy(() => import("./pages/CommunityLeaderboard"));
const CommunityProfile = lazy(() => import("./pages/CommunityProfile"));
const Messages = lazy(() => import("./pages/Messages"));
const MessageThread = lazy(() => import("./pages/MessageThread"));
const Aurora = lazy(() => import("./pages/Aurora"));
const HypnosisLibrary = lazy(() => import("./pages/HypnosisLibrary"));

const Launchpad = lazy(() => import("./pages/Launchpad"));
const LaunchpadComplete = lazy(() => import("./pages/LaunchpadComplete"));
const LifePlan = lazy(() => import("./pages/LifePlan"));
const Business = lazy(() => import("./pages/Business"));
const BusinessJourney = lazy(() => import("./pages/BusinessJourney"));
const BusinessDashboard = lazy(() => import("./pages/BusinessDashboard"));
const Consciousness = lazy(() => import("./pages/Consciousness"));
const Health = lazy(() => import("./pages/Health"));
const HealthJourney = lazy(() => import("./pages/HealthJourney"));
const HealthPlan = lazy(() => import("./pages/HealthPlan"));
// New Life OS Pillars
const Relationships = lazy(() => import("./pages/Relationships"));
const RelationshipsJourney = lazy(() => import("./pages/RelationshipsJourney"));
const Finances = lazy(() => import("./pages/Finances"));
const FinancesJourney = lazy(() => import("./pages/FinancesJourney"));
const LearningJourney = lazy(() => import("./pages/LearningJourney"));
const Learning = lazy(() => import("./pages/Learning"));
const Purpose = lazy(() => import("./pages/Purpose"));
const PurposeJourney = lazy(() => import("./pages/PurposeJourney"));
const Hobbies = lazy(() => import("./pages/Hobbies"));
const HobbiesJourney = lazy(() => import("./pages/HobbiesJourney"));
// Free guest journey
const FreeTransformationJourney = lazy(() => import("./pages/FreeTransformationJourney"));
const GuestLaunchpad = lazy(() => import("./pages/GuestLaunchpad"));
const FreeJourneyComplete = lazy(() => import("./pages/FreeJourneyComplete"));
// Practitioner pages
const Practitioners = lazy(() => import("./pages/Practitioners"));
const PractitionerProfile = lazy(() => import("./pages/PractitionerProfile"));
// Panels
const AdminPanel = lazy(() => import("./components/panel/AdminPanel"));
const CoachPanel = lazy(() => import("./components/panel/CoachPanel"));
const AffiliatePanel = lazy(() => import("./components/panel/AffiliatePanel"));
// Storefront
const StorefrontLayout = lazy(() => import("./pages/storefront/StorefrontLayout"));
const StorefrontHome = lazy(() => import("./pages/storefront/StorefrontHome"));
const StorefrontLogin = lazy(() => import("./pages/storefront/StorefrontLogin"));
const StorefrontSignup = lazy(() => import("./pages/storefront/StorefrontSignup"));
const StorefrontCourses = lazy(() => import("./pages/storefront/StorefrontCourses"));
const StorefrontClientDashboard = lazy(() => import("./pages/storefront/StorefrontClientDashboard"));
const PanelDashboard = lazy(() => import("./components/panel/PanelDashboard"));
const CoachDashboard = lazy(() => import("./pages/panel/CoachDashboard"));
const AffiliateDashboardPanel = lazy(() => import("./pages/panel/AffiliateDashboard"));
const CoachTheme = lazy(() => import("./pages/panel/CoachTheme"));
const RolesManager = lazy(() => import("./pages/panel/RolesManager"));
const MyClients = lazy(() => import("./pages/panel/MyClients"));
const MyServices = lazy(() => import("./pages/panel/MyServices"));
const MyCalendar = lazy(() => import("./pages/panel/MyCalendar"));
const MyEarnings = lazy(() => import("./pages/panel/MyEarnings"));
const MyLinks = lazy(() => import("./pages/panel/MyLinks"));
const MyReferrals = lazy(() => import("./pages/panel/MyReferrals"));
const MyPayouts = lazy(() => import("./pages/panel/MyPayouts"));
const MyProducts = lazy(() => import("./pages/panel/MyProducts"));
const CoachContent = lazy(() => import("./pages/panel/CoachContent"));
const StorefrontSettingsPanel = lazy(() => import("./pages/panel/StorefrontSettings"));
const CoachReviews = lazy(() => import("./pages/panel/CoachReviews"));
const CoachAnalytics = lazy(() => import("./pages/panel/CoachAnalytics"));
const UserProfile = lazy(() => import("./pages/panel/UserProfile"));
const UserDashboardView = lazy(() => import("./pages/panel/UserDashboardView"));
const ClientProfile = lazy(() => import("./pages/panel/ClientProfile"));
// Admin pages
const Analytics = lazy(() => import("./pages/admin/Analytics"));
const NotificationCenter = lazy(() => import("./pages/admin/NotificationCenter"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const FAQs = lazy(() => import("./pages/admin/FAQs"));
const AdminOffers = lazy(() => import("./pages/admin/Offers"));
const Testimonials = lazy(() => import("./pages/admin/Testimonials"));
const Purchases = lazy(() => import("./pages/admin/Purchases"));
const Users = lazy(() => import("./pages/admin/Users"));
const Leads = lazy(() => import("./pages/admin/Leads"));
const Content = lazy(() => import("./pages/admin/Content"));
const MenuManagement = lazy(() => import("./pages/admin/Menu"));
const Recordings = lazy(() => import("./pages/admin/Recordings"));
const Forms = lazy(() => import("./pages/admin/Forms"));
const Newsletter = lazy(() => import("./pages/admin/Newsletter"));
const HomepageSections = lazy(() => import("./pages/admin/HomepageSections"));
const ChatAssistant = lazy(() => import("./pages/admin/ChatAssistant"));
const Videos = lazy(() => import("./pages/admin/Videos"));
const AdminProducts = lazy(() => import("./pages/admin/Products"));
const AdminAffiliates = lazy(() => import("./pages/admin/Affiliates"));
const AdminTheme = lazy(() => import("./pages/admin/Theme"));
const LandingPages = lazy(() => import("./pages/admin/LandingPages"));
const LandingPageBuilder = lazy(() => import("./pages/admin/LandingPageBuilder"));
const AuroraInsights = lazy(() => import("./pages/admin/AuroraInsights"));
const BugReports = lazy(() => import("./pages/admin/BugReports"));
const Businesses = lazy(() => import("./pages/admin/Businesses"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Background effect wrapper component
const BackgroundEffect = () => {
  const { theme } = useThemeSettings();
  
  switch (theme.background_effect) {
    case 'matrix_rain':
      return <MatrixRain />;
    case 'consciousness_field':
      return <ConsciousnessField />;
    default:
      return null;
  }
};


const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BackgroundEffect />
        <div className="relative z-10">
          <AuthProvider>
            <AuroraChatProvider>
            <GameStateProvider>
              <LanguageProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                <LanguagePrompt />
                <BrowserRouter>
                  <AffiliateTracker />
                  <AnalyticsProvider>
                    <Suspense fallback={<PageSkeleton />}>
                      <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<Index />} />
                        <Route path="/signup" element={<SignUp />} />
                        <Route path="/login" element={<Login />} />
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
                        {/* Free Transformation Journey (public guest flow) */}
                        <Route path="/free-journey" element={<FreeTransformationJourney />} />
                        <Route path="/free-journey/start" element={<GuestLaunchpad />} />
                        <Route path="/free-journey/complete" element={<FreeJourneyComplete />} />
                        {/* Practitioner directory (public) */}
                        <Route path="/practitioners" element={<Practitioners />} />
                        <Route path="/practitioner/:slug" element={<PractitionerProfile />} />
                        <Route path="/practitioners/:slug" element={<PractitionerProfile />} />
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

                        {/* Aurora route (protected) */}
                        <Route
                          path="/aurora"
                          element={
                            <ProtectedRoute>
                              <Aurora />
                            </ProtectedRoute>
                          }
                        />

                        {/* Hypnosis routes (protected) */}
                        <Route
                          path="/hypnosis"
                          element={
                            <ProtectedRoute>
                              <HypnosisLibrary />
                            </ProtectedRoute>
                          }
                        />

                        {/* Dynamic Landing Pages */}
                        <Route path="/lp/:slug" element={<DynamicLandingPage />} />
                        
                        {/* Practitioner Storefront Routes */}
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
                        {/* User Dashboard */}
                        <Route
                          path="/dashboard"
                          element={
                            <ProtectedRoute>
                              <UserDashboard />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/launchpad"
                          element={
                            <ProtectedRoute>
                              <Launchpad />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/launchpad/complete"
                          element={
                            <ProtectedRoute>
                              <LaunchpadComplete />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/life-plan"
                          element={
                            <ProtectedRoute>
                              <LifePlan />
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
                        <Route
                          path="/consciousness"
                          element={
                            <ProtectedRoute>
                              <Consciousness />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/health"
                          element={
                            <ProtectedRoute>
                              <Health />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/health/journey"
                          element={
                            <ProtectedRoute>
                              <HealthJourney />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/health/journey/:journeyId"
                          element={
                            <ProtectedRoute>
                              <HealthJourney />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/health/plan"
                          element={
                            <ProtectedRoute>
                              <HealthPlan />
                            </ProtectedRoute>
                          }
                        />
                        {/* Relationships Hub */}
                        <Route
                          path="/relationships"
                          element={
                            <ProtectedRoute>
                              <Relationships />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/relationships/journey"
                          element={
                            <ProtectedRoute>
                              <RelationshipsJourney />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/relationships/journey/:journeyId"
                          element={
                            <ProtectedRoute>
                              <RelationshipsJourney />
                            </ProtectedRoute>
                          }
                        />
                        {/* Finances Hub */}
                        <Route
                          path="/finances"
                          element={
                            <ProtectedRoute>
                              <Finances />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/finances/journey"
                          element={
                            <ProtectedRoute>
                              <FinancesJourney />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/finances/journey/:journeyId"
                          element={
                            <ProtectedRoute>
                              <FinancesJourney />
                            </ProtectedRoute>
                          }
                        />
                        {/* Learning Hub */}
                        <Route
                          path="/learning"
                          element={
                            <ProtectedRoute>
                              <Learning />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/learning/journey"
                          element={
                            <ProtectedRoute>
                              <LearningJourney />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/learning/journey/:journeyId"
                          element={
                            <ProtectedRoute>
                              <LearningJourney />
                            </ProtectedRoute>
                          }
                        />
                        {/* Purpose Hub */}
                        <Route
                          path="/purpose"
                          element={
                            <ProtectedRoute>
                              <Purpose />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/purpose/journey"
                          element={
                            <ProtectedRoute>
                              <PurposeJourney />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/purpose/journey/:journeyId"
                          element={
                            <ProtectedRoute>
                              <PurposeJourney />
                            </ProtectedRoute>
                          }
                        />
                        {/* Hobbies Hub */}
                        <Route
                          path="/hobbies"
                          element={
                            <ProtectedRoute>
                              <Hobbies />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/hobbies/journey"
                          element={
                            <ProtectedRoute>
                              <HobbiesJourney />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/hobbies/journey/:journeyId"
                          element={
                            <ProtectedRoute>
                              <HobbiesJourney />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/success"
                          element={
                            <ProtectedRoute>
                              <Success />
                            </ProtectedRoute>
                          }
                        />

                        {/* Admin routes redirect to /panel */}
                        <Route path="/admin" element={<Navigate to="/panel" replace />} />
                        <Route path="/admin/*" element={<Navigate to="/panel" replace />} />

                        {/* Admin Panel routes */}
                        <Route
                          path="/panel"
                          element={
                            <RoleRoute allowedRoles={['admin']}>
                              <AdminPanel />
                            </RoleRoute>
                          }
                        >
                          <Route index element={<PanelDashboard />} />
                          <Route path="analytics" element={<Analytics />} />
                          <Route path="notifications" element={<NotificationCenter />} />
                          <Route path="roles" element={<RolesManager />} />
                          <Route path="users" element={<Users />} />
                          <Route path="users/:userId" element={<UserProfile />} />
                          <Route path="users/:userId/dashboard" element={<UserDashboardView />} />
                          <Route path="practitioners" element={<Users />} />
                          <Route path="leads" element={<Leads />} />
                          <Route path="businesses" element={<Businesses />} />
                          <Route path="aurora-insights" element={<AuroraInsights />} />
                          <Route path="affiliates" element={<AdminAffiliates />} />
                          <Route path="newsletter" element={<Newsletter />} />
                          <Route path="offers" element={<AdminOffers />} />
                          <Route path="purchases" element={<Purchases />} />
                          <Route path="products" element={<AdminProducts />} />
                          <Route path="content" element={<Content />} />
                          <Route path="videos" element={<Videos />} />
                          <Route path="recordings" element={<Recordings />} />
                          <Route path="forms" element={<Forms />} />
                          <Route path="landing-pages" element={<LandingPages />} />
                          <Route path="landing-pages/new" element={<LandingPageBuilder />} />
                          <Route path="landing-pages/edit/:id" element={<LandingPageBuilder />} />
                          <Route path="homepage" element={<HomepageSections />} />
                          <Route path="theme" element={<AdminTheme />} />
                          <Route path="faqs" element={<FAQs />} />
                          <Route path="testimonials" element={<Testimonials />} />
                          <Route path="chat-assistant" element={<ChatAssistant />} />
                          <Route path="bug-reports" element={<BugReports />} />
                          <Route path="settings" element={<Settings />} />
                        </Route>

                        {/* Coach Panel routes */}
                        <Route
                          path="/coach"
                          element={
                            <RoleRoute allowedRoles={['practitioner']}>
                              <CoachPanel />
                            </RoleRoute>
                          }
                        >
                          <Route index element={<CoachDashboard />} />
                          <Route path="analytics" element={<CoachAnalytics />} />
                          <Route path="clients" element={<MyClients />} />
                          <Route path="clients/:clientId" element={<ClientProfile />} />
                          <Route path="services" element={<MyServices />} />
                          <Route path="calendar" element={<MyCalendar />} />
                          <Route path="products" element={<MyProducts />} />
                          <Route path="content" element={<CoachContent />} />
                          <Route path="reviews" element={<CoachReviews />} />
                          <Route path="earnings" element={<MyEarnings />} />
                          <Route path="storefront" element={<StorefrontSettingsPanel />} />
                          <Route path="profile" element={<Settings />} />
                          <Route path="theme" element={<CoachTheme />} />
                        </Route>

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

                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                      <PWAInstallBanner />
                      <NotificationPermissionPrompt />
                      <CookieConsent />
                      <BugReportWidget />
                      
                    </Suspense>
                  </AnalyticsProvider>
                </BrowserRouter>
                </TooltipProvider>
              </LanguageProvider>
            </GameStateProvider>
            </AuroraChatProvider>
          </AuthProvider>
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;