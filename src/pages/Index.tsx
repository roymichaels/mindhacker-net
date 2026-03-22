import { useEffect, useRef, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GalleryCanvas } from "@/components/orb/GalleryMorphOrb";
import { useSEO } from "@/hooks/useSEO";
import { getOrganizationSchema, getWebsiteSchema, BrandSettings } from "@/lib/seo";
import { useTranslation } from "@/hooks/useTranslation";
import { useThemeSettings } from "@/hooks/useThemeSettings";
import { useAuth } from "@/contexts/AuthContext";
import { flowAudit } from "@/lib/flowAudit";
import { WelcomeGateProvider } from "@/contexts/WelcomeGateContext";

// Above-fold (eager)
import { GameHeroSection, ProblemSection, ShiftSection } from "@/components/home";

// Below-fold (lazy)
const CityShowcaseSection = lazy(() => import("@/components/home/CityShowcaseSection"));
const OrbCollectionSection = lazy(() => import("@/components/home/OrbCollectionSection"));
const AuroraCoachSection = lazy(() => import("@/components/home/AuroraCoachSection"));
const HypnosisSection = lazy(() => import("@/components/home/HypnosisSection"));
const PlanCinematicSection = lazy(() => import("@/components/home/PlanCinematicSection"));
const TraitShowcaseSection = lazy(() => import("@/components/home/TraitShowcaseSection"));
const GamificationSection = lazy(() => import("@/components/home/GamificationSection"));
const Play2EarnSection = lazy(() => import("@/components/home/Play2EarnSection"));
const FreeMarketSection = lazy(() => import("@/components/home/FreeMarketSection"));
const GuildSection = lazy(() => import("@/components/home/GuildSection"));
const CoachOSSection = lazy(() => import("@/components/home/CoachOSSection"));
const PricingPreviewSection = lazy(() => import("@/components/home/PricingPreviewSection"));
const RoadmapSection = lazy(() => import("@/components/home/RoadmapSection"));
const FinalCTASection = lazy(() => import("@/components/home/FinalCTASection"));
const InlineCTA = lazy(() => import("@/components/home/InlineCTA"));

const Index = () => {
  const { t, isRTL } = useTranslation();
  const { theme } = useThemeSettings();
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!loading && user) {
      flowAudit.redirect('/', '/play', 'Authenticated user on Index — redirecting to play');
      navigate('/play', { replace: true });
    }
  }, [user, loading, navigate]);

  const brandSettings: BrandSettings = {
    brandName: theme.brand_name,
    brandNameEn: theme.brand_name_en,
    founderName: theme.founder_name,
    founderNameEn: theme.founder_name_en,
    founderTitle: theme.founder_title,
    founderTitleEn: theme.founder_title_en,
    siteUrl: theme.site_url || window.location.origin,
    ogImageUrl: theme.og_image_url,
  };

  useSEO({
    title: t('seo.indexTitle'),
    description: t('seo.indexDescription'),
    keywords: t('seo.indexKeywords'),
    url: window.location.origin,
    type: "website",
    siteName: isRTL ? theme.brand_name : theme.brand_name_en,
    structuredData: [
      getOrganizationSchema(brandSettings),
      getWebsiteSchema(brandSettings)
    ],
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div ref={containerRef} className="relative min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
      <GalleryCanvas containerRef={containerRef}>
        <Header />
        <WelcomeGateProvider>
          <main className="relative">
            {/* 1. Hero — Introduction */}
            <GameHeroSection />
            {/* 2. The Problem — Why this exists */}
            <ProblemSection />
            {/* Below-fold: lazy-loaded for faster initial paint */}
            <Suspense fallback={<div className="min-h-[200px]" />}>
              <CityShowcaseSection />
              <InlineCTA variant="default" />
              <OrbCollectionSection />
              <AuroraCoachSection />
              <InlineCTA variant="subtle" />
              <HypnosisSection />
              <PlanCinematicSection />
              <InlineCTA variant="bold" />
              <TraitShowcaseSection />
              <GamificationSection />
              <InlineCTA variant="subtle" />
              <Play2EarnSection />
              <FreeMarketSection />
              <GuildSection />
              <InlineCTA variant="default" />
              <CoachOSSection />
              <PricingPreviewSection />
              <RoadmapSection />
              <FinalCTASection />
            </Suspense>
          </main>
        </WelcomeGateProvider>
        <Footer />
      </GalleryCanvas>
    </div>
  );
};

export default Index;
