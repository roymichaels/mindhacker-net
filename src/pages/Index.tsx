import Header from "@/components/Header";
import MatrixRain from "@/components/MatrixRain";
import HeroSection from "@/components/HeroSection";
import WhatSection from "@/components/WhatSection";
import HowSection from "@/components/HowSection";
import FreeDiscoveryCall from "@/components/FreeDiscoveryCall";
import BookingSection from "@/components/BookingSection";
import AboutSection from "@/components/AboutSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FAQSection from "@/components/FAQSection";
import PersonalInvitation from "@/components/PersonalInvitation";
import Footer from "@/components/Footer";
import FloatingCTA from "@/components/FloatingCTA";
import WhatsAppButton from "@/components/WhatsAppButton";
import ChatWidget from "@/components/ChatWidget";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import { useSEO } from "@/hooks/useSEO";
import { getOrganizationSchema, getWebsiteSchema } from "@/lib/seo";

const Index = () => {
  // SEO Configuration
  useSEO({
    title: "מיינד-האקר | אימון תודעתי עמוק עם Dean Azulay",
    description: "אימון תודעתי עמוק עם Dean Azulay - תכנות תודעה מתקדם, היפנוזה מודעת, ו-Reframe לשינוי תת-מודע. קבע סשן אונליין היום והתחל את המסע לשינוי אמיתי.",
    keywords: "אימון תודעתי, היפנוזה מודעת, שינוי תת-מודע, תכנות תודעה, Dean Azulay, קורסים דיגיטליים, פיתוח אישי",
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
        <WhatSection />
        <HowSection />
        <FreeDiscoveryCall />
        <BookingSection />
        <AboutSection />
        <TestimonialsSection />
        <FAQSection />
        <PersonalInvitation />
        <Footer />
      </main>

      {/* Floating Elements */}
      <FloatingCTA />
      <WhatsAppButton />
      <ChatWidget />
      <ExitIntentPopup />
    </div>
  );
};

export default Index;
