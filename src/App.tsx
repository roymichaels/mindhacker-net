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
import { Loader2 } from "lucide-react";
import MatrixRain from "@/components/MatrixRain";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";
import { NotificationPermissionPrompt } from "@/components/NotificationPermissionPrompt";
import CookieConsent from "@/components/CookieConsent";
import ChatWidget from "@/components/ChatWidget";
import { LanguagePrompt } from "@/components/LanguagePrompt";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";

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

// Admin pages
const Analytics = lazy(() => import("./pages/admin/Analytics"));
const NotificationCenter = lazy(() => import("./pages/admin/NotificationCenter"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const FAQs = lazy(() => import("./pages/admin/FAQs"));
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <MatrixRain />
      <AuthProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <LanguagePrompt />
            <BrowserRouter>
              <AnalyticsProvider>
                <Suspense fallback={
                  <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                }>
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
                    <Route path="/unsubscribe" element={<Unsubscribe />} />
                    
                    {/* Protected user routes */}
                    <Route path="/personal-hypnosis/success" element={<ProtectedRoute><PersonalHypnosisSuccess /></ProtectedRoute>} />
                    <Route path="/personal-hypnosis/pending" element={<ProtectedRoute><PersonalHypnosisPending /></ProtectedRoute>} />
                    <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
                    <Route path="/success" element={<ProtectedRoute><Success /></ProtectedRoute>} />
                    
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
                      <Route path="chat-assistant" element={<ChatAssistant />} />
                      <Route path="products" element={<AdminProducts />} />
                    </Route>

                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <PWAInstallBanner />
                  <NotificationPermissionPrompt />
                  <CookieConsent />
                  <ChatWidget />
                </Suspense>
              </AnalyticsProvider>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;