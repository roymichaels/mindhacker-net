import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import AnalyticsProvider from "@/components/AnalyticsProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import { lazy, Suspense } from "react";
import MatrixRain from "@/components/MatrixRain";
import ConsciousnessField from "@/components/ConsciousnessField";
import ThemeProvider from "@/components/ThemeProvider";
import { useThemeSettings } from "@/hooks/useThemeSettings";
import AffiliateTracker from "@/components/AffiliateTracker";
import WhatsAppButton from "@/components/WhatsAppButton";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";
import { NotificationPermissionPrompt } from "@/components/NotificationPermissionPrompt";
import CookieConsent from "@/components/CookieConsent";
import ChatWidget from "@/components/ChatWidget";
import { LanguagePrompt } from "@/components/LanguagePrompt";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import { PageSkeleton } from "@/components/ui/skeleton";
import LiveActivityFeed from "@/components/LiveActivityFeed";
import ProgressiveEngagement from "@/components/ProgressiveEngagement";
import GlobalBottomNav from "@/components/GlobalBottomNav";
import { useAuth } from "@/contexts/AuthContext";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const SignUp = lazy(() => import("./pages/SignUp"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
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
const AffiliateDashboard = lazy(() => import("./pages/AffiliateDashboard"));
const Community = lazy(() => import("./pages/Community"));
const CommunityPost = lazy(() => import("./pages/CommunityPost"));
const CommunityEvents = lazy(() => import("./pages/CommunityEvents"));
const CommunityMembers = lazy(() => import("./pages/CommunityMembers"));
const CommunityLeaderboard = lazy(() => import("./pages/CommunityLeaderboard"));
const Messages = lazy(() => import("./pages/Messages"));
const MessageThread = lazy(() => import("./pages/MessageThread"));
const HypnosisLibrary = lazy(() => import("./pages/HypnosisLibrary"));
const HypnosisSession = lazy(() => import("./pages/HypnosisSession"));
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

// Widget wrapper that conditionally shows widgets based on auth state
const ConditionalWidgets = () => {
  const { user } = useAuth();
  
  // Hide widgets for authenticated users
  if (user) {
    return <GlobalBottomNav />;
  }
  
  // Show widgets for guests
  return (
    <>
      <ChatWidget />
      <LiveActivityFeed />
      <WhatsAppButton />
      <ProgressiveEngagement />
    </>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BackgroundEffect />
        <div className="relative z-10">
          <AuthProvider>
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
                        <Route
                          path="/affiliate-dashboard"
                          element={
                            <ProtectedRoute>
                              <AffiliateDashboard />
                            </ProtectedRoute>
                          }
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

                        {/* Hypnosis routes (protected) */}
                        <Route
                          path="/hypnosis"
                          element={
                            <ProtectedRoute>
                              <HypnosisLibrary />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/hypnosis/session"
                          element={
                            <ProtectedRoute>
                              <HypnosisSession />
                            </ProtectedRoute>
                          }
                        />

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
                        <Route
                          path="/dashboard"
                          element={
                            <ProtectedRoute>
                              <UserDashboard />
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

                        {/* Admin routes */}
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route
                          path="/admin"
                          element={
                            <AdminRoute>
                              <AdminDashboard />
                            </AdminRoute>
                          }
                        >
                          <Route index element={<Navigate to="/admin/analytics" replace />} />
                          <Route path="analytics" element={<Analytics />} />
                          <Route path="notifications" element={<NotificationCenter />} />
                          <Route path="settings" element={<Settings />} />
                          <Route path="faqs" element={<FAQs />} />
                          <Route path="testimonials" element={<Testimonials />} />
                          <Route path="purchases" element={<Purchases />} />
                          <Route path="users" element={<Users />} />
                          <Route path="leads" element={<Leads />} />
                          <Route path="content" element={<Content />} />
                          <Route path="menu" element={<MenuManagement />} />
                          <Route path="videos" element={<Videos />} />
                          <Route path="recordings" element={<Recordings />} />
                          <Route path="forms" element={<Forms />} />
                          <Route path="newsletter" element={<Newsletter />} />
                          <Route path="homepage" element={<HomepageSections />} />
                          <Route path="theme" element={<AdminTheme />} />
                          <Route path="chat-assistant" element={<ChatAssistant />} />
                          <Route path="products" element={<AdminProducts />} />
                          <Route path="affiliates" element={<AdminAffiliates />} />
                          <Route path="offers" element={<AdminOffers />} />
                        </Route>

                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                      <PWAInstallBanner />
                      <NotificationPermissionPrompt />
                      <CookieConsent />
                      <ConditionalWidgets />
                    </Suspense>
                  </AnalyticsProvider>
                </BrowserRouter>
              </TooltipProvider>
            </LanguageProvider>
          </AuthProvider>
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;