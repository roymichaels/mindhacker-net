import { lazy, Suspense } from "react";
import Header from "@/components/Header";
import MatrixRain from "@/components/MatrixRain";
import HeroSection from "@/components/HeroSection";
import { useSEO } from "@/hooks/useSEO";
import { getOrganizationSchema, getWebsiteSchema } from "@/lib/seo";

// Lazy load below-the-fold components to reduce main-thread work
const WhatSection = lazy(() => import("@/components/WhatSection"));
const HowSection = lazy(() => import("@/components/HowSection"));
const FreeDiscoveryCall = lazy(() => import("@/components/FreeDiscoveryCall"));
const BookingSection = lazy(() => import("@/components/BookingSection"));
const AboutSection = lazy(() => import("@/components/AboutSection"));
const TestimonialsSection = lazy(() => import("@/components/TestimonialsSection"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const PersonalInvitation = lazy(() => import("@/components/PersonalInvitation"));
const Footer = lazy(() => import("@/components/Footer"));
const FloatingCTA = lazy(() => import("@/components/FloatingCTA"));
const WhatsAppButton = lazy(() => import("@/components/WhatsAppButton"));
const ChatWidget = lazy(() => import("@/components/ChatWidget"));
const ExitIntentPopup = lazy(() => import("@/components/ExitIntentPopup"));
const PersonalVideoPromo = lazy(() => import("@/components/PersonalVideoPromo"));

const Index = () => {
  // SEO Configuration
  useSEO({
    title: "מיינד-האקר | אימון תודעתי עמוק עם דין אזולאי",
    description: "אימון תודעתי עמוק עם דין אזולאי - תכנות תודעה מתקדם, היפנוזה מודעת, ו-Reframe לשינוי תת-מודע. קבע סשן אונליין היום והתחל את המסע לשינוי אמיתי.",
    keywords: "אימון תודעתי, היפנוזה מודעת, שינוי תת-מודע, תכנות תודעה, דין אזולאי, קורסים דיגיטליים, פיתוח אישי",
    url: window.location.origin,
    type: "website",
    structuredData: [getOrganizationSchema(), getWebsiteSchema()],
  });

  return (
    <div className="relative min-h-screen">
      {/* Matrix rain background effect */}
      <MatrixRain />
      
      {/* Scanline overlay */}
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,240,255,0.01)_50%)] bg-[length:100%_4px] opacity-10" style={{ zIndex: 1 }} />
      
      {/* Header */}
      <Header />
      
      {/* Main content */}
      <main className="relative">
        <HeroSection />
        <Suspense fallback={null}>
          <WhatSection />
          <HowSection />
          <PersonalVideoPromo />
          <FreeDiscoveryCall />
          <BookingSection />
          <AboutSection />
          <TestimonialsSection />
          <FAQSection />
          <PersonalInvitation />
          <Footer />
        </Suspense>
      </main>

      {/* Floating Elements */}
      <Suspense fallback={null}>
        <FloatingCTA />
        <WhatsAppButton />
        <ChatWidget />
        <ExitIntentPopup />
      </Suspense>
    </div>
  );
};

export default Index;
