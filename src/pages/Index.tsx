import { lazy, Suspense } from "react";
import Header from "@/components/Header";
import MatrixRain from "@/components/MatrixRain";
import HeroSection from "@/components/HeroSection";
import { useSEO } from "@/hooks/useSEO";
import { getOrganizationSchema, getWebsiteSchema } from "@/lib/seo";
import { useTranslation } from "@/hooks/useTranslation";

// Lazy load below-the-fold components
const ConsciousnessLeapPromo = lazy(() => import("@/components/ConsciousnessLeapPromo"));
const PersonalVideoPromo = lazy(() => import("@/components/PersonalVideoPromo"));
const AboutSection = lazy(() => import("@/components/AboutSection"));
const TestimonialsSection = lazy(() => import("@/components/TestimonialsSection"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const Footer = lazy(() => import("@/components/Footer"));
const WhatsAppButton = lazy(() => import("@/components/WhatsAppButton"));

const Index = () => {
  const { t } = useTranslation();

  useSEO({
    title: t('seo.indexTitle'),
    description: t('seo.indexDescription'),
    keywords: t('seo.indexKeywords'),
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
          <ConsciousnessLeapPromo />
          <PersonalVideoPromo />
          <AboutSection />
          <TestimonialsSection />
          <FAQSection />
          <Footer />
        </Suspense>
      </main>

      {/* Floating Elements */}
      <Suspense fallback={null}>
        <WhatsAppButton />
      </Suspense>
    </div>
  );
};

export default Index;
