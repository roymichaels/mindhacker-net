import { lazy, Suspense } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import { useSEO } from "@/hooks/useSEO";
import { getOrganizationSchema, getWebsiteSchema } from "@/lib/seo";
import { useTranslation } from "@/hooks/useTranslation";
// Note: AffiliateTracker is rendered globally in App.tsx

// Lazy load below-the-fold components - ordered by journey progression
const IntrospectionPromo = lazy(() => import("@/components/IntrospectionPromo"));
const PersonalVideoPromo = lazy(() => import("@/components/PersonalVideoPromo"));
const ConsciousnessLeapPromo = lazy(() => import("@/components/ConsciousnessLeapPromo"));
const AboutSection = lazy(() => import("@/components/AboutSection"));
const TestimonialsSection = lazy(() => import("@/components/TestimonialsSection"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const Footer = lazy(() => import("@/components/Footer"));

const Index = () => {
  const { t } = useTranslation();
  
  // Affiliate tracking is handled globally by AffiliateTracker component

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
      {/* Header */}
      <Header />
      
      {/* Main content - Journey order: Free → Recording → Process */}
      <main className="relative z-10">
        <HeroSection />
        <Suspense fallback={null}>
          <IntrospectionPromo />
          <PersonalVideoPromo />
          <ConsciousnessLeapPromo />
          <AboutSection />
          <TestimonialsSection />
          <FAQSection />
          <Footer />
        </Suspense>
      </main>

    </div>
  );
};

export default Index;
